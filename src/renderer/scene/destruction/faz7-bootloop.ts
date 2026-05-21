/**
 * Faz 7 — Bootloop (44-50sn). Sprint 5 Phase 1 STUB.
 *
 * WHO CALLS THIS: destruction-director.ts step('faz7') — single caller.
 *
 * SHARED RESOURCES OWNED (per scene-destruction-constants.ts owner decrees):
 *   - BLEED_4_OWNER (apartment-bleed.ts scheduleBleed4 — 0.8sn LONGEST,
 *     revolver-on-table variant for designer §6 narrative payoff)
 *   - ELECTRICAL_TICK_AUDIO_OWNER (destruction-audio.ts
 *     createElectricalTickHandle @ FAZ7_ELECTRICAL_TICK_HZ = 0.5Hz)
 *   - BOOTLOOP_CYCLE_TIMER_OWNER (setInterval @ FAZ7_CYCLE_MS = 3000ms
 *     cycling the FSM cycleIndex via destruction-state.onFaz7CycleAdvance)
 *
 * CALLEES (Phase 2B Lane B will wire):
 *   - chrome/mac-bootloop.ts#mountMacBootloop (Mac branch)
 *   - chrome/win-bios-bootloop.ts#mountWinBiosBootloop (Win branch)
 *   - destruction-audio.ts#createElectricalTickHandle
 *   - apartment-bleed.ts#scheduleBleed4 (variant: 'revolver-on-table')
 *
 * SPRINT 5 LANE: B — Lane B picks up Faz 6 + Faz 7 together (terminal
 * phases, shared electrical sound design + bleed #4 payoff).
 *
 * Bootloop visual specs (PLAN §7 lines 285-288):
 *   - Mac: Apple logo + progress bar yarıda donar → ⊘ → "No bootable OS
 *     found".
 *   - Win: Mavi BIOS → "No bootable device — Press F1 retry, F2 setup".
 *     3sn sonra otomatik tekrar, loop.
 *   - Apartman bleed #4: 48sn'de 0.8sn — masa, ampul, revolver. Revolver
 *     bu sefer FARKLI — namlusu masaya bakıyor (designer §6 narrative
 *     payoff — what was being aimed in earlier scenes is now resting on
 *     the desk, visible through the bleed).
 *
 * Loop cycle: 3sn per iteration, indefinite until signal aborted OR
 * Sprint 6 Faz 8 reveal takes over. The director's onFaz6Complete
 * transitions to faz7 with cycleIndex=0; Lane B's setInterval ticks the
 * counter via destruction-state.onFaz7CycleAdvance every FAZ7_CYCLE_MS.
 *
 * Reduced-motion gate (designer Phase 2A §10 a11y matrix):
 *   - Mac progress-bar drift: disable (bar stays at FREEZE_PERCENT).
 *   - Bleed #4 strobe: 0.8sn opacity 0.6 hold (no strobe).
 *   - Electrical-tick audio: silence (functional cue, not necessary).
 *
 * TODO Sprint 5 Lane B: replace stub body with: OS branch + mount bootloop
 * chrome + start cycle setInterval + ticking progress drift (Mac) or state
 * transitions no-boot/restart-pending (Win) + schedule bleed #4 with
 * revolver-on-table variant + start electrical-tick audio + run open-ended
 * until signal aborted. Target ~180-220L.
 */

/* eslint-disable @typescript-eslint/no-unused-vars -- Sprint 5 Lane B fills this stub. */

import type { OsVariant } from './types.js';

/** Runner arg bag. */
export interface Faz7RunArgs {
  readonly os: OsVariant;
  readonly container: HTMLElement;
  readonly signal: AbortSignal;
}

/**
 * Run the Faz 7 bootloop sequence. Resolves at FAZ7_DURATION_MS or
 * earlier on ESC-hold abort. Stub returns immediately. NOTE: Sprint 5
 * Phase 1 keeps the contract simple (Promise<void>); Lane B will decide
 * whether to expose cycleIndex via callback if Sprint 6 reveal hand-off
 * needs it.
 */
export async function startFaz7Bootloop(_args: Faz7RunArgs): Promise<void> {
  // TODO Sprint 5 Lane B: implement bootloop per directive §4.2.
  return Promise.resolve();
}
