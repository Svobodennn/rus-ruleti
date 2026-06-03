/**
 * Faz 8 ACTION BUTTONS chrome — Sprint 7 Phase 2B Lane B FILL.
 *
 * D-1 closure (Designer Phase 2A): SINGLE FILE owns BOTH TEKRAR and ÇIK
 * mounts. The Phase 1 split files (chrome/faz8-tekrar-button.ts +
 * chrome/faz8-cik-button.ts) are superseded by this module — barrel
 * index.ts re-exports from here. Single-file rationale:
 *   - Shared container `<div class="faz8-action-buttons-container">`
 *     lifecycle (idempotent first-mount + sibling-append second-mount)
 *     is internal state; splitting across two files would require an
 *     external coordinator module to track "did the container mount?".
 *   - Shared CSS class SSOT (FAZ8_TEKRAR_BUTTON_VISIBLE_CLASS +
 *     FAZ8_CIK_BUTTON_VISIBLE_CLASS both resolve to 'is-visible'); the
 *     two buttons fade as a pair so a single fade controller is simpler.
 *   - Mount fns differ ONLY in caller-decree constant + class name + i18n
 *     copy — extracting a shared `mountButton` helper eliminates 80% of
 *     the boilerplate while preserving the two-call public surface.
 *
 * WHO CALLS THIS: faz8-son-ekran.ts (single caller — Lane A Phase 2B
 * wires the two mount calls after the disclaimer + restart-hint have
 * settled). Owner constellation:
 *   - mount caller (TEKRAR): faz8-son-ekran (FAZ8_TEKRAR_BUTTON_CHROME_OWNER)
 *   - mount caller (ÇIK)   : faz8-son-ekran (FAZ8_CIK_BUTTON_CHROME_OWNER)
 *   - click listener       : faz8-son-ekran (FAZ8_BUTTON_CLICK_LISTENER_OWNER)
 *   - keydown listener     : faz8-son-ekran (FAZ8_BUTTON_KEYDOWN_LISTENER_OWNER)
 *
 * TH-S6-03 closure (Sprint 6 BLOCKER-3 carry-forward): hostElement is
 * REQUIRED — no default, no `?`-optional. The destruction-takeover
 * overlay is at opacity:0 by son-ekran entry; children of an opacity:0
 * parent are invisible by compositor multiply regardless of their own
 * opacity. Lane A passes a sibling host (typically the apartment scene
 * root or document.body); the type system rejects missing-host
 * construction.
 *
 * TH-S6-04 closure (universal owner enforcement): the `caller` field on
 * EACH option bag is type-narrowed to the matching owner constant. Only
 * modules importing that constant can construct the option bag.
 * Runtime caller-equality check inside each mount fn is the defence-in-
 * depth fallback for unsafe `as` casts.
 *
 * Reduced-motion: the CSS @media (prefers-reduced-motion: reduce) block
 * in destruction.css drops the fade-in transition + state transitions;
 * the `.is-visible` class snap-jumps the container to opacity 1. No JS
 * gating needed here — Lane B CSS handles the gate.
 *
 * a11y:
 *   - <button> element (semantic; keyboard activation via Enter + Space
 *     is built-in to the platform; no custom JS keydown wiring needed
 *     for activation, only Escape and Tab management at the caller).
 *   - aria-label resolved from i18n at the mount call site (Lane A
 *     passes the locale-appropriate string via opts.ariaLabel).
 *   - tabindex="0" — explicit even though <button> default is 0; the
 *     explicit attribute documents intent at the call site.
 *   - Focus management: Tab order is browser default. CSS pairs
 *     `:focus-visible` for the keyboard-focus ring; mouse focus does
 *     not show the ring (matches platform expectations).
 *
 * Container lifecycle (idempotent first-mount):
 *   - First mount: creates `<div class="faz8-action-buttons-container">`
 *     and appends to hostElement, then appends the button as its first
 *     child.
 *   - Second mount: re-uses the existing container (queried via
 *     `hostElement.querySelector('.faz8-action-buttons-container')`)
 *     and appends the second button as a sibling. The container
 *     `.is-visible` toggle Lane A drives applies to both buttons via
 *     the shared parent fade.
 *
 * Dispose semantics:
 *   - Each handle's `dispose()` removes ONLY its own button element +
 *     the click listener attached to that button. The container is
 *     removed when its last child is detached (by the SECOND dispose
 *     call when both buttons have been disposed). This keeps the two
 *     handles independently disposable without leaking the container.
 *
 * REFERENCES:
 *   - directive §9 TASK 2 — D-1 SINGLE FILE merger
 *   - directive §5 TH-S6-03 — REQUIRED hostElement closure
 *   - directive §5 TH-S6-04 — universal owner enforcement
 *   - PLAN §12 S9 — KIOSK SAFETY (renderer-only FSM mutation)
 *   - PLAN §7 line 302 — restart hint → button progression
 *   - destruction-direction.md §21 — button visual spec
 *
 * PHASE 2B LANE B — frontend-dev FILLED
 */

import {
  FAZ8_ACTION_BUTTONS_CONTAINER_CLASS,
  FAZ8_CIK_BUTTON_CHROME_OWNER,
  FAZ8_CIK_BUTTON_ELEMENT_CLASS,
  FAZ8_TEKRAR_BUTTON_CHROME_OWNER,
  FAZ8_TEKRAR_BUTTON_ELEMENT_CLASS,
} from '../../../../shared/scene-destruction-constants.js';
import type {
  Faz8CikButtonHandle,
  Faz8CikButtonOptions,
  Faz8TekrarButtonHandle,
  Faz8TekrarButtonOptions,
} from '../types.js';

/**
 * CSS class name aliases — Sprint 7 Phase 4 SSOT promotion (TH-S6-02).
 * These three constants are now declared in scene-destruction-constants.ts
 * and imported above; the local aliases are removed in favour of direct
 * SSOT references used inline in the helper functions below.
 */
const ACTION_BUTTONS_CONTAINER_CLASS = FAZ8_ACTION_BUTTONS_CONTAINER_CLASS;

/** CSS class for the TEKRAR button element. */
const TEKRAR_BUTTON_CLASS = FAZ8_TEKRAR_BUTTON_ELEMENT_CLASS;

/** CSS class for the ÇIK button element. */
const CIK_BUTTON_CLASS = FAZ8_CIK_BUTTON_ELEMENT_CLASS;

/**
 * Resolve (or lazily create) the shared two-button container inside
 * `hostElement`. Idempotent: a second call returns the existing
 * container without creating a duplicate.
 *
 * Querying via `hostElement.querySelector` (NOT document-wide) scopes
 * the lookup to the call-site host so a hypothetical second
 * son-ekran mount on a different host does not collide.
 */
function resolveContainer(hostElement: HTMLElement): HTMLDivElement {
  const existing = hostElement.querySelector<HTMLDivElement>(
    `.${ACTION_BUTTONS_CONTAINER_CLASS}`,
  );
  if (existing !== null) {
    return existing;
  }
  const container = document.createElement('div');
  container.className = ACTION_BUTTONS_CONTAINER_CLASS;
  // Container default opacity is 0 (declared in CSS); Lane A toggles
  // `.is-visible` via rAF after mount to drive the fade-in. NO inline
  // opacity here — would shadow the CSS class rule.
  hostElement.appendChild(container);
  return container;
}

/**
 * Shared helper: construct a <button> element, wire click + dispose,
 * append to the shared container, and return the dispose closure.
 *
 * The two public mount fns differ only in CSS class + handle kind +
 * caller-decree constant; this helper centralises the rest of the
 * lifecycle (DOM construction, listener wiring, signal honouring,
 * dispose idempotency).
 */
function mountButtonInternal(args: {
  hostElement: HTMLElement;
  buttonClass: string;
  labelText: string;
  ariaLabel: string;
  onClick: () => void;
  signal: AbortSignal;
}): { button: HTMLButtonElement; dispose: () => void } {
  const container = resolveContainer(args.hostElement);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = args.buttonClass;
  // tabindex="0" is the <button> default but the explicit attribute
  // documents focus-management intent at the call site (no implicit
  // platform behaviour dependency).
  button.setAttribute('tabindex', '0');
  button.setAttribute('aria-label', args.ariaLabel);
  button.textContent = args.labelText;

  // Click handler invokes opts.onClick. Native <button> Enter + Space
  // activation dispatches a click event on the platform, so no
  // additional keydown listener is required for activation.
  const handleClick = (): void => {
    args.onClick();
  };
  button.addEventListener('click', handleClick);

  container.appendChild(button);

  let disposed = false;
  const dispose = (): void => {
    if (disposed) return;
    disposed = true;
    button.removeEventListener('click', handleClick);
    if (button.parentNode !== null) {
      button.parentNode.removeChild(button);
    }
    // Remove the container if this was the last button — keeps the
    // DOM clean for re-mount paths (restart re-entry walks back
    // through son-ekran which re-mounts the container).
    if (container.childElementCount === 0 && container.parentNode !== null) {
      container.parentNode.removeChild(container);
    }
  };

  // Honour opts.signal — dispose when the parent runner aborts. If
  // the signal is already aborted at mount time, dispose immediately
  // (the button never becomes visible).
  if (args.signal.aborted) {
    dispose();
  } else {
    args.signal.addEventListener('abort', dispose, { once: true });
  }

  return { button, dispose };
}

/**
 * Mount the Faz 8 TEKRAR button chrome.
 *
 * Returns a `Faz8TekrarButtonHandle` whose:
 *   - `kind` is the discriminator `'faz8-tekrar-button'`.
 *   - `element` is the underlying `<button>` (typed `HTMLButtonElement`
 *     for native keyboard-activation semantics).
 *   - `setLabelText(text)` swaps the rendered button copy (locale
 *     switch support — Sprint 7+ may need this; Phase 2B implements
 *     the mutation, callers may leave unused).
 *   - `setAriaLabel(text)` swaps the aria-label (mirror of label
 *     setter for screen-reader locale switch).
 *   - `dispose()` removes the button element, detaches the click
 *     listener, and (if last button) detaches the shared container.
 *     Idempotent: safe to call multiple times.
 *
 * Click + Enter + Space all invoke `opts.onClick` (Lane A wires this to
 * `destruction-director.requestRestart()` — the kiosk-safe renderer-
 * only FSM re-entry per PLAN §12 S9).
 *
 * CSS class hooks consumed (see destruction.css §"Sprint 7 — FAZ 8
 * ACTION BUTTONS"):
 *   - `.faz8-action-buttons-container`            — shared flex container
 *   - `.faz8-action-buttons-container.is-visible` — fade-in end state
 *   - `.faz8-tekrar-button`                       — per-button styling
 *   - `.faz8-tekrar-button:hover`                 — hover bg shift
 *   - `.faz8-tekrar-button:active`                — pressed-in shadow
 *   - `.faz8-tekrar-button:focus-visible`         — keyboard focus ring
 */
export function mountFaz8TekrarButton(
  opts: Faz8TekrarButtonOptions,
): Faz8TekrarButtonHandle {
  // TH-S6-04 runtime caller-equality check — defence-in-depth for
  // unsafe `as` casts that bypass the type-level narrowing.
  if (opts.caller !== FAZ8_TEKRAR_BUTTON_CHROME_OWNER) {
    throw new Error(
      `[faz8-tekrar-button] caller decree violation: expected ${FAZ8_TEKRAR_BUTTON_CHROME_OWNER}, got ${String(opts.caller)}`,
    );
  }

  const { button, dispose } = mountButtonInternal({
    hostElement: opts.hostElement,
    buttonClass: TEKRAR_BUTTON_CLASS,
    labelText: opts.labelText,
    ariaLabel: opts.ariaLabel,
    onClick: opts.onClick,
    signal: opts.signal,
  });

  const handle: Faz8TekrarButtonHandle = {
    kind: 'faz8-tekrar-button',
    element: button,
    setLabelText: (text: string): void => {
      button.textContent = text;
    },
    setAriaLabel: (text: string): void => {
      button.setAttribute('aria-label', text);
    },
    dispose,
  };

  return handle;
}

/**
 * Mount the Faz 8 ÇIK button chrome.
 *
 * Mirror of `mountFaz8TekrarButton` with the caller-decree narrowed to
 * `FAZ8_CIK_BUTTON_CHROME_OWNER` and the CSS class `.faz8-cik-button`.
 *
 * S10 IPC contract (Sprint 7 Phase 1 decision — PATH A CHOSEN): Lane A
 * wires `opts.onClick` to `window.api.quit()` (reuses the existing
 * Sprint 0 `app:quit` IPC channel via the preload bridge — NO new IPC
 * channel introduced for Sprint 7). Path B (new IPC channel) was
 * rejected because the existing channel already provides the exact
 * contract needed (kiosk-safe renderer-triggered app quit with sender
 * validation).
 *
 * CONTRAST WITH TEKRAR: TEKRAR mutates the destruction-director FSM
 * (does NOT exit the app — joke-app invariant preserved). ÇIK uses the
 * existing app:quit IPC channel which terminates the app — the only
 * Sprint 7 surface that exits the app cleanly via user action.
 *
 * CSS class hooks consumed: same as TEKRAR with `.faz8-cik-button` in
 * place of `.faz8-tekrar-button`.
 */
export function mountFaz8CikButton(
  opts: Faz8CikButtonOptions,
): Faz8CikButtonHandle {
  // TH-S6-04 runtime caller-equality check — defence-in-depth.
  if (opts.caller !== FAZ8_CIK_BUTTON_CHROME_OWNER) {
    throw new Error(
      `[faz8-cik-button] caller decree violation: expected ${FAZ8_CIK_BUTTON_CHROME_OWNER}, got ${String(opts.caller)}`,
    );
  }

  const { button, dispose } = mountButtonInternal({
    hostElement: opts.hostElement,
    buttonClass: CIK_BUTTON_CLASS,
    labelText: opts.labelText,
    ariaLabel: opts.ariaLabel,
    onClick: opts.onClick,
    signal: opts.signal,
  });

  const handle: Faz8CikButtonHandle = {
    kind: 'faz8-cik-button',
    element: button,
    setLabelText: (text: string): void => {
      button.textContent = text;
    },
    setAriaLabel: (text: string): void => {
      button.setAttribute('aria-label', text);
    },
    dispose,
  };

  return handle;
}
