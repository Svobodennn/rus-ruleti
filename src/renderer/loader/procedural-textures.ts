/**
 * Procedural texture generator — Sprint 3 Phase 1 scaffold.
 *
 * Three textures are rendered procedurally (no .glb / .png file):
 *   - `cyrillic-envelope` — a folded envelope with Cyrillic addressing.
 *   - `faded-portrait`    — a sepia-toned half-erased portrait.
 *   - `soviet-poster`     — a propaganda poster in muted reds + ochre.
 *
 * Pipeline (Phase 2B kraken-particles will implement):
 *   1. Inline SVG string is rendered to an Image via data: URL.
 *   2. Image is drawn to a 512×512 canvas via drawImage.
 *   3. Canvas is wrapped in a THREE.CanvasTexture, returned to caller.
 *
 * Each generation budget: PROC_TEXTURE_BUDGET_MS (200ms). Generation is
 * one-shot per session — the textures are cached after first request.
 *
 * Phase 2B implementation contract:
 *   - SVG strings live alongside this file (one .svg.ts module per key,
 *     or inline template strings — Phase 2B decides). They are *static
 *     artwork*; no runtime SVG manipulation.
 *   - Caller passes a key; the cache lookup returns the same Texture
 *     instance on every call (Three.js Texture identity matters for the
 *     render pipeline — different instances re-upload).
 *   - dispose drops the cached Texture and its underlying canvas.
 *
 * Temporal-correctness scenarios (Phase 3 qa-engineer verify list):
 *   - Scenario A: getProceduralTexture('cyrillic-envelope') twice must
 *     return the same Texture identity (===) — no re-render.
 *   - Scenario B: each generation completes within
 *     PROC_TEXTURE_BUDGET_MS measured by performance.now() bookends. If
 *     a generation exceeds the budget, log via document.body.dataset
 *     (NOT console — banned).
 *   - Scenario C: disposeProceduralTexture(key) followed by a subsequent
 *     getProceduralTexture(key) must re-render the texture (idempotent
 *     dispose + lazy re-acquire).
 */

import type { ProceduralTextureKey } from './types';

/**
 * Get the procedural texture for the given key. Caches per-key so the
 * second call returns the same Texture instance.
 *
 * Phase 1 stub. Phase 2B kraken-particles fills the body.
 */
export function getProceduralTexture(key: ProceduralTextureKey): unknown {
  throw new Error(
    `[loader] getProceduralTexture('${key}') stub — Phase 2B kraken-particles fills.`,
  );
}

/**
 * Drop the cached texture for a key. Subsequent get* re-renders.
 *
 * Phase 1 stub. Phase 2B kraken-particles fills the body.
 */
export function disposeProceduralTexture(_key: ProceduralTextureKey): void {
  // Phase 2B: read cache[key], call .dispose() on the THREE.Texture,
  //           delete cache[key]. Defensive: handle key missing silently.
}
