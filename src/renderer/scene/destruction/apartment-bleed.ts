/**
 * Apartment Bleed overlay — Phase 1 STUB.
 *
 * Owns the `apartment-bleed-overlay` <div> creation and lifecycle. Phase 2B
 * kraken-faz2-3 fleshes out the implementation:
 *
 *   - Mount overlay element at z-index above the destruction overlay (which
 *     itself sits above the CRT overlay at 9999).
 *   - When `triggerBleed(kind)` fires, swap the overlay's backing image to
 *     the cached lobby Three.js snapshot (data URL captured by
 *     scene/index.ts at scene mount via renderer.domElement.toDataURL()).
 *   - Add `.is-bleeding` class for APARTMENT_BLEED_1_DURATION_MS (kind =
 *     'bleed-1') or APARTMENT_BLEED_2_DURATION_MS (kind = 'bleed-2').
 *   - CSS @keyframes drives the strobe at APARTMENT_BLEED_FLICKER_HZ.
 *
 * If `prefers-reduced-motion: reduce`:
 *   - Strobe replaced with 50% opacity fade over 1s (designer §8 a11y matrix).
 *
 * Called by:
 *   - destruction-director.ts mounts the handle once, then faz2-takeover +
 *     faz3-terminal each call `triggerBleed(kind)` at their timing
 *     milestones (APARTMENT_BLEED_1_TRIGGER_MS / _2_TRIGGER_MS).
 *
 * Phase 2B owner: kraken-faz2-3.
 */

import type { ApartmentBleedHandle } from './types.js';

/**
 * Mount the apartment-bleed-overlay element + return a handle whose
 * `triggerBleed(kind)` fires a single bleed event and `dispose()` removes
 * the element + unsubscribes matchMedia listeners.
 *
 * Phase 2B fills the body. The lobby snapshot is forwarded so the bleed
 * element's backing image is set ONCE at mount (cheap memcpy via setting
 * background-image / <img> src), not on every trigger.
 */
export function mountApartmentBleedOverlay(
  _lobbySnapshotDataUrl: string | undefined,
): ApartmentBleedHandle {
  return {
    triggerBleed: async (_kind): Promise<void> => {
      throw new Error('apartment-bleed: Phase 2B kraken-faz2-3 fills triggerBleed()');
    },
    dispose: (): void => {
      // No-op safe to call on the stub.
    },
  };
}
