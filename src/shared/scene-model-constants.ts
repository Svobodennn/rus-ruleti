/**
 * 3D model SSOT — Sprint 3 Phase 1 scaffold.
 *
 * Pre-populates the **NAMES** of every per-model placement constant
 * (scale, position, rotation) and the smoke particle / model load budget
 * knobs. Phase 2A designer FILLS the values; Phase 2B kraken-loader /
 * kraken-particles consumes them.
 *
 * Structural rule (Sprint 3, per Sprint 2 retro): no "named OR justified
 * inline" loophole. Every value Phase 2B will reference is named here as a
 * pre-populated placeholder. Inline magic numbers in scene code are
 * forbidden.
 *
 * Ownership map (Phase 2A designer, Phase 2B kraken-*):
 *   - designer (Phase 2A): MODEL_SCALE_*, MODEL_POSITION_*, MODEL_ROTATION_*
 *   - kraken-particles (Phase 2B): SMOKE_*
 *   - kraken-loader (Phase 2B): MODEL_LOAD_BUDGET_MS, PROC_TEXTURE_BUDGET_MS,
 *                                PROC_TEXTURE_DIMENSIONS (consumes)
 *   - kraken-revolver (Phase 2B): MODEL_REVOLVER_*_PIVOT_KEY (consumes)
 *
 * Re-exported from `scene-constants.ts` barrel (Sprint 3 Phase 1 adds the
 * `export * from './scene-model-constants';` line as the 6th sibling).
 *
 * Unit suffix discipline (carries forward from scene-revolver-constants.ts):
 *   `_MS` (milliseconds), `_HZ` (hertz), `_DB` (decibels). Position /
 *   rotation tuples are documented in JSDoc as world-units / radians
 *   respectively — no inline unit suffix on the tuple constants because
 *   the variable name carries it (`MODEL_POSITION_*` is always world-units;
 *   `MODEL_ROTATION_*` is always XYZ Euler radians).
 */

/* ------------------------------------------------------------------------ */
/* Model scale — designer Phase 2A fills                                    */
/* ------------------------------------------------------------------------ */

/**
 * Uniform scale factor applied to the loaded GLB Group.
 *
 * Phase 2A designer fills these after eyeballing each vendored asset in
 * the scene next to the placeholder cubes. Most Poly Pizza models ship
 * at ~1m unit scale, so `1.0` is a reasonable Phase 1 placeholder.
 *
 * The Sprint 2 placeholder-room places objects in a ~6×6m floor with the
 * camera at y=1.6 (CAMERA.posY). Designer tunes each scale so the object
 * reads at the intended visual size from the static camera angle.
 */
export const MODEL_SCALE_REVOLVER = 1.0;
export const MODEL_SCALE_CHAIR = 1.0;
export const MODEL_SCALE_RADIO = 1.0;
export const MODEL_SCALE_BOTTLE = 1.0;
export const MODEL_SCALE_TABLE = 1.0;
export const MODEL_SCALE_ASHTRAY = 1.0;
export const MODEL_SCALE_LIGHTBULB = 1.0;

/* ------------------------------------------------------------------------ */
/* Model position — designer Phase 2A fills                                 */
/* ------------------------------------------------------------------------ */

/**
 * World-space (x, y, z) anchor in metres, applied via Group.position.set.
 *
 * Phase 2A designer fills these. Phase 1 placeholders mirror the Sprint 2
 * primitive cube positions so a partial Phase 2B integration before
 * designer Phase 2A finishes will land the GLBs near (but not pixel-on)
 * their final spots.
 *
 * Coordinate convention (matches Sprint 2 placeholder-room.ts):
 *   - x: left (-) / right (+)
 *   - y: down (-) / up (+) — floor at 0, table top at ~0.79
 *   - z: forward to camera (+) / back wall (-)
 */
export const MODEL_POSITION_REVOLVER: readonly [number, number, number] = [0, 0.79, 0.1];
export const MODEL_POSITION_CHAIR:    readonly [number, number, number] = [0, 0, -0.9];
export const MODEL_POSITION_RADIO:    readonly [number, number, number] = [1.6, 0.1, -1.2];
export const MODEL_POSITION_BOTTLE:   readonly [number, number, number] = [-0.6, 0.79, -0.2];
export const MODEL_POSITION_TABLE:    readonly [number, number, number] = [0, 0, 0];
export const MODEL_POSITION_ASHTRAY:  readonly [number, number, number] = [0.4, 0.79, 0.1];
export const MODEL_POSITION_LIGHTBULB:readonly [number, number, number] = [0, 2.4, 0];

/* ------------------------------------------------------------------------ */
/* Model rotation — designer Phase 2A fills                                 */
/* ------------------------------------------------------------------------ */

/**
 * Euler rotation (x, y, z) in **radians**, applied via Group.rotation.set.
 *
 * Phase 2A designer fills these. Phase 1 placeholders are zero rotation
 * (model's authored orientation).
 *
 * Designer note: most Poly Pizza models authored with +Z forward and +Y
 * up. If the revolver's barrel comes in pointing the wrong way, the y
 * rotation here is the place to flip it (NOT inside revolver-mount.ts —
 * that file owns animation pivots, not asset orientation).
 */
export const MODEL_ROTATION_REVOLVER: readonly [number, number, number] = [0, 0, 0];
export const MODEL_ROTATION_CHAIR:    readonly [number, number, number] = [0, 0, 0];
export const MODEL_ROTATION_RADIO:    readonly [number, number, number] = [0, 0, 0];
export const MODEL_ROTATION_BOTTLE:   readonly [number, number, number] = [0, 0, 0];
export const MODEL_ROTATION_TABLE:    readonly [number, number, number] = [0, 0, 0];
export const MODEL_ROTATION_ASHTRAY:  readonly [number, number, number] = [0, 0, 0];
export const MODEL_ROTATION_LIGHTBULB:readonly [number, number, number] = [0, 0, 0];

/* ------------------------------------------------------------------------ */
/* Revolver mesh split — designer / kraken-revolver collaboration           */
/* ------------------------------------------------------------------------ */

/**
 * Named-child lookups for the revolver GLB's animation pivots.
 *
 * PLAN §6: hammer / cylinder / trigger as separate meshes so the
 * AnimationMixer can rotate them independently. The Poly Pizza Quaternius
 * revolver MAY be monolithic (single combined mesh) — Phase 2B
 * kraken-revolver discovers this at load time via
 * `group.getObjectByName(MODEL_REVOLVER_HAMMER_PIVOT_KEY)`:
 *   - Found → use as the AnimationMixer rotation target.
 *   - Not found → wrap the monolithic mesh in three Object3D pivots
 *     manually (programmatic extension), filed in PLAN.md §18 as a
 *     Sprint 4 ticket if the discovery delays Phase 2B.
 *
 * Names match Blender's default mesh-export naming (PascalCase root part
 * name). Phase 2B kraken-revolver may discover the actual mesh names
 * differ in the vendored file; if so, update these constants and rebuild.
 */
export const MODEL_REVOLVER_HAMMER_PIVOT_KEY = 'Hammer';
export const MODEL_REVOLVER_CYLINDER_PIVOT_KEY = 'Cylinder';
export const MODEL_REVOLVER_BODY_PIVOT_KEY = 'Body';

/* ------------------------------------------------------------------------ */
/* Smoke particle — kraken-particles Phase 2B fills                         */
/* ------------------------------------------------------------------------ */

/**
 * Cigarette-smoke particle counts by quality tier. Lower tier → fewer
 * particles + cheaper per-particle update.
 *
 * Tuned for the static camera in the bodrum oda; the smoke column rises
 * from the ashtray (MODEL_POSITION_ASHTRAY) toward the bulb. Particle
 * lifetime SMOKE_PARTICLE_LIFETIME_MS is the per-particle clock, NOT the
 * per-tier population window — the population is held steady via
 * SMOKE_SPAWN_RATE_HZ feeding new particles as old ones fade.
 */
export const SMOKE_PARTICLE_COUNT_BY_TIER: Readonly<Record<'low' | 'medium' | 'high', number>> = {
  low: 4,
  medium: 8,
  high: 16,
} as const;

/** Particles spawned per second (drives the population alongside lifetime). */
export const SMOKE_SPAWN_RATE_HZ = 2;

/** Per-particle lifetime — fade to zero opacity at this age (ms). */
export const SMOKE_PARTICLE_LIFETIME_MS = 3000;

/** Initial opacity at spawn (0..1). Fades linearly to 0 over lifetime. */
export const SMOKE_PARTICLE_INITIAL_OPACITY = 0.5;

/** Upward velocity in world units per second — gentle rise. */
export const SMOKE_PARTICLE_UPWARD_VELOCITY = 0.02;

/** Horizontal drift amplitude (world units) — sin wave around vertical axis. */
export const SMOKE_PARTICLE_DRIFT_AMPLITUDE = 0.005;

/** Horizontal drift frequency (Hz) — slow lateral sway during the rise. */
export const SMOKE_PARTICLE_DRIFT_FREQUENCY_HZ = 0.3;

/**
 * Velocity dampener applied when `prefers-reduced-motion` is set.
 *
 * Multiplies SMOKE_PARTICLE_UPWARD_VELOCITY (and DRIFT_AMPLITUDE
 * implicitly via Phase 2B) by this fraction so accessibility users get
 * still-or-near-still smoke instead of an excited column.
 */
export const SMOKE_REDUCED_MOTION_VELOCITY_FACTOR = 0.5;

/* ------------------------------------------------------------------------ */
/* Budgets — kraken-loader Phase 2B consumes                                */
/* ------------------------------------------------------------------------ */

/**
 * Hard ceiling for the seven-GLB parallel preload — PLAN §13 "asset preload < 4s".
 *
 * Phase 2B telemetry: performance.now() bookend around preload(); if
 * elapsed > MODEL_LOAD_BUDGET_MS, surface via
 * document.body.dataset['modelBudget'] (NOT console — banned).
 */
export const MODEL_LOAD_BUDGET_MS = 4000;

/**
 * CPU-time ceiling for a single procedural texture generation.
 *
 * 200ms is the soft budget; longer than that and the disclaimer→scene
 * transition spinner becomes visible. Phase 2B uses performance.now()
 * bookends to measure; over-budget generations should be deferred to
 * after first paint (kraken-particles decides).
 */
export const PROC_TEXTURE_BUDGET_MS = 200;

/**
 * Procedural texture canvas dimensions (px).
 *
 * 512² balances readability of the SVG details (Cyrillic letterforms,
 * envelope creases, poster halftones) against GPU upload cost on
 * integrated GPUs. The Phase 1 placeholder-room atlas pattern uses
 * 256², but procedural textures need the higher resolution because
 * they are viewed at near-camera distance and the PS1 affine UV pass
 * (TH-S1-05) re-activates on them.
 */
export const PROC_TEXTURE_DIMENSIONS = {
  width: 512,
  height: 512,
} as const;
