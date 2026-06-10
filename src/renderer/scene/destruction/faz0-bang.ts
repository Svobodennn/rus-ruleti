/**
 * Faz 0 — BANG continuation (0-2sn).
 *
 * Sprint 4 Phase 2B kraken-faz0-1 fill. Picks up at the Sprint 2 bang-overlay
 * fade-to-black and owns the audio + camera + lighting side effects per
 * `destruction-direction.md` §2 timing table:
 *
 *   t=0    bang.ogg fires (or procedural fallback), radio fade starts,
 *          camera shake begins, bulb darken envelope begins.
 *   t=50   tinnitus OscillatorNode fade-in starts (100ms ramp).
 *   t=200  BiquadFilterNode low-pass cutoff exponential ramp 22kHz→700Hz.
 *   t=400  camera shake recovery complete.
 *   t=500  lowpass at full 700Hz cutoff (held through Faz 3).
 *   t=600  bulb intensity at 0.
 *   t=1200 radio static fully gone.
 *   t=2000 Faz 0 exit; Faz 1 entry.
 *
 * Reduced-motion gate (designer §8 matrix rows 1-5):
 *   - Camera shake amplitude=0 (handled inside `triggerCameraShake`).
 *   - Bulb darken duration shortened to BULB_DARKEN_REDUCED_MOTION_MS.
 *   - Tinnitus -18dB instead of -12dB (handled inside destruction-audio).
 *   - Low-pass ramp unchanged (audio gate is amplitude only — §8 row 4).
 *   - Radio fade unchanged (functional — §8 row 5).
 *
 * Called by: destruction-director.ts FSM step `idle → faz0` → await runFaz0.
 */

import type { PerspectiveCamera } from 'three';
import type { AudioBedHandle } from '../audio/audio-bed.js';
import type { DestructionAudioHandle } from '../audio/destruction-audio.js';
import type { BulbLightHandle } from '../lighting.js';
import { triggerCameraShake } from '../camera.js';
import {
  BANG_CAMERA_SHAKE_DEG,
  BANG_CAMERA_SHAKE_DURATION_MS,
  BULB_DARKEN_DURATION_MS,
  FAZ_0_BANG_DURATION_MS,
  PREFERS_REDUCED_MOTION_QUERY,
  RADIO_FADE_DURATION_MS,
} from '../../../shared/scene-destruction-constants';

/** Reduced-motion bulb darken — designer §8 row 2: 200ms snap. */
const BULB_DARKEN_REDUCED_MOTION_MS = 200;
/** Onset offset for tinnitus relative to t=0 (designer §7 row "Faz 0 +50ms"). */
const TINNITUS_ONSET_DELAY_MS = 50;
/** Onset offset for the lowpass cutoff ramp (designer §7 row "Faz 0 +200ms"). */
const LOW_PASS_ONSET_DELAY_MS = 200;

/**
 * Runner arg bag. The director threads in references to existing scene
 * subsystems (audio bed, camera, lighting) + the new destruction-audio
 * handle + an AbortSignal so ESC-hold can short-circuit mid-Faz.
 */
export interface Faz0RunArgs {
  readonly camera: PerspectiveCamera;
  readonly lighting: BulbLightHandle;
  readonly audio: AudioBedHandle;
  readonly destructionAudio: DestructionAudioHandle;
  readonly signal: AbortSignal;
}

/**
 * Run the Faz 0 BANG continuation. Resolves at FAZ_0_BANG_DURATION_MS or
 * earlier if `signal` aborts (ESC-hold). Sequence operates on absolute
 * offsets via setTimeout — the director threads cleanup through the abort
 * signal so a mid-sequence abort cancels all pending timers.
 */
export async function runFaz0(args: Faz0RunArgs): Promise<void> {
  if (args.signal.aborted) return;
  const reducedMotion = isReducedMotion();
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const onAbort = (): void => {
    for (const id of timers) clearTimeout(id);
    timers.clear();
  };
  args.signal.addEventListener('abort', onAbort, { once: true });

  scheduleFaz0Cues(args, reducedMotion, timers);
  await waitForFaz0End(args.signal, timers);
  args.signal.removeEventListener('abort', onAbort);
}

/**
 * Schedule every Faz 0 cue at its designer offset. Each cue registers its
 * setTimeout id with the shared abort-tracking Set so a late abort wipes
 * them in O(n).
 */
function scheduleFaz0Cues(
  args: Faz0RunArgs,
  reducedMotion: boolean,
  timers: Set<ReturnType<typeof setTimeout>>,
): void {
  fireInstantCues(args, reducedMotion);
  trackTimer(
    timers,
    setTimeout(() => args.destructionAudio.startTinnitus(), TINNITUS_ONSET_DELAY_MS),
  );
  trackTimer(
    timers,
    setTimeout(() => args.destructionAudio.applyLowPass(), LOW_PASS_ONSET_DELAY_MS),
  );
}

/**
 * Cues that fire at t=0: bang one-shot, radio fade, camera shake, bulb
 * darken. These are not setTimeouts — they run synchronously when the
 * director invokes runFaz0. Camera shake exposes its own disposer (reused
 * Sprint 1 helper) which is gated by the same prefers-reduced-motion check
 * inside `triggerCameraShake`.
 */
function fireInstantCues(args: Faz0RunArgs, reducedMotion: boolean): void {
  args.destructionAudio.playBang();
  // Post-ship: the shot ends the lobby — fade the whole ambient bed (drone +
  // bulb-hum + radio) to silence so the background music does not keep playing
  // through the destruction. The radio-static keeps its designed fade duration
  // via the explicit setLayerVolume below (last-write-wins on that layer).
  args.audio.fadeOutAmbient();
  args.audio.setLayerVolume('radio-static', 0, RADIO_FADE_DURATION_MS);
  triggerCameraShake(args.camera, BANG_CAMERA_SHAKE_DEG, BANG_CAMERA_SHAKE_DURATION_MS);
  const bulbDuration = reducedMotion
    ? BULB_DARKEN_REDUCED_MOTION_MS
    : BULB_DARKEN_DURATION_MS;
  rampBulbToZero(args.lighting, bulbDuration);
}

/**
 * RAF-driven linear ramp on `lighting.setBaseIntensityFactor` from 1.0 to 0
 * over `durationMs`. Self-cancels on completion. Sprint 1 lighting helper
 * `setBaseIntensityFactor` only takes a snapshot value — the ramp is done
 * here.
 */
function rampBulbToZero(lighting: BulbLightHandle, durationMs: number): void {
  const startMs = performance.now();
  const duration = Math.max(durationMs, 1);
  const tick = (): void => {
    const progress = Math.min(1, (performance.now() - startMs) / duration);
    lighting.setBaseIntensityFactor(1 - progress);
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/**
 * Wait for FAZ_0_BANG_DURATION_MS to elapse OR `signal` to abort, whichever
 * comes first. Resolves either way — the abort tracking already cleared
 * any in-flight cue timers.
 */
function waitForFaz0End(
  signal: AbortSignal,
  timers: Set<ReturnType<typeof setTimeout>>,
): Promise<void> {
  return new Promise<void>((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const id = setTimeout(() => {
      timers.delete(id);
      resolve();
    }, FAZ_0_BANG_DURATION_MS);
    timers.add(id);
    signal.addEventListener('abort', () => resolve(), { once: true });
  });
}

/** Track a setTimeout in the abort-cancellation set. */
function trackTimer(
  timers: Set<ReturnType<typeof setTimeout>>,
  id: ReturnType<typeof setTimeout>,
): void {
  timers.add(id);
}

/** matchMedia(prefers-reduced-motion: reduce) gate. */
function isReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;
}
