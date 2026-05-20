/**
 * Per-frame mixer update loop for the revolver AnimationMixer.
 *
 * The main scene render loop in `scene.ts` is renderer-only — it does not
 * know about subsystem AnimationMixers. Rather than retrofitting a callback
 * registration into `startRenderLoop` (which would couple `scene/index.ts`
 * to revolver internals), the revolver mount layer drives its own RAF for
 * mixer.update().
 *
 * The cost is one additional rAF callback per frame — Chromium coalesces
 * with the main RAF so there's no extra context switch. The mixer.update
 * call itself is sub-millisecond for the five-clip clip pool.
 *
 * Disposal stops the RAF. The `active` flag guards against a stale tick
 * firing after dispose if the rAF callback was already scheduled.
 */

import { Clock } from 'three';
import type { EffectContext } from './revolver-effects';

/** Public handle. */
export interface AnimLoopHandle {
  /** Stop the mixer-update loop. Idempotent. */
  dispose: () => void;
}

/** Start the revolver's mixer-update loop. */
export function startSceneAnimationLoop(ctx: EffectContext): AnimLoopHandle {
  const clock = new Clock();
  let active = true;
  let rafId = 0;

  const tick = (): void => {
    if (!active) return;
    const delta = clock.getDelta();
    ctx.anim.update(delta);
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

  return {
    dispose: (): void => {
      active = false;
      cancelAnimationFrame(rafId);
    },
  };
}
