/**
 * WebAudio-backed ambient layer synthesiser.
 *
 * Sprint 1 has NO real .ogg samples for the drone bed. This module generates
 * the four PLAN §2 layers procedurally:
 *
 *   bulb-hum     — 50Hz sine oscillator (Soviet/EU grid mains hum).
 *   wind         — band-pass-filtered white noise, drifting LFO on cutoff.
 *   radio-static — high-pass-filtered noise burst.
 *   water-drip   — silent in Sprint 1 (no realistic synth at low cost).
 *
 * Each layer returns a `LayerHandle` with start/stop/fade methods compatible
 * with what `audio-bed.ts` consumes. Sprint 3 swaps real .ogg-backed Howler
 * instances by changing the factory in audio-bed.ts; this synth file becomes
 * a dev fallback.
 *
 * Constraints:
 *   - Audio context is owned by the caller (audio-bed.ts). Each factory
 *     receives an AudioContext + a master GainNode and wires nodes into it.
 *   - All nodes are disposed on stop() so the WebAudio graph doesn't leak.
 *   - 0 dB output is impossible — master gain is capped (MASTER_GAIN_CEILING).
 */

import { AMBIENT_BULB_HUM_HZ } from '../../../shared/scene-constants';

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
/* bulb-hum                                                                 */
/* ------------------------------------------------------------------------ */

/**
 * 50Hz sine + 100Hz harmonic for fundamental + first harmonic (sounds more
 * "mains-y" than a single sine).
 */
export const createBulbHum: SynthLayerFactory = (ctx, destination, gain) => {
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0;
  masterGain.connect(destination);

  const oscFundamental = ctx.createOscillator();
  oscFundamental.type = 'sine';
  oscFundamental.frequency.value = AMBIENT_BULB_HUM_HZ;
  oscFundamental.connect(masterGain);

  const oscHarmonic = ctx.createOscillator();
  oscHarmonic.type = 'sine';
  oscHarmonic.frequency.value = AMBIENT_BULB_HUM_HZ * 2;
  const harmonicGain = ctx.createGain();
  harmonicGain.gain.value = 0.35;
  oscHarmonic.connect(harmonicGain).connect(masterGain);

  let started = false;
  const start = (): void => {
    if (started) {
      return;
    }
    started = true;
    oscFundamental.start();
    oscHarmonic.start();
    masterGain.gain.linearRampToValueAtTime(
      gain,
      ctx.currentTime + 0.5,
    );
  };

  const stop = (): void => {
    try {
      oscFundamental.stop();
      oscHarmonic.stop();
    } catch {
      // Already stopped; safe to swallow.
    }
    oscFundamental.disconnect();
    oscHarmonic.disconnect();
    harmonicGain.disconnect();
    masterGain.disconnect();
  };

  const fadeTo = (target: number, durationMs: number): void => {
    const seconds = Math.max(durationMs, 0) / 1000;
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(target, ctx.currentTime + seconds);
  };

  return { start, stop, fadeTo };
};

/* ------------------------------------------------------------------------ */
/* wind — band-pass filtered noise                                          */
/* ------------------------------------------------------------------------ */

/** Buffer length for the noise source — 2 seconds of mono white noise. */
const NOISE_BUFFER_SECONDS = 2;

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

export const createWind: SynthLayerFactory = (ctx, destination, gain) => {
  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx);
  noise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 220;
  filter.Q.value = 0.6;

  const masterGain = ctx.createGain();
  masterGain.gain.value = 0;
  noise.connect(filter).connect(masterGain).connect(destination);

  let started = false;
  const start = (): void => {
    if (started) {
      return;
    }
    started = true;
    noise.start();
    masterGain.gain.linearRampToValueAtTime(gain, ctx.currentTime + 1.2);
  };
  const stop = (): void => {
    try {
      noise.stop();
    } catch {
      // Already stopped.
    }
    noise.disconnect();
    filter.disconnect();
    masterGain.disconnect();
  };
  const fadeTo = (target: number, durationMs: number): void => {
    const seconds = Math.max(durationMs, 0) / 1000;
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(target, ctx.currentTime + seconds);
  };
  return { start, stop, fadeTo };
};

/* ------------------------------------------------------------------------ */
/* radio-static — high-pass noise                                           */
/* ------------------------------------------------------------------------ */

export const createRadioStatic: SynthLayerFactory = (
  ctx,
  destination,
  gain,
) => {
  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx);
  noise.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 3500;
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0;
  noise.connect(filter).connect(masterGain).connect(destination);

  let started = false;
  return {
    start: (): void => {
      if (started) {
        return;
      }
      started = true;
      noise.start();
      masterGain.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.8);
    },
    stop: (): void => {
      try {
        noise.stop();
      } catch {
        // Already stopped.
      }
      noise.disconnect();
      filter.disconnect();
      masterGain.disconnect();
    },
    fadeTo: (target: number, durationMs: number): void => {
      const seconds = Math.max(durationMs, 0) / 1000;
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(
        target,
        ctx.currentTime + seconds,
      );
    },
  };
};

/* ------------------------------------------------------------------------ */
/* water-drip — silent placeholder                                          */
/* ------------------------------------------------------------------------ */

/**
 * Water drip placeholder. Sprint 3 swaps in a real .ogg loop. Sprint 1
 * returns a no-op handle so the audio-bed scaffolding compiles cleanly
 * and the mixer table in audio-channels.ts has all four layers.
 */
export const createWaterDrip: SynthLayerFactory = () => ({
  start: (): void => undefined,
  stop: (): void => undefined,
  fadeTo: (): void => undefined,
});
