/**
 * WebAudio-backed ambient layer synthesiser.
 *
 * Sprint 1 has NO real .ogg samples for the drone bed. This module generates
 * the four PLAN §2 layers procedurally:
 *
 *   bulb-hum     — 50Hz sine + 2nd harmonic, lowpass-filtered, with a slow
 *                  0.3Hz LFO on the gain for the "breathing" feel of an
 *                  old Soviet tungsten bulb on a weak transformer.
 *   wind         — looped white noise, lowpass at ~600Hz for distant howl,
 *                  with a slow LFO on the cutoff so the wind drifts.
 *   radio-static — looped white noise, bandpass at 1-3kHz for vacuum-tube
 *                  radio character, with a slow LFO on the gain for the
 *                  intermittent crackle pattern (PLAN §2 "AM static").
 *   water-drip   — silent in Sprint 1 (no realistic synth at low cost).
 *                  Sprint 3 swaps in water-drip.ogg via Howler.
 *
 * Each layer returns a `SynthLayerHandle` with start/stop/fadeTo methods
 * that `audio-bed.ts` consumes. The factory API is shared across all four
 * layers so audio-bed can iterate AMBIENT_LAYERS uniformly.
 *
 * Constraints:
 *   - Audio context is owned by the caller (audio-bed.ts). Each factory
 *     receives an AudioContext + a destination GainNode + an initial gain
 *     and wires its private node graph between them.
 *   - All nodes are disposed on stop() so the WebAudio graph doesn't leak
 *     when scene HMR re-mounts.
 *   - Master gain is capped upstream in audio-bed (MASTER_GAIN_CEILING).
 *   - LFOs are themselves OscillatorNodes feeding GainNode/AudioParam
 *     modulations — Chromium's audio thread executes them at sample-rate
 *     with effectively zero CPU cost.
 */

import { AMBIENT_BULB_HUM_HZ } from '../../../shared/scene-constants';
import {
  BULB_HUM_HARMONIC_GAIN,
  BULB_HUM_LFO_DEPTH_FRACTION,
  BULB_HUM_LFO_HZ,
  BULB_HUM_LOWPASS_HZ,
  BULB_HUM_LOWPASS_Q,
  RADIO_BANDPASS_HZ,
  RADIO_BANDPASS_Q,
  RADIO_LFO_DEPTH_FRACTION,
  RADIO_LFO_HZ,
  WIND_LFO_CUTOFF_DEPTH_HZ,
  WIND_LFO_HZ,
  WIND_LOWPASS_HZ,
  WIND_LOWPASS_Q,
} from '../../../shared/scene-audio-constants';
import {
  decrementVoiceCount,
  incrementVoiceCount,
} from './audio-voice-counter.js';

/** What audio-bed.ts gets back from each factory. */
export interface SynthLayerHandle {
  /** Start the layer (idempotent — second call no-ops). */
  start: () => void;
  /** Stop and tear down all WebAudio nodes for this layer. */
  stop: () => void;
  /** Linear fade to a target gain over duration ms. */
  fadeTo: (targetGain: number, durationMs: number) => void;
}

/** All synth factories share this signature. */
export type SynthLayerFactory = (
  ctx: AudioContext,
  destination: GainNode,
  initialGain: number,
) => SynthLayerHandle;

/* ------------------------------------------------------------------------ */
/* Shared helpers                                                           */
/* ------------------------------------------------------------------------ */

/** Buffer length for the noise source — 8 seconds of mono white noise. */
const NOISE_BUFFER_SECONDS = 8;

/** Generate a pre-filled noise buffer node. */
function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const length = ctx.sampleRate * NOISE_BUFFER_SECONDS;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/** Linear-ramp a gain AudioParam to target over ms, cancelling any prior ramp. */
function rampGain(param: AudioParam, target: number, durationMs: number, ctx: AudioContext): void {
  const seconds = Math.max(durationMs, 0) / 1000;
  param.cancelScheduledValues(ctx.currentTime);
  param.linearRampToValueAtTime(target, ctx.currentTime + seconds);
}

/* ------------------------------------------------------------------------ */
/* bulb-hum                                                                 */
/* ------------------------------------------------------------------------ */

/** Node graph built by buildBulbHumGraph — passed back to the factory. */
interface BulbHumGraph {
  masterGain: GainNode;
  oscFundamental: OscillatorNode;
  oscHarmonic: OscillatorNode;
  harmonicGain: GainNode;
  lowpass: BiquadFilterNode;
  lfo: OscillatorNode;
  lfoDepth: GainNode;
}

/**
 * Construct and connect the WebAudio node graph for the bulb-hum layer.
 * Returns all nodes so the factory can start, stop, and disconnect them.
 */
function buildBulbHumGraph(
  ctx: AudioContext,
  destination: AudioNode,
  gain: number,
): BulbHumGraph {
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0;
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = BULB_HUM_LOWPASS_HZ;
  lowpass.Q.value = BULB_HUM_LOWPASS_Q;
  masterGain.connect(destination);
  lowpass.connect(masterGain);

  const oscFundamental = ctx.createOscillator();
  oscFundamental.type = 'sine';
  oscFundamental.frequency.value = AMBIENT_BULB_HUM_HZ;
  oscFundamental.connect(lowpass);

  const oscHarmonic = ctx.createOscillator();
  oscHarmonic.type = 'sine';
  oscHarmonic.frequency.value = AMBIENT_BULB_HUM_HZ * 2;
  const harmonicGain = ctx.createGain();
  harmonicGain.gain.value = BULB_HUM_HARMONIC_GAIN;
  oscHarmonic.connect(harmonicGain).connect(lowpass);

  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = BULB_HUM_LFO_HZ;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = gain * BULB_HUM_LFO_DEPTH_FRACTION;
  lfo.connect(lfoDepth).connect(masterGain.gain);

  return { masterGain, oscFundamental, oscHarmonic, harmonicGain, lowpass, lfo, lfoDepth };
}

/**
 * 50Hz mains hum: fundamental + 2nd harmonic at 100Hz (sounds more "mains-y"
 * than a pure sine), lowpass-filtered at 200Hz so only the deep bottom
 * register comes through. A 0.3Hz LFO on the gain breathes ±20% — the
 * subliminal "is the bulb dimming?" feel PLAN §2 asks for.
 *
 * Graph:
 *   osc50 ─┐
 *          ├──► lowpass(200Hz) ──► gain ──► (destination)
 *   osc100─┘                            ▲
 *                                  lfo ─┘ (modulates gain)
 */
export const createBulbHum: SynthLayerFactory = (ctx, destination, gain) => {
  const g = buildBulbHumGraph(ctx, destination, gain);
  let started = false;
  return {
    start: (): void => {
      if (started) return;
      started = true;
      g.oscFundamental.start();
      g.oscHarmonic.start();
      g.lfo.start();
      // Sprint 8 Phase 4 — voice-counter: 3 oscillators (fundamental + harmonic + lfo).
      try { incrementVoiceCount(); incrementVoiceCount(); incrementVoiceCount(); } catch { /* defensive */ }
      // Gain remains at 0 — caller drives fade-in via fadeTo() once mounted.
    },
    stop: (): void => {
      const wasStarted = started;
      try {
        g.oscFundamental.stop();
        g.oscHarmonic.stop();
        g.lfo.stop();
      } catch {
        // Already stopped; safe to swallow.
      }
      g.oscFundamental.disconnect();
      g.oscHarmonic.disconnect();
      g.harmonicGain.disconnect();
      g.lfo.disconnect();
      g.lfoDepth.disconnect();
      g.lowpass.disconnect();
      g.masterGain.disconnect();
      // Sprint 8 Phase 4 — voice-counter decrement on explicit dispose.
      if (wasStarted) {
        try { decrementVoiceCount(); decrementVoiceCount(); decrementVoiceCount(); } catch { /* defensive */ }
      }
    },
    fadeTo: (target: number, durationMs: number): void => {
      rampGain(g.masterGain.gain, target, durationMs, ctx);
    },
  };
};

/* ------------------------------------------------------------------------ */
/* wind — lowpass-filtered noise with drifting cutoff                       */
/* ------------------------------------------------------------------------ */

/**
 * Distant blizzard: looped white noise → lowpass at ~600Hz so only the
 * sub-shoulder rumble comes through (no high-end "shhh"). A slow 0.12Hz
 * LFO modulates the cutoff between 400Hz and 800Hz so the wind drifts
 * the way a real outdoor draft does — never settling on one timbre.
 *
 * Graph:
 *   noise ──► lowpass(600±200Hz) ──► gain ──► (destination)
 *                     ▲
 *                lfo ─┘ (modulates cutoff frequency)
 */
export const createWind: SynthLayerFactory = (ctx, destination, _gain) => {
  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx);
  noise.loop = true;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = WIND_LOWPASS_HZ;
  lowpass.Q.value = WIND_LOWPASS_Q;

  const masterGain = ctx.createGain();
  masterGain.gain.value = 0;
  noise.connect(lowpass).connect(masterGain).connect(destination);

  // LFO drifts the cutoff ±WIND_LFO_CUTOFF_DEPTH_HZ around WIND_LOWPASS_HZ.
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = WIND_LFO_HZ;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = WIND_LFO_CUTOFF_DEPTH_HZ;
  lfo.connect(lfoDepth).connect(lowpass.frequency);

  let started = false;
  return {
    start: (): void => {
      if (started) return;
      started = true;
      noise.start();
      lfo.start();
      // Sprint 8 Phase 4 — voice-counter: 2 sources (noise BufferSource + lfo oscillator).
      try { incrementVoiceCount(); incrementVoiceCount(); } catch { /* defensive */ }
      // Gain remains at 0 — caller drives fade-in via fadeTo() once mounted.
    },
    stop: (): void => {
      const wasStarted = started;
      try {
        noise.stop();
        lfo.stop();
      } catch {
        // Already stopped.
      }
      noise.disconnect();
      lowpass.disconnect();
      lfo.disconnect();
      lfoDepth.disconnect();
      masterGain.disconnect();
      // Sprint 8 Phase 4 — voice-counter decrement on explicit dispose.
      if (wasStarted) {
        try { decrementVoiceCount(); decrementVoiceCount(); } catch { /* defensive */ }
      }
    },
    fadeTo: (target: number, durationMs: number): void => {
      rampGain(masterGain.gain, target, durationMs, ctx);
    },
  };
};

/* ------------------------------------------------------------------------ */
/* radio-static — bandpass-filtered noise with crackle LFO                  */
/* ------------------------------------------------------------------------ */

/**
 * Vacuum-tube radio static: looped white noise → bandpass at 1.5kHz (mid-
 * range vacuum-tube AM character, not the high-end "tssh" of FM), with a
 * slow 0.45Hz LFO modulating the gain by ±50% so the crackle waxes and
 * wanes the way a misaligned tube radio actually does.
 *
 * Graph:
 *   noise ──► bandpass(1.5kHz, Q=2) ──► gain ──► (destination)
 *                                         ▲
 *                                    lfo ─┘ (modulates gain — crackle)
 */
export const createRadioStatic: SynthLayerFactory = (ctx, destination, gain) => {
  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx);
  noise.loop = true;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = RADIO_BANDPASS_HZ;
  bandpass.Q.value = RADIO_BANDPASS_Q;

  const masterGain = ctx.createGain();
  masterGain.gain.value = 0;
  noise.connect(bandpass).connect(masterGain).connect(destination);

  // LFO modulates the gain by ±RADIO_LFO_DEPTH_FRACTION of `gain` for crackle.
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = RADIO_LFO_HZ;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = gain * RADIO_LFO_DEPTH_FRACTION;
  lfo.connect(lfoDepth).connect(masterGain.gain);

  let started = false;
  return {
    start: (): void => {
      if (started) return;
      started = true;
      noise.start();
      lfo.start();
      // Sprint 8 Phase 4 — voice-counter: 2 sources (noise BufferSource + lfo oscillator).
      try { incrementVoiceCount(); incrementVoiceCount(); } catch { /* defensive */ }
      // Gain remains at 0 — caller drives fade-in via fadeTo() once mounted.
    },
    stop: (): void => {
      const wasStarted = started;
      try {
        noise.stop();
        lfo.stop();
      } catch {
        // Already stopped.
      }
      noise.disconnect();
      bandpass.disconnect();
      lfo.disconnect();
      lfoDepth.disconnect();
      masterGain.disconnect();
      // Sprint 8 Phase 4 — voice-counter decrement on explicit dispose.
      if (wasStarted) {
        try { decrementVoiceCount(); decrementVoiceCount(); } catch { /* defensive */ }
      }
    },
    fadeTo: (target: number, durationMs: number): void => {
      rampGain(masterGain.gain, target, durationMs, ctx);
    },
  };
};

/* ------------------------------------------------------------------------ */
/* water-drip — silent placeholder                                          */
/* ------------------------------------------------------------------------ */

/**
 * Water drip placeholder. Sprint 3 will replace this with a real
 * water-drip.ogg loaded via Howler.load() — a procedural synth would
 * either sound fake (sine-blip) or cost too much (physical-modeling).
 * Sprint 1 returns a no-op handle so the audio-bed scaffolding compiles
 * cleanly and the mixer table in audio-channels.ts has all four layers.
 */
export const createWaterDrip: SynthLayerFactory = () => ({
  start: (): void => undefined,
  stop: (): void => undefined,
  fadeTo: (): void => undefined,
});
