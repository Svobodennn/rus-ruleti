/**
 * Faz 6 — Kernel Panic / BSOD (37-44sn). Sprint 5 Phase 1 STUB.
 *
 * WHO CALLS THIS: destruction-director.ts step('faz6') — single caller.
 *
 * SHARED RESOURCES OWNED (per scene-destruction-constants.ts owner decrees):
 *   - BSOD_BEEP_AUDIO_OWNER (destruction-audio.ts createBSODBeepHandle)
 *   - HEX_PANIC_DUMP_OWNER (Mac branch: rAF auto-scrolling hex log)
 *   - FROWNY_FLICKER_TIMER_OWNER (Win branch: setInterval CRT flicker
 *     @ FAZ6_FROWNY_FLICKER_HZ)
 *
 * SHARED RESOURCES CONSUMED (NOT owned — sourced from Faz 4 handle):
 *   - Fan-overdrive audio (sustained from Faz 4 — Faz 6 silences at end
 *     before Faz 7 entry; calls `stop()` on the handle, never re-builds)
 *
 * CALLEES (Phase 2B Lane B will wire):
 *   - chrome/mac-kernel-panic.ts#mountMacKernelPanic (Mac branch)
 *   - chrome/win-bsod.ts#mountWinBsod (Win branch)
 *   - destruction-audio.ts#createBSODBeepHandle
 *
 * SPRINT 5 LANE: B — Lane B picks up Faz 6 + Faz 7 (terminal phases,
 * shared electrical-tick audio + bleed #4 revolver-payoff).
 *
 * BSOD visual specs (PLAN §7 lines 280-283):
 *   - Mac: Klasik kernel panic. 4 dilde (TR/EN/RU/JP) "You need to
 *     restart your computer". Üstte hex panic log dump (auto-scrolls).
 *   - Win: Win11 BSOD. Sad face `:(`. "Your PC ran into a problem…"
 *     Gerçek QR kod (S3 closure — `https://www.windows.com/stopcode`
 *     URL'ini içeren statik QR PNG, telif-safe). Stop code:
 *     `CRITICAL_PROCESS_DIED`. CRT frowny flicker.
 *
 * Real QR PNG: Win branch dynamically constructs `<img
 * src="./assets/destruction/win-bsod-qr.png">` in mountWinBsod (asset
 * shipped by Lane D — Phase 1 creates the assets/destruction/ directory
 * placeholder with .gitkeep). CSP `img-src 'self' data: blob:` covers
 * the PNG path (verified Phase 1).
 *
 * Reduced-motion gate (designer Phase 2A §10 a11y matrix):
 *   - Mac hex-dump auto-scroll: pause (text stays visible, no motion).
 *   - Win frowny flicker: disable (sad face stays solid).
 *   - BSOD beep: -6dB amplitude.
 *
 * TODO Sprint 5 Lane B: replace stub body with: OS branch + mount kernel
 * panic OR BSOD chrome + start hex dump animation (Mac) or frowny flicker
 * (Win) + play BSOD beep + silence fan-overdrive at end. Target ~200-250L.
 */

/* eslint-disable @typescript-eslint/no-unused-vars -- Sprint 5 Lane B fills this stub. */

import type { OsVariant } from './types.js';

/** Runner arg bag. */
export interface Faz6RunArgs {
  readonly os: OsVariant;
  readonly container: HTMLElement;
  readonly signal: AbortSignal;
}

/**
 * Run the Faz 6 BSOD / kernel panic sequence. Resolves at FAZ6_DURATION_MS
 * or earlier on ESC-hold abort. Stub returns immediately.
 */
export async function startFaz6Bsod(_args: Faz6RunArgs): Promise<void> {
  // TODO Sprint 5 Lane B: implement BSOD / kernel panic per directive §4.2.
  return Promise.resolve();
}
