/**
 * GLTFLoader thin wrapper — Sprint 3 Phase 1 scaffold.
 *
 * Phase 2B kraken-loader fills the bodies. The Phase 1 signatures are
 * locked so model-registry.ts can be written against a stable type
 * surface, and so Phase 2A designer Vector3 tuples in scene-model-
 * constants.ts don't need to coordinate on identifier names with the
 * (still-unwritten) loader internals.
 *
 * Phase 2B implementation contract:
 *   - Maintain a **module-level singleton** GLTFLoader so the worker pool
 *     (if Phase 2B opts into Draco) is shared across all model loads.
 *   - Wrap loadAsync in try/catch — file-not-found, malformed glb header,
 *     or parse error must NOT propagate out as unhandled rejections.
 *     Return a `Result<Group, Error>`-style value or rethrow `Error`
 *     (kraken-loader decides; the registry layer is the consumer).
 *   - Stay within `MODEL_LOAD_BUDGET_MS` (4000ms) per PLAN §13 — verified
 *     by performance.now() bookends.
 *   - DO NOT introduce additional dependencies. `three` is already in
 *     package.json; `three/examples/jsm/loaders/GLTFLoader.js` ships with
 *     the same package (verified at scaffold time).
 *
 * Temporal-correctness scenarios (Phase 3 qa-engineer verify list):
 *   - Scenario A: loadGLTFFromPath('/missing.glb') rejects with Error
 *     whose message identifies the path — not a generic "fetch failed".
 *   - Scenario B: a load already in flight when disposeModel() is invoked
 *     must NOT leave a detached Group in memory. The loader either
 *     resolves and the registry GCs it, or it rejects with a "disposed
 *     during load" sentinel error.
 *   - Scenario C: a Group returned by loadAsync must be disposable via
 *     disposeModel(scene) — geometry.dispose() + material.dispose() walk
 *     the scene graph; missing dispose() methods are silently skipped
 *     (defensive — three.js future-proofing).
 */

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/** Marker so the import is not pruned by typecheck — replaced Phase 2B. */
const _GLTFLoaderCtor = GLTFLoader;

/**
 * Load a single GLB from a renderer-relative path (or absolute URL).
 *
 * Phase 1 stub. Phase 2B kraken-loader replaces the body with the real
 * GLTFLoader.loadAsync wrapper. Throws until then so any caller wired up
 * pre-Phase-2B fails loud rather than silently returning `undefined`.
 */
export async function loadGLTFFromPath(path: string): Promise<unknown> {
  // Touch the imported constructor so eslint's `no-unused-vars` (and the
  // tree-shaker) keeps the import alive through Phase 1 even though the
  // body is a stub. Phase 2B replaces this with the real `new GLTFLoader()`
  // singleton + `loader.loadAsync(path)` call.
  void _GLTFLoaderCtor;
  throw new Error(
    `[loader] loadGLTFFromPath stub — Phase 2B kraken-loader fills. path=${path}`,
  );
}

/**
 * Dispose a previously-loaded model's GPU buffers.
 *
 * Phase 1 stub. Phase 2B kraken-loader walks the scene graph: for each
 * Mesh, call geometry.dispose() and material.dispose() (handling array
 * materials defensively). Mirrors the disposeRoomGroup() pattern in
 * scene/index.ts so the two disposal paths are visually consistent.
 */
export function disposeModel(_scene: unknown): void {
  // Phase 2B fills. Intentional no-op so partial integration mid-Phase-2B
  // does not crash a test harness; the registry's own cache eviction
  // covers the "did the dispose run" assertion.
}
