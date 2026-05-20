/**
 * Transient bilingual messages overlay — Sprint 2 Phase 2B (frontend-dev).
 *
 * Three message kinds surface top-center over the revolver scene. Each shows
 * BOTH locales simultaneously per PLAN §2's bilingual diegetic frame —
 * Cyrillic RU as the primary, Turkish TR as the caption underneath.
 *
 *   'early-release'  — fires when the user releases the trigger before
 *                       EARLY_RELEASE_MS. Surfaces hud.earlyReleaseMessage.
 *                       (atmosphere copy: "Karar veremedin. / Не смог
 *                       решиться.")
 *
 *   'bang'           — fires on a 'bang' outcome from the FSM. Surfaces
 *                       hud.bangMessage in blood-red. The
 *                       bang-overlay flash/fade is owned separately by
 *                       kraken-revolver via .bang-overlay.is-fired; THIS
 *                       message is the typographic component of the same
 *                       beat.
 *
 *   'reveal-lite'    — fires at the 6th consecutive empty click. Surfaces
 *                       hud.revealLiteMessage. (Designer
 *                       revolver-direction.md §4: "the room giving up on
 *                       itself".)
 *
 * The DOM is created once at mount; .show()/.hide() only toggle classes
 * and update textContent + a data-kind attribute. The 1800ms default
 * auto-hide matches the directive spec for early-release readability;
 * callers pass an explicit durationMs to override (Sprint 4 may want a
 * longer linger on the reveal-lite message).
 */

import { STRINGS, type Locale } from '../../../i18n/strings';

/** Discriminator for the three transient-message variants. */
export type MessageKind = 'early-release' | 'bang' | 'reveal-lite';

/** Handle returned from mountMessages. */
export interface MessagesHandle {
  /**
   * Surface a message of the given kind. `durationMs` overrides the default
   * auto-hide timeout (1800ms). Pass 0 to suppress auto-hide; caller must
   * then call `hide()` manually.
   */
  show: (kind: MessageKind, durationMs?: number) => void;
  /** Hide whichever message is currently visible. Idempotent. */
  hide: () => void;
  /** Tear down: remove DOM nodes + clear any active timeouts. */
  dispose: () => void;
}

/** Default auto-hide duration for transient messages (ms). */
const DEFAULT_DURATION_MS = 1800;

/** Class flag toggled to fade the messages in / out. */
const VISIBLE_CLASS = 'is-visible';

/** Map: which i18n key carries each message kind's copy? */
const KIND_TO_KEY = {
  'early-release': 'earlyReleaseMessage',
  bang: 'bangMessage',
  'reveal-lite': 'revealLiteMessage',
} as const;

/**
 * Resolve the bilingual copy for a kind. Both locales are returned because
 * the overlay renders RU + TR simultaneously regardless of operator locale.
 */
function resolveCopy(kind: MessageKind): { ru: string; tr: string } {
  const key = KIND_TO_KEY[kind];
  return {
    ru: STRINGS.ru.hud[key],
    tr: STRINGS.tr.hud[key],
  };
}

/**
 * Build the messages DOM subtree. The two child spans are created once and
 * their textContent updated on each `.show()`. Using a single subtree
 * (instead of one per kind) keeps the layout stable and prevents reflow
 * jitter when message kinds switch.
 */
function buildMessagesDom(): HTMLDivElement {
  const root = document.createElement('div');
  root.className = 'hud-messages';
  root.setAttribute('aria-live', 'polite');

  const ru = document.createElement('div');
  ru.className = 'hud-message hud-message--ru';
  const tr = document.createElement('div');
  tr.className = 'hud-message hud-message--tr';

  root.append(ru, tr);
  return root;
}

/** Internal: state for tracking the active auto-hide timeout. */
interface MessagesAnimState {
  hideTimeoutId: ReturnType<typeof setTimeout> | null;
}

/**
 * Mount the message overlay into a DOM root. `_locale` is accepted to
 * match the Phase 1 signature; the overlay always renders BOTH locales
 * regardless (atmosphere-direction.md §5 bilingual diegetic frame).
 */
export function mountMessages(
  root: HTMLElement,
  _locale: Locale,
): MessagesHandle {
  const messages = buildMessagesDom();
  root.appendChild(messages);
  const state: MessagesAnimState = { hideTimeoutId: null };
  return {
    show: (kind: MessageKind, durationMs?: number): void =>
      showMessage(messages, kind, durationMs, state),
    hide: (): void => hideMessage(messages, state),
    dispose: (): void => disposeMessages(messages, state),
  };
}

/**
 * Surface a message kind. Looks up the RU + TR strings, updates the DOM,
 * applies the kind attribute (CSS uses it for the bang-red colour), and
 * schedules an auto-hide unless `durationMs === 0`.
 */
function showMessage(
  messages: HTMLDivElement,
  kind: MessageKind,
  durationMs: number | undefined,
  state: MessagesAnimState,
): void {
  if (state.hideTimeoutId !== null) {
    clearTimeout(state.hideTimeoutId);
    state.hideTimeoutId = null;
  }

  const copy = resolveCopy(kind);
  applyCopy(messages, copy);
  messages.setAttribute('data-kind', kind);
  messages.classList.add(VISIBLE_CLASS);

  const effectiveDuration = durationMs ?? DEFAULT_DURATION_MS;
  if (effectiveDuration > 0) {
    state.hideTimeoutId = setTimeout(() => {
      messages.classList.remove(VISIBLE_CLASS);
      state.hideTimeoutId = null;
    }, effectiveDuration);
  }
}

/** Write the RU + TR text into the message subtree. */
function applyCopy(
  messages: HTMLDivElement,
  copy: { ru: string; tr: string },
): void {
  const ruEl = messages.querySelector<HTMLDivElement>('.hud-message--ru');
  const trEl = messages.querySelector<HTMLDivElement>('.hud-message--tr');
  if (ruEl !== null) {
    ruEl.textContent = copy.ru;
  }
  if (trEl !== null) {
    trEl.textContent = copy.tr;
  }
}

/** Hide whichever message is visible. Cancels pending auto-hide. */
function hideMessage(
  messages: HTMLDivElement,
  state: MessagesAnimState,
): void {
  if (state.hideTimeoutId !== null) {
    clearTimeout(state.hideTimeoutId);
    state.hideTimeoutId = null;
  }
  messages.classList.remove(VISIBLE_CLASS);
}

/** Tear down: clear the active timeout + detach the DOM subtree. */
function disposeMessages(
  messages: HTMLDivElement,
  state: MessagesAnimState,
): void {
  if (state.hideTimeoutId !== null) {
    clearTimeout(state.hideTimeoutId);
    state.hideTimeoutId = null;
  }
  messages.remove();
}
