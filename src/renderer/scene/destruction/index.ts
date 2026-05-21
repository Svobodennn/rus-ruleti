/**
 * Destruction module barrel.
 *
 * Public surface consumed by `src/renderer/scene/index.ts` (SceneHandle).
 * Sprint 4 Phase 2B agents (kraken-faz0-1 / kraken-faz2-3 / swift-expert /
 * frontend-dev) import internal modules directly from their leaf paths;
 * scene/index.ts only needs the director mount + the handle type.
 *
 * Sprint 5 Phase 1 adds Faz 4-7 lane runners + chrome stubs + audio
 * synth handle factories — Lane A/B/C/D pick these up in Phase 2B.
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
  MacKernelPanicHandle,
  MacProgressDialogHandle,
  MacBootloopHandle,
  WinBsodHandle,
  WinProgressDialogHandle,
  WinBiosBootloopHandle,
} from './types.js';

/* Sprint 5 Phase 1 — Faz 4-7 lane runners + chrome mounts. */
export { startFaz4FileWipe } from './faz4-file-wipe.js';
export { startFaz5DiskFormat } from './faz5-disk-format.js';
export { startFaz6Bsod } from './faz6-bsod.js';
export { startFaz7Bootloop } from './faz7-bootloop.js';
export { mountMacKernelPanic } from './chrome/mac-kernel-panic.js';
export { mountMacProgressDialog } from './chrome/mac-progress-dialog.js';
export { mountMacBootloop } from './chrome/mac-bootloop.js';
export { mountWinBsod } from './chrome/win-bsod.js';
export { mountWinProgressDialog } from './chrome/win-progress-dialog.js';
export { mountWinBiosBootloop } from './chrome/win-bios-bootloop.js';
export { scheduleBleed3, scheduleBleed4 } from './apartment-bleed.js';
export type { BleedScheduleOptions, Bleed4ScheduleOptions } from './apartment-bleed.js';
