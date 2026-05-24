/**
 * Faz 6 + Faz 7 audio synth factories — Sprint 5 Phase 2B Lane B.
 *
 * Split from destruction-audio.ts to respect the 400-line max-lines lint
 * cap. Lane B owns:
 *   - createBSODBeepHandle  (Faz 6, BSOD_BEEP_AUDIO_OWNER)
 *   - createElectricalTickHandle  (Faz 7, ELECTRICAL_TICK_AUDIO_OWNER)
 *
 * Lane A (separate file/handler) owns:
 *   - createHDDGrindHandle  (Faz 4)
 *   - createFanOverdriveHandle  (Faz 4)
 *   - createElectricalBuzzHandle  (Faz 5)
 *
 * All four interfaces + the DestructionOwnedAudioHandle union live in
 * destruction-audio.ts (single source of truth for the audio handle types).
 *
 * Sprint 4 Lesson 3: procedural fallback IS canonical. NO .ogg / .wav
 * vendoring required — Web Audio primitives only.
 */

import {
  FAZ6_BSOD_BEEP_ATTACK_MS,
  FAZ6_BSOD_BEEP_DECAY_MS,
  FAZ6_BSOD_BEEP_HZ,
  FAZ6_BSOD_BEEP_MS,
  FAZ6_BSOD_BEEP_RELEASE_MS,
  FAZ6_BSOD_BEEP_SUSTAIN_LEVEL,
  FAZ7_ELECTRICAL_TICK_HZ,
  PREFERS_REDUCED_MOTION_QUERY,
} from '../../../shared/scene-destruction-constants.js';
import type { BSODBeepHandle, ElectricalTickHandle } from './destruction-audio.js';

/* ------------------------------------------------------------------------ */
/* Shared helpers                                                           */
/* ------------------------------------------------------------------------ */

/** Reduced-motion matchMedia query — single-source-of-truth via constants. */
function isReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;
}

/* ------------------------------------------------------------------------ */
/* BSOD-beep handle — Faz 6 single-fire square-wave beep                    */
/* ------------------------------------------------------------------------ */

/** BSOD beep peak gain when reduced-motion is NOT set. Linear 0-1. */
const BSOD_BEEP_PEAK_GAIN = 1.0;
/** BSOD beep peak gain when reduced-motion IS set. 30% per Lane B spec. */
const BSOD_BEEP_REDUCED_MOTION_GAIN = 0.3;

/**
 * Factory for BSODBeepHandle — square wave 800Hz, 200ms, ADSR
 * (5/0/1/195ms). Reduced-motion gate drops the peak gain to 30%.
 *
 * Owner: faz6-bsod.ts (BSOD_BEEP_AUDIO_OWNER decree). One-shot — `play()`
 * fires once at Faz 6 entry; the OscillatorNode auto-cleans via its
 * `ended` event listener so repeated calls do not leak nodes.
 *
 * Synth: square wave at FAZ6_BSOD_BEEP_HZ → GainNode → destination. The
 * gain's `linearRampToValueAtTime` schedules the ADSR; the
 * `setValueAtTime` at sustain marks the sustain plateau before the release
 * ramp pulls the envelope back to 0. The oscillator stops 10ms after the
 * envelope ends to free the node graph.
 */
export function createBSODBeepHandle(
  context: AudioContext,
  destination: GainNode,
): BSODBeepHandle {
  const reducedMotion = isReducedMotion();
  const peakGain = reducedMotion
    ? BSOD_BEEP_REDUCED_MOTION_GAIN
    : BSOD_BEEP_PEAK_GAIN;
  let disposed = false;
  return {
    kind: 'bsod-beep',
    play: (): void => {
      if (disposed) return;
      fireBSODBeep(context, destination, peakGain);
    },
    dispose: (): void => {
      // OscillatorNodes self-clean via `ended` listener inside fireBSODBeep.
      // Setting the flag prevents any later .play() from spawning new nodes
      // after the director has torn down the audio chain.
      disposed = true;
    },
  };
}

/**
 * Fire a single 200ms ADSR-enveloped 800Hz square wave. Internal — every
 * call to `BSODBeepHandle.play()` schedules a fresh OscillatorNode + GainNode
 * pair so repeat-firing within the same Faz 6 window is safe (the second
 * beep does not interfere with the first's release tail).
 */
function fireBSODBeep(
  context: AudioContext,
  destination: GainNode,
  peakGain: number,
): void {
  const osc = context.createOscillator();
  osc.type = 'square';
  osc.frequency.value = FAZ6_BSOD_BEEP_HZ;
  const gain = context.createGain();
  gain.gain.value = 0;
  osc.connect(gain).connect(destination);
  const now = context.currentTime;
  const attackEnd = now + FAZ6_BSOD_BEEP_ATTACK_MS / 1000;
  const decayEnd = attackEnd + FAZ6_BSOD_BEEP_DECAY_MS / 1000;
  const releaseEnd = now + FAZ6_BSOD_BEEP_MS / 1000;
  const releaseStart = releaseEnd - FAZ6_BSOD_BEEP_RELEASE_MS / 1000;
  const sustainLevel = peakGain * FAZ6_BSOD_BEEP_SUSTAIN_LEVEL;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peakGain, attackEnd);
  gain.gain.linearRampToValueAtTime(sustainLevel, decayEnd);
  gain.gain.setValueAtTime(sustainLevel, releaseStart);
  gain.gain.linearRampToValueAtTime(0, releaseEnd);
  osc.start(now);
  osc.stop(releaseEnd + 0.01);
  osc.addEventListener('ended', (): void => {
    osc.disconnect();
    gain.disconnect();
  });
}

/* ------------------------------------------------------------------------ */
/* Electrical-tick handle — Faz 7 0.5Hz low-pass-filtered click loop        */
/* ------------------------------------------------------------------------ */

/** Electrical-tick per-click peak gain (designer §15 Faz 7). */
const ELECTRICAL_TICK_PEAK_GAIN = 0.4;
/** Electrical-tick reduced-motion ceiling (designer §15 — gate to 0.2). */
const ELECTRICAL_TICK_REDUCED_MOTION_GAIN = 0.2;
/** Electrical-tick burst length (~30ms white noise impulse). */
const ELECTRICAL_TICK_BURST_LENGTH_SEC = 0.03;
/** Electrical-tick low-pass cutoff Hz — damps to a "twitch", not a "pop". */
const ELECTRICAL_TICK_LOWPASS_HZ = 200;
/** Electrical-tick low-pass Q. */
const ELECTRICAL_TICK_LOWPASS_Q = 2.0;

/**
 * Factory for ElectricalTickHandle — white-noise burst (~30ms) low-pass-
 * filtered at 200Hz, fired every 2sn (0.5Hz = FAZ7_ELECTRICAL_TICK_HZ).
 *
 * Owner: faz7-bootloop.ts (ELECTRICAL_TICK_AUDIO_OWNER decree). Sustains
 * via internal `setInterval` between `start()` and `stop()`; reduced-motion
 * gate drops the peak to 0.2 (designer §15: the tick is decorative; the
 * silence reads as "even the dead-system click is gone" so the gate
 * downsizes the surface rather than removing it).
 *
 * Synth per call: BufferSourceNode (30ms random samples) → BiquadFilterNode
 * (lowpass 200Hz Q=2.0) → GainNode → destination. Each tick spawns fresh
 * nodes that self-clean via the `ended` event.
 */
export function createElectricalTickHandle(
  context: AudioContext,
  destination: GainNode,
): ElectricalTickHandle {
  const reducedMotion = isReducedMotion();
  const peakGain = reducedMotion
    ? ELECTRICAL_TICK_REDUCED_MOTION_GAIN
    : ELECTRICAL_TICK_PEAK_GAIN;
  let intervalId: number | null = null;
  let started = false;
  let disposed = false;
  const fire = (): void => {
    if (disposed) return;
    fireElectricalTick(context, destination, peakGain);
  };
  return {
    kind: 'electrical-tick',
    start: (): void => {
      if (started || disposed) return;
      started = true;
      // Fire immediately so the first tick lands at Faz 7 entry, then loop
      // at FAZ7_ELECTRICAL_TICK_HZ via setInterval. The 0.5Hz cadence means
      // the second tick lands at ~2sn into Faz 7 (designer §15: 3 ticks
      // total across the 6-second Faz 7 window).
      fire();
      const intervalMs = 1000 / FAZ7_ELECTRICAL_TICK_HZ;
      intervalId = window.setInterval(fire, intervalMs);
    },
    stop: (): void => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
}

/**
 * Fire a single 30ms low-pass-filtered white-noise tick. Internal helper for
 * ElectricalTickHandle's setInterval loop.
 */
function fireElectricalTick(
  context: AudioContext,
  destination: GainNode,
  peakGain: number,
): void {
  const length = Math.floor(context.sampleRate * ELECTRICAL_TICK_BURST_LENGTH_SEC);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  const src = context.createBufferSource();
  src.buffer = buffer;
  const lp = context.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = ELECTRICAL_TICK_LOWPASS_HZ;
  lp.Q.value = ELECTRICAL_TICK_LOWPASS_Q;
  const gain = context.createGain();
  gain.gain.value = peakGain;
  src.connect(lp).connect(gain).connect(destination);
  const now = context.currentTime;
  // Fast amp-down at end of burst to avoid the click-on-stop artefact.
  gain.gain.setValueAtTime(peakGain, now);
  gain.gain.linearRampToValueAtTime(0, now + ELECTRICAL_TICK_BURST_LENGTH_SEC);
  src.start(now);
  src.stop(now + ELECTRICAL_TICK_BURST_LENGTH_SEC + 0.01);
  src.addEventListener('ended', (): void => {
    src.disconnect();
    lp.disconnect();
    gain.disconnect();
  });
}
