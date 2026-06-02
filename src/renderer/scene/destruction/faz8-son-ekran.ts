/**
 * Faz 8 — Son ekran (55-65sn).
 *
 * Sprint 6 Phase 1 SCAFFOLD. PLAN §7 lines 290-303 narrative spec
 * (closing tableau portion — reveal lives in faz8-reveal.ts).
 *
 * WHO CALLS THIS: destruction-director.ts (Sprint 6 extends the FSM
 *   with a `faz8-reveal → faz8-son-ekran` transition; the director
 *   invokes `startFaz8SonEkran` once the reveal envelope resolves).
 *   Single caller — no other module mounts the son-ekran.
 *
 * SHARED RESOURCES OWNED (per scene-destruction-constants.ts owner
 * decrees):
 *   - DOOR_CLOSE_AUDIO_OWNER (destruction-audio's
 *     createDoorCloseAccentHandle, single-fire at
 *     FAZ8_SON_EKRAN_DOOR_CLOSE_AT_MS = 2sn into son-ekran)
 *   - FAZ8_DISCLAIMER_OWNER (chrome/faz8-disclaimer.ts — Cyrillic
 *     primary + Turkish subtitle; fades in at
 *     FAZ8_SON_EKRAN_DISCLAIMER_ENTER_MS = 3sn)
 *   - FAZ8_RESTART_HINT_OWNER (chrome/faz8-restart-hint.ts — R key
 *     hint text; fades in at
 *     FAZ8_SON_EKRAN_RESTART_HINT_ENTER_MS = 7sn; Sprint 6 scope
 *     boundary — TEKRAR/ÇIK BUTTON UI deferred to Sprint 7+)
 *   - FAZ8_VOLUMETRIC_SMOKE_OWNER (chrome/faz8-volumetric-smoke.ts
 *     — OPTIONAL second smoke column over revolver-on-table; Phase
 *     2A designer may drop)
 *
 * CALLEES (Lane A + Lane B fill these in Phase 2B):
 *   - destruction-audio.ts#createDoorCloseAccentHandle (Lane A)
 *   - chrome/faz8-disclaimer.ts#mountFaz8Disclaimer (Lane B)
 *   - chrome/faz8-restart-hint.ts#mountFaz8RestartHint (Lane B)
 *   - chrome/faz8-volumetric-smoke.ts#mountFaz8VolumetricSmoke
 *     (Lane B — OPTIONAL)
 *
 * Lane A Phase 2B implementation outline (the body this stub
 * replaces):
 *
 *   1. ENTRY (0sn into son-ekran):
 *      - Revolver-on-table framing is already held from reveal
 *        (the camera dolly-out resolved before this runner is
 *        invoked, so no further camera mutation).
 *      - Optional: mount Faz8VolumetricSmoke if Phase 2A designer
 *        retained the second smoke column.
 *
 *   2. DOOR-CLOSE ACCENT (2sn into son-ekran):
 *      - Trigger DoorCloseAccentHandle.trigger() — single-fire
 *        procedural synth (heavy low-frequency thump ≤ 80Hz, ~250ms
 *        envelope). Reduced-motion: -6dB amplitude.
 *
 *   3. DISCLAIMER FADE-IN (3sn into son-ekran):
 *      - Mount Faz8DisclaimerHandle with Cyrillic primary ("Это
 *        просто шутка.") + Turkish subtitle ("Bu sadece bir şaka.").
 *      - Fade in over FAZ8_SON_EKRAN_DISCLAIMER_FADE_IN_MS (1sn) to
 *        FAZ8_DISCLAIMER_OPACITY_MAX (0.9).
 *      - Lane 0 wires i18n keys; the text values above are Phase 1
 *        defaults — Lane 0 may override via setPrimaryText/Secondary.
 *
 *   4. RESTART-HINT FADE-IN (7sn into son-ekran):
 *      - Mount Faz8RestartHintHandle with bilingual hint ("R =
 *        TEKRAR" or equivalent). Fade to
 *        FAZ8_SON_EKRAN_RESTART_HINT_OPACITY (0.4).
 *      - SCOPE BOUNDARY: HINT TEXT only. Sprint 7+ replaces with
 *        TEKRAR/ÇIK BUTTON UI per PLAN §7 line 302.
 *
 *   5. HOLD (until FAZ8_SON_EKRAN_DURATION_MS or R-key restart):
 *      - The son-ekran holds the tableau indefinitely up to the
 *        10-second cap. If the user presses R the director's
 *        requestRestart() transitions back to faz8-reveal (kiosk-
 *        safe re-entry; no app.quit). If the user does nothing the
 *        runner resolves at FAZ8_SON_EKRAN_DURATION_MS and the
 *        director transitions to `aborted{completed}`.
 *
 * Reduced-motion gate (designer Phase 2A §16 — Sprint 6 extends):
 *   - Disclaimer fade-in becomes an instant opacity-cap snap at
 *     FAZ8_SON_EKRAN_DISCLAIMER_ENTER_MS.
 *   - Restart-hint fade-in becomes an instant opacity-cap snap at
 *     FAZ8_SON_EKRAN_RESTART_HINT_ENTER_MS.
 *   - Door-close audio amplitude -6dB (gate inside createDoorCloseAccentHandle).
 *   - Volumetric smoke OPTIONAL drop (Phase 2A); if shipped, the
 *     smoke column's reduced-motion gate skips spawn.
 *
 * Target line count: ~150-200L when Lane A + Lane B fill.
 *
 * PHASE 2B LANE A — kraken fills body
 */

import log from 'electron-log/renderer';
import type { DestructionAudioHandle } from '../audio/destruction-audio.js';
import type { OsVariant } from './types.js';

/**
 * Runner arg bag — destruction-director threads the dependencies
 * son-ekran needs. `container` is the destruction overlay element
 * (same one reveal faded out — kept around so son-ekran can use it
 * as the host for the disclaimer / restart-hint / smoke mounts).
 *
 * Lane A consumes `destructionAudio` for the DoorCloseAccentHandle
 * construct site. Lane B consumes `container` as the chrome handle
 * host element.
 */
export interface Faz8SonEkranRunArgs {
  readonly os: OsVariant;
  readonly signal: AbortSignal;
  readonly container: HTMLElement;
  readonly destructionAudio: DestructionAudioHandle;
}

/**
 * Run the Faz 8 son-ekran closing tableau. Resolves at
 * FAZ8_SON_EKRAN_DURATION_MS (10sn), earlier on ESC-hold abort, or
 * earlier on R-key restart (the director's requestRestart() aborts
 * the inner signal so this runner resolves and the FSM transitions
 * back to faz8-reveal).
 *
 * Sprint 6 Phase 1 stub returns `Promise.resolve()` immediately so
 * the FSM scaffolding can be exercised by the director without a
 * real son-ekran body in place.
 *
 * Phase 2B Lane A + Lane B fill the body per the implementation
 * outline in this file's JSDoc.
 */
export async function startFaz8SonEkran(
  opts: Faz8SonEkranRunArgs,
): Promise<void> {
  // Phase 1 scaffold trace — when Lane A wires the body this log
  // line will be replaced with the real son-ekran envelope start.
  log.info('faz8-son-ekran: scaffold entry (Phase 1 stub)', {
    os: opts.os,
    aborted: opts.signal.aborted,
  });
  return Promise.resolve();
}
