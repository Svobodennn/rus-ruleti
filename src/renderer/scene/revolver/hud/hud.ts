/**
 * HUD root mount — Sprint 2 Phase 2B (frontend-dev).
 *
 * Composes the ШАНС / ŞANS counter and the transient-message overlay into
 * a single `HudHandle` consumed by `revolver/index.ts`. Wiring is:
 *
 *   .hud-overlay  (sibling DIV created by scene-mount.ts, base.css gates
 *                  visibility via .is-visible)
 *     ├── .hud-counter       (counter.ts — lower-right)
 *     └── .hud-messages      (messages.ts — top-center)
 *
 * The `.hud-overlay.is-visible` fade-in transition lives in base.css
 * (Phase 1). This file owns the JS-side toggle and the child handles.
 *
 * Public API surface (forward-compatible with the Phase 1 stub):
 *   - `setVisible(visible)`  : existing Phase 1 API; revolver/index.ts uses
 *                              this to reveal the HUD after mount. KEPT for
 *                              backward compat — do NOT remove.
 *   - `show()` / `hide()`    : convenience wrappers around setVisible(true)
 *                              and setVisible(false). The directive's spec
 *                              lists these by name; they delegate to
 *                              setVisible so callers can use either idiom.
 *   - `counter` / `messages` : sub-handles exposed for the mount layer to
 *                              call counter.update(n) / messages.show(kind).
 *   - `dispose()`            : tears down both children + removes the
 *                              .is-visible class.
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
  /** Convenience: fade-in (delegates to setVisible(true)). */
  show: () => void;
  /** Convenience: fade-out (delegates to setVisible(false)). */
  hide: () => void;
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
 *
 * The `locale` param is forwarded to both child mount functions — they
 * always render BOTH languages but accept the locale for API parity with
 * the rest of the renderer.
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

  return {
    counter,
    messages,
    setVisible,
    show: (): void => setVisible(true),
    hide: (): void => setVisible(false),
    dispose,
  };
}
