/**
 * Faz 8 restart-hint chrome — Sprint 6 Phase 1 SCAFFOLD.
 *
 * Owns the centred bilingual restart-hint text shown 7 seconds into
 * son-ekran. The hint conveys "R = TEKRAR" (Cyrillic + TR mirroring)
 * so the user knows the R-key restart binding is available.
 *
 * SCOPE BOUNDARY (Sprint 6): HINT TEXT only. Sprint 7+ replaces the
 * static hint with TEKRAR / ÇIK button UI per PLAN §7 line 302.
 *
 * WHO CALLS THIS: faz8-son-ekran.ts (single caller).
 *
 * SHARED RESOURCES OWNED: FAZ8_RESTART_HINT_OWNER decree —
 * faz8-son-ekran.ts owns the lifecycle (mount + dispose).
 *
 * Lane B Phase 2B implementation outline (the body this stub
 * replaces):
 *
 *   1. CONSTRUCT root <p class="faz8-restart-hint"> with two child
 *      <span> elements:
 *        - <span lang="ru"> — Cyrillic hint
 *        - <span lang="tr"> — Turkish hint
 *      Separated by a designer-defined glyph (designer §6 may
 *      choose " / " or " · " — Phase 2A locks). Initial opacity 0;
 *      CSS class toggle fades to FAZ8_SON_EKRAN_RESTART_HINT_OPACITY
 *      (0.4) on attach.
 *
 *   2. ATTACH to opts.hostElement (the destruction overlay
 *      container). Same rAF-class-toggle pattern as
 *      mountFaz8Disclaimer so the browser sees the transition.
 *
 *   3. ARIA:
 *      - Root: role="note"
 *      - Cyrillic span: lang="ru"
 *      - Turkish span: lang="tr"
 *
 *   4. setHintText: imperative `.textContent` mutation; no re-
 *      render (Lane 0 may drive this to re-evaluate i18n keys).
 *
 *   5. DISPOSE: detach signal-aborted listener (if any) + remove
 *      element from parent. Idempotent.
 *
 * Reduced-motion gate (designer Phase 2A §16 — Sprint 6 extends):
 *   - Skip the fade; jump to final opacity at mount.
 *
 * NO Cyrillic/Turkish strings hardcoded HERE — Phase 2B Lane B
 * receives the strings via `opts.hintRu` / `opts.hintTr` which are
 * i18n-resolved at the son-ekran call site (Lane 0 wires keys).
 *
 * Target line count: ~80-110L when Lane B fills.
 *
 * PHASE 2B LANE B — frontend-dev fills body
 */

import type { Faz8RestartHintHandle } from '../types.js';

/**
 * Mount option bag — son-ekran threads the i18n-resolved hint
 * strings + the AbortSignal + the hostElement.
 */
export interface MountFaz8RestartHintOptions {
  /** Cyrillic hint copy. Phase 2B Lane 0 wires; e.g. "R = ЕЩЁ РАЗ". */
  readonly hintRu: string;
  /** Turkish hint copy. e.g. "R = TEKRAR". */
  readonly hintTr: string;
  /** Abort signal — dispose triggers when the signal fires. */
  readonly signal: AbortSignal;
  /** Parent DOM element the hint attaches into. */
  readonly hostElement: HTMLElement;
}

/**
 * Mount the Faz 8 restart-hint chrome. Returns a Faz8RestartHintHandle
 * whose `setHintText` setter imperatively mutates the rendered text
 * and whose `dispose()` removes the element.
 *
 * Sprint 6 Phase 1 stub: returns a no-op handle with an empty
 * placeholder element. Lane B Phase 2B fills the DOM + ARIA + CSS
 * wiring per the implementation outline above.
 */
export function mountFaz8RestartHint(
  opts: MountFaz8RestartHintOptions,
): Faz8RestartHintHandle {
  // Phase 1 scaffold: minimal placeholder element so callers can
  // wire the handle into the DOM tree before Lane B fills.
  const element = document.createElement('p');
  element.className = 'faz8-restart-hint';
  element.dataset['scaffold'] = 'phase-1';
  element.dataset['hintRu'] = opts.hintRu;
  element.dataset['hintTr'] = opts.hintTr;

  let disposed = false;
  const handle: Faz8RestartHintHandle = {
    kind: 'faz8-restart-hint',
    element,
    setHintText: (textRu: string, textTr: string): void => {
      element.dataset['hintRu'] = textRu;
      element.dataset['hintTr'] = textTr;
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
  // chrome alongside it.
  if (opts.signal.aborted) {
    handle.dispose();
  } else {
    opts.signal.addEventListener('abort', (): void => handle.dispose(), { once: true });
  }

  return handle;
}
