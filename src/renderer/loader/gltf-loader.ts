/**
 * GLTFLoader thin wrapper — Sprint 3 Phase 2B kraken-loader.
 *
 * Phase 2B contract (from Phase 1 scaffold comments, now implemented):
 *   - **Module-level singleton GLTFLoader** so repeated loads share the same
 *     worker/cache. Lazily constructed on first use.
 *   - **try/catch wrap** around `loadAsync`. Errors surface as `Error` with
 *     the offending path baked into the message so callers can locate the
 *     failed asset without re-stringifying.
 *   - **No additional dependencies** — only `three` + the
 *     `three/examples/jsm/loaders/GLTFLoader.js` example loader (already
 *     ships with the same npm package).
 *   - **disposeModel** walks the scene graph, calling `.dispose()` on every
 *     geometry + material + texture defensively (`typeof === 'function'`
 *     guard so a future three.js change that removes a dispose method
 *     doesn't crash us).
 *
 * Temporal-correctness scenarios (from types.ts JSDoc):
 *   - A failed load throws an `Error` whose `.message` includes the path.
 *   - A loaded `Group` is fully disposable via `disposeModel(group)`.
 *   - Re-entrant calls to `disposeModel` on the same scene are silent no-ops
 *     (every dispose() on three.js resources is itself idempotent).
 */

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Group } from 'three';
import type { LoadedModelHandle, ModelKey } from './types';

/**
 * Lazily-constructed singleton. Module-scoped so HMR replaces it cleanly —
 * if this file is hot-reloaded the new module gets a fresh `_loader`, which
 * is fine because the loader holds no in-flight state (each loadAsync is
 * self-contained).
 */
let _loader: GLTFLoader | null = null;

/** Resolve (and lazily construct) the singleton loader. */
function getLoader(): GLTFLoader {
  if (_loader === null) {
    _loader = new GLTFLoader();
  }
  return _loader;
}

/**
 * Load a single GLB from a renderer-resolved URL.
 *
 * Returns a `LoadedModelHandle` whose `.scene` is the root Group. The handle's
 * `dispose()` walks the scene and releases GPU buffers; the registry caches
 * the handle and calls dispose() on cache-eviction or scene-unmount.
 *
 * Throws `Error` (not rejection of a non-Error value) when the network fetch
 * fails or the binary fails to parse. The message includes the path so the
 * caller can disambiguate which of N parallel loads broke.
 */
export async function loadGLTFFromPath(
  path: string,
  key: ModelKey,
): Promise<LoadedModelHandle> {
  try {
    const gltf = await getLoader().loadAsync(path);
    const scene = gltf.scene as Group;
    return {
      scene,
      key,
      dispose: (): void => disposeModel(scene),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to load GLB at ${path}: ${message}`);
  }
}

/**
 * Walk a loaded scene graph and dispose every geometry + material + texture.
 *
 * The scene-graph traversal is bounded (each GLB is ~5-15k tris, < 50 meshes)
 * so the cost is negligible relative to a full WebGL frame.
 *
 * Defensive about future three.js API changes:
 *   - `geometry.dispose` is checked via `typeof === 'function'` rather than
 *     instanceof — three.js's BufferGeometry hierarchy adds methods over time
 *     and a missing dispose should not throw.
 *   - Materials may be arrays (multi-material meshes) — both cases handled.
 *   - Texture references hanging off material slots (.map, .normalMap, etc.)
 *     get disposed too via the helper below; otherwise three.js leaks the
 *     GPU texture handle.
 */
export function disposeModel(scene: Group): void {
  scene.traverse((obj): void => {
    disposeGeometryOf(obj);
    disposeMaterialOf(obj);
  });
}

/** Dispose any `.geometry` hanging off the object. */
function disposeGeometryOf(obj: object): void {
  if (!('geometry' in obj)) return;
  const geo = (obj as { geometry?: { dispose?: () => void } }).geometry;
  if (geo && typeof geo.dispose === 'function') {
    geo.dispose();
  }
}

/** Dispose any `.material` (single or array) hanging off the object. */
function disposeMaterialOf(obj: object): void {
  if (!('material' in obj)) return;
  const mat = (obj as { material?: unknown }).material;
  if (mat === undefined || mat === null) return;
  if (Array.isArray(mat)) {
    for (const m of mat) disposeMaterialAndTextures(m);
  } else {
    disposeMaterialAndTextures(mat);
  }
}

/** Dispose a single material + any textures it references. */
function disposeMaterialAndTextures(mat: unknown): void {
  if (mat === null || typeof mat !== 'object') return;
  // Common texture slots — defensive scan, dispose those that exist.
  const TEXTURE_SLOTS = [
    'map', 'normalMap', 'roughnessMap', 'metalnessMap',
    'emissiveMap', 'aoMap', 'alphaMap', 'bumpMap',
  ] as const;
  const m = mat as Record<string, unknown>;
  for (const slot of TEXTURE_SLOTS) {
    const tex = m[slot];
    if (tex && typeof tex === 'object' && 'dispose' in tex) {
      const disposeFn = (tex as { dispose?: () => void }).dispose;
      if (typeof disposeFn === 'function') disposeFn.call(tex);
    }
  }
  const disposeFn = (mat as { dispose?: () => void }).dispose;
  if (typeof disposeFn === 'function') disposeFn.call(mat);
}
