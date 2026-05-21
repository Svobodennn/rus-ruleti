/**
 * Apartment Bleed overlay — Phase 2B (kraken-faz2-3).
 *
 * Owns the `apartment-bleed-overlay` <div> lifecycle. Director mounts ONCE
 * (passing the lobby snapshot data URL). Faz 2 / Faz 3 each call
 * `triggerBleed(kind)` at their timing milestones (APARTMENT_BLEED_1/2_*).
 *
 *   - Mount overlay at z-index 9500 (above destruction-overlay 9100, below
 *     CRT 9999).
 *   - `triggerBleed(kind)`:
 *       Default — add `.is-bleeding` (kind='bleed-1') / `.is-bleeding-short`
 *       (kind='bleed-2') so the CSS @keyframes strobe at 12Hz runs for
 *       APARTMENT_BLEED_1_DURATION_MS / APARTMENT_BLEED_2_DURATION_MS.
 *       Reduced-motion — CSS @media override replaces the strobe with a
 *       500ms ease fade to 50% opacity (designer §8 a11y matrix row 17/18).
 *   - `dispose()` removes the overlay + unsubscribes any matchMedia listeners.
 *
 * Snapshot fallback: if no lobby data URL is passed (toDataURL threw at
 * scene mount), the bleed still mounts but the overlay is transparent —
 * the strobe is a black flicker rather than the apartment leak. The
 * destruction degrades gracefully rather than crashing.
 */

import {
  APARTMENT_BLEED_1_DURATION_MS,
  APARTMENT_BLEED_2_DURATION_MS,
  APARTMENT_BLEED_4_DURATION_MS,
  APARTMENT_BLEED_4_MASK_BLUR_PX,
  APARTMENT_BLEED_4_OPACITY_MAX,
  APARTMENT_BLEED_4_OPACITY_MIN,
  APARTMENT_BLEED_4_REDUCED_MOTION_OPACITY,
  APARTMENT_BLEED_FLICKER_HZ,
  PREFERS_REDUCED_MOTION_QUERY,
} from '../../../shared/scene-destruction-constants.js';
import type { ApartmentBleedHandle, ApartmentBleedKind } from './types.js';

/* ------------------------------------------------------------------------ */
/* Public                                                                   */
/* ------------------------------------------------------------------------ */

/**
 * Mount the apartment-bleed-overlay element + return a handle whose
 * `triggerBleed(kind)` fires a single bleed event and `dispose()` removes
 * the element.
 *
 * The lobby snapshot is forwarded so the bleed element's backing image is
 * set ONCE at mount (cheap memcpy via setting background-image), not on
 * every trigger.
 */
export function mountApartmentBleedOverlay(
  lobbySnapshotDataUrl: string | undefined,
): ApartmentBleedHandle {
  const overlay = createOverlayElement(lobbySnapshotDataUrl);
  document.body.appendChild(overlay);

  let disposed = false;

  return {
    triggerBleed: async (kind: ApartmentBleedKind): Promise<void> => {
      if (disposed) {
        return;
      }
      await runBleedCycle(overlay, kind);
    },
    dispose: (): void => {
      if (disposed) {
        return;
      }
      disposed = true;
      overlay.remove();
    },
  };
}

/* ------------------------------------------------------------------------ */
/* Internals                                                                */
/* ------------------------------------------------------------------------ */

function createOverlayElement(
  lobbySnapshotDataUrl: string | undefined,
): HTMLDivElement {
  const el = document.createElement('div');
  el.classList.add('apartment-bleed-overlay');
  el.setAttribute('aria-hidden', 'true');
  if (lobbySnapshotDataUrl !== undefined) {
    el.style.backgroundImage = `url("${lobbySnapshotDataUrl}")`;
  }
  return el;
}

/**
 * Add the strobe class for the bleed duration, then remove it. Resolves
 * when the animation finishes (or duration elapses — whichever fires).
 */
function runBleedCycle(
  overlay: HTMLDivElement,
  kind: ApartmentBleedKind,
): Promise<void> {
  const className =
    kind === 'bleed-1' ? 'is-bleeding' : 'is-bleeding-short';
  const durationMs =
    kind === 'bleed-1'
      ? APARTMENT_BLEED_1_DURATION_MS
      : APARTMENT_BLEED_2_DURATION_MS;
  /* Force reflow so the class swap re-fires the @keyframes from frame 0
   * even if a previous bleed left the class behind via interrupt. */
  overlay.classList.remove('is-bleeding', 'is-bleeding-short');
  void overlay.offsetWidth;
  overlay.classList.add(className);
  return new Promise<void>((resolve): void => {
    window.setTimeout((): void => {
      overlay.classList.remove(className);
      resolve();
    }, durationMs);
  });
}

/* ========================================================================== */
/* SPRINT 5 — Bleed #3 + Bleed #4 single-owner schedulers                    */
/*                                                                            */
/* TH-S4-01 closure: each scheduler has a SINGLE caller declared via the     */
/* owner decree (BLEED_3_OWNER, BLEED_4_OWNER) in scene-destruction-         */
/* constants.ts. Phase 3 qa-engineer scans for double-callers — Sprint 4    */
/* BLOCKER (apartment-bleed double-fire from Lane A + Lane B) is prevented  */
/* by the single-owner contract.                                              */
/* ========================================================================== */

/* eslint-disable @typescript-eslint/no-unused-vars -- Sprint 5 Lane A/B fill these stubs. */

/** Shared scheduling options for Sprint 5 bleeds. */
export interface BleedScheduleOptions {
  readonly signal: AbortSignal;
  readonly hostElement: HTMLElement;
}

/**
 * Bleed #4 schedule args — extends BleedScheduleOptions with:
 *   - `variant`: discriminator for the revolver-on-table composite (currently
 *     the only Sprint 5 variant; Sprint 6 may add others).
 *   - `delayMs`: time from `scheduleBleed4()` call until the bleed visually
 *     fires (PLAN §7 line 288 → ~3sn into Faz 7 absolute).
 *   - `lobbySnapshotDataUrl`: optional Faz 0 capture of the lobby scene; the
 *     bleed composites the revolver-on-table overlay atop this image. If
 *     undefined (toDataURL threw at scene mount), the bleed reads as a
 *     black-with-overlay flicker (graceful degradation).
 */
export interface Bleed4ScheduleOptions extends BleedScheduleOptions {
  readonly variant: 'revolver-on-table';
  readonly delayMs: number;
  readonly lobbySnapshotDataUrl: string | undefined;
}

/**
 * Bleed #3 — Faz 4 (file wipe) at ~26sn (5sn into Faz 4). Duration 0.4sn.
 *
 * Owner: faz4-file-wipe.ts (BLEED_3_OWNER decree — single caller).
 *
 * Visual: lobby ampul tek flash söner (single flash, then dark) — softer
 * than the Sprint 4 #1/#2 strobes. Reduced-motion: hold still 0.4sn
 * opacity 0.5 (no flash).
 *
 * SPRINT 5 LANE: A — Lane A implements + wires CSS class (.is-bleeding-flash
 * or similar) + reduced-motion @media gate in destruction.css.
 *
 * TODO Sprint 5 Lane A: implement single-flash visual + matchMedia gate
 * + AbortSignal teardown + APARTMENT_BLEED_3_DURATION_MS constant
 * (designer Phase 2A adds the constant if not pre-declared).
 */
export function scheduleBleed3(
  _opts: BleedScheduleOptions,
): ApartmentBleedHandle {
  // TODO Sprint 5 Lane A: implement single-flash bleed per spec.
  const noop = (): void => undefined;
  return {
    triggerBleed: async (): Promise<void> => undefined,
    dispose: noop,
  };
}

/** Bleed #4 overlay element class — destruction.css owns the styling. */
const BLEED_4_CLASS = 'apartment-bleed-4';
/** Bleed #4 variant modifier class — revolver-on-table designer §6 payoff. */
const BLEED_4_REVOLVER_VARIANT_CLASS = 'apartment-bleed-4--revolver-on-table';
/** Bleed #4 strobe-active modifier — engages the 12Hz @keyframes. */
const BLEED_4_STROBING_CLASS = 'is-strobing';
/** Bleed #4 reduced-motion hold modifier — single static frame, no strobe. */
const BLEED_4_REDUCED_MOTION_CLASS = 'is-reduced-motion';
/** Z-index for the bleed #4 overlay — matches the apartment-bleed-overlay layer. */
const BLEED_4_Z_INDEX = '9500';

/**
 * Bleed #4 — Faz 7 (bootloop) at ~3sn into the phase (PLAN §7 line 288
 * → ~48sn absolute from bang). Duration `APARTMENT_BLEED_4_DURATION_MS`
 * = 800ms — LONGEST of the four bleeds.
 *
 * Owner: faz7-bootloop.ts (BLEED_4_OWNER decree — single caller). The
 * scheduling responsibility is Faz 7's; the bleed VISUAL composites the
 * lobby snapshot with a revolver-on-table overlay variant per designer
 * §6 (narrative payoff: "what was being aimed in earlier scenes is now
 * resting on the desk, visible through the bleed").
 *
 * Visual (designer §14 Faz 7 Bleed #4 — revolver-on-table payoff):
 *   - Base layer: lobbySnapshot data URL (the same Faz 0 capture bleeds
 *     #1/#2/#3 use). The bulb is dark, the masa is visible, the room is
 *     in shadow.
 *   - Overlay class `BLEED_4_REVOLVER_VARIANT_CLASS` — CSS-driven
 *     emphasis on the desk + revolver position (mask blur 2px via
 *     `APARTMENT_BLEED_4_MASK_BLUR_PX`). The composite reads as "lobby
 *     snapshot with a slight halation around the revolver", keeping the
 *     bleed feeling like a leak, not a clean render.
 *   - Strobe: 12Hz opacity pulse between
 *     `APARTMENT_BLEED_4_OPACITY_MIN = 0.4` and
 *     `APARTMENT_BLEED_4_OPACITY_MAX = 0.6` for 800ms (~10 cycles).
 *
 * Reduced-motion (designer §14 + a11y matrix row 37): static opacity hold
 * at `APARTMENT_BLEED_4_REDUCED_MOTION_OPACITY = 0.6` for the full 800ms.
 * The revolver-on-desk composite STAYS visible — bleed #4 is the
 * narrative payoff and must remain legible to motion-sensitive users.
 *
 * Scheduling: setTimeout fires after `opts.delayMs`. The handle's
 * `triggerBleed` is also exposed (idempotent — Lane B's runner schedules
 * via the timer; tests can trigger immediately via the method).
 *
 * AbortSignal teardown:
 *   - If aborted before the timer fires: clearTimeout + overlay never built.
 *   - If aborted during the bleed: clearTimeout(strobeStop) + overlay
 *     removed defensively.
 */
export function scheduleBleed4(
  opts: Bleed4ScheduleOptions,
): ApartmentBleedHandle {
  const state: Bleed4State = {
    disposed: false,
    triggerTimeoutId: null,
    strobeTimeoutId: null,
    overlay: null,
  };
  const teardown = (): void => disposeBleed4(state);
  opts.signal.addEventListener('abort', teardown, { once: true });

  const trigger = async (): Promise<void> => {
    if (state.disposed || opts.signal.aborted) return;
    state.overlay = createBleed4Overlay(opts.lobbySnapshotDataUrl);
    opts.hostElement.appendChild(state.overlay);
    await runBleed4Sequence(state, opts.signal);
  };

  state.triggerTimeoutId = window.setTimeout((): void => {
    state.triggerTimeoutId = null;
    void trigger();
  }, opts.delayMs);

  return {
    triggerBleed: trigger,
    dispose: teardown,
  };
}

/** Bleed #4 mutable runtime state. */
interface Bleed4State {
  disposed: boolean;
  triggerTimeoutId: ReturnType<typeof setTimeout> | null;
  strobeTimeoutId: ReturnType<typeof setTimeout> | null;
  overlay: HTMLDivElement | null;
}

/**
 * Build the bleed #4 overlay element. The base layer carries the lobby
 * snapshot; the variant modifier class adds the revolver-on-table
 * emphasis (mask blur, slight darker mask weighted toward the desk).
 * The strobe class is added later by `runBleed4Sequence` — at build time
 * the element is mounted invisible (opacity 0 via base class).
 */
function createBleed4Overlay(
  lobbySnapshotDataUrl: string | undefined,
): HTMLDivElement {
  const el = document.createElement('div');
  el.classList.add(BLEED_4_CLASS, BLEED_4_REVOLVER_VARIANT_CLASS);
  el.setAttribute('aria-hidden', 'true');
  el.style.zIndex = BLEED_4_Z_INDEX;
  // Inline the SSOT-derived strobe params as CSS custom properties so the
  // stylesheet's @keyframes can reference them via var(--bleed4-opacity-min)
  // / var(--bleed4-opacity-max). Keeping the values in inline-style means
  // the constants are the single source of truth (Sprint 4 rule —
  // scene-destruction-constants.ts owns every number).
  el.style.setProperty(
    '--bleed4-opacity-min',
    APARTMENT_BLEED_4_OPACITY_MIN.toString(),
  );
  el.style.setProperty(
    '--bleed4-opacity-max',
    APARTMENT_BLEED_4_OPACITY_MAX.toString(),
  );
  el.style.setProperty(
    '--bleed4-reduced-motion-opacity',
    APARTMENT_BLEED_4_REDUCED_MOTION_OPACITY.toString(),
  );
  el.style.setProperty(
    '--bleed4-mask-blur',
    `${String(APARTMENT_BLEED_4_MASK_BLUR_PX)}px`,
  );
  el.style.setProperty(
    '--bleed4-strobe-hz',
    String(APARTMENT_BLEED_FLICKER_HZ),
  );
  if (lobbySnapshotDataUrl !== undefined) {
    el.style.backgroundImage = `url("${lobbySnapshotDataUrl}")`;
  }
  return el;
}

/**
 * Run the bleed #4 visible sequence. Adds the strobe class (or the
 * reduced-motion hold class), waits APARTMENT_BLEED_4_DURATION_MS, then
 * removes the overlay. Resolves at end of sequence or signal abort.
 */
function runBleed4Sequence(
  state: Bleed4State,
  signal: AbortSignal,
): Promise<void> {
  if (state.overlay === null) return Promise.resolve();
  const reducedMotion = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;
  const overlay = state.overlay;
  overlay.classList.add(
    reducedMotion ? BLEED_4_REDUCED_MOTION_CLASS : BLEED_4_STROBING_CLASS,
  );
  return new Promise<void>((resolve): void => {
    if (signal.aborted) {
      removeOverlay(state);
      resolve();
      return;
    }
    state.strobeTimeoutId = window.setTimeout((): void => {
      state.strobeTimeoutId = null;
      removeOverlay(state);
      resolve();
    }, APARTMENT_BLEED_4_DURATION_MS);
  });
}

/** Detach and clear the overlay element. Safe to call multiple times. */
function removeOverlay(state: Bleed4State): void {
  if (state.overlay === null) return;
  if (state.overlay.parentNode !== null) {
    state.overlay.parentNode.removeChild(state.overlay);
  }
  state.overlay = null;
}

/** Full dispose: clear all timers, detach overlay. */
function disposeBleed4(state: Bleed4State): void {
  if (state.disposed) return;
  state.disposed = true;
  if (state.triggerTimeoutId !== null) {
    window.clearTimeout(state.triggerTimeoutId);
    state.triggerTimeoutId = null;
  }
  if (state.strobeTimeoutId !== null) {
    window.clearTimeout(state.strobeTimeoutId);
    state.strobeTimeoutId = null;
  }
  removeOverlay(state);
}
