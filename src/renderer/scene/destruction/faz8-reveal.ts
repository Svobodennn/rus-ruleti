/**
 * Faz 8 — Reveal (50-55sn).
 *
 * Sprint 6 Phase 1 SCAFFOLD. PLAN §7 lines 290-303 narrative spec
 * (reveal portion only — son-ekran lives in faz8-son-ekran.ts).
 *
 * WHO CALLS THIS: destruction-director.ts (Sprint 6 extends the FSM
 *   with a `faz7 → faz8-reveal` transition; the director invokes
 *   `startFaz8Reveal` once Faz 7 hits its FAZ7_DURATION_MS cap).
 *   Single caller — no other module mounts the reveal.
 *
 * SHARED RESOURCES OWNED (per scene-destruction-constants.ts owner
 * decrees):
 *   - AMBIENT_RECOVERY_AUDIO_OWNER (destruction-audio's
 *     createAmbientRecoveryHandle, see destruction-audio-faz8.ts —
 *     Sprint 6 Phase 2B Lane A)
 *   - FAZ8_CAMERA_DOLLY_TIMER_OWNER (the rAF dolly-out envelope
 *     across the 5-second reveal window)
 *
 * CALLEES (Lane A fills these in Phase 2B):
 *   - destruction-audio.ts#createAmbientRecoveryHandle (audio bed
 *     fade-in via internal handle, NOT a direct audioBed surface
 *     call — keeps the AudioBed master state untouched so the
 *     existing Sprint 1 ambient layers stay intact under the
 *     reveal's recovery ramp)
 *   - lighting.ts#BulbLightHandle (bulb pulse normalisation —
 *     restore Sprint 1 14Hz ripple at full BULB_INTENSITY_PEAK after
 *     Faz 0 darken envelope drained it to 0)
 *   - camera dolly via PerspectiveCamera rotation/position param
 *     interpolation — kept inline rather than a dedicated helper
 *     since the envelope is one rAF loop
 *
 * Lane A Phase 2B implementation outline (the body this stub
 * replaces):
 *
 *   1. SILENCE PAUSE (0 → FAZ8_REVEAL_SILENCE_PAUSE_MS):
 *      - Hold destruction overlay opacity 1 (full black).
 *      - Disable all in-flight audio (apartmentBleed.dispose if
 *        still mounted; destructionAudio.* synth handles already
 *        torn down by Faz 7 dispose; this beat is the SILENCE).
 *
 *   2. CONCURRENT FADE-OUT + AUDIO RAMP-IN + CAMERA DOLLY-OUT
 *      (FAZ8_REVEAL_SILENCE_PAUSE_MS → FAZ8_REVEAL_DURATION_MS):
 *      a. Container opacity 1 → 0 over
 *         FAZ8_REVEAL_FADE_DURATION_MS (3sn linear).
 *      b. AmbientRecoveryHandle.fadeIn(FAZ8_REVEAL_AMBIENT_RAMP_MS).
 *      c. Bulb intensity 0 → Sprint 1 BULB_INTENSITY_PEAK over the
 *         same 3-second window; re-engage 14Hz ripple at completion.
 *      d. Camera dolly-out FAZ8_REVEAL_CAMERA_DOLLY_DEGREES across
 *         the full 5-second reveal window (linear rotation tween).
 *
 *   3. SETTLE (4sn → 5sn):
 *      - Hold the restored framing without further envelope
 *        movement so Faz 8 son-ekran takes over with a stable
 *        composition (no mid-envelope hand-off).
 *
 * Reduced-motion gate (designer Phase 2A §16 — Sprint 6 extends
 * the a11y matrix with Faz 8 rows):
 *   - Bypass the 3-second fade with an instant opacity 1 → 0 cut
 *     at FAZ8_REVEAL_SILENCE_PAUSE_MS.
 *   - Bypass the camera dolly (DOLLY_DEGREES forced to 0).
 *   - Audio ramp UNCHANGED — the recovery audio is a felt cue,
 *     not a motion surface, and silencing it would break the
 *     "after the storm" narrative beat.
 *
 * Target line count: ~140-180L when Lane A fills.
 *
 * PHASE 2B LANE A — kraken fills body
 */

import log from 'electron-log/renderer';
import type { PerspectiveCamera } from 'three';
import type { AudioBedHandle } from '../audio/audio-bed.js';
import type { DestructionAudioHandle } from '../audio/destruction-audio.js';
import type { BulbLightHandle } from '../lighting.js';
import type { OsVariant } from './types.js';

/**
 * Runner arg bag — destruction-director threads every dep the reveal
 * envelope mutates. `container` is the destruction overlay element
 * (the one with `.destruction-takeover` class set in
 * destruction-director.ts createOverlayElement); reveal owns the
 * opacity 1 → 0 envelope on this element.
 *
 * `audio` is the Sprint 1 AudioBed handle (for ambient layer
 * fade-in). `destructionAudio` carries the AudioContext + master tap
 * Lane A needs to construct the AmbientRecoveryHandle (Sprint 6
 * Phase 2B). `camera` + `lighting` are the Sprint 1/2 handles Faz 0
 * shake/darken touched; reveal restores them.
 */
export interface Faz8RevealRunArgs {
  readonly os: OsVariant;
  readonly signal: AbortSignal;
  readonly container: HTMLElement;
  readonly destructionAudio: DestructionAudioHandle;
  readonly audio: AudioBedHandle;
  readonly camera: PerspectiveCamera;
  readonly lighting: BulbLightHandle;
}

/**
 * Run the Faz 8 reveal envelope. Resolves at FAZ8_REVEAL_DURATION_MS
 * (5sn) or earlier on ESC-hold abort. Sprint 6 Phase 1 stub returns
 * `Promise.resolve()` immediately so the FSM scaffolding can be
 * exercised by the director without a real reveal body in place.
 *
 * Phase 2B Lane A fills the envelope per the implementation outline
 * in this file's JSDoc.
 */
export async function startFaz8Reveal(opts: Faz8RevealRunArgs): Promise<void> {
  // Phase 1 scaffold trace — when Lane A wires the body this log line
  // will be replaced with the real envelope start.
  log.info('faz8-reveal: scaffold entry (Phase 1 stub)', {
    os: opts.os,
    aborted: opts.signal.aborted,
  });
  return Promise.resolve();
}
