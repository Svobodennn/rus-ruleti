/**
 * Hanging-bulb lighting + ambient floor.
 *
 * The basement has exactly one light source: a single sodium-yellow bulb on
 * a porcelain duy, swaying gently overhead (PLAN §2 "Işıklandırma"). This
 * module owns that bulb's PointLight, its emissive sphere stand-in, and the
 * very dim AmbientLight that prevents back-faces from being pure black.
 *
 * Sway model: **Lissajous curve**. The bulb's x and z positions oscillate
 * at *different* periods, so the light traces an open curve through the
 * cone of motion instead of a closed circle. Visually this reads as an
 * organic pendulum in a slight cross-draught — never settling, never
 * repeating exactly. A pure-circle sway would read mechanical (the
 * Sprint 0 mood-board reviewer flagged "circular sway = breaks tension").
 *
 * Intensity pulse: ~1% sinusoidal modulation at ~14Hz evokes the AC ripple
 * of a tungsten filament under a weak transformer. The real 50Hz Soviet
 * grid frequency is too fast to perceive as flicker — 10-20Hz reads as
 * "old bulb, bad wiring" and that's what we want.
 *
 * Sprint 1 scope: the bulb MESH stays fixed at the bulb origin; only the
 * cast LIGHT sways. Sprint 3 ties the porcelain duy mesh to the light so
 * the visible bulb sways physically (cable on top, glass on bottom).
 *
 * Designer (Phase 2) tunes everything via BULB_LIGHT + AMBIENT_LIGHT in
 * scene-constants.ts. NO color/numeric literals belong in this file.
 */

import {
  AmbientLight,
  Color,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PointLight,
  SphereGeometry,
} from 'three';
import type { Group } from 'three';
import {
  AMBIENT_LIGHT,
  BULB_LIGHT,
  HEMISPHERE_LIGHT,
} from '../../shared/scene-constants';
import { MODEL_SCALE_LIGHTBULB } from '../../shared/scene-model-constants';
import {
  LIGHTING_FLICKER_DEPTH,
  TENSION_MICRO_PULSE_AMP,
  TENSION_MICRO_PULSE_HZ,
} from '../../shared/scene-revolver-constants';

/** 2π — precomputed so the per-frame Lissajous math stays cheap. */
const TWO_PI = Math.PI * 2;

/**
 * Owns the bulb light + emissive sphere + the per-frame sway updater.
 *
 * The AmbientLight is parented to the PointLight via Object3D.add, which
 * keeps the scene-graph wire-up in index.ts simple (one scene.add call
 * pulls both lights in). AmbientLight is position-independent so the
 * parenting has no lighting consequence.
 *
 * Returned `update(elapsedSec)` MUST be called from the render loop.
 */
export interface BulbLightHandle {
  /** PointLight (with AmbientLight parented as a child). */
  readonly light: PointLight;
  /** Emissive sphere standing in for the bulb's glass envelope. */
  readonly bulbMesh: Mesh;
  /** Per-frame sway update. Receives Three.Clock.getElapsedTime(). */
  update: (elapsedSec: number) => void;
  /**
   * Set the base-intensity multiplier (Sprint 2 progressive-darkening curve).
   *
   * Multiplied into the Sprint 1 baseline (BULB_LIGHT.intensity) before the
   * Lissajous pulse modulation is applied. Factor=1.0 restores Sprint 1
   * baseline. Empty-click handler in the revolver mount layer calls this
   * with `DARKEN_CURVE_PER_CLICK[emptyClicks]` after each empty pull.
   */
  setBaseIntensityFactor: (factor: number) => void;
  /**
   * Trigger a brief intensity flicker — the bulb dips to
   * `LIGHTING_FLICKER_DEPTH` × current baseline then snaps back over
   * `durationMs`. Caller is the empty-click cue (PLAN §5: "Ampul bir
   * flicker"). Reentrant: a second call during an active flicker resets
   * the timer; the bulb does not pile up multipliers.
   */
  triggerFlicker: (durationMs: number) => void;
  /**
   * Activate/deactivate the tension micro-pulse — an additive 4Hz sinusoidal
   * intensity wobble applied on top of the existing 14Hz AC ripple during the
   * last 100ms of trigger hold (designer §3).
   */
  setMicroPulseActive: (active: boolean) => void;
  /**
   * Attach the loaded lightbulb GLB scene as a child of the PointLight.
   *
   * Sprint 3 Phase 2B kraken-loader hook (model-freeze §8.3):
   *   1. The GLB Group is parented to the PointLight so it tracks the
   *      Lissajous sway organically — when the light position swings,
   *      the bulb mesh swings with it because the parent transform
   *      carries the children.
   *   2. The original placeholder sphere (`bulbMesh`) is hidden — the
   *      light is the same, only the visible glass envelope changes.
   *   3. Every MeshStandardMaterial in the GLB has its `.emissive` killed
   *      to pure black so the bulb only glows because of the cone landing
   *      on it (model-freeze §3.2 "porcelain duy lit from the cone, not
   *      from baked emissive"). Without this kill, the GLB's authored
   *      emissive blooms in the chromatic post-pass and the bulb looks
   *      like a neon sign instead of a tungsten filament.
   *
   * Called once at scene mount. Idempotent: subsequent calls re-parent the
   * (already-attached) Group as a child of the PointLight (Three.js Group
   * automatically detaches from prior parent on re-add).
   */
  attachToMesh: (lightbulbScene: Group) => void;
  /** Tear down. Frees GPU buffers + dispose materials. */
  dispose: () => void;
}

/**
 * Construct the hanging-bulb subsystem.
 *
 * Layout: the bulb origin sits at (0, BULB_LIGHT.posY, 0). The PointLight,
 * the placeholder sphere mesh and the AmbientLight are all anchored here.
 * Per-frame Lissajous sway is applied to the light's xy only (Sprint 1).
 */
export function createBulbLight(): BulbLightHandle {
  const light = createPointLight();
  const bulbMesh = createBulbMesh(light);
  const ambient = createAmbientLight();
  const hemisphere = createHemisphereLight();
  light.add(ambient);
  // Parent the HemisphereLight under the PointLight too; HemisphereLight is
  // position-independent (only the up-axis matters), so parenting is purely
  // scene-graph convenience — index.ts adds one node and gets all three lights.
  light.add(hemisphere);

  // Mutable bag the swayUpdater consults each frame so empty-click cues
  // (setBaseIntensityFactor, triggerFlicker) can write here without
  // poking the OscillatorNode-style closure of the updater itself.
  const dynamicState: BulbDynamicState = {
    baseFactor: 1.0,
    flickerStartMs: -1,
    flickerDurationMs: 0,
    microPulseActive: false,
  };

  const update = buildSwayUpdater(light, dynamicState);
  const setBaseIntensityFactor = (factor: number): void => {
    dynamicState.baseFactor = factor;
  };
  const triggerFlicker = (durationMs: number): void => {
    dynamicState.flickerStartMs = performance.now();
    dynamicState.flickerDurationMs = Math.max(durationMs, 1);
  };
  const setMicroPulseActive = (active: boolean): void => {
    dynamicState.microPulseActive = active;
  };
  const attachToMesh = (lightbulbScene: Group): void => {
    attachLightbulbGlbAsChild(light, bulbMesh, lightbulbScene);
  };
  const dispose = buildDisposer(bulbMesh);

  return {
    light, bulbMesh, update, dispose, attachToMesh,
    setBaseIntensityFactor, triggerFlicker, setMicroPulseActive,
  };
}

/**
 * Per-frame mutable state read by the sway updater. Lives outside the
 * updater closure so empty-click handlers can poke it without redoing the
 * builder math each frame.
 */
interface BulbDynamicState {
  baseFactor: number;
  flickerStartMs: number;
  flickerDurationMs: number;
  /** True during the tension-threshold window (last 100ms of hold). */
  microPulseActive: boolean;
}

/* ------------------------------------------------------------------------ */
/* Construction helpers                                                     */
/* ------------------------------------------------------------------------ */

/** PointLight at the bulb origin. Reads all params from BULB_LIGHT. */
function createPointLight(): PointLight {
  const light = new PointLight(
    new Color(BULB_LIGHT.color),
    BULB_LIGHT.intensity,
    BULB_LIGHT.distance,
    BULB_LIGHT.decay,
  );
  light.position.set(0, BULB_LIGHT.posY, 0);
  light.name = 'bulb-light';
  return light;
}

/**
 * Emissive sphere standing in for the bulb's glass envelope. Sprint 1: the
 * mesh sits at the bulb origin and does NOT track the swayed light position
 * — only the cast light sways. Sprint 3 ties this mesh to a real GLB.
 */
function createBulbMesh(light: PointLight): Mesh {
  const geo = new SphereGeometry(0.04, 12, 8);
  const mat = new MeshBasicMaterial({ color: new Color(BULB_LIGHT.color) });
  const mesh = new Mesh(geo, mat);
  mesh.name = 'placeholder-bulb';
  mesh.position.set(0, light.position.y, 0);
  return mesh;
}

/** Very-dim AmbientLight prevents unlit faces from being pure black. */
function createAmbientLight(): AmbientLight {
  const ambient = new AmbientLight(
    new Color(AMBIENT_LIGHT.color),
    AMBIENT_LIGHT.intensity,
  );
  ambient.name = 'ambient-floor';
  return ambient;
}

/**
 * Sky/ground HemisphereLight — Sprint 3 runtime calibration.
 *
 * Adds a non-directional fill where up-facing surfaces pick up the cool
 * `skyColor` (suggests a thin cellar-window leak) and down-facing surfaces
 * pick up the warm `groundColor` (suggests floor bounce from the sodium
 * bulb cone). HemisphereLight casts no shadows and is cheaper than a
 * second PointLight; intensity stays below the AmbientLight so the
 * single-bulb chiaroscuro reads as the dominant lighting motif.
 */
function createHemisphereLight(): HemisphereLight {
  const hemi = new HemisphereLight(
    new Color(HEMISPHERE_LIGHT.skyColor),
    new Color(HEMISPHERE_LIGHT.groundColor),
    HEMISPHERE_LIGHT.intensity,
  );
  hemi.name = 'hemi-fill';
  return hemi;
}

/* ------------------------------------------------------------------------ */
/* Per-frame motion                                                         */
/* ------------------------------------------------------------------------ */

/**
 * Build the per-frame Lissajous-sway + intensity-pulse updater.
 *
 * Capturing BULB_LIGHT into local consts at builder time keeps the per-frame
 * hot path free of property-access overhead. The closure body stays under
 * the 50-line ceiling.
 */
function buildSwayUpdater(
  light: PointLight,
  state: BulbDynamicState,
): (elapsedSec: number) => void {
  const baseIntensity = BULB_LIGHT.intensity;
  const wX = TWO_PI / BULB_LIGHT.swayPeriodSecX;
  const wZ = TWO_PI / BULB_LIGHT.swayPeriodSecZ;
  const phaseX = BULB_LIGHT.swayPhaseX;
  const phaseZ = BULB_LIGHT.swayPhaseZ;
  const ampX = BULB_LIGHT.swayAmpX;
  const ampZ = BULB_LIGHT.swayAmpZ;
  const pulseW = TWO_PI * BULB_LIGHT.swayPulseHz;
  const pulseA = BULB_LIGHT.swayPulseAmp;

  const microPulseW = TWO_PI * TENSION_MICRO_PULSE_HZ;
  // WCAG 2.3.1 / Sprint 2 retro: 4Hz brightness flash crosses the
  // photosensitive seizure threshold band. Gate at builder time so the
  // per-frame hot path has no branch cost.
  const reducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (elapsedSec: number): void => {
    light.position.x = Math.sin(elapsedSec * wX + phaseX) * ampX;
    light.position.z = Math.sin(elapsedSec * wZ + phaseZ) * ampZ;
    const pulse = 1 + Math.sin(elapsedSec * pulseW) * pulseA;
    const flicker = computeFlickerMultiplier(state, performance.now());
    const microPulse = (state.microPulseActive && !reducedMotion)
      ? Math.sin(elapsedSec * microPulseW) * TENSION_MICRO_PULSE_AMP
      : 0;
    light.intensity =
      baseIntensity * state.baseFactor * pulse * flicker + microPulse;
  };
}

/**
 * Compute the flicker multiplier (1.0 = no flicker; <1.0 = dipped). Linear
 * ramp from LIGHTING_FLICKER_DEPTH back to 1.0 over the flicker duration.
 */
function computeFlickerMultiplier(
  state: BulbDynamicState,
  nowMs: number,
): number {
  if (state.flickerStartMs < 0) {
    return 1.0;
  }
  const elapsed = nowMs - state.flickerStartMs;
  if (elapsed >= state.flickerDurationMs) {
    return 1.0;
  }
  const progress = elapsed / state.flickerDurationMs;
  return LIGHTING_FLICKER_DEPTH + (1.0 - LIGHTING_FLICKER_DEPTH) * progress;
}

/**
 * Build the dispose() callback. The PointLight + AmbientLight have no GPU
 * resources to release explicitly — Three.js tears them down when removed
 * from the scene tree. Only the bulb mesh's geometry + material need
 * explicit disposal.
 */
function buildDisposer(bulbMesh: Mesh): () => void {
  return (): void => {
    bulbMesh.geometry.dispose();
    const mat = bulbMesh.material;
    if (Array.isArray(mat)) {
      for (const m of mat) {
        m.dispose();
      }
    } else {
      mat.dispose();
    }
  };
}

/**
 * Parent the lightbulb GLB to the PointLight, scale it, hide the placeholder
 * sphere, and kill the GLB's baked emissive so the bulb only glows from the
 * cone falloff (model-freeze §3.2). The GLB position stays relative to the
 * parent — so [0,0,0] sits dead-centre on the PointLight pivot and the
 * Lissajous sway carries through.
 */
function attachLightbulbGlbAsChild(
  light: PointLight,
  placeholderMesh: Mesh,
  lightbulbScene: Group,
): void {
  lightbulbScene.scale.setScalar(MODEL_SCALE_LIGHTBULB);
  lightbulbScene.position.set(0, 0, 0);
  light.add(lightbulbScene);
  placeholderMesh.visible = false;
  killEmissiveOnGlb(lightbulbScene);
}

/**
 * Walk the GLB scene and zero every MeshStandardMaterial's emissive. Some
 * Poly Pizza authors ship a glowing-bulb albedo with a strong emissive; we
 * want the bulb's brightness to come from the PointLight's cone hitting the
 * envelope, not from a baked emissive in the GLB.
 */
function killEmissiveOnGlb(lightbulbScene: Group): void {
  lightbulbScene.traverse((obj): void => {
    if (!(obj instanceof Mesh)) return;
    const mat = obj.material;
    if (Array.isArray(mat)) {
      mat.forEach(killEmissiveOnMaterial);
    } else {
      killEmissiveOnMaterial(mat);
    }
  });
}

/** Zero `.emissive` + `.emissiveIntensity` on a single material if present. */
function killEmissiveOnMaterial(mat: unknown): void {
  if (!(mat instanceof MeshStandardMaterial)) return;
  mat.emissive.set('#000000');
  mat.emissiveIntensity = 0;
}
