/**
 * HUD root mount — Phase 1 STUB orchestrator.
 *
 * Owns the lifecycle of the HUD overlay's two children:
 *   - The ШАНС / ŞANS counter (`./counter.ts`).
 *   - The transient-message overlay (`./messages.ts`).
 *
 * Phase 1: this file wires the two stubs into the supplied container and
 * exposes a typed handle. No DOM mutation in the stubs themselves; the
 * `.is-visible` toggle on the container is the only visible Phase 1 effect
 * (handled by the mount layer, not here).
 *
 * Phase 2 frontend-dev grows this into the real wiring: instantiate counter,
 * instantiate messages, observe FSM transitions via the revolver handle and
 * call the appropriate `update()` / `show()` methods.
 */

import type { Locale } from '../../../i18n/strings';
import { mountCounter, type CounterHandle } from './counter';
import { mountMessages, type MessagesHandle } from './messages';

/** HUD root handle returned by mountHud. */
export interface HudHandle {
  /** Sub-handle for the empty-click counter. */
  readonly counter: CounterHandle;
  /** Sub-handle for transient messages. */
  readonly messages: MessagesHandle;
  /** Toggle the HUD overlay visibility (adds/removes `.is-visible`). */
  setVisible: (visible: boolean) => void;
  /** Tear down all children + remove visibility class. */
  dispose: () => void;
}

/** CSS class the base.css fade-in rules key off. */
const HUD_VISIBLE_CLASS = 'is-visible';

/**
 * Mount the HUD into the supplied container.
 *
 * The container is the `#hud-overlay` DIV created in scene-mount.ts. It is
 * fixed inset-0, pointer-events:none, z-index between scene-container and
 * the CRT overlay (see base.css for the CSS contract).
 */
export function mountHud(root: HTMLElement, locale: Locale): HudHandle {
  const counter = mountCounter(root, locale);
  const messages = mountMessages(root, locale);

  const setVisible = (visible: boolean): void => {
    root.classList.toggle(HUD_VISIBLE_CLASS, visible);
  };

  const dispose = (): void => {
    counter.dispose();
    messages.dispose();
    root.classList.remove(HUD_VISIBLE_CLASS);
  };

  return { counter, messages, setVisible, dispose };
}
