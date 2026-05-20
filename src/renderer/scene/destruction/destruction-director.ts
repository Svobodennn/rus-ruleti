/**
 * Destruction sequence orchestrator — Phase 1 STUB.
 *
 * The director is the single entry point Sprint 4 wires into the existing
 * lobby. It subscribes to two parallel detection paths (Sprint 4 retro
 * lesson — single detection path = race condition risk):
 *
 *   1. `document` CustomEvent `'bang-fired'` (primary; emitted by
 *      revolver-effects.triggerBangOverlay).
 *   2. MutationObserver on `.bang-overlay` class list (fallback;
 *      catches the `.is-fired` toggle even if the CustomEvent dispatch
 *      somehow missed our listener).
 *
 * On detection (and only the FIRST detection — both paths share a single
 * `started` flag so the second observer is a no-op), the director:
 *   a. Resolves OS via `window.api.getOS()`.
 *   b. Resolves username via `window.api.getUsername()` (Faz 3 needs it).
 *   c. Steps through faz0 → faz1 → faz2 → faz3 by awaiting each runner.
 *   d. Triggers ApartmentBleed #1 at APARTMENT_BLEED_1_TRIGGER_MS.
 *   e. Triggers ApartmentBleed #2 at APARTMENT_BLEED_2_TRIGGER_MS.
 *
 * ESC-hold escape:
 *   - Subscribes to `window.api.onEscapeHold(onProgress, onComplete)`. On
 *     completion the director calls `abort('esc-hold')`, which short-circuits
 *     the in-flight Faz, disposes all chrome handles, and (Sprint 5) jumps
 *     directly to the Faz 8 reveal.
 *
 * Called by:
 *   - src/renderer/scene/index.ts `buildResources()` — Sprint 4 Phase 1
 *     adds a lazy `mountDestructionDirector(scene)` call assigned to the
 *     new `SceneHandle.destructionDirector` field. Phase 2B kraken-faz0-1
 *     decides whether to mount eagerly at scene mount, or lazily on first
 *     bang detection (design constraint: bang-fired listener must be on
 *     `document` BEFORE the bang fires; eager mount is simpler).
 *
 * Disposed by:
 *   - SceneHandle.dispose() — Sprint 4 Phase 2B kraken-faz0-1 wires the
 *     dispose call into the reverse-allocation chain in scene/index.ts.
 */

import type { Scene } from 'three';
import type { DestructionDirectorHandle } from './types.js';

/**
 * Mount the destruction director onto an existing Three.js lobby scene.
 *
 * Phase 1 stub: returns a handle whose methods all throw "Phase 2B fills".
 * The function signature is locked here so scene/index.ts can type-check
 * its SceneHandle.destructionDirector field reference today.
 *
 * Phase 2B kraken-faz0-1 fills the body:
 *   - Subscribe bang-fired CustomEvent listener on `document`.
 *   - Install MutationObserver fallback on `.bang-overlay` class list.
 *   - Resolve OS + username promises eagerly so Faz 3 has them cached.
 *   - Step through the four Faz runners awaiting each.
 *   - Trigger ApartmentBleed at the timing milestones.
 *   - Wire ESC-hold subscription.
 *   - Provide `dispose()` chain.
 */
export function mountDestructionDirector(
  _scene: Scene,
): DestructionDirectorHandle {
  // Phase 2B kraken-faz0-1: fill the body. Return a real handle below.
  return {
    start: async (): Promise<void> => {
      throw new Error('destruction-director: Phase 2B kraken-faz0-1 fills start()');
    },
    abort: (_reason): void => {
      throw new Error('destruction-director: Phase 2B kraken-faz0-1 fills abort()');
    },
    dispose: (): void => {
      // No-op safe to call on the stub so Phase 1 scene dispose chain
      // does not throw when traversing the optional field. Phase 2B
      // replaces with real teardown.
    },
  };
}
