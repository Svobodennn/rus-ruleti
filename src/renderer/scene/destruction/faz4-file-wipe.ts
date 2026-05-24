/**
 * Faz 4 — File Wipe Progress (21-30sn). Sprint 5 Phase 2B Lane A FILL.
 *
 * WHO CALLS THIS: destruction-director.ts step('faz4') — single caller.
 *
 * SHARED RESOURCES OWNED (per scene-destruction-constants.ts owner decrees):
 *   - BLEED_3_OWNER (apartment-bleed.ts scheduleBleed3)
 *   - HDD_GRIND_AUDIO_OWNER (destruction-audio.ts createHDDGrindHandle)
 *   - FAN_OVERDRIVE_AUDIO_OWNER (destruction-audio.ts createFanOverdriveHandle)
 *   - PROGRESS_BAR_REGRESSION_TIMER_OWNER (setInterval @ FAZ4_PROGRESS_TICK_MS)
 *   - ETA_GROWTH_TIMER_OWNER (setInterval cycling FAZ4_ETA_GROWTH_STEPS)
 *   - ITEMS_REMAINING_TIMER_OWNER (setInterval decrementing the counter)
 *   - FILE_PATH_SCROLL_TIMER_OWNER (setInterval @ FAZ4_FILE_PATH_SCROLL_HZ)
 *
 * CALLEES:
 *   - chrome/mac-progress-dialog.ts#mountMacProgressDialog (Mac branch)
 *   - chrome/win-progress-dialog.ts#mountWinProgressDialog (Win branch)
 *   - destruction-audio.ts#createHDDGrindHandle (registered into owner pool;
 *     Faz 5 calls setVolume; Faz 6 stops in the silence cascade).
 *   - destruction-audio.ts#createFanOverdriveHandle (registered, sustains
 *     through Faz 5/6 at the runner's set gain).
 *   - apartment-bleed.ts#scheduleBleed3 (fires at FAZ4_BLEED3_TRIGGER_MS
 *     relative — designer §17 timing target ≈ 34sn absolute).
 *
 * Reduced-motion: handled by each callee (audio handles clamp peak gain;
 * progress-dialog CSS disables width transitions; the file-path readout
 * does NOT animate — the runner pushes whole strings).
 */

import {
  APARTMENT_BLEED_3_TRIGGER_MS,
  BLEED_3_OWNER,
  FAKE_FILE_PATHS_MAC,
  FAKE_FILE_PATHS_WIN,
  FAZ4_DURATION_MS,
  FAZ4_ETA_GROWTH_STEPS,
  FAZ4_FILE_PATH_SCROLL_HZ,
  FAZ4_ITEMS_REMAINING_INITIAL,
  FAZ4_PROGRESS_FLOOR_PERCENT,
  FAZ4_PROGRESS_INITIAL_PERCENT,
  FAZ4_PROGRESS_TICK_MS,
  FAZ4_START_MS,
  HDD_GRIND_AUDIO_OWNER,
  FAN_OVERDRIVE_AUDIO_OWNER,
  USERNAME_PLACEHOLDER,
} from '../../../shared/scene-destruction-constants.js';
import {
  createFanOverdriveHandle,
  createHDDGrindHandle,
  type DestructionAudioHandle,
} from '../audio/destruction-audio.js';
import { scheduleBleed3 } from './apartment-bleed.js';
import { createPathGenerator } from './faz3-typewriter.js';
import { mountMacProgressDialog } from './chrome/mac-progress-dialog.js';
import { mountWinProgressDialog } from './chrome/win-progress-dialog.js';
import type {
  MacProgressDialogHandle,
  OsVariant,
  WinProgressDialogHandle,
} from './types.js';

/* ------------------------------------------------------------------------ */
/* Public                                                                   */
/* ------------------------------------------------------------------------ */

/** Runner arg bag — extended to thread username + destructionAudio handle. */
export interface Faz4RunArgs {
  readonly os: OsVariant;
  readonly username: string;
  readonly container: HTMLElement;
  readonly destructionAudio: DestructionAudioHandle;
  readonly signal: AbortSignal;
}

/**
 * Relative offset (from Faz 4 entry) at which bleed #3 should fire. PLAN §7
 * line 278 specifies ~34sn absolute; Faz 4 starts at FAZ4_START_MS=21000ms,
 * so the offset is 13000ms. Encoded as a literal here (not exported through
 * the SSOT) because it is the DIFFERENCE between two SSOT constants; future
 * SSOT promotion is a one-line addition.
 */
const FAZ4_BLEED3_TRIGGER_MS = APARTMENT_BLEED_3_TRIGGER_MS - FAZ4_START_MS;
/** Items-remaining tick cadence (ms). Designer §12 — slow positive bias. */
const FAZ4_ITEMS_TICK_MS = 200;
/** Per-tick stochastic items-remaining delta range (positive bias = grows). */
const FAZ4_ITEMS_DELTA_MIN = -50;
const FAZ4_ITEMS_DELTA_MAX = 220;
/** Stochastic progress decrement range. Designer §12 — 1-3% per tick. */
const FAZ4_PROGRESS_DECREMENT_MIN = 1;
const FAZ4_PROGRESS_DECREMENT_MAX = 3;
/** ETA growth advance cadence. Steps cycle every FAZ4_DURATION_MS / steps. */
const FAZ4_ETA_ADVANCE_INTERVAL_MS = Math.floor(
  FAZ4_DURATION_MS / FAZ4_ETA_GROWTH_STEPS.length,
);
/** File-path scroll cadence (ms). 1000 / 12Hz ≈ 83ms. */
const FAZ4_FILE_PATH_TICK_MS = Math.floor(1000 / FAZ4_FILE_PATH_SCROLL_HZ);

/**
 * Run the Faz 4 file-wipe sequence. Resolves at FAZ4_DURATION_MS or
 * earlier on ESC-hold abort. Mounts the OS progress dialog, starts HDD
 * grind + fan overdrive audio (registered into the owner pool), schedules
 * bleed #3 at FAZ4_BLEED3_TRIGGER_MS, and drives four owner-decreed timers.
 */
export async function startFaz4FileWipe(args: Faz4RunArgs): Promise<void> {
  if (args.signal.aborted) return;
  const dialog = mountProgressDialog(args);
  const audio = registerFaz4Audio(args.destructionAudio);
  const bleed3 = scheduleBleed3({
    caller: BLEED_3_OWNER,
    signal: args.signal,
    hostElement: args.container,
    delayMs: FAZ4_BLEED3_TRIGGER_MS,
  });
  const timers = startFaz4Timers(dialog, args);
  await waitForFaz4End(args.signal);
  timers.forEach((id): void => clearInterval(id));
  bleed3.dispose();
  // NB: HDD-grind + fan-overdrive handles STAY ALIVE in the owner pool —
  // Faz 5 retrieves the HDD handle to call setVolume(0.85) and Faz 6
  // performs the final stop() in the silence cascade. We dispose only
  // the dialog here. `audio` is referenced via the registration side
  // effect alone.
  void audio;
  dialog.dispose();
}

/* ------------------------------------------------------------------------ */
/* Internals                                                                */
/* ------------------------------------------------------------------------ */

/** Mount the OS-specific progress dialog and return its handle. */
function mountProgressDialog(
  args: Faz4RunArgs,
): MacProgressDialogHandle | WinProgressDialogHandle {
  if (args.os === 'mac') {
    return mountMacProgressDialog({
      hostElement: args.container,
      initialProgress: FAZ4_PROGRESS_INITIAL_PERCENT,
      signal: args.signal,
    });
  }
  return mountWinProgressDialog({
    hostElement: args.container,
    initialProgress: FAZ4_PROGRESS_INITIAL_PERCENT,
    signal: args.signal,
  });
}

interface Faz4AudioRefs {
  readonly hdd: ReturnType<typeof createHDDGrindHandle>;
  readonly fan: ReturnType<typeof createFanOverdriveHandle>;
}

/**
 * Construct + start HDD grind and fan overdrive handles, then register
 * each into the destruction audio owner pool under the SSOT decree
 * constants. Sprint 5 cross-faz contract: HDD_GRIND_AUDIO_OWNER and
 * FAN_OVERDRIVE_AUDIO_OWNER both point at 'faz4-file-wipe'; only this
 * runner instantiates the handles. Faz 5/6 retrieve via `getOwnedAudio`.
 */
function registerFaz4Audio(audio: DestructionAudioHandle): Faz4AudioRefs {
  const hdd = createHDDGrindHandle(audio.context, audio.destination);
  const fan = createFanOverdriveHandle(audio.context, audio.destination);
  hdd.start();
  fan.start();
  audio.registerOwnedAudio(HDD_GRIND_AUDIO_OWNER, hdd);
  audio.registerOwnedAudio(FAN_OVERDRIVE_AUDIO_OWNER, fan);
  return { hdd, fan };
}

interface ProgressState {
  /** Current progress percent (regressive, floored at FAZ4_PROGRESS_FLOOR_PERCENT). */
  progress: number;
  /** Current items-remaining count (positive bias — grows over time). */
  items: number;
  /** ETA growth index — wraps at FAZ4_ETA_GROWTH_STEPS.length. */
  etaIdx: number;
}

/**
 * Spawn all four owner-decreed setInterval timers and return their IDs so
 * the runner can clear them at phase end. Each timer is independently
 * disposed by the parent .forEach(clearInterval) on Faz 4 exit (clean
 * teardown even mid-phase under signal abort).
 */
function startFaz4Timers(
  dialog: MacProgressDialogHandle | WinProgressDialogHandle,
  args: Faz4RunArgs,
): number[] {
  const state: ProgressState = {
    progress: FAZ4_PROGRESS_INITIAL_PERCENT,
    items: FAZ4_ITEMS_REMAINING_INITIAL,
    etaIdx: 0,
  };
  applyInitialETA(dialog, state);
  return [
    spawnProgressRegressionTimer(dialog, state, args.signal),
    spawnItemsRemainingTimer(dialog, state, args.signal),
    spawnEtaGrowthTimer(dialog, state, args.signal),
    spawnFilePathScrollTimer(dialog, args.os, args.username, args.signal),
  ];
}

/** Render the initial ETA + items count before any tick. */
function applyInitialETA(
  dialog: MacProgressDialogHandle | WinProgressDialogHandle,
  state: ProgressState,
): void {
  const firstStep = FAZ4_ETA_GROWTH_STEPS[0];
  if (firstStep !== undefined) {
    dialog.setEta(firstStep);
  }
  dialog.setItemsRemaining(state.items);
}

/** Stochastic decrement timer — progress regresses 1-3% per tick to floor. */
function spawnProgressRegressionTimer(
  dialog: MacProgressDialogHandle | WinProgressDialogHandle,
  state: ProgressState,
  signal: AbortSignal,
): number {
  return window.setInterval((): void => {
    if (signal.aborted) return;
    const delta = randInt(FAZ4_PROGRESS_DECREMENT_MIN, FAZ4_PROGRESS_DECREMENT_MAX);
    state.progress = Math.max(FAZ4_PROGRESS_FLOOR_PERCENT, state.progress - delta);
    dialog.setProgress(state.progress);
  }, FAZ4_PROGRESS_TICK_MS);
}

/** Items-remaining grows-as-we-go (positive bias stochastic delta). */
function spawnItemsRemainingTimer(
  dialog: MacProgressDialogHandle | WinProgressDialogHandle,
  state: ProgressState,
  signal: AbortSignal,
): number {
  return window.setInterval((): void => {
    if (signal.aborted) return;
    const delta = randInt(FAZ4_ITEMS_DELTA_MIN, FAZ4_ITEMS_DELTA_MAX);
    state.items = Math.max(0, state.items + delta);
    dialog.setItemsRemaining(state.items);
  }, FAZ4_ITEMS_TICK_MS);
}

/** ETA growth — cycles through FAZ4_ETA_GROWTH_STEPS, each visible for N ms. */
function spawnEtaGrowthTimer(
  dialog: MacProgressDialogHandle | WinProgressDialogHandle,
  state: ProgressState,
  signal: AbortSignal,
): number {
  return window.setInterval((): void => {
    if (signal.aborted) return;
    state.etaIdx = (state.etaIdx + 1) % FAZ4_ETA_GROWTH_STEPS.length;
    const step = FAZ4_ETA_GROWTH_STEPS[state.etaIdx];
    if (step !== undefined) {
      dialog.setEta(step);
    }
  }, FAZ4_ETA_ADVANCE_INTERVAL_MS);
}

/** File-path scrolling — 12Hz cycle through FAKE_FILE_PATHS_{MAC,WIN}. */
function spawnFilePathScrollTimer(
  dialog: MacProgressDialogHandle | WinProgressDialogHandle,
  os: OsVariant,
  username: string,
  signal: AbortSignal,
): number {
  const paths = os === 'mac' ? FAKE_FILE_PATHS_MAC : FAKE_FILE_PATHS_WIN;
  const next = createPathGenerator(paths, username, USERNAME_PLACEHOLDER);
  return window.setInterval((): void => {
    if (signal.aborted) return;
    const path = next();
    if (path !== undefined) {
      dialog.setFilePath(path);
    }
  }, FAZ4_FILE_PATH_TICK_MS);
}

/** Wait for FAZ4_DURATION_MS unless the signal aborts first. */
function waitForFaz4End(signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve): void => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const timeoutId = window.setTimeout(resolve, FAZ4_DURATION_MS);
    const onAbort = (): void => {
      window.clearTimeout(timeoutId);
      resolve();
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

/** Inclusive integer in [min, max]. */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
