/**
 * Ambient audio bed manager.
 *
 * Owns the WebAudio AudioContext and the four PLAN §2 drone layers. Sprint 1
 * uses ambient-synth.ts factories (no real .ogg). Sprint 3+ swaps real
 * Howler-backed layers in by changing the factory map.
 *
 * Howler integration:
 *   Sprint 1 reserves a Howler-shaped facade for the Temnaya music slot so
 *   the public AudioBedHandle contract doesn't change when real samples
 *   arrive. The music slot is silent until Sprint 3 loads
 *   `assets/audio/music/temnaya-placeholder.ogg`.
 *
 * Web Audio autoplay policy:
 *   The AudioContext begins in 'suspended' state on Chromium. We resume it
 *   on first user gesture. mountAudioBed() is called from the disclaimer
 *   Continue button click handler (via scene/index.ts → scene-mount.ts →
 *   advancePastDisclaimer), which IS a user gesture. Callers MUST NOT
 *   invoke mountAudioBed on page load.
 *
 * Sprint 2+ contract:
 *   - The AudioBedHandle exposes setLayerVolume / fadeInAmbient /
 *     fadeOutAmbient / setMusicTrack / resume / dispose.
 *   - setMusicTrack receives a Howl (Sprint 3 will pass the Temnaya loop);
 *     passing null clears the slot and stops the previous music.
 *   - Designer + sound designer can re-tune AMBIENT_DEFAULT_VOLUME in
 *     audio-channels.ts without touching this file.
 */

import { Howl } from 'howler';
import {
  AMBIENT_DEFAULT_VOLUME,
  AMBIENT_FADE_MS,
  MASTER_GAIN_CEILING,
  MUSIC_DEFAULT_VOLUME,
  type AmbientLayerId,
} from '../../../shared/audio-channels';
import {
  AMBIENT_LAYERS,
  AUDIO_FADE_IN_MS,
  AUDIO_FADE_OUT_MS,
} from '../../../shared/scene-constants';
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
  /** Ramp all ambient layers from current values to their defaults. */
  fadeInAmbient: (durationMs?: number) => void;
  /** Ramp all ambient layers to zero. */
  fadeOutAmbient: (durationMs?: number) => void;
  /**
   * Install a Howl as the Temnaya music slot. Passing null clears + stops
   * the prior music. Sprint 1 is normally called with null; Sprint 3 will
   * pass the loaded Temnaya placeholder Howl.
   */
  setMusicTrack: (howl: Howl | null) => void;
  /** Resume the underlying AudioContext (no-op if already running). */
  resume: () => Promise<void>;
  /** Stop all layers + close the AudioContext + dispose Howler music slot. */
  dispose: () => Promise<void>;
}

/**
 * Mount the ambient drone bed.
 *
 * MUST be called from within a user-gesture handler (click/keydown). The
 * AudioContext is created in 'suspended' state on Chromium and explicitly
 * resumed inside this call; the returned handle is usable once the promise
 * resolves.
 */
export async function mountAudioBed(): Promise<AudioBedHandle> {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = MASTER_GAIN_CEILING;
  master.connect(ctx.destination);

  // Explicit resume — Chromium starts AudioContext suspended. Caller's
  // click handler is our user-gesture ticket out of autoplay policy.
  await ctx.resume();

  const layers = buildLayerMap(ctx, master);
  startAllLayers(layers);

  // Silent Howler placeholder for the Temnaya music slot. Real .ogg arrives
  // in Sprint 3; until then we keep a Howl instance with no audible content
  // so the mixer table in audio-channels.ts has a "music" entry. The slot
  // can be swapped at runtime via setMusicTrack(newHowl).
  const musicState: MusicSlotState = { current: createSilentMusicSlot() };

  return buildHandle(ctx, layers, musicState);
}

/** Internal mutable music slot — wrapped so setMusicTrack can swap it. */
interface MusicSlotState {
  current: Howl | null;
}

/** Build the public AudioBedHandle bound to the freshly-created resources. */
function buildHandle(
  ctx: AudioContext,
  layers: Map<AmbientLayerId, SynthLayerHandle>,
  musicState: MusicSlotState,
): AudioBedHandle {
  return {
    setLayerVolume: (
      id: AmbientLayerId,
      target: number,
      fadeMs: number = AMBIENT_FADE_MS,
    ): void => {
      const handle = layers.get(id);
      if (handle === undefined) return;
      handle.fadeTo(target, fadeMs);
    },
    fadeInAmbient: (durationMs: number = AUDIO_FADE_IN_MS): void => {
      for (const id of AMBIENT_LAYERS) {
        const handle = layers.get(id);
        if (handle === undefined) continue;
        handle.fadeTo(AMBIENT_DEFAULT_VOLUME[id], durationMs);
      }
    },
    fadeOutAmbient: (durationMs: number = AUDIO_FADE_OUT_MS): void => {
      for (const handle of layers.values()) {
        handle.fadeTo(0, durationMs);
      }
    },
    setMusicTrack: (howl: Howl | null): void => {
      swapMusicSlot(musicState, howl);
    },
    resume: async (): Promise<void> => {
      await ctx.resume();
    },
    dispose: async (): Promise<void> => {
      for (const handle of layers.values()) {
        handle.stop();
      }
      if (musicState.current !== null) {
        musicState.current.unload();
        musicState.current = null;
      }
      await ctx.close();
    },
  };
}

/** Stop the previous music slot (if any), install the new one. */
function swapMusicSlot(state: MusicSlotState, next: Howl | null): void {
  if (state.current !== null) {
    state.current.stop();
    state.current.unload();
  }
  state.current = next;
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
 * WAV data URI so the Howl loads instantly and never plays anything
 * audible. data: URIs are inert from a CSP perspective for audio because
 * we never call .play() — but production CSP `media-src` allowance is
 * documented in the renderer CSP comment for when Sprint 3 ships .ogg.
 */
function createSilentMusicSlot(): Howl {
  const silentWav =
    'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
  return new Howl({
    src: [silentWav],
    volume: MUSIC_DEFAULT_VOLUME,
    preload: true,
    html5: false,
  });
}
