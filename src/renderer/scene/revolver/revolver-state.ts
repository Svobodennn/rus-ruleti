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
  HOLD_DURATION_MS,
} from '../../../shared/scene-revolver-constants';
import type { AnimClipName } from './revolver-anim';

export type { AnimClipName };

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
 * Mouse-down transition. Only meaningful from `idle` → `cocking`. Every
 * other state is a no-op (the input layer also debounces, but defensive
 * exhaustive coverage gives compile-time safety if a new state is added).
 */
export function onMouseDown(
  state: RevolverState,
  nowMs: number,
): RevolverState {
  switch (state.kind) {
    case 'idle':
      return { kind: 'cocking', holdStartMs: nowMs };
    case 'cocking':
      return state;
    case 'spinning':
      return state;
    case 'firing':
      return state;
    case 'reveal-lite':
      return state;
    default:
      return assertNever(state);
  }
}

/**
 * Mouse-up transition.
 *
 * From `cocking`:
 *   - held < HOLD_DURATION_MS → idle (mount layer checks against
 *     EARLY_RELEASE_MS to decide whether to show "Karar veremedin."
 *     or do a silent spring-back).
 *   - held >= HOLD_DURATION_MS → spinning (rngOutcome resolved now).
 *
 * All other states → no-op. Exhaustive switch ensures compile error if a
 * new state variant is added without handling it here.
 */
export function onMouseUp(
  state: RevolverState,
  nowMs: number,
  rng: () => TriggerOutcome,
): RevolverState {
  switch (state.kind) {
    case 'cocking': {
      const heldMs = nowMs - state.holdStartMs;
      if (heldMs < HOLD_DURATION_MS) {
        return { kind: 'idle' };
      }
      return { kind: 'spinning', rngOutcome: rng() };
    }
    case 'idle':
      return state;
    case 'spinning':
      return state;
    case 'firing':
      return state;
    case 'reveal-lite':
      return state;
    default:
      return assertNever(state);
  }
}

/**
 * Animation-complete transition. Driven by the AnimationMixer's `finished`
 * event for the clip whose name is passed in. Idle clips don't normally
 * complete (they loop); we accept the input for completeness and ignore.
 *
 * The `revealLite` flag is forwarded from the mount layer (which owns the
 * empty-click counter): if the 6th consecutive empty has just resolved,
 * route the final transition to `reveal-lite` instead of back to `idle`.
 *
 * Exhaustive switch on state.kind gives compile-time safety when new
 * states are added.
 */
export function onAnimationComplete(
  state: RevolverState,
  clip: AnimClipName,
  revealLite: boolean = false,
): RevolverState {
  switch (state.kind) {
    case 'spinning':
      if (clip === 'spin') {
        return { kind: 'firing', outcome: state.rngOutcome };
      }
      return state;
    case 'firing':
      if (clip === 'fall' || clip === 'kick') {
        if (state.outcome === 'bang') {
          return state;
        }
        return revealLite ? { kind: 'reveal-lite' } : { kind: 'idle' };
      }
      return state;
    case 'idle':
      return state;
    case 'cocking':
      return state;
    case 'reveal-lite':
      return state;
    default:
      return assertNever(state);
  }
}
