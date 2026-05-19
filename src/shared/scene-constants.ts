/**
 * Scene + atmosphere SSOT.
 *
 * Single source of truth for every numeric / color literal used by the
 * renderer's scene module. Phase 2 (designer, kraken-shader, kraken-audio)
 * READS from here. They MAY add new exports but MUST NOT inline literals in
 * scene code (Sprint 0 retro lesson: every magic number gets a name).
 *
 * Touch policy:
 *   - kraken (Phase 1, owner): may extend with new constants.
 *   - designer (Phase 2): may TUNE values (palette, lighting strength) but
 *     not delete/rename keys without scout coordination.
 *   - kraken-shader (Phase 2): may extend with shader-specific tuning.
 *   - kraken-audio (Phase 2): owns audio-channels.ts; uses palette only.
 */

import type { OsFamily as _OsFamily } from './ipc-channels';

/* ------------------------------------------------------------------------ */
/* Quality                                                                  */
/* ------------------------------------------------------------------------ */

/**
 * Adaptive shader quality tier (S1 risk mitigation, PLAN §3).
 *
 *   low    — scanline + grain only. PS1 shader disabled. Target old Intel
 *            integrated GPUs.
 *   medium — + chromatic aberration. Default for unknown hardware.
 *   high   — + vertex snap + affine UV + dithering. Full PS1 stack.
 */
export type QualityLevel = 'low' | 'medium' | 'high';

/** All quality tiers, ordered low → high. Used by promote/demote logic. */
export const QUALITY_LEVELS: ReadonlyArray<QualityLevel> = [
  'low',
  'medium',
  'high',
];

/** Default if VITE_QUALITY_LEVEL env var is unset or invalid at build time. */
export const DEFAULT_QUALITY_LEVEL: QualityLevel = 'medium';

/* ------------------------------------------------------------------------ */
/* Frame timing                                                             */
/* ------------------------------------------------------------------------ */

/** Target frame budget (ms) for 60fps. 16.6ms per frame. */
export const FRAME_BUDGET_MS = 16.6;

/** Relaxed frame budget for low-quality tier — 50fps acceptable. */
export const FRAME_BUDGET_MS_LOW = 20;

/**
 * How many consecutive frames the auto-promote/demote logic samples before
 * making a decision. ~2 seconds at 60fps.
 */
export const AUTO_PROMOTE_SAMPLE_SIZE = 120;

/** Promote one tier if rolling 95th percentile is below this many ms. */
export const AUTO_PROMOTE_THRESHOLD_MS = 12;

/** Demote one tier if rolling 95th percentile exceeds this many ms. */
export const AUTO_DEMOTE_THRESHOLD_MS = 18;

/** Ring buffer size for the frame logger. 10 seconds @ 60fps. */
export const FRAME_LOG_RING_SIZE = 600;

/** How often (ms) the frame logger flushes a summary to main via IPC. */
export const FRAME_LOG_FLUSH_INTERVAL_MS = 5000;

/* ------------------------------------------------------------------------ */
/* Ambient audio layers                                                     */
/* ------------------------------------------------------------------------ */

/**
 * Drone-bed layer identifiers, PLAN §2 "Ses dünyası".
 *
 *   bulb-hum     — 50Hz Soviet electric-grid mains hum.
 *   wind         — distant blizzard outside the window.
 *   radio-static — AM static + vinyl crackle from the VEF/Rekord.
 *   water-drip   — radiator drip into concrete floor.
 *
 * Sprint 1: synthesised placeholders (see audio/ambient-synth.ts).
 * Sprint 3: real .ogg samples replace synth on a per-layer basis.
 */
export const AMBIENT_LAYERS = [
  'bulb-hum',
  'wind',
  'radio-static',
  'water-drip',
] as const;

/** Mains hum fundamental — Soviet/EU grid (US would be 60Hz). */
export const AMBIENT_BULB_HUM_HZ = 50;

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
 * Phase 1 FOG tuple — used by scene.ts for the FogExp2 density derivation.
 * Retained for back-compat with Phase 1 wiring. kraken-shader (Phase 2)
 * should switch scene.ts to read FOG_DENSITY_{LOW|MEDIUM|HIGH} below and
 * pick the value matching the active QualityLevel — that delivers PLAN §2's
 * "klostrofobik minimalizm" while honouring the perf budget on low-end GPUs
 * (less fog = less per-fragment cost in the depth-distance computation).
 */
export const FOG = Object.freeze({
  color: '#0a0908',
  near: 2.5,
  far: 8,
});

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
export const FOG_DENSITY_MEDIUM = 0.06;
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

/* ------------------------------------------------------------------------ */
/* Audio bed volumes (kraken-audio Phase 2)                                 */
/* ------------------------------------------------------------------------ */

/**
 * Drone-bed layer default gain values (linear amplitude, 0..1).
 *
 * Coordinate note: `audio-channels.ts` already exports an
 * `AMBIENT_DEFAULT_VOLUME` record keyed by AmbientLayerId — that one is the
 * runtime contract the AudioBed reads from. The constants below mirror those
 * defaults as plain numeric exports so the scene-constants SSOT lists them
 * alongside the bulb hum frequency, fog densities, and other scene tuning.
 *
 * Sprint 1 mix philosophy (PLAN §2 "Sessizlik silahtır"):
 *   - The drone bed must sit BELOW -18dBFS (~0.13 linear) at all times.
 *   - Water-drip and music are silent (0) — they wake up in Sprint 3+.
 *   - 5-10 second silences need to feel naked; if the bed competes with
 *     silence the tension breaks.
 *
 * Why these specific values:
 *   - bulb-hum 0.15: dominant ambient layer (the room's electric breath).
 *     Below 0.10 the 50Hz fundamental disappears under cheap laptop speakers.
 *   - wind 0.08: subordinate howl. Should feel like it's behind the wall,
 *     not in the room.
 *   - radio-static 0.04: barely perceptible vacuum-tube crackle — the
 *     radio in the corner is mostly silent, hinting at presence.
 *   - water-drip 0: Sprint 3 enables it.
 *   - music 0: Sprint 3 loads Temnaya placeholder; until then silent.
 */
export const AUDIO_VOLUME_BULB_HUM = 0.15;

/** Distant blizzard howl. Subordinate to bulb hum. */
export const AUDIO_VOLUME_WIND = 0.08;

/** Vacuum-tube AM static crackle. Barely audible. */
export const AUDIO_VOLUME_RADIO_STATIC = 0.04;

/** Radiator drip into concrete. Sprint 3 enables. */
export const AUDIO_VOLUME_WATER_DRIP = 0;

/** Temnaya-tarzı music slot volume. Sprint 3 enables. */
export const AUDIO_VOLUME_MUSIC = 0;

/**
 * Default fade-in duration (ms) when entering the scene after Continue click.
 *
 * 4 seconds is long enough that the user perceives the room "coming alive"
 * rather than abruptly switching on — supports PLAN §2's slow-burn intro.
 */
export const AUDIO_FADE_IN_MS = 4000;

/**
 * Default fade-out duration (ms) on dispose / scene teardown.
 *
 * Faster than fade-in so HMR reloads and shutdown don't drag.
 */
export const AUDIO_FADE_OUT_MS = 1500;

/* ========================================================================
 * PS1 SHADER + POST-FX TUNING (kraken-shader Phase 2)
 * --------------------------------------------------------------------------
 * Numeric tuning surface for the PS1 vertex-snap material, the bayer-matrix
 * dither pass, and the pmndrs post-fx chain (scanline / grain / chromatic
 * aberration). Lives disjoint from designer's palette/lighting/fog blocks
 * and audio-kraken's volume block so scene-constants stays the SSOT without
 * overlap.
 *
 * Authoring rules:
 *   - JSDoc each export. The values are not self-documenting at a glance.
 *   - Frequencies in Hz, periods in seconds, opacities/intensities in 0..1.
 *   - Pixel-grid sizes in unitless "horizontal screen subdivisions" — see
 *     PS1_SNAP_RESOLUTION below for the exact projection-space math.
 * ======================================================================== */

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

/* ------------------------------------------------------------------------ */
/* Internal: re-export so consumers who only need scene-constants get types */
/* ------------------------------------------------------------------------ */

/** Re-export keeps scene consumers from importing two files just for OsFamily. */
export type SceneOsFamily = _OsFamily;
