/**
 * Shared types for the GLB loader subsystem.
 *
 * Sprint 3 Phase 1 (scaffold). The Phase 2B kraken-loader implementation
 * fills the function bodies in gltf-loader.ts, model-registry.ts and
 * procedural-textures.ts; this file is the **canonical declaration site**
 * for the cross-module types they share.
 *
 * Sprint 3 structural rule: types declared once, imported everywhere. No
 * private duplicates of `LoadedModelState` / `ModelKey` / `LoadedModelHandle`
 * in implementation files — re-export from here instead.
 *
 * Phase 2B ownership:
 *   - kraken-loader fills function bodies in gltf-loader.ts / model-registry.ts.
 *   - kraken-particles consumes ProceduralTextureKey for the smoke sprite.
 *   - kraken-revolver consumes LoadedModelHandle for the revolver swap.
 *   - designer (Phase 2A) does NOT touch this file; the type set is
 *     locked at scaffold time.
 *
 * Temporal-correctness scenarios documented in JSDoc on each variant so the
 * qa-engineer Phase 3 verify pass has explicit scenarios to write tests
 * against (e.g. "loading → error on dispose mid-flight").
 */

import type { Group } from 'three';

/**
 * Discriminated union describing the loader's per-model state.
 *
 * State transitions:
 *   idle    → loading (preload() / load() invoked)
 *   loading → loaded  (GLTFLoader.loadAsync resolved)
 *   loading → error   (network / parse failure, or dispose during loading)
 *   loaded  → idle    (dispose() called on the handle)
 *   error   → loading (retry attempted)
 *
 * Temporal-correctness scenarios (qa-engineer Phase 3 verify list):
 *   - Scenario A: registry.load() called twice while state===loading must
 *     return the same promise — no double fetch.
 *   - Scenario B: dispose() during state===loading must transition to
 *     idle (or error) WITHOUT a memory leak — the pending fetch result
 *     is discarded, not added to the cache.
 *   - Scenario C: scene unmount during state===loaded must dispose the
 *     Group's geometry+material and transition to idle so HMR re-mounts
 *     reload cleanly.
 *
 * Timing fields (`startedAtMs` / `loadedAtMs` / `failedAtMs`) are
 * `performance.now()` snapshots — used by Phase 2B telemetry to verify
 * the PLAN §13 "asset preload < 4s" budget.
 */
export type LoadedModelState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'loading'; readonly startedAtMs: number }
  | { readonly kind: 'loaded'; readonly scene: Group; readonly loadedAtMs: number }
  | { readonly kind: 'error'; readonly error: Error; readonly failedAtMs: number };

/**
 * Stable identifiers for every Sprint 3 vendored GLB.
 *
 * One-to-one with the files under `src/renderer/assets/models/` (see
 * scene-model-constants.ts MODEL_PATHS). Adding a new model requires:
 *   1. Vendor the .glb file under src/renderer/assets/models/.
 *   2. Add the key to this union.
 *   3. Add the path to MODEL_PATHS in model-registry.ts.
 *   4. Add MODEL_SCALE/POSITION/ROTATION constants in
 *      scene-model-constants.ts (designer Phase 2A territory).
 */
export type ModelKey =
  | 'revolver'
  | 'chair'
  | 'radio'
  | 'bottle'
  | 'table'
  | 'ashtray'
  | 'lightbulb';

/**
 * Procedurally-generated texture identifiers.
 *
 * These are *not* GLB-bound — the texture is rendered to a canvas at runtime
 * via SVG→Image→drawImage→CanvasTexture. PLAN §10 line 521-525 lists the
 * three procedural surfaces the bodrum oda needs: Cyrillic envelope, faded
 * portrait, and Soviet propaganda poster.
 *
 * Each texture lives within `PROC_TEXTURE_BUDGET_MS` (200ms) of CPU time per
 * generation — verified via performance.now() bookends.
 */
export type ProceduralTextureKey =
  | 'cyrillic-envelope'
  | 'faded-portrait'
  | 'soviet-poster';

/**
 * Public loader handle for a single loaded model.
 *
 * Returned from `modelRegistry.load(key)`. Caller owns the dispose lifecycle;
 * registry caches but does not aggressively GC — the SceneHandle's dispose()
 * iterates registered handles and calls dispose() in reverse-mount order.
 */
export interface LoadedModelHandle {
  /** The root Group of the loaded scene graph — add to your scene. */
  readonly scene: Group;
  /** Which model this handle corresponds to. */
  readonly key: ModelKey;
  /** Release geometry + material GPU buffers and drop from the cache. */
  dispose: () => void;
}

/**
 * Top-level loader subsystem handle tracked by the SceneHandle.
 *
 * Sprint 3 Phase 1 (scaffold) exposes the function surface stub — Phase 2B
 * kraken-loader fills the bodies. The SceneHandle stores this so dispose()
 * can iterate handles in reverse-allocation order, and so Phase 2B can
 * surface `preload()` from the public API for the disclaimer→scene boot
 * sequence.
 *
 * The shape is intentionally narrow: callers in scene/index.ts only need
 * `preload`, `getAll`, and `dispose`. Per-key `load` calls happen inside
 * the loader subsystem (placeholder-room.ts + revolver-mount.ts at Phase
 * 2B) — they import from `../loader` directly, not via this handle.
 */
export interface LoaderHandle {
  /** Kick off the parallel preload of every model. */
  preload: () => Promise<void>;
  /** Snapshot of every currently-loaded handle, for reverse-allocation teardown. */
  getAll: () => ReadonlyArray<LoadedModelHandle>;
  /** Release every cached handle and reset the registry to its initial state. */
  dispose: () => void;
}
