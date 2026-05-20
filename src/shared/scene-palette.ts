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
 * Hanging-bulb light tuning — designer-tuned in Sprint 1 Phase 2,
 * runtime-calibrated in Sprint 3 (see "Runtime calibration note" below).
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
 * Runtime calibration note (Sprint 3, post-Phase 4):
 *   - intensity 3.4 was tuned against Three.js `useLegacyLights=true`
 *     semantics (pre-r163). Under three@0.184's physical-light-units
 *     default, PointLight with decay=2 and intensity=1 ≈ 4 candela. A
 *     typical 60W incandescent bulb is ~64 candela ≈ intensity 16. With
 *     1/r² falloff over the 1.6m bulb-to-table distance, that becomes
 *     ~6.25 effective candela — perceived as "dim but visible". User
 *     feedback at intensity=12 was "still dark", so we step to 40 which,
 *     after the ACES tone-mapping curve and sRGB output now wired in
 *     scene.ts:createRenderer(), reads as a warm cellar bulb without
 *     blowing into "office overhead".
 *   - Material color overrides (scene-model-constants.ts) lifted ~50%
 *     in lockstep — see that file's "Sprint 3 runtime calibration"
 *     JSDoc for the per-key rationale. The two changes compose: brighter
 *     light AND brighter reflectance, preserving relative palette ordering.
 *
 * Why these specific numbers:
 *   - intensity 40 (post-calibration): "60W bulb in a small room" under
 *     physical units. See model-freeze §3.2 "porcelain duy lit from the
 *     cone, not from baked emissive" — we need the cone to actually carry.
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
  /**
   * PointLight base intensity. Sprint 3 calibration: 3.4 → 40 to match
   * Three r163+ physical-light-units default (1.0 ≈ 4 candela, so 40 ≈
   * ~160 candela ≈ slightly under a 100W bulb, then falloff by 1/r²
   * brings the table to a habitable luminance).
   */
  intensity: 40,
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
 * Ambient floor light — designer-added in Sprint 1 Phase 2,
 * lifted in Sprint 3 runtime calibration.
 *
 * A very dim ambient light prevents unlit faces from being pure black. PLAN §2
 * asks for chiaroscuro ("yüzler yarı gölgede") — not for void. The geometry
 * of the chair's back face, the radiator's underside, and the wall pockets
 * away from the bulb all benefit from a soft floor that hints at form
 * without competing with the bulb.
 *
 * Color: a near-black warm grey, biased toward the bulb's sodium tint so
 * the cool/warm contrast remains intact.
 *
 * Sprint 3 runtime calibration: intensity 0.05 → 0.35. The pre-calibration
 * value paired with the 3.4 bulb intensity left back-of-chair and wall
 * pockets *physically black*. Under the new ACES tone curve a 0.35 floor
 * reads as "deep shadow, form barely legible" rather than "void". The
 * chiaroscuro is preserved because the bulb (intensity 40) still dominates
 * by ~100×; the ambient only catches the geometry the cone misses.
 */
export const AMBIENT_LIGHT = Object.freeze({
  /** Hex string for the ambient light tint. Near-shadow, very slight warmth. */
  color: '#080706',
  /**
   * Ambient intensity. Sprint 3 calibration: 0.05 → 0.35. The bulb dominates
   * at intensity 40 so ambient stays well below it — we lift unlit faces
   * out of pure black without challenging the single-source aesthetic.
   */
  intensity: 0.35,
});

/**
 * HemisphereLight — sky/ground tinted fill, added in Sprint 3 calibration.
 *
 * A HemisphereLight casts no shadows; it just adds an axis-aligned gradient
 * fill where the up-facing surfaces pick up `skyColor` and down-facing pick
 * up `groundColor`. This is the cheapest possible "indirect bounce" hint —
 * gives unlit ceiling vs unlit floor a perceptible difference without
 * breaking the single-bulb chiaroscuro.
 *
 * Color choice:
 *   - skyColor cool blue-grey (#88ccff fade-toward-dark): suggests the
 *     thin cellar window's daylight leak landing on the upper walls.
 *   - groundColor warm dark amber (#442200): suggests the floor's reflected
 *     warmth from the sodium bulb cone bouncing off concrete.
 *
 * Intensity 0.18 sits beneath the AmbientLight (0.35) but is directional,
 * so it reads on geometry. Combined with the lifted AmbientLight, the
 * bottle/chair/wall planes get a subtle tonal separation: upper edges
 * cool, lower edges warm. The bulb cone still hammers the central
 * composition.
 */
export const HEMISPHERE_LIGHT = Object.freeze({
  /** Top half of the gradient — cool window-leak hint. */
  skyColor: '#88ccff',
  /** Bottom half of the gradient — warm concrete-bounce hint. */
  groundColor: '#442200',
  /** Intensity well below ambient; provides directional separation only. */
  intensity: 0.18,
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
 *   low    0.028 → 5% at ~107 units, 50% at ~25 units — light fog
 *   medium 0.042 → 5% at ~71 units, 50% at ~16 units  — Sprint 3 default
 *   high   0.060 → 5% at ~50 units, 50% at ~12 units  — heavy
 *
 * Sprint 3 runtime calibration: reduced each tier ~30% to lift cumulative
 * scene brightness without breaking the claustrophobic look. The original
 * 0.06 medium-tier value compounded with the dark materials and weak
 * bulb produced a near-pure-shadow back half of the room ("only the
 * silhouette of the bottle reads"). At 0.042 the back wall now catches a
 * recognisable amount of bulb cone — the cellar still feels enclosed but
 * the spatial relationships read.
 *
 * The room is roughly 6×6×3 metres; on `medium` and `high` the back wall
 * (z=-3) reads dim and the corners go black. On `low` the room feels more
 * visible — that's an acceptable trade for the perf headroom.
 */
export const FOG_DENSITY_LOW = 0.028;

/** FogExp2 density for the medium quality tier — Sprint 3 calibrated default. */
export const FOG_DENSITY_MEDIUM = 0.042;

/** FogExp2 density for the high quality tier — heaviest claustrophobic fog. */
export const FOG_DENSITY_HIGH = 0.060;

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

/**
 * Tone-mapping exposure multiplier — Sprint 3 runtime calibration.
 *
 * Applied to `WebGLRenderer.toneMappingExposure`. 1.0 is the unmodified
 * physical lighting; values >1.0 brighten the image before the ACES filmic
 * curve is applied. 1.4 lifts the cellar by ~40% perceived, compensating
 * for the heavy fog + small light source without making it look like
 * daytime — ACES naturally compresses the highlights, so the bulb itself
 * doesn't blow out at this exposure level.
 *
 * If raised to 1.6+ the bulb starts to bloom against the post-fx chromatic
 * pass and reads as "neon" rather than "tungsten". 1.4 is the sweet spot
 * for the "visible but oppressive" cellar aesthetic PLAN §2 calls for.
 */
export const RENDERER_TONE_MAPPING_EXPOSURE = 1.4;
