/**
 * Camera setup.
 *
 * PLAN §2 "kamera sabit" — fixed PerspectiveCamera, no controls, no animation.
 * The bodrum sahnesi (basement room) is one shot. Designer (Phase 2) refines
 * framing values via CAMERA in scene-constants.ts.
 */

import { PerspectiveCamera, Vector3 } from 'three';
import { CAMERA } from '../../shared/scene-constants';
import { KICK_CAMERA_SHAKE_HZ } from '../../shared/scene-revolver-constants';

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

/**
 * Animate the camera's `fov` toward a target over `durationMs` (linear).
 *
 * Used by the revolver hold-state ramp: the camera leans in 5% during the
 * 1-second hold (PLAN §6) and reverses on release. Returns a disposer that
 * aborts the active RAF tween — calling it during animation snaps the camera
 * to its CURRENT (in-flight) fov, NOT the target. This is the right
 * semantic for "user released early; cancel the lean-in, let the spring-back
 * driver start from here".
 *
 * Designer revolver-direction.md §3 mandates LINEAR easing — do not retrofit
 * an `ease-out` "for taste".
 */
export function startCameraZoom(
  camera: PerspectiveCamera,
  targetFovDeg: number,
  durationMs: number,
): () => void {
  const startFov = camera.fov;
  const startMs = performance.now();
  const duration = Math.max(durationMs, 1);
  let rafId = 0;
  let active = true;

  const tick = (): void => {
    if (!active) return;
    const progress = Math.min(1, (performance.now() - startMs) / duration);
    camera.fov = startFov + (targetFovDeg - startFov) * progress;
    camera.updateProjectionMatrix();
    if (progress < 1) {
      rafId = requestAnimationFrame(tick);
    }
  };
  rafId = requestAnimationFrame(tick);

  return (): void => {
    active = false;
    cancelAnimationFrame(rafId);
  };
}

/**
 * Single-shot camera shake — perturbs `camera.rotation.z` over `durationMs`
 * with a decaying-amplitude sine, snapping back to the original rotation.
 * Returns a disposer that aborts the active RAF, parallel to `startCameraZoom`.
 *
 * Used by the kick animation on bang (PLAN §6 "+2° kamera shake"). Allocates
 * its own RAF; does NOT integrate with the main render loop (scene.ts) so
 * this module stays self-contained. If a second shake is triggered while
 * one is active, the second wins (caller resets the base rotation).
 *
 * Early-returns (no-op disposer) when prefers-reduced-motion is active —
 * audio bang + overlay are sufficient plot beats without motion.
 */
export function triggerCameraShake(
  camera: PerspectiveCamera,
  maxAngleDeg: number,
  durationMs: number,
): () => void {
  // Respect prefers-reduced-motion: audio bang + overlay are sufficient
  // plot beats without motion (consistent with hud.css strobe-disable).
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return (): void => undefined;
  }
  const baseRot = camera.rotation.z;
  const startMs = performance.now();
  const duration = Math.max(durationMs, 1);
  const maxRad = (maxAngleDeg * Math.PI) / 180;
  let rafId = 0;
  let active = true;

  const tick = (): void => {
    if (!active) {
      camera.rotation.z = baseRot;
      return;
    }
    const elapsed = performance.now() - startMs;
    if (elapsed >= duration) {
      camera.rotation.z = baseRot;
      return;
    }
    const decay = 1 - elapsed / duration;
    const wobble = Math.sin((elapsed / 1000) * 2 * Math.PI * KICK_CAMERA_SHAKE_HZ);
    camera.rotation.z = baseRot + wobble * maxRad * decay;
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

  return (): void => {
    active = false;
    cancelAnimationFrame(rafId);
  };
}
