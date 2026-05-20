/**
 * Revolver finite-state machine.
 *
 * Pure transition functions. No side effects (no DOM, no audio, no Three.js
 * references). All inputs are explicit parameters; all outputs are the next
 * RevolverState. This is the testable seam Phase 2 kraken-revolver targets
 * for unit tests — "given state X and input Y, expect state Z".
 *
 * State diagram (PLAN §5 + §6):
 *
 *   idle ──mousedown──> cocking ──hold≥1s──> spinning
 *                          ↓                    │
 *                         (hold<0.3s)         (spin done)
 *                          ↓                    │
 *                         idle               firing (empty | bang)
 *                                                │
 *                                          (anim done)
 *                                                │
 *                            ┌───────────────────┴───┐
 *                            ↓                       ↓
 *                          idle (empty)          [destruction]
 *                            ↓
 *                       reveal-lite  (only at 6th consecutive empty)
 *
 * The 6th-consecutive-empty → reveal-lite branch is enforced by the
 * empty-click counter held in the mount layer (revolver/index.ts). This
 * pure-FSM does not own the counter; it accepts the next outcome from the
 * RNG seam and emits the right state. The mount layer decides whether to
 * forward `'reveal-lite'` instead of `'empty'` to onAnimationComplete.
 *
 * Phase 2 ownership:
 *   - kraken-revolver fleshes out transition logic, adds property tests.
 *   - Designer/i18n agents do NOT touch this file.
 */

import {
  EARLY_RELEASE_MS,
  HOLD_DURATION_MS,
} from '../../../shared/scene-revolver-constants';

/** Animation clip names — also exported from revolver-anim.ts. */
export type AnimClipName = 'idle' | 'cock' | 'spin' | 'fall' | 'kick';

/** Trigger pull outcome from the RNG seam. */
export type TriggerOutcome = 'empty' | 'bang';

/**
 * Revolver state — discriminated union. `kind` is the discriminator; every
 * other field is specific to the variant. Switch on `kind` with
 * `assertNever(s)` in the `default` branch so adding a new state forces
 * every switch in the codebase to handle it (compile error otherwise).
 */
export type RevolverState =
  | { kind: 'idle' }
  | { kind: 'cocking'; holdStartMs: number }
  | { kind: 'spinning'; rngOutcome: TriggerOutcome }
  | { kind: 'firing'; outcome: TriggerOutcome }
  | { kind: 'reveal-lite' };

/** Exhaustive-switch helper. Compile error if `s` is not `never`. */
export function assertNever(s: never): never {
  // The thrown error is a defence-in-depth — TypeScript would not let a
  // caller reach this branch without first widening the union. The string
  // payload is the runtime-visible shape so devtools shows what was missed.
  throw new Error(`assertNever: unreachable state ${String(s)}`);
}

/**
 * Mouse-down transition. Only meaningful from `idle` → `cocking`. Pressing
 * the trigger again from any other state is a no-op (the FSM ignores it; the
 * input layer should also debounce, but defensive equality is cheap).
 */
export function onMouseDown(
  state: RevolverState,
  nowMs: number,
): RevolverState {
  if (state.kind !== 'idle') {
    return state;
  }
  return { kind: 'cocking', holdStartMs: nowMs };
}

/**
 * Mouse-up transition.
 *
 * From `cocking`:
 *   - held < EARLY_RELEASE_MS → idle (no spin; "Karar veremedin." message
 *     is surfaced by the mount layer reading the FSM transition).
 *   - held >= EARLY_RELEASE_MS but < HOLD_DURATION_MS → idle (spring-back).
 *   - held >= HOLD_DURATION_MS → spinning (rngOutcome resolved now).
 *
 * From any other state → no-op.
 */
export function onMouseUp(
  state: RevolverState,
  nowMs: number,
  rng: () => TriggerOutcome,
): RevolverState {
  if (state.kind !== 'cocking') {
    return state;
  }
  const heldMs = nowMs - state.holdStartMs;
  if (heldMs < EARLY_RELEASE_MS) {
    return { kind: 'idle' };
  }
  if (heldMs < HOLD_DURATION_MS) {
    return { kind: 'idle' };
  }
  return { kind: 'spinning', rngOutcome: rng() };
}

/**
 * Animation-complete transition. Driven by the AnimationMixer's `finished`
 * event for the clip whose name is passed in. Idle clips don't normally
 * complete (they loop); we accept the input for completeness and ignore.
 *
 * The `revealLite` flag is forwarded from the mount layer (which owns the
 * empty-click counter): if the 6th consecutive empty has just resolved,
 * route the final transition to `reveal-lite` instead of back to `idle`.
 */
export function onAnimationComplete(
  state: RevolverState,
  clip: AnimClipName,
  revealLite: boolean = false,
): RevolverState {
  if (state.kind === 'spinning' && clip === 'spin') {
    return { kind: 'firing', outcome: state.rngOutcome };
  }
  if (state.kind === 'firing' && (clip === 'fall' || clip === 'kick')) {
    if (state.outcome === 'bang') {
      return state;
    }
    return revealLite ? { kind: 'reveal-lite' } : { kind: 'idle' };
  }
  return state;
}
