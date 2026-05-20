/**
 * Three.js AnimationMixer wrapper — Phase 1 STUB.
 *
 * PLAN §6 names five animation clips:
 *   - `idle`  — subtle bob, bulb-sync.
 *   - `cock`  — 30° hammer-back, snap.
 *   - `spin`  — 4-turn cylinder, ease-out, NO motion blur (CRT trail instead).
 *   - `fall`  — 1-frame hammer drop.
 *   - `kick`  — recoil + flash + camera shake.
 *
 * Phase 1: the mount layer creates a placeholder Group (no animations
 * authored), so this wrapper is a typed shell. Phase 2 kraken-revolver
 * fills in: instantiate AnimationMixer, accept clip → AnimationAction
 * registration, wire mixer.update() into the render loop, expose
 * `finished` events (via mixer.addEventListener) so the FSM can advance.
 *
 * The signature is fixed Phase 1 so other Phase 2 work (FSM, input,
 * mount-layer counter) can typecheck against it.
 */

import type { Object3D } from 'three';

/** Animation clip names — mirrors the FSM's `AnimClipName`. */
export type AnimClipName = 'idle' | 'cock' | 'spin' | 'fall' | 'kick';

/** Handle returned from mountAnimation. */
export interface AnimHandle {
  /** Play the named clip. No-op in Phase 1. */
  play: (clip: AnimClipName) => void;
  /** Stop every running clip. */
  stopAll: () => void;
  /** Release mixer + dispose any per-clip resources. */
  dispose: () => void;
  /** Latest started clip, `null` if nothing playing. */
  getActive: () => AnimClipName | null;
}

/**
 * Build an animation handle bound to `mesh`.
 *
 * Phase 1 stub: returns no-op functions. `mesh` is accepted (rather than
 * an AnimationMixer) so Phase 2 can construct the mixer here without
 * forcing the mount layer to know mixer internals.
 *
 * The `_mesh` rename is the eslint-friendly unused-arg pattern (lint config
 * `argsIgnorePattern: '^_'`).
 */
export function mountAnimation(_mesh: Object3D): AnimHandle {
  // Phase 2 kraken-revolver replaces this with a real AnimationMixer.
  // Keeping the closure shape minimal so the diff is obvious in Phase 2 PRs.
  return {
    play: (): void => undefined,
    stopAll: (): void => undefined,
    dispose: (): void => undefined,
    getActive: (): AnimClipName | null => null,
  };
}
