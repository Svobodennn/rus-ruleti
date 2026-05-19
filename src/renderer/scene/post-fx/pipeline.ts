/**
 * Post-FX Composer wrapper.
 *
 * Sprint 1 Phase 1 stub: builds an EffectComposer with a single RenderPass.
 * Phase 2 (kraken-shader) fills this with:
 *   - PS1 vertex-snap pass
 *   - affine UV warp pass
 *   - 256-color dither pass
 *   - CRT scanline pass (pmndrs)
 *   - chromatic aberration pass (pmndrs)
 *   - film grain pass (pmndrs)
 *
 * The composer is returned to scene.ts where the render loop calls
 * composer.render() instead of renderer.render() on every frame.
 *
 * Quality-tier subscription: the controller in quality.ts emits change
 * events; Phase 2 wires those to `composer.enabled` flags or per-pass
 * `enabled` toggles so we degrade gracefully on low hardware.
 */

import { EffectComposer, RenderPass } from 'postprocessing';
import type { Scene, WebGLRenderer, Camera } from 'three';

/** Public handle returned from createPostFxPipeline. */
export interface PostFxHandle {
  readonly composer: EffectComposer;
  /** Update composer size on resize. */
  setSize: (width: number, height: number) => void;
  /** Tear down composer + passes. */
  dispose: () => void;
}

/**
 * Create the post-fx pipeline with a single RenderPass.
 *
 * Phase 2 extends this — DO NOT inline shader code in this stub; new passes
 * go in src/renderer/scene/shaders/* and are imported here.
 */
export function createPostFxPipeline(
  renderer: WebGLRenderer,
  scene: Scene,
  camera: Camera,
): PostFxHandle {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  return {
    composer,
    setSize: (width: number, height: number): void => {
      composer.setSize(width, height);
    },
    dispose: (): void => {
      composer.dispose();
    },
  };
}
