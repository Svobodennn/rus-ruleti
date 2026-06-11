/**
 * Faz 2B ghost cursor — fully animated fake pointer.
 *
 * A single cursor `<div>` (SVG arrow glyph) glides between DOM targets via
 * a requestAnimationFrame tween (FAZ2B_GHOST_CURSOR_RAF_OWNER decree) and
 * plays click ripples at its current position. The runner
 * (faz2b-explorer.ts) awaits each `moveTo()` and fires `click()` /
 * `doubleClick()` / `rightClick()` to telegraph the gesture before calling
 * the matching explorer view method.
 *
 * SHARED RESOURCES OWNED:
 *   - one requestAnimationFrame loop (the active glide tween). Cancelled on
 *     abort + dispose. Declared via FAZ2B_GHOST_CURSOR_RAF_OWNER.
 *   - transient ripple elements (self-removing setTimeout, cancelled on
 *     dispose). Declared via FAZ2B_STORYBOARD_TIMER_OWNER family.
 *
 * Reduced-motion (a11y): `moveTo()` teleports instantly (no tween, resolves
 * next microtask); ripples are suppressed. The runner still calls the same
 * methods — only the visual envelope is gated.
 *
 * Abort: a mid-tween abort resolves the `moveTo()` promise immediately and
 * cancels the RAF. `dispose()` removes the cursor + ripple layer.
 *
 * WHO CALLS THIS: faz2b-explorer.ts `mountGhostCursor(overlay)`.
 */

import {
  FAZ_2B_CURSOR_RIPPLE_MS,
  FAZ_2B_CURSOR_SIZE_PX,
  FAZ_2B_DOUBLE_CLICK_GAP_MS,
  FAZ_2B_Z_GHOST_CURSOR,
  PREFERS_REDUCED_MOTION_QUERY,
} from '../../../../../shared/scene-destruction-constants.js';
import type { GhostCursorHandle } from '../../types.js';

/* ------------------------------------------------------------------------ */
/* Local design tokens                                                      */
/* ------------------------------------------------------------------------ */

/**
 * Cursor must float above the ENTIRE explorer subtree. It is a SIBLING of
 * the explorer root (z 9300) inside the same `.destruction-overlay` host —
 * so it needs a z-index above the panel/menu/dialog yet below the CRT
 * (9999). Prior bug: this was `30`, which placed the cursor BEHIND the
 * panel (9300 > 30). Now 9400 (FAZ_2B_Z_GHOST_CURSOR). Ripple stays one
 * notch below the glyph (`- 1`).
 */
const GHOST_CURSOR_Z_INDEX = FAZ_2B_Z_GHOST_CURSOR;
/** Ripple ring diameter (CSS px). */
const RIPPLE_SIZE_PX = 28;
/** Right-click ripple tint — amber to differentiate from the blue primary. */
const RIPPLE_PRIMARY_COLOR = 'rgba(0, 120, 212, 0.55)';
const RIPPLE_SECONDARY_COLOR = 'rgba(255, 170, 0, 0.55)';

/* ------------------------------------------------------------------------ */
/* Geometry helpers (pure)                                                  */
/* ------------------------------------------------------------------------ */

/** Centre point of an element, relative to the viewport. */
function centreOf(target: HTMLElement): { x: number; y: number } {
  const rect = target.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/** Ease-in-out cubic — smooth accelerate/decelerate for the glide tween. */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* ------------------------------------------------------------------------ */
/* DOM builders                                                             */
/* ------------------------------------------------------------------------ */

/** Build the cursor arrow glyph element. */
function createCursorElement(): HTMLDivElement {
  const el = document.createElement('div');
  el.dataset.role = 'faz2b-ghost-cursor';
  el.setAttribute('aria-hidden', 'true');
  const s = el.style;
  s.position = 'fixed';
  s.top = '0';
  s.left = '0';
  s.width = `${FAZ_2B_CURSOR_SIZE_PX}px`;
  s.height = `${FAZ_2B_CURSOR_SIZE_PX}px`;
  s.zIndex = String(GHOST_CURSOR_Z_INDEX);
  s.pointerEvents = 'none';
  s.willChange = 'transform';
  s.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))';
  el.innerHTML =
    `<svg viewBox="0 0 24 24" width="${FAZ_2B_CURSOR_SIZE_PX}" ` +
    `height="${FAZ_2B_CURSOR_SIZE_PX}" xmlns="http://www.w3.org/2000/svg">` +
    '<path d="M5 3 L5 19 L9 15 L12 21 L14 20 L11 14 L17 14 Z" ' +
    'fill="#FFFFFF" stroke="#1B1B1B" stroke-width="1" stroke-linejoin="round"/>' +
    '</svg>';
  return el;
}

/** Build a single ripple ring element at viewport (x, y). */
function createRipple(x: number, y: number, color: string): HTMLDivElement {
  const ripple = document.createElement('div');
  ripple.dataset.role = 'faz2b-cursor-ripple';
  ripple.setAttribute('aria-hidden', 'true');
  const s = ripple.style;
  s.position = 'fixed';
  s.left = `${x - RIPPLE_SIZE_PX / 2}px`;
  s.top = `${y - RIPPLE_SIZE_PX / 2}px`;
  s.width = `${RIPPLE_SIZE_PX}px`;
  s.height = `${RIPPLE_SIZE_PX}px`;
  s.borderRadius = '50%';
  s.border = `2px solid ${color}`;
  s.zIndex = String(GHOST_CURSOR_Z_INDEX - 1);
  s.pointerEvents = 'none';
  s.opacity = '1';
  s.transform = 'scale(0.4)';
  s.transition = `transform ${FAZ_2B_CURSOR_RIPPLE_MS}ms ease-out, opacity ${FAZ_2B_CURSOR_RIPPLE_MS}ms ease-out`;
  return ripple;
}

/* ------------------------------------------------------------------------ */
/* Mount entry point                                                        */
/* ------------------------------------------------------------------------ */

/** Internal mutable cursor position (viewport coords). */
interface CursorState {
  x: number;
  y: number;
  rafId: number | null;
  disposed: boolean;
  readonly ripples: Set<HTMLDivElement>;
}

/** Glide the cursor across a single tween frame loop. Resolves on arrival/abort. */
function runGlide(
  cursor: HTMLDivElement,
  state: CursorState,
  to: { x: number; y: number },
  durationMs: number,
  signal: AbortSignal,
): Promise<void> {
  return new Promise<void>((resolve): void => {
    const fromX = state.x;
    const fromY = state.y;
    const startTs = performance.now();
    const tick = (now: number): void => {
      if (state.disposed || signal.aborted) {
        state.rafId = null;
        resolve();
        return;
      }
      const progress = Math.min(1, (now - startTs) / Math.max(1, durationMs));
      const eased = easeInOutCubic(progress);
      state.x = fromX + (to.x - fromX) * eased;
      state.y = fromY + (to.y - fromY) * eased;
      cursor.style.transform = `translate(${state.x}px, ${state.y}px)`;
      if (progress >= 1) {
        state.rafId = null;
        resolve();
        return;
      }
      state.rafId = window.requestAnimationFrame(tick);
    };
    state.rafId = window.requestAnimationFrame(tick);
  });
}

/** Teleport the cursor instantly (reduced-motion / abort path). */
function teleport(
  cursor: HTMLDivElement,
  state: CursorState,
  to: { x: number; y: number },
): void {
  state.x = to.x;
  state.y = to.y;
  cursor.style.transform = `translate(${to.x}px, ${to.y}px)`;
}

/** Spawn one self-removing ripple at the cursor's current position. */
function spawnRipple(
  host: HTMLElement,
  state: CursorState,
  color: string,
  reduceMotion: boolean,
): void {
  if (reduceMotion || state.disposed) return;
  const ripple = createRipple(state.x, state.y, color);
  host.appendChild(ripple);
  state.ripples.add(ripple);
  // Force a reflow read so the transition engages from the initial state.
  void ripple.offsetWidth;
  ripple.style.transform = 'scale(1.4)';
  ripple.style.opacity = '0';
  window.setTimeout((): void => {
    if (ripple.parentNode !== null) ripple.parentNode.removeChild(ripple);
    state.ripples.delete(ripple);
  }, FAZ_2B_CURSOR_RIPPLE_MS);
}

/** Dispose the cursor + any in-flight ripples + the active glide RAF. */
function disposeCursor(
  cursor: HTMLDivElement,
  state: CursorState,
): void {
  if (state.disposed) return;
  state.disposed = true;
  if (state.rafId !== null) {
    window.cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }
  for (const ripple of state.ripples) {
    if (ripple.parentNode !== null) ripple.parentNode.removeChild(ripple);
  }
  state.ripples.clear();
  if (cursor.parentNode !== null) cursor.parentNode.removeChild(cursor);
}

/**
 * Construct the GhostCursorHandle. Decomposed out of mountGhostCursor() so
 * the public entry point stays under the 50-line cap (mirrors
 * win-progress-dialog.ts buildHandle pattern).
 */
function buildCursorHandle(args: {
  readonly host: HTMLElement;
  readonly cursor: HTMLDivElement;
  readonly state: CursorState;
  readonly reduceMotion: boolean;
  readonly signal: AbortSignal;
}): GhostCursorHandle {
  const { host, cursor, state, reduceMotion, signal } = args;
  return {
    kind: 'faz2b-ghost-cursor',
    element: cursor,
    moveTo: async (target: HTMLElement, durationMs: number): Promise<void> => {
      if (state.disposed || signal.aborted) return;
      const to = centreOf(target);
      if (reduceMotion) {
        teleport(cursor, state, to);
        return;
      }
      await runGlide(cursor, state, to, durationMs, signal);
    },
    click: (): void => spawnRipple(host, state, RIPPLE_PRIMARY_COLOR, reduceMotion),
    doubleClick: (): void => {
      spawnRipple(host, state, RIPPLE_PRIMARY_COLOR, reduceMotion);
      window.setTimeout(
        (): void => spawnRipple(host, state, RIPPLE_PRIMARY_COLOR, reduceMotion),
        reduceMotion ? 0 : FAZ_2B_DOUBLE_CLICK_GAP_MS,
      );
    },
    rightClick: (): void => spawnRipple(host, state, RIPPLE_SECONDARY_COLOR, reduceMotion),
    dispose: (): void => disposeCursor(cursor, state),
  };
}

/**
 * Mount the ghost cursor into the faz2b overlay. Returns a handle whose
 * motion methods the runner awaits; `dispose()` removes the cursor + any
 * in-flight ripples and cancels the active glide RAF.
 */
export function mountGhostCursor(
  host: HTMLElement,
  signal: AbortSignal,
): GhostCursorHandle {
  const reduceMotion = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;
  const cursor = createCursorElement();
  // Start near the top-left of the host so the first glide reads as "entered".
  const startRect = host.getBoundingClientRect();
  const state: CursorState = {
    x: startRect.left + 40,
    y: startRect.top + 40,
    rafId: null,
    disposed: false,
    ripples: new Set<HTMLDivElement>(),
  };
  cursor.style.transform = `translate(${state.x}px, ${state.y}px)`;
  host.appendChild(cursor);
  const handle = buildCursorHandle({ host, cursor, state, reduceMotion, signal });
  if (signal.aborted) {
    handle.dispose();
  } else {
    signal.addEventListener('abort', (): void => handle.dispose(), { once: true });
  }
  return handle;
}
