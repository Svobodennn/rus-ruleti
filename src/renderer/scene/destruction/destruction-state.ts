/**
 * Destruction FSM transition functions — Phase 1 STUB.
 *
 * Sprint 4 Phase 1 declares signatures only. Phase 2B kraken-faz0-1 fills
 * the bodies. Keeping the stubs typed so destruction-director.ts (also
 * stubbed Phase 1) imports compile without `any`.
 *
 * Mirrors the proven pattern in src/renderer/scene/revolver/revolver-state.ts:
 *   - Pure functions, no side effects (no DOM / audio / Three.js refs).
 *   - Input: current state + event; output: next state.
 *   - Exhaustive `switch (state.kind)` with `assertNever(s)` default branch
 *     so adding a new variant forces every transition function to handle it.
 *
 * Called by:
 *   - destruction-director.ts (orchestrator — invokes each transition on
 *     the corresponding event and feeds the result back into its mutable
 *     state cell, à la revolver/index.ts MutableFsmState).
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
 * (Phase 2B) exhaustive guards.
 */
export function assertNever(s: never): never {
  throw new Error(`assertNever: unreachable destruction state ${String(s)}`);
}

/**
 * Transition: bang detected (idle → faz0). Phase 2B kraken-faz0-1 fills.
 *
 * Called by: destruction-director.ts bang-fired event handler.
 */
export function onBangFired(
  state: DestructionState,
  _nowMs: number,
): DestructionState {
  // TODO Phase 2B kraken-faz0-1: idle → faz0{startedAtMs:nowMs};
  // all other states return unchanged (faz0-N path is monotonic).
  return state;
}

/**
 * Transition: Faz 0 BANG sequence complete (faz0 → faz1). Phase 2B fills.
 *
 * Called by: destruction-director.ts after faz0-bang.runFaz0 promise resolves.
 */
export function onFaz0Complete(
  state: DestructionState,
  _os: OsVariant,
  _nowMs: number,
): DestructionState {
  // TODO Phase 2B kraken-faz0-1: faz0 → faz1{os, startedAtMs:nowMs}.
  return state;
}

/**
 * Transition: Faz 1 Critical Dialog complete (faz1 → faz2). Phase 2B fills.
 *
 * Called by: destruction-director.ts after faz1-critical-dialog.runFaz1
 * promise resolves (5s countdown ends OR user-skip via debug shortcut).
 */
export function onFaz1Complete(
  state: DestructionState,
  _nowMs: number,
): DestructionState {
  // TODO Phase 2B kraken-faz0-1: faz1 → faz2{os preserved, startedAtMs:nowMs}.
  return state;
}

/**
 * Transition: Faz 2 Takeover complete (faz2 → faz3). Phase 2B kraken-faz2-3.
 *
 * Called by: destruction-director.ts after faz2-takeover.runFaz2 resolves.
 */
export function onFaz2Complete(
  state: DestructionState,
  _nowMs: number,
): DestructionState {
  // TODO Phase 2B kraken-faz2-3: faz2 → faz3{os preserved, startedAtMs:nowMs}.
  return state;
}

/**
 * Transition: Faz 3 Terminal complete (faz3 → aborted{reason:'completed'}).
 *
 * Sprint 4 closes at faz3; Sprint 5 will replace this transition with a
 * faz3 → faz4 path. Phase 2B kraken-faz2-3 fills.
 *
 * Called by: destruction-director.ts after faz3-terminal.runFaz3 resolves.
 */
export function onFaz3Complete(state: DestructionState): DestructionState {
  // TODO Phase 2B kraken-faz2-3: faz3 → aborted{reason:'completed'}.
  return state;
}

/**
 * Transition: ESC-hold 3s detected at any Faz. Force-aborts to reveal.
 * Phase 2B kraken-faz0-1 fills (subscribes to the existing
 * window.api.onEscapeHold callback exposed by the preload bridge).
 *
 * Called by: destruction-director.ts ESC-hold subscription.
 */
export function onEscHold(state: DestructionState): DestructionState {
  // TODO Phase 2B kraken-faz0-1: any active faz → aborted{reason:'esc-hold'};
  // idle / aborted return unchanged.
  return state;
}
