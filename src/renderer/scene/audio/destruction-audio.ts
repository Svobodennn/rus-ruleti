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

/**
 * Sprint 5 audio handle union — owner-keyed pool entries. Lane A registers
 * HDD-grind + fan-overdrive + electrical-buzz from Faz 4/5; Lane B retrieves
 * the fan-overdrive handle in Faz 6 to silence it before Faz 7 entry. The
 * union keeps the registry strongly typed without an `unknown` cast at the
 * Lane B retrieval site.
 */
export type DestructionOwnedAudioHandle =
  | HDDGrindHandle
  | FanOverdriveHandle
  | ElectricalBuzzHandle
  | BSODBeepHandle
  | ElectricalTickHandle;

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
  /**
   * Sprint 5 — AudioContext exposure so the destruction lane runners can
   * construct their own synth handle chains (HDD-grind, fan-overdrive,
   * electrical buzz) without re-routing through the AudioBed surface.
   */
  readonly context: AudioContext;
  /**
   * Sprint 5 — master GainNode tap. Lane A's synth handles connect HERE so
   * they ALSO route through the global low-pass (the disk-grind muffle
   * reading is the intended audio aesthetic — designer §15).
   */
  readonly destination: GainNode;
  /**
   * Sprint 5 — owner-keyed audio handle registry. Lane A registers HDD-grind
   * and fan-overdrive in Faz 4 and electrical-buzz in Faz 5. Lane B retrieves
   * the fan-overdrive handle in Faz 6 to silence it before Faz 7. Single
   * source of truth for cross-lane audio handoff (TH-S4-01 closure — owner
   * constants in scene-destruction-constants.ts gate every registration).
   */
  readonly registerOwnedAudio: (owner: string, handle: DestructionOwnedAudioHandle) => void;
  /**
   * Sprint 5 — retrieve a previously registered handle by owner constant.
   * Returns `undefined` if no handle has been registered under that owner
   * (caller should treat absence as "phase ran without instantiating this
   * surface", e.g. reduced-motion fast-path).
   */
  readonly getOwnedAudio: (owner: string) => DestructionOwnedAudioHandle | undefined;
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
  const audioPool = new Map<string, DestructionOwnedAudioHandle>();

  return {
    playBang: bang.play,
    startTinnitus: tinnitus.start,
    applyLowPass: lowpass.apply,
    playNativeChord: (os: 'mac' | 'win'): void => chord.play(os),
    context: ctx,
    destination: tap.master,
    registerOwnedAudio: (owner, handle): void => {
      audioPool.set(owner, handle);
    },
    getOwnedAudio: (owner): DestructionOwnedAudioHandle | undefined =>
      audioPool.get(owner),
    dispose: (): void => {
      // Sprint 5 owner-pool teardown — every Lane-registered handle disposed
      // before the Sprint 4 tinnitus + lowpass + bang + chord chain is torn
      // down. The owner pool is the canonical hand-off site for Faz 4-7
      // synths; reverse-allocation order preserved.
      for (const handle of audioPool.values()) {
        try {
          handle.dispose();
        } catch (err) {
          log.warn('destruction-audio: owned handle dispose threw', err);
        }
      }
      audioPool.clear();
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

/* ========================================================================== */
/* SPRINT 5 — Faz 4-7 procedural synth handle scaffolds (TH-S4-03 closure)   */
/*                                                                            */
/* Procedural fallback IS the canonical ship path (Sprint 4 Lesson 3 — bang  */
/* + tinnitus + native chord all shipped procedural without vendoring .ogg). */
/* Sprint 5 extends to: HDD-grind, fan-overdrive, BSOD beep, electrical      */
/* tick — all built from Web Audio primitives. NO .ogg / .wav vendoring     */
/* required.                                                                  */
/*                                                                            */
/* Procedural recipes (Lane A + Lane B implement):                            */
/*   - HDD-grind:      brown noise filtered band-pass 200-800Hz + periodic   */
/*                     2Hz amplitude punches via sine LFO                     */
/*   - Fan-overdrive:  pink noise high-pass 1.5kHz, gain ramped 0→0.8 over   */
/*                     4sn then sustained                                     */
/*   - BSOD-beep:      square wave FAZ6_BSOD_BEEP_HZ (800Hz), 200ms, ADSR    */
/*                     (5/0/1/195ms — short attack, all sustain, brief rel)  */
/*   - Electrical-tick: low-pass-filtered click @ FAZ7_ELECTRICAL_TICK_HZ    */
/*                     (0.5Hz = one tick per 2 seconds)                       */
/* ========================================================================== */

/**
 * HDD-grind handle — Faz 4 file-wipe ambient layer. Brown-noise band-pass
 * with periodic amplitude punches simulating mechanical disk grinding.
 *
 * Owner: faz4-file-wipe.ts (HDD_GRIND_AUDIO_OWNER decree). Sustained
 * through Faz 4 + Faz 5 (Faz 5 inherits the handle via shared director
 * runtime; calls `setVolume()` only, never re-constructs).
 *
 * Reduced-motion: amplitude -6dB at start; full amplitude otherwise.
 */
export interface HDDGrindHandle {
  readonly kind: 'hdd-grind';
  /** Start the brown-noise generator + envelope. Idempotent. */
  start(): void;
  /** Set output linear gain (0-1). Faz 5 calls this for sustain shaping. */
  setVolume(linear: number): void;
  /** Stop the generator. Safe to call before start (no-op). */
  stop(): void;
  /** Disconnect + free nodes. Safe to call twice. */
  dispose(): void;
}

/**
 * Fan-overdrive handle — Faz 4-6 sustained sustained pink-noise high-pass.
 * Simulates cooling fan ramped past its designed speed.
 *
 * Owner: faz4-file-wipe.ts (FAN_OVERDRIVE_AUDIO_OWNER decree). Faz 5
 * sustains via `setGain`; Faz 6 calls `stop()` at end before Faz 7 entry.
 *
 * Reduced-motion: peak gain -6dB.
 */
export interface FanOverdriveHandle {
  readonly kind: 'fan-overdrive';
  /** Start the pink-noise generator + gain ramp (4sn 0→0.8). Idempotent. */
  start(): void;
  /** Set output linear gain (0-1). Faz 5/6 may modulate. */
  setGain(linear: number): void;
  /** Stop the generator. Safe to call before start (no-op). */
  stop(): void;
  /** Disconnect + free nodes. Safe to call twice. */
  dispose(): void;
}

/**
 * BSOD-beep handle — Faz 6 single-fire square wave + ADSR envelope.
 *
 * Owner: faz6-bsod.ts (BSOD_BEEP_AUDIO_OWNER decree). One-shot — `play()`
 * fires once at Faz 6 entry; the OscillatorNode auto-cleans via `ended`
 * event. Reduced-motion: -6dB amplitude.
 */
export interface BSODBeepHandle {
  readonly kind: 'bsod-beep';
  /** Fire the beep. Idempotent within FAZ6_BSOD_BEEP_MS — re-plays after. */
  play(): void;
  /** Free any retained references. Safe to call twice. */
  dispose(): void;
}

/**
 * Electrical-tick handle — Faz 7 0.5Hz low-pass-filtered click loop.
 * Simulates dead system stray-current twitch.
 *
 * Owner: faz7-bootloop.ts (ELECTRICAL_TICK_AUDIO_OWNER decree).
 * Reduced-motion: silence (functional cue, not necessary).
 */
export interface ElectricalTickHandle {
  readonly kind: 'electrical-tick';
  /** Start the 0.5Hz click loop. Idempotent. */
  start(): void;
  /** Stop the loop. Safe to call before start (no-op). */
  stop(): void;
  /** Disconnect + free nodes. Safe to call twice. */
  dispose(): void;
}

/**
 * Electrical-buzz handle — Faz 5 disk-format 60Hz ambient mains-hum layer.
 * Sine fundamental + 120Hz/180Hz harmonics at -12dB; low-pass-rolled so the
 * read is "felt-not-heard rumble" (designer §15). Sits underneath the
 * Sprint 4 700Hz global low-pass so the buzz survives the filter intact.
 *
 * Owner: faz5-disk-format.ts (ELECTRICAL_BUZZ_AUDIO_OWNER decree). Faz 5
 * constructs + registers; Faz 6 entry dispose-chains it via the audio
 * pool teardown (no cross-faz consumer — single-faz lifecycle).
 *
 * Reduced-motion: amplitude -6dB at start; full amplitude otherwise.
 */
export interface ElectricalBuzzHandle {
  readonly kind: 'electrical-buzz';
  /** Start the 60Hz oscillator + ramp to peak gain. Idempotent. */
  start(): void;
  /** Set output linear gain (0-1). */
  setGain(linear: number): void;
  /** Stop the oscillator. Safe to call before start (no-op). */
  stop(): void;
  /** Disconnect + free nodes. Safe to call twice. */
  dispose(): void;
}

/* ------------------------------------------------------------------------ */
/* Faz 4 + Faz 5 synth factories — Lane A owns; extracted to its own file   */
/* (destruction-audio-faz45.ts) to keep this module under the 400-line cap. */
/* Re-exported here so callers can `import { createHDDGrindHandle } from    */
/* '../audio/destruction-audio'` without knowing about the split.           */
/* ------------------------------------------------------------------------ */

export {
  createElectricalBuzzHandle,
  createFanOverdriveHandle,
  createHDDGrindHandle,
} from './destruction-audio-faz45';

/* ------------------------------------------------------------------------ */
/* Faz 6 + Faz 7 synth factories — Lane B owns; extracted to its own file   */
/* (destruction-audio-faz67.ts) to keep this module under the 400-line cap. */
/* Re-exported here so callers can `import { createBSODBeepHandle } from    */
/* '../audio/destruction-audio'` without knowing about the split.           */
/* ------------------------------------------------------------------------ */

export {
  createBSODBeepHandle,
  createElectricalTickHandle,
} from './destruction-audio-faz67';
