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

/** Bleed #4 carries an extra variant flag for the revolver-on-table payoff. */
export interface Bleed4ScheduleOptions extends BleedScheduleOptions {
  readonly variant: 'revolver-on-table';
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

/**
 * Bleed #4 — Faz 7 (bootloop) at ~48sn (4sn into Faz 7). Duration 0.8sn —
 * LONGEST of the four bleeds.
 *
 * Owner: faz7-bootloop.ts (BLEED_4_OWNER decree — single caller).
 *
 * Visual: revolver namlusu masada görünür (designer §6 narrative payoff
 * — what was being aimed in earlier scenes is now resting on the desk
 * in the lobby, visible through the bleed). Camera framing:
 * lobbySnapshot + overlay variant 'revolver-on-table'.
 *
 * Reduced-motion: 0.8sn opacity 0.6 hold (no strobe).
 *
 * SPRINT 5 LANE: B — Lane B implements the revolver-table-payoff visual
 * + extends the lobbySnapshot composite (camera framing tweak vs the
 * Sprint 4 bleeds which use the default snapshot frame).
 *
 * TODO Sprint 5 Lane B: implement long-bleed + revolver-on-table variant
 * + reduced-motion gate + AbortSignal teardown + APARTMENT_BLEED_4_
 * DURATION_MS constant.
 */
export function scheduleBleed4(
  _opts: Bleed4ScheduleOptions,
): ApartmentBleedHandle {
  // TODO Sprint 5 Lane B: implement long bleed + revolver-on-table variant.
  const noop = (): void => undefined;
  return {
    triggerBleed: async (): Promise<void> => undefined,
    dispose: noop,
  };
}
