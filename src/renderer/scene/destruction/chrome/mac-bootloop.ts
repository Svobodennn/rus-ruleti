/**
 * macOS Bootloop screen (Apple-bootscreen mimic) — Sprint 5 Phase 1 STUB.
 *
 * WHO CALLS THIS: faz7-bootloop.ts#mountMacBootloop — Mac branch only.
 *
 * SHARED RESOURCES OWNED: none — the bootloop cycle setInterval is OWNED
 * by faz7-bootloop.ts (BOOTLOOP_CYCLE_TIMER_OWNER decree). This chrome
 * module receives setState() calls per cycle from the runner.
 *
 * CALLEES (Phase 2B Lane C will wire):
 *   - inline DOM construction (designer-fictional eaten-apple SVG,
 *     progress bar, ⊘ overlay, "No bootable OS found" caption)
 *   - i18n/strings.ts `t(key, locale)` for caption text
 *
 * SPRINT 5 LANE: C — Lane C builds Apple-bootscreen visual.
 *
 * Visual specs (directive §4.2 + PLAN §7 line 286):
 *   - DOM: black background, designer-fictional eaten-apple SVG centred
 *     (same eaten-apple as Sprint 4 mac-dialog.ts), progress bar fills to
 *     ~40% (FAZ7_PROGRESS_FREEZE_PERCENT) then freezes → ⊘ overlay → "No
 *     bootable OS found" caption.
 *   - State machine (driven by faz7-bootloop runner):
 *     • 'apple-loading' (initial) — apple SVG + progress bar at 0%.
 *     • 'frozen' — progress bar stops at freeze% (drift per cycle within
 *       FAZ7_PROGRESS_DRIFT_RANGE = [38, 42]).
 *     • 'no-boot' — ⊘ symbol overlays apple SVG + "No bootable OS found"
 *       caption appears.
 *   - Cycle: 3sn per iteration (FAZ7_CYCLE_MS); each cycle the runner
 *     ticks through the three states then loops.
 *
 * Reduced-motion gate (designer Phase 2A §10):
 *   - Progress-bar drift: disabled (bar stays at freeze% — no drift).
 *   - State transitions: instant (no fade between states).
 *
 * TODO Sprint 5 Lane C: replace stub body with: black backdrop + apple
 * SVG centred + progress bar element + ⊘ overlay + caption + state-driven
 * visibility + dispose chain. Target ~180-220L.
 */

/* eslint-disable @typescript-eslint/no-unused-vars -- Sprint 5 Lane C fills this stub. */

import type { MacBootloopHandle } from '../types.js';

/** Mount-arg bag. */
export interface MountMacBootloopArgs {
  readonly hostElement: HTMLElement;
  readonly signal: AbortSignal;
}

/**
 * Mount the Mac bootloop screen into the destruction container. Returns
 * a handle whose `setState(state)` transitions through bootloop stages
 * and `dispose()` removes the screen.
 */
export function mountMacBootloop(
  args: MountMacBootloopArgs,
): MacBootloopHandle {
  // TODO Sprint 5 Lane C: build Apple-bootscreen mimic per spec.
  const element = document.createElement('div');
  element.className = 'faz7-mac-bootloop';
  args.hostElement.appendChild(element);
  let disposed = false;
  return {
    kind: 'mac-bootloop',
    element,
    setState: (
      _state: 'apple-loading' | 'frozen' | 'no-boot',
    ): void => undefined,
    setProgressDrift: (_percent: number): void => undefined,
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      element.remove();
    },
  };
}
