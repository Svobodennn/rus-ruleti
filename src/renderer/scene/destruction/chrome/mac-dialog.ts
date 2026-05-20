/**
 * macOS Critical Dialog chrome — Sprint 4 Phase 2B (swift-expert / Lane C).
 *
 * Pixel-perfect Apple HIG critical alert built from inline DOM + inline
 * styles, NO bundled Apple-owned asset. Composed surfaces:
 *
 *   - Backdrop: full-viewport <div> with CSS `backdrop-filter: blur(20px)
 *     saturate(180%)` over an `rgba(0,0,0,0.3)` tint. 200ms opacity fade-in.
 *   - Dialog box: 380x200px (DIALOG_MAC_WIDTH_PX × DIALOG_MAC_HEIGHT_PX),
 *     `#F2F2F2` background, 12px rounded corners, drop shadow
 *     `0 20px 60px rgba(0,0,0,0.35)`, inset highlight
 *     `inset 0 1px 0 rgba(255,255,255,0.6)`.
 *   - Apple silhouette: 16x16 designer-fictional eaten-apple inline SVG
 *     path data (top-left). Monochrome `#1D1D1F` — NOT pixel-identical to
 *     the Apple Inc. trademark per PLAN §12 C1 closure.
 *   - Title "Critical Error" 14px bold, body 13px regular, countdown
 *     "Restarting in N..." 13px italic. Font-family system reference
 *     `-apple-system, BlinkMacSystemFont, sans-serif` — NO SF Pro bundle.
 *   - Buttons right-aligned, 12px inset: "Cancel" disabled grey
 *     `#A0A0A0`, "Restart Now" primary `#0066CC` Apple blue.
 *
 * The dialog is COSMETIC — clicks are no-ops (Sprint 4 spec). The
 * destruction sequence advances on the parent setInterval-driven
 * `MacDialogHandle.setCountdown(n)` calls per
 * `destruction-direction.md §3` + Lane C validation §9 item 5.
 *
 * If `prefers-reduced-motion: reduce`:
 *   - Backdrop opacity transition: 0ms (instant snap-in).
 *   - Backdrop-filter transition: 0ms (no animation from 0px → 20px).
 *
 * Mounted-into z-index inside the destruction container: 9150 (above
 * Lane B's takeover surface 9100, below CRT 9999). The dialog OUTLIVES
 * Lane B's takeover only on ESC-hold-abort races; nominally Faz 1 exits
 * before Faz 2 enters.
 *
 * Called by:
 *   - faz1-critical-dialog.ts when os === 'mac':
 *     `const handle = mountMacDialog(container, DIALOG_COUNTDOWN_START);`
 *     `handle.setCountdown(4); ... handle.dispose();`
 */

import type { MacDialogHandle } from '../types';
import {
  DIALOG_MAC_WIDTH_PX,
  DIALOG_MAC_HEIGHT_PX,
  PREFERS_REDUCED_MOTION_QUERY,
} from '../../../../shared/scene-destruction-constants';

/* ------------------------------------------------------------------------ */
/* Palette + typography constants (designer §3 spec values, named here so   */
/* code-reviewer's no-magic-numbers gate stays green).                      */
/* ------------------------------------------------------------------------ */

/** Apple silhouette mono fill — deep neutral grey, NOT Apple brand black. */
const APPLE_GLYPH_FILL = '#1D1D1F';
/** Dialog background — designer §3 light translucent. */
const DIALOG_BG = '#F2F2F2';
/** Apple-family blue for the primary button. */
const BUTTON_PRIMARY_BG = '#0066CC';
/** Disabled secondary button text on the grey field. */
const BUTTON_DISABLED_FG = '#A0A0A0';
/** White text on the primary blue button. */
const BUTTON_PRIMARY_FG = '#FFFFFF';
/** Body / title text colour — near-black for HIG-grade legibility. */
const TEXT_FG = '#1D1D1F';
/** Mac dialog z-index inside destruction container — above Lane B 9100. */
const DIALOG_Z_INDEX = '9150';
/** Modal entry fade-in transition duration (ms). §3 reduced-motion → 0. */
const FADE_IN_DURATION_MS = 200;

/* ------------------------------------------------------------------------ */
/* Apple silhouette SVG — designer-fictional eaten-apple path data.         */
/*                                                                          */
/* viewBox 0 0 32 32. Body: convex outer with one concave bite cut from     */
/* the upper-right at ~60% height (designer §3 spec). Leaf detail at top.   */
/* The path is HAND-AUTHORED for Sprint 4 — recognisable as "apple-family"  */
/* but NOT trademark-identical to Apple Inc.'s glyph. Single <path> with    */
/* evenodd fill rule keeps the bite cut as a literal carve-out of the body. */
/* ------------------------------------------------------------------------ */

const APPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" aria-hidden="true">
  <path fill="${APPLE_GLYPH_FILL}" d="M18.5,5.2 C18.2,3.9 19.1,2.4 20.6,2.6 C20.9,3.9 20,5.4 18.5,5.2 Z"/>
  <path fill="${APPLE_GLYPH_FILL}" fill-rule="evenodd" d="M16.2,8 C12.7,7.8 9.2,9.3 7.4,12.4 C5.4,15.8 5.7,20.4 8.1,23.7 C9.7,25.8 12.4,27.5 15,27.3 C16,27.2 16.9,26.7 17.9,26.7 C18.9,26.7 19.8,27.2 20.8,27.3 C23.4,27.5 25.8,25.6 27.2,23.4 C26.1,22.8 25.1,22 24.4,21 C22.3,18.2 22.9,14.2 25.7,12.4 C24.4,10.5 22.2,9.4 19.9,9.4 C18.6,9.4 17.3,10 16.2,8 Z M22.2,11.2 C22.4,9.7 23.4,8.4 24.9,7.7 C25,9.1 24.4,10.5 23.4,11.4 C22.9,11.8 22.5,11.6 22.2,11.2 Z"/>
</svg>`;

/* ------------------------------------------------------------------------ */
/* DOM builders (each ≤50L per ESLint max-lines-per-function gate).         */
/* ------------------------------------------------------------------------ */

/**
 * Build the full-viewport backdrop element. The blur + saturate filter
 * mimics macOS Vibrancy over the bulb-darkened lobby underneath.
 * Reduced-motion mode disables the fade-in transition entirely.
 */
function buildBackdrop(reducedMotion: boolean): HTMLDivElement {
  const backdrop = document.createElement('div');
  backdrop.className = 'mac-dialog-backdrop';
  const s = backdrop.style;
  s.position = 'fixed';
  s.inset = '0';
  s.zIndex = DIALOG_Z_INDEX;
  s.background = 'rgba(0, 0, 0, 0.3)';
  s.backdropFilter = 'blur(20px) saturate(180%)';
  // Vendor-prefixed mirror for Safari/older WebKit; setProperty bypasses
  // CSSStyleDeclaration typing which lacks `-webkit-backdrop-filter`.
  s.setProperty('-webkit-backdrop-filter', 'blur(20px) saturate(180%)');
  s.display = 'flex';
  s.alignItems = 'center';
  s.justifyContent = 'center';
  s.opacity = '0';
  s.transition = reducedMotion ? 'none' : `opacity ${FADE_IN_DURATION_MS}ms ease-out`;
  s.pointerEvents = 'auto';
  return backdrop;
}

/**
 * Build the dialog box container (the white card centered over the
 * backdrop). Sizing + corner radius + drop shadow per designer §3.
 */
function buildDialogBox(): HTMLDivElement {
  const box = document.createElement('div');
  box.className = 'mac-dialog-box';
  box.setAttribute('role', 'alertdialog');
  box.setAttribute('aria-labelledby', 'mac-dialog-title');
  box.setAttribute('aria-describedby', 'mac-dialog-body');
  const s = box.style;
  s.width = `${DIALOG_MAC_WIDTH_PX}px`;
  s.height = `${DIALOG_MAC_HEIGHT_PX}px`;
  s.background = DIALOG_BG;
  s.borderRadius = '12px';
  s.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.6)';
  s.fontFamily = "-apple-system, BlinkMacSystemFont, sans-serif";
  s.color = TEXT_FG;
  s.padding = '20px 24px 16px 24px';
  s.boxSizing = 'border-box';
  s.display = 'flex';
  s.flexDirection = 'column';
  s.gap = '8px';
  return box;
}

/**
 * Build the title row: Apple silhouette (16x16) + "Critical Error" title.
 * The icon sits left of the title (designer §3 — top-left placement).
 */
function buildTitleRow(): HTMLDivElement {
  const row = document.createElement('div');
  row.className = 'mac-dialog-title-row';
  const s = row.style;
  s.display = 'flex';
  s.alignItems = 'center';
  s.gap = '10px';
  s.marginBottom = '4px';

  const icon = document.createElement('div');
  icon.className = 'mac-dialog-apple';
  icon.style.width = '16px';
  icon.style.height = '16px';
  icon.style.flexShrink = '0';
  icon.innerHTML = APPLE_SVG;

  const title = document.createElement('div');
  title.id = 'mac-dialog-title';
  title.className = 'mac-dialog-title';
  title.textContent = 'Critical Error';
  title.style.fontSize = '14px';
  title.style.fontWeight = '700';
  title.style.lineHeight = '1.2';

  row.append(icon, title);
  return row;
}

/**
 * Build the body paragraph + countdown line. The countdown text node is
 * returned alongside so `setCountdown(n)` can patch its textContent in O(1).
 */
function buildBodyBlock(initialCountdown: number): {
  block: HTMLDivElement;
  countdownNode: HTMLDivElement;
} {
  const block = document.createElement('div');
  block.className = 'mac-dialog-body-block';
  block.style.flex = '1 1 auto';
  block.style.display = 'flex';
  block.style.flexDirection = 'column';
  block.style.gap = '6px';

  const body = document.createElement('div');
  body.id = 'mac-dialog-body';
  body.textContent =
    'macOS encountered a critical system error. An unrecoverable failure occurred in kernel_task.';
  body.style.fontSize = '13px';
  body.style.fontWeight = '400';
  body.style.lineHeight = '1.4';
  body.style.maxWidth = '340px';

  const countdown = document.createElement('div');
  countdown.className = 'mac-dialog-countdown';
  countdown.textContent = `Restarting in ${initialCountdown}…`;
  // Designer §3 line 268: 13px italic (authoritative — overrides Lane C
  // brief's 11px hint, which conflicts with the designer spec).
  countdown.style.fontSize = '13px';
  countdown.style.fontStyle = 'italic';
  countdown.style.opacity = '0.75';
  countdown.style.lineHeight = '1.4';

  block.append(body, countdown);
  return { block, countdownNode: countdown };
}

/**
 * Build a single button. `primary === true` gives the blue+white Apple
 * primary; otherwise the disabled secondary styling. Clicks are no-ops
 * (Sprint 4 cosmetic spec); the disabled secondary additionally has
 * `disabled` attribute set so screen-readers announce it correctly.
 */
function buildButton(label: string, primary: boolean): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = label;
  btn.className = primary ? 'mac-dialog-btn-primary' : 'mac-dialog-btn-secondary';
  const s = btn.style;
  s.height = '28px';
  s.minWidth = '88px';
  s.borderRadius = '6px';
  s.border = primary ? 'none' : '1px solid rgba(0, 0, 0, 0.12)';
  s.background = primary ? BUTTON_PRIMARY_BG : 'transparent';
  s.color = primary ? BUTTON_PRIMARY_FG : BUTTON_DISABLED_FG;
  s.fontFamily = 'inherit';
  s.fontSize = '13px';
  s.fontWeight = primary ? '600' : '400';
  s.padding = '0 14px';
  s.cursor = primary ? 'default' : 'not-allowed';
  if (!primary) {
    btn.disabled = true;
    s.opacity = '0.55';
  }
  return btn;
}

/**
 * Build the right-aligned button row. "Cancel" (disabled) sits left of
 * "Restart Now" (primary) per Apple HIG button order convention.
 */
function buildButtonRow(): HTMLDivElement {
  const row = document.createElement('div');
  row.className = 'mac-dialog-button-row';
  const s = row.style;
  s.display = 'flex';
  s.justifyContent = 'flex-end';
  s.gap = '8px';
  s.marginTop = 'auto';

  const cancel = buildButton('Cancel', false);
  const restart = buildButton('Restart Now', true);
  row.append(cancel, restart);
  return row;
}

/**
 * Compose the full mac dialog: backdrop > dialog box > [title row, body
 * block, button row]. Returns the backdrop root plus the countdown node
 * so the caller can patch the countdown text in O(1) per setInterval tick.
 */
function composeDialog(
  countdownStart: number,
  reducedMotion: boolean,
): {
  backdrop: HTMLDivElement;
  countdownNode: HTMLDivElement;
} {
  const backdrop = buildBackdrop(reducedMotion);
  const box = buildDialogBox();
  const titleRow = buildTitleRow();
  const { block: bodyBlock, countdownNode } = buildBodyBlock(countdownStart);
  const buttonRow = buildButtonRow();
  box.append(titleRow, bodyBlock, buttonRow);
  backdrop.append(box);
  return { backdrop, countdownNode };
}

/* ------------------------------------------------------------------------ */
/* Public mount                                                             */
/* ------------------------------------------------------------------------ */

/**
 * Mount a Mac critical dialog into the destruction container. Returns a
 * handle whose `setCountdown(n)` updates the "Restarting in N..." label
 * (driven by parent destruction-director setInterval at
 * DIALOG_COUNTDOWN_INTERVAL_MS cadence) and `dispose()` removes the
 * backdrop + cleans up any matchMedia listeners.
 *
 * Idempotent: calling `dispose()` twice is safe (subsequent calls no-op).
 */
export function mountMacDialog(
  container: HTMLElement,
  countdownStart: number,
): MacDialogHandle {
  const mql = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY);
  const { backdrop, countdownNode } = composeDialog(countdownStart, mql.matches);
  container.append(backdrop);

  // Trigger the fade-in on the next paint frame (CSS transition needs the
  // browser to commit the initial opacity:0 first; rAF guarantees a frame
  // boundary before flipping to 1).
  requestAnimationFrame((): void => {
    backdrop.style.opacity = '1';
  });

  let disposed = false;
  const handle: MacDialogHandle = {
    setCountdown: (n: number): void => {
      if (disposed) return;
      countdownNode.textContent = `Restarting in ${n}…`;
    },
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      backdrop.remove();
    },
  };
  return handle;
}
