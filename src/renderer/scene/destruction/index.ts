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
 *
 * Sprint 6 Phase 1 adds Faz 8 reveal + son-ekran lane runners + chrome
 * stubs (restart-hint + optional volumetric-smoke) — Lane A/B pick these
 * up in Phase 2B. (Sprint 9.1 — the Sprint 6 disclaimer chrome was
 * removed from the in-app surface post-ship; the mount fn + handle
 * export are both dropped from this barrel.)
 *
 * Sprint 7 Phase 1 adds Faz 8 TEKRAR / ÇIK button chrome stubs + the
 * RevealJingleHandle factory (in audio/destruction-audio-faz8.ts) —
 * Lane A / Lane B pick these up in Sprint 7 Phase 2B.
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
  WinExplorerHandle,
  GhostCursorHandle,
  Faz8RestartHintHandle,
  Faz8VolumetricSmokeHandle,
  Faz8TekrarButtonHandle,
  Faz8CikButtonHandle,
  Faz8TekrarButtonOptions,
  Faz8CikButtonOptions,
  Faz8ButtonHostKind,
  RevealJingleHandle,
  RevealJingleOptions,
} from './types.js';

/* Faz 2B — Windows Gezgini & "system32 sil" runner + chrome mounts
 * (Windows-only theatrical phase inserted between faz2 and faz3). */
export { runFaz2bExplorer } from './faz2b-explorer.js';
export { mountWinExplorer } from './chrome/win-explorer.js';
export { mountGhostCursor } from './chrome/_shared/ghost-cursor.js';

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
export type { BleedScheduleOptions, Bleed3ScheduleOptions, Bleed4ScheduleOptions } from './apartment-bleed.js';

/* Sprint 6 Phase 1 — Faz 8 reveal + son-ekran lane runners + chrome mounts.
 * Sprint 9.1 — mountFaz8Disclaimer export REMOVED (post-ship disclaimer
 * surface removal); chrome/faz8-disclaimer.ts deleted. */
export { startFaz8Reveal } from './faz8-reveal.js';
export { startFaz8SonEkran } from './faz8-son-ekran.js';
export { mountFaz8RestartHint } from './chrome/faz8-restart-hint.js';
export { mountFaz8VolumetricSmoke } from './chrome/faz8-volumetric-smoke.js';

/* Sprint 7 Phase 2B — Faz 8 TEKRAR / ÇIK action button chrome.
 * D-1 SINGLE FILE: both mount fns export from chrome/faz8-action-buttons.ts
 * (Phase 1 stubs `faz8-tekrar-button.ts` + `faz8-cik-button.ts` were
 * superseded by the merger). */
export {
  mountFaz8TekrarButton,
  mountFaz8CikButton,
} from './chrome/faz8-action-buttons.js';
