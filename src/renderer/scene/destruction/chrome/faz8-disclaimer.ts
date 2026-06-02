/**
 * Faz 8 disclaimer chrome — Sprint 6 Phase 1 SCAFFOLD.
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
 * Lane B Phase 2B implementation outline (the body this stub
 * replaces):
 *
 *   1. CONSTRUCT root <section class="faz8-disclaimer"> with two
 *      child elements:
 *        - <h2 class="faz8-disclaimer__primary" lang="ru"> — Cyrillic
 *        - <p class="faz8-disclaimer__secondary" lang="tr"> — Turkish
 *      Initial opacity 0; transition opacity over
 *      FAZ8_SON_EKRAN_DISCLAIMER_FADE_IN_MS via CSS class toggle.
 *
 *   2. ATTACH to opts.hostElement (the destruction overlay
 *      container). Use `requestAnimationFrame` between attach and
 *      class toggle so the browser sees the transition start point.
 *
 *   3. ARIA:
 *      - Root: role="status" aria-live="polite"
 *      - Cyrillic block: lang="ru" (screen reader honours)
 *      - Turkish block: lang="tr"
 *
 *   4. setPrimaryText / setSecondaryText: imperative `.textContent`
 *      mutation; no re-render. Single-element-per-setter so the
 *      DOM remains stable across translation refreshes (Lane 0 may
 *      drive these to re-evaluate i18n keys).
 *
 *   5. DISPOSE: detach signal-aborted listener (if any) + remove
 *      element from parent. Idempotent (safe to call twice).
 *
 * Reduced-motion gate (designer Phase 2A §16 — Sprint 6 extends):
 *   - Skip the 1sn opacity fade; jump to final opacity at mount.
 *
 * NO Cyrillic/Turkish strings hardcoded HERE — Phase 2B Lane B
 * receives the strings via `opts.primaryRu` / `opts.secondaryTr`
 * which are i18n-resolved at the son-ekran call site (Lane 0
 * wires the i18n keys).
 *
 * Target line count: ~80-110L when Lane B fills.
 *
 * PHASE 2B LANE B — frontend-dev fills body
 */

import type { Faz8DisclaimerHandle } from '../types.js';

/**
 * Mount option bag — son-ekran threads the i18n-resolved Cyrillic +
 * Turkish strings + the AbortSignal (so the chrome can dispose
 * cleanly when the parent runner aborts) + the hostElement (the
 * destruction overlay container the disclaimer attaches into).
 */
export interface MountFaz8DisclaimerOptions {
  /** Cyrillic primary copy. Default at call site: "Это просто шутка." */
  readonly primaryRu: string;
  /** Turkish secondary copy. Default at call site: "Bu sadece bir şaka." */
  readonly secondaryTr: string;
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
 * Sprint 6 Phase 1 stub: returns a no-op handle with an empty
 * placeholder element. Lane B Phase 2B fills the DOM + ARIA + CSS
 * wiring per the implementation outline above.
 */
export function mountFaz8Disclaimer(
  opts: MountFaz8DisclaimerOptions,
): Faz8DisclaimerHandle {
  // Phase 1 scaffold: minimal placeholder element so callers can
  // wire the handle into the DOM tree before Lane B fills. The
  // element carries the class hook Lane B will attach styles to.
  const element = document.createElement('section');
  element.className = 'faz8-disclaimer';
  element.dataset['scaffold'] = 'phase-1';
  // Phase 1 stash of the initial strings so Phase 2B fill can read
  // them back from the dataset if the constructor flow is rewired.
  element.dataset['primaryRu'] = opts.primaryRu;
  element.dataset['secondaryTr'] = opts.secondaryTr;

  let disposed = false;
  const handle: Faz8DisclaimerHandle = {
    kind: 'faz8-disclaimer',
    element,
    setPrimaryText: (text: string): void => {
      element.dataset['primaryRu'] = text;
    },
    setSecondaryText: (text: string): void => {
      element.dataset['secondaryTr'] = text;
    },
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      if (element.parentNode !== null) {
        element.parentNode.removeChild(element);
      }
    },
  };

  // Wire the abort signal so the parent runner's signal aborts the
  // chrome alongside it (reverse-allocation dispose order).
  if (opts.signal.aborted) {
    handle.dispose();
  } else {
    opts.signal.addEventListener('abort', (): void => handle.dispose(), { once: true });
  }

  return handle;
}
