/**
 * Film-grain post-fx wrapper.
 *
 * Thin factory around pmndrs `NoiseEffect`. Renders a perlin-style noise
 * texture into the scene at MULTIPLY blend, opacity GRAIN_OPACITY. This is
 * the "old film stock" overlay that pairs with the scanline pass; together
 * they sell the cellar as a degraded recording rather than a live render.
 *
 * Quality gate: runs at ALL quality tiers. The shader cost is one
 * texture lookup + one multiply — negligible even on integrated GPUs.
 *
 * Why MULTIPLY rather than the default SCREEN: SCREEN brightens; we want
 * the grain to *darken* shadow areas slightly so the cellar reads as more
 * oppressive. MULTIPLY also leaves the bulb's highlights untouched at the
 * mid-grey level the grain texture sits around.
 */

import { BlendFunction, NoiseEffect } from 'postprocessing';
import { GRAIN_OPACITY } from '../../../shared/scene-constants';

/**
 * Construct the grain effect.
 *
 * `premultiply: false` keeps the noise un-modulated by the scene colour;
 * we want grain visible in shadows as well as highlights. The opacity
 * setter is post-construction (pmndrs doesn't take it in the constructor).
 */
export function createGrainEffect(): NoiseEffect {
  const effect = new NoiseEffect({
    blendFunction: BlendFunction.MULTIPLY,
    premultiply: false,
  });
  effect.blendMode.opacity.value = GRAIN_OPACITY;
  return effect;
}
