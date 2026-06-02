/**
 * Faz 8 restart-hint chrome — Sprint 6 Phase 2B Lane B FILL.
 *
 * Owns the bottom-centred bilingual restart-hint text shown 7 seconds
 * into son-ekran. The hint conveys "R = TEKRAR" (or Cyrillic
 * equivalent) so the user knows the R-key restart binding is
 * available.
 *
 * SCOPE BOUNDARY (Sprint 6): HINT TEXT only. Sprint 7+ replaces the
 * static hint with TEKRAR / ÇIK button UI per PLAN §7 line 302.
 *
 * WHO CALLS THIS: faz8-son-ekran.ts (single caller).
 *
 * SHARED RESOURCES OWNED: FAZ8_RESTART_HINT_OWNER decree —
 * faz8-son-ekran.ts owns the lifecycle (mount + dispose).
 *
 * LOCALE-CONDITIONAL RENDERING — this surface differs from the
 * disclaimer's bilingual-stack treatment: per i18n strings.ts comment
 * (line 317), "the user sees ONE line in their UI locale (not
 * bilingual)". We resolve the user's locale via `resolveUserLocale()`
 * at mount time and render the matching string. The runner threads
 * BOTH locales in opts (hintRu + hintTr) so the chrome stays
 * declarative — no i18n imports here, no key lookups — Lane 0 owns
 * the key→string resolution at the call site.
 *
 * Lane B fill (this body):
 *   1. CONSTRUCT root <p class="faz8-restart-hint"> — single element,
 *      single locale text. Initial opacity 0 (anchors CSS transition).
 *   2. ATTACH to opts.hostElement (apartment scene root). CSS handles
 *      positioning: position:absolute, bottom:48px, centred horizontally
 *      via left:50% + translateX(-50%).
 *   3. ARIA: role="status" aria-live="off" per Phase 2A §20 matrix
 *      row 42 — the hint is informational + low-urgency; aria-live=off
 *      keeps the screen reader from announcing the appearance of a
 *      hint the user may never act on. The lang attribute matches the
 *      resolved locale so the screen reader (if it lands on the
 *      element via tab/explore) uses the correct voice.
 *   4. setHintText: imperative `.textContent` mutation. Receives BOTH
 *      locales so locale-switch refreshes from Lane 0 can re-resolve
 *      at runtime (re-checks resolveUserLocale() each call so a
 *      mid-session locale flip would pick the new branch). No
 *      re-render of the element itself.
 *   5. DISPOSE: idempotent. Removes the element + honours the abort
 *      signal.
 *
 * Reduced-motion: the CSS @media (prefers-reduced-motion: reduce)
 * block drops the transition; the .is-visible class snap-jumps to
 * opacity 0.4. No JS gating needed here.
 *
 * NO Cyrillic/Turkish strings hardcoded HERE — Lane 0 wires the i18n
 * keys (destruction.faz8.restart.hint) at the son-ekran call site.
 *
 * PHASE 2B LANE B — frontend-dev FILLED
 */

import { resolveUserLocale } from '../../../i18n/strings.js';
import type { Faz8RestartHintHandle } from '../types.js';

/**
 * Mount option bag — son-ekran threads BOTH locale strings so the
 * chrome can re-resolve on locale-switch without re-mounting.
 */
export interface MountFaz8RestartHintOptions {
  /** Cyrillic hint copy. Phase 2B Lane 0 wires; e.g. "Нажмите R для перезапуска". */
  readonly hintRu: string;
  /** Turkish hint copy. e.g. "Yeniden başlatmak için R'ye basın". */
  readonly hintTr: string;
  /** Abort signal — dispose triggers when the signal fires. */
  readonly signal: AbortSignal;
  /** Parent DOM element the hint attaches into. */
  readonly hostElement: HTMLElement;
}

/**
 * Mount the Faz 8 restart-hint chrome. Returns a Faz8RestartHintHandle
 * whose `setHintText(textRu, textTr)` setter re-resolves the locale +
 * mutates the rendered text, and whose `dispose()` removes the
 * element.
 *
 * CSS class hooks consumed (see destruction.css §"Faz 8 Son ekran"):
 *   - `.faz8-restart-hint`            — root, opacity 0, bottom-centred
 *   - `.faz8-restart-hint.is-visible` — fade-in end state (Lane A toggles)
 */
export function mountFaz8RestartHint(
  opts: MountFaz8RestartHintOptions,
): Faz8RestartHintHandle {
  const root = document.createElement('p');
  root.className = 'faz8-restart-hint';
  // ARIA: status + off — informational, low-urgency. The hint may
  // never be acted on; we do not interrupt the screen reader for it.
  root.setAttribute('role', 'status');
  root.setAttribute('aria-live', 'off');

  // Inline opacity 0 anchors the CSS transition start point.
  root.style.opacity = '0';

  // Render the single locale-matching string. Capture the resolver
  // result so setHintText can repeat the same logic for locale-switch.
  const initialLocale = resolveUserLocale();
  root.setAttribute('lang', initialLocale);
  root.textContent = initialLocale === 'ru' ? opts.hintRu : opts.hintTr;

  opts.hostElement.appendChild(root);

  let disposed = false;
  const handle: Faz8RestartHintHandle = {
    kind: 'faz8-restart-hint',
    element: root,
    setHintText: (textRu: string, textTr: string): void => {
      // Re-resolve locale so a mid-session switch picks the new branch.
      const locale = resolveUserLocale();
      root.setAttribute('lang', locale);
      root.textContent = locale === 'ru' ? textRu : textTr;
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
