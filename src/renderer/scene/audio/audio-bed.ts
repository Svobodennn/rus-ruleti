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
 *   on first user gesture. Sprint 9.1 removed the Sprint 0 Continue
 *   disclaimer gate; mountAudioBed() is now called from scene/index.ts at
 *   bootstrap (no user-gesture click precedes it). The explicit
 *   `ctx.resume()` inside this fn returns a pending promise on first
 *   load — Chromium silently honours it once the user makes the first
 *   real interaction (revolver trigger click, keydown, etc.). No
 *   audible cue is missed because the first audible event (Faz 0 BANG)
 *   waits on that same user gesture anyway.
 *
 * Sprint 2 Phase 2B (kraken-revolver) extensions:
 *   - The handle now exposes one-shot triggers for revolver SFX
 *     (`playCockSound`, `playEmptyClickSound`, `playBangSound`,
 *     `playHeartbeat`, `playSweatDrip`, `playChairCreak`) and the
 *     hold-state crossfade hooks (`fadeBreathInOut`, `bumpBulbHum`).
 *   - The SFX factories live in `revolver-sfx.ts`; they wire their own
 *     node graphs and self-clean. We just hold the factories and dispatch.
 *
 * Sprint 2+ contract:
 *   - The AudioBedHandle exposes setLayerVolume / fadeInAmbient /
 *     fadeOutAmbient / setMusicTrack / resume / dispose + the SFX methods.
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
import {
  createBangSound,
  createBreathLayer,
  createChairCreakSound,
  createCockSound,
  createEmptyClickSound,
  createHeartbeatSound,
  createSweatDripSound,
  type BreathLayerHandle,
  type OneShotPlayer,
} from './revolver-sfx';

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
  /** Cock-sound one-shot — fires on FSM idle → cocking transition. */
  playCockSound: () => void;
  /** Empty-click one-shot — fires on FSM firing(empty) → idle. */
  playEmptyClickSound: () => void;
  /** Bang one-shot — Sprint 2 placeholder white-noise burst. */
  playBangSound: () => void;
  /** Heartbeat pulse — empty click ≥ EMPTY_CLICK_HEARTBEAT_THRESHOLD. */
  playHeartbeat: () => void;
  /** Sweat-drip one-shot — empty click ≥ EMPTY_CLICK_SWEAT_THRESHOLD. */
  playSweatDrip: () => void;
  /** Chair-creak one-shot — empty click ≥ EMPTY_CLICK_CHAIR_CREAK_THRESHOLD. */
  playChairCreak: () => void;
  /**
   * Linear-ramp the breath layer's gain to `target` over `durationMs`.
   * Designer §3 calls this with target=high during hold, target=0 on
   * release.
   */
  fadeBreathInOut: (target: number, durationMs: number) => void;
  /**
   * Adjust the breath playback rate. Tension threshold (last 100ms of
   * hold) doubles this from 1.0 → 2.0 to mimic hyperventilation.
   */
  setBreathRate: (rate: number) => void;
  /**
   * Bump the bulb-hum ambient layer by `gainDb` for `durationMs`. Used by
   * the hold-state ramp to add +3dB during hold and reverse on release.
   */
  bumpBulbHum: (gainDb: number, durationMs: number) => void;
  /**
   * Sprint 4 Phase 2B kraken-faz0-1: master-chain filter tap. The
   * destruction sequence's low-pass BiquadFilterNode is spliced between
   * `master` and `AudioContext.destination`. Returns a disposer that
   * restores the direct master->destination wiring on dispose / ESC abort.
   *
   * Reentrant: subsequent inserts pile filters in series — the destruction
   * module only ever inserts ONE filter (the global low-pass) so this is
   * fine in practice; the implementation guards against double-insert by
   * checking the filter's existing connection state internally.
   */
  insertGlobalFilter: (filter: BiquadFilterNode) => () => void;
  /**
   * Sprint 4 Phase 2B kraken-faz0-1: AudioContext exposure so the
   * destruction-audio module can create its own OscillatorNode +
   * BiquadFilterNode chain on the same context (tinnitus + chord stub +
   * lowpass live on the same WebAudio graph).
   */
  readonly context: AudioContext;
  /**
   * Sprint 4 Phase 2B kraken-faz0-1: master GainNode tap. Tinnitus + native
   * chord nodes connect HERE (not at AudioContext.destination) so they ALSO
   * route through the global low-pass once installed.
   */
  readonly master: GainNode;
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
  const sfx = buildSfxBundle(ctx, master);
  sfx.breath.start();

  // Silent Howler placeholder for the Temnaya music slot. Real .ogg arrives
  // in Sprint 3; until then we keep a Howl instance with no audible content
  // so the mixer table in audio-channels.ts has a "music" entry. The slot
  // can be swapped at runtime via setMusicTrack(newHowl).
  const musicState: MusicSlotState = { current: createSilentMusicSlot() };

  return buildHandle({ ctx, master, layers, musicState, sfx });
}

/** Internal mutable music slot — wrapped so setMusicTrack can swap it. */
interface MusicSlotState {
  current: Howl | null;
}

/** Bundle of one-shot players + breath layer. */
interface SfxBundle {
  cock: OneShotPlayer;
  empty: OneShotPlayer;
  bang: OneShotPlayer;
  heartbeat: OneShotPlayer;
  sweat: OneShotPlayer;
  chair: OneShotPlayer;
  breath: BreathLayerHandle;
}

/** Build the SFX bundle (one-shots + breath layer). */
function buildSfxBundle(ctx: AudioContext, master: GainNode): SfxBundle {
  return {
    cock: createCockSound(ctx, master),
    empty: createEmptyClickSound(ctx, master),
    bang: createBangSound(ctx, master),
    heartbeat: createHeartbeatSound(ctx, master),
    sweat: createSweatDripSound(ctx, master),
    chair: createChairCreakSound(ctx, master),
    breath: createBreathLayer(ctx, master),
  };
}

/** Arguments passed to buildHandle — packed to keep that fn under 50 lines. */
interface HandleArgs {
  ctx: AudioContext;
  /**
   * Master GainNode. Sprint 4 Phase 2B exposes this on the handle so the
   * destruction module's tinnitus + chord stub nodes can attach here (and
   * thus route through the global low-pass once installed). The
   * `insertGlobalFilter` method also splices BiquadFilterNodes between this
   * and `ctx.destination`.
   */
  master: GainNode;
  layers: Map<AmbientLayerId, SynthLayerHandle>;
  musicState: MusicSlotState;
  sfx: SfxBundle;
}

/**
 * Build the public AudioBedHandle bound to the freshly-created resources.
 *
 * The handle is constructed by composing three sub-handles (ambient,
 * music, sfx). Each sub-handle is a tiny object literal under the 50-line
 * function ceiling.
 */
function buildHandle(args: HandleArgs): AudioBedHandle {
  return {
    ...buildAmbientMethods(args),
    ...buildMusicMethods(args),
    ...buildSfxMethods(args),
    ...buildMasterTapMethods(args),
    dispose: buildDisposeFn(args),
  };
}

/** AudioBedHandle methods that expose the master tap (Sprint 4). */
type MasterTapMethods = Pick<
  AudioBedHandle,
  'insertGlobalFilter' | 'context' | 'master'
>;

/**
 * Build the master-tap sub-handle. The `insertGlobalFilter` method rewires
 * the master gain output through a BiquadFilterNode between `master` and
 * `ctx.destination`. Returns a disposer that restores the direct wiring.
 *
 * Sprint 4 Phase 2B kraken-faz0-1: only the destruction-audio module uses
 * this; the destruction sequence inserts the LOW_PASS_CUTOFF_HZ filter at
 * Faz 0 entry and removes it on dispose / ESC abort.
 */
function buildMasterTapMethods(args: HandleArgs): MasterTapMethods {
  const { ctx, master } = args;
  return {
    context: ctx,
    master,
    insertGlobalFilter: (filter: BiquadFilterNode): (() => void) =>
      spliceFilterIntoMasterChain(ctx, master, filter),
  };
}

/**
 * Splice a BiquadFilterNode between master and AudioContext.destination.
 * Returns a disposer that restores the original master -> destination
 * direct connection.
 *
 * Order: master.disconnect() then master -> filter -> destination.
 */
function spliceFilterIntoMasterChain(
  ctx: AudioContext,
  master: GainNode,
  filter: BiquadFilterNode,
): () => void {
  master.disconnect();
  master.connect(filter);
  filter.connect(ctx.destination);
  return (): void => {
    try {
      master.disconnect();
      filter.disconnect();
    } catch {
      // already disconnected — safe.
    }
    master.connect(ctx.destination);
  };
}

/** AudioBedHandle methods that touch the ambient drone layers. */
type AmbientMethods = Pick<
  AudioBedHandle,
  'setLayerVolume' | 'fadeInAmbient' | 'fadeOutAmbient' | 'bumpBulbHum'
>;

/** Ambient sub-handle. Touches `layers` only. */
function buildAmbientMethods(args: HandleArgs): AmbientMethods {
  const { layers } = args;
  return {
    setLayerVolume: (id, target, fadeMs = AMBIENT_FADE_MS): void => {
      layers.get(id)?.fadeTo(target, fadeMs);
    },
    fadeInAmbient: (durationMs = AUDIO_FADE_IN_MS): void => {
      for (const id of AMBIENT_LAYERS) {
        layers.get(id)?.fadeTo(AMBIENT_DEFAULT_VOLUME[id], durationMs);
      }
    },
    fadeOutAmbient: (durationMs = AUDIO_FADE_OUT_MS): void => {
      for (const handle of layers.values()) {
        handle.fadeTo(0, durationMs);
      }
    },
    bumpBulbHum: (gainDb: number, durationMs: number): void => {
      const baseVol = AMBIENT_DEFAULT_VOLUME['bulb-hum'];
      const ratio = Math.pow(10, gainDb / 20);
      layers.get('bulb-hum')?.fadeTo(baseVol * ratio, durationMs);
    },
  };
}

/** AudioBedHandle methods that touch the music/Howler slot + AudioContext. */
type MusicMethods = Pick<
  AudioBedHandle,
  'setMusicTrack' | 'resume'
>;

/** Music sub-handle. Touches `musicState` and `ctx` only. */
function buildMusicMethods(args: HandleArgs): MusicMethods {
  const { ctx, musicState } = args;
  return {
    setMusicTrack: (howl: Howl | null): void => {
      swapMusicSlot(musicState, howl);
    },
    resume: async (): Promise<void> => {
      await ctx.resume();
    },
  };
}

/** AudioBedHandle methods that route to the SFX bundle. */
type SfxMethods = Pick<
  AudioBedHandle,
  | 'playCockSound' | 'playEmptyClickSound' | 'playBangSound'
  | 'playHeartbeat' | 'playSweatDrip' | 'playChairCreak'
  | 'fadeBreathInOut' | 'setBreathRate'
>;

/** SFX sub-handle. Touches `sfx` bundle only. */
function buildSfxMethods(args: HandleArgs): SfxMethods {
  const { sfx } = args;
  return {
    playCockSound: (): void => sfx.cock.play(),
    playEmptyClickSound: (): void => sfx.empty.play(),
    playBangSound: (): void => sfx.bang.play(),
    playHeartbeat: (): void => sfx.heartbeat.play(),
    playSweatDrip: (): void => sfx.sweat.play(),
    playChairCreak: (): void => sfx.chair.play(),
    fadeBreathInOut: (target: number, durationMs: number): void => {
      sfx.breath.setGain(target, durationMs);
    },
    setBreathRate: (rate: number): void => sfx.breath.setPlaybackRate(rate),
  };
}

/** Build the dispose() function — stops ambient + SFX + music, closes context. */
function buildDisposeFn(args: HandleArgs): () => Promise<void> {
  const { ctx, layers, musicState, sfx } = args;
  return async (): Promise<void> => {
    for (const handle of layers.values()) {
      handle.stop();
    }
    sfx.breath.stop();
    if (musicState.current !== null) {
      musicState.current.unload();
      musicState.current = null;
    }
    await ctx.close();
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
