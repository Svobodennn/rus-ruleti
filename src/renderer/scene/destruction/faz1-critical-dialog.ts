/**
 * Faz 1 — OS-spesifik Critical Dialog (2-7sn).
 *
 * Sprint 4 Phase 2B kraken-faz0-1 fill. Mounts the OS-conditional dialog
 * (Mac via swift-expert's `chrome/mac-dialog.ts` Lane C OR Win via
 * frontend-dev's `chrome/win-dialog.ts` Lane D) inside the destruction
 * container, plays the procedural native chord stub (designer §7 3-sine
 * envelope) once at entry, drives the Mac countdown via setInterval, and
 * disposes everything at FAZ_1_DIALOG_DURATION_MS or on ESC-hold abort.
 *
 * Reduced-motion gate (designer §8 matrix rows 7-10):
 *   - Modal entry opacity transition: instant (Lane C/D CSS responsibility).
 *   - Backdrop-filter blur transition: instant (Lane C/D CSS responsibility).
 *   - Countdown text update: unchanged (functional).
 *   - Native chord envelope: unchanged (audio gate is amplitude only).
 *
 * Called by: destruction-director.ts FSM step `faz0 → faz1` → await runFaz1.
 */

import type { DestructionAudioHandle } from '../audio/destruction-audio.js';
import type { MacDialogHandle, OsVariant, WinDialogHandle } from './types.js';
import { mountMacDialog } from './chrome/mac-dialog.js';
import { mountWinDialog } from './chrome/win-dialog.js';
import {
  DIALOG_COUNTDOWN_INTERVAL_MS,
  DIALOG_COUNTDOWN_START,
  FAZ_1_DIALOG_DURATION_MS,
} from '../../../shared/scene-destruction-constants';

/** Runner arg bag. */
export interface Faz1RunArgs {
  readonly os: OsVariant;
  readonly container: HTMLElement;
  readonly destructionAudio: DestructionAudioHandle;
  readonly signal: AbortSignal;
}

/**
 * Run the Faz 1 critical dialog. Resolves at FAZ_1_DIALOG_DURATION_MS or
 * earlier on ESC-hold abort. Mounts the OS-conditional dialog, plays the
 * native chord stub, drives the countdown, then disposes.
 */
export async function runFaz1(args: Faz1RunArgs): Promise<void> {
  if (args.signal.aborted) return;
  const handle = mountOsDialog(args.os, args.container);
  args.destructionAudio.playNativeChord();
  const countdownStop = startCountdownIfMac(args.os, handle);
  await waitForFaz1End(args.signal);
  countdownStop();
  handle.dispose();
}

/**
 * Branch on OS variant and mount the appropriate dialog. The returned union
 * type narrows downstream: the countdown driver only fires when the
 * `MacDialogHandle.setCountdown` method exists.
 */
function mountOsDialog(
  os: OsVariant,
  container: HTMLElement,
): MacDialogHandle | WinDialogHandle {
  if (os === 'mac') {
    return mountMacDialog(container, DIALOG_COUNTDOWN_START);
  }
  return mountWinDialog(container);
}

/**
 * Start the Mac countdown if this is a Mac dialog. Win has no countdown
 * (designer §3 Win variant explicitly omits per PLAN §7). Returns a stop
 * function that clears the setInterval.
 */
function startCountdownIfMac(
  os: OsVariant,
  handle: MacDialogHandle | WinDialogHandle,
): () => void {
  if (os !== 'mac') return (): void => undefined;
  const macHandle = handle as MacDialogHandle;
  let remaining = DIALOG_COUNTDOWN_START;
  const id = setInterval((): void => {
    remaining -= 1;
    if (remaining < 0) return;
    macHandle.setCountdown(remaining);
  }, DIALOG_COUNTDOWN_INTERVAL_MS);
  return (): void => clearInterval(id);
}

/**
 * Wait for FAZ_1_DIALOG_DURATION_MS to elapse OR signal to abort. Identical
 * pattern to faz0-bang.waitForFaz0End — kept local rather than shared
 * because the abort-trackers diverge per Faz (faz0 has multiple cue
 * timers, faz1 has only the gating timer + the countdown interval).
 */
function waitForFaz1End(signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const timeoutId = setTimeout(resolve, FAZ_1_DIALOG_DURATION_MS);
    signal.addEventListener(
      'abort',
      (): void => {
        clearTimeout(timeoutId);
        resolve();
      },
      { once: true },
    );
  });
}
