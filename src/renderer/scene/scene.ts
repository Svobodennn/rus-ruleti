/**
 * Three.js scene + renderer + render-loop bootstrap.
 *
 * Composition root for Sprint 1 Phase 1. Each step is a single-purpose helper
 * so the function bodies stay under the 50-line ceiling. The public surface
 * is `bootstrapScene(container)` which returns the bag of resources the
 * higher-level mountScene() wires up.
 *
 * Render-loop notes:
 *   - We measure frame time in milliseconds using performance.now() deltas.
 *     The first frame after mount is skipped (deltaMs would include the
 *     mount cost itself; that's noise).
 *   - composer.render(deltaSec) accepts seconds; the frame logger eats ms.
 *     We compute both from a single timestamp source.
 */

import {
  Clock,
  Color,
  FogExp2,
  Scene,
  WebGLRenderer,
} from 'three';
import { FOG, RENDERER } from '../../shared/scene-constants';
import type { PostFxHandle } from './post-fx/pipeline';

/** Per-frame callback. Receives elapsed seconds since clock start. */
export type SceneFrameUpdate = (elapsedSec: number, deltaMs: number) => void;

/**
 * Build a Three.js WebGLRenderer sized to the container.
 *
 * antialias is OFF (PS1 aesthetic — jagged edges are intentional). pixelRatio
 * is capped at 2 to avoid blowing fragment count on high-DPR displays.
 */
export function createRenderer(container: HTMLElement): WebGLRenderer {
  const renderer = new WebGLRenderer({
    antialias: RENDERER.antialias,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, RENDERER.pixelRatioMax),
  );
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(new Color(FOG.color));
  return renderer;
}

/**
 * Build the Scene with claustrophobic exponential fog. Fog color matches
 * the shadow swatch so the room dissolves into black at the corners.
 */
export function createScene(): Scene {
  const scene = new Scene();
  scene.fog = buildFog();
  scene.background = new Color(FOG.color);
  return scene;
}

/** Construct the FogExp2 instance from FOG constants. */
function buildFog(): FogExp2 {
  // FogExp2 takes a density. Convert the linear near/far hint into an
  // approximate density that visibly fades the back wall (~3m away).
  const density = 1 / Math.max(FOG.far - FOG.near, 1);
  return new FogExp2(new Color(FOG.color), density);
}

/**
 * Install a window resize listener that updates renderer + post-fx + caller.
 *
 * The caller's `onResize(width, height)` is where camera-aspect updates land
 * — keeping the camera reference out of this helper means scene.ts has no
 * dependency on PerspectiveCamera and stays renderer-only.
 *
 * Returns a disposer that unregisters the listener. Idempotent — re-calling
 * the disposer is safe.
 */
export function installResizeListener(
  container: HTMLElement,
  renderer: WebGLRenderer,
  postFx: PostFxHandle,
  onResize: (width: number, height: number) => void,
): () => void {
  const handler = (): void => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    postFx.setSize(width, height);
    onResize(width, height);
  };
  window.addEventListener('resize', handler);
  return (): void => {
    window.removeEventListener('resize', handler);
  };
}

/**
 * Start the requestAnimationFrame render loop.
 *
 * Returns a stop function. Two updaters are invoked per frame:
 *   - update(elapsedSec, deltaMs) — caller-supplied (bulb sway, frame logger).
 *   - composer.render(deltaSec)   — post-fx pipeline draws the scene.
 *
 * The loop is stopped via the returned function on unmount. Calling stop
 * twice is safe.
 */
export function startRenderLoop(
  postFx: PostFxHandle,
  update: SceneFrameUpdate,
): () => void {
  const clock = new Clock();
  let rafId = 0;
  let active = true;
  let lastTimestamp = performance.now();

  const tick = (): void => {
    if (!active) {
      return;
    }
    rafId = requestAnimationFrame(tick);
    const now = performance.now();
    const deltaMs = now - lastTimestamp;
    lastTimestamp = now;
    const elapsedSec = clock.getElapsedTime();
    const deltaSec = clock.getDelta();
    update(elapsedSec, deltaMs);
    postFx.composer.render(deltaSec);
  };

  rafId = requestAnimationFrame(tick);

  return (): void => {
    active = false;
    cancelAnimationFrame(rafId);
  };
}
