/**
 * Procedural wallpaper renderer — Phase 2B (kraken-faz2-3).
 *
 * PLAN §12 S6 risk closure: Apple/Microsoft default wallpapers are NEVER
 * bundled. Sprint 4 Phase 2B renders the Faz 2 takeover wallpaper procedurally
 * directly into a Canvas2D context. The result is a detached
 * HTMLCanvasElement that faz2-takeover.ts inserts into the destruction
 * overlay just under the chrome layers.
 *
 *   - Mac: skyTop → skyBottom linear gradient, 3-peak mountain silhouette
 *     (Path2D), bloom sun radial gradient. Palette = WALLPAPER_MAC_PALETTE.
 *   - Win: 135deg gradientStart → gradientEnd linear, radial accent bloom,
 *     faint four-square translucent watermark. Palette = WALLPAPER_WIN_PALETTE.
 *
 * Designer §4 — every geometric and palette decision is designer-fictional;
 * the renderer NEVER references a real Big Sur / Bloom asset.
 *
 * If `prefers-reduced-motion: reduce`:
 *   - No animation surface (static SVG render). Designer §8 row 11 — N/A.
 *
 * Called by:
 *   - faz2-takeover.ts at Faz 2 entry: const canvas = renderWallpaper(os);
 *     container.appendChild(canvas).
 */

import {
  WALLPAPER_MAC_PALETTE,
  WALLPAPER_WIN_PALETTE,
} from '../../../shared/scene-destruction-constants.js';
import type { OsVariant } from './types.js';

/* ------------------------------------------------------------------------ */
/* Public                                                                   */
/* ------------------------------------------------------------------------ */

/**
 * Render the procedural wallpaper for the given OS variant. Returns a
 * detached HTMLCanvasElement sized to the current viewport. Caller is
 * responsible for inserting it; resize is one-shot (no rAF re-render —
 * the destruction overlay is locked for ~15s, viewport resize during the
 * destruction is out-of-scope for Sprint 4).
 */
export function renderWallpaper(os: OsVariant): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.classList.add('destruction-wallpaper');
  const width = window.innerWidth || 1920;
  const height = window.innerHeight || 1080;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return canvas;
  }
  if (os === 'mac') {
    renderMacWallpaper(ctx, width, height);
  } else {
    renderWinWallpaper(ctx, width, height);
  }
  return canvas;
}

/* ------------------------------------------------------------------------ */
/* Mac variant                                                              */
/* ------------------------------------------------------------------------ */

function renderMacWallpaper(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  paintMacSkyGradient(ctx, width, height);
  paintMacSunBloom(ctx, width, height);
  paintMacMountains(ctx, width, height);
}

function paintMacSkyGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, WALLPAPER_MAC_PALETTE.skyTop);
  gradient.addColorStop(1, WALLPAPER_MAC_PALETTE.skyBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function paintMacSunBloom(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  const cx = width * 0.75;
  const cy = height * 0.25;
  const innerR = 0;
  const outerR = 220;
  const gradient = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
  gradient.addColorStop(0, hexWithAlpha(WALLPAPER_MAC_PALETTE.sun, 0.6));
  gradient.addColorStop(1, hexWithAlpha(WALLPAPER_MAC_PALETTE.sun, 0));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.fill();
}

function paintMacMountains(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  const baseY = height * 0.78;
  ctx.fillStyle = WALLPAPER_MAC_PALETTE.mountain;
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, baseY);
  ctx.lineTo(width * 0.15, height * 0.55);
  ctx.lineTo(width * 0.32, baseY - 20);
  ctx.lineTo(width * 0.45, height * 0.5);
  ctx.lineTo(width * 0.6, baseY - 10);
  ctx.lineTo(width * 0.75, height * 0.45);
  ctx.lineTo(width, baseY);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();
}

/* ------------------------------------------------------------------------ */
/* Win variant                                                              */
/* ------------------------------------------------------------------------ */

function renderWinWallpaper(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  paintWinBaseGradient(ctx, width, height);
  paintWinAccentBloom(ctx, width, height);
  paintWinFourSquareWatermark(ctx, width, height);
}

function paintWinBaseGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, WALLPAPER_WIN_PALETTE.gradientStart);
  gradient.addColorStop(1, WALLPAPER_WIN_PALETTE.gradientEnd);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function paintWinAccentBloom(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  const cx = width * 0.5;
  const cy = height * 0.65;
  const innerR = 0;
  const outerR = 320;
  const gradient = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
  gradient.addColorStop(0, hexWithAlpha(WALLPAPER_WIN_PALETTE.accentBloom, 0.5));
  gradient.addColorStop(1, hexWithAlpha(WALLPAPER_WIN_PALETTE.accentBloom, 0));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.fill();
}

function paintWinFourSquareWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = WALLPAPER_WIN_PALETTE.accentBloom;
  const size = 64;
  const cx = width * 0.5 - size / 2;
  const cy = height * 0.4 - size / 2;
  const cell = (size - 2) / 2; /* 1px gap between cells */
  ctx.fillRect(cx, cy, cell, cell);
  ctx.fillRect(cx + cell + 2, cy, cell, cell);
  ctx.fillRect(cx, cy + cell + 2, cell, cell);
  ctx.fillRect(cx + cell + 2, cy + cell + 2, cell, cell);
  ctx.restore();
}

/* ------------------------------------------------------------------------ */
/* Util                                                                     */
/* ------------------------------------------------------------------------ */

/** Append an alpha channel to a 6-digit #RRGGBB hex literal. */
function hexWithAlpha(hex: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
