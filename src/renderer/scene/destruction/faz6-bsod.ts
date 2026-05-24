/**
 * Faz 6 — Kernel Panic / BSOD (37-44sn).
 *
 * Sprint 5 Phase 2B Lane B implementation. PLAN §7 lines 280-283 narrative.
 *
 * WHO CALLS THIS: destruction-director.ts runFaz4Through7 — single caller.
 *
 * SHARED RESOURCES OWNED (per scene-destruction-constants.ts owner decrees):
 *   - BSOD_BEEP_AUDIO_OWNER (destruction-audio.ts createBSODBeepHandle —
 *     square wave 800Hz, ADSR 5/0/1/195, single-fire on phase entry)
 *   - HEX_PANIC_DUMP_OWNER (Mac branch: 6Hz auto-scrolling hex log,
 *     internal generator delegated to mac-kernel-panic chrome via the
 *     panicLogProvider callback this runner constructs)
 *   - FROWNY_FLICKER_TIMER_OWNER (Win branch: 5Hz CRT flicker on `:(`
 *     glyph — Lane D chrome owns the setInterval lifecycle)
 *
 * SHARED RESOURCES CONSUMED (NOT owned — Faz 4 / Faz 5 registered them):
 *   - HDD_GRIND_AUDIO_OWNER: Faz 4 started, Faz 6 STOPS at phase end
 *   - FAN_OVERDRIVE_AUDIO_OWNER: Faz 4 started, Faz 6 sustains peak then STOPS
 *   - ELECTRICAL_BUZZ_AUDIO_OWNER: Faz 5 started, Faz 6 STOPS at phase end
 *
 * The sudden silence at Faz 6 end is the audio composition's load-bearing
 * beat — designer §15 frames it as "the audio anchor for the destruction
 * cuts out before the bootloop". Lane B's silence cascade is single-site
 * (this runner): every cross-faz audio handle is stopped here before the
 * Faz 7 transition. No Faz 7 stop logic for these handles.
 *
 * CALLEES:
 *   - chrome/mac-kernel-panic.ts#mountMacKernelPanic (Mac branch — Lane C)
 *   - chrome/win-bsod.ts#mountWinBsod (Win branch — Lane D)
 *   - destruction-audio.ts#createBSODBeepHandle
 *
 * Reduced-motion gate (designer Phase 2A §10 a11y matrix surfaces 30-34):
 *   - Mac hex-dump auto-scroll: pause (text stays visible, no motion) —
 *     Lane C chrome owns the implementation; this runner reads the gate
 *     and skips `animateHexDump()` if set.
 *   - Win frowny flicker: disable — same handoff; Lane D chrome respects
 *     the gate inside `startFrownyFlicker()`.
 *   - BSOD beep: -6dB-ish amplitude (createBSODBeepHandle's internal
 *     reduced-motion gate handles this).
 *
 * Target line count: ~200-250L.
 */

import {
  BSOD_BEEP_AUDIO_OWNER,
  ELECTRICAL_BUZZ_AUDIO_OWNER,
  FAN_OVERDRIVE_AUDIO_OWNER,
  FAZ6_DURATION_MS,
  FAZ6_FAN_OVERDRIVE_PEAK_GAIN,
  HDD_GRIND_AUDIO_OWNER,
  PREFERS_REDUCED_MOTION_QUERY,
} from '../../../shared/scene-destruction-constants.js';
import {
  createBSODBeepHandle,
  type DestructionAudioHandle,
} from '../audio/destruction-audio.js';
import { mountMacKernelPanic } from './chrome/mac-kernel-panic.js';
import { mountWinBsod } from './chrome/win-bsod.js';
import type { MacKernelPanicHandle, OsVariant, WinBsodHandle } from './types.js';

/** Win BSOD stop code per PLAN §7 line 282 — English convention, NOT i18n. */
const BSOD_STOP_CODE = 'CRITICAL_PROCESS_DIED';
/** Win BSOD stuck progress percent per PLAN §7 line 282 — "Progress %0 takılı". */
const BSOD_STUCK_PROGRESS_PCT = 0;
/** Hex-dump character count per address column (16 bytes = 8 hex chars). */
const HEX_ADDR_DIGITS = 16;
/** Hex bytes per dump row (Apple kernel-panic convention). */
const HEX_BYTES_PER_ROW = 16;
/** Hex-dump rows per page — Lane C scrolls these at FAZ6_HEX_DUMP_LINE_HZ. */
const HEX_DUMP_ROWS = 80;
/** Runner arg bag — director threads destructionAudio so Lane B can co-ord. */
export interface Faz6RunArgs {
  readonly os: OsVariant;
  readonly container: HTMLElement;
  readonly destructionAudio: DestructionAudioHandle;
  readonly signal: AbortSignal;
}

/**
 * Run the Faz 6 BSOD / kernel panic sequence. Resolves at FAZ6_DURATION_MS
 * or earlier on ESC-hold abort.
 *
 * Sequence (both OS branches):
 *   1. Mount OS-conditional chrome (mac-kernel-panic or win-bsod).
 *   2. Engage the OS-specific motion (hex-dump scroll OR frowny flicker).
 *   3. Build + register the BSOD beep handle in the owner pool, fire it once.
 *   4. Nudge fan-overdrive to peak gain (Lane A registered the handle).
 *   5. Wait FAZ6_DURATION_MS (or abort).
 *   6. SUDDEN SILENCE: stop fan-overdrive + HDD-grind + electrical-buzz
 *      + BSOD beep. The owner pool delivers the handles by decree constant;
 *      missing handles (Lane A not yet shipped runner) are no-ops.
 *   7. Dispose chrome.
 */
export async function startFaz6Bsod(args: Faz6RunArgs): Promise<void> {
  if (args.signal.aborted) return;
  const screen = mountOsBsodChrome(args.os, args.container, args.signal);
  engageOsMotion(args.os, screen);
  const bsodBeep = createBSODBeepHandle(
    args.destructionAudio.context,
    args.destructionAudio.destination,
  );
  args.destructionAudio.registerOwnedAudio(BSOD_BEEP_AUDIO_OWNER, bsodBeep);
  bsodBeep.play();
  sustainFanOverdrivePeak(args.destructionAudio);
  await waitForFaz6End(args.signal);
  silenceCrossFazAudio(args.destructionAudio);
  screen.dispose();
}

/* ------------------------------------------------------------------------ */
/* OS branching                                                             */
/* ------------------------------------------------------------------------ */

/**
 * Branch on OS variant and mount the appropriate chrome. The returned union
 * narrows downstream via the `kind` discriminator so the motion engagement
 * step picks the right method without an `as` cast.
 *
 * Mac branch builds a procedural hex-dump generator that Lane C's chrome
 * pulls via the `panicLogProvider` callback at FAZ6_HEX_DUMP_LINE_HZ. The
 * generator yields ONE complete dump (80 rows) per call; Lane C is
 * responsible for the auto-scroll RAF / setInterval over those rows.
 */
function mountOsBsodChrome(
  os: OsVariant,
  container: HTMLElement,
  signal: AbortSignal,
): MacKernelPanicHandle | WinBsodHandle {
  if (os === 'mac') {
    return mountMacKernelPanic({
      hostElement: container,
      panicLogProvider: generateHexPanicDump,
      signal,
    });
  }
  return mountWinBsod({
    hostElement: container,
    stopCode: BSOD_STOP_CODE,
    panicPercent: BSOD_STUCK_PROGRESS_PCT,
    signal,
  });
}

/**
 * Engage the OS-specific decorative motion. Narrows via the `kind`
 * discriminator. Reduced-motion gate is enforced INSIDE the chrome
 * (Lane C / Lane D respect `prefers-reduced-motion: reduce` at the
 * `animateHexDump` / `startFrownyFlicker` call sites). This runner
 * additionally checks the gate so we can short-circuit the call when
 * possible — defence-in-depth.
 */
function engageOsMotion(
  os: OsVariant,
  screen: MacKernelPanicHandle | WinBsodHandle,
): void {
  if (isReducedMotion()) return;
  if (os === 'mac' && screen.kind === 'mac-kernel-panic') {
    screen.animateHexDump();
    return;
  }
  if (os === 'win' && screen.kind === 'win-bsod') {
    screen.startFrownyFlicker();
  }
}

/* ------------------------------------------------------------------------ */
/* Audio coordination                                                       */
/* ------------------------------------------------------------------------ */

/**
 * Nudge Lane A's fan-overdrive handle to peak gain during Faz 6. Lane A's
 * Faz 4 createFanOverdriveHandle ramped to 0.8; Faz 6 lifts that to 0.9 so
 * the silence cascade at phase end has the maximum dynamic-range drop.
 *
 * If Lane A's runner has not yet shipped (Faz 4 stub still in place), the
 * owner pool returns `undefined` and this is a no-op — the silence cascade
 * still works because the handle simply does not exist to stop.
 */
function sustainFanOverdrivePeak(destructionAudio: DestructionAudioHandle): void {
  const fan = destructionAudio.getOwnedAudio(FAN_OVERDRIVE_AUDIO_OWNER);
  if (fan === undefined) return;
  if (fan.kind === 'fan-overdrive') {
    fan.setGain(FAZ6_FAN_OVERDRIVE_PEAK_GAIN);
  }
}

/**
 * SUDDEN SILENCE at Faz 6 end — designer §15 / directive §6.6.
 *
 * Stop every Faz 4 / Faz 5 audio surface that was sustaining into Faz 6,
 * plus the BSOD beep this runner registered. The owner pool delivers each
 * handle by decree constant; missing handles (Lane A or Lane B running
 * standalone) are silently skipped.
 *
 * Order: outer-faz surfaces first (HDD-grind, fan-overdrive, electrical-
 * buzz) then this faz's own BSOD beep. The order is cosmetic — Web Audio
 * ramps are independent — but reads as "the older noises die first, then
 * the newest". The dispose chain handles full cleanup; this is the
 * audible-stop step only.
 */
function silenceCrossFazAudio(destructionAudio: DestructionAudioHandle): void {
  const hdd = destructionAudio.getOwnedAudio(HDD_GRIND_AUDIO_OWNER);
  if (hdd?.kind === 'hdd-grind') hdd.stop();
  const fan = destructionAudio.getOwnedAudio(FAN_OVERDRIVE_AUDIO_OWNER);
  if (fan?.kind === 'fan-overdrive') fan.stop();
  const buzz = destructionAudio.getOwnedAudio(ELECTRICAL_BUZZ_AUDIO_OWNER);
  if (buzz?.kind === 'electrical-buzz') buzz.stop();
  const beep = destructionAudio.getOwnedAudio(BSOD_BEEP_AUDIO_OWNER);
  if (beep?.kind === 'bsod-beep') beep.dispose();
}

/* ------------------------------------------------------------------------ */
/* Procedural hex panic dump                                                */
/* ------------------------------------------------------------------------ */

/**
 * Generate one page (~80 lines) of Apple kernel-panic-style hex dump.
 *
 * Each row format (matches real macOS panic.log output):
 *   `0x7fa3b2c00d40: 48 89 e5 53 48 89 fb e8 7f f4 fe ff 48 8b 7d f8`
 *
 * The address column is a synthetic 16-hex-digit value; the byte columns
 * are 16 independently random 2-hex-digit values. Real macOS panic logs
 * page-walk from a base address by 16 per row; this synthetic version
 * uses fresh randomness per row so the visual flow reads "the memory is
 * being dumped from a different region" rather than "the same region
 * scrolling". For the joke app's purposes, the visual indistinguishable.
 *
 * Lane C's chrome calls this at FAZ6_HEX_DUMP_LINE_HZ and renders the
 * returned string into the auto-scrolling pre-element. Each call returns
 * a complete `\n`-joined page; Lane C decides whether to scroll char-by-
 * char or line-by-line within that page.
 */
function generateHexPanicDump(): string {
  const rows: string[] = [];
  for (let i = 0; i < HEX_DUMP_ROWS; i += 1) {
    rows.push(buildHexDumpRow());
  }
  return rows.join('\n');
}

/** Build a single hex dump row — address column + 16 hex bytes. */
function buildHexDumpRow(): string {
  const address = `0x${randomHex(HEX_ADDR_DIGITS)}`;
  const bytes: string[] = [];
  for (let i = 0; i < HEX_BYTES_PER_ROW; i += 1) {
    bytes.push(randomHex(2));
  }
  return `${address}: ${bytes.join(' ')}`;
}

/** Random hex string of `digits` characters, lowercase, zero-padded. */
function randomHex(digits: number): string {
  let out = '';
  for (let i = 0; i < digits; i += 1) {
    out += Math.floor(Math.random() * 16).toString(16);
  }
  return out;
}

/* ------------------------------------------------------------------------ */
/* Timing                                                                   */
/* ------------------------------------------------------------------------ */

/**
 * Wait for FAZ6_DURATION_MS to elapse OR signal to abort. Identical pattern
 * to faz1-critical-dialog.waitForFaz1End — kept local rather than shared
 * so Lane B's worktree is self-contained.
 */
function waitForFaz6End(signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve): void => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const timeoutId = setTimeout(resolve, FAZ6_DURATION_MS);
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
