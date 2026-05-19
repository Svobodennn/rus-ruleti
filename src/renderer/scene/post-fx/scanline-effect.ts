/**
 * CRT scanline post-fx wrapper.
 *
 * Thin factory around pmndrs `ScanlineEffect`. The wrapper exists so the
 * pipeline.ts file doesn't sprout pmndrs-API knowledge for every effect —
 * each effect's options live next to its constants reference, and the
 * pipeline only knows the public `createScanlineEffect()` shape.
 *
 * Blending: OVERLAY at SCANLINE_OPACITY. Overlay is the right pmndrs blend
 * for "darken-then-lighten alternating rows" — multiply would crush blacks
 * too aggressively; screen would lift them. Designer's atmosphere-direction.md
 * §6.4 documents the matching DOM scanline overlay alpha; the two layers
 * are tuned together so they don't moiré.
 *
 * Quality gate: this effect runs at ALL quality tiers (low/medium/high).
 * It is the cheapest of the post-fx passes and the most identity-bearing
 * for the "broken signal" lobby aesthetic.
 */

import { BlendFunction, ScanlineEffect } from 'postprocessing';
import {
  SCANLINE_DENSITY,
  SCANLINE_OPACITY,
} from '../../../shared/scene-constants';

/**
 * Construct the scanline effect.
 *
 * Returns a fully-configured `ScanlineEffect` ready to drop into an
 * `EffectPass`. The opacity is set via `blendMode.opacity` post-construction
 * — pmndrs doesn't accept it in the constructor options.
 */
export function createScanlineEffect(): ScanlineEffect {
  const effect = new ScanlineEffect({
    blendFunction: BlendFunction.OVERLAY,
    density: SCANLINE_DENSITY,
  });
  effect.blendMode.opacity.value = SCANLINE_OPACITY;
  return effect;
}
