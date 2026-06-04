/**
 * Faz 4 + Faz 5 audio synth factories — Sprint 5 Phase 2B Lane A.
 *
 * Split from destruction-audio.ts (which already houses Sprint 4 surfaces +
 * Sprint 5 interface declarations) to respect the 400-line max-lines lint
 * cap. Lane A owns:
 *   - createHDDGrindHandle      (Faz 4, HDD_GRIND_AUDIO_OWNER)
 *   - createFanOverdriveHandle  (Faz 4, FAN_OVERDRIVE_AUDIO_OWNER)
 *   - createElectricalBuzzHandle (Faz 5, ELECTRICAL_BUZZ_AUDIO_OWNER)
 *
 * Lane B (destruction-audio-faz67.ts) owns:
 *   - createBSODBeepHandle       (Faz 6)
 *   - createElectricalTickHandle (Faz 7)
 *
 * All five interfaces + the DestructionOwnedAudioHandle union live in
 * destruction-audio.ts (single source of truth for the audio handle types).
 *
 * Sprint 4 Lesson 3: procedural fallback IS canonical. NO .ogg / .wav
 * vendoring required — Web Audio primitives only.
 *
 * Reduced-motion gating: each factory checks `prefers-reduced-motion: reduce`
 * via matchMedia at construction and clamps the peak gain (HDD-grind 0.3,
 * fan-overdrive 0.5, electrical-buzz peak halved). The clamp is captured in
 * the closure so subsequent setVolume/setGain calls cannot exceed the cap.
 */

import { PREFERS_REDUCED_MOTION_QUERY } from '../../../shared/scene-destruction-constants.js';
import type {
  ElectricalBuzzHandle,
  FanOverdriveHandle,
  HDDGrindHandle,
} from './destruction-audio';
import {
  buildElectricalBuzzNodes,
  type ElectricalBuzzNodes,
} from './destruction-audio-faz45-buzz.js';
import {
  decrementVoiceCount,
  incrementVoiceCount,
} from './audio-voice-counter.js';

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

/**
 * Build a noise AudioBuffer. `kind = 'white'` is uniform random in [-1, 1];
 * `kind = 'brown'` integrates white noise into 1/f² (low-end emphasis —
 * matches the disk-grinding read of "mechanical platter rumble"); `kind =
 * 'pink'` approximates 1/f via a 6-pole IIR (matches fan-air read of "wide-
 * band turbulent hiss"). Both colored variants normalise to ±1 to fit the
 * downstream filter chain. Internal — only this module calls it.
 */
function buildNoiseBuffer(
  context: AudioContext,
  durationSec: number,
  kind: 'white' | 'brown' | 'pink',
): AudioBuffer {
  const length = Math.floor(context.sampleRate * durationSec);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  if (kind === 'white') {
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    return buffer;
  }
  if (kind === 'brown') {
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    return buffer;
  }
  fillPinkNoise(data);
  return buffer;
}

/** Inline pink-noise IIR (Voss-McCartney 6-pole approximation). */
function fillPinkNoise(data: Float32Array): void {
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < data.length; i += 1) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
}

/* ------------------------------------------------------------------------ */
/* HDD-grind handle — Faz 4 file-wipe ambient brown-noise band-pass         */
/* ------------------------------------------------------------------------ */

/**
 * HDD-grind peak linear gain.
 *
 * Sprint 8 §24 tune: -22 dBFS ≈ 0.08 linear (18dB drop from Sprint 5's
 * -4dB / 0.6 placeholder). Atmospheric source ("disk wipe in
 * progress" texture) — should sit below perceptual foreground but
 * above felt-presence floor. -22 dBFS holds the felt-texture without
 * masking discrete cues (BSOD beep, dialog).
 */
const HDD_GRIND_PEAK_GAIN = 0.08;
/**
 * HDD-grind reduced-motion ceiling.
 *
 * Sprint 8 §24 D-2: atmospheric source, -6dB additional attenuation
 * (0.5 × peak). 0.08 × 0.5 = 0.04 linear ≈ -28 dBFS — atmospheric
 * texture survives but loses ≈30% perceived loudness.
 */
const HDD_GRIND_REDUCED_MOTION_MAX = 0.04;
/** HDD-grind brown-noise buffer length (sec). Long enough to loop seamlessly. */
const HDD_GRIND_BUFFER_LENGTH_SEC = 4;
/** HDD-grind band-pass filter centre frequency (Hz). Mid-band disk read. */
const HDD_GRIND_BANDPASS_CENTRE_HZ = 500;
/** HDD-grind band-pass filter Q — narrow enough to feel "throat", not "hiss". */
const HDD_GRIND_BANDPASS_Q = 1.5;
/** Mechanical platter punch LFO rate (Hz) — 2Hz = ~120 BPM disk seek. */
const HDD_GRIND_PUNCH_LFO_HZ = 2;
/** Punch LFO modulation depth (linear gain swing around the carrier). */
const HDD_GRIND_PUNCH_DEPTH = 0.4;
/** Attack ramp duration (sec) — gentle fade-in, NOT a snap. */
const HDD_GRIND_ATTACK_SEC = 0.5;
/** Stop release ramp duration (sec). */
const HDD_GRIND_RELEASE_SEC = 0.3;

/**
 * Factory for HDDGrindHandle — brown-noise band-pass 200-800Hz with 2Hz LFO
 * amplitude punches, gentle 0.5sn attack, sustained gain, 0.3sn release.
 *
 * Owner: faz4-file-wipe.ts (HDD_GRIND_AUDIO_OWNER decree). Sustained through
 * Faz 4 + Faz 5 (Faz 5 inherits via the owner pool and calls `setVolume()`
 * for the louder grind reading). Stopped by Faz 6 at end (cross-faz audio
 * silence cascade — see faz6-bsod.ts#silenceCrossFazAudio).
 *
 * Synth: BufferSource (brown noise, loop) → BiquadFilter (bandpass 500Hz
 * Q=1.5) → GainNode (carrier) → GainNode (punch LFO modulator) → destination.
 * The carrier gain controls macro envelope (attack / sustain / release);
 * the LFO gain receives a 2Hz sine via a dedicated OscillatorNode → it
 * adds/subtracts ~0.4 around 1.0 so the audible result reads "mechanical
 * platter ka-chunk ka-chunk under continuous hiss".
 */
export function createHDDGrindHandle(
  context: AudioContext,
  destination: GainNode,
): HDDGrindHandle {
  const reducedMotion = isReducedMotion();
  const peakGain = reducedMotion ? HDD_GRIND_REDUCED_MOTION_MAX : HDD_GRIND_PEAK_GAIN;
  const nodes = buildHDDGrindNodes(context, destination);
  const state: HDDGrindState = { started: false, stopped: false, disposed: false };
  return {
    kind: 'hdd-grind',
    start: (): void => startHDDGrind(state, nodes, context, peakGain),
    setVolume: (linear: number): void => setHDDGrindVolume(state, nodes, context, peakGain, linear),
    stop: (): void => stopHDDGrind(state, nodes, context),
    dispose: (): void => disposeHDDGrind(state, nodes),
  };
}

interface HDDGrindState {
  started: boolean;
  stopped: boolean;
  disposed: boolean;
}

function startHDDGrind(
  state: HDDGrindState,
  nodes: HDDGrindNodes,
  context: AudioContext,
  peakGain: number,
): void {
  if (state.started || state.disposed) return;
  state.started = true;
  const now = context.currentTime;
  nodes.source.start(now);
  nodes.lfo.start(now);
  // Sprint 8 M2 — voice-counter increment per audio source (source + lfo = 2).
  try { incrementVoiceCount(); incrementVoiceCount(); } catch { /* defensive */ }
  nodes.carrierGain.gain.setValueAtTime(0, now);
  nodes.carrierGain.gain.linearRampToValueAtTime(peakGain, now + HDD_GRIND_ATTACK_SEC);
}

function setHDDGrindVolume(
  state: HDDGrindState,
  nodes: HDDGrindNodes,
  context: AudioContext,
  peakGain: number,
  linear: number,
): void {
  if (state.disposed) return;
  const target = Math.max(0, Math.min(peakGain, linear));
  const now = context.currentTime;
  nodes.carrierGain.gain.cancelScheduledValues(now);
  nodes.carrierGain.gain.setValueAtTime(nodes.carrierGain.gain.value, now);
  nodes.carrierGain.gain.linearRampToValueAtTime(target, now + 0.1);
}

function stopHDDGrind(state: HDDGrindState, nodes: HDDGrindNodes, context: AudioContext): void {
  if (state.stopped || state.disposed) return;
  state.stopped = true;
  const now = context.currentTime;
  nodes.carrierGain.gain.cancelScheduledValues(now);
  nodes.carrierGain.gain.setValueAtTime(nodes.carrierGain.gain.value, now);
  nodes.carrierGain.gain.linearRampToValueAtTime(0, now + HDD_GRIND_RELEASE_SEC);
  try {
    nodes.source.stop(now + HDD_GRIND_RELEASE_SEC + 0.05);
    nodes.lfo.stop(now + HDD_GRIND_RELEASE_SEC + 0.05);
  } catch {
    // Source may already have stopped — Web Audio throws InvalidStateError.
  }
}

function disposeHDDGrind(state: HDDGrindState, nodes: HDDGrindNodes): void {
  if (state.disposed) return;
  // Sprint 8 M2 — voice-counter decrement on explicit dispose. Only
  // decrement if start() ran (otherwise the increment never fired).
  const wasStarted = state.started;
  state.disposed = true;
  try {
    nodes.source.disconnect();
    nodes.bandpass.disconnect();
    nodes.carrierGain.disconnect();
    nodes.lfo.disconnect();
    nodes.lfoGain.disconnect();
  } catch {
    // Already disconnected — safe.
  }
  if (wasStarted) {
    try { decrementVoiceCount(); decrementVoiceCount(); } catch { /* defensive */ }
  }
}

interface HDDGrindNodes {
  source: AudioBufferSourceNode;
  bandpass: BiquadFilterNode;
  carrierGain: GainNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
}

/** Build + wire the HDD-grind node graph. Internal — invoked once at factory time. */
function buildHDDGrindNodes(context: AudioContext, destination: GainNode): HDDGrindNodes {
  const source = context.createBufferSource();
  source.buffer = buildNoiseBuffer(context, HDD_GRIND_BUFFER_LENGTH_SEC, 'brown');
  source.loop = true;
  const bandpass = context.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = HDD_GRIND_BANDPASS_CENTRE_HZ;
  bandpass.Q.value = HDD_GRIND_BANDPASS_Q;
  const carrierGain = context.createGain();
  carrierGain.gain.value = 0;
  const lfo = context.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = HDD_GRIND_PUNCH_LFO_HZ;
  const lfoGain = context.createGain();
  lfoGain.gain.value = HDD_GRIND_PUNCH_DEPTH;
  // LFO sine ±1 × depth 0.4 modulates carrierGain.gain around its set point.
  lfo.connect(lfoGain).connect(carrierGain.gain);
  source.connect(bandpass).connect(carrierGain).connect(destination);
  return { source, bandpass, carrierGain, lfo, lfoGain };
}

/* ------------------------------------------------------------------------ */
/* Fan-overdrive handle — Faz 4-6 pink-noise high-pass sustained             */
/* ------------------------------------------------------------------------ */

/**
 * Fan-overdrive peak linear gain.
 *
 * Sprint 8 §24 tune: -25 dBFS ≈ 0.056 linear (23dB drop from Sprint 5's
 * -2dB / 0.8 placeholder). Atmospheric source (cooling fan ramped
 * past design RPM) — the 4-sn ramp simulates progressive degradation,
 * but the target peak must sit below the foreground so the BSOD beep
 * and the dialog still read cleanly above it. ≈0.06 chosen as the
 * 2-decimal-place rounding of 0.056 (saves a constant edit if the
 * 1dB tolerance permits — §24 spec says ±1dB).
 */
const FAN_OVERDRIVE_PEAK_GAIN = 0.06;
/**
 * Fan-overdrive reduced-motion ceiling.
 *
 * Sprint 8 §24 D-2: atmospheric source, -6dB additional attenuation
 * (0.5 × peak). 0.06 × 0.5 = 0.03 linear ≈ -30 dBFS.
 */
const FAN_OVERDRIVE_REDUCED_MOTION_MAX = 0.03;
/** Fan-overdrive pink-noise buffer length (sec). Long for smooth loop. */
const FAN_OVERDRIVE_BUFFER_LENGTH_SEC = 4;
/** Fan-overdrive high-pass filter cutoff (Hz). 1.5kHz = "thin air wind". */
const FAN_OVERDRIVE_HIGHPASS_HZ = 1500;
/** Fan-overdrive high-pass filter Q. */
const FAN_OVERDRIVE_HIGHPASS_Q = 0.7;
/** Ramp duration (sec) — 4sn from 0 to peak per Lane A spec. */
const FAN_OVERDRIVE_RAMP_SEC = 4;
/** Release ramp duration (sec). */
const FAN_OVERDRIVE_RELEASE_SEC = 0.4;

/**
 * Factory for FanOverdriveHandle — pink-noise high-pass 1.5kHz, gain ramped
 * 0→0.8 over 4 seconds, then sustained. Faz 6 calls `setGain(0.9)` to lift
 * to peak before the silence cascade.
 *
 * Owner: faz4-file-wipe.ts (FAN_OVERDRIVE_AUDIO_OWNER decree). Sustained
 * through Faz 4 + Faz 5 + Faz 6; stopped by Faz 6 at end.
 *
 * Synth: BufferSource (pink noise, loop) → BiquadFilter (highpass 1.5kHz
 * Q=0.7) → GainNode → destination. The 4-second ramp simulates a fan that
 * progressively spins past its designed RPM.
 */
export function createFanOverdriveHandle(
  context: AudioContext,
  destination: GainNode,
): FanOverdriveHandle {
  const reducedMotion = isReducedMotion();
  const peakGain = reducedMotion ? FAN_OVERDRIVE_REDUCED_MOTION_MAX : FAN_OVERDRIVE_PEAK_GAIN;
  const nodes = buildFanOverdriveNodes(context, destination);
  const state: FanOverdriveState = { started: false, stopped: false, disposed: false };
  return {
    kind: 'fan-overdrive',
    start: (): void => startFanOverdrive(state, nodes, context, peakGain),
    setGain: (linear: number): void => setFanOverdriveGain(state, nodes, context, peakGain, linear),
    stop: (): void => stopFanOverdrive(state, nodes, context),
    dispose: (): void => disposeFanOverdrive(state, nodes),
  };
}

interface FanOverdriveState {
  started: boolean;
  stopped: boolean;
  disposed: boolean;
}

function startFanOverdrive(
  state: FanOverdriveState,
  nodes: FanOverdriveNodes,
  context: AudioContext,
  peakGain: number,
): void {
  if (state.started || state.disposed) return;
  state.started = true;
  const now = context.currentTime;
  nodes.source.start(now);
  // Sprint 8 M2 — voice-counter increment per audio source (1 BufferSource).
  try { incrementVoiceCount(); } catch { /* defensive */ }
  nodes.gain.gain.setValueAtTime(0, now);
  nodes.gain.gain.linearRampToValueAtTime(peakGain, now + FAN_OVERDRIVE_RAMP_SEC);
}

function setFanOverdriveGain(
  state: FanOverdriveState,
  nodes: FanOverdriveNodes,
  context: AudioContext,
  peakGain: number,
  linear: number,
): void {
  if (state.disposed) return;
  const target = Math.max(0, Math.min(peakGain, linear));
  const now = context.currentTime;
  nodes.gain.gain.cancelScheduledValues(now);
  nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
  nodes.gain.gain.linearRampToValueAtTime(target, now + 0.2);
}

function stopFanOverdrive(
  state: FanOverdriveState,
  nodes: FanOverdriveNodes,
  context: AudioContext,
): void {
  if (state.stopped || state.disposed) return;
  state.stopped = true;
  const now = context.currentTime;
  nodes.gain.gain.cancelScheduledValues(now);
  nodes.gain.gain.setValueAtTime(nodes.gain.gain.value, now);
  nodes.gain.gain.linearRampToValueAtTime(0, now + FAN_OVERDRIVE_RELEASE_SEC);
  try {
    nodes.source.stop(now + FAN_OVERDRIVE_RELEASE_SEC + 0.05);
  } catch {
    // Already stopped.
  }
}

function disposeFanOverdrive(state: FanOverdriveState, nodes: FanOverdriveNodes): void {
  if (state.disposed) return;
  // Sprint 8 M2 — voice-counter decrement on explicit dispose.
  const wasStarted = state.started;
  state.disposed = true;
  try {
    nodes.source.disconnect();
    nodes.highpass.disconnect();
    nodes.gain.disconnect();
  } catch {
    // Already disconnected.
  }
  if (wasStarted) {
    try { decrementVoiceCount(); } catch { /* defensive */ }
  }
}

interface FanOverdriveNodes {
  source: AudioBufferSourceNode;
  highpass: BiquadFilterNode;
  gain: GainNode;
}

function buildFanOverdriveNodes(context: AudioContext, destination: GainNode): FanOverdriveNodes {
  const source = context.createBufferSource();
  source.buffer = buildNoiseBuffer(context, FAN_OVERDRIVE_BUFFER_LENGTH_SEC, 'pink');
  source.loop = true;
  const highpass = context.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = FAN_OVERDRIVE_HIGHPASS_HZ;
  highpass.Q.value = FAN_OVERDRIVE_HIGHPASS_Q;
  const gain = context.createGain();
  gain.gain.value = 0;
  source.connect(highpass).connect(gain).connect(destination);
  return { source, highpass, gain };
}

/* ------------------------------------------------------------------------ */
/* Electrical-buzz handle — Faz 5 disk-format 60Hz mains-hum ambient        */
/* ------------------------------------------------------------------------ */

/**
 * Electrical-buzz fundamental peak gain (linear).
 *
 * Sprint 8 §24 tune: -20 dBFS ≈ 0.1 linear (20dB drop from Sprint 5's
 * 0dB / 1.0 placeholder — strongly divergent; 1.0 peak made the buzz
 * a discrete foreground cue rather than the "felt-not-heard rumble"
 * the designer §15 intent specifies). At 0.1 linear the 60Hz
 * fundamental sits below perceptual foreground but provides the
 * "mains hum under everything" texture across Faz 5.
 */
const ELECTRICAL_BUZZ_PEAK_GAIN = 0.1;
/**
 * Electrical-buzz reduced-motion ceiling.
 *
 * Sprint 8 §24 D-2: atmospheric source, -6dB additional attenuation
 * (0.5 × peak). 0.1 × 0.5 = 0.05 linear ≈ -26 dBFS.
 */
const ELECTRICAL_BUZZ_REDUCED_MOTION_MAX = 0.05;
/** Attack / release ramps (sec). */
const ELECTRICAL_BUZZ_ATTACK_SEC = 0.3;
const ELECTRICAL_BUZZ_RELEASE_SEC = 0.4;

/**
 * Factory for ElectricalBuzzHandle — 60Hz sine + 120Hz / 180Hz harmonics at
 * -12dB, gain ramped 0→1.0 over 0.3sn. Sits underneath the Sprint 4 700Hz
 * global low-pass so it survives the filter as a felt-not-heard rumble.
 *
 * Owner: faz5-disk-format.ts (ELECTRICAL_BUZZ_AUDIO_OWNER decree). Faz 5
 * starts at phase entry; stopped by Faz 6's silence cascade.
 *
 * Synth: three OscillatorNodes (sine, 60/120/180Hz) summed into a single
 * GainNode → destination. Each harmonic has its own per-osc GainNode that
 * sets the relative balance (fundamental 1.0, harmonics 0.25).
 */
export function createElectricalBuzzHandle(
  context: AudioContext,
  destination: GainNode,
): ElectricalBuzzHandle {
  const reducedMotion = isReducedMotion();
  const peakGain = reducedMotion
    ? ELECTRICAL_BUZZ_REDUCED_MOTION_MAX
    : ELECTRICAL_BUZZ_PEAK_GAIN;
  const nodes = buildElectricalBuzzNodes(context, destination);
  const state: ElectricalBuzzState = { started: false, stopped: false, disposed: false };
  return {
    kind: 'electrical-buzz',
    start: (): void => startElectricalBuzz(state, nodes, context, peakGain),
    setGain: (linear: number): void => setElectricalBuzzGain(state, nodes, context, peakGain, linear),
    stop: (): void => stopElectricalBuzz(state, nodes, context),
    dispose: (): void => disposeElectricalBuzz(state, nodes),
  };
}

interface ElectricalBuzzState {
  started: boolean;
  stopped: boolean;
  disposed: boolean;
}

function startElectricalBuzz(
  state: ElectricalBuzzState,
  nodes: ElectricalBuzzNodes,
  context: AudioContext,
  peakGain: number,
): void {
  if (state.started || state.disposed) return;
  state.started = true;
  const now = context.currentTime;
  nodes.fundamental.start(now);
  nodes.harmonic2x.start(now);
  nodes.harmonic3x.start(now);
  // Sprint 8 M2 — voice-counter increment per audio source
  // (fundamental + harmonic2x + harmonic3x = 3 oscillators).
  try { incrementVoiceCount(); incrementVoiceCount(); incrementVoiceCount(); } catch { /* defensive */ }
  nodes.masterGain.gain.setValueAtTime(0, now);
  nodes.masterGain.gain.linearRampToValueAtTime(peakGain, now + ELECTRICAL_BUZZ_ATTACK_SEC);
}

function setElectricalBuzzGain(
  state: ElectricalBuzzState,
  nodes: ElectricalBuzzNodes,
  context: AudioContext,
  peakGain: number,
  linear: number,
): void {
  if (state.disposed) return;
  const target = Math.max(0, Math.min(peakGain, linear));
  const now = context.currentTime;
  nodes.masterGain.gain.cancelScheduledValues(now);
  nodes.masterGain.gain.setValueAtTime(nodes.masterGain.gain.value, now);
  nodes.masterGain.gain.linearRampToValueAtTime(target, now + 0.1);
}

function stopElectricalBuzz(
  state: ElectricalBuzzState,
  nodes: ElectricalBuzzNodes,
  context: AudioContext,
): void {
  if (state.stopped || state.disposed) return;
  state.stopped = true;
  const now = context.currentTime;
  nodes.masterGain.gain.cancelScheduledValues(now);
  nodes.masterGain.gain.setValueAtTime(nodes.masterGain.gain.value, now);
  nodes.masterGain.gain.linearRampToValueAtTime(0, now + ELECTRICAL_BUZZ_RELEASE_SEC);
  try {
    nodes.fundamental.stop(now + ELECTRICAL_BUZZ_RELEASE_SEC + 0.05);
    nodes.harmonic2x.stop(now + ELECTRICAL_BUZZ_RELEASE_SEC + 0.05);
    nodes.harmonic3x.stop(now + ELECTRICAL_BUZZ_RELEASE_SEC + 0.05);
  } catch {
    // Already stopped.
  }
}

function disposeElectricalBuzz(state: ElectricalBuzzState, nodes: ElectricalBuzzNodes): void {
  if (state.disposed) return;
  // Sprint 8 M2 — voice-counter decrement on explicit dispose.
  const wasStarted = state.started;
  state.disposed = true;
  try {
    nodes.fundamental.disconnect();
    nodes.harmonic2x.disconnect();
    nodes.harmonic3x.disconnect();
    nodes.masterGain.disconnect();
    nodes.fundamentalGain.disconnect();
    nodes.harmonic2xGain.disconnect();
    nodes.harmonic3xGain.disconnect();
  } catch {
    // Already disconnected.
  }
  if (wasStarted) {
    try {
      decrementVoiceCount();
      decrementVoiceCount();
      decrementVoiceCount();
    } catch { /* defensive */ }
  }
}

