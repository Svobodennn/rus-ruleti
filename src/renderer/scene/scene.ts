/**
 * Three.js scene + renderer + render-loop bootstrap.
 *
 * Composition root for Sprint 1 Phase 2. Each step is a single-purpose helper
 * so the function bodies stay under the 50-line ceiling. The public surface
 * is `bootstrapScene(container)` which returns the bag of resources the
 * higher-level mountScene() wires up.
 *
 * Phase 2 (kraken-shader) updates vs Phase 1:
 *   - `createScene(quality)` now takes a QualityLevel and picks the matching
 *     FogExp2 density (FOG_DENSITY_LOW / MEDIUM / HIGH) instead of the
 *     deprecated single FOG.near/far tuple. Designer flagged this in
 *     atmosphere-direction.md §6.1.
 *   - Renderer clear-colour reads FOG_COLOR directly (per §6.3) instead
 *     of the deprecated FOG.color alias.
 *
 * Render-loop notes:
 *   - We measure frame time in milliseconds using performance.now() deltas.
 *     The first frame after mount is skipped (deltaMs would include the
 *     mount cost itself; that's noise).
 *   - composer.render(deltaSec) accepts seconds; the frame logger eats ms.
 *     We compute both from a single timestamp source.
 */

import {
  ACESFilmicToneMapping,
  Clock,
  Color,
  FogExp2,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';
import {
  FOG_COLOR,
  FOG_DENSITY_HIGH,
  FOG_DENSITY_LOW,
  FOG_DENSITY_MEDIUM,
  RENDERER,
  RENDERER_TONE_MAPPING_EXPOSURE,
  type QualityLevel,
} from '../../shared/scene-constants';
import type { PostFxHandle } from './post-fx/pipeline';

/** Per-frame callback. Receives elapsed seconds since clock start. */
export type SceneFrameUpdate = (elapsedSec: number, deltaMs: number) => void;

/**
 * Build a Three.js WebGLRenderer sized to the container.
 *
 * antialias is OFF (PS1 aesthetic — jagged edges are intentional). pixelRatio
 * is capped at 2 to avoid blowing fragment count on high-DPR displays.
 *
 * Sprint 3 runtime lighting calibration:
 *   - `outputColorSpace = SRGBColorSpace` — Three r152+ defaults to
 *     LinearSRGBColorSpace which crushes midtones (the rendered scene goes
 *     out un-gamma-corrected and the user sees raw linear values, which
 *     read as "dark almost everywhere"). SRGBColorSpace applies the proper
 *     gamma curve on output so 50% physical luminance reads as 50% perceived.
 *   - `toneMapping = ACESFilmicToneMapping` — Three's default is
 *     NoToneMapping which clips highlights and crushes lows. ACES is the
 *     industry-standard filmic curve: lifts midtones perceptually,
 *     compresses highlights gently, gives the warm tungsten bulb a film
 *     look instead of clipping. The cellar aesthetic benefits massively.
 *   - `toneMappingExposure` lifts the whole image. 1.0 is neutral; values
 *     >1.0 brighten before the ACES curve is applied. Tuned at 1.4 to
 *     compensate for the dim single-bulb scene without going "office bright".
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
  renderer.setClearColor(new Color(FOG_COLOR));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = RENDERER_TONE_MAPPING_EXPOSURE;
  return renderer;
}

/**
 * Build the Scene with claustrophobic exponential fog. Fog colour matches
 * the shadow swatch (FOG_COLOR === PALETTE.shadow) so the room dissolves
 * into the same void the corners shade into.
 *
 * Density is picked per quality tier — see scene-constants.ts FOG_DENSITY_*
 * comments for the visible-distance table. `low` gives the GPU breathing
 * room; `medium` is the Sprint 1 default; `high` makes the cellar suffocate.
 */
export function createScene(quality: QualityLevel): Scene {
  const scene = new Scene();
  scene.fog = buildFog(quality);
  scene.background = new Color(FOG_COLOR);
  return scene;
}

/** Pick the FogExp2 density that matches the active quality tier. */
function buildFog(quality: QualityLevel): FogExp2 {
  const density =
    quality === 'low'
      ? FOG_DENSITY_LOW
      : quality === 'high'
        ? FOG_DENSITY_HIGH
        : FOG_DENSITY_MEDIUM;
  return new FogExp2(new Color(FOG_COLOR), density);
}

/**
 * Update the fog density on an existing scene without rebuilding it.
 *
 * Called by scene/index.ts when the quality controller fires onQualityChange.
 * Cheaper than rebuilding the scene — just mutates the existing FogExp2's
 * scalar density. Three.js picks up the change on the next render.
 */
export function applyFogDensityForQuality(
  scene: Scene,
  quality: QualityLevel,
): void {
  const fog = scene.fog;
  if (fog === null || !(fog instanceof FogExp2)) {
    return;
  }
  fog.density =
    quality === 'low'
      ? FOG_DENSITY_LOW
      : quality === 'high'
        ? FOG_DENSITY_HIGH
        : FOG_DENSITY_MEDIUM;
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
