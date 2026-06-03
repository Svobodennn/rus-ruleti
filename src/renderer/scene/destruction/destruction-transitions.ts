/**
 * Scene transition cross-fade helpers — Sprint 7 Phase 2B Lane A.
 *
 * Split from destruction-director.ts so the director stays under the
 * 400-line ESLint max-lines cap and the transition logic remains
 * auditable in isolation. The director imports these helpers and
 * threads them between the existing Faz runners.
 *
 * SCOPE:
 *   - runFaz7ToFaz8Transition: 200ms cross-fade window between Faz 7
 *     bootloop completion and Faz 8 reveal entry. Applies the SSOT
 *     SCENE_TRANSITION_FADE_OUT_CLASS to the destruction-takeover
 *     container; Lane B CSS owns the transition curve (opacity 1→0
 *     over FAZ7_TO_FAZ8_CROSSFADE_MS via SCENE_TRANSITION_EASING).
 *   - runFaz6ToFaz7Transition: 150ms cross-fade window between Faz 6
 *     BSOD/kernel-panic dispose and Faz 7 bootloop entry. Applies
 *     SCENE_TRANSITION_FADE_IN_CLASS to the container; Lane B CSS owns
 *     the curve (the new bootloop chrome reads as "fading in" rather
 *     than "punching in").
 *   - scheduleTransitionTimer: abort-aware setTimeout wrapper with
 *     caller-type enforcement per TH-S6-04 universal owner decree.
 *     The `caller` parameter is type-narrowed to the Sprint 7
 *     transition timer owner constants so the compiler rejects
 *     misuse from other modules.
 *
 * REDUCED-MOTION GATE (designer §16): both transition fns short-
 * circuit when `prefers-reduced-motion: reduce` is set — the runner
 * skips the cross-fade window and returns immediately. The class
 * toggles are never applied so the CSS @media gate is moot but the
 * timing is consistent with the rest of the destruction sequence
 * (reduced-motion users see hard cuts at phase boundaries).
 *
 * Faz 2 → Faz 3 transition: D-4 confirmed smooth as hard cut
 * (FAZ2_TO_FAZ3_CROSSFADE_MS = 0). No helper here; the director
 * proceeds Faz 2 → Faz 3 without a cross-fade call.
 */

import log from 'electron-log/renderer';
import {
  FAZ6_TO_FAZ7_CROSSFADE_MS,
  FAZ6_TO_FAZ7_TRANSITION_TIMER_OWNER,
  FAZ7_TO_FAZ8_CROSSFADE_MS,
  FAZ7_TO_FAZ8_TRANSITION_TIMER_OWNER,
  PREFERS_REDUCED_MOTION_QUERY,
  SCENE_TRANSITION_FADE_IN_CLASS,
  SCENE_TRANSITION_FADE_OUT_CLASS,
} from '../../../shared/scene-destruction-constants.js';

/** Union of the two Sprint 7 transition timer owner constant types. */
type SceneTransitionTimerOwner =
  | typeof FAZ7_TO_FAZ8_TRANSITION_TIMER_OWNER
  | typeof FAZ6_TO_FAZ7_TRANSITION_TIMER_OWNER;

/**
 * Abort-aware setTimeout wrapper. The `caller` field is type-narrowed
 * to the Sprint 7 scene-transition timer owner constants — only
 * modules importing those constants can construct a transition timer
 * (TH-S6-04 universal owner enforcement). Resolves on timeout OR on
 * signal abort, whichever comes first.
 */
export function scheduleTransitionTimer(opts: {
  readonly caller: SceneTransitionTimerOwner;
  readonly delayMs: number;
  readonly signal: AbortSignal;
}): Promise<void> {
  return new Promise<void>((resolve): void => {
    if (opts.signal.aborted) {
      resolve();
      return;
    }
    const id = setTimeout(resolve, opts.delayMs);
    opts.signal.addEventListener(
      'abort',
      (): void => {
        clearTimeout(id);
        resolve();
      },
      { once: true },
    );
  });
}

/**
 * Faz 7 → Faz 8 cross-fade. Applies SCENE_TRANSITION_FADE_OUT_CLASS to
 * the destruction-takeover container so Lane B CSS drives the
 * opacity/visual envelope over FAZ7_TO_FAZ8_CROSSFADE_MS (200ms).
 * Removes the class on completion so the next phase starts clean.
 *
 * Reduced-motion: skip the cross-fade entirely; the cut is hard.
 */
export async function runFaz7ToFaz8Transition(
  container: HTMLElement,
  signal: AbortSignal,
): Promise<void> {
  if (signal.aborted) return;
  if (isReducedMotion()) {
    log.info('destruction-transitions: faz7→faz8 cross-fade skipped (reduced-motion)');
    return;
  }
  log.info('destruction-transitions: faz7→faz8 cross-fade enter', {
    durationMs: FAZ7_TO_FAZ8_CROSSFADE_MS,
  });
  container.classList.add(SCENE_TRANSITION_FADE_OUT_CLASS);
  await scheduleTransitionTimer({
    caller: FAZ7_TO_FAZ8_TRANSITION_TIMER_OWNER,
    delayMs: FAZ7_TO_FAZ8_CROSSFADE_MS,
    signal,
  });
  container.classList.remove(SCENE_TRANSITION_FADE_OUT_CLASS);
}

/**
 * Faz 6 → Faz 7 cross-fade. Applies SCENE_TRANSITION_FADE_IN_CLASS to
 * the destruction-takeover container so Lane B CSS drives the
 * fade-in envelope over FAZ6_TO_FAZ7_CROSSFADE_MS (150ms). Removes
 * the class on completion. Lane B CSS keys the transition off the
 * class presence — the next phase's chrome will mount and the
 * container substrate reads as "settling in" rather than "punching in".
 *
 * Reduced-motion: skip the cross-fade entirely.
 */
export async function runFaz6ToFaz7Transition(
  container: HTMLElement,
  signal: AbortSignal,
): Promise<void> {
  if (signal.aborted) return;
  if (isReducedMotion()) {
    log.info('destruction-transitions: faz6→faz7 cross-fade skipped (reduced-motion)');
    return;
  }
  log.info('destruction-transitions: faz6→faz7 cross-fade enter', {
    durationMs: FAZ6_TO_FAZ7_CROSSFADE_MS,
  });
  container.classList.add(SCENE_TRANSITION_FADE_IN_CLASS);
  await scheduleTransitionTimer({
    caller: FAZ6_TO_FAZ7_TRANSITION_TIMER_OWNER,
    delayMs: FAZ6_TO_FAZ7_CROSSFADE_MS,
    signal,
  });
  container.classList.remove(SCENE_TRANSITION_FADE_IN_CLASS);
}

/** Reduced-motion matchMedia query — single-source-of-truth via constants. */
function isReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;
}
