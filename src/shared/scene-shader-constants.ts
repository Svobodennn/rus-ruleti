/**
 * PS1 shader + post-FX tuning constants.
 *
 * kraken-shader-owned block split from scene-constants.ts in Sprint 1 Phase 4
 * to keep each domain file within the 400-line ceiling.
 *
 * Touch policy:
 *   - kraken-shader (Phase 2+): owns this file.
 *   - Do not inline shader literals in scene code — import from here.
 *
 * Authoring rules:
 *   - JSDoc each export. The values are not self-documenting at a glance.
 *   - Frequencies in Hz, periods in seconds, opacities/intensities in 0..1.
 *   - Pixel-grid sizes in unitless "horizontal screen subdivisions" — see
 *     PS1_SNAP_RESOLUTION below for the exact projection-space math.
 */

/**
 * Vertex-snap grid horizontal resolution.
 *
 * After projection-to-clip-space, vertex.xy is snapped to `floor(xy*res)/res`
 * with `res = PS1_SNAP_RESOLUTION`. 320 is the PSX horizontal framebuffer
 * resolution and the canonical reference for "the wobbly vertex look" —
 * large triangles snap by integer pixel increments across the frame,
 * producing the jitter PS1 fans recognise. Halving to 160 would be more
 * aggressive; doubling to 640 would barely be visible at 1080p.
 *
 * Quality gate: only the `high` tier wires the snap into the vertex shader.
 * `low`/`medium` use a plain MeshStandardMaterial and skip the math entirely.
 */
export const PS1_SNAP_RESOLUTION = 320;

/**
 * Dither blend strength.
 *
 * 0 = pass-through (no dither), 1 = full bayer-matrix posterisation. The
 * shader subtracts the dither threshold from each fragment's RGB before a
 * step-quantise to a discrete level grid. At 0.8 the texture brutalism
 * reads loud-but-believable on the placeholder cubes; reduce when GLB
 * textures land in Sprint 3 (they'll bring their own grain budget).
 *
 * Quality gate: only the `high` tier enables the dither pass.
 */
export const DITHER_INTENSITY = 0.8;

/**
 * Number of effective colour levels per channel after dither quantisation.
 *
 * The dither shader uses `floor(rgb * DITHER_LEVELS) / DITHER_LEVELS` to
 * snap each channel to a discrete level (combined with the bayer threshold).
 * 32 ≈ 5 bits, which is roughly the PS1 colour-depth ceiling once dither
 * is applied. Drop to 16 for harsher banding; raise to 64 for subtler.
 */
export const DITHER_LEVELS = 32;

/**
 * Scanline density — passed to pmndrs ScanlineEffect.
 *
 * The pmndrs default is 1.25. We bump to 1.5 because the placeholder cubes
 * have no surface detail; a denser scanline pattern carries more of the
 * "broken CRT signal" load. Sprint 3 GLB textures will compete for visual
 * bandwidth and we may need to drop back to ~1.0.
 *
 * Density unit is "lines per pixel of screen height" in the pmndrs shader.
 */
export const SCANLINE_DENSITY = 1.5;

/**
 * Scanline opacity (blend mode OVERLAY).
 *
 * 0 = invisible, 1 = full overlay. 0.35 keeps the scanline pattern visible
 * across all three quality tiers without overwhelming the room. Coordinates
 * with the DOM `--crt-scanline-alpha` CSS overlay frontend-dev ships in
 * batch B — the WebGL pass produces a *softer* scanline than the CSS
 * overlay so the two layers don't moiré.
 */
export const SCANLINE_OPACITY = 0.35;

/**
 * Film-grain opacity (blend mode MULTIPLY).
 *
 * pmndrs NoiseEffect blends a perlin-style noise texture into the scene.
 * 0.15 reads as "old film stock"; 0.3 would be "VHS rip". Lower than 0.1
 * and the grain disappears under the scanlines.
 */
export const GRAIN_OPACITY = 0.15;

/**
 * Chromatic aberration offset (x,y components passed as Vector2 to pmndrs).
 *
 * Red and blue channels are shifted in opposite directions by `offset`
 * units in UV space. 0.0015 sits in the "barely-perceptible-but-felt" band
 * the PS1 lobby aesthetic asks for. 0.005+ reads as "VR sickness". 0.0008
 * is the threshold below which most viewers don't register the effect.
 *
 * Quality gate: enabled on `medium` and `high`.
 */
export const CHROMATIC_OFFSET = 0.0015;

/**
 * Vertex-snap material emissive boost.
 *
 * Custom ShaderMaterial replaces MeshStandardMaterial on the `high` tier.
 * Standard PBR roughness/metalness aren't available there — we fake
 * illumination with a Lambert term plus a small constant emissive. 0.08
 * gives unlit faces a faint glow so they stay readable through the dither
 * + scanline passes without making the bulb's chiaroscuro flat.
 */
export const PS1_MATERIAL_EMISSIVE_FACTOR = 0.08;

/**
 * Effect-composer multisampling.
 *
 * 0 = MSAA disabled. We want jagged edges (PS1 aesthetic) — MSAA would
 * smooth them. Documented so future contributors don't silently enable it.
 */
export const COMPOSER_MULTISAMPLING = 0;
