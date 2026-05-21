/**
 * Faz 4 — File Wipe Progress (21-30sn). Sprint 5 Phase 1 STUB.
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
 *   - FILE_PATH_SCROLL_TIMER_OWNER (rAF @ FAZ4_FILE_PATH_SCROLL_HZ)
 *
 * CALLEES (Phase 2B Lane A will wire):
 *   - chrome/mac-progress-dialog.ts#mountMacProgressDialog (Mac branch)
 *   - chrome/win-progress-dialog.ts#mountWinProgressDialog (Win branch)
 *   - destruction-audio.ts#createHDDGrindHandle
 *   - destruction-audio.ts#createFanOverdriveHandle
 *   - apartment-bleed.ts#scheduleBleed3
 *
 * SPRINT 5 LANE: A — Lane A picks up Faz 4 + Faz 5 (file wipe + disk format,
 * both share the HDD-grind + fan-overdrive audio bus).
 *
 * Reduced-motion gate (designer Phase 2A will codify in §10 a11y matrix):
 *   - Progress bar regression: unchanged (functional — the joke depends
 *     on seeing the bar go BACKWARDS).
 *   - File-path scroll: keep but cap at FAZ4_FILE_PATH_SCROLL_HZ / 4
 *     (still readable, much less strobe surface).
 *   - HDD-grind / fan-overdrive audio: amplitude -6dB (parallel to bang
 *     procedural fallback reduced-motion treatment).
 *
 * TODO Sprint 5 Lane A: replace stub body with: parallel-mount progress
 * dialog + start HDD-grind / fan-overdrive audio + schedule bleed #3 + run
 * the four owner-decree timers (progress regress, ETA growth, items remain,
 * file-path scroll) under signal-aborted teardown. Target ~200-250L.
 */

/* eslint-disable @typescript-eslint/no-unused-vars -- Sprint 5 Lane A fills this stub. */

import type { OsVariant } from './types.js';

/** Runner arg bag. Matches faz0/faz1/faz2/faz3 shape. */
export interface Faz4RunArgs {
  readonly os: OsVariant;
  readonly container: HTMLElement;
  readonly signal: AbortSignal;
}

/**
 * Run the Faz 4 file-wipe sequence. Resolves at FAZ4_DURATION_MS or
 * earlier on ESC-hold abort. Stub returns immediately — Lane A wires
 * the actual progress dialog + audio + bleed scheduling.
 */
export async function startFaz4FileWipe(_args: Faz4RunArgs): Promise<void> {
  // TODO Sprint 5 Lane A: implement file-wipe progression per directive §4.2.
  return Promise.resolve();
}
