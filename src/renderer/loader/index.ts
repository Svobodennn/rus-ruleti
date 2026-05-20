/**
 * Public barrel for the GLB loader subsystem.
 *
 * Sprint 3 Phase 1 (scaffold). Re-exports the cross-module types and the
 * public function surface so the rest of the renderer imports from a
 * single path:
 *
 *   import { load, preload, getAll } from '../loader';
 *   import type { LoadedModelHandle, ModelKey } from '../loader';
 *
 * Phase 2B kraken-loader / kraken-particles fill the function bodies in
 * the sibling files; this barrel does not need to change unless a new
 * cross-module export is added.
 */

export type {
  LoadedModelState,
  ModelKey,
  ProceduralTextureKey,
  LoadedModelHandle,
  LoaderHandle,
} from './types';

export { loadGLTFFromPath, disposeModel } from './gltf-loader';

export {
  load,
  preload,
  preloadAll,
  getAll,
  disposeAll,
  createLoaderHandle,
  _PATHS_FOR_AUDIT,
  type PreloadResult,
} from './model-registry';

export {
  getProceduralTexture,
  disposeProceduralTexture,
} from './procedural-textures';
