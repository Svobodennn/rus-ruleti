/**
 * Ambient audio bed manager.
 *
 * Owns the WebAudio context and the four PLAN §2 drone layers. Sprint 1
 * uses ambient-synth.ts factories (no real .ogg). Sprint 3+ swaps real
 * Howler-backed layers in by changing the factory map.
 *
 * Howler integration:
 *   Sprint 1 reserves a Howler-shaped facade so the public mountAudioBed()
 *   contract doesn't change when real samples arrive. The Temnaya music
 *   placeholder is a silent Howler instance set up but never played.
 *
 * Web Audio autoplay policy:
 *   The AudioContext begins in 'suspended' state on Chromium. We resume it
 *   on first user gesture (mountAudioBed is called from the disclaimer
 *   Continue button click handler, which is a user gesture). Callers MUST
 *   invoke mountAudioBed AFTER a click/keydown, not on page load.
 */

import { Howl } from 'howler';
import {
  AMBIENT_DEFAULT_VOLUME,
  AMBIENT_FADE_MS,
  MASTER_GAIN_CEILING,
  MUSIC_DEFAULT_VOLUME,
  type AmbientLayerId,
} from '../../../shared/audio-channels';
import { AMBIENT_LAYERS } from '../../../shared/scene-constants';
import {
  createBulbHum,
  createRadioStatic,
  createWaterDrip,
  createWind,
  type SynthLayerFactory,
  type SynthLayerHandle,
} from './ambient-synth';

/** Map layer ID → synth factory. Sprint 3 may swap entries for sample players. */
const LAYER_FACTORIES: Readonly<Record<AmbientLayerId, SynthLayerFactory>> = {
  'bulb-hum': createBulbHum,
  wind: createWind,
  'radio-static': createRadioStatic,
  'water-drip': createWaterDrip,
};

/** Public handle returned from mountAudioBed. */
export interface AudioBedHandle {
  /** Fade a single layer to a target gain over duration ms. */
  setLayerVolume: (
    id: AmbientLayerId,
    target: number,
    fadeMs?: number,
  ) => void;
  /** Resume the underlying AudioContext (no-op if already running). */
  resume: () => Promise<void>;
  /** Stop all layers + close the AudioContext + dispose Howler music slot. */
  dispose: () => Promise<void>;
}

/**
 * Mount the ambient drone bed.
 *
 * MUST be called from within a user-gesture handler (click/keydown). The
 * AudioContext.resume() promise is awaited inside; the returned handle is
 * usable once the promise resolves.
 */
export async function mountAudioBed(): Promise<AudioBedHandle> {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = MASTER_GAIN_CEILING;
  master.connect(ctx.destination);

  await ctx.resume();

  const layers = buildLayerMap(ctx, master);
  startAllLayers(layers);

  // Silent Howler placeholder for the Temnaya music slot. Real .ogg arrives
  // in Sprint 3; until then we keep a Howl instance with no src so the
  // mixer table in audio-channels.ts has a "music" entry.
  const musicSlot = createSilentMusicSlot();

  return {
    setLayerVolume: (
      id: AmbientLayerId,
      target: number,
      fadeMs: number = AMBIENT_FADE_MS,
    ): void => {
      const handle = layers.get(id);
      if (handle === undefined) {
        return;
      }
      handle.fadeTo(target, fadeMs);
    },
    resume: async (): Promise<void> => {
      await ctx.resume();
    },
    dispose: async (): Promise<void> => {
      for (const handle of layers.values()) {
        handle.stop();
      }
      musicSlot.unload();
      await ctx.close();
    },
  };
}

/** Build the synth handles map from AMBIENT_LAYERS and their default volumes. */
function buildLayerMap(
  ctx: AudioContext,
  master: GainNode,
): Map<AmbientLayerId, SynthLayerHandle> {
  const layers = new Map<AmbientLayerId, SynthLayerHandle>();
  for (const id of AMBIENT_LAYERS) {
    const factory = LAYER_FACTORIES[id];
    const initialGain = AMBIENT_DEFAULT_VOLUME[id];
    const handle = factory(ctx, master, initialGain);
    layers.set(id, handle);
  }
  return layers;
}

/** Start every layer once factories have wired the graph. */
function startAllLayers(layers: Map<AmbientLayerId, SynthLayerHandle>): void {
  for (const handle of layers.values()) {
    handle.start();
  }
}

/**
 * Create a silent Howler instance to reserve the music channel.
 *
 * Howler.js refuses to construct without `src`. We pass a 1-sample silent
 * data URI so the Howl loads instantly and never plays anything audible.
 */
function createSilentMusicSlot(): Howl {
  // Minimal silent WAV (44 bytes header + 0 data bytes, base64). Howler
  // accepts a data: URI as src; the volume is set to the channel default
  // (0 in Sprint 1) and we never call .play().
  const silentWav =
    'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
  return new Howl({
    src: [silentWav],
    volume: MUSIC_DEFAULT_VOLUME,
    preload: true,
    html5: false,
  });
}
