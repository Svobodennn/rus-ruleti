/**
 * Faz 7 — Bootloop (44-50sn).
 *
 * Sprint 5 Phase 2B Lane B implementation. PLAN §7 lines 285-288.
 *
 * WHO CALLS THIS: destruction-director.ts runFaz4Through7 — single caller.
 *
 * SHARED RESOURCES OWNED (per scene-destruction-constants.ts owner decrees):
 *   - BLEED_4_OWNER (apartment-bleed.ts scheduleBleed4 — 0.8sn LONGEST,
 *     revolver-on-table variant for designer §6 narrative payoff)
 *   - ELECTRICAL_TICK_AUDIO_OWNER (destruction-audio.ts
 *     createElectricalTickHandle @ FAZ7_ELECTRICAL_TICK_HZ = 0.5Hz)
 *   - BOOTLOOP_CYCLE_TIMER_OWNER (the while-loop in this runner; each
 *     iteration of the loop is one bootloop cycle, FAZ7_CYCLE_MS = 3000ms)
 *
 * CALLEES:
 *   - chrome/mac-bootloop.ts#mountMacBootloop (Mac branch — Lane C)
 *   - chrome/win-bios-bootloop.ts#mountWinBiosBootloop (Win branch — Lane D)
 *   - destruction-audio.ts#createElectricalTickHandle
 *   - apartment-bleed.ts#scheduleBleed4 (variant: 'revolver-on-table')
 *
 * State machine:
 *   Mac per cycle: 'apple-loading' (1sn) → 'frozen' (1sn) → 'no-boot' (1sn)
 *   Win per cycle: 'no-boot' (2sn) → 'restart-pending' (1sn)
 *
 * Per-cycle drift: progress bar fill drifts uniformly random within
 * FAZ7_PROGRESS_DRIFT_RANGE = [38, 42]% so each cycle reads "different
 * attempt, same failure pattern" rather than "the same frame repeats".
 *
 * Termination: loops until performance.now() - phaseStart >= FAZ7_DURATION_MS
 * (6000ms) OR signal.aborted. Sprint 6 will replace the duration cap with a
 * reveal hand-off so Faz 8 can take over.
 *
 * Reduced-motion gate (designer Phase 2A §10 a11y matrix surfaces 35-37):
 *   - Mac bootloop cycle: bypass the cycle; mount once, hold STATE 3
 *     (⊘ + "No bootable OS found" caption) for the full 6-second window.
 *   - Win bootloop cycle: bypass the cycle; hold "No bootable device"
 *     for the full 6 seconds.
 *   - Bleed #4 strobe: handled inside scheduleBleed4 (0.6 opacity static
 *     hold; the revolver-on-desk composite STAYS visible — narrative-
 *     payoff bleed is gated by hold, not by skip).
 *   - Electrical-tick audio: handled inside createElectricalTickHandle
 *     (peak gain 0.2).
 *
 * Target line count: ~180-220L.
 */

import log from 'electron-log/renderer';
import {
  BLEED_4_OWNER,
  BOOTLOOP_CYCLE_TIMER_OWNER,
  ELECTRICAL_TICK_AUDIO_OWNER,
  FAZ7_DURATION_MS,
  FAZ7_MAC_APPLE_LOADING_MS,
  FAZ7_MAC_FROZEN_MS,
  FAZ7_MAC_NO_BOOT_MS,
  FAZ7_PROGRESS_DRIFT_RANGE,
  FAZ7_WIN_NO_BOOT_MS,
  FAZ7_WIN_RESTART_PENDING_MS,
  PREFERS_REDUCED_MOTION_QUERY,
} from '../../../shared/scene-destruction-constants.js';
import {
  createElectricalTickHandle,
  type DestructionAudioHandle,
} from '../audio/destruction-audio.js';
import { scheduleBleed4 } from './apartment-bleed.js';
import { mountMacBootloop } from './chrome/mac-bootloop.js';
import { mountWinBiosBootloop } from './chrome/win-bios-bootloop.js';
import type {
  ApartmentBleedHandle,
  MacBootloopHandle,
  OsVariant,
  WinBiosBootloopHandle,
} from './types.js';

/** Bleed #4 trigger offset within Faz 7 — 3 sec in (PLAN §7 line 288 → 48sn absolute). */
const BLEED_4_FAZ7_OFFSET_MS = 3000;
/** Reduced-motion fallback: mount one bootloop screen, hold final state. */
const REDUCED_MOTION_HOLD_STATE_MAC = 'no-boot' as const;
const REDUCED_MOTION_HOLD_STATE_WIN = 'no-boot' as const;

/**
 * Runner arg bag — director threads destructionAudio + lobbySnapshotDataUrl.
 *
 * `lobbySnapshotDataUrl` is the Faz 0 capture used by all four bleeds; the
 * bleed #4 compositor lays a "revolver-on-table" overlay atop this snapshot.
 * If the capture failed at scene mount the value is undefined; the bleed
 * still mounts but reads as a black flicker rather than the apartment leak.
 */
export interface Faz7RunArgs {
  readonly os: OsVariant;
  readonly container: HTMLElement;
  readonly destructionAudio: DestructionAudioHandle;
  readonly lobbySnapshotDataUrl: string | undefined;
  readonly signal: AbortSignal;
}

/**
 * Run the Faz 7 bootloop sequence. Resolves at FAZ7_DURATION_MS or earlier
 * on ESC-hold abort. Loops the OS-specific bootloop cycle while honouring
 * the abort signal at every sleep boundary.
 */
export async function startFaz7Bootloop(args: Faz7RunArgs): Promise<void> {
  if (args.signal.aborted) return;
  log.info(
    'faz7-bootloop: start',
    `os=${args.os} reducedMotion=${isReducedMotion() ? '1' : '0'}`,
    `owner=${BOOTLOOP_CYCLE_TIMER_OWNER}`,
  );
  const electricalTick = startElectricalTick(args.destructionAudio);
  const bleed4 = scheduleBleed4WithLog(args);
  try {
    await runBootloopCycles(args);
  } finally {
    electricalTick.stop();
    electricalTick.dispose();
    bleed4.dispose();
  }
}

/* ------------------------------------------------------------------------ */
/* Audio + bleed scheduling                                                 */
/* ------------------------------------------------------------------------ */

/**
 * Build + start the Faz 7 electrical-tick handle. Registered into the owner
 * pool under ELECTRICAL_TICK_AUDIO_OWNER so the director's dispose chain
 * walks it on ESC-hold abort.
 *
 * Reduced-motion: createElectricalTickHandle internal gate drops peak gain
 * to 0.2 (designer §15 lets the tick survive at reduced amplitude — Lane B
 * mirrors that rather than full silence so the audio composition still has
 * the trickle-current motif).
 */
function startElectricalTick(
  destructionAudio: DestructionAudioHandle,
): ReturnType<typeof createElectricalTickHandle> {
  const tick = createElectricalTickHandle(
    destructionAudio.context,
    destructionAudio.destination,
  );
  destructionAudio.registerOwnedAudio(ELECTRICAL_TICK_AUDIO_OWNER, tick);
  tick.start();
  return tick;
}

/**
 * Schedule bleed #4 with a delay relative to Faz 7 entry. The bleed fires
 * `BLEED_4_FAZ7_OFFSET_MS` (3000ms) after the runner starts, lands as the
 * 0.8sn longest-bleed-in-the-sequence revolver-on-table composite over the
 * lobby snapshot.
 *
 * Owner: BLEED_4_OWNER = 'faz7-bootloop' — single-caller decree. Lane A's
 * scheduleBleed3 + Lane B's scheduleBleed4 share the apartment-bleed
 * module surface but each has exactly one calling runner.
 */
function scheduleBleed4WithLog(args: Faz7RunArgs): ApartmentBleedHandle {
  log.info(
    'faz7-bootloop: schedule bleed #4',
    `delay=${String(BLEED_4_FAZ7_OFFSET_MS)}ms`,
    `owner=${BLEED_4_OWNER}`,
  );
  return scheduleBleed4({
    caller: BLEED_4_OWNER,
    hostElement: args.container,
    signal: args.signal,
    variant: 'revolver-on-table',
    delayMs: BLEED_4_FAZ7_OFFSET_MS,
    lobbySnapshotDataUrl: args.lobbySnapshotDataUrl,
  });
}

/* ------------------------------------------------------------------------ */
/* Bootloop cycle dispatcher                                                */
/* ------------------------------------------------------------------------ */

/**
 * Top-level cycle loop. Branches on reduced-motion: under the gate we
 * mount a single bootloop screen and hold the final state for the full
 * Faz 7 duration; otherwise we step through the OS-specific state machine
 * across multiple cycles until duration or abort.
 */
async function runBootloopCycles(args: Faz7RunArgs): Promise<void> {
  if (isReducedMotion()) {
    await runBootloopReducedMotion(args);
    return;
  }
  await runBootloopFullMotion(args);
}

/**
 * Reduced-motion fallback: mount one screen, hold the terminal state for
 * the full window. The state-3 frame (Mac: ⊘ + "No bootable OS found"; Win:
 * "No bootable device — Press F1 retry, F2 setup") is the most semantically
 * informative still; it tells the screen-reader user "this is the failure
 * mode" without forcing motion through the 3-state cycle.
 */
async function runBootloopReducedMotion(args: Faz7RunArgs): Promise<void> {
  const screen = mountOsBootloop(args);
  try {
    if (args.os === 'mac' && screen.kind === 'mac-bootloop') {
      screen.setState(REDUCED_MOTION_HOLD_STATE_MAC);
    } else if (args.os === 'win' && screen.kind === 'win-bios-bootloop') {
      screen.setState(REDUCED_MOTION_HOLD_STATE_WIN);
    }
    await sleep(FAZ7_DURATION_MS, args.signal);
  } finally {
    screen.dispose();
  }
}

/**
 * Full-motion bootloop loop. Cycles through the OS-specific state machine
 * until duration or abort. Each cycle:
 *   - Mounts a fresh OS bootloop screen.
 *   - Steps through states with explicit sleeps (each sleep honours abort).
 *   - Disposes the screen at cycle end.
 *
 * The per-cycle re-mount is a Sprint 5 readability choice — a "single mount
 * + state cycling" implementation would be possible but reading the cycle
 * boundary in the log timeline is easier when each cycle has its own mount.
 */
async function runBootloopFullMotion(args: Faz7RunArgs): Promise<void> {
  const phaseStart = performance.now();
  let cycleIndex = 0;
  while (!args.signal.aborted) {
    const elapsed = performance.now() - phaseStart;
    if (elapsed >= FAZ7_DURATION_MS) break;
    const driftPct = sampleProgressDrift();
    const screen = mountOsBootloop(args);
    try {
      if (args.os === 'mac' && screen.kind === 'mac-bootloop') {
        await runMacCycle(screen, driftPct, args.signal);
      } else if (args.os === 'win' && screen.kind === 'win-bios-bootloop') {
        await runWinCycle(screen, args.signal);
      }
    } finally {
      screen.dispose();
    }
    cycleIndex += 1;
  }
  log.info('faz7-bootloop: cycles complete', `count=${String(cycleIndex)}`);
}

/** Mount the OS-specific bootloop chrome. */
function mountOsBootloop(
  args: Faz7RunArgs,
): MacBootloopHandle | WinBiosBootloopHandle {
  if (args.os === 'mac') {
    return mountMacBootloop({
      hostElement: args.container,
      signal: args.signal,
    });
  }
  return mountWinBiosBootloop({
    hostElement: args.container,
    signal: args.signal,
  });
}

/* ------------------------------------------------------------------------ */
/* Per-OS cycle scripts                                                     */
/* ------------------------------------------------------------------------ */

/**
 * Mac bootloop cycle — 3 states × 1sn each. Progress drift is set in the
 * 'apple-loading' state before the ramp + freeze; the chrome uses it to
 * land the freeze position at FAZ7_PROGRESS_DRIFT_RANGE [38,42]% rather
 * than a fixed FAZ7_PROGRESS_FREEZE_PERCENT.
 */
async function runMacCycle(
  screen: MacBootloopHandle,
  driftPct: number,
  signal: AbortSignal,
): Promise<void> {
  screen.setState('apple-loading');
  screen.setProgressDrift(driftPct);
  await sleep(FAZ7_MAC_APPLE_LOADING_MS, signal);
  if (signal.aborted) return;
  screen.setState('frozen');
  await sleep(FAZ7_MAC_FROZEN_MS, signal);
  if (signal.aborted) return;
  screen.setState('no-boot');
  await sleep(FAZ7_MAC_NO_BOOT_MS, signal);
}

/**
 * Win bootloop cycle — 2 states. PLAN §7 line 287: "No bootable device …
 * 3sn sonra otomatik tekrar." Designer §14 splits the 3sn into "no-boot"
 * (2sn the caption holds visible) + "restart-pending" (1sn the brief
 * black flash before the cycle restarts).
 */
async function runWinCycle(
  screen: WinBiosBootloopHandle,
  signal: AbortSignal,
): Promise<void> {
  screen.setState('no-boot');
  await sleep(FAZ7_WIN_NO_BOOT_MS, signal);
  if (signal.aborted) return;
  screen.setState('restart-pending');
  await sleep(FAZ7_WIN_RESTART_PENDING_MS, signal);
}

/* ------------------------------------------------------------------------ */
/* Helpers                                                                  */
/* ------------------------------------------------------------------------ */

/**
 * Sample a per-cycle progress-bar drift percent within
 * FAZ7_PROGRESS_DRIFT_RANGE. Designer §14: uniform random sampling reads
 * as "different attempt every time"; a deterministic sequence would read
 * as "engineered" which breaks the bootloop illusion.
 */
function sampleProgressDrift(): number {
  const [floor, ceil] = FAZ7_PROGRESS_DRIFT_RANGE;
  return floor + Math.random() * (ceil - floor);
}

/**
 * Sleep `ms` milliseconds, but resolve immediately if signal is already
 * aborted OR resolve early when signal aborts during the wait. Pattern
 * matches faz1-critical-dialog.waitForFaz1End / faz6-bsod.waitForFaz6End.
 */
function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve): void => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const timeoutId = setTimeout(resolve, ms);
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

/** Reduced-motion matchMedia query — single-source-of-truth via constants. */
function isReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;
}
