/**
 * Transient bilingual messages overlay — Phase 1 STUB.
 *
 * Three message kinds (PLAN §5/§6 + i18n/strings.ts `hud.*`):
 *   - `'early-release'`  — "Karar veremedin." / "Не смог решиться." Triggered
 *                          when the user releases the trigger before
 *                          `EARLY_RELEASE_MS` elapses (FSM cocking → idle).
 *   - `'bang'`           — "ATEŞ" / "ВЫСТРЕЛ". On bang outcome.
 *   - `'reveal-lite'`    — "Bunu yapmamalıydın." / "Не следовало этого делать."
 *                          On the 6th-consecutive empty click.
 *
 * Phase 2 frontend-dev implements the actual DOM construction with fade-
 * in/out and CSS transition timings pulled from the SSOT (none defined
 * yet — Phase 2 may add them). Phase 1 just locks the signatures and
 * the message-kind union so the FSM callers compile cleanly.
 */

import type { Locale } from '../../../i18n/strings';

/** Discriminator for the three transient-message variants. */
export type MessageKind = 'early-release' | 'bang' | 'reveal-lite';

/** Handle returned from mountMessages. */
export interface MessagesHandle {
  /**
   * Surface a message of the given kind. `durationMs` overrides the default
   * auto-hide timeout; pass 0 to suppress auto-hide (caller must call
   * `hide()` manually).
   */
  show: (kind: MessageKind, durationMs?: number) => void;
  /** Hide whichever message is currently visible. Idempotent. */
  hide: () => void;
  /** Tear down: remove DOM nodes + any active timeouts. */
  dispose: () => void;
}

/**
 * Mount the message overlay into a DOM root.
 *
 * @param _root - HUD overlay container created in scene-mount.ts.
 * @param _locale - User locale; Phase 2 uses it to choose which string from
 *   `STRINGS.{ru,tr}.hud.*Message` to render.
 *
 * Phase 1 stub returns no-op fns. Phase 2 fills the body without changing
 * the public signature.
 */
export function mountMessages(
  _root: HTMLElement,
  _locale: Locale,
): MessagesHandle {
  return {
    show: (): void => undefined,
    hide: (): void => undefined,
    dispose: (): void => undefined,
  };
}
