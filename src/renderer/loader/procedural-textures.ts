/**
 * Procedural texture generator — Sprint 3 Phase 2B frontend-dev fill.
 *
 * Three CanvasTextures are rendered procedurally (no .glb / .png file):
 *   - `cyrillic-envelope` — folded paper envelope with faded Cyrillic ink.
 *   - `faded-portrait`    — sepia silhouette (NO face details — designer §4.2).
 *   - `soviet-poster`     — own-design propaganda poster (NOT a reproduction).
 *
 * Pipeline:
 *   1. Per-key SVG string is wrapped in a Blob (image/svg+xml).
 *   2. Blob → object URL → Image element (decodes the SVG).
 *   3. Image drawn onto a 512×512 canvas via drawImage.
 *   4. Canvas wrapped in THREE.CanvasTexture, returned to caller.
 *
 * Performance budget: PROC_TEXTURE_BUDGET_MS = 200ms per generation,
 * measured via performance.now() bookends. Over-budget runs surface via
 * `document.body.dataset['procTextureBudget']` (console.* is lint-banned).
 *
 * Caching: getProceduralTexture() returns the SAME THREE.CanvasTexture
 * identity on subsequent calls — three.js requires identity stability for
 * the GPU to skip re-upload. disposeProceduralTexture(key) clears the cache
 * entry (lazy re-acquire on next get).
 *
 * Designer §4 spec authority: src/renderer/scene/model-freeze-direction.md
 * §4 (Cyrillic envelope, faded portrait, Soviet poster — visual intent and
 * content rules — designer-fictional only, no real persons / addresses /
 * historical reproductions).
 */

import { CanvasTexture, RepeatWrapping } from 'three';
import { PALETTE } from '../../shared/scene-palette';
import {
  PROC_TEXTURE_BUDGET_MS,
  PROC_TEXTURE_DIMENSIONS,
} from '../../shared/scene-model-constants';
import type { ProceduralTextureKey } from './types';

/** Per-key cache. Same Texture identity on subsequent gets → no GPU re-upload. */
const _cache = new Map<ProceduralTextureKey, CanvasTexture>();

/**
 * Cream-sodium envelope paper tone. Designer §4.1 calls for PALETTE.paper
 * (#7a6a4e) mixed ~80% paper / 20% warm white. Hand-mix lands at #9a8865 —
 * brighter than dirt-paper but still inside the warm cellar palette so it
 * doesn't read as a clean modern envelope.
 */
const ENVELOPE_PAPER_TINT = '#9a8865';

/** Faint crease ink — between PALETTE.oak and PALETTE.rust, ~40% alpha when drawn. */
const ENVELOPE_CREASE_INK = '#3a2c1a';

/** Postmark ring + worn ink — slightly bluer-black than PALETTE.shadow. */
const ENVELOPE_INK = '#1c1814';

/**
 * Sepia base for the faded portrait — designer §4.2 wants a "burned by
 * decades" feel. Slightly warmer than PALETTE.shadow so the radial gradient
 * to PALETTE.shadow in the corners reads as fade, not solid black.
 */
const PORTRAIT_SEPIA_CENTER = '#3d2817';

/**
 * Silhouette fill — near-black so the bust reads as a person-shaped void.
 * Held at 0.82 opacity inside the SVG so the fade overlay can soften it.
 */
const PORTRAIT_SILHOUETTE = '#0a0908';

/** Build the per-key SVG string. Each branch ≤ 50 lines. */
function buildSVGForKey(key: ProceduralTextureKey): string {
  if (key === 'cyrillic-envelope') return buildEnvelopeSVG();
  if (key === 'faded-portrait') return buildPortraitSVG();
  if (key === 'soviet-poster') return buildPosterSVG();
  // exhaustive narrowing — TS will error here if a new key is added.
  const _exhaustive: never = key;
  throw new Error(`[loader] unknown ProceduralTextureKey: ${String(_exhaustive)}`);
}

/**
 * Cyrillic envelope SVG. Designer-fictional text per §4.1:
 *   "от М. до Х. / пр. Ленина 14-23 / Москва"
 * Old Standard TT serif (Sprint 0 vendored, fonts.css). Cream paper, faint
 * vertical crease at 50% width, two grease stains via radial gradients, a
 * worn postmark ring bottom-right. Slight 2° text rotation reads as
 * handwritten ink. SVG noise via feTurbulence at 0.15 opacity for fibre.
 */
function buildEnvelopeSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="stainA" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${PALETTE.rust}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${PALETTE.rust}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="stainB" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${PALETTE.oak}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${PALETTE.oak}" stop-opacity="0"/>
    </radialGradient>
    <filter id="fibres" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/>
      <feColorMatrix values="0 0 0 0 0.12  0 0 0 0 0.10  0 0 0 0 0.07  0 0 0 0.15 0"/>
    </filter>
  </defs>
  <rect width="512" height="512" fill="${ENVELOPE_PAPER_TINT}"/>
  <rect width="512" height="512" filter="url(#fibres)"/>
  <line x1="256" y1="0" x2="256" y2="512" stroke="${ENVELOPE_CREASE_INK}" stroke-width="1.5" opacity="0.35"/>
  <line x1="0" y1="256" x2="512" y2="256" stroke="${ENVELOPE_CREASE_INK}" stroke-width="1" opacity="0.22"/>
  <circle cx="96" cy="148" r="58" fill="url(#stainA)"/>
  <circle cx="438" cy="372" r="44" fill="url(#stainB)"/>
  <g transform="rotate(-2 256 232)" font-family="'Old Standard TT', serif" fill="${ENVELOPE_INK}">
    <text x="84" y="196" font-size="32" font-weight="400">от М. до Х.</text>
    <text x="84" y="252" font-size="24" font-weight="400">пр. Ленина 14-23</text>
    <text x="84" y="298" font-size="24" font-weight="400">Москва</text>
  </g>
  <g opacity="0.45" stroke="${ENVELOPE_INK}" fill="none" stroke-width="2">
    <circle cx="408" cy="416" r="42"/>
    <circle cx="408" cy="416" r="32"/>
    <text x="376" y="422" font-family="'Old Standard TT', serif" font-size="14" fill="${ENVELOPE_INK}">МОСКВА</text>
  </g>
</svg>`;
}

/**
 * Faded portrait SVG. Designer §4.2: silhouette ONLY, NO face. Sepia
 * gradient background, generic bust (rounded head + trapezoidal shoulders +
 * triangular collar V), heavy radial fade overlay so the silhouette reads
 * as "burned by sunlight over decades". Thin PALETTE.shadow frame at 5%
 * inset to plant it on the wall plane.
 */
function buildPortraitSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="sepia" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="${PORTRAIT_SEPIA_CENTER}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${PALETTE.shadow}" stop-opacity="1"/>
    </radialGradient>
    <radialGradient id="fade" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="${PALETTE.shadow}" stop-opacity="0"/>
      <stop offset="70%" stop-color="${PALETTE.shadow}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${PALETTE.shadow}" stop-opacity="0.75"/>
    </radialGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="11"/>
      <feColorMatrix values="0 0 0 0 0.05  0 0 0 0 0.04  0 0 0 0 0.03  0 0 0 0.4 0"/>
    </filter>
  </defs>
  <rect width="512" height="512" fill="url(#sepia)"/>
  <rect x="25" y="25" width="462" height="462" fill="none" stroke="${PALETTE.shadow}" stroke-width="6"/>
  <rect x="32" y="32" width="448" height="448" fill="none" stroke="${PALETTE.oak}" stroke-width="2" opacity="0.6"/>
  <ellipse cx="256" cy="208" rx="72" ry="92" fill="${PORTRAIT_SILHOUETTE}" opacity="0.85"/>
  <polygon points="172,288 340,288 388,488 124,488" fill="${PORTRAIT_SILHOUETTE}" opacity="0.85"/>
  <polygon points="228,296 284,296 256,352" fill="${PALETTE.oak}" opacity="0.95"/>
  <polygon points="172,294 200,288 192,330" fill="${PALETTE.oak}" opacity="0.85"/>
  <polygon points="340,294 312,288 320,330" fill="${PALETTE.oak}" opacity="0.85"/>
  <rect width="512" height="512" fill="url(#fade)"/>
  <rect width="512" height="512" filter="url(#grain)"/>
</svg>`;
}

/**
 * Soviet poster SVG. Designer §4.3: OWN design (NOT historical reproduction).
 * Colour rule: PALETTE.blood + .rust + .paper + .shadow only.
 * Tilted blood-red banner (~-8°), 5-pointed star (NOT hammer-and-sickle),
 * glyphic Cyrillic ("К Р О Н И" / "Е А" — letters arranged so they LOOK
 * like a word but spell nothing). Vertical crease lines + corner darkening
 * via radial gradients to plant it on the same wall plane as the portrait.
 */
function buildPosterSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="cornerWear" cx="50%" cy="50%" r="75%">
      <stop offset="60%" stop-color="${PALETTE.shadow}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${PALETTE.shadow}" stop-opacity="0.55"/>
    </radialGradient>
    <linearGradient id="yellowing" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${PALETTE.paper}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${PALETTE.paper}" stop-opacity="0.05"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="${PALETTE.paper}"/>
  <g transform="rotate(-8 256 200)">
    <rect x="64" y="116" width="384" height="172" fill="${PALETTE.blood}"/>
    <rect x="64" y="116" width="384" height="172" fill="none" stroke="${PALETTE.rust}" stroke-width="3"/>
  </g>
  <polygon points="256,38 270,82 316,82 280,108 294,152 256,124 218,152 232,108 196,82 242,82" fill="${PALETTE.rust}"/>
  <g font-family="'Old Standard TT', serif" fill="${PALETTE.paper}">
    <text x="108" y="222" font-size="68" font-weight="700" letter-spacing="6">К Р О Н И</text>
    <text x="196" y="276" font-size="40" font-weight="700" letter-spacing="8">Е А</text>
  </g>
  <line x1="170" y1="44" x2="170" y2="488" stroke="${PALETTE.shadow}" stroke-width="1.5" opacity="0.18"/>
  <line x1="342" y1="44" x2="342" y2="488" stroke="${PALETTE.shadow}" stroke-width="1.5" opacity="0.18"/>
  <rect x="0" y="376" width="512" height="18" fill="${PALETTE.rust}"/>
  <rect x="0" y="418" width="512" height="6" fill="${PALETTE.rust}"/>
  <rect x="0" y="446" width="512" height="3" fill="${PALETTE.rust}" opacity="0.7"/>
  <rect width="512" height="512" fill="url(#yellowing)"/>
  <rect width="512" height="512" fill="url(#cornerWear)"/>
</svg>`;
}

/** Resolve an HTMLImageElement from a Blob URL. Rejects on decode failure. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`[loader] SVG image decode failed: ${src}`));
    img.src = src;
  });
}

/**
 * Surface over-budget telemetry via document.body.dataset (lint bans console.*).
 * Field name is camelCase per HTMLDataElement.dataset convention.
 */
function recordBudgetTelemetry(key: ProceduralTextureKey, elapsedMs: number): void {
  const overBudget = elapsedMs > PROC_TEXTURE_BUDGET_MS;
  const prefix = overBudget ? 'OVER' : 'ok';
  const entry = `${prefix}:${key}=${elapsedMs.toFixed(1)}ms/${PROC_TEXTURE_BUDGET_MS}ms`;
  if (typeof document !== 'undefined' && document.body) {
    const prev = document.body.dataset['procTextureBudget'] ?? '';
    document.body.dataset['procTextureBudget'] = prev ? `${prev};${entry}` : entry;
  }
}

/**
 * Generate a CanvasTexture for the given key. Performance-bookended; over-
 * budget runs surface via document.body.dataset['procTextureBudget']. Uses
 * URL.createObjectURL + revokeObjectURL in finally so the blob is freed even
 * if Image.onerror fires.
 */
async function generateTexture(key: ProceduralTextureKey): Promise<CanvasTexture> {
  const t0 = performance.now();
  const svg = buildSVGForKey(key);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = PROC_TEXTURE_DIMENSIONS.width;
    canvas.height = PROC_TEXTURE_DIMENSIONS.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('[loader] 2D canvas context unavailable');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const texture = new CanvasTexture(canvas);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.needsUpdate = true;
    recordBudgetTelemetry(key, performance.now() - t0);
    return texture;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Get the procedural texture for the given key. Caches per-key so the
 * second call returns the same Texture instance (three.js GPU identity).
 */
export async function getProceduralTexture(
  key: ProceduralTextureKey,
): Promise<CanvasTexture> {
  const cached = _cache.get(key);
  if (cached) return cached;
  const texture = await generateTexture(key);
  _cache.set(key, texture);
  return texture;
}

/** Drop the cached texture for a key. Idempotent; safe on missing keys. */
export function disposeProceduralTexture(key: ProceduralTextureKey): void {
  const cached = _cache.get(key);
  if (cached) {
    cached.dispose();
    _cache.delete(key);
  }
}

/** Dispose every cached texture and clear the cache. SceneHandle teardown hook. */
export function disposeAllProceduralTextures(): void {
  for (const tex of _cache.values()) tex.dispose();
  _cache.clear();
}
