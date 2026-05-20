/**
 * Model registry — singleton cache of loaded GLB handles.
 *
 * Sprint 3 Phase 2B kraken-loader implementation. The Phase 1 stub contract:
 *   - Singleton `Map<ModelKey, LoadedModelHandle>` cache.
 *   - Inflight `Map<ModelKey, Promise<LoadedModelHandle>>` so two concurrent
 *     `load('table')` calls share one fetch instead of double-loading.
 *   - `preloadAll()` runs Promise.allSettled — one bad GLB does NOT block
 *     the rest of the scene (designer model-freeze §8.1 recommendation).
 *   - `dispose()` releases every cached handle and resets the maps.
 *
 * Surface change from Phase 1 stub:
 *   - `preload()` (Phase 1 stub `Promise<void>`) is supplemented by
 *     `preloadAll()` (Phase 2B) which returns `{ loaded, failed }` so the
 *     scene mount can render placeholders for failed keys instead of
 *     silently breaking. `preload()` is kept as a thin wrapper so the
 *     Phase 1 SceneHandle.loader.preload contract still typechecks.
 *
 * Asset URL resolution: each GLB is imported via Vite's `?url` query so the
 * build pipeline copies the binary into `out/renderer/assets/` and hands us
 * back a hashed URL. This is the only correct way to ship binary assets
 * through electron-vite — string paths under `/src/...` only resolve in dev
 * mode and break in the packaged build.
 */

import type { ModelKey, LoadedModelHandle, LoaderHandle } from './types';
import { loadGLTFFromPath } from './gltf-loader';
import { MODEL_LOAD_BUDGET_MS } from '../../shared/scene-model-constants';

// Vite `?url` imports — hashed bundle URLs at build time, dev-server URLs in dev.
import revolverUrl from '../assets/models/revolver.glb?url';
import chairUrl from '../assets/models/chair.glb?url';
import radioUrl from '../assets/models/radio.glb?url';
import bottleUrl from '../assets/models/bottle.glb?url';
import tableUrl from '../assets/models/table.glb?url';
import ashtrayUrl from '../assets/models/ashtray.glb?url';
import lightbulbUrl from '../assets/models/lightbulb.glb?url';

/**
 * Per-key URL map. Built from Vite `?url` imports so the build pipeline
 * picks the GLBs up automatically — no `publicDir` hand-wiring needed.
 *
 * Adding a new model:
 *   1. Vendor the .glb under src/renderer/assets/models/.
 *   2. Add the import line above.
 *   3. Add the key here AND to ModelKey union in types.ts.
 *   4. Add MODEL_SCALE/POSITION/ROTATION + MATERIAL_COLOR_OVERRIDE_BY_KEY
 *      entries (designer territory).
 */
const MODEL_URLS: Readonly<Record<ModelKey, string>> = {
  revolver: revolverUrl,
  chair: chairUrl,
  radio: radioUrl,
  bottle: bottleUrl,
  table: tableUrl,
  ashtray: ashtrayUrl,
  lightbulb: lightbulbUrl,
} as const;

/** Cache of resolved handles. Mutated only via `load()` and `disposeAll()`. */
const _cache = new Map<ModelKey, LoadedModelHandle>();

/** Inflight promises, keyed by model. Cleared on settle (success or failure). */
const _inflight = new Map<ModelKey, Promise<LoadedModelHandle>>();

/**
 * Result of `preloadAll()`. The scene mount inspects `failed` to decide whether
 * to render a placeholder for the missing keys.
 */
export interface PreloadResult {
  /** Successfully-loaded handles, in completion order. */
  loaded: LoadedModelHandle[];
  /** Per-key load failures with the underlying error. */
  failed: Array<{ key: ModelKey; error: Error }>;
}

/**
 * Load a single model. Returns the cached handle on subsequent calls.
 *
 * Three return paths:
 *   1. Cache hit → return cached handle immediately.
 *   2. Inflight  → return the same Promise the first caller awaits (no
 *                  double fetch — temporal-correctness Scenario A).
 *   3. Cold      → kick off loadGLTFFromPath, register the inflight Promise,
 *                  cache the handle on success, throw on failure.
 */
export async function load(key: ModelKey): Promise<LoadedModelHandle> {
  const cached = _cache.get(key);
  if (cached !== undefined) return cached;

  const inflight = _inflight.get(key);
  if (inflight !== undefined) return inflight;

  const promise = startLoad(key);
  _inflight.set(key, promise);
  return promise;
}

/**
 * Kick off the actual GLB fetch + cache install on resolve. Extracted so the
 * `load()` entry point stays focused on cache + inflight bookkeeping.
 */
async function startLoad(key: ModelKey): Promise<LoadedModelHandle> {
  try {
    const handle = await loadGLTFFromPath(MODEL_URLS[key], key);
    _cache.set(key, handle);
    return handle;
  } finally {
    _inflight.delete(key);
  }
}

/**
 * Parallel preload of every model via Promise.allSettled. Designer §8.1
 * recommendation: one bad GLB renders a placeholder cube, the scene stays
 * playable rather than going black-screen.
 *
 * Surfaces over-budget loads via `document.body.dataset['modelBudget']`
 * (console is banned per Sprint-0 lint rules).
 */
export async function preloadAll(): Promise<PreloadResult> {
  const keys: ModelKey[] = [
    'revolver', 'chair', 'radio', 'bottle', 'table', 'ashtray', 'lightbulb',
  ];
  const startMs = performance.now();
  const results = await Promise.allSettled(keys.map((k) => load(k)));
  surfaceLoadBudget(performance.now() - startMs);
  return collectResults(keys, results);
}

/** Walk allSettled outputs into `{ loaded, failed }`. */
function collectResults(
  keys: ModelKey[],
  results: PromiseSettledResult<LoadedModelHandle>[],
): PreloadResult {
  const loaded: LoadedModelHandle[] = [];
  const failed: Array<{ key: ModelKey; error: Error }> = [];
  results.forEach((r, i): void => {
    const key = keys[i];
    if (key === undefined) return;
    if (r.status === 'fulfilled') {
      loaded.push(r.value);
    } else {
      const reason = r.reason;
      const error = reason instanceof Error ? reason : new Error(String(reason));
      failed.push({ key, error });
    }
  });
  return { loaded, failed };
}

/** Stash over-budget elapsed time on document.body.dataset (console is banned). */
function surfaceLoadBudget(elapsedMs: number): void {
  if (elapsedMs > MODEL_LOAD_BUDGET_MS) {
    document.body.dataset['modelBudget'] = `${elapsedMs.toFixed(0)}ms`;
  } else {
    document.body.dataset['modelBudget'] = `${elapsedMs.toFixed(0)}ms-ok`;
  }
}

/** Phase 1 compatibility — kept so SceneHandle.loader.preload still typechecks. */
export async function preload(): Promise<void> {
  await preloadAll();
}

/** Snapshot of every currently-cached handle. Used by SceneHandle dispose. */
export function getAll(): ReadonlyArray<LoadedModelHandle> {
  return Array.from(_cache.values());
}

/** Release every cached handle and reset both maps. */
export function disposeAll(): void {
  for (const handle of _cache.values()) {
    handle.dispose();
  }
  _cache.clear();
  _inflight.clear();
}

/**
 * Construct a LoaderHandle facade for the SceneHandle. Wraps the module-level
 * state so consumers in scene/index.ts don't need to import each function
 * individually — they just hold the handle and call its methods.
 */
export function createLoaderHandle(): LoaderHandle {
  return {
    preload,
    getAll,
    dispose: disposeAll,
  };
}

/** Re-export the URL map so LEGAL.md SHA-256 manifest tooling can iterate. */
export const _PATHS_FOR_AUDIT: Readonly<Record<ModelKey, string>> = MODEL_URLS;
