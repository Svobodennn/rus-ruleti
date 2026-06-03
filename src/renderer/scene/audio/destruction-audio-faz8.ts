/**
 * Faz 8 audio synth factories — Sprint 6 Phase 2B Lane A fill.
 *
 * Split from destruction-audio.ts to respect the 400-line max-lines
 * lint cap. Lane A owns the body fills:
 *   - createAmbientRecoveryHandle  (Faz 8 reveal, AMBIENT_RECOVERY_AUDIO_OWNER)
 *   - createDoorCloseAccentHandle  (Faz 8 son-ekran, DOOR_CLOSE_AUDIO_OWNER)
 *
 * All handle interfaces + the DestructionOwnedAudioHandle union live
 * in destruction-audio.ts (single source of truth for the audio
 * handle types — Sprint 5 split discipline carried forward).
 *
 * Sprint 4 Lesson 3: procedural fallback IS canonical. NO .ogg /
 * .wav vendoring required — Web Audio primitives only.
 *
 * TH-S5-03 closure: factory signatures take a type-narrowed
 * `caller: typeof OWNER_CONSTANT` parameter so the compiler rejects
 * cross-lane misuse at the call site (no runtime sentinel needed
 * once the caller types are wired).
 *
 * SYNTH RECIPES (Phase 2B Lane A):
 *
 *   AmbientRecoveryHandle — "room is breathing back in" felt-bed:
 *     - Brown-noise BufferSource (low-band rumble) → BiquadFilter
 *       lowpass 400Hz → GainNode (starts at 0).
 *     - fadeIn(ms) runs linearRampToValueAtTime from 0 to
 *       linearGain(FAZ8_AUDIO_BED_BASELINE_GAIN_DB) (-24dB) over `ms`.
 *     - AbortSignal snaps gain to 0 on abort.
 *
 *   DoorCloseAccentHandle — single-fire "off-stage door thump":
 *     - OscillatorNode sine @ 70Hz (fundamental).
 *     - GainNode ADSR: attack FAZ8_DOOR_CLOSE_ATTACK_MS (5ms) to
 *       FAZ8_DOOR_CLOSE_PEAK_GAIN (0.3); decay FAZ8_DOOR_CLOSE_DECAY_MS
 *       (40ms) to peak*FAZ8_DOOR_CLOSE_SUSTAIN_RATIO (0.24); release
 *       FAZ8_DOOR_CLOSE_RELEASE_MS (200ms) to 0.
 *     - BiquadFilterNode lowpass FAZ8_DOOR_CLOSE_LOWPASS_HZ (150Hz)
 *       removes click-character; leaves only the felt-in-chest thump.
 *     - Fire-and-forget: trigger() allocates fresh nodes each call so
 *       the envelope doesn't have to be reset; nodes self-clean via
 *       the OscillatorNode `ended` event (post-stop).
 *     - Reduced-motion: -6dB amplitude (peak gain halved).
 */

import log from 'electron-log/renderer';
import {
  type AMBIENT_RECOVERY_AUDIO_OWNER,
  type DOOR_CLOSE_AUDIO_OWNER,
  FAZ8_AUDIO_BED_BASELINE_GAIN_DB,
  FAZ8_DOOR_CLOSE_ATTACK_MS,
  FAZ8_DOOR_CLOSE_DECAY_MS,
  FAZ8_DOOR_CLOSE_LOWPASS_HZ,
  FAZ8_DOOR_CLOSE_PEAK_GAIN,
  FAZ8_DOOR_CLOSE_RELEASE_MS,
  FAZ8_DOOR_CLOSE_SUSTAIN_RATIO,
  PREFERS_REDUCED_MOTION_QUERY,
  REVEAL_JINGLE_AUDIO_OWNER,
  REVEAL_JINGLE_ATTACK_MS,
  REVEAL_JINGLE_DECAY_MS,
  REVEAL_JINGLE_PEAK_DB,
  REVEAL_JINGLE_RELEASE_MS,
  REVEAL_JINGLE_SUSTAIN_LEVEL,
} from '../../../shared/scene-destruction-constants.js';
import type {
  AmbientRecoveryHandle,
  DoorCloseAccentHandle,
} from './destruction-audio.js';
import type {
  RevealJingleHandle,
  RevealJingleOptions,
} from '../destruction/types.js';

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

/** Convert dB to linear gain (10^(dB/20)). */
function dbToLinear(db: number): number {
  return Math.pow(10, db / 20);
}

/** Ambient brown-noise loop length (sec). Long enough to loop seamlessly. */
const AMBIENT_RECOVERY_BUFFER_LENGTH_SEC = 4;
/** Ambient lowpass cutoff (Hz) — only low-band rumble survives the filter. */
const AMBIENT_RECOVERY_LOWPASS_HZ = 400;
/** Door-close fundamental frequency (Hz) — felt-in-chest band. */
const DOOR_CLOSE_FUNDAMENTAL_HZ = 70;
/** Door-close reduced-motion clamp factor (-6dB ≈ 0.5 linear). */
const DOOR_CLOSE_REDUCED_MOTION_RATIO = 0.5;
/** Door-close post-release safety margin (ms) before osc.stop() fires. */
const DOOR_CLOSE_STOP_GUARD_MS = 50;

/**
 * Build a brown-noise AudioBuffer. Integrates white noise into 1/f²
 * (low-end emphasis — matches the "room is breathing" read of "low
 * tidal hum"). Normalised to ±1 to fit the downstream filter chain.
 */
function buildBrownNoiseBuffer(
  context: AudioContext,
  durationSec: number,
): AudioBuffer {
  const length = Math.floor(context.sampleRate * durationSec);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  return buffer;
}

/* ------------------------------------------------------------------------ */
/* Ambient-recovery handle factory — Faz 8 reveal                           */
/* ------------------------------------------------------------------------ */

/**
 * Factory option bag for AmbientRecoveryHandle.
 *
 * `caller` is type-narrowed to `typeof AMBIENT_RECOVERY_AUDIO_OWNER`
 * — the compiler rejects construction from any module that does not
 * import the AMBIENT_RECOVERY_AUDIO_OWNER constant (single-owner
 * decree enforced at the type level, TH-S5-03 closure).
 *
 * `audioContext` + `destination` come from the DestructionAudioHandle
 * (Sprint 4 audio chain integration point); the handle constructs
 * its own GainNode envelope under the master tap so the existing
 * Sprint 1 ambient layers stay intact.
 */
export interface CreateAmbientRecoveryHandleOptions {
  /** TH-S5-03 caller type narrowing — only faz8-reveal can construct. */
  readonly caller: typeof AMBIENT_RECOVERY_AUDIO_OWNER;
  /** Abort signal — dispose triggers when the signal fires. */
  readonly signal: AbortSignal;
  /** AudioContext from the destruction audio chain. */
  readonly audioContext: AudioContext;
  /** Master GainNode tap for envelope routing. */
  readonly destination: GainNode;
}

/** Internal node graph for the ambient-recovery handle. */
interface AmbientRecoveryNodes {
  source: AudioBufferSourceNode;
  lowpass: BiquadFilterNode;
  gain: GainNode;
}

/** Internal mutable state for the ambient-recovery handle. */
interface AmbientRecoveryState {
  started: boolean;
  fadedIn: boolean;
  disposed: boolean;
}

/**
 * Factory for AmbientRecoveryHandle — Faz 8 reveal recovery audio.
 *
 * Synth: brown-noise BufferSource (loop) → BiquadFilter (lowpass
 * 400Hz) → GainNode (starts at 0) → destination. fadeIn(ms) ramps
 * the GainNode linearly to FAZ8_AUDIO_BED_BASELINE_GAIN_DB (-24dB).
 * AbortSignal snaps gain to 0 + stops + disconnects on abort.
 */
export function createAmbientRecoveryHandle(
  opts: CreateAmbientRecoveryHandleOptions,
): AmbientRecoveryHandle {
  log.info('destruction-audio-faz8: createAmbientRecoveryHandle', {
    caller: opts.caller,
  });
  const nodes = buildAmbientRecoveryNodes(opts.audioContext, opts.destination);
  const state: AmbientRecoveryState = { started: false, fadedIn: false, disposed: false };
  const handle: AmbientRecoveryHandle = {
    kind: 'ambient-recovery',
    fadeIn: (durationMs: number): Promise<void> =>
      fadeInAmbientRecovery(state, nodes, opts.audioContext, durationMs),
    dispose: (): void => disposeAmbientRecovery(state, nodes),
  };
  attachAbortListener(opts.signal, handle);
  return handle;
}

/** Construct + wire the ambient-recovery node graph. */
function buildAmbientRecoveryNodes(
  context: AudioContext,
  destination: GainNode,
): AmbientRecoveryNodes {
  const source = context.createBufferSource();
  source.buffer = buildBrownNoiseBuffer(context, AMBIENT_RECOVERY_BUFFER_LENGTH_SEC);
  source.loop = true;
  const lowpass = context.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = AMBIENT_RECOVERY_LOWPASS_HZ;
  const gain = context.createGain();
  gain.gain.value = 0;
  source.connect(lowpass).connect(gain).connect(destination);
  return { source, lowpass, gain };
}

/**
 * Fade in the recovery bed from 0 to linearGain(-24dB) over
 * `durationMs`. Resolves after the linear ramp completes
 * (durationMs + small guard). Idempotent — second call is a no-op.
 */
function fadeInAmbientRecovery(
  state: AmbientRecoveryState,
  nodes: AmbientRecoveryNodes,
  context: AudioContext,
  durationMs: number,
): Promise<void> {
  if (state.disposed || state.fadedIn) return Promise.resolve();
  state.fadedIn = true;
  if (!state.started) {
    state.started = true;
    nodes.source.start();
  }
  const target = dbToLinear(FAZ8_AUDIO_BED_BASELINE_GAIN_DB);
  const now = context.currentTime;
  const durationSec = Math.max(durationMs, 1) / 1000;
  nodes.gain.gain.setValueAtTime(0, now);
  nodes.gain.gain.linearRampToValueAtTime(target, now + durationSec);
  return new Promise<void>((resolve): void => {
    setTimeout(resolve, durationMs);
  });
}

/** Dispose ambient-recovery: stop source + disconnect node graph. */
function disposeAmbientRecovery(
  state: AmbientRecoveryState,
  nodes: AmbientRecoveryNodes,
): void {
  if (state.disposed) return;
  state.disposed = true;
  try {
    if (state.started) nodes.source.stop();
  } catch {
    // Already stopped.
  }
  try {
    nodes.source.disconnect();
    nodes.lowpass.disconnect();
    nodes.gain.disconnect();
  } catch {
    // Already disconnected.
  }
}

/* ------------------------------------------------------------------------ */
/* Door-close-accent handle factory — Faz 8 son-ekran                       */
/* ------------------------------------------------------------------------ */

/**
 * Factory option bag for DoorCloseAccentHandle.
 *
 * `caller` is type-narrowed to `typeof DOOR_CLOSE_AUDIO_OWNER` —
 * only faz8-son-ekran can construct (TH-S5-03 closure).
 */
export interface CreateDoorCloseAccentHandleOptions {
  /** TH-S5-03 caller type narrowing — only faz8-son-ekran can construct. */
  readonly caller: typeof DOOR_CLOSE_AUDIO_OWNER;
  /** Abort signal — dispose triggers when the signal fires. */
  readonly signal: AbortSignal;
  /** AudioContext from the destruction audio chain. */
  readonly audioContext: AudioContext;
  /** Master GainNode tap for envelope routing. */
  readonly destination: GainNode;
}

/** Internal mutable state for the door-close accent handle. */
interface DoorCloseAccentState {
  disposed: boolean;
}

/**
 * Factory for DoorCloseAccentHandle — Faz 8 son-ekran door-close
 * audio accent (single-fire procedural low-frequency thump).
 *
 * Each trigger() allocates fresh nodes (OscillatorNode sine 70Hz +
 * BiquadFilter lowpass 150Hz + GainNode ADSR) so the envelope state
 * is per-fire; the nodes auto-disconnect after the release tail via
 * the OscillatorNode `ended` event. Reduced-motion clamps the peak
 * amplitude to -6dB (0.5 ratio).
 */
export function createDoorCloseAccentHandle(
  opts: CreateDoorCloseAccentHandleOptions,
): DoorCloseAccentHandle {
  log.info('destruction-audio-faz8: createDoorCloseAccentHandle', {
    caller: opts.caller,
  });
  const reducedMotion = isReducedMotion();
  const peakGain = reducedMotion
    ? FAZ8_DOOR_CLOSE_PEAK_GAIN * DOOR_CLOSE_REDUCED_MOTION_RATIO
    : FAZ8_DOOR_CLOSE_PEAK_GAIN;
  const state: DoorCloseAccentState = { disposed: false };
  const handle: DoorCloseAccentHandle = {
    kind: 'door-close-accent',
    trigger: (): void =>
      fireDoorCloseAccent(state, opts.audioContext, opts.destination, peakGain),
    dispose: (): void => {
      if (state.disposed) return;
      state.disposed = true;
    },
  };
  attachAbortListener(opts.signal, handle);
  return handle;
}

/**
 * Fire a single door-close accent. Allocates fresh osc + filter +
 * gain nodes, schedules the ADSR envelope, and stops the oscillator
 * after the release tail completes. Self-cleans via the `ended`
 * event listener which disconnects the entire branch.
 */
function fireDoorCloseAccent(
  state: DoorCloseAccentState,
  context: AudioContext,
  destination: GainNode,
  peakGain: number,
): void {
  if (state.disposed) return;
  const osc = context.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = DOOR_CLOSE_FUNDAMENTAL_HZ;
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = FAZ8_DOOR_CLOSE_LOWPASS_HZ;
  const gain = context.createGain();
  gain.gain.value = 0;
  osc.connect(filter).connect(gain).connect(destination);
  scheduleDoorCloseEnvelope(context, gain, peakGain);
  startAndScheduleStopDoorClose(context, osc, filter, gain);
}

/**
 * Schedule the ADSR envelope on the GainNode: attack to peak, decay
 * to peak*sustain, release to 0. All values driven by the Sprint 6
 * Phase 2A constants in scene-destruction-constants.ts.
 */
function scheduleDoorCloseEnvelope(
  context: AudioContext,
  gain: GainNode,
  peakGain: number,
): void {
  const now = context.currentTime;
  const attackSec = FAZ8_DOOR_CLOSE_ATTACK_MS / 1000;
  const decaySec = FAZ8_DOOR_CLOSE_DECAY_MS / 1000;
  const releaseSec = FAZ8_DOOR_CLOSE_RELEASE_MS / 1000;
  const sustainGain = peakGain * FAZ8_DOOR_CLOSE_SUSTAIN_RATIO;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peakGain, now + attackSec);
  gain.gain.linearRampToValueAtTime(sustainGain, now + attackSec + decaySec);
  gain.gain.linearRampToValueAtTime(0, now + attackSec + decaySec + releaseSec);
}

/**
 * Start the oscillator and schedule stop() after the envelope
 * completes. Wires the `ended` event listener to disconnect the
 * entire branch (self-clean — no leak on repeated triggers).
 */
function startAndScheduleStopDoorClose(
  context: AudioContext,
  osc: OscillatorNode,
  filter: BiquadFilterNode,
  gain: GainNode,
): void {
  const now = context.currentTime;
  const totalEnvelopeMs =
    FAZ8_DOOR_CLOSE_ATTACK_MS + FAZ8_DOOR_CLOSE_DECAY_MS + FAZ8_DOOR_CLOSE_RELEASE_MS;
  const stopAt = now + (totalEnvelopeMs + DOOR_CLOSE_STOP_GUARD_MS) / 1000;
  osc.addEventListener(
    'ended',
    (): void => {
      try {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
      } catch {
        // Already disconnected.
      }
    },
    { once: true },
  );
  osc.start(now);
  try {
    osc.stop(stopAt);
  } catch {
    // Already stopped.
  }
}

/* ------------------------------------------------------------------------ */
/* Shared abort wiring                                                      */
/* ------------------------------------------------------------------------ */

/**
 * Wire an AbortSignal to a disposable handle. If the signal is
 * already aborted at attach time, dispose immediately. Otherwise
 * register a once-only listener that disposes on abort.
 */
function attachAbortListener(
  signal: AbortSignal,
  handle: { dispose: () => void },
): void {
  if (signal.aborted) {
    handle.dispose();
    return;
  }
  signal.addEventListener('abort', (): void => handle.dispose(), { once: true });
}

/* ------------------------------------------------------------------------ */
/* Sprint 7 — Reveal jingle handle factory (Faz 8 reveal)                   */
/* ------------------------------------------------------------------------ */

/**
 * Factory for RevealJingleHandle — Sprint 7 Phase 1 STUB.
 *
 * Constructs the Faz 8 reveal jingle audio handle. The handle plays an
 * ADSR chord synth that rings out across the reveal envelope (a wry
 * musical cue that lands the joke twist — not triumphant resolution,
 * not alert tone). Lane A Phase 2B implements the body — Phase 1 ships
 * a no-op stub so the type surface is honoured and the Faz8Reveal
 * runner can be wired with a non-null handle.
 *
 * Synth recipe (Lane A Phase 2B SPEC):
 *   - Per chord note in REVEAL_JINGLE_CHORD_NOTES (designer Phase 2A
 *     FILL): create OscillatorNode with sine waveform at the note
 *     frequency.
 *   - Sum oscillators into a shared GainNode envelope.
 *   - ADSR via scheduled gain ramps:
 *       attack  : 0 → linearGain(REVEAL_JINGLE_PEAK_DB)
 *                 over REVEAL_JINGLE_ATTACK_MS
 *       decay   : peak → peak * REVEAL_JINGLE_SUSTAIN_LEVEL
 *                 over REVEAL_JINGLE_DECAY_MS
 *       release : sustain → 0 over REVEAL_JINGLE_RELEASE_MS
 *   - Connect envelope GainNode → opts.destinationNode.
 *   - Reduced-motion: -6dB amplitude clamp (mirror DoorCloseAccent
 *     pattern).
 *   - dispose() snaps gain to 0 + osc.stop() + disconnect graph.
 *
 * TH-S6-04 (universal owner enforcement): runtime caller-equality
 * check is the defence-in-depth fallback for `as`-cast bypass of the
 * type-level narrowing on opts.caller.
 *
 * Phase 1 STUB BODY: returns a handle with play()/dispose() as
 * no-ops (after the runtime caller check). Lane A Phase 2B replaces
 * with the actual synth graph.
 */
export function createRevealJingle(opts: RevealJingleOptions): RevealJingleHandle {
  if (opts.caller !== REVEAL_JINGLE_AUDIO_OWNER) {
    throw new Error(
      `[reveal-jingle] caller decree violation: expected ${REVEAL_JINGLE_AUDIO_OWNER}, got ${String(opts.caller)}`,
    );
  }
  log.info('destruction-audio-faz8: createRevealJingle (Sprint 7 Phase 1 STUB)', {
    caller: opts.caller, peakDb: REVEAL_JINGLE_PEAK_DB, attackMs: REVEAL_JINGLE_ATTACK_MS,
    decayMs: REVEAL_JINGLE_DECAY_MS, sustain: REVEAL_JINGLE_SUSTAIN_LEVEL,
    releaseMs: REVEAL_JINGLE_RELEASE_MS,
  });
  return {
    kind: 'reveal-jingle',
    play: (): void => { /* Lane A Phase 2B — implement ADSR chord synth */ },
    dispose: (): void => { /* Lane A Phase 2B — dispose synth graph */ },
  };
}
