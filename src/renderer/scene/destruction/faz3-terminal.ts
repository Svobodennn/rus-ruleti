/**
 * Faz 3 — Terminal rm -rf typewriter (12-22sn). Phase 1 STUB.
 *
 * The punchline begins. After Faz 2 takeover completes, Faz 3:
 *
 *   1. Replaces the desktop with a terminal chrome:
 *      - Mac: Terminal.app native chrome reference (SF Mono system font ref).
 *      - Win: Windows Terminal mimic (Cascadia Code bundled OFL font).
 *   2. Types the command at TYPEWRITER_COMMAND_CHARS_PER_SEC (15 char/sec):
 *      ```
 *      $ sudo rm -rf / --no-preserve-root
 *      Password: ********
 *      ```
 *   3. On Enter (auto-injected after Password prompt), streams output lines
 *      at TYPEWRITER_OUTPUT_LINES_PER_SEC (70 lines/sec) from
 *      FAKE_FILE_PATHS_MAC or FAKE_FILE_PATHS_WIN — with USERNAME_PLACEHOLDER
 *      substituted with the live `window.api.getUsername()` result (cached
 *      by the director at sequence start so the typewriter doesn't block
 *      on IPC mid-stream).
 *   4. At APARTMENT_BLEED_2_TRIGGER_MS (= 16s from bang = ~4s into Faz 3):
 *      triggers ApartmentBleed #2 via the handle owned by the director.
 *
 * Duration FAZ_3_TERMINAL_DURATION_MS (10000ms). Sprint 5 takes over with
 * Faz 4 (file wipe progress dialog).
 *
 * If `prefers-reduced-motion: reduce`:
 *   - Cursor blink: static (no animation).
 *   - Typewriter character reveal: keeps the cadence (semantic — without
 *     the reveal the joke doesn't read), but the per-char DOM mutation
 *     uses transform: none.
 *
 * Called by:
 *   - destruction-director.ts FSM step: `faz2 → faz3` → await `runFaz3(...)`.
 *
 * Phase 2B owner: kraken-faz2-3.
 */

import type { OsVariant, ApartmentBleedHandle } from './types.js';

/**
 * Runner arg bag.
 */
export interface Faz3RunArgs {
  readonly os: OsVariant;
  /** Live username from window.api.getUsername(); already cached by director. */
  readonly username: string;
  readonly container: HTMLElement;
  readonly apartmentBleed: ApartmentBleedHandle;
  readonly signal: AbortSignal;
}

/**
 * Run the Faz 3 terminal sequence. Resolves at FAZ_3_TERMINAL_DURATION_MS
 * or on ESC-hold abort. Mid-sequence triggers ApartmentBleed #2.
 *
 * Phase 2B kraken-faz2-3 fills the body.
 */
export async function runFaz3(_args: Faz3RunArgs): Promise<void> {
  throw new Error('faz3-terminal: Phase 2B kraken-faz2-3 fills runFaz3()');
}
