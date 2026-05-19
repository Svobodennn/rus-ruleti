/**
 * Hanging bulb lighting.
 *
 * Single PointLight + a small emissive sphere standing in for the bulb's
 * porcelain housing. Sways subtly on x/z via a sin oscillation driven by the
 * scene's Clock — gives the basement the "almost-still" tension PLAN §2 asks
 * for ("hafifçe sallanır").
 *
 * Designer (Phase 2) tunes intensity, color, sway amplitude via BULB_LIGHT
 * in scene-constants.ts. NO color/numeric literals belong in this file.
 */

import {
  Color,
  Mesh,
  MeshBasicMaterial,
  PointLight,
  SphereGeometry,
} from 'three';
import { BULB_LIGHT } from '../../shared/scene-constants';

/**
 * Owns the bulb light + emissive sphere + the per-frame sway updater.
 *
 * Returned `update(elapsedSec)` MUST be called from the render loop. The
 * sway updates both the light's position and the mesh's position together
 * so the visible bulb tracks the cast shadow source.
 */
export interface BulbLightHandle {
  /** PointLight + emissive bulb mesh, both children of the same parent. */
  readonly light: PointLight;
  readonly bulbMesh: Mesh;
  /** Per-frame sway update. Receives Three.Clock.getElapsedTime(). */
  update: (elapsedSec: number) => void;
  /** Tear down. Frees GPU buffers + dispose materials. */
  dispose: () => void;
}

/**
 * Create the hanging bulb. Position from BULB_LIGHT.posY; horizontal sway
 * is added per-frame by update(). The emissive sphere is small (0.04
 * radius) — the actual brightness sits in the PointLight color/intensity.
 */
export function createBulbLight(): BulbLightHandle {
  const light = new PointLight(
    new Color(BULB_LIGHT.color),
    BULB_LIGHT.intensity,
    BULB_LIGHT.distance,
    BULB_LIGHT.decay,
  );
  light.position.set(0, BULB_LIGHT.posY, 0);

  const bulbGeo = new SphereGeometry(0.04, 12, 8);
  const bulbMat = new MeshBasicMaterial({ color: new Color(BULB_LIGHT.color) });
  const bulbMesh = new Mesh(bulbGeo, bulbMat);
  bulbMesh.name = 'placeholder-bulb';
  bulbMesh.position.copy(light.position);

  const update = (elapsedSec: number): void => {
    const phase = elapsedSec * BULB_LIGHT.swayFrequency;
    const dx = Math.sin(phase) * BULB_LIGHT.swayAmplitude;
    const dz = Math.cos(phase * 0.83) * BULB_LIGHT.swayAmplitude;
    light.position.x = dx;
    light.position.z = dz;
    bulbMesh.position.x = dx;
    bulbMesh.position.z = dz;
  };

  const dispose = (): void => {
    bulbGeo.dispose();
    bulbMat.dispose();
    // PointLight has no GPU resources to release explicitly; removal from
    // the scene tree handles it.
  };

  return { light, bulbMesh, update, dispose };
}
