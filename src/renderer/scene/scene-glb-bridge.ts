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

import {
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Vector3,
  type Group,
  type Scene,
  type Texture,
} from 'three';
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
import { mountSmoke } from './particles/smoke';
import type { SmokeHandle } from './particles/smoke';
import { getProceduralTexture } from '../loader/procedural-textures';
import {
  MODEL_POSITION_ASHTRAY,
  SMOKE_Y_OFFSET_M,
  PROC_TEXTURE_ENVELOPE_POSITION,
  PROC_TEXTURE_ENVELOPE_DIMENSIONS,
  PROC_TEXTURE_PORTRAIT_POSITION,
  PROC_TEXTURE_PORTRAIT_DIMENSIONS,
  PROC_TEXTURE_POSTER_POSITION,
  PROC_TEXTURE_POSTER_DIMENSIONS,
} from '../../shared/scene-model-constants';

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

/**
 * Mount the smoke particle column anchored above the ashtray. The spawn
 * position is MODEL_POSITION_ASHTRAY + SMOKE_Y_OFFSET_M on the y-axis per
 * designer §5.4. Called once from buildResources after the scene graph is
 * composed; the returned handle is wired into the render loop.
 */
export function mountSmokeIfReady(
  scene: Scene,
  qualityLevel: QualityLevel,
): SmokeHandle {
  const sourcePosition = new Vector3(
    MODEL_POSITION_ASHTRAY[0],
    MODEL_POSITION_ASHTRAY[1] + SMOKE_Y_OFFSET_M,
    MODEL_POSITION_ASHTRAY[2],
  );
  return mountSmoke(scene, { sourcePosition, qualityLevel });
}

/** Handle owning the three procedural-texture planes. */
export interface ProceduralTextureSurfacesHandle {
  /** Tear down: removes planes from scene and disposes GPU resources. */
  dispose: () => void;
}

/**
 * Spawn the three procedural-texture surface planes (model-freeze §8.5).
 * Each key maps to a named PlaneGeometry mesh attached directly to the scene.
 *
 * Positions and dimensions are sourced exclusively from scene-model-constants
 * (no inline literals per Sprint 3 strict rule).
 */
export async function mountProceduralTextureSurfaces(
  scene: Scene,
): Promise<ProceduralTextureSurfacesHandle> {
  const [envelopeTex, portraitTex, posterTex] = await Promise.all([
    getProceduralTexture('cyrillic-envelope'),
    getProceduralTexture('faded-portrait'),
    getProceduralTexture('soviet-poster'),
  ]);

  const envelope = buildPlane(
    PROC_TEXTURE_ENVELOPE_DIMENSIONS,
    envelopeTex,
    PROC_TEXTURE_ENVELOPE_POSITION,
    'envelope-plane',
    true,
  );
  scene.add(envelope);

  const portrait = buildPlane(
    PROC_TEXTURE_PORTRAIT_DIMENSIONS,
    portraitTex,
    PROC_TEXTURE_PORTRAIT_POSITION,
    'portrait-plane',
    false,
  );
  scene.add(portrait);

  const poster = buildPlane(
    PROC_TEXTURE_POSTER_DIMENSIONS,
    posterTex,
    PROC_TEXTURE_POSTER_POSITION,
    'poster-plane',
    false,
  );
  scene.add(poster);

  return {
    dispose: (): void => {
      scene.remove(envelope, portrait, poster);
      disposePlane(envelope);
      disposePlane(portrait);
      disposePlane(poster);
    },
  };
}

/**
 * Build a single PlaneGeometry mesh with MeshStandardMaterial map.
 * `flat` = true rotates the plane to lie horizontally (table surface).
 */
function buildPlane(
  dimensions: readonly [number, number],
  map: Texture,
  position: readonly [number, number, number],
  name: string,
  flat: boolean,
): Mesh {
  const geo = new PlaneGeometry(dimensions[0], dimensions[1]);
  const mat = new MeshStandardMaterial({ map, side: DoubleSide });
  const mesh = new Mesh(geo, mat);
  if (flat) {
    mesh.rotation.x = -Math.PI / 2;
  }
  mesh.position.set(position[0], position[1], position[2]);
  mesh.name = name;
  return mesh;
}

/** Dispose a single plane mesh's GPU resources. */
function disposePlane(mesh: Mesh): void {
  mesh.geometry.dispose();
  (mesh.material as MeshStandardMaterial).dispose();
}
