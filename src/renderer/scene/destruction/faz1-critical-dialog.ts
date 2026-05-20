/**
 * Faz 1 — OS-spesifik Critical Dialog (2-7sn). Phase 1 STUB.
 *
 * After Faz 0 holds at black, this Faz mounts the OS-conditional dialog
 * (Mac vs Win) inside a destruction overlay container. The dialog is the
 * pixel-perfect chrome from chrome/mac-dialog.ts or chrome/win-dialog.ts
 * (swift-expert + frontend-dev Phase 2B); this runner only owns the
 * lifecycle (mount → countdown → dispose) and the procedural native chord
 * stub (Web Audio Oscillator envelope — no real Mac chime / Win error
 * chord audio bundled per PLAN §10 telif decision).
 *
 *   - OS = 'mac': mount mac-dialog with "Critical Error" + "Restarting in 5..."
 *     countdown decrementing each DIALOG_COUNTDOWN_INTERVAL_MS.
 *   - OS = 'win': mount win-dialog with "Critical Process Failed" + "OK"
 *     primary button (Win11 fluent acrylic backdrop).
 *
 * Duration FAZ_1_DIALOG_DURATION_MS (5000ms). The full 5s runs even though
 * the countdown starts at DIALOG_COUNTDOWN_START (5) — the visible text
 * decrements every second; the timer is the gating clock.
 *
 * If `prefers-reduced-motion: reduce`:
 *   - Backdrop blur transition: instant (no animation).
 *   - Native chord oscillator envelope still plays (audio gate separate).
 *
 * Called by:
 *   - destruction-director.ts FSM step: `faz0 → faz1` → await `runFaz1(...)`.
 *
 * Phase 2B owner: kraken-faz0-1.
 */

import type { OsVariant } from './types.js';

/**
 * Runner arg bag.
 */
export interface Faz1RunArgs {
  readonly os: OsVariant;
  readonly container: HTMLElement;
  readonly signal: AbortSignal;
}

/**
 * Run the Faz 1 critical dialog. Resolves at FAZ_1_DIALOG_DURATION_MS or
 * on ESC-hold abort.
 *
 * Phase 2B kraken-faz0-1 fills the body.
 */
export async function runFaz1(_args: Faz1RunArgs): Promise<void> {
  throw new Error('faz1-critical-dialog: Phase 2B kraken-faz0-1 fills runFaz1()');
}
