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
 * shadow      — kömür siyahı   #0a0908
 * oak         — eski meşe       #1c1814
 * rust        — paslı boru      #3d2817
 * paper       — kirli kâğıt     #7a6a4e
 * sodium      — sodyum ampul    #c89b3c  (the single hanging bulb)
 * blood       — kan kırmızısı   #8b1a1a  (cartridge, BSOD)
 * neon        — soğuk neon yeşil #4a5d3a  (radio dial, terminal)
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
 * Hanging-bulb light tuning. Designer (Phase 2) refines these against the
 * BUCKSHOT_ROULETTE_THEME.md mood reference. All Phase 2 lighting tuning
 * lands here, NOT in lighting.ts.
 */
export const BULB_LIGHT = Object.freeze({
  /** World-space y-coordinate of the bulb above the table. */
  posY: 2.4,
  /** Sodium yellow PointLight color (sourced from PALETTE.sodium). */
  color: '#c89b3c',
  /** PointLight intensity — strong enough for harsh chiaroscuro contrast. */
  intensity: 6,
  /** Distance falloff radius (Three.js PointLight distance param). */
  distance: 10,
  /** Quadratic decay exponent. 2 is physically correct. */
  decay: 2,
  /** Sway amplitude (world units) on x and z. */
  swayAmplitude: 0.05,
  /** Sway frequency (rad/sec) for sin oscillation. */
  swayFrequency: 0.7,
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

/** Linear fog from `near` to `far` worldspace units. Shadow-coloured. */
export const FOG = Object.freeze({
  color: '#0a0908',
  near: 2.5,
  far: 8,
});

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
/* Internal: re-export so consumers who only need scene-constants get types */
/* ------------------------------------------------------------------------ */

/** Re-export keeps scene consumers from importing two files just for OsFamily. */
export type SceneOsFamily = _OsFamily;
