/**
 * Destruction module barrel — Phase 1 scaffold.
 *
 * Public surface consumed by `src/renderer/scene/index.ts` (SceneHandle).
 * Phase 2B agents (kraken-faz0-1 / kraken-faz2-3 / swift-expert /
 * frontend-dev) import internal modules directly from their leaf paths;
 * scene/index.ts only needs the director mount + the handle type.
 */

export { mountDestructionDirector } from './destruction-director.js';
export type {
  DestructionDirectorHandle,
  DestructionState,
  DestructionPhase,
  OsVariant,
  ApartmentBleedKind,
  ApartmentBleedHandle,
  NotificationToastSpec,
  TerminalLine,
  ChromeHandle,
  MacDialogHandle,
  WinDialogHandle,
  MacMenubarHandle,
  WinTaskbarHandle,
} from './types.js';
