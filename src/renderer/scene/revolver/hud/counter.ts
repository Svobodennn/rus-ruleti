/**
 * ШАНС / ŞANS counter — Phase 1 STUB.
 *
 * PLAN §5: the counter ticks each empty click (1/6 → 2/6 → … → 6/6 "reveal-
 * lite"). Designer atmosphere-direction.md §5 recommends:
 *   - `lower-right` corner, ~32px viewport inset.
 *   - DSEG7-Classic OFL font (`HUD_COUNTER_FONT_FAMILY` in the SSOT).
 *   - PALETTE.neon (`#4a5d3a`) text with a symmetric 2px text-shadow glow,
 *     alpha rising per-click from `HUD_GLOW_ALPHA_BY_CLICK[0]` to `[6]`.
 *
 * Phase 1 stub: returns a no-op handle so the mount layer can call into
 * `counter.update(n)` from the FSM without runtime failure. Phase 2
 * frontend-dev replaces this with real DOM construction reading from the
 * SSOT — no inline magic numbers (lint enforces).
 *
 * NB: `Locale` is imported so the Phase 1 signature exactly matches what
 * Phase 2 needs (typed locale-aware copy). The argument is currently unused.
 */

import type { Locale } from '../../../i18n/strings';

/** Handle returned from mountCounter. */
export interface CounterHandle {
  /**
   * Update the empty-click count. Phase 1 stub: no-op. Phase 2: re-render
   * the counter digits AND update the glow alpha from
   * `HUD_GLOW_ALPHA_BY_CLICK[emptyClicks]` (clamped to the array length).
   */
  update: (emptyClicks: number) => void;
  /** Tear down: remove DOM nodes + any listeners. */
  dispose: () => void;
}

/**
 * Mount the counter into a DOM root.
 *
 * @param _root - HUD overlay container created in scene-mount.ts.
 * @param _locale - User locale (`'ru'` | `'tr'`). Phase 2 uses this to choose
 *   the counter label ("ШАНС" vs "ŞANS"); Phase 1 ignores it.
 *
 * Underscored arg names match the eslint `argsIgnorePattern: '^_'` config —
 * the args are required by the Phase 2 contract but unused in the stub.
 */
export function mountCounter(
  _root: HTMLElement,
  _locale: Locale,
): CounterHandle {
  return {
    update: (): void => undefined,
    dispose: (): void => undefined,
  };
}
