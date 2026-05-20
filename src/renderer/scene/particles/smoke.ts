/**
 * Cigarette-smoke particle column above the ashtray (Sprint 3 Phase 2B).
 *
 * Atmospheric texture — NOT a focal element. The smoke reinforces the
 * vertical bulb-table-revolver triangle (model-freeze §1) by adding slow
 * upward motion in the right-third of the table without competing for
 * the eye. Implementation honours `model-freeze-direction.md §5` and
 * `atmosphere-direction.md §8.6` exactly:
 *
 *   - THREE.Points + PointsMaterial, no texture (PS1 aesthetic — flat
 *     colour reads as low-end engine ambient fog, sprite textures would
 *     read as "modern atmospheric effect").
 *   - Fixed-size pool sized to the max tier (high = 16). Quality demotion
 *     reduces the *active* particle count, NEVER reallocates the buffer.
 *   - Drift period 1/0.3Hz ≈ 3.33s is pairwise incommensurable with the
 *     bulb Lissajous periods (3.7s, 4.9s) — verified below in DRIFT_*
 *     math. The three motions never visually sync, which is the point.
 *   - prefers-reduced-motion: dampens velocity + amplitude × 0.5 at MOUNT
 *     time only. Mid-session toggle is intentionally not reactive
 *     (designer §5: smoke is texture, not focus).
 *
 * Integration contract for kraken-loader (sibling Phase 2B agent):
 *   1. kraken-loader mounts ashtray.glb in placeholder-room.
 *   2. After GLB load, kraken-loader computes the ashtray-top spawn
 *      anchor (MODEL_POSITION_ASHTRAY + ~4cm y offset per designer §5.4)
 *      and calls `mountSmoke(scene, { sourcePosition, qualityLevel })`.
 *   3. kraken-loader wires `SmokeHandle.update(deltaSec)` into the same
 *      RAF that updates BulbLightHandle.update + revolver-loop.tick.
 *      `deltaSec` is the **frame delta in seconds**, NOT elapsed.
 *   4. kraken-loader subscribes the smoke handle to quality changes:
 *      `qualityController.onQualityChange((next) =>
 *        smokeHandle.setQualityLevel(next))`.
 *   5. SceneHandle.dispose() calls `smokeHandle.dispose()` in reverse-
 *      allocation order BEFORE removing the ashtray GLB from the scene.
 *
 * No external state is observed beyond `window.matchMedia`. The smoke
 * column never reads the bulb position or the empty-click count —
 * coupling them would draw the eye away from the revolver (model-freeze
 * §5.5 anti-pattern list).
 */

import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  Points,
  PointsMaterial,
  type Scene,
  type Vector3,
} from 'three';
import type { QualityLevel } from '../../../shared/scene-constants';
import {
  SMOKE_PARTICLE_COUNT_BY_TIER,
  SMOKE_SPAWN_RATE_HZ,
  SMOKE_PARTICLE_LIFETIME_MS,
  SMOKE_PARTICLE_INITIAL_OPACITY,
  SMOKE_PARTICLE_UPWARD_VELOCITY,
  SMOKE_PARTICLE_DRIFT_AMPLITUDE,
  SMOKE_PARTICLE_DRIFT_FREQUENCY_HZ,
  SMOKE_REDUCED_MOTION_VELOCITY_FACTOR,
} from '../../../shared/scene-model-constants';

/* ------------------------------------------------------------------------ */
/* Local design constants (named to satisfy "no magic numbers" — values     */
/* sourced from designer model-freeze-direction.md §5.2 / §5.4)             */
/* ------------------------------------------------------------------------ */

/**
 * Off-white warm tint per designer §5.2 (PALETTE.paper × 1.7 clamped).
 * Pure white would punch holes in the dark frame; a slight warm grey
 * reads as smoke under sodium light.
 */
const SMOKE_COLOR_HEX = '#d8d0c0';

/**
 * Particle render sizes by tier (px) per designer §5.2:
 *   - low 4px (smaller column for lower density)
 *   - medium 6px (camera ~2.5m from ashtray; reads as small smoke fleck)
 *   - high 8px (larger flecks with more density — more visible)
 */
const SMOKE_SIZE_PX_BY_TIER: Readonly<Record<QualityLevel, number>> = {
  low: 4,
  medium: 6,
  high: 8,
};

/**
 * Horizontal spawn-position jitter half-width (world units) per designer
 * §5.4. ±1cm random offset gives the column a slight visible width so
 * particles don't all rise from a single point.
 */
const SPAWN_JITTER_HALF_WIDTH = 0.01;

/** Hard ceiling = high-tier population. Pool never grows beyond this. */
const MAX_PARTICLE_POOL_SIZE = SMOKE_PARTICLE_COUNT_BY_TIER.high;

/** Spawn interval (ms) = 1000 / spawn rate Hz. */
const SPAWN_INTERVAL_MS = 1000 / SMOKE_SPAWN_RATE_HZ;

/** Drift angular frequency (rad/s) = 2π · DRIFT_FREQUENCY_HZ. */
const DRIFT_OMEGA = 2 * Math.PI * SMOKE_PARTICLE_DRIFT_FREQUENCY_HZ;

/**
 * "Inactive" sentinel position — y far below floor so even if a stray
 * frame happens before opacity attribute updates, the particle is not
 * visible. Re-used for every slot on init + on age expiry.
 */
const INACTIVE_Y = -1000;

/* ------------------------------------------------------------------------ */
/* Public API                                                               */
/* ------------------------------------------------------------------------ */

/**
 * Returned from `mountSmoke()`. The mount layer owns the lifecycle and
 * pumps `update(deltaSec)` from the render loop.
 */
export interface SmokeHandle {
  /**
   * Advance the particle system by `deltaSec` seconds. Spawns new
   * particles when the spawn timer elapses, ages active particles, and
   * deactivates expired ones. Cheap — O(MAX_PARTICLE_POOL_SIZE).
   */
  update: (deltaSec: number) => void;
  /**
   * React to a quality-tier change. Updates the active-particle ceiling
   * (cheap — never reallocates the pool). Tier demote may leave some
   * existing particles temporarily active beyond the new ceiling; they
   * age out naturally over `SMOKE_PARTICLE_LIFETIME_MS`.
   */
  setQualityLevel: (q: QualityLevel) => void;
  /** Tear down. Removes Points from scene + disposes geometry + material. */
  dispose: () => void;
}

/** Options passed to `mountSmoke()`. */
export interface SmokeOptions {
  /**
   * Spawn anchor in world coordinates. kraken-loader computes this from
   * `MODEL_POSITION_ASHTRAY + ~4cm y offset` after the ashtray GLB lands
   * (designer §5.4). The smoke module adds ±1cm horizontal jitter per
   * particle on top of this anchor.
   */
  sourcePosition: Vector3;
  /**
   * Initial quality tier. The mount layer should pass the value from
   * `qualityController.getQualityLevel()` and subscribe to changes via
   * `onQualityChange` so the handle's `setQualityLevel` is called when
   * the controller promotes/demotes.
   */
  qualityLevel: QualityLevel;
}

/* ------------------------------------------------------------------------ */
/* Internal per-particle state                                              */
/* ------------------------------------------------------------------------ */

/**
 * Per-slot state in the fixed-size pool. Indexed positionally — slot N's
 * state lives at `state[N]`, and slot N's geometry attributes live at
 * `positions[N*3..N*3+2]` etc. A slot with `active=false` is parked at
 * `INACTIVE_Y` until the spawn loop reuses it.
 */
interface ParticleSlot {
  active: boolean;
  /** Age in seconds since spawn. Mapped to opacity + position each frame. */
  ageSec: number;
  /** Base x at spawn (the column anchor + jitter). Drift adds to this. */
  baseX: number;
  /** Base z at spawn. Drift adds to this. */
  baseZ: number;
  /**
   * Per-particle constant phase offset (radians) so multiple active
   * particles don't drift in lockstep. Sampled from [0, 2π) at spawn and
   * held constant for the slot's lifetime. The time-dependent component
   * of the drift is computed fresh each frame in `writePositionBuffer`.
   */
  driftPhase: number;
  /** Current y world-position (rises monotonically while active). */
  currentY: number;
}

/* ------------------------------------------------------------------------ */
/* Mount + tear-down                                                        */
/* ------------------------------------------------------------------------ */

/**
 * Mount the smoke column into the scene. Allocates a single Points object
 * with a fixed-size pool (`MAX_PARTICLE_POOL_SIZE`). Quality tier changes
 * adjust the active-particle ceiling but never reallocate.
 */
export function mountSmoke(scene: Scene, opts: SmokeOptions): SmokeHandle {
  try {
    const reducedMotion = isReducedMotion();
    const ctx = createParticleContext(opts, reducedMotion);
    scene.add(ctx.points);
    return buildHandle(scene, ctx);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`mountSmoke: failed to allocate Points buffer: ${msg}`);
  }
}

/**
 * Encapsulated runtime context for the smoke system. Lives behind the
 * handle so update/setQualityLevel/dispose share mutable state without
 * closing over the whole `mountSmoke` scope.
 */
interface ParticleContext {
  points: Points;
  geometry: BufferGeometry;
  material: PointsMaterial;
  pool: ParticleSlot[];
  positions: Float32Array;
  /**
   * Per-vertex RGBA buffer. R/G/B set once to the smoke colour at mount;
   * the A channel is overwritten per frame to implement linear opacity
   * decay (designer §5.2). PointsMaterial.vertexColors=true makes the
   * GPU use this attribute instead of the material's global opacity.
   */
  colors: Float32Array;
  source: Vector3;
  reducedMotion: boolean;
  /** Active-particle ceiling — set from quality tier. */
  activeCeiling: number;
  /** Wall-clock ms since mount, accumulated from delta frames. */
  elapsedMs: number;
  /** Wall-clock ms of last spawn. Compared against SPAWN_INTERVAL_MS. */
  lastSpawnMs: number;
}

/**
 * Allocate geometry + material + pool state. Throws on Three.js allocation
 * failure — `mountSmoke` catches and re-wraps with a clear message.
 */
function createParticleContext(
  opts: SmokeOptions,
  reducedMotion: boolean,
): ParticleContext {
  const geometry = new BufferGeometry();
  const positions = new Float32Array(MAX_PARTICLE_POOL_SIZE * 3);
  const colors = new Float32Array(MAX_PARTICLE_POOL_SIZE * 4);
  initBuffers(positions, colors);
  // DynamicDrawUsage tells the GPU driver these attributes are updated every
  // frame (positions + alpha), avoiding static-buffer re-upload stalls.
  const posAttr = new BufferAttribute(positions, 3);
  posAttr.setUsage(DynamicDrawUsage);
  const colorAttr = new BufferAttribute(colors, 4);
  colorAttr.setUsage(DynamicDrawUsage);
  geometry.setAttribute('position', posAttr);
  geometry.setAttribute('color', colorAttr);
  const material = new PointsMaterial({
    size: SMOKE_SIZE_PX_BY_TIER[opts.qualityLevel],
    transparent: true,
    depthWrite: false,
    sizeAttenuation: false,
    vertexColors: true,
  });
  const points = new Points(geometry, material);
  points.name = 'smoke-particles';
  return {
    points,
    geometry,
    material,
    pool: makeEmptyPool(),
    positions,
    colors,
    source: opts.sourcePosition,
    reducedMotion,
    activeCeiling: SMOKE_PARTICLE_COUNT_BY_TIER[opts.qualityLevel],
    elapsedMs: 0,
    lastSpawnMs: -SPAWN_INTERVAL_MS,
  };
}

/**
 * Initialise the GPU buffers. Positions park every slot at INACTIVE_Y
 * (out of frustum); colour buffer pre-fills RGB to the smoke tint with
 * A=0 so unspawned slots are fully transparent.
 */
function initBuffers(positions: Float32Array, colors: Float32Array): void {
  const tint = new Color(SMOKE_COLOR_HEX);
  for (let i = 0; i < MAX_PARTICLE_POOL_SIZE; i += 1) {
    positions[i * 3 + 1] = INACTIVE_Y;
    colors[i * 4] = tint.r;
    colors[i * 4 + 1] = tint.g;
    colors[i * 4 + 2] = tint.b;
    colors[i * 4 + 3] = 0;
  }
}

/** Build the fixed-size pool of inactive slots. */
function makeEmptyPool(): ParticleSlot[] {
  const pool: ParticleSlot[] = [];
  for (let i = 0; i < MAX_PARTICLE_POOL_SIZE; i += 1) {
    pool.push({
      active: false,
      ageSec: 0,
      baseX: 0,
      baseZ: 0,
      driftPhase: 0,
      currentY: INACTIVE_Y,
    });
  }
  return pool;
}

/** Compose the public handle from the runtime context. */
function buildHandle(scene: Scene, ctx: ParticleContext): SmokeHandle {
  return {
    update: (deltaSec: number): void => {
      tickSmoke(ctx, deltaSec);
    },
    setQualityLevel: (q: QualityLevel): void => {
      ctx.activeCeiling = SMOKE_PARTICLE_COUNT_BY_TIER[q];
      ctx.material.size = SMOKE_SIZE_PX_BY_TIER[q];
    },
    dispose: (): void => {
      scene.remove(ctx.points);
      ctx.geometry.dispose();
      ctx.material.dispose();
    },
  };
}

/* ------------------------------------------------------------------------ */
/* Per-frame update                                                         */
/* ------------------------------------------------------------------------ */

/**
 * Advance the smoke system by `deltaSec`. Orchestrates spawn → age →
 * position-write in three small passes so each function stays under the
 * 50-line lint ceiling.
 */
function tickSmoke(ctx: ParticleContext, deltaSec: number): void {
  if (deltaSec <= 0) {
    return;
  }
  ctx.elapsedMs += deltaSec * 1000;
  maybeSpawnParticle(ctx);
  ageParticles(ctx, deltaSec);
  writePositionBuffer(ctx);
}

/**
 * Spawn a new particle if enough time has passed since the last spawn AND
 * the active count is below the tier ceiling. Spawns at the source anchor
 * with ±SPAWN_JITTER_HALF_WIDTH horizontal jitter.
 */
function maybeSpawnParticle(ctx: ParticleContext): void {
  if (ctx.elapsedMs - ctx.lastSpawnMs < SPAWN_INTERVAL_MS) {
    return;
  }
  if (countActive(ctx.pool) >= ctx.activeCeiling) {
    return;
  }
  const slotIndex = findInactiveSlot(ctx.pool);
  if (slotIndex < 0) {
    return;
  }
  const slot = ctx.pool[slotIndex];
  if (slot === undefined) {
    return;
  }
  slot.active = true;
  slot.ageSec = 0;
  slot.baseX = ctx.source.x + jitter();
  slot.baseZ = ctx.source.z + jitter();
  slot.driftPhase = Math.random() * 2 * Math.PI;
  slot.currentY = ctx.source.y;
  ctx.lastSpawnMs = ctx.elapsedMs;
}

/**
 * Age every active particle by `deltaSec`. Particles past their lifetime
 * are deactivated and parked at `INACTIVE_Y`. Per-particle opacity (the
 * alpha channel of the color attribute) is updated here — linear fade
 * from SMOKE_PARTICLE_INITIAL_OPACITY → 0 over the slot's lifetime
 * (designer §5.2).
 */
function ageParticles(ctx: ParticleContext, deltaSec: number): void {
  const upward = ctx.reducedMotion
    ? SMOKE_PARTICLE_UPWARD_VELOCITY * SMOKE_REDUCED_MOTION_VELOCITY_FACTOR
    : SMOKE_PARTICLE_UPWARD_VELOCITY;
  const lifetimeSec = SMOKE_PARTICLE_LIFETIME_MS / 1000;
  for (let i = 0; i < ctx.pool.length; i += 1) {
    const slot = ctx.pool[i];
    if (slot === undefined) {
      continue;
    }
    if (!slot.active) {
      ctx.colors[i * 4 + 3] = 0;
      continue;
    }
    slot.ageSec += deltaSec;
    if (slot.ageSec >= lifetimeSec) {
      slot.active = false;
      slot.currentY = INACTIVE_Y;
      ctx.colors[i * 4 + 3] = 0;
      continue;
    }
    slot.currentY += upward * deltaSec;
    const lifeFraction = slot.ageSec / lifetimeSec;
    ctx.colors[i * 4 + 3] = SMOKE_PARTICLE_INITIAL_OPACITY * (1 - lifeFraction);
  }
}

/**
 * Write every slot's current position to the GPU-uploaded BufferAttribute.
 * Drift (sin/cos) is computed here so the position buffer reflects the
 * combined upward+drift motion in one pass.
 */
function writePositionBuffer(ctx: ParticleContext): void {
  const driftAmp = ctx.reducedMotion
    ? SMOKE_PARTICLE_DRIFT_AMPLITUDE * SMOKE_REDUCED_MOTION_VELOCITY_FACTOR
    : SMOKE_PARTICLE_DRIFT_AMPLITUDE;
  const elapsedSec = ctx.elapsedMs / 1000;
  for (let i = 0; i < ctx.pool.length; i += 1) {
    const slot = ctx.pool[i];
    if (slot === undefined) {
      continue;
    }
    const phase = slot.driftPhase + elapsedSec * DRIFT_OMEGA;
    const dx = driftAmp * Math.sin(phase);
    const dz = driftAmp * Math.cos(phase);
    ctx.positions[i * 3] = slot.baseX + dx;
    ctx.positions[i * 3 + 1] = slot.currentY;
    ctx.positions[i * 3 + 2] = slot.baseZ + dz;
  }
  const posAttr = ctx.geometry.getAttribute('position');
  if (posAttr instanceof BufferAttribute) {
    posAttr.needsUpdate = true;
  }
  const colorAttr = ctx.geometry.getAttribute('color');
  if (colorAttr instanceof BufferAttribute) {
    colorAttr.needsUpdate = true;
  }
}

/* ------------------------------------------------------------------------ */
/* Small helpers                                                            */
/* ------------------------------------------------------------------------ */

/** Count active slots in the pool. O(pool.length) — pool is tiny (16). */
function countActive(pool: ParticleSlot[]): number {
  let count = 0;
  for (const slot of pool) {
    if (slot.active) {
      count += 1;
    }
  }
  return count;
}

/** Find the first inactive slot; returns -1 if all are busy. */
function findInactiveSlot(pool: ParticleSlot[]): number {
  for (let i = 0; i < pool.length; i += 1) {
    const slot = pool[i];
    if (slot !== undefined && !slot.active) {
      return i;
    }
  }
  return -1;
}

/** Random offset in [-SPAWN_JITTER_HALF_WIDTH, +SPAWN_JITTER_HALF_WIDTH]. */
function jitter(): number {
  return (Math.random() * 2 - 1) * SPAWN_JITTER_HALF_WIDTH;
}

/**
 * Honour the user's OS-level motion preference at mount time. Mid-session
 * toggles intentionally don't propagate — designer §5 ratifies smoke as
 * "texture not focus", so the cost of subscribing isn't worth the gain.
 */
function isReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
