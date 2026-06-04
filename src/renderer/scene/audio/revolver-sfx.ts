/**
 * Revolver one-shot SFX + breath layer synthesisers.
 *
 * Phase 2B kraken-revolver factory module. Lives alongside ambient-synth.ts
 * but holds the *event* sounds (cock, empty-click, bang, heartbeat, sweat
 * drip, chair creak) and the *new* breath layer that the hold-state ramp
 * crossfades. Splitting from ambient-synth.ts keeps that file from blowing
 * the 400-line ceiling.
 *
 * Two factory shapes:
 *   - `OneShotPlayer` — `play()` triggers a fresh node graph each call.
 *     The graph self-destructs on the OscillatorNode's `ended` event so
 *     the audio context never accumulates lingering nodes.
 *   - `BreathLayerHandle` — long-lived (start/stop) like the ambient
 *     synths, but with a `setGain(target, durationMs)` knob the hold-state
 *     ramp consumes, and a `setPlaybackRate(rate)` knob the tension
 *     threshold uses to double the breath rate (designer §3).
 *
 * Sprint 3 swaps the one-shots to .ogg via Howler one-shots; Sprint 3 swaps
 * the breath layer to a sample loop. The signatures stay the same.
 *
 * TH-S1-04 follow-up: this module loads instantly (no buffer pre-decode).
 * Audio mount latency observation: the breath layer adds two OscillatorNode
 * + one BiquadFilterNode + one GainNode at mount time — under the 5ms
 * audio-graph build budget. No lazy-init needed.
 */

import {
  COCK_DURATION_MS,
} from '../../../shared/scene-revolver-constants';
import {
  SFX_BANG_ENVELOPE_MS,
  SFX_CHAIR_CREAK_ENVELOPE_MS,
  SFX_COCK_ENVELOPE_MS,
  SFX_EMPTY_CLICK_ENVELOPE_MS,
  SFX_EMPTY_CLICK_PEAK_GAIN,
  SFX_HEARTBEAT_ENVELOPE_MS,
  SFX_SWEAT_DRIP_ENVELOPE_MS,
} from '../../../shared/scene-audio-constants';

/** Public handle returned by `createOneShotPlayer`. */
export interface OneShotPlayer {
  /** Trigger the sound. Multiple overlapping calls allowed. */
  play: () => void;
  /** Stop and dispose any in-flight one-shots. */
  dispose: () => void;
}

/** Public handle returned by `createBreathLayer`. */
export interface BreathLayerHandle {
  /** Start the breath loop. Idempotent. */
  start: () => void;
  /** Stop and tear down. */
  stop: () => void;
  /** Linear fade gain to target over durationMs. */
  setGain: (target: number, durationMs: number) => void;
  /**
   * Set playback rate of the underlying loop. 1.0 = normal. Designer §3
   * doubles this (2.0) for the tension-threshold breath-rate doubling.
   */
  setPlaybackRate: (rate: number) => void;
}

/* ------------------------------------------------------------------------ */
/* Shared helpers                                                           */
/* ------------------------------------------------------------------------ */

/** Linear ramp on an AudioParam — cancels prior scheduled values first. */
function rampParam(
  param: AudioParam,
  target: number,
  durationMs: number,
  ctx: AudioContext,
): void {
  const seconds = Math.max(durationMs, 0) / 1000;
  param.cancelScheduledValues(ctx.currentTime);
  param.setValueAtTime(param.value, ctx.currentTime);
  param.linearRampToValueAtTime(target, ctx.currentTime + seconds);
}

/** Build a noise buffer with `length` samples of [-1, 1] white noise. */
function buildNoiseBuffer(ctx: AudioContext, lengthSec: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * lengthSec);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/* ------------------------------------------------------------------------ */
/* Cock sound — short metallic clack                                        */
/* ------------------------------------------------------------------------ */

const COCK_BANDPASS_HZ = 3000;
const COCK_BANDPASS_Q = 5;
const COCK_INITIAL_GAIN = 0.8;

/**
 * Cock sound — band-pass noise at 3kHz, fast envelope. Designer §3 picks
 * 80ms but COCK_DURATION_MS (250ms) bounds the spawning rate; the audible
 * tail is 80ms while the closure waits the full 250ms to schedule cleanup.
 */
export function createCockSound(
  ctx: AudioContext,
  destination: AudioNode,
): OneShotPlayer {
  const buffer = buildNoiseBuffer(ctx, COCK_DURATION_MS / 1000);
  return {
    play: (): void => playCockBurst(ctx, destination, buffer),
    dispose: (): void => undefined,
  };
}

/** Spawn one cock-burst graph. Self-cleans on `ended`. */
function playCockBurst(
  ctx: AudioContext,
  destination: AudioNode,
  buffer: AudioBuffer,
): void {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = COCK_BANDPASS_HZ;
  bp.Q.value = COCK_BANDPASS_Q;
  const g = ctx.createGain();
  g.gain.value = COCK_INITIAL_GAIN;
  src.connect(bp).connect(g).connect(destination);
  rampParam(g.gain, 0, SFX_COCK_ENVELOPE_MS, ctx);
  src.start();
  src.addEventListener('ended', () => {
    src.disconnect();
    bp.disconnect();
    g.disconnect();
  });
  src.stop(ctx.currentTime + 0.12);
}

/* ------------------------------------------------------------------------ */
/* Empty-click sound — soft mechanical click                                */
/* ------------------------------------------------------------------------ */

const EMPTY_CLICK_FREQ_HZ = 1200;
/**
 * Empty-click peak linear gain.
 *
 * Sprint 8 §24 alias for SFX_EMPTY_CLICK_PEAK_GAIN — keeps the call site
 * symmetric with the other revolver-sfx module-level constants while
 * the SSOT for the design value lives in scene-audio-constants.ts (so
 * tests + designer §24 alignment can reference a single import).
 */
const EMPTY_CLICK_GAIN = SFX_EMPTY_CLICK_PEAK_GAIN;

/** Empty-click sound — short percussive sine burst at 1.2kHz. */
export function createEmptyClickSound(
  ctx: AudioContext,
  destination: AudioNode,
): OneShotPlayer {
  return {
    play: (): void => playEmptyClickTransient(ctx, destination),
    dispose: (): void => undefined,
  };
}

/** Spawn one empty-click transient. Self-cleans on `ended`. */
function playEmptyClickTransient(
  ctx: AudioContext,
  destination: AudioNode,
): void {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = EMPTY_CLICK_FREQ_HZ;
  const g = ctx.createGain();
  g.gain.value = EMPTY_CLICK_GAIN;
  osc.connect(g).connect(destination);
  rampParam(g.gain, 0, SFX_EMPTY_CLICK_ENVELOPE_MS, ctx);
  osc.start();
  osc.addEventListener('ended', () => {
    osc.disconnect();
    g.disconnect();
  });
  osc.stop(ctx.currentTime + 0.08);
}

/* ------------------------------------------------------------------------ */
/* Bang sound — Sprint 2 placeholder                                        */
/* ------------------------------------------------------------------------ */

const BANG_BURST_GAIN = 0.7;

/**
 * Bang sound (Sprint 2 placeholder). A short white-noise burst at moderate
 * volume — Sprint 3 swaps in the real `bang.ogg` per PLAN §7 Faz 0.
 */
export function createBangSound(
  ctx: AudioContext,
  destination: AudioNode,
): OneShotPlayer {
  const buffer = buildNoiseBuffer(ctx, 0.2);
  return {
    play: (): void => playBangBurst(ctx, destination, buffer),
    dispose: (): void => undefined,
  };
}

/** Spawn one bang noise-burst. Self-cleans. */
function playBangBurst(
  ctx: AudioContext,
  destination: AudioNode,
  buffer: AudioBuffer,
): void {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const g = ctx.createGain();
  g.gain.value = BANG_BURST_GAIN;
  src.connect(g).connect(destination);
  rampParam(g.gain, 0, SFX_BANG_ENVELOPE_MS, ctx);
  src.start();
  src.addEventListener('ended', () => {
    src.disconnect();
    g.disconnect();
  });
  src.stop(ctx.currentTime + 0.25);
}

/* ------------------------------------------------------------------------ */
/* Heartbeat sound — synth low-frequency pulse                              */
/* ------------------------------------------------------------------------ */

const HEARTBEAT_FUNDAMENTAL_HZ = 60;
const HEARTBEAT_GAIN = 0.4;

/** Heartbeat — single low-freq sine pulse, 150ms envelope. */
export function createHeartbeatSound(
  ctx: AudioContext,
  destination: AudioNode,
): OneShotPlayer {
  return {
    play: (): void => playHeartbeatPulse(ctx, destination),
    dispose: (): void => undefined,
  };
}

/** Spawn one heartbeat pulse. Self-cleans on `ended`. */
function playHeartbeatPulse(
  ctx: AudioContext,
  destination: AudioNode,
): void {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = HEARTBEAT_FUNDAMENTAL_HZ;
  const g = ctx.createGain();
  g.gain.value = HEARTBEAT_GAIN;
  osc.connect(g).connect(destination);
  rampParam(g.gain, 0, SFX_HEARTBEAT_ENVELOPE_MS, ctx);
  osc.start();
  osc.addEventListener('ended', () => {
    osc.disconnect();
    g.disconnect();
  });
  osc.stop(ctx.currentTime + 0.16);
}

/* ------------------------------------------------------------------------ */
/* Sweat drip — short noise burst                                           */
/* ------------------------------------------------------------------------ */

const SWEAT_BANDPASS_HZ = 3000;
const SWEAT_BANDPASS_Q = 4;
const SWEAT_PLIP_HZ = 120;
const SWEAT_GAIN = 0.45;

/** Sweat drip — band-pass white-noise burst + 120Hz low "plip". */
export function createSweatDripSound(
  ctx: AudioContext,
  destination: AudioNode,
): OneShotPlayer {
  const buffer = buildNoiseBuffer(ctx, 0.12);
  return {
    play: (): void => playSweatDrip(ctx, destination, buffer),
    dispose: (): void => undefined,
  };
}

/** Spawn one sweat-drip burst + plip. Self-cleans. */
function playSweatDrip(
  ctx: AudioContext,
  destination: AudioNode,
  buffer: AudioBuffer,
): void {
  spawnSweatNoise(ctx, destination, buffer);
  spawnSweatPlip(ctx, destination);
}

/** Sweat-drip noise band-pass burst. */
function spawnSweatNoise(
  ctx: AudioContext,
  destination: AudioNode,
  buffer: AudioBuffer,
): void {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = SWEAT_BANDPASS_HZ;
  bp.Q.value = SWEAT_BANDPASS_Q;
  const g = ctx.createGain();
  g.gain.value = SWEAT_GAIN;
  src.connect(bp).connect(g).connect(destination);
  rampParam(g.gain, 0, SFX_SWEAT_DRIP_ENVELOPE_MS, ctx);
  src.start();
  src.addEventListener('ended', () => {
    src.disconnect();
    bp.disconnect();
    g.disconnect();
  });
  src.stop(ctx.currentTime + 0.14);
}

/** Sweat-drip 120Hz "plip" transient. */
function spawnSweatPlip(ctx: AudioContext, destination: AudioNode): void {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = SWEAT_PLIP_HZ;
  const g = ctx.createGain();
  g.gain.value = SWEAT_GAIN * 0.6;
  osc.connect(g).connect(destination);
  rampParam(g.gain, 0, 80, ctx);
  osc.start();
  osc.addEventListener('ended', () => {
    osc.disconnect();
    g.disconnect();
  });
  osc.stop(ctx.currentTime + 0.1);
}

/* ------------------------------------------------------------------------ */
/* Chair creak — bandpass envelope                                          */
/* ------------------------------------------------------------------------ */

const CHAIR_CREAK_START_HZ = 3000;
const CHAIR_CREAK_END_HZ = 2000;
const CHAIR_CREAK_BANDPASS_Q = 6;
const CHAIR_CREAK_GAIN = 0.55;
const CHAIR_CREAK_PAN = 0.3;

/**
 * Chair creak — band-pass white-noise, ~600ms total, frequency bends from
 * 3kHz down to 2kHz. Panned right ~30% per designer §4 (chair to the right).
 */
export function createChairCreakSound(
  ctx: AudioContext,
  destination: AudioNode,
): OneShotPlayer {
  const buffer = buildNoiseBuffer(ctx, 0.6);
  return {
    play: (): void => playChairCreak(ctx, destination, buffer),
    dispose: (): void => undefined,
  };
}

/** Spawn one chair-creak. Self-cleans on `ended`. */
function playChairCreak(
  ctx: AudioContext,
  destination: AudioNode,
  buffer: AudioBuffer,
): void {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = CHAIR_CREAK_START_HZ;
  bp.Q.value = CHAIR_CREAK_BANDPASS_Q;
  const g = ctx.createGain();
  g.gain.value = CHAIR_CREAK_GAIN;
  const panner = ctx.createStereoPanner();
  panner.pan.value = CHAIR_CREAK_PAN;
  src.connect(bp).connect(g).connect(panner).connect(destination);
  rampParam(bp.frequency, CHAIR_CREAK_END_HZ, SFX_CHAIR_CREAK_ENVELOPE_MS, ctx);
  rampParam(g.gain, 0, SFX_CHAIR_CREAK_ENVELOPE_MS, ctx);
  src.start();
  src.addEventListener('ended', () => {
    src.disconnect();
    bp.disconnect();
    g.disconnect();
    panner.disconnect();
  });
  src.stop(ctx.currentTime + 0.65);
}

/* ------------------------------------------------------------------------ */
/* Breath layer — long-lived hold-state ramp                                */
/* ------------------------------------------------------------------------ */

const BREATH_NOISE_LENGTH_SEC = 8;
const BREATH_LOWPASS_HZ = 800;
const BREATH_LOWPASS_Q = 0.7;

/**
 * Breath layer — looped low-pass-filtered noise simulating an audible
 * inhale/exhale. Designer §3 mandates: linear gain ramp during hold;
 * playbackRate doubling at the tension threshold (last 100ms before commit).
 *
 * Graph:
 *   noise(loop) ──► lowpass(800Hz) ──► gain ──► destination
 *
 * Gain starts at 0 — caller drives via `setGain`.
 */
export function createBreathLayer(
  ctx: AudioContext,
  destination: AudioNode,
): BreathLayerHandle {
  const graph = buildBreathGraph(ctx, destination);
  let started = false;

  return {
    start: (): void => {
      if (started) return;
      started = true;
      graph.noise.start();
    },
    stop: (): void => stopBreathLayer(graph),
    setGain: (target: number, durationMs: number): void => {
      rampParam(graph.gain.gain, target, durationMs, ctx);
    },
    setPlaybackRate: (rate: number): void => {
      graph.noise.playbackRate.value = rate;
    },
  };
}

/** Node graph for the breath layer. */
interface BreathGraph {
  noise: AudioBufferSourceNode;
  lowpass: BiquadFilterNode;
  gain: GainNode;
}

/** Build (but do not start) the breath graph. */
function buildBreathGraph(
  ctx: AudioContext,
  destination: AudioNode,
): BreathGraph {
  const noise = ctx.createBufferSource();
  noise.buffer = buildNoiseBuffer(ctx, BREATH_NOISE_LENGTH_SEC);
  noise.loop = true;
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = BREATH_LOWPASS_HZ;
  lowpass.Q.value = BREATH_LOWPASS_Q;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  noise.connect(lowpass).connect(gain).connect(destination);
  return { noise, lowpass, gain };
}

/** Tear down the breath graph. Safe to call even if `start` was never called. */
function stopBreathLayer(graph: BreathGraph): void {
  try {
    graph.noise.stop();
  } catch {
    // Already stopped — safe.
  }
  graph.noise.disconnect();
  graph.lowpass.disconnect();
  graph.gain.disconnect();
}
