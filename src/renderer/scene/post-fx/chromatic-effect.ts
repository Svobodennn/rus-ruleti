/**
 * Chromatic aberration post-fx wrapper.
 *
 * Thin factory around pmndrs `ChromaticAberrationEffect`. Shifts the red and
 * blue channels by ±CHROMATIC_OFFSET in opposite UV directions, producing
 * the "cheap lens" fringing visible at the corners of old CRT broadcasts.
 *
 * Quality gate: enabled on `medium` and `high`. The shader cost is two
 * texture samples per pixel — enough to skip on the `low` tier where we
 * conserve fragment budget for the older Intel integrated GPUs (PLAN §3).
 *
 * Tuning: CHROMATIC_OFFSET = 0.0015 is the "barely perceptible but felt"
 * band. The atmosphere-direction.md guidance and the PLAN brief both
 * caution against making this loud — it's a "sub-threshold unease" tool,
 * not a stylistic flourish.
 */

import {
  BlendFunction,
  ChromaticAberrationEffect,
} from 'postprocessing';
import { Vector2 } from 'three';
import { CHROMATIC_OFFSET } from '../../../shared/scene-constants';

/**
 * Construct the chromatic aberration effect.
 *
 * The pmndrs constructor takes a Vector2 `offset`. We use the same scalar
 * on x and y so the aberration is uniform across the frame. `radialModulation`
 * is OFF: we don't want the corners stronger than the centre (that would
 * draw the eye outward; PLAN §2 wants the centre of attention to stay on
 * the table). `modulationOffset` is irrelevant when radialModulation=false
 * but pmndrs requires the field — set to its documented default.
 */
export function createChromaticEffect(): ChromaticAberrationEffect {
  return new ChromaticAberrationEffect({
    blendFunction: BlendFunction.NORMAL,
    offset: new Vector2(CHROMATIC_OFFSET, CHROMATIC_OFFSET),
    radialModulation: false,
    modulationOffset: 0.15,
  });
}
