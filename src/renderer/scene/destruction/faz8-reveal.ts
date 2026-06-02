/**
 * Faz 8 — Reveal (50-55sn).
 *
 * Sprint 6 Phase 2B Lane A fill. PLAN §7 lines 290-303 narrative spec
 * (reveal portion only — son-ekran lives in faz8-son-ekran.ts).
 *
 * WHO CALLS THIS: destruction-director.ts (Sprint 6 extends the FSM
 *   with a `faz7 → faz8-reveal` transition; the director invokes
 *   `startFaz8Reveal` once Faz 7 hits its FAZ7_DURATION_MS cap).
 *   Single caller — no other module mounts the reveal.
 *
 * SHARED RESOURCES OWNED (per scene-destruction-constants.ts owner
 * decrees):
 *   - AMBIENT_RECOVERY_AUDIO_OWNER (the AmbientRecoveryHandle is
 *     constructed at reveal entry and registered into the audio
 *     owner pool so the director's disposeSequenceArtifacts walks
 *     it down at teardown).
 *   - FAZ8_CAMERA_DOLLY_TIMER_OWNER (the rAF dolly-out envelope
 *     across the 5-second reveal window — managed inline since the
 *     envelope is a single rAF loop with a self-cancelling abort
 *     handler).
 *
 * Body sequence (this fill — matches Phase 1 outline JSDoc):
 *
 *   1. SILENCE PAUSE (0 → FAZ8_REVEAL_SILENCE_PAUSE_MS):
 *      - sleepWithAbort 1 second. Overlay stays opaque black.
 *
 *   2. CONCURRENT FADE-OUT + AUDIO RAMP-IN + CAMERA DOLLY
 *      (FAZ8_REVEAL_SILENCE_PAUSE_MS → FAZ8_REVEAL_DURATION_MS):
 *      a. Toggle container.classList `is-fading-out` so Lane B
 *         CSS keyframes drive opacity 1 → 0 over
 *         FAZ8_REVEAL_FADE_DURATION_MS (3sn).
 *      b. AmbientRecoveryHandle.fadeIn(FAZ8_REVEAL_AMBIENT_RAMP_MS).
 *      c. Bulb intensity 0 → 1 over the same 3-second window via
 *         lighting.setBaseIntensityFactor rAF loop (mirrors faz0-bang
 *         rampBulbToZero pattern, reversed direction).
 *      d. Camera dolly-out via inline rAF on camera.position.z over
 *         the full 5-second reveal window.
 *
 *   3. SETTLE (FADE complete → FAZ8_REVEAL_DURATION_MS):
 *      - Hold restored framing. sleepWithAbort runs out the final
 *        seconds so the son-ekran takes over with a stable composition.
 *
 * Reduced-motion gate (designer Phase 2A §16):
 *   - Camera dolly skipped entirely (FAZ8_REVEAL_CAMERA_DOLLY_DEGREES
 *     forced to 0 inside the dolly tick).
 *   - Bulb pulse normalisation still runs (felt cue, not a motion
 *     surface — designer §16 carries Faz 0 reduced-motion gate
 *     forward; bulb intensity restore IS the resting state).
 *   - Overlay fade-out: Lane B CSS @media gates the keyframe via
 *     `prefers-reduced-motion: reduce` — the chrome handles it; this
 *     runner only toggles the class.
 *   - Audio ramp UNCHANGED — recovery audio is a felt cue.
 */

import log from 'electron-log/renderer';
import type { PerspectiveCamera } from 'three';
import type { AudioBedHandle } from '../audio/audio-bed.js';
import type {
  AmbientRecoveryHandle,
  DestructionAudioHandle,
} from '../audio/destruction-audio.js';
import { createAmbientRecoveryHandle } from '../audio/destruction-audio-faz8.js';
import type { BulbLightHandle } from '../lighting.js';
import {
  AMBIENT_RECOVERY_AUDIO_OWNER,
  FAZ8_REVEAL_AMBIENT_RAMP_MS,
  FAZ8_REVEAL_CAMERA_DOLLY_DEGREES,
  FAZ8_REVEAL_DURATION_MS,
  FAZ8_REVEAL_FADE_DURATION_MS,
  FAZ8_REVEAL_SILENCE_PAUSE_MS,
  PREFERS_REDUCED_MOTION_QUERY,
} from '../../../shared/scene-destruction-constants.js';
import type { OsVariant } from './types.js';

/** CSS class Lane B keyframes engage off for the overlay fade-out. */
const FAZ8_REVEAL_OVERLAY_CLASS = 'is-fading-out';
/** Sprint 1 baseline bulb factor — `1.0` restores BULB_LIGHT.intensity. */
const FAZ8_BULB_BASELINE_FACTOR = 1;

/**
 * Runner arg bag — destruction-director threads every dep the reveal
 * envelope mutates. `container` is the destruction overlay element
 * (the one with `.destruction-takeover` class set in
 * destruction-director.ts createOverlayElement); reveal owns the
 * opacity 1 → 0 envelope on this element.
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
 * (5sn) or earlier on ESC-hold abort. Body fills the Phase 1 outline
 * — silence pause, concurrent fade/dolly/audio/bulb envelopes, settle.
 */
export async function startFaz8Reveal(opts: Faz8RevealRunArgs): Promise<void> {
  if (opts.signal.aborted) return;
  log.info('faz8-reveal: start', { os: opts.os });
  const reducedMotion = isReducedMotion();

  // 1. Silence pause — 1sn full black + silence (no envelopes start).
  await sleepWithAbort(FAZ8_REVEAL_SILENCE_PAUSE_MS, opts.signal);
  if (opts.signal.aborted) return;

  // 2. Concurrent envelopes — kick all four off and wait for the longest.
  const ambient = constructAndRegisterAmbientRecovery(opts);
  triggerOverlayFadeOut(opts.container);
  void ambient.fadeIn(FAZ8_REVEAL_AMBIENT_RAMP_MS);
  rampBulbToBaseline(opts.lighting, FAZ8_REVEAL_FADE_DURATION_MS);
  const dollyDisposer = startCameraDolly(opts, reducedMotion);

  // 3. Settle — wait remaining window (4sn after silence pause completes).
  const remainingMs = FAZ8_REVEAL_DURATION_MS - FAZ8_REVEAL_SILENCE_PAUSE_MS;
  await sleepWithAbort(remainingMs, opts.signal);
  dollyDisposer();
}

/**
 * Construct the AmbientRecoveryHandle via the caller-typed factory
 * and register into the destruction audio owner pool so the director's
 * disposeSequenceArtifacts teardown walks it down.
 *
 * TH-S5-03 enforcement: the factory's `caller: typeof
 * AMBIENT_RECOVERY_AUDIO_OWNER` parameter rejects cross-lane misuse
 * at the compiler — only this site can pass the matching owner
 * constant. The registerOwnedAudio call is keyed by the SAME
 * constant so getOwnedAudio retrieval stays unambiguous.
 */
function constructAndRegisterAmbientRecovery(
  opts: Faz8RevealRunArgs,
): AmbientRecoveryHandle {
  const handle = createAmbientRecoveryHandle({
    caller: AMBIENT_RECOVERY_AUDIO_OWNER,
    signal: opts.signal,
    audioContext: opts.destructionAudio.context,
    destination: opts.destructionAudio.destination,
  });
  opts.destructionAudio.registerOwnedAudio(AMBIENT_RECOVERY_AUDIO_OWNER, handle);
  return handle;
}

/**
 * Toggle the overlay class so Lane B's CSS keyframe animation drives
 * opacity 1 → 0 over FAZ8_REVEAL_FADE_DURATION_MS. Idempotent — the
 * class is added once at envelope start; the runner does NOT remove
 * it (the overlay is disposed wholesale at son-ekran end via the
 * director's overlay teardown chain).
 */
function triggerOverlayFadeOut(container: HTMLElement): void {
  container.classList.add(FAZ8_REVEAL_OVERLAY_CLASS);
}

/**
 * RAF-driven linear ramp on `lighting.setBaseIntensityFactor` from 0
 * to FAZ8_BULB_BASELINE_FACTOR (1.0) over `durationMs`. Mirrors
 * faz0-bang.rampBulbToZero with inverted direction. Self-cancels on
 * completion. The Sprint 1 14Hz AC ripple is layered inside the
 * lighting updater — restoring baseFactor to 1.0 re-engages it.
 */
function rampBulbToBaseline(lighting: BulbLightHandle, durationMs: number): void {
  const startMs = performance.now();
  const duration = Math.max(durationMs, 1);
  const tick = (): void => {
    const progress = Math.min(1, (performance.now() - startMs) / duration);
    lighting.setBaseIntensityFactor(progress * FAZ8_BULB_BASELINE_FACTOR);
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/**
 * Camera dolly-out envelope. Linear interpolation on `camera.position.z`
 * over FAZ8_REVEAL_DURATION_MS (full 5sn window) so the framing pulls
 * back from the Sprint 4 BANG_CAMERA_SHAKE_DEG=5 displacement to a
 * slightly-further vantage. Returns a disposer the caller invokes at
 * envelope end. Reduced-motion forces dolly-degrees to 0 — the rAF
 * still runs but the position increment is zero.
 */
function startCameraDolly(
  opts: Faz8RevealRunArgs,
  reducedMotion: boolean,
): () => void {
  const baseZ = opts.camera.position.z;
  const dollyDegrees = reducedMotion ? 0 : FAZ8_REVEAL_CAMERA_DOLLY_DEGREES;
  const dollyDelta = (dollyDegrees / 360) * 2 * Math.PI;
  const startMs = performance.now();
  let rafId = 0;
  let active = true;
  const tick = (): void => {
    if (!active || opts.signal.aborted) return;
    const elapsed = performance.now() - startMs;
    const progress = Math.min(1, elapsed / FAZ8_REVEAL_DURATION_MS);
    opts.camera.position.z = baseZ + progress * dollyDelta;
    if (progress < 1) rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
  return (): void => {
    active = false;
    cancelAnimationFrame(rafId);
  };
}

/**
 * Sleep `ms` milliseconds, but resolve immediately if signal is
 * already aborted OR resolve early when signal aborts during the
 * wait. Pattern matches faz7-bootloop.sleep / faz1-critical-dialog.
 */
function sleepWithAbort(ms: number, signal: AbortSignal): Promise<void> {
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
