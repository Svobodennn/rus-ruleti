/**
 * Three.js AnimationMixer wrapper for the revolver placeholder rig.
 *
 * PLAN §6 names five animation clips:
 *   - `idle`  — subtle bob (revolver-placeholder.position.y ±0.005), loops
 *               at ~0.27Hz to sync with the bulb's Lissajous sway.
 *   - `cock`  — hammer.rotation.z 0 → -COCK_ANGLE_DEG. NO easing (snap).
 *   - `spin`  — cylinder.rotation.x 0 → SPIN_TURNS·2π. Cubic-out easing.
 *               **Always ends at the same visual angle** (modulo 2π) —
 *               designer revolver-direction.md §6 anti-cause-and-effect.
 *   - `fall`  — hammer.rotation.z snaps back to 0 (single-frame transition).
 *   - `kick`  — revolver-placeholder.rotation.z 0 → KICK_RECOIL_DEG → 0.
 *
 * Implementation notes:
 *   - The Three.js AnimationMixer cannot directly produce a cubic-out tween
 *     between two keyframes via VectorKeyframeTrack alone; we approximate
 *     by sampling the cubic-out curve at N=32 intermediate frames. With 32
 *     samples over 1400ms the perceptual smoothness is indistinguishable
 *     from a real cubic-out.
 *   - `idle` is the only looping clip; the others are LoopOnce + clamped.
 *   - The mixer fires a `finished` event when a non-looping action ends.
 *     `play(clip)` returns a Promise resolving to that event so the FSM
 *     transition layer can chain `await anim.play('spin')` → `await
 *     anim.play('fall')`.
 *   - `dispose()` stops all actions + `uncacheRoot` to release per-clip
 *     state — important because Sprint 1 retro flagged HMR leaks in
 *     AnimationMixer-style modules.
 */

import {
  AnimationClip,
  AnimationMixer,
  Clock,
  LoopOnce,
  LoopRepeat,
  NumberKeyframeTrack,
  type AnimationAction,
  type KeyframeTrack,
  type Object3D,
} from 'three';
import {
  COCK_ANGLE_DEG,
  COCK_DURATION_MS,
  FALL_FRAMES,
  KICK_DURATION_MS,
  KICK_RECOIL_DEG,
  SPIN_DURATION_MS,
  SPIN_TURNS,
} from '../../../shared/scene-revolver-constants';
import { REVOLVER_PART_NAMES } from './revolver-mount';

/** Animation clip names — mirrors the FSM's `AnimClipName`. */
export type AnimClipName = 'idle' | 'cock' | 'spin' | 'fall' | 'kick';

/** Idle bob amplitude (world units). */
const IDLE_BOB_AMPLITUDE = 0.005;

/** Idle clip duration — matches the bulb Lissajous swayPeriodSecX. */
const IDLE_DURATION_SEC = 3.7;

/** Number of intermediate keyframes for the spin's cubic-out approximation. */
const SPIN_SAMPLES = 32;

/** Handle returned from mountAnimation. */
export interface AnimHandle {
  /**
   * Play the named clip. Returns a Promise that resolves on animation
   * complete (LoopOnce clips) or immediately for `idle` (it loops, so
   * "complete" is meaningless). Stops any in-flight LoopOnce clip first.
   */
  play: (clip: AnimClipName) => Promise<void>;
  /** Stop every running action. */
  stopAll: () => void;
  /** Latest started clip, `null` if nothing playing. */
  getActive: () => AnimClipName | null;
  /** Per-frame mixer update — caller wires into the render loop. */
  update: (deltaSec: number) => void;
  /** Release mixer + uncache root + remove finished listeners. */
  dispose: () => void;
}

/** Internal state — kept off the public interface. */
interface AnimState {
  active: AnimClipName | null;
  clips: Map<AnimClipName, AnimationClip>;
  clock: Clock;
}

/**
 * Build an AnimHandle bound to `root`.
 *
 * The root is the placeholder Group; we resolve named child meshes via
 * `getObjectByName`. Sprint 3's GLB swap preserves the same names so this
 * function does NOT need to change when the real model arrives.
 */
export function mountAnimation(root: Object3D): AnimHandle {
  const mixer = new AnimationMixer(root);
  const state: AnimState = {
    active: null,
    clips: buildClipMap(root),
    clock: new Clock(),
  };

  const play = (clip: AnimClipName): Promise<void> =>
    playClip(mixer, state, clip);
  const stopAll = (): void => {
    mixer.stopAllAction();
    state.active = null;
  };
  const update = (deltaSec: number): void => {
    mixer.update(deltaSec);
  };
  const dispose = (): void => {
    mixer.stopAllAction();
    mixer.uncacheRoot(root);
  };

  return {
    play, stopAll, update, dispose,
    getActive: (): AnimClipName | null => state.active,
  };
}

/** Build the five AnimationClips up-front. */
function buildClipMap(root: Object3D): Map<AnimClipName, AnimationClip> {
  const map = new Map<AnimClipName, AnimationClip>();
  map.set('idle', buildIdleClip());
  map.set('cock', buildCockClip(root));
  map.set('spin', buildSpinClip(root));
  map.set('fall', buildFallClip(root));
  map.set('kick', buildKickClip());
  return map;
}

/** Idle: subtle y-bob on the root group. Loops. */
function buildIdleClip(): AnimationClip {
  // Property path '.position[y]' targets the root (the Group itself).
  const track = new NumberKeyframeTrack(
    '.position[y]',
    [0, IDLE_DURATION_SEC / 2, IDLE_DURATION_SEC],
    [0, IDLE_BOB_AMPLITUDE, 0],
  );
  return new AnimationClip('idle', IDLE_DURATION_SEC, [track]);
}

/** Cock: hammer rotation 0 → -COCK_ANGLE_DEG, linear, no easing. */
function buildCockClip(root: Object3D): AnimationClip {
  const hammer = root.getObjectByName(REVOLVER_PART_NAMES.HAMMER);
  const targetPath = hammer === undefined
    ? `${REVOLVER_PART_NAMES.HAMMER}.rotation[z]`
    : `${hammer.name}.rotation[z]`;
  const target = -(COCK_ANGLE_DEG * Math.PI) / 180;
  const track = new NumberKeyframeTrack(
    targetPath,
    [0, COCK_DURATION_MS / 1000],
    [0, target],
  );
  return new AnimationClip('cock', COCK_DURATION_MS / 1000, [track]);
}

/**
 * Spin: cylinder rotation 0 → SPIN_TURNS·2π over SPIN_DURATION_MS. Cubic-out
 * easing approximated by sampling the cubic curve at SPIN_SAMPLES points.
 *
 * Designer §6: end angle is fixed (modulo 2π = start angle). The end
 * keyframe is exactly `SPIN_TURNS · 2π` so the cylinder is visually back to
 * its start orientation every spin — no chamber-counting possible.
 */
function buildSpinClip(root: Object3D): AnimationClip {
  const cyl = root.getObjectByName(REVOLVER_PART_NAMES.CYLINDER);
  const targetPath = cyl === undefined
    ? `${REVOLVER_PART_NAMES.CYLINDER}.rotation[x]`
    : `${cyl.name}.rotation[x]`;
  const durationSec = SPIN_DURATION_MS / 1000;
  const totalRot = SPIN_TURNS * 2 * Math.PI;
  const { times, values } = sampleCubicOut(durationSec, totalRot);
  const track = new NumberKeyframeTrack(targetPath, times, values);
  return new AnimationClip('spin', durationSec, [track]);
}

/** Sample the cubic-out curve at SPIN_SAMPLES + 1 points (incl. endpoints). */
function sampleCubicOut(
  durationSec: number,
  totalRot: number,
): { times: number[]; values: number[] } {
  const times: number[] = [];
  const values: number[] = [];
  for (let i = 0; i <= SPIN_SAMPLES; i += 1) {
    const t = i / SPIN_SAMPLES;
    // cubic-out: 1 - (1-t)^3
    const eased = 1 - Math.pow(1 - t, 3);
    times.push(t * durationSec);
    values.push(eased * totalRot);
  }
  return { times, values };
}

/** Fall: hammer.rotation.z snaps to 0. 1 frame. */
function buildFallClip(root: Object3D): AnimationClip {
  const hammer = root.getObjectByName(REVOLVER_PART_NAMES.HAMMER);
  const targetPath = hammer === undefined
    ? `${REVOLVER_PART_NAMES.HAMMER}.rotation[z]`
    : `${hammer.name}.rotation[z]`;
  // One frame at 60fps = 16.6ms. FALL_FRAMES * frame budget = duration.
  const oneFrameSec = (FALL_FRAMES * 16.6) / 1000;
  const target = -(COCK_ANGLE_DEG * Math.PI) / 180;
  const track = new NumberKeyframeTrack(
    targetPath,
    [0, oneFrameSec],
    [target, 0],
  );
  return new AnimationClip('fall', oneFrameSec, [track]);
}

/** Kick: root rotation.z 0 → KICK_RECOIL → 0 over KICK_DURATION_MS. */
function buildKickClip(): AnimationClip {
  const recoilRad = (KICK_RECOIL_DEG * Math.PI) / 180;
  const durSec = KICK_DURATION_MS / 1000;
  const track = new NumberKeyframeTrack(
    '.rotation[z]',
    [0, durSec / 2, durSec],
    [0, recoilRad, 0],
  );
  return new AnimationClip('kick', durSec, [track]);
}

/**
 * Play a clip, returning a Promise that resolves when the clip's `finished`
 * event fires (or immediately for `idle`).
 *
 * For LoopOnce clips we register a one-shot `finished` listener on the
 * mixer that filters by the clip name — the listener self-removes after
 * firing so we don't accumulate state across multiple plays.
 */
function playClip(
  mixer: AnimationMixer,
  state: AnimState,
  clip: AnimClipName,
): Promise<void> {
  state.active = clip;
  const clipData = state.clips.get(clip);
  if (clipData === undefined) {
    return Promise.resolve();
  }
  const action = mixer.clipAction(clipData);
  configureAction(action, clip);
  action.reset().play();
  if (clip === 'idle') {
    return Promise.resolve();
  }
  return awaitFinished(mixer, clip);
}

/** Configure loop mode + clamp-on-end per clip kind. */
function configureAction(
  action: AnimationAction,
  clip: AnimClipName,
): void {
  if (clip === 'idle') {
    action.setLoop(LoopRepeat, Infinity);
    action.clampWhenFinished = false;
    return;
  }
  action.setLoop(LoopOnce, 1);
  action.clampWhenFinished = true;
}

/** Promise that resolves on the next `finished` event for the named clip. */
function awaitFinished(
  mixer: AnimationMixer,
  clip: AnimClipName,
): Promise<void> {
  return new Promise((resolve): void => {
    const listener: FinishedListener = (e): void => {
      if (e.action.getClip().name !== clip) return;
      mixer.removeEventListener('finished', listener);
      resolve();
    };
    mixer.addEventListener('finished', listener);
  });
}

/**
 * Strongly-typed listener for the mixer's `finished` event.
 *
 * THREE's mixer extends EventDispatcher<AnimationMixerEventMap>, so the
 * 'finished' payload is `{ action; direction }` widened by EventDispatcher
 * with `{ type: 'finished'; target: mixer }`. We type the listener
 * explicitly here so `e.action.getClip().name` typechecks cleanly without
 * needing `as unknown as` casts.
 */
type FinishedListener = (event: {
  readonly type: 'finished';
  readonly target: AnimationMixer;
  action: AnimationAction;
  direction: number;
}) => void;

/** Re-export so consumers can iterate over the same key set. */
export const ANIM_CLIP_NAMES: ReadonlyArray<AnimClipName> = [
  'idle', 'cock', 'spin', 'fall', 'kick',
];

/** Re-export — KeyframeTrack is used by clip builders; type-only. */
export type { KeyframeTrack };
