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
/** Quaternius revolver ~28cm long → 0.9 brings barrel to ~25cm Nagant feel. */
export const MODEL_SCALE_REVOLVER = 0.9;
/** Quaternius chair ~0.9m tall — matches Sprint 1 placeholder height 1:1. */
export const MODEL_SCALE_CHAIR = 1.0;
/** Quaternius radio ~0.4m wide → 0.85 brings to ~0.34m, matches placeholder. */
export const MODEL_SCALE_RADIO = 0.85;
/** Quaternius bottle ~0.4m tall → 0.75 brings to ~0.3m Stolichnaya silhouette. */
export const MODEL_SCALE_BOTTLE = 0.75;
/** dook table ~1.2m → 1.15 brings to ~1.4m, matches Sprint 1 placeholder width. */
export const MODEL_SCALE_TABLE = 1.15;
/** dook ashtray ~0.25m → 0.6 brings to ~0.15m coffee-table ashtray size. */
export const MODEL_SCALE_ASHTRAY = 0.6;
/** Jason Toff lightbulb ~0.2m total → 0.7 brings to ~0.14m incandescent bulb size. */
export const MODEL_SCALE_LIGHTBULB = 0.7;

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
/** Centered on the table top, slightly forward of center (z=0.1) so barrel reads clearly. */
export const MODEL_POSITION_REVOLVER: readonly [number, number, number] = [0, 0.79, 0.1];
/** 5cm off-center (x=0.05) — "real chair someone walked away from" per atmosphere §3.3. */
export const MODEL_POSITION_CHAIR:    readonly [number, number, number] = [0.05, 0, -0.9];
/** Far-right back-corner mass, matches Sprint 1 placeholder exactly. */
export const MODEL_POSITION_RADIO:    readonly [number, number, number] = [1.6, 0.1, -1.2];
/** On table top, left of revolver (x=-0.5), slightly behind (z=-0.2) — silhouette anchor. */
export const MODEL_POSITION_BOTTLE:   readonly [number, number, number] = [-0.5, 0.79, -0.2];
/** Floor origin; GLB origin assumed at base, so y=0 lands the table on the floor naturally. */
export const MODEL_POSITION_TABLE:    readonly [number, number, number] = [0, 0, 0];
/** Right of revolver (x=0.4), same z as revolver — smoke column shares the bulb-revolver axis. */
export const MODEL_POSITION_ASHTRAY:  readonly [number, number, number] = [0.4, 0.79, 0.1];
/** Top apex of the composition triangle; matches BULB_LIGHT.posY for PointLight attach. */
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
/** Barrel pointing left (-π/2 around y) — grip faces chair; "muzzle pointed away" narrative. */
export const MODEL_ROTATION_REVOLVER: readonly [number, number, number] = [0, -Math.PI / 2, 0];
/** 15° (π/12) counterclockwise — chair pushed back at an angle; humanises the seat. */
export const MODEL_ROTATION_CHAIR:    readonly [number, number, number] = [0, Math.PI / 12, 0];
/** 22.5° (-π/8) turned toward camera so dial face is visible from sabit camera. */
export const MODEL_ROTATION_RADIO:    readonly [number, number, number] = [0, -Math.PI / 8, 0];
/** 30° (π/6) rotation so label face catches bulb cone glancingly — "puslu etiket" reading. */
export const MODEL_ROTATION_BOTTLE:   readonly [number, number, number] = [0, Math.PI / 6, 0];
/** Grid-aligned — table is the stage, the chair gets the angle. */
export const MODEL_ROTATION_TABLE:    readonly [number, number, number] = [0, 0, 0];
/** 36° (π/5) — "someone pushed this aside to put the gun down" narrative. */
export const MODEL_ROTATION_ASHTRAY:  readonly [number, number, number] = [0, Math.PI / 5, 0];
/** Neutral — bulb hangs straight down; sway is animated, not baked into rotation. */
export const MODEL_ROTATION_LIGHTBULB:readonly [number, number, number] = [0, 0, 0];

/* ------------------------------------------------------------------------ */
/* Material color overrides — designer Phase 2A fills (model-freeze §2/§7.1) */
/* ------------------------------------------------------------------------ */

/**
 * Per-model hex color override applied by Phase 2B kraken-loader at GLB
 * load time. Each Poly Pizza model ships with the original author's
 * albedo; the brutalist Soviet cellar requires darker, dirtier surfaces
 * than the default CC0 / CC-BY uploads provide.
 *
 * Phase 2B kraken-loader traverses each loaded scene, finds every
 * MeshStandardMaterial, and sets its `.color` to the override:
 *
 * ```ts
 * import { MATERIAL_COLOR_OVERRIDE_BY_KEY } from '../shared/scene-model-constants';
 * const override = MATERIAL_COLOR_OVERRIDE_BY_KEY[modelKey];
 * glbScene.traverse((obj) => {
 *   if (obj instanceof Mesh && obj.material instanceof MeshStandardMaterial) {
 *     obj.material.color.set(override);
 *   }
 * });
 * ```
 *
 * Rationale per object lives in model-freeze-direction.md §2. Summary:
 *   revolver  — matte gunmetal, just above PALETTE.oak
 *   chair     — PALETTE.oak (brutally heavy dark wood)
 *   radio     — PALETTE.rust (lampovaya radyo wooden cabinet)
 *   bottle    — faded green-grey glass (PALETTE.neon × 0.35)
 *   table     — PALETTE.oak (chiaroscuro preservation)
 *   ashtray   — near-shadow ceramic (PALETTE.shadow × 1.4)
 *   lightbulb — see §3.2: NO color override on porcelain duy; glass
 *                envelope keeps PALETTE.sodium base AND gets emissive
 *                killed by Phase 2B (separate concern, not a color
 *                override — it's a `material.emissive` mutation).
 *                The lightbulb entry below targets the GLASS ENVELOPE
 *                base color only; the porcelain duy keeps the GLB's
 *                authored ceramic tint.
 *
 * `lightbulb` is intentionally PALETTE.sodium so the glass envelope reads
 * as a lit incandescent globe under the PointLight cone. The bulb is the
 * one surface in the scene that benefits from being the brightest object
 * in frame — it's the light source proxy.
 */
export const MATERIAL_COLOR_OVERRIDE_BY_KEY = Object.freeze({
  revolver: '#1a1816',
  chair: '#1c1814',
  radio: '#3d2817',
  bottle: '#2a3322',
  table: '#1c1814',
  ashtray: '#2a2520',
  lightbulb: '#c89b3c',
} as const);

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

/**
 * Y-axis offset from MODEL_POSITION_ASHTRAY to the smoke spawn anchor
 * (world units = metres). Designer §5.4: "smoke rises from the cigarette
 * tip, ~4cm above the ashtray's own origin".
 */
export const SMOKE_Y_OFFSET_M = 0.04;

/* ------------------------------------------------------------------------ */
/* Procedural texture surface placement — model-freeze §8.5                 */
/* ------------------------------------------------------------------------ */

/**
 * World-space position and plane dimensions for the three procedural-texture
 * surfaces. Positions are (x, y, z) in metres; dimensions are (width, height)
 * in metres. Values tuned by designer Phase 2A for the 6×6m room layout with
 * camera at y=1.6.
 *
 * Envelope: small plane lying flat on the table surface (rotation.x = -π/2).
 * Portrait: portrait-aspect plane on the back wall, right half.
 * Poster: landscape-aspect plane on the back wall, left half.
 */
export const PROC_TEXTURE_ENVELOPE_POSITION: readonly [number, number, number] = [-0.3, 0.78, -0.3];
export const PROC_TEXTURE_ENVELOPE_DIMENSIONS: readonly [number, number] = [0.3, 0.2];
export const PROC_TEXTURE_PORTRAIT_POSITION: readonly [number, number, number] = [1.0, 1.5, -2.0];
export const PROC_TEXTURE_PORTRAIT_DIMENSIONS: readonly [number, number] = [0.6, 0.8];
export const PROC_TEXTURE_POSTER_POSITION: readonly [number, number, number] = [-1.2, 1.4, -2.0];
export const PROC_TEXTURE_POSTER_DIMENSIONS: readonly [number, number] = [0.7, 1.0];

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
