/**
 * Post-FX Composer pipeline.
 *
 * Builds the pmndrs EffectComposer, owns the RenderPass + EffectPass(es),
 * and exposes a `rebuild(quality)` entry-point so the quality controller
 * can swap the post-fx chain at runtime when auto-promote/demote fires.
 *
 * Quality tier matrix (matches shaders/README.md):
 *
 *   low     RenderPass → [scanline, grain]
 *   medium  RenderPass → [scanline, grain, chromatic]
 *   high    RenderPass → [scanline, grain, chromatic, dither]
 *
 * Pass ordering rationale:
 *   1. scanline first — it modulates the rendered scene before chromatic
 *      smears the channels, so the scanline pattern stays sharp.
 *   2. grain second — overlays after scanline so the grain doesn't get
 *      doubled by the scanline pattern.
 *   3. chromatic third — channel split happens late so all the prior
 *      effects' artefacts are part of the channel split.
 *   4. dither last — colour quantisation must be the final pass, otherwise
 *      subsequent floating-point passes would lift the quantised levels.
 *
 * Resource lifecycle:
 *   - `rebuild(quality)` is idempotent. It tears down the previous EffectPass
 *     (effect.dispose() per child) and the cached pass list, then constructs
 *     fresh ones. EffectComposer keeps the RenderPass forever — only the
 *     post-fx EffectPass swaps.
 *   - `dispose()` removes all passes and frees the composer's render targets.
 *   - The composer's WebGL render targets are NOT cleared between rebuilds
 *     — pmndrs reuses them. Net allocation cost of a rebuild is one
 *     ShaderMaterial recompile per effect (cheap, single-digit ms on M1).
 */

import {
  EffectComposer,
  EffectPass,
  RenderPass,
  type Effect,
} from 'postprocessing';
import type { Camera, Scene, WebGLRenderer } from 'three';
import {
  COMPOSER_MULTISAMPLING,
  type QualityLevel,
} from '../../../shared/scene-constants';
import { createChromaticEffect } from './chromatic-effect';
import { createDitherEffect } from './dither-effect';
import { createGrainEffect } from './grain-effect';
import { createScanlineEffect } from './scanline-effect';

/** Public handle returned from createPostFxPipeline. */
export interface PostFxHandle {
  /** The composer. scene.ts calls .render(deltaSec) per frame. */
  readonly composer: EffectComposer;
  /** Update composer size on resize. */
  setSize: (width: number, height: number) => void;
  /** Swap the post-fx chain to match a new quality tier. */
  rebuild: (quality: QualityLevel) => void;
  /** Tear down composer + passes. */
  dispose: () => void;
}

/**
 * Create the post-fx pipeline.
 *
 * The initial quality tier is the build-time level (see quality.ts). Runtime
 * promotes/demotes call `rebuild(nextLevel)` from the onQualityChange
 * subscription wired up by scene/index.ts.
 */
export function createPostFxPipeline(
  renderer: WebGLRenderer,
  scene: Scene,
  camera: Camera,
  initialQuality: QualityLevel,
): PostFxHandle {
  const composer = new EffectComposer(renderer, {
    multisampling: COMPOSER_MULTISAMPLING,
  });
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // Active EffectPass + its child effects, cached so we can dispose them
  // before installing the next chain on a quality change.
  let activeEffectPass: EffectPass | undefined;
  let activeEffects: ReadonlyArray<Effect> = [];

  const rebuild = (quality: QualityLevel): void => {
    teardownActive(composer, activeEffectPass, activeEffects);
    const next = buildEffectPass(camera, quality);
    composer.addPass(next.pass);
    activeEffectPass = next.pass;
    activeEffects = next.effects;
  };

  rebuild(initialQuality);

  const setSize = (width: number, height: number): void => {
    composer.setSize(width, height);
  };
  const dispose = (): void => {
    teardownActive(composer, activeEffectPass, activeEffects);
    activeEffectPass = undefined;
    activeEffects = [];
    composer.removePass(renderPass);
    renderPass.dispose();
    composer.dispose();
  };

  return { composer, setSize, rebuild, dispose };
}

/**
 * Construct the EffectPass for a given quality tier.
 *
 * Extracted so the createPostFxPipeline closure stays under the 50-line
 * function ceiling. Returns both the EffectPass and the list of child
 * Effects so the caller can dispose them individually.
 */
function buildEffectPass(
  camera: Camera,
  quality: QualityLevel,
): { pass: EffectPass; effects: ReadonlyArray<Effect> } {
  const effects = buildEffects(quality);
  const pass = new EffectPass(camera, ...effects);
  return { pass, effects };
}

/**
 * Build the ordered effect list for a quality tier.
 *
 * The matrix is small and explicit — no abstract registry. Hardcoded
 * ordering also makes the dispose lifecycle obvious.
 */
function buildEffects(quality: QualityLevel): ReadonlyArray<Effect> {
  const effects: Effect[] = [];
  effects.push(createScanlineEffect());
  effects.push(createGrainEffect());
  if (quality === 'medium' || quality === 'high') {
    effects.push(createChromaticEffect());
  }
  if (quality === 'high') {
    effects.push(createDitherEffect());
  }
  return effects;
}

/**
 * Tear down the active EffectPass + its child effects.
 *
 * Calling .dispose() on each Effect releases its shader uniforms; calling
 * .dispose() on the EffectPass releases the pmndrs Material it owns. The
 * sequence is: remove from composer → dispose pass → dispose each effect.
 */
function teardownActive(
  composer: EffectComposer,
  pass: EffectPass | undefined,
  effects: ReadonlyArray<Effect>,
): void {
  if (pass === undefined) {
    return;
  }
  composer.removePass(pass);
  pass.dispose();
  for (const effect of effects) {
    effect.dispose();
  }
}
