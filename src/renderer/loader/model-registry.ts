/**
 * Model registry — singleton cache of loaded GLB handles.
 *
 * Sprint 3 Phase 1 (scaffold). Phase 2B kraken-loader fills the body. The
 * Phase 1 surface is a stable contract so Phase 2A designer Vector3
 * placements (scene-model-constants.ts) can reference the same ModelKey
 * identifiers, and scene/index.ts can wire preload() into its mount path
 * even before the cache logic is real.
 *
 * Phase 2B implementation contract:
 *   - **Singleton cache**: `Map<ModelKey, LoadedModelHandle>`. A second
 *     `load('revolver')` returns the cached handle without re-fetching.
 *   - **preload()**: parallel `Promise.all(keys.map(load))` so the seven
 *     GLBs load concurrently. Hit MODEL_LOAD_BUDGET_MS (4000ms) on M1
 *     baseline; degrade gracefully on slow disks (warn, do not crash).
 *   - **getAll()**: snapshot of every currently-loaded handle for the
 *     SceneHandle.dispose() reverse-allocation teardown.
 *   - **No eager loading at module-eval time** — the renderer entry-point
 *     (scene/index.ts) chooses when to preload (after disclaimer dismiss,
 *     so the Three.Loaders fetch doesn't slow first paint).
 *
 * Temporal-correctness scenarios (Phase 3 qa-engineer verify list):
 *   - Scenario A: two concurrent load('table') calls share one in-flight
 *     promise (Promise.race vs duplicate fetch). Phase 2B must use a
 *     `Map<ModelKey, Promise<LoadedModelHandle>>` "inflight" map.
 *   - Scenario B: preload() called twice in the same session must be a
 *     no-op the second time (cache hit on every key).
 *   - Scenario C: a load that exceeds MODEL_LOAD_BUDGET_MS must still
 *     resolve (do NOT race the budget) but emit a console.warn? — no,
 *     console is banned; surface via document.body.dataset['modelBudget']
 *     so the dashboard hook picks it up (same pattern as quality.ts).
 */

import type { ModelKey, LoadedModelHandle } from './types';

/**
 * Per-key file path map. Lines up 1:1 with the ModelKey union. The paths
 * are renderer-resolved (Vite ships them as static assets at /assets/...).
 *
 * If a new model is added, both this map AND the ModelKey union must be
 * extended in lockstep — TypeScript catches mismatches via the Record
 * type's exhaustiveness check.
 *
 * **DO NOT edit values** without updating:
 *   - src/renderer/assets/models/README.md (attribution row)
 *   - LEGAL.md (SHA-256 manifest, CC-BY credits)
 *   - scene-model-constants.ts (MODEL_POSITION_* / MODEL_SCALE_* /
 *     MODEL_ROTATION_* row for the new key — designer Phase 2A)
 */
const MODEL_PATHS: Readonly<Record<ModelKey, string>> = {
  revolver: '/src/renderer/assets/models/revolver.glb',
  chair: '/src/renderer/assets/models/chair.glb',
  radio: '/src/renderer/assets/models/radio.glb',
  bottle: '/src/renderer/assets/models/bottle.glb',
  table: '/src/renderer/assets/models/table.glb',
  ashtray: '/src/renderer/assets/models/ashtray.glb',
  lightbulb: '/src/renderer/assets/models/lightbulb.glb',
} as const;

/**
 * Internal cache. Phase 2B converts to `Map<ModelKey, LoadedModelHandle>`
 * + `Map<ModelKey, Promise<LoadedModelHandle>>` (inflight). Kept as a
 * frozen empty object during Phase 1 so accidental `_CACHE[key] = ...`
 * mutations error at strict-mode-runtime — defensive.
 */
const _CACHE: Readonly<Partial<Record<ModelKey, LoadedModelHandle>>> =
  Object.freeze({});

/**
 * Load a single model. Returns the cached handle on subsequent calls.
 *
 * Phase 1 stub. Phase 2B kraken-loader fills the body. Throws until then
 * so partial integrations fail loud.
 */
export async function load(key: ModelKey): Promise<LoadedModelHandle> {
  void _CACHE;
  void MODEL_PATHS;
  throw new Error(
    `[loader] model-registry.load('${key}') stub — Phase 2B kraken-loader fills.`,
  );
}

/**
 * Preload all seven models in parallel. Returns when every load resolves
 * (or rejects, if any one fails — Phase 2B decides whether one bad GLB
 * blocks the rest).
 *
 * Phase 1 stub. Phase 2B kraken-loader fills the body.
 */
export async function preload(): Promise<void> {
  // Phase 2B: const keys = Object.keys(MODEL_PATHS) as ModelKey[];
  //           await Promise.all(keys.map(load));
}

/**
 * Snapshot of every loaded handle currently in the cache. Used by the
 * SceneHandle dispose path to release GPU buffers in reverse-allocation
 * order.
 *
 * Phase 1 stub: returns an empty array because the cache is empty.
 */
export function getAll(): ReadonlyArray<LoadedModelHandle> {
  return [];
}

/** Re-export the path map so LEGAL.md SHA-256 manifest tooling can iterate. */
export const _PATHS_FOR_AUDIT: Readonly<Record<ModelKey, string>> = MODEL_PATHS;
