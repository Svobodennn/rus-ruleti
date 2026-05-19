/**
 * Camera setup.
 *
 * PLAN §2 "kamera sabit" — fixed PerspectiveCamera, no controls, no animation.
 * The bodrum sahnesi (basement room) is one shot. Designer (Phase 2) refines
 * framing values via CAMERA in scene-constants.ts.
 */

import { PerspectiveCamera, Vector3 } from 'three';
import { CAMERA } from '../../shared/scene-constants';

/**
 * Construct the fixed-camera. Aspect is computed from the passed container —
 * the resize listener (installResizeListener in scene.ts) keeps it in sync.
 */
export function createCamera(container: HTMLElement): PerspectiveCamera {
  const aspect = container.clientWidth / Math.max(container.clientHeight, 1);
  const camera = new PerspectiveCamera(
    CAMERA.fovDeg,
    aspect,
    CAMERA.near,
    CAMERA.far,
  );
  camera.position.set(CAMERA.posX, CAMERA.posY, CAMERA.posZ);
  camera.lookAt(new Vector3(CAMERA.lookAtX, CAMERA.lookAtY, CAMERA.lookAtZ));
  return camera;
}

/**
 * Update the camera aspect ratio to match a new container size.
 *
 * Called by the resize observer in scene.ts. The lookAt target does not
 * change; only the projection matrix is invalidated.
 */
export function updateCameraAspect(
  camera: PerspectiveCamera,
  width: number,
  height: number,
): void {
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
}
