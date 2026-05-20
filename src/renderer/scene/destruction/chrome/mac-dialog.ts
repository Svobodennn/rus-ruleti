/**
 * macOS Critical Dialog chrome — Phase 1 STUB.
 *
 * Phase 2B swift-expert owns this lane. Pixel-perfect Apple HIG modal:
 *
 *   - Backdrop: CSS `backdrop-filter: blur(20px) saturate(180%)` over a
 *     translucent overlay (approximates Mac native vibrancy).
 *   - Box: DIALOG_MAC_WIDTH_PX × DIALOG_MAC_HEIGHT_PX, 12px rounded
 *     corners, background #F2F2F2 with subtle inset shadow.
 *   - Apple logo: procedural SVG silhouette (designer-original — NO real
 *     Apple logo bundled per PLAN §12 C1 risk closure).
 *   - Title: "Critical Error" / i18n key destruction.mac.dialog.title.
 *     Bold 14px, font-family `-apple-system, 'SF Pro Display'` (system
 *     reference — NO SF Pro bundled, system font ref only).
 *   - Body: wrapped to ~340px, "An unrecoverable failure occurred in
 *     kernel_task." Body fades countdown line at the bottom:
 *     "Restarting in 5..." → 4 → 3 → 2 → 1.
 *   - Buttons: "Restart Now" primary blue right-aligned + "Cancel"
 *     secondary disabled.
 *
 * Native chord stub: procedural Web Audio Oscillator sine envelope
 * approximating a broken Mac chime. NO real mac-chime-broken.ogg bundled
 * Phase 1 (Phase 2B may add later if audio assets land — see PLAN §10).
 *
 * If `prefers-reduced-motion: reduce`:
 *   - Backdrop blur transition: instant (no CSS transition timing).
 *   - Dialog enter animation: opacity only (no scale or transform).
 *
 * Called by:
 *   - faz1-critical-dialog.ts when os === 'mac':
 *     `const handle = mountMacDialog(container, DIALOG_COUNTDOWN_START);`
 *     `handle.setCountdown(4); ... handle.dispose();`
 */

import type { MacDialogHandle } from '../types.js';

/**
 * Mount a Mac critical dialog into the destruction container. Returns a
 * handle whose `setCountdown(n)` updates the "Restarting in N..." label
 * and `dispose()` removes the element + cancels any internal RAF/interval.
 *
 * Phase 2B swift-expert fills the body.
 */
export function mountMacDialog(
  _container: HTMLElement,
  _countdownStart: number,
): MacDialogHandle {
  return {
    setCountdown: (_n): void => {
      throw new Error('mac-dialog: Phase 2B swift-expert fills setCountdown()');
    },
    dispose: (): void => {
      // No-op safe to call on the stub.
    },
  };
}
