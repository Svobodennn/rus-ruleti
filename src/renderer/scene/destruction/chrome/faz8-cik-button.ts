/**
 * Faz 8 ÇIK (quit) button chrome — Sprint 7 Phase 1 STUB.
 *
 * Owns the centred bilingual "ÇIK" quit button rendered on the Faz 8
 * son-ekran closing tableau. Clicking / Enter / Space invokes
 * `window.api.quit()` (S10 Path A — reuses the Sprint 0 `app:quit`
 * IPC channel via the preload bridge; main process invokes app.quit()
 * which closes the BrowserWindow + terminates the Electron app).
 *
 * S10 IPC CONTRACT (Sprint 7 Phase 1 decision):
 *   - PATH A (CHOSEN): ÇIK reuses the existing Sprint 0 `app:quit`
 *     IPC channel via window.api.quit(). NO new IPC channel introduced
 *     for Sprint 7. The preload bridge already exposes
 *     window.api.quit() as a fire-and-forget call; main/ipc.ts already
 *     has the isAllowedSender check + ipcMain.on listener. The
 *     channel is kiosk-safe (it calls app.quit() in main process,
 *     which closes the BrowserWindow + terminates the app cleanly).
 *   - PATH B (REJECTED): NEW IPC channel 'app:quit-from-renderer'.
 *     Would have required preload exposure + main handler + types +
 *     security-reviewer Phase 3 audit. Rejected because the existing
 *     channel already provides the exact contract needed (kiosk-safe
 *     renderer-triggered app quit with sender validation).
 *
 * CONTRAST WITH TEKRAR BUTTON: TEKRAR is RENDERER-ONLY (mutates the
 * destruction-director FSM via requestRestart(); does NOT exit the
 * app — joke-app invariant preserved). ÇIK uses the existing
 * app:quit IPC channel which terminates the app — the only Sprint 7
 * surface that exits the app cleanly via user action (ESC-hold is
 * the existing emergency exit; ÇIK is the deliberate "I'm done"
 * exit at the closing tableau).
 *
 * WHO CALLS THIS: faz8-son-ekran.ts (single caller — Lane A Phase 2B
 * wires the mount call after the disclaimer + restart-hint have
 * settled). Owner constellation:
 *   - mount caller   : faz8-son-ekran (FAZ8_CIK_BUTTON_CHROME_OWNER)
 *   - click listener : faz8-son-ekran (FAZ8_BUTTON_CLICK_LISTENER_OWNER)
 *   - keydown listener: faz8-son-ekran (FAZ8_BUTTON_KEYDOWN_LISTENER_OWNER)
 *
 * TH-S6-03 closure (Sprint 6 BLOCKER-3 carry-forward): hostElement is
 * REQUIRED — no default, no `?`-optional. Same rationale as
 * faz8-tekrar-button.ts (destruction-takeover overlay is opacity:0
 * by son-ekran entry).
 *
 * TH-S6-04 closure (universal owner enforcement): the `caller` field
 * is type-narrowed to FAZ8_CIK_BUTTON_CHROME_OWNER — only modules
 * importing that constant can construct the option bag. Runtime
 * caller-equality check is the defence-in-depth fallback.
 *
 * Reduced-motion: same gate as TEKRAR button — Lane B CSS @media
 * (prefers-reduced-motion: reduce) drops the fade-in transition.
 *
 * a11y:
 *   - <button> element (semantic; keyboard activation via Enter +
 *     Space is built-in to the platform).
 *   - aria-label resolved from i18n at the mount call site.
 *   - Focus management: Tab order is browser default. Lane B CSS
 *     pairs FAZ8_CIK_BUTTON_FOCUSED_CLASS with `:focus-visible` for
 *     the keyboard-focus ring.
 *
 * PHASE 1 STUB BODY: throws on call. Lane B Phase 2B implements the
 * actual DOM construction + click/keydown wiring + dispose chain.
 *
 * REFERENCES:
 *   - directive §9 TASK 4 — Sprint 7 Phase 1 chrome stub spec
 *   - directive §9 TASK 7 — S10 IPC decision (Path A chosen)
 *   - directive §5 TH-S6-03 — REQUIRED hostElement closure
 *   - directive §5 TH-S6-04 — universal owner enforcement
 *   - src/main/ipc.ts:62-70 — existing app:quit handler
 *   - src/preload/index.ts:142-144 — window.api.quit() exposure
 */

import { FAZ8_CIK_BUTTON_CHROME_OWNER } from '../../../../shared/scene-destruction-constants.js';
import type { Faz8CikButtonHandle, Faz8CikButtonOptions } from '../types.js';

/**
 * Mount the Faz 8 ÇIK button chrome — Sprint 7 Phase 1 STUB.
 *
 * Lane B Phase 2B FILL spec (this body — outlined for the Phase 2B
 * implementer):
 *   1. RUNTIME CALLER CHECK — same pattern as faz8-tekrar-button.ts.
 *   2. CONSTRUCT <button class="faz8-cik-button"> with the i18n-
 *      resolved label text + aria-label. Element type
 *      HTMLButtonElement.
 *   3. ATTACH to opts.hostElement. Lane A passes scene-root or
 *      document.body per opts.hostKind.
 *   4. WIRE click + keydown listeners. Both invoke opts.onClick which
 *      Lane A wires to `(): void => window.api.quit()` (S10 Path A).
 *   5. CSS class bridge — duration + start offset as inline custom
 *      properties.
 *   6. DISPOSE: idempotent. Removes element, detaches click + keydown
 *      listeners, honours opts.signal (dispose on signal fire).
 *
 * @throws Always (Phase 1 STUB — Lane B Phase 2B implements body).
 */
export function mountFaz8CikButton(
  opts: Faz8CikButtonOptions,
): Faz8CikButtonHandle {
  if (opts.caller !== FAZ8_CIK_BUTTON_CHROME_OWNER) {
    throw new Error(
      `[faz8-cik-button] caller decree violation: expected ${FAZ8_CIK_BUTTON_CHROME_OWNER}, got ${String(opts.caller)}`,
    );
  }
  throw new Error('Stub — Lane B Phase 2B implements');
}
