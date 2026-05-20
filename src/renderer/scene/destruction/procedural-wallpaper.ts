/**
 * Procedural wallpaper renderer — Phase 1 STUB.
 *
 * PLAN §12 S6 risk closure: Apple/Microsoft default wallpapers are NEVER
 * bundled. Sprint 4 Phase 2B kraken-faz2-3 renders the Faz 2 takeover
 * wallpaper procedurally:
 *
 *   - OS = 'mac': SVG-as-string template → drawImage → Canvas2D. Generic
 *     mountain silhouette + gradient sky + sun bloom. Palette drawn from
 *     WALLPAPER_MAC_PALETTE constants (designer-original geometry).
 *   - OS = 'win': SVG-as-string template → drawImage → Canvas2D. Abstract
 *     Win11-style bloom gradient + four-square accent. Palette drawn from
 *     WALLPAPER_WIN_PALETTE constants (designer-original geometry).
 *
 * Returns an HTMLCanvasElement the caller (faz2-takeover) inserts into the
 * destruction overlay at z-index just above the lobby snapshot (so the
 * wallpaper covers the apartment while toasts + chrome render above it).
 *
 * Pattern proven Sprint 3: SVG-as-string → Image → drawImage → Canvas2D
 * (see src/renderer/loader/procedural-textures.ts for the same approach
 * applied to envelope / portrait / poster textures).
 *
 * If `prefers-reduced-motion: reduce`:
 *   - The static render path is identical (no animation to gate).
 *
 * Called by:
 *   - faz2-takeover.ts at Faz 2 entry: const canvas = renderWallpaper(os);
 *     container.appendChild(canvas).
 *
 * Phase 2B owner: kraken-faz2-3.
 */

import type { OsVariant } from './types.js';

/**
 * Render the procedural wallpaper for the given OS variant. Returns a
 * detached HTMLCanvasElement sized to the current viewport (the caller is
 * responsible for inserting it + handling resize via re-render).
 *
 * Phase 2B kraken-faz2-3 fills the body.
 */
export function renderWallpaper(_os: OsVariant): HTMLCanvasElement {
  throw new Error('procedural-wallpaper: Phase 2B kraken-faz2-3 fills renderWallpaper()');
}
