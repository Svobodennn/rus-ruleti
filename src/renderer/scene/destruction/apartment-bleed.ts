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
