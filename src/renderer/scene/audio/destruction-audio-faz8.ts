/**
 * Faz 8 audio synth factories — Sprint 6 Phase 1 SCAFFOLD.
 *
 * Split from destruction-audio.ts to respect the 400-line max-lines
 * lint cap. Lane A Phase 2B owns the body fills:
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
 * once the caller types are wired). Sprint 6 declares the caller
 * types from Phase 1 — Phase 2B Lane A inherits the narrowing.
 *
 * PHASE 2B LANE A — kraken fills body
 */

import log from 'electron-log/renderer';
import type {
  AMBIENT_RECOVERY_AUDIO_OWNER,
  DOOR_CLOSE_AUDIO_OWNER,
} from '../../../shared/scene-destruction-constants.js';
import type {
  AmbientRecoveryHandle,
  DoorCloseAccentHandle,
} from './destruction-audio.js';

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

/**
 * Factory for AmbientRecoveryHandle — Faz 8 reveal recovery audio.
 *
 * Sprint 6 Phase 1 stub: returns a handle whose `fadeIn` resolves
 * immediately (no envelope wired). Lane A Phase 2B implements the
 * gain envelope per the AmbientRecoveryHandle JSDoc.
 *
 * Lane A Phase 2B body outline:
 *   1. CONSTRUCT GainNode with initial gain 0, connect to destination.
 *   2. CONSTRUCT a low-band noise source (filtered brown noise) +
 *      sub-octave sine to simulate "room ambient is breathing
 *      back in" without re-touching Sprint 1 AudioBed master.
 *   3. fadeIn(ms): exponentialRampToValueAtTime over `ms` to a
 *      designer-chosen target gain (≈ 0.3 linear so the ambient
 *      sits BELOW the eventual Temnaya music re-establishment).
 *   4. DISPOSE: stop oscillators + disconnect nodes; idempotent.
 */
export function createAmbientRecoveryHandle(
  opts: CreateAmbientRecoveryHandleOptions,
): AmbientRecoveryHandle {
  // Phase 1 scaffold trace — Lane A replaces with real envelope wiring.
  log.info('destruction-audio-faz8: createAmbientRecoveryHandle scaffold', {
    caller: opts.caller,
    aborted: opts.signal.aborted,
  });

  let disposed = false;
  const handle: AmbientRecoveryHandle = {
    kind: 'ambient-recovery',
    fadeIn: async (_durationMs: number): Promise<void> => {
      // Phase 1 stub — Lane A implements the real envelope.
      if (disposed) return;
      return Promise.resolve();
    },
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
    },
  };

  if (opts.signal.aborted) {
    handle.dispose();
  } else {
    opts.signal.addEventListener('abort', (): void => handle.dispose(), { once: true });
  }

  return handle;
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

/**
 * Factory for DoorCloseAccentHandle — Faz 8 son-ekran door-close
 * audio accent (single-fire procedural low-frequency thump).
 *
 * Sprint 6 Phase 1 stub: returns a handle whose `trigger` is a
 * no-op. Lane A Phase 2B implements the procedural synth per the
 * DoorCloseAccentHandle JSDoc.
 *
 * Lane A Phase 2B body outline:
 *   1. trigger(): allocate fresh OscillatorNode (sine 60-80Hz) +
 *      sub-octave OscillatorNode (sine 30-40Hz) + GainNode +
 *      BiquadFilterNode (lowpass 120Hz).
 *   2. Envelope: 5ms attack, 245ms exponential decay to 0.
 *   3. Self-clean via `ended` event so repeated calls within the
 *      son-ekran window do not leak nodes.
 *   4. DISPOSE: free retained refs; idempotent.
 */
export function createDoorCloseAccentHandle(
  opts: CreateDoorCloseAccentHandleOptions,
): DoorCloseAccentHandle {
  // Phase 1 scaffold trace — Lane A replaces with real synth wiring.
  log.info('destruction-audio-faz8: createDoorCloseAccentHandle scaffold', {
    caller: opts.caller,
    aborted: opts.signal.aborted,
  });

  let disposed = false;
  const handle: DoorCloseAccentHandle = {
    kind: 'door-close-accent',
    trigger: (): void => {
      // Phase 1 stub — Lane A implements the real procedural thump.
      if (disposed) return;
    },
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
    },
  };

  if (opts.signal.aborted) {
    handle.dispose();
  } else {
    opts.signal.addEventListener('abort', (): void => handle.dispose(), { once: true });
  }

  return handle;
}
