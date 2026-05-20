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
 * Sprint 4 covers idle → faz0 → faz1 → faz2 → faz3 → aborted{completed}
 * plus the ESC-hold short-circuit (any active faz → aborted{esc-hold}).
 * Sprint 5 will extend with faz4..faz7; Sprint 6 adds faz8 (reveal).
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
    case 'aborted':
      return state;
    default:
      return assertNever(state);
  }
}

/**
 * Transition: Faz 3 Terminal complete (faz3 → aborted{reason:'completed'}).
 *
 * Sprint 4 closes at faz3; Sprint 5 will replace this transition with a
 * faz3 → faz4 path.
 *
 * Called by: destruction-director.ts after faz3-terminal.runFaz3 resolves.
 */
export function onFaz3Complete(state: DestructionState): DestructionState {
  switch (state.kind) {
    case 'faz3':
      return { kind: 'aborted', reason: 'completed' };
    case 'idle':
    case 'faz0':
    case 'faz1':
    case 'faz2':
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
      return { kind: 'aborted', reason: 'esc-hold' };
    case 'idle':
    case 'aborted':
      return state;
    default:
      return assertNever(state);
  }
}
