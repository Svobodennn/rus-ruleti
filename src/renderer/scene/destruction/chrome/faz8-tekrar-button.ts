/**
 * Faz 8 TEKRAR (restart) button chrome — Sprint 7 Phase 1 STUB.
 *
 * Owns the centred bilingual "TEKRAR" restart button rendered on the
 * Faz 8 son-ekran closing tableau. Clicking / Enter / Space invokes
 * the destruction-director's `requestRestart()` (KIOSK-SAFE renderer-
 * only FSM re-entry; PLAN §12 S9). Fades in at
 * FAZ8_BUTTON_FADEIN_START_OFFSET_MS into son-ekran over
 * FAZ8_BUTTON_FADEIN_DURATION_MS via the CSS class
 * FAZ8_TEKRAR_BUTTON_VISIBLE_CLASS ('is-visible').
 *
 * WHO CALLS THIS: faz8-son-ekran.ts (single caller — Lane A Phase 2B
 * wires the mount call after the disclaimer + restart-hint have
 * settled). Owner constellation:
 *   - mount caller   : faz8-son-ekran (FAZ8_TEKRAR_BUTTON_CHROME_OWNER)
 *   - click listener : faz8-son-ekran (FAZ8_BUTTON_CLICK_LISTENER_OWNER)
 *   - keydown listener: faz8-son-ekran (FAZ8_BUTTON_KEYDOWN_LISTENER_OWNER)
 *
 * TH-S6-03 closure (Sprint 6 BLOCKER-3 carry-forward): hostElement is
 * REQUIRED — no default, no `?`-optional. The destruction-takeover
 * overlay is at opacity:0 by son-ekran entry; children of an
 * opacity:0 parent are invisible by compositor multiply regardless of
 * their own opacity. Lane A passes a sibling host (typically the
 * apartment scene root or document.body); the type system rejects
 * missing-host construction.
 *
 * TH-S6-04 closure (universal owner enforcement): the `caller` field
 * is type-narrowed to FAZ8_TEKRAR_BUTTON_CHROME_OWNER — only modules
 * importing that constant can construct the option bag. Runtime
 * caller-equality check is the defence-in-depth fallback for unsafe
 * `as` casts.
 *
 * Reduced-motion: the CSS @media (prefers-reduced-motion: reduce)
 * block in destruction.css will drop the fade-in transition; the
 * .is-visible class snap-jumps to opacity 1. No JS gating needed
 * here — Lane B CSS handles the gate (designer Phase 2A §16).
 *
 * a11y:
 *   - <button> element (semantic; keyboard activation via Enter +
 *     Space is built-in to the platform).
 *   - aria-label resolved from i18n at the mount call site (Lane A
 *     passes the locale-appropriate string via opts.ariaLabel).
 *   - Focus management: Tab order is browser default. Lane B CSS
 *     pairs FAZ8_TEKRAR_BUTTON_FOCUSED_CLASS with `:focus-visible`
 *     for the keyboard-focus ring.
 *
 * PHASE 1 STUB BODY: throws on call. Lane B Phase 2B implements the
 * actual DOM construction + click/keydown wiring + dispose chain.
 *
 * REFERENCES:
 *   - directive §9 TASK 4 — Sprint 7 Phase 1 chrome stub spec
 *   - directive §5 TH-S6-03 — REQUIRED hostElement closure
 *   - directive §5 TH-S6-04 — universal owner enforcement
 *   - PLAN §12 S9 — KIOSK SAFETY (renderer-only FSM mutation)
 *   - PLAN §7 line 302 — restart hint → button progression
 */

import { FAZ8_TEKRAR_BUTTON_CHROME_OWNER } from '../../../../shared/scene-destruction-constants.js';
import type { Faz8TekrarButtonHandle, Faz8TekrarButtonOptions } from '../types.js';

/**
 * Mount the Faz 8 TEKRAR button chrome — Sprint 7 Phase 1 STUB.
 *
 * Lane B Phase 2B FILL spec (this body — outlined for the Phase 2B
 * implementer):
 *   1. RUNTIME CALLER CHECK — `if (opts.caller !== FAZ8_TEKRAR_BUTTON_
 *      CHROME_OWNER) throw new Error('[faz8-tekrar-button] caller
 *      decree violation: expected ${FAZ8_TEKRAR_BUTTON_CHROME_OWNER},
 *      got ${opts.caller}')` — defence-in-depth fallback for `as`-cast
 *      bypass of the type-level narrowing.
 *   2. CONSTRUCT <button class="faz8-tekrar-button"> with the i18n-
 *      resolved label text + aria-label. Element type
 *      `HTMLButtonElement` for native keyboard activation semantics.
 *   3. ATTACH to opts.hostElement. Lane A passes the scene-root or
 *      document.body per opts.hostKind.
 *   4. WIRE click + keydown listeners owned by FAZ8_BUTTON_CLICK_
 *      LISTENER_OWNER + FAZ8_BUTTON_KEYDOWN_LISTENER_OWNER. Both
 *      invoke opts.onClick (which the caller wires to
 *      destruction-director.requestRestart()).
 *   5. CSS class bridge — duration + start offset travel as inline
 *      custom properties so the SSOT remains in
 *      scene-destruction-constants.ts.
 *   6. DISPOSE: idempotent. Removes element, detaches click + keydown
 *      listeners, honours opts.signal (dispose on signal fire).
 *
 * @throws Always (Phase 1 STUB — Lane B Phase 2B implements body).
 */
export function mountFaz8TekrarButton(
  opts: Faz8TekrarButtonOptions,
): Faz8TekrarButtonHandle {
  if (opts.caller !== FAZ8_TEKRAR_BUTTON_CHROME_OWNER) {
    throw new Error(
      `[faz8-tekrar-button] caller decree violation: expected ${FAZ8_TEKRAR_BUTTON_CHROME_OWNER}, got ${String(opts.caller)}`,
    );
  }
  throw new Error('Stub — Lane B Phase 2B implements');
}
