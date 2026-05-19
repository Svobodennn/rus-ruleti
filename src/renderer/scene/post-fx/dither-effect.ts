/**
 * PS1 bayer-matrix dither post-fx wrapper.
 *
 * Custom pmndrs `Effect` subclass that runs `ps1-dither.glsl` as its fragment
 * pass. Reduces the effective colour depth of the scene to ~DITHER_LEVELS
 * levels per channel using ordered (Bayer-4) dither — see the GLSL file's
 * header comment for the algorithm walkthrough.
 *
 * Why a custom Effect rather than a custom Pass: pmndrs `Effect` lives
 * inside an `EffectPass` and shares fragment-stage state with the other
 * effects in that pass. That's the cheap path — no extra full-screen
 * triangle render. A standalone Pass would force a new render target and
 * defeat the point of composing the post-fx chain together.
 *
 * Quality gate: only wired into the `high` tier. The shader is cheap
 * (16-entry Bayer lookup + one multiply-floor) but the visual cost is
 * "the whole frame visibly quantises" — too loud for the `low`/`medium`
 * tiers, which read better with smooth gradients.
 *
 * Uniforms exposed:
 *   - ditherIntensity   float  — 0..1 blend strength (DITHER_INTENSITY).
 *   - ditherLevels      float  — colour levels per channel (DITHER_LEVELS).
 *
 * pmndrs auto-injects `inputColor`, `uv`, and `resolution` — the dither
 * shader uses `resolution.xy * uv` to recover screen-space pixel coords
 * for the Bayer lookup.
 */

import { BlendFunction, Effect } from 'postprocessing';
import { Uniform } from 'three';
import {
  DITHER_INTENSITY,
  DITHER_LEVELS,
} from '../../../shared/scene-constants';
import ditherFragmentShader from '../shaders/ps1-dither.glsl?raw';

/**
 * PS1 dither effect — extends pmndrs Effect, runs the bayer shader.
 *
 * The base class wraps our fragment body in a `mainImage(inputColor, uv,
 * outputColor)` function — see ps1-dither.glsl which already conforms to
 * that contract. The constructor binds the two uniforms, which the GPU
 * reads on every fragment.
 */
export class Ps1DitherEffect extends Effect {
  /**
   * Construct the dither effect.
   *
   * Catch shader-compile failures and rethrow with a clearer message so
   * pipeline.ts can decide whether to surface a runtime fallback. Without
   * this wrap, a broken `?raw` import would crash deep inside pmndrs with
   * a `gl.compileShader` failure and no provenance.
   */
  constructor() {
    try {
      super('Ps1DitherEffect', ditherFragmentShader, {
        blendFunction: BlendFunction.NORMAL,
        uniforms: new Map<string, Uniform>([
          ['ditherIntensity', new Uniform(DITHER_INTENSITY)],
          ['ditherLevels', new Uniform(DITHER_LEVELS)],
        ]),
      });
    } catch (cause) {
      throw new Error(
        'Ps1DitherEffect: failed to construct — check ps1-dither.glsl',
        { cause },
      );
    }
  }
}

/** Construct the dither effect. Mirrors the other factories' shape. */
export function createDitherEffect(): Ps1DitherEffect {
  return new Ps1DitherEffect();
}
