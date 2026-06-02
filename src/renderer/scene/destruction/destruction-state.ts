/**
 * Destruction FSM transition functions.
 *
 * Sprint 4 Phase 2B kraken-faz0-1 fill of the Phase 1 stub bodies. Pure
 * functions — no DOM, no audio, no Three.js references. Identical contract
 * to `src/renderer/scene/revolver/revolver-state.ts`:
 *
 *   - Input: current state + event payload.
 *   - Output: next state.
 *   - Exhaustive `switch (state.kind)` with `assertNever` default.
 *
 * Sprint 4 covered idle → faz0 → faz1 → faz2 → faz3 → aborted{completed}.
 * Sprint 5 extends with faz3 → faz4 → faz5 → faz6 → faz7. Sprint 6 closes
 * the destruction sequence with faz7 → faz8-reveal → faz8-son-ekran →
 * aborted{completed}, with an R-key short-circuit from faz8-son-ekran
 * back to faz8-reveal for the restart loop (kiosk-safe re-entry; no app
 * quit per S9 closure). ESC-hold short-circuit (any active faz →
 * aborted{esc-hold}) remains.
 *
 * Called by:
 *   - destruction-director.ts (orchestrator — feeds each transition's
 *     result back into its mutable state cell, à la revolver/index.ts
 *     MutableFsmState).
 */

import type { DestructionState, OsVariant } from './types.js';

/** Initial FSM state. Director constructs at mount. */
export function initialState(): DestructionState {
  return { kind: 'idle' };
}

/**
 * Exhaustive-switch helper. Identical contract to
 * revolver-state.assertNever — compile error if `s` is not `never`.
 *
 * Called by: destruction-state.ts switch defaults + destruction-director.ts
 * exhaustive guards.
 */
export function assertNever(s: never): never {
  throw new Error(`assertNever: unreachable destruction state ${String(s)}`);
}

/**
 * Transition: bang detected (idle → faz0).
 *
 * From idle the FSM enters faz0 with the wall-clock timestamp of the bang
 * (used by the director to compute APARTMENT_BLEED_*_TRIGGER_MS offsets).
 * Every other state is monotonic — re-entry while a sequence is in flight
 * is a no-op (defence-in-depth; the director's `started` flag also guards).
 *
 * Called by: destruction-director.ts bang-fired event handler.
 */
export function onBangFired(
  state: DestructionState,
  nowMs: number,
): DestructionState {
  switch (state.kind) {
    case 'idle':
      return { kind: 'faz0', startedAtMs: nowMs };
    case 'faz0':
    case 'faz1':
    case 'faz2':
    case 'faz3':
    case 'faz4':
    case 'faz5':
    case 'faz6':
    case 'faz7':
    case 'faz8-reveal':
    case 'faz8-son-ekran':
    case 'aborted':
      return state;
    default:
      return assertNever(state);
  }
}

/**
 * Transition: Faz 0 BANG sequence complete (faz0 → faz1).
 *
 * OS variant becomes known at this transition (the director awaited
 * `window.api.getOS()` in parallel with the Faz 0 promise; the value is
 * passed in here). Faz 1/2/3 carry the OS forward.
 *
 * Called by: destruction-director.ts after faz0-bang.runFaz0 promise
 * resolves.
 */
export function onFaz0Complete(
  state: DestructionState,
  os: OsVariant,
  nowMs: number,
): DestructionState {
  switch (state.kind) {
    case 'faz0':
      return { kind: 'faz1', os, startedAtMs: nowMs };
    case 'idle':
    case 'faz1':
    case 'faz2':
    case 'faz3':
    case 'faz4':
    case 'faz5':
    case 'faz6':
    case 'faz7':
    case 'faz8-reveal':
    case 'faz8-son-ekran':
    case 'aborted':
      return state;
    default:
      return assertNever(state);
  }
}

/**
 * Transition: Faz 1 Critical Dialog complete (faz1 → faz2).
 *
 * OS preserved from the faz1 variant. Called by: destruction-director.ts
 * after faz1-critical-dialog.runFaz1 promise resolves.
 */
export function onFaz1Complete(
  state: DestructionState,
  nowMs: number,
): DestructionState {
  switch (state.kind) {
    case 'faz1':
      return { kind: 'faz2', os: state.os, startedAtMs: nowMs };
    case 'idle':
    case 'faz0':
    case 'faz2':
    case 'faz3':
    case 'faz4':
    case 'faz5':
    case 'faz6':
    case 'faz7':
    case 'faz8-reveal':
    case 'faz8-son-ekran':
    case 'aborted':
      return state;
    default:
      return assertNever(state);
  }
}

/**
 * Transition: Faz 2 Takeover complete (faz2 → faz3).
 *
 * OS preserved. Called by: destruction-director.ts after faz2-takeover.runFaz2
 * resolves. (Phase 2B kraken-faz2-3 fills the runner; this transition function
 * lives in Lane A because the FSM contract is shared.)
 */
export function onFaz2Complete(
  state: DestructionState,
  nowMs: number,
): DestructionState {
  switch (state.kind) {
    case 'faz2':
      return { kind: 'faz3', os: state.os, startedAtMs: nowMs };
    case 'idle':
    case 'faz0':
    case 'faz1':
    case 'faz3':
    case 'faz4':
    case 'faz5':
    case 'faz6':
    case 'faz7':
    case 'faz8-reveal':
    case 'faz8-son-ekran':
    case 'aborted':
      return state;
    default:
      return assertNever(state);
  }
}

/**
 * Transition: Faz 3 Terminal complete (faz3 → faz4).
 *
 * Sprint 5 promotes this transition out of the terminal `aborted{completed}`
 * state; the FSM now continues to faz4 (file wipe). OS preserved from
 * the faz3 variant.
 *
 * Called by: destruction-director.ts after faz3-terminal.runFaz3 resolves.
 */
export function onFaz3Complete(
  state: DestructionState,
  nowMs: number,
): DestructionState {
  switch (state.kind) {
    case 'faz3':
      return { kind: 'faz4', os: state.os, startedAtMs: nowMs };
    case 'idle':
    case 'faz0':
    case 'faz1':
    case 'faz2':
    case 'faz4':
    case 'faz5':
    case 'faz6':
    case 'faz7':
    case 'faz8-reveal':
    case 'faz8-son-ekran':
    case 'aborted':
      return state;
    default:
      return assertNever(state);
  }
}

/**
 * Transition: Faz 4 File Wipe complete (faz4 → faz5).
 *
 * OS preserved. Called by: destruction-director.ts after
 * faz4-file-wipe.startFaz4FileWipe resolves.
 */
export function onFaz4Complete(
  state: DestructionState,
  nowMs: number,
): DestructionState {
  switch (state.kind) {
    case 'faz4':
      return { kind: 'faz5', os: state.os, startedAtMs: nowMs };
    case 'idle':
    case 'faz0':
    case 'faz1':
    case 'faz2':
    case 'faz3':
    case 'faz5':
    case 'faz6':
    case 'faz7':
    case 'faz8-reveal':
    case 'faz8-son-ekran':
    case 'aborted':
      return state;
    default:
      return assertNever(state);
  }
}

/**
 * Transition: Faz 5 Disk Format complete (faz5 → faz6).
 *
 * OS preserved. Called by: destruction-director.ts after
 * faz5-disk-format.startFaz5DiskFormat resolves.
 */
export function onFaz5Complete(
  state: DestructionState,
  nowMs: number,
): DestructionState {
  switch (state.kind) {
    case 'faz5':
      return { kind: 'faz6', os: state.os, startedAtMs: nowMs };
    case 'idle':
    case 'faz0':
    case 'faz1':
    case 'faz2':
    case 'faz3':
    case 'faz4':
    case 'faz6':
    case 'faz7':
    case 'faz8-reveal':
    case 'faz8-son-ekran':
    case 'aborted':
      return state;
    default:
      return assertNever(state);
  }
}

/**
 * Transition: Faz 6 BSOD / Kernel Panic complete (faz6 → faz7).
 *
 * OS preserved. faz7 starts at cycleIndex 0 — the bootloop runner ticks
 * it forward via `onFaz7CycleAdvance`. Called by: destruction-director.ts
 * after faz6-bsod.startFaz6Bsod resolves.
 */
export function onFaz6Complete(
  state: DestructionState,
  nowMs: number,
): DestructionState {
  switch (state.kind) {
    case 'faz6':
      return { kind: 'faz7', os: state.os, startedAtMs: nowMs, cycleIndex: 0 };
    case 'idle':
    case 'faz0':
    case 'faz1':
    case 'faz2':
    case 'faz3':
    case 'faz4':
    case 'faz5':
    case 'faz7':
    case 'faz8-reveal':
    case 'faz8-son-ekran':
    case 'aborted':
      return state;
    default:
      return assertNever(state);
  }
}

/**
 * Transition: Faz 7 bootloop cycle advance (faz7 → faz7 with incremented
 * cycleIndex). NOT a phase transition — same-kind self-transition that
 * carries the bootloop iteration counter forward. Sprint 6 will replace
 * the Faz 7 terminal nature with a faz7 → faz8 transition; until then,
 * the loop is open-ended (director cancels via signal abort or Sprint 6
 * reveal hand-off).
 *
 * Called by: destruction-director.ts faz7 setInterval @ FAZ7_CYCLE_MS.
 */
export function onFaz7CycleAdvance(
  state: DestructionState,
): DestructionState {
  switch (state.kind) {
    case 'faz7':
      return {
        kind: 'faz7',
        os: state.os,
        startedAtMs: state.startedAtMs,
        cycleIndex: state.cycleIndex + 1,
      };
    case 'idle':
    case 'faz0':
    case 'faz1':
    case 'faz2':
    case 'faz3':
    case 'faz4':
    case 'faz5':
    case 'faz6':
    case 'faz8-reveal':
    case 'faz8-son-ekran':
    case 'aborted':
      return state;
    default:
      return assertNever(state);
  }
}

/**
 * Transition: Faz 7 Bootloop complete (faz7 → faz8-reveal).
 *
 * Sprint 6 closes the destruction sequence: the Faz 7 bootloop is
 * NO LONGER terminal — after FAZ7_DURATION_MS the runner resolves
 * and the director steps into the reveal phase. OS preserved from
 * the faz7 variant; startedAtMs captures the reveal entry timestamp
 * (used by the reveal's silence-pause / fade / dolly envelopes).
 *
 * Called by: destruction-director.ts after faz7-bootloop.startFaz7Bootloop
 * resolves at the FAZ7_DURATION_MS cap.
 */
export function onFaz7Complete(
  state: DestructionState,
  nowMs: number,
): DestructionState {
  switch (state.kind) {
    case 'faz7':
      return { kind: 'faz8-reveal', os: state.os, startedAtMs: nowMs };
    case 'idle':
    case 'faz0':
    case 'faz1':
    case 'faz2':
    case 'faz3':
    case 'faz4':
    case 'faz5':
    case 'faz6':
    case 'faz8-reveal':
    case 'faz8-son-ekran':
    case 'aborted':
      return state;
    default:
      return assertNever(state);
  }
}

/**
 * Transition: Faz 8 reveal complete (faz8-reveal → faz8-son-ekran).
 *
 * OS preserved; startedAtMs captures the son-ekran entry timestamp
 * (used by the door-close audio accent + disclaimer + restart-hint
 * timing envelopes which all key off the son-ekran start time).
 *
 * Called by: destruction-director.ts after faz8-reveal.startFaz8Reveal
 * resolves at FAZ8_REVEAL_DURATION_MS.
 */
export function onFaz8RevealComplete(
  state: DestructionState,
  nowMs: number,
): DestructionState {
  switch (state.kind) {
    case 'faz8-reveal':
      return { kind: 'faz8-son-ekran', os: state.os, startedAtMs: nowMs };
    case 'idle':
    case 'faz0':
    case 'faz1':
    case 'faz2':
    case 'faz3':
    case 'faz4':
    case 'faz5':
    case 'faz6':
    case 'faz7':
    case 'faz8-son-ekran':
    case 'aborted':
      return state;
    default:
      return assertNever(state);
  }
}

/**
 * Transition: Faz 8 son-ekran complete (faz8-son-ekran →
 * aborted{completed}).
 *
 * Terminal transition when the user does NOT press R within the
 * son-ekran window. If they DO press R, the director invokes
 * onFaz8RestartRequested instead and the FSM steps back into a
 * fresh faz8-reveal.
 *
 * Called by: destruction-director.ts after faz8-son-ekran.startFaz8SonEkran
 * resolves at FAZ8_SON_EKRAN_DURATION_MS.
 */
export function onFaz8SonEkranComplete(
  state: DestructionState,
): DestructionState {
  switch (state.kind) {
    case 'faz8-son-ekran':
      return { kind: 'aborted', reason: 'completed' };
    case 'idle':
    case 'faz0':
    case 'faz1':
    case 'faz2':
    case 'faz3':
    case 'faz4':
    case 'faz5':
    case 'faz6':
    case 'faz7':
    case 'faz8-reveal':
    case 'aborted':
      return state;
    default:
      return assertNever(state);
  }
}

/**
 * Transition: Faz 8 son-ekran R-key restart requested
 * (faz8-son-ekran → faz8-reveal).
 *
 * The ONE re-entry point in the FSM — the user presses R while the
 * son-ekran is showing and the director walks the FSM back into a
 * fresh reveal cycle. Designer §6 narrative reading: "another roll"
 * rather than "fresh boot" (the destruction never started over from
 * idle; it loops the reveal/son-ekran pair).
 *
 * KIOSK SAFETY (S9 closure): this transition MUST NOT trigger any
 * IPC exit / window close / app quit. The director's
 * requestRestart() implementation honours this by transitioning
 * STATE only (no IPC side effects). OS preserved; startedAtMs
 * captures the new reveal entry timestamp.
 *
 * Called by: destruction-director.ts requestRestart() — invoked
 * from the R-key listener in scene-mount.ts when the FSM kind is
 * 'faz8-son-ekran'.
 */
export function onFaz8RestartRequested(
  state: DestructionState,
  nowMs: number,
): DestructionState {
  switch (state.kind) {
    case 'faz8-son-ekran':
      return { kind: 'faz8-reveal', os: state.os, startedAtMs: nowMs };
    case 'idle':
    case 'faz0':
    case 'faz1':
    case 'faz2':
    case 'faz3':
    case 'faz4':
    case 'faz5':
    case 'faz6':
    case 'faz7':
    case 'faz8-reveal':
    case 'aborted':
      return state;
    default:
      return assertNever(state);
  }
}

/**
 * Transition: ESC-hold 3s detected at any active faz. Short-circuits to
 * aborted{reason:'esc-hold'}. Idle / aborted are no-ops (the director's
 * dispose chain handles cleanup; this function just records the terminal
 * state for telemetry / future Sprint 5 jump-to-reveal logic).
 *
 * Called by: destruction-director.ts ESC-hold subscription.
 */
export function onEscHold(state: DestructionState): DestructionState {
  switch (state.kind) {
    case 'faz0':
    case 'faz1':
    case 'faz2':
    case 'faz3':
    case 'faz4':
    case 'faz5':
    case 'faz6':
    case 'faz7':
    case 'faz8-reveal':
    case 'faz8-son-ekran':
      return { kind: 'aborted', reason: 'esc-hold' };
    case 'idle':
    case 'aborted':
      return state;
    default:
      return assertNever(state);
  }
}
