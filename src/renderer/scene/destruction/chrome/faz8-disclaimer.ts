/**
 * Faz 8 disclaimer chrome — Sprint 6 Phase 2B Lane B FILL.
 *
 * Owns the centred bilingual disclaimer block for the Faz 8
 * son-ekran closing tableau. Cyrillic primary ("Это просто шутка.")
 * + Turkish subtitle ("Bu sadece bir şaka."). Fades in 1sn after
 * mount; final opacity capped at FAZ8_DISCLAIMER_OPACITY_MAX (0.9)
 * so the lobby read remains the primary visual.
 *
 * WHO CALLS THIS: faz8-son-ekran.ts (single caller).
 *
 * SHARED RESOURCES OWNED: FAZ8_DISCLAIMER_OWNER decree —
 * faz8-son-ekran.ts owns the lifecycle (mount + dispose).
 *
 * Lane B fill (this body):
 *   1. CONSTRUCT root <section class="faz8-disclaimer"> with two
 *      child elements:
 *        - <h2 class="faz8-disclaimer-primary" lang="ru"> — Cyrillic
 *        - <p  class="faz8-disclaimer-secondary" lang="tr"> — Turkish
 *      Initial opacity 0 (set inline so the CSS transition has a
 *      definite start point); CSS sets the transition + the
 *      .is-visible end-state.
 *   2. ATTACH to opts.hostElement — Lane A (faz8-son-ekran.ts)
 *      passes the apartment scene root (NOT the destruction-takeover
 *      overlay; by son-ekran entry the overlay has faded out).
 *   3. ARIA: root is `role="status" aria-live="polite"` so screen
 *      readers announce the reveal politely. Each lang-tagged child
 *      lets assistive tech pick the correct voice per locale.
 *   4. CSS custom-property bridge — the disclaimer's fade-in
 *      duration + opacity-cap travel as inline custom properties so
 *      the SSOT remains in `scene-destruction-constants.ts`. CSS
 *      reads `var(--faz8-disclaimer-fade-in-ms, 1000ms)` and
 *      `var(--faz8-disclaimer-opacity-max, 0.9)` with defensive
 *      fallbacks.
 *   5. DISPOSE: idempotent. Removes the element, detaches the
 *      abort listener (the listener was wired with `{ once: true }`
 *      so passive removal via signal-fire is also safe).
 *
 * Reduced-motion: the CSS @media (prefers-reduced-motion: reduce)
 * block at the bottom of destruction.css drops the transition; the
 * .is-visible class snap-jumps to opacity 0.9. No JS gating needed
 * here — the CSS does the work.
 *
 * Lane 0 wires the i18n keys at the son-ekran call site
 * (destruction.faz8.disclaimer.primary / .secondary / .aria-label)
 * and threads them through `opts.primaryRu` / `opts.secondaryTr`.
 * NO Cyrillic/Turkish strings hardcoded HERE.
 *
 * PHASE 2B LANE B — frontend-dev FILLED
 */

import type { FAZ8_DISCLAIMER_OWNER } from '../../../../shared/scene-destruction-constants.js';
import type { Faz8DisclaimerHandle } from '../types.js';

/**
 * Mount option bag — son-ekran threads the i18n-resolved Cyrillic +
 * Turkish strings + the AbortSignal (so the chrome can dispose
 * cleanly when the parent runner aborts) + the hostElement (the
 * apartment scene root the disclaimer attaches into).
 *
 * TH-S5-03 enforcement: `caller` must be the FAZ8_DISCLAIMER_OWNER
 * constant — only faz8-son-ekran.ts holds that constant so only it
 * can construct the disclaimer chrome.
 */
export interface MountFaz8DisclaimerOptions {
  /** TH-S5-03 owner enforcement — must be FAZ8_DISCLAIMER_OWNER. */
  readonly caller: typeof FAZ8_DISCLAIMER_OWNER;
  /** Cyrillic primary copy. Default at call site: "Это просто шутка." */
  readonly primaryRu: string;
  /** Turkish secondary copy. Default at call site: "Bu sadece bir şaka." */
  readonly secondaryTr: string;
  /** i18n-resolved aria-label for screen readers (locale-specific). */
  readonly ariaLabel: string;
  /** Abort signal — dispose triggers when the signal fires. */
  readonly signal: AbortSignal;
  /** Parent DOM element the disclaimer attaches into. */
  readonly hostElement: HTMLElement;
}

/**
 * Mount the Faz 8 disclaimer chrome. Returns a Faz8DisclaimerHandle
 * whose setters (`setPrimaryText` / `setSecondaryText`) imperatively
 * mutate the rendered text and whose `dispose()` removes the element.
 *
 * CSS class hooks consumed (see destruction.css §"Faz 8 Son ekran"):
 *   - `.faz8-disclaimer`            — root container, opacity 0
 *   - `.faz8-disclaimer.is-visible` — fade-in end state (Lane A toggles)
 *   - `.faz8-disclaimer-primary`    — Cyrillic line typography
 *   - `.faz8-disclaimer-secondary`  — Turkish line typography
 */
export function mountFaz8Disclaimer(
  opts: MountFaz8DisclaimerOptions,
): Faz8DisclaimerHandle {
  const root = document.createElement('section');
  root.className = 'faz8-disclaimer';
  // ARIA: status + polite — the disclaimer is informational, not
  // urgent. `aria-live="polite"` means the screen reader waits for
  // the current utterance to finish before announcing.
  root.setAttribute('role', 'status');
  root.setAttribute('aria-live', 'polite');
  root.setAttribute('aria-label', opts.ariaLabel);
  // Do NOT set inline opacity here. The CSS class `.faz8-disclaimer`
  // already declares `opacity: 0` as the base state; the CSS rule
  // `.faz8-disclaimer.is-visible` provides the `opacity: 0.9` end-
  // state. Lane A (faz8-son-ekran.ts) toggles `.is-visible` via a
  // rAF callback after mount — any inline style.opacity would shadow
  // the class rule and prevent the CSS transition from firing.

  // Cyrillic primary line — h2 for semantic weight ("considered
  // statement" headline). lang="ru" lets screen readers route the
  // glyphs through a Russian voice.
  const primary = document.createElement('h2');
  primary.className = 'faz8-disclaimer-primary';
  primary.setAttribute('lang', 'ru');
  primary.textContent = opts.primaryRu;

  // Turkish secondary line — p tag for "subordinate-but-legible"
  // sibling read. lang="tr" routes to a Turkish voice.
  const secondary = document.createElement('p');
  secondary.className = 'faz8-disclaimer-secondary';
  secondary.setAttribute('lang', 'tr');
  secondary.textContent = opts.secondaryTr;

  root.appendChild(primary);
  root.appendChild(secondary);
  opts.hostElement.appendChild(root);

  let disposed = false;
  const handle: Faz8DisclaimerHandle = {
    kind: 'faz8-disclaimer',
    element: root,
    setPrimaryText: (text: string): void => {
      primary.textContent = text;
    },
    setSecondaryText: (text: string): void => {
      secondary.textContent = text;
    },
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      if (root.parentNode !== null) {
        root.parentNode.removeChild(root);
      }
    },
  };

  // Honor opts.signal — dispose when the parent runner aborts.
  if (opts.signal.aborted) {
    handle.dispose();
  } else {
    opts.signal.addEventListener('abort', (): void => handle.dispose(), { once: true });
  }

  return handle;
}
