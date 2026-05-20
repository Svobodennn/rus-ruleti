/**
 * Mouse-hold input attachment for the revolver.
 *
 * Two events matter (PLAN §6 "mouse-hold 1sn"):
 *   - mousedown — start the cock animation (FSM: idle → cocking).
 *   - mouseup OR mouseleave — release. Either is a valid release because
 *     a user dragging off the canvas mid-hold should cancel the spin.
 *
 * AbortController pattern: passing `signal` into addEventListener lets us
 * tear down all three listeners with a single `controller.abort()` call.
 * No listener-by-listener bookkeeping, no chance of leaks if Phase 2
 * forgets to remove one event. Sprint 0 retro called out manual
 * removeEventListener pairs as a leak hot-spot; this pattern eliminates
 * the class of bug.
 *
 * Phase 1 stub: this module DOES install the listeners and DOES forward
 * the timestamps via `performance.now()`. The mount layer's onMouseDown /
 * onMouseUp callbacks are no-ops in Phase 1 — Phase 2 kraken-revolver
 * wires them into the FSM.
 *
 * Why `performance.now()` and not `Date.now()`? `performance.now()` is
 * monotonic; system-clock corrections (NTP, user manually changing the
 * date) cannot make it run backwards. The FSM's `heldMs = nowMs - holdStartMs`
 * arithmetic relies on that.
 */

/** Handle returned from attachInput. Call `dispose()` to remove all listeners. */
export interface InputHandle {
  dispose: () => void;
}

/**
 * Wire mouse-hold detection to `target`.
 *
 * @param target - DOM element to listen on (usually the scene canvas or its
 *   container). Receiving the bubble-phase event from a higher-level wrapper
 *   like `<body>` would let UI overlays steal the input.
 * @param onMouseDown - Called with `performance.now()` on mousedown.
 * @param onMouseUp - Called with `performance.now()` on mouseup OR mouseleave.
 *   The mount layer is responsible for de-duplication if a mouseup and
 *   mouseleave fire in sequence (the FSM is idempotent on mouseup-from-idle).
 */
export function attachInput(
  target: HTMLElement,
  onMouseDown: (nowMs: number) => void,
  onMouseUp: (nowMs: number) => void,
): InputHandle {
  const controller = new AbortController();
  const opts: AddEventListenerOptions = { signal: controller.signal };
  target.addEventListener(
    'mousedown',
    (): void => onMouseDown(performance.now()),
    opts,
  );
  target.addEventListener(
    'mouseup',
    (): void => onMouseUp(performance.now()),
    opts,
  );
  target.addEventListener(
    'mouseleave',
    (): void => onMouseUp(performance.now()),
    opts,
  );
  return { dispose: (): void => controller.abort() };
}
