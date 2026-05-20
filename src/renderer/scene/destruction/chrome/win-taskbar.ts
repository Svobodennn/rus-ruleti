/**
 * Win11 bottom taskbar mimik — Phase 1 STUB.
 *
 * Phase 2B kraken-faz2-3 owns this lane (chrome co-located with the runner
 * that mounts it). Pixel-perfect Win11 fluent taskbar:
 *
 *   - TASKBAR_WIN_HEIGHT_PX (48px) bar at bottom of viewport.
 *   - Dark acrylic background (designer-original — no real Windows
 *     taskbar PNG bundled per PLAN §12 C1).
 *   - Win11 four-square procedural SVG logo, center-aligned (PLAN §8 spec
 *     — Win11 taskbar is center-justified, unlike pre-11 left-aligned).
 *   - System tray icons right-aligned: live clock HH:MM and day/month,
 *     updated each minute (cheap interval — clock at 60s granularity).
 *
 * If `prefers-reduced-motion: reduce`:
 *   - No animation surfaces (clock tick is text content only).
 *
 * Called by:
 *   - faz2-takeover.ts when os === 'win':
 *     `const handle = mountWinTaskbar(container); ... handle.dispose();`
 */

import type { WinTaskbarHandle } from '../types.js';

/**
 * Mount the Win11 taskbar at the bottom of the destruction container.
 * Returns a handle whose `dispose()` removes the element + clears the
 * clock interval.
 *
 * Phase 2B kraken-faz2-3 fills the body.
 */
export function mountWinTaskbar(_container: HTMLElement): WinTaskbarHandle {
  return {
    dispose: (): void => {
      // No-op safe to call on the stub.
    },
  };
}
