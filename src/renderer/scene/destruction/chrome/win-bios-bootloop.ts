/**
 * Win11 BIOS-style bootloop screen — Sprint 5 Phase 1 STUB.
 *
 * WHO CALLS THIS: faz7-bootloop.ts#mountWinBiosBootloop — Win branch
 * only.
 *
 * SHARED RESOURCES OWNED: none — the bootloop cycle setInterval is OWNED
 * by faz7-bootloop.ts (BOOTLOOP_CYCLE_TIMER_OWNER decree). This chrome
 * module receives setState() calls per cycle from the runner.
 *
 * CALLEES (Phase 2B Lane D will wire):
 *   - inline DOM construction (full-screen mavi BIOS-style)
 *   - i18n/strings.ts `t(key, locale)` for "No bootable device" caption
 *
 * SPRINT 5 LANE: D — Lane D builds the BIOS-style visual.
 *
 * Visual specs (directive §4.2 + PLAN §7 line 287):
 *   - Full-screen mavi (blue) BIOS-style takeover.
 *   - "No bootable device — Press F1 to retry, F2 for setup" caption.
 *   - 3sn cycle (FAZ7_CYCLE_MS), auto-loop forever (until signal abort
 *     OR Sprint 6 Faz 8 reveal hand-off).
 *   - State machine (driven by faz7-bootloop runner):
 *     • 'no-boot' (initial) — BIOS message visible.
 *     • 'restart-pending' — brief black flash (~300ms) before next cycle.
 *
 * Reduced-motion gate (designer Phase 2A §10):
 *   - Black flash transition: disabled (stays on no-boot frame; cycle
 *     still ticks for telemetry but no visual change).
 *
 * TODO Sprint 5 Lane D: replace stub body with: blue BIOS background +
 * caption text + state-driven black flash + dispose chain. Target
 * ~150-180L.
 */

/* eslint-disable @typescript-eslint/no-unused-vars -- Sprint 5 Lane D fills this stub. */

import type { WinBiosBootloopHandle } from '../types.js';

/** Mount-arg bag. */
export interface MountWinBiosBootloopArgs {
  readonly hostElement: HTMLElement;
  readonly signal: AbortSignal;
}

/**
 * Mount the Win11 BIOS bootloop screen into the destruction container.
 * Returns a handle whose `setState(state)` transitions between no-boot
 * and restart-pending and `dispose()` removes the screen.
 */
export function mountWinBiosBootloop(
  args: MountWinBiosBootloopArgs,
): WinBiosBootloopHandle {
  // TODO Sprint 5 Lane D: build BIOS-style bootloop per spec.
  const element = document.createElement('div');
  element.className = 'faz7-win-bios-bootloop';
  args.hostElement.appendChild(element);
  let disposed = false;
  return {
    kind: 'win-bios-bootloop',
    element,
    setState: (_state: 'no-boot' | 'restart-pending'): void => undefined,
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      element.remove();
    },
  };
}
