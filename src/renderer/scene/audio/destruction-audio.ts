/**
 * Destruction audio extensions — Sprint 4 Phase 2B kraken-faz0-1.
 *
 * Adds the three new audio surfaces the destruction sequence owns on top of
 * the existing Sprint 1 AudioBed (ambient layers + bulb hum) and Sprint 2
 * one-shot SFX:
 *
 *   1. Bang one-shot (full -3dB) — tries to load `assets/audio/bang.ogg` via
 *      Howler; falls back to a procedural noise burst (50ms attack + 200ms
 *      decay, 2kHz high-pass) if the asset is missing OR loaderror fires.
 *      Designer §2 telif fallback contract.
 *
 *   2. Tinnitus 4kHz OscillatorNode — sine at TINNITUS_FREQ_HZ, fade-in to
 *      TINNITUS_AMPLITUDE_DB (or TINNITUS_AMPLITUDE_REDUCED_MOTION_DB under
 *      the a11y gate) over 100ms starting Faz 0 +50ms. Sustains through Faz
 *      0-3 (and Sprint 5+); released only at sequence dispose or ESC abort.
 *
 *   3. BiquadFilterNode low-pass inserted into the AudioBed master gain
 *      chain — cutoff exponentially ramps from 22000Hz to LOW_PASS_CUTOFF_HZ
 *      (700Hz) over 300ms starting Faz 0 +200ms. Holds through Sprint 4.
 *
 *   4. Native chord stub (Faz 1 entry) — three layered OscillatorNode sines
 *      (800/600/400Hz) at -10dB each, ADSR envelope 50/200/100/400ms, total
 *      ~750ms. Procedural per PLAN §10 telif decision (NO real chime / error
 *      sample bundled).
 *
 * Audio graph extension contract:
 *
 *   Existing: ambient/SFX -> master GainNode -> AudioContext.destination
 *   Phase 2B: ambient/SFX -> master GainNode -> [BiquadFilterNode lowpass] ->
 *             AudioContext.destination
 *
 * The lowpass is inserted via `insertLowPassFilter` (extends audio-bed with
 * a master-tap exposure). The tinnitus + native chord branch off the master
 * gain INPUT so they ALSO get filtered — designer §7 specifies the entire
 * mix bus goes through the lowpass during Faz 0-3, including the system
 * sounds spawned during Faz 1-2.
 *
 * Dispose chain (called by destruction-director on ESC abort or completion):
 *   - tinnitus: stop oscillator, disconnect gain
 *   - lowpass: disconnect from master chain, restore direct master ->
 *     destination wiring
 *   - bang Howl: unload (Howler frees the AudioBuffer)
 *   - native chord one-shots self-clean via `ended` event
 */

import { Howl } from 'howler';
import log from 'electron-log/renderer';
import {
  LOW_PASS_CUTOFF_HZ,
  PREFERS_REDUCED_MOTION_QUERY,
  TINNITUS_AMPLITUDE_DB,
  TINNITUS_AMPLITUDE_REDUCED_MOTION_DB,
  TINNITUS_FREQ_HZ,
} from '../../../shared/scene-destruction-constants';

/** Lowpass Q factor — designer §7 specifies 1.0 (12dB/octave). */
const LOW_PASS_Q = 1.0;
/** Initial (unfiltered) cutoff — Web Audio Nyquist-ish max. */
const LOW_PASS_INITIAL_CUTOFF_HZ = 22000;
/** Cutoff exponential ramp duration (Faz 0 +200ms designer §7). */
const LOW_PASS_RAMP_MS = 300;
/** Tinnitus fade-in duration (designer §7). */
const TINNITUS_FADE_IN_MS = 100;
/** Native chord ADSR — see destruction-direction.md §7. */
const CHORD_ATTACK_MS = 50;
const CHORD_DECAY_MS = 200;
const CHORD_SUSTAIN_MS = 100;
const CHORD_RELEASE_MS = 400;
const CHORD_PEAK_GAIN = 0.316; // -10dB linear (Math.pow(10, -10/20)).
const CHORD_SUSTAIN_FRACTION = 0.6;
/** Mac chord: 3-sine layer frequencies (designer §7). */
const CHORD_LAYER_HZ_TOP = 800;
const CHORD_LAYER_HZ_MID = 600;
const CHORD_LAYER_HZ_LOW = 400;
/** Win chord: descending 2-note (designer §7 Win variant). */
const WIN_CHORD_HZ_HIGH = 600;
const WIN_CHORD_HZ_LOW = 400;
/** Win chord stagger between the two notes (ms). */
const WIN_CHORD_STAGGER_MS = 100;
/** Path to optional bang.ogg asset (may be absent during dev). */
const BANG_OGG_PATH = 'assets/audio/bang.ogg';
/** Procedural fallback bang burst gain (-3dB ~ 0.708 linear). */
const BANG_FALLBACK_GAIN = 0.708;
/** Procedural fallback bang burst total length (50ms attack + 200ms decay). */
const BANG_FALLBACK_LENGTH_SEC = 0.25;
/** High-pass cutoff for the procedural fallback so it reads "gunshot" not "wind". */
const BANG_FALLBACK_HIGHPASS_HZ = 2000;

/** Public handle returned by `mountDestructionAudio`. */
export interface DestructionAudioHandle {
  /** Play the bang one-shot. Resolves on play attempt (does not wait for end). */
  readonly playBang: () => void;
  /**
   * Start tinnitus 4kHz oscillator. Idempotent — second call no-ops. Respects
   * reduced-motion via `TINNITUS_AMPLITUDE_REDUCED_MOTION_DB`.
   */
  readonly startTinnitus: () => void;
  /**
   * Insert BiquadFilterNode low-pass into the AudioBed master chain. Ramps
   * cutoff exponentially from 22kHz to LOW_PASS_CUTOFF_HZ over 300ms.
   * Idempotent.
   */
  readonly applyLowPass: () => void;
  /**
   * Play the procedural native chord stub (Faz 1 entry).
   * Mac: 3-sine 800+600+400Hz. Win: descending 2-note 600→400Hz.
   */
  readonly playNativeChord: (os: 'mac' | 'win') => void;
  /** Stop tinnitus, remove lowpass, unload Howl. Safe to call twice. */
  readonly dispose: () => void;
}

/** Hooks the AudioBed exposes for destruction-audio to splice the master chain. */
export interface AudioBedMasterTap {
  /** AudioContext owned by the bed — Web Audio nodes attach here. */
  readonly context: AudioContext;
  /** Master GainNode the bed wires every layer into. Phase 2B taps this. */
  readonly master: GainNode;
  /** Insert a filter between master and destination. Returns disposer. */
  readonly insertGlobalFilter: (filter: BiquadFilterNode) => () => void;
}

/**
 * Mount the destruction audio extensions onto the existing AudioBed.
 *
 * Decomposed into helpers so this builder stays under the 50-line ceiling
 * and the public handle stays declarative.
 */
export function mountDestructionAudio(
  tap: AudioBedMasterTap,
): DestructionAudioHandle {
  const ctx = tap.context;
  const reducedMotion = isReducedMotion();
  const tinnitus = buildTinnitusBranch(ctx, tap.master, reducedMotion);
  const lowpass = buildLowPassBranch(ctx, tap);
  const bang = buildBangBranch(ctx, tap.master);
  const chord = buildChordBranch(ctx, tap.master);

  return {
    playBang: bang.play,
    startTinnitus: tinnitus.start,
    applyLowPass: lowpass.apply,
    playNativeChord: (os: 'mac' | 'win'): void => chord.play(os),
    dispose: (): void => {
      tinnitus.stop();
      lowpass.dispose();
      bang.dispose();
      chord.dispose();
    },
  };
}

/* ------------------------------------------------------------------------ */
/* Helpers                                                                  */
/* ------------------------------------------------------------------------ */

function isReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;
}

/** dB to linear gain. */
function dbToLinear(db: number): number {
  return Math.pow(10, db / 20);
}

/* ------------------------------------------------------------------------ */
/* Tinnitus branch                                                          */
/* ------------------------------------------------------------------------ */

interface TinnitusBranch {
  readonly start: () => void;
  readonly stop: () => void;
}

function buildTinnitusBranch(
  ctx: AudioContext,
  destination: GainNode,
  reducedMotion: boolean,
): TinnitusBranch {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = TINNITUS_FREQ_HZ;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  osc.connect(gain).connect(destination);
  const target = dbToLinear(
    reducedMotion ? TINNITUS_AMPLITUDE_REDUCED_MOTION_DB : TINNITUS_AMPLITUDE_DB,
  );
  let started = false;
  let stopped = false;
  return {
    start: (): void => {
      if (started || stopped) return;
      started = true;
      osc.start();
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(target, now + TINNITUS_FADE_IN_MS / 1000);
    },
    stop: (): void => {
      if (stopped) return;
      stopped = true;
      try {
        if (started) osc.stop();
      } catch {
        // already stopped — safe.
      }
      osc.disconnect();
      gain.disconnect();
    },
  };
}

/* ------------------------------------------------------------------------ */
/* Low-pass branch                                                          */
/* ------------------------------------------------------------------------ */

interface LowPassBranch {
  readonly apply: () => void;
  readonly dispose: () => void;
}

function buildLowPassBranch(
  ctx: AudioContext,
  tap: AudioBedMasterTap,
): LowPassBranch {
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = LOW_PASS_INITIAL_CUTOFF_HZ;
  filter.Q.value = LOW_PASS_Q;
  let disposer: (() => void) | null = null;
  return {
    apply: (): void => {
      if (disposer !== null) return;
      disposer = tap.insertGlobalFilter(filter);
      const now = ctx.currentTime;
      filter.frequency.cancelScheduledValues(now);
      filter.frequency.setValueAtTime(LOW_PASS_INITIAL_CUTOFF_HZ, now);
      filter.frequency.exponentialRampToValueAtTime(
        LOW_PASS_CUTOFF_HZ,
        now + LOW_PASS_RAMP_MS / 1000,
      );
    },
    dispose: (): void => {
      if (disposer !== null) {
        disposer();
        disposer = null;
      }
      filter.disconnect();
    },
  };
}

/* ------------------------------------------------------------------------ */
/* Bang branch (Howler asset + procedural fallback)                         */
/* ------------------------------------------------------------------------ */

interface BangBranch {
  readonly play: () => void;
  readonly dispose: () => void;
}

function buildBangBranch(ctx: AudioContext, destination: GainNode): BangBranch {
  const state: BangBranchState = { howl: null, usedFallback: false };
  loadBangHowl(state);
  return {
    play: (): void => playBangSafe(ctx, destination, state),
    dispose: (): void => {
      if (state.howl !== null) {
        state.howl.unload();
        state.howl = null;
      }
    },
  };
}

interface BangBranchState {
  howl: Howl | null;
  usedFallback: boolean;
}

function loadBangHowl(state: BangBranchState): void {
  try {
    const howl = new Howl({
      src: [BANG_OGG_PATH],
      preload: true,
      html5: false,
      volume: BANG_FALLBACK_GAIN,
    });
    howl.on('loaderror', () => {
      // Asset missing during dev (PLAN §10 CC0 asset not yet shipped). Drop
      // to procedural fallback. Unload first to release Howler-internal
      // tracking before clearing the reference. No console.* — electron-log.
      howl.unload();
      state.howl = null;
      log.warn('destruction-audio: bang.ogg loaderror — using procedural fallback');
    });
    state.howl = howl;
  } catch (err) {
    state.howl = null;
    log.warn('destruction-audio: Howl construct failed', err);
  }
}

function playBangSafe(
  ctx: AudioContext,
  destination: GainNode,
  state: BangBranchState,
): void {
  if (state.howl !== null && state.howl.state() === 'loaded') {
    state.howl.play();
    return;
  }
  playProceduralBangFallback(ctx, destination);
}

function playProceduralBangFallback(
  ctx: AudioContext,
  destination: GainNode,
): void {
  const buffer = buildBangFallbackBuffer(ctx);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = BANG_FALLBACK_HIGHPASS_HZ;
  const gain = ctx.createGain();
  gain.gain.value = BANG_FALLBACK_GAIN;
  src.connect(hp).connect(gain).connect(destination);
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(BANG_FALLBACK_GAIN, now);
  gain.gain.linearRampToValueAtTime(0, now + BANG_FALLBACK_LENGTH_SEC);
  src.start();
  src.addEventListener('ended', () => {
    src.disconnect();
    hp.disconnect();
    gain.disconnect();
  });
  src.stop(now + BANG_FALLBACK_LENGTH_SEC + 0.01);
}

function buildBangFallbackBuffer(ctx: AudioContext): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * BANG_FALLBACK_LENGTH_SEC);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/* ------------------------------------------------------------------------ */
/* Native chord branch (Faz 1 entry)                                        */
/* ------------------------------------------------------------------------ */

interface ChordBranch {
  readonly play: (os: 'mac' | 'win') => void;
  readonly dispose: () => void;
}

function buildChordBranch(ctx: AudioContext, destination: GainNode): ChordBranch {
  return {
    play: (os: 'mac' | 'win'): void => {
      if (os === 'mac') {
        playChordLayer(ctx, destination, CHORD_LAYER_HZ_TOP, 0);
        playChordLayer(ctx, destination, CHORD_LAYER_HZ_MID, 0);
        playChordLayer(ctx, destination, CHORD_LAYER_HZ_LOW, 0);
      } else {
        playChordLayer(ctx, destination, WIN_CHORD_HZ_HIGH, 0);
        playChordLayer(ctx, destination, WIN_CHORD_HZ_LOW, WIN_CHORD_STAGGER_MS);
      }
    },
    dispose: (): void => undefined, // one-shots self-clean via `ended`.
  };
}

function playChordLayer(
  ctx: AudioContext,
  destination: GainNode,
  hz: number,
  startOffsetMs: number,
): void {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = hz;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  osc.connect(gain).connect(destination);
  const startOffset = startOffsetMs / 1000;
  scheduleChordEnvelope(ctx, gain.gain, startOffset);
  osc.start(ctx.currentTime + startOffset);
  const totalSec =
    (CHORD_ATTACK_MS + CHORD_DECAY_MS + CHORD_SUSTAIN_MS + CHORD_RELEASE_MS) / 1000;
  osc.stop(ctx.currentTime + startOffset + totalSec + 0.01);
  osc.addEventListener('ended', () => {
    osc.disconnect();
    gain.disconnect();
  });
}

function scheduleChordEnvelope(ctx: AudioContext, param: AudioParam, startOffset: number): void {
  const now = ctx.currentTime + startOffset;
  const attackEnd = now + CHORD_ATTACK_MS / 1000;
  const decayEnd = attackEnd + CHORD_DECAY_MS / 1000;
  const sustainEnd = decayEnd + CHORD_SUSTAIN_MS / 1000;
  const releaseEnd = sustainEnd + CHORD_RELEASE_MS / 1000;
  param.cancelScheduledValues(now);
  param.setValueAtTime(0, now);
  param.linearRampToValueAtTime(CHORD_PEAK_GAIN, attackEnd);
  param.linearRampToValueAtTime(
    CHORD_PEAK_GAIN * CHORD_SUSTAIN_FRACTION,
    decayEnd,
  );
  param.setValueAtTime(CHORD_PEAK_GAIN * CHORD_SUSTAIN_FRACTION, sustainEnd);
  param.linearRampToValueAtTime(0, releaseEnd);
}
