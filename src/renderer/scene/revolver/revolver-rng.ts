/**
 * Trigger-pull RNG — pure function with an injectable random source.
 *
 * PLAN §5 contract:
 *   - 1/6 probability of 'bang', 5/6 probability of 'empty'.
 *   - Use crypto.getRandomValues — predictability is a flaw here (a
 *     timing attack on Math.random would let a curious user see the
 *     outcome before the spin animation lands, breaking the joke).
 *
 * Two exports:
 *   1. `pullTrigger()` — production. Reads from `crypto.getRandomValues`.
 *   2. `pullTriggerWithSource(source)` — test seam. Inject a deterministic
 *      source to write unit tests like "100 calls with source returning N
 *      should yield N/6 bangs (±10%)" (PLAN §13 functional test). Phase 2
 *      kraken-revolver writes those tests.
 *
 * Both functions are intentionally tiny — keep the FSM-driving call site
 * obvious and bug-proof.
 */

import {
  RNG_BANG_MODULUS,
  RNG_BANG_REMAINDER,
} from '../../../shared/scene-revolver-constants';

/** Trigger-pull outcome. Mirrors `revolver-state.TriggerOutcome` by structure. */
export type TriggerOutcome = 'empty' | 'bang';

/**
 * Production trigger-pull. Reads cryptographically-strong random bytes from
 * the host's `crypto` (available in both renderer and main contexts).
 *
 * Modulo bias note: Uint32 is 0..2^32-1. 2^32 / 6 is not an integer, so a
 * straight modulo introduces a tiny bias (~5.96e-9 imbalance favouring the
 * first remainders). For a joke app this is invisible — even at 1e6 pulls
 * the deviation from the ideal 1/6 is well under the ±10% test tolerance.
 * Replacing with rejection sampling is a Sprint 9 polish item if a
 * statistics-savvy reviewer flags it; Phase 1 leaves the simple form.
 */
export function pullTrigger(): TriggerOutcome {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  const raw = buffer[0] ?? 0;
  return raw % RNG_BANG_MODULUS === RNG_BANG_REMAINDER ? 'bang' : 'empty';
}

/**
 * Test-seam trigger-pull.
 *
 * The `source` callback writes one Uint32 into the supplied buffer; the
 * caller controls the entropy. Phase 2 unit tests will pass a counter
 * source like `(b) => { b[0] = ++callCount; }` to verify the modulo math
 * exhaustively for a small N.
 */
export function pullTriggerWithSource(
  source: (out: Uint32Array) => void,
): TriggerOutcome {
  const buffer = new Uint32Array(1);
  source(buffer);
  const raw = buffer[0] ?? 0;
  return raw % RNG_BANG_MODULUS === RNG_BANG_REMAINDER ? 'bang' : 'empty';
}
