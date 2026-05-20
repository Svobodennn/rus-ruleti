/**
 * Scene palette, lighting, camera, and fog constants.
 *
 * Designer-owned block split from scene-constants.ts in Sprint 1 Phase 4
 * to keep each domain file within the 400-line ceiling.
 *
 * Touch policy:
 *   - designer (Phase 2+): may TUNE values but not delete/rename keys without
 *     scout coordination.
 *   - Do not inline literals in scene code — import from here.
 */

/* ------------------------------------------------------------------------ */
/* Palette (PLAN §2, line 44-51)                                            */
/* ------------------------------------------------------------------------ */

/**
 * The seven colours of the room. Keys are semantic, values are hex strings.
 *
 * Verified against PLAN.md §2 line 44-51 by designer in Sprint 1 Phase 2:
 *
 *   shadow      — kömür siyahı   #0a0908
 *   oak         — eski meşe       #1c1814
 *   rust        — paslı boru      #3d2817
 *   paper       — kirli kâğıt     #7a6a4e
 *   sodium      — sodyum ampul    #c89b3c  (the single hanging bulb)
 *   blood       — kan kırmızısı   #8b1a1a  (cartridge, BSOD)
 *   neon        — soğuk neon yeşil #4a5d3a  (radio dial, terminal)
 *
 * Typed with `as const` rather than `Record<string,string>` so that
 * `PALETTE.oak` is `'#1c1814'` (a known literal) rather than
 * `string | undefined` under noUncheckedIndexedAccess.
 */
export const PALETTE = Object.freeze({
  shadow: '#0a0908',
  oak: '#1c1814',
  rust: '#3d2817',
  paper: '#7a6a4e',
  sodium: '#c89b3c',
  blood: '#8b1a1a',
  neon: '#4a5d3a',
} as const);

/** Discriminated union of palette key names. */
export type PaletteKey = keyof typeof PALETTE;

/* ------------------------------------------------------------------------ */
/* Lighting (PLAN §2 "Işıklandırma")                                        */
/* ------------------------------------------------------------------------ */

/**
 * Hanging-bulb light tuning — designer-tuned in Sprint 1 Phase 2.
 *
 * Sway model: **Lissajous curve**, not pure circle. The bulb's x(t) and z(t)
 * trace out a slowly-evolving open curve because the two axes oscillate at
 * different (incommensurable) periods. Visually this looks like an organic
 * pendulum swinging in a slight cross-breeze — never repeating exactly,
 * never settling. A pure-circle sway reads as mechanical and breaks the
 * "this is a real, abandoned room" illusion.
 *
 *     x(t) = swayAmpX · sin(2π·t / swayPeriodSecX + swayPhaseX)
 *     z(t) = swayAmpZ · sin(2π·t / swayPeriodSecZ + swayPhaseZ)
 *
 * Intensity pulse: ~1% AC-ripple modulation at swayPulseHz. This is NOT
 * the real 50Hz mains frequency (too fast to perceive as flicker — would
 * just read as constant brightness). Instead we pick a perceptible rate
 * (10-20Hz) that *evokes* the AC ripple of a tungsten filament under a
 * weak transformer — the kind of cellar bulb that has visible roll.
 *
 *     intensity(t) = intensity · (1 + swayPulseAmp · sin(2π·t · swayPulseHz))
 *
 * Why these specific numbers:
 *   - intensity 3.4: PointLight with decay=2 in three.js needs to be in
 *     the 2-4 range for a "single bulb illuminates a small room" feel.
 *     Phase 1's value of 6 over-lit the chair and back wall, killing the
 *     chiaroscuro PLAN §2 demands. 3.4 keeps the revolver lit (table at
 *     y=0.75, bulb at y=2.4 → 1.65m distance, 1/d² gives strong falloff).
 *   - swayAmp 0.06: PLAN says "hafifçe sallanır" — half a centimetre would
 *     be invisible; 8 cm would be alarming. 6 cm reads as a draught.
 *   - swayPeriod 3.7s vs 4.9s: incommensurable so the curve never repeats.
 *     Both feel like a slow pendulum (Sprint 3 will add real mesh sway).
 *   - swayPulseHz 14: in the 10-20Hz "perceptible flicker" band.
 *   - swayPulseAmp 0.01: 1% intensity variation — present but subliminal.
 */
export const BULB_LIGHT = Object.freeze({
  /** World-space y-coordinate of the bulb above the table. */
  posY: 2.4,
  /** Sodium yellow PointLight color (sourced from PALETTE.sodium). */
  color: '#c89b3c',
  /** PointLight base intensity — designer-tuned for single-bulb chiaroscuro. */
  intensity: 3.4,
  /** Distance falloff radius (Three.js PointLight distance param). */
  distance: 10,
  /** Quadratic decay exponent. 2 is physically correct. */
  decay: 2,

  /** Lissajous x-axis amplitude in world units. */
  swayAmpX: 0.06,
  /** Lissajous z-axis amplitude in world units. */
  swayAmpZ: 0.05,
  /** x-axis sway period in seconds. */
  swayPeriodSecX: 3.7,
  /** z-axis sway period in seconds — deliberately different from X period. */
  swayPeriodSecZ: 4.9,
  /** x-axis phase offset (radians) so motion doesn't start at origin. */
  swayPhaseX: 0,
  /** z-axis phase offset (radians) — quarter-wave offset shapes the loop. */
  swayPhaseZ: Math.PI / 2,

  /** Intensity-pulse frequency (Hz). 10-20Hz reads as "AC ripple". */
  swayPulseHz: 14,
  /** Intensity-pulse amplitude — fraction of base intensity. 0.01 = ±1%. */
  swayPulseAmp: 0.01,
});

/**
 * Ambient floor light — designer-added in Sprint 1 Phase 2.
 *
 * A very dim ambient light prevents unlit faces from being pure black. PLAN §2
 * asks for chiaroscuro ("yüzler yarı gölgede") — not for void. The geometry
 * of the chair's back face, the radiator's underside, and the wall pockets
 * away from the bulb all benefit from a soft floor that hints at form
 * without competing with the bulb.
 *
 * Color: a near-black warm grey, biased toward the bulb's sodium tint so
 * the cool/warm contrast remains intact. Intensity is 0.05 — barely there.
 * If raised, unlit shadows lose their depth.
 */
export const AMBIENT_LIGHT = Object.freeze({
  /** Hex string for the ambient light tint. Near-shadow, very slight warmth. */
  color: '#080706',
  /** Ambient intensity. 0.05 lifts shadows just enough to read form. */
  intensity: 0.05,
});

/* ------------------------------------------------------------------------ */
/* Camera (sabit kamera, PLAN §2 "kamera sabit")                            */
/* ------------------------------------------------------------------------ */

/** PerspectiveCamera tuning. Designer (Phase 2) refines framing. */
export const CAMERA = Object.freeze({
  fovDeg: 50,
  near: 0.1,
  far: 50,
  /** Eye position — slight downward angle onto the table. */
  posX: 0,
  posY: 1.6,
  posZ: 3.2,
  /** Look-at target — center of the table. */
  lookAtX: 0,
  lookAtY: 0.75,
  lookAtZ: 0,
});

/* ------------------------------------------------------------------------ */
/* Fog (claustrophobic basement, PLAN §2 "klostrofobik minimalizm")         */
/* ------------------------------------------------------------------------ */

/**
 * Fog colour — single source for FogExp2 + renderer clear-colour.
 *
 * Equal to PALETTE.shadow so the room dissolves into the same pure-charcoal
 * void the corners shade into. Setting this elsewhere would create a
 * visible seam between the fog and the deepest shadows.
 */
export const FOG_COLOR = '#0a0908';

/**
 * Per-quality FogExp2 density. Higher density = thicker fog = the back
 * wall vanishes into the void sooner. PLAN §2 wants the cellar to
 * suffocate, but at low quality we want the GPU to breathe.
 *
 * Values are designer-tuned against the FogExp2 falloff curve:
 *
 *     visible_distance ≈ -ln(0.05) / density   (5% transmittance)
 *
 *   low    0.04  → 5% at ~75 units, 50% at ~17 units — light fog
 *   medium 0.06  → 5% at ~50 units, 50% at ~11 units — Sprint 1 default
 *   high   0.085 → 5% at ~35 units, 50% at ~8 units  — heavy
 *
 * The room is roughly 6×6×3 metres; on `medium` and `high` the back wall
 * (z=-3) reads dim and the corners go black. On `low` the room feels more
 * visible — that's an acceptable trade for the perf headroom.
 */
export const FOG_DENSITY_LOW = 0.04;

/** FogExp2 density for the medium quality tier — Sprint 1 default. */
export const FOG_DENSITY_MEDIUM = 0.06;

/** FogExp2 density for the high quality tier — heaviest claustrophobic fog. */
export const FOG_DENSITY_HIGH = 0.085;

/* ------------------------------------------------------------------------ */
/* Renderer                                                                 */
/* ------------------------------------------------------------------------ */

/**
 * Renderer-level constants. `antialias: false` is intentional — PS1 aesthetic
 * needs jagged edges. Pixel ratio is capped at 2 (any higher kills perf with
 * no visible benefit at the low-poly resolution we render at).
 */
export const RENDERER = Object.freeze({
  antialias: false,
  pixelRatioMax: 2,
});
