/**
 * macOS top menubar mimik — Phase 1 STUB.
 *
 * Phase 2B kraken-faz2-3 owns this lane (chrome co-located with the runner
 * that mounts it). Pixel-perfect macOS top menubar:
 *
 *   - MENUBAR_MAC_HEIGHT_PX (28px) bar at top of viewport.
 *   - Gradient background (Sprint 4 designer fills exact palette).
 *   - Apple logo procedural SVG silhouette (designer-original — NO real
 *     Apple logo bundled per PLAN §12 C1).
 *   - App name "Finder" left of center.
 *   - Status icons right-aligned: BAT (87% — static), WiFi (3-bar
 *     simplified SVG), live clock HH:MM:SS updated each RAF.
 *
 * Live clock: uses `new Date()` each second via setInterval (semantic
 * stability — RAF would drift on system clock changes; 1Hz tick is cheap).
 *
 * If `prefers-reduced-motion: reduce`:
 *   - No animation surfaces (the clock tick is the only motion and it's a
 *     text content swap, not a transform/opacity transition).
 *
 * Called by:
 *   - faz2-takeover.ts when os === 'mac':
 *     `const handle = mountMacMenubar(container); ... handle.dispose();`
 */

import type { MacMenubarHandle } from '../types.js';

/**
 * Mount the Mac menubar at the top of the destruction container. Returns
 * a handle whose `dispose()` removes the element + clears the clock
 * interval.
 *
 * Phase 2B kraken-faz2-3 fills the body.
 */
export function mountMacMenubar(_container: HTMLElement): MacMenubarHandle {
  return {
    dispose: (): void => {
      // No-op safe to call on the stub.
    },
  };
}
