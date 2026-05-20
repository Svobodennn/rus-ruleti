/**
 * Win11 Critical Dialog chrome — Phase 1 STUB.
 *
 * Phase 2B frontend-dev owns this lane (with oracle research for Win11
 * fluent specs). Pixel-perfect Win11 fluent modal:
 *
 *   - Backdrop: CSS acrylic approximation — semi-transparent darkening +
 *     backdrop-filter blur (8px).
 *   - Box: DIALOG_WIN_WIDTH_PX × DIALOG_WIN_HEIGHT_PX, 8px rounded corners
 *     (Win11 fluent spec), dark mode background.
 *   - Win11 four-square accent: procedural SVG (designer-original — NO
 *     real Microsoft Windows logo bundled per PLAN §12 C1 risk closure).
 *   - Title: "Critical Process Failed" / i18n key
 *     destruction.win.dialog.title. Bold 14px Segoe UI Variable (bundled
 *     OFL font per PLAN §10).
 *   - Body: wrapped to ~360px, "A critical system process has stopped
 *     responding. Windows will collect error info and restart."
 *   - Buttons: "OK" primary blue right-aligned + "More info" secondary.
 *
 * Native chord stub: procedural Web Audio Oscillator descending pitch
 * envelope approximating a Win error chord. NO real bsod-beep.wav or Win
 * error chord bundled Phase 1 (Phase 2B may add later — see PLAN §10).
 *
 * If `prefers-reduced-motion: reduce`:
 *   - Acrylic backdrop transition: instant.
 *   - Dialog enter animation: opacity only.
 *
 * Called by:
 *   - faz1-critical-dialog.ts when os === 'win':
 *     `const handle = mountWinDialog(container); ... handle.dispose();`
 */

import type { WinDialogHandle } from '../types.js';

/**
 * Mount a Win critical dialog into the destruction container. Returns a
 * handle whose `dispose()` removes the element + cancels internal timers.
 *
 * Phase 2B frontend-dev fills the body.
 */
export function mountWinDialog(_container: HTMLElement): WinDialogHandle {
  return {
    dispose: (): void => {
      // No-op safe to call on the stub.
    },
  };
}
