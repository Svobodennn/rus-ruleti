/**
 * Scene + atmosphere SSOT — base constants + re-export barrel.
 *
 * Single source of truth for every numeric / color literal used by the
 * renderer's scene module. Phase 2 (designer, kraken-shader, kraken-audio)
 * READS from here. They MAY add new exports but MUST NOT inline literals in
 * scene code (Sprint 0 retro lesson: every magic number gets a name).
 *
 * Split in Sprint 1 Phase 4 + Sprint 3 Phase 1:
 *   - scene-palette.ts          — PALETTE, BULB_LIGHT, AMBIENT_LIGHT, CAMERA, FOG_*,  RENDERER
 *   - scene-audio-constants.ts  — AUDIO_VOLUME_*, AUDIO_FADE_*, synth tuning
 *   - scene-shader-constants.ts — PS1_*, DITHER_*, SCANLINE_*, GRAIN_*, CHROMATIC_*, COMPOSER_*
 *   - scene-revolver-constants.ts — FSM timing, hold-state ramps, animation curves
 *   - scene-model-constants.ts  — Sprint 3: MODEL_SCALE_*, MODEL_POSITION_*,
 *                                  MODEL_ROTATION_*, SMOKE_*, MODEL_LOAD_BUDGET_MS,
 *                                  PROC_TEXTURE_BUDGET_MS, PROC_TEXTURE_DIMENSIONS
 *   - scene-destruction-constants.ts — Sprint 4: FAZ_*_DURATION_MS, TINNITUS_*,
 *                                  LOW_PASS_CUTOFF_HZ, BANG_CAMERA_SHAKE_*,
 *                                  APARTMENT_BLEED_*, DIALOG_*_DIMENSIONS,
 *                                  TOAST_*, TYPEWRITER_*_CHARS_PER_SEC,
 *                                  WALLPAPER_*_PALETTE, MENUBAR/TASKBAR_*_PX,
 *                                  FAKE_FILE_PATHS_*, TOAST_MESSAGES_*,
 *                                  PREFERS_REDUCED_MOTION_QUERY, USERNAME_PLACEHOLDER
 *
 * This file keeps the Phase 1 base (QualityLevel, frame budgets, AMBIENT_LAYERS,
 * AMBIENT_BULB_HUM_HZ) and re-exports everything else so existing consumers
 * don't break.
 *
 * Touch policy:
 *   - kraken (Phase 1, owner): may extend with new constants.
 *   - designer (Phase 2): edits scene-palette.ts.
 *   - kraken-shader (Phase 2): edits scene-shader-constants.ts.
 *   - kraken-audio (Phase 2): edits scene-audio-constants.ts.
 *   - designer (Sprint 3 Phase 2A): fills MODEL_SCALE/POSITION/ROTATION
 *     in scene-model-constants.ts; kraken-particles + kraken-loader own
 *     the remaining Sprint 3 knobs there.
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
/* Internal: re-export so consumers who only need scene-constants get types */
/* ------------------------------------------------------------------------ */

/** Re-export keeps scene consumers from importing two files just for OsFamily. */
export type SceneOsFamily = _OsFamily;

/* ------------------------------------------------------------------------ */
/* Re-export barrels — existing consumers import from scene-constants       */
/* ------------------------------------------------------------------------ */

export * from './scene-palette';
export * from './scene-audio-constants';
export * from './scene-shader-constants';
export * from './scene-revolver-constants';
export * from './scene-model-constants';
export * from './scene-destruction-constants';
