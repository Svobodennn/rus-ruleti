/**
 * Sprint 3 Phase 2B kraken-loader — scene/index.ts helpers.
 *
 * Split out so `scene/index.ts` stays under the 400-line ceiling. These
 * helpers all touch the GLB loader subsystem; they're consumed by
 * `buildResources` + `buildSceneGraph` + `rebuildRoomMaterials` in
 * `scene/index.ts` and nowhere else.
 *
 * Owned strictly by Phase 2B kraken-loader: do not import this from
 * sibling agents' modules. The public API for the rest of the renderer is
 * still `../loader` (model-registry + types).
 */

import type { Group } from 'three';
import { createRoomFromGlbs, createPlaceholderRoom } from './placeholder-room';
import type { BulbLightHandle } from './lighting';
import { createPs1MaterialFactory } from './shaders/ps1-material';
import type { Ps1MaterialFactory } from './shaders/ps1-material';
import { preloadAll } from '../loader';
import type {
  LoadedModelHandle,
  ModelKey,
  PreloadResult,
} from '../loader';
import type { QualityLevel } from '../../shared/scene-constants';

/**
 * Parallel preload of every GLB. Returns a Map keyed by ModelKey for the
 * downstream scene-graph composition. Failed keys are surfaced via
 * `document.body.dataset['modelFailures']` so QA can identify which GLB
 * regressed; the scene composes around the missing keys (graceful
 * degradation per designer §8.1).
 */
export async function preloadGlbs(): Promise<Map<ModelKey, LoadedModelHandle>> {
  const result: PreloadResult = await preloadAll();
  const map = new Map<ModelKey, LoadedModelHandle>();
  for (const handle of result.loaded) {
    map.set(handle.key, handle);
  }
  if (result.failed.length > 0) {
    const failedKeys = result.failed.map((f): string => f.key).join(',');
    document.body.dataset['modelFailures'] = failedKeys;
  }
  return map;
}

/** Subset of ModelKey that lives in the room (excludes revolver + lightbulb). */
const ROOM_GLB_KEYS_FOR_PRESENCE: readonly ModelKey[] = [
  'table', 'chair', 'radio', 'bottle', 'ashtray',
];

/**
 * Pick the right room constructor. If any of the 5 room-GLBs loaded, use
 * `createRoomFromGlbs` (missing keys gracefully skipped); otherwise fall
 * back to the Sprint 1 cube path so the scene still renders. The 'high'
 * quality tier additionally swaps GLB materials for PS1 ShaderMaterial
 * (affine-UV vertex snap) per designer §6.
 */
export function composeRoom(
  glbHandles: ReadonlyMap<ModelKey, LoadedModelHandle>,
  factory: Ps1MaterialFactory,
  quality: QualityLevel,
): Group {
  const anyRoomGlb = ROOM_GLB_KEYS_FOR_PRESENCE
    .some((k): boolean => glbHandles.has(k));
  if (!anyRoomGlb) {
    return createPlaceholderRoom(factory, false);
  }
  return createRoomFromGlbs(glbHandles, factory, quality === 'high');
}

/**
 * Parent the lightbulb GLB onto the PointLight if it preloaded. The GLB is
 * cloned so the loader's source scene stays untouched (HMR + dispose path
 * relies on the cache holding the original).
 */
export function attachLightbulbIfLoaded(
  bulb: BulbLightHandle,
  glbHandles: ReadonlyMap<ModelKey, LoadedModelHandle>,
): void {
  const lightbulb = glbHandles.get('lightbulb');
  if (lightbulb === undefined) return;
  bulb.attachToMesh(lightbulb.scene.clone(true));
}

/** Build a PS1 factory for the given quality + container aspect ratio. */
export function buildFactoryForQuality(
  quality: QualityLevel,
  container: HTMLElement,
): Ps1MaterialFactory {
  const aspect = container.clientWidth / Math.max(container.clientHeight, 1);
  return createPs1MaterialFactory(quality, aspect);
}
