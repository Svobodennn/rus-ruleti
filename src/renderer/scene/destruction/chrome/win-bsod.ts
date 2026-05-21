/**
 * Win11 BSOD full-screen chrome — Sprint 5 Phase 1 STUB.
 *
 * WHO CALLS THIS: faz6-bsod.ts#mountWinBsod — single caller, Win branch
 * only.
 *
 * SHARED RESOURCES OWNED: none directly — the frowny-face flicker
 * setInterval is OWNED by faz6-bsod.ts (FROWNY_FLICKER_TIMER_OWNER
 * decree); faz6 invokes `startFrownyFlicker()` once after mount and the
 * impl owns the interval id until `dispose()`.
 *
 * CALLEES (Phase 2B Lane D will wire):
 *   - inline DOM construction (full-screen `#0078D4` background, sad
 *     face glyph, stop-code text, IMG element for QR PNG)
 *   - i18n/strings.ts `t(key, locale)` for "Your PC ran into a problem"
 *     copy
 *   - Static QR PNG load from `./assets/destruction/win-bsod-qr.png` —
 *     Lane D ships the asset; Phase 1 creates the directory placeholder.
 *
 * SPRINT 5 LANE: D — Lane D (frontend-dev, paralleling Sprint 4
 * win-dialog.ts) builds the BSOD chrome AND ships the QR PNG asset
 * encoding `https://www.windows.com/stopcode` (S3 closure + TH-S4-05
 * carry-forward: real QR is required for telif-safe believability).
 *
 * Visual specs (PLAN §7 line 282):
 *   - Full-screen `#0078D4` (Windows BSOD blue) background.
 *   - Sad face `:(` glyph — large white, centred horizontally, top
 *     ~25% vertically.
 *   - "Your PC ran into a problem and needs to restart" body copy
 *     (i18n key `destruction.faz6.win.bsod.body` — Lane E publishes).
 *   - "0% complete" stuck progress text.
 *   - Stop code: `CRITICAL_PROCESS_DIED` (literal, not localised — it's
 *     a Windows error code identifier).
 *   - QR PNG bottom-left, ~88x88 px (Windows BSOD QR convention).
 *   - CRT frowny flicker engages via `startFrownyFlicker()` — flickers
 *     the `:(` glyph opacity at FAZ6_FROWNY_FLICKER_HZ = 5Hz.
 *
 * CSP verification (Phase 1): `img-src 'self' data: blob:` covers PNG
 * load from local renderer asset path. NO change to CSP needed.
 *
 * Reduced-motion gate (designer Phase 2A §10):
 *   - Frowny flicker: disabled (sad face stays solid).
 *   - Backdrop fade-in: instant.
 *
 * TODO Sprint 5 Lane D: replace stub body with: BSOD div + sad face +
 * body copy + stop code + progress text + QR IMG + flicker setInterval +
 * dispose chain. Target ~250-300L.
 */

/* eslint-disable @typescript-eslint/no-unused-vars -- Sprint 5 Lane D fills this stub. */

import type { WinBsodHandle } from '../types.js';

/** Mount-arg bag. */
export interface MountWinBsodArgs {
  readonly hostElement: HTMLElement;
  readonly stopCode: string;
  /**
   * Stuck progress percent (kept as parameter for symmetry — typically
   * 0 per PLAN §7 "Progress %0 takılı" though Lane D may vary by cycle
   * if Sprint 6 reveal hand-off wants pulsing).
   */
  readonly panicPercent: number;
  readonly signal: AbortSignal;
}

/**
 * Mount the Win11 BSOD full-screen into the destruction container.
 * Returns a handle whose `startFrownyFlicker()` engages the CRT flicker
 * and `dispose()` removes the BSOD.
 */
export function mountWinBsod(args: MountWinBsodArgs): WinBsodHandle {
  // TODO Sprint 5 Lane D: build Win11 BSOD per spec + load QR PNG.
  const element = document.createElement('div');
  element.className = 'faz6-win-bsod';
  args.hostElement.appendChild(element);
  let disposed = false;
  return {
    kind: 'win-bsod',
    element,
    startFrownyFlicker: (): void => undefined,
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      element.remove();
    },
  };
}
