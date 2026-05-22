/**
 * Faz 5 — Disk Format (30-37sn). Sprint 5 Phase 1 STUB.
 *
 * WHO CALLS THIS: destruction-director.ts step('faz5') — single caller.
 *
 * SHARED RESOURCES OWNED (per scene-destruction-constants.ts owner decrees):
 *   - ELECTRICAL_BUZZ_AUDIO_OWNER (destruction-audio.ts ambient buzz layer)
 *   - SECTOR_COUNTER_TIMER_OWNER (setInterval incrementing sector count)
 *   - SMART_ERROR_STREAM_TIMER_OWNER (setInterval streaming S.M.A.R.T.
 *     errors / bad-sector reallocations / SSD wear-level absurdities)
 *
 * SHARED RESOURCES CONSUMED (NOT owned — sourced from Faz 4 handle):
 *   - HDD-grind audio (sustained from Faz 4 — Faz 5 calls `setVolume` only,
 *     never re-constructs)
 *   - Fan-overdrive audio (sustained from Faz 4 — same contract)
 *
 * CALLEES (Phase 2B Lane A will wire):
 *   - Inline DOM construction (no chrome handle — disk-format is a
 *     black-screen takeover, not an OS-native dialog). Lane A may decide
 *     to extract chrome/disk-format-screen.ts if it grows beyond 200L.
 *   - destruction-audio.ts handle accessors for HDD-grind / fan-overdrive
 *     pass-through.
 *
 * SPRINT 5 LANE: A — Lane A picks up Faz 4 + Faz 5 together (shared
 * audio handles, sequential mount).
 *
 * Disk-format visual (PLAN §7 lines 274-277):
 *   - Full ekran: "ATTENTION: Low-level format in progress. Do not power
 *     off your computer."
 *   - "Wiping sector 8,492,103 / 2,000,000,000" — ticks at
 *     FAZ5_SECTOR_INCREMENT_PER_SEC.
 *   - Random satırlar (FAZ5_SMART_ERROR_INTERVAL_MS): "Bad sector.
 *     Reallocating.", "S.M.A.R.T. error: drive failing.", "WARN: SSD wear
 *     level 142%".
 *
 * Reduced-motion gate:
 *   - Sector counter: still ticks (functional info display, not motion).
 *   - S.M.A.R.T. error stream: throttle to 1/2 cadence (still readable).
 *   - Electrical-buzz audio: amplitude -6dB.
 *
 * TODO Sprint 5 Lane A: replace stub body with: full-screen takeover mount
 * + sector counter increment + S.M.A.R.T. error stream + electrical-buzz
 * audio start + bleed-3 (NOTE: bleed-3 is OWNED by faz4 — Faz 5 does NOT
 * schedule a bleed; PLAN says "Apartman bleed #3: 34sn" which is INSIDE
 * Faz 5 numerically but the scheduling responsibility was declared as
 * BLEED_3_OWNER='faz4-file-wipe' to give a single owner — Faz 4 schedules
 * the bleed at +13sn relative-to-bang to land at 34sn during Faz 5).
 * Target ~150-200L.
 */

/* eslint-disable @typescript-eslint/no-unused-vars -- Sprint 5 Lane A fills this stub. */

import type { DestructionAudioHandle } from '../audio/destruction-audio.js';
import type { OsVariant } from './types.js';

/**
 * Runner arg bag. `username` is needed for the Faz 5 disk-format file-path
 * scrolling readout (S.M.A.R.T. error stream references user-owned paths);
 * `destructionAudio` is required so this lane can:
 *  - retrieve the Faz 4 HDD-grind handle via owner-pool getOwnedAudio and
 *    setVolume to the louder Faz 5 grind reading (designer §15).
 *  - construct the Faz 5 electrical-buzz handle and register it under
 *    ELECTRICAL_BUZZ_AUDIO_OWNER.
 */
export interface Faz5RunArgs {
  readonly os: OsVariant;
  readonly username: string;
  readonly container: HTMLElement;
  readonly destructionAudio: DestructionAudioHandle;
  readonly signal: AbortSignal;
}

/**
 * Run the Faz 5 disk-format sequence. Resolves at FAZ5_DURATION_MS or
 * earlier on ESC-hold abort. Stub returns immediately — replaced by the
 * next commit's full implementation.
 */
export async function startFaz5DiskFormat(_args: Faz5RunArgs): Promise<void> {
  // TODO Sprint 5 Lane A: implement disk-format takeover per directive §4.2.
  return Promise.resolve();
}
