/**
 * Revolver subsystem — public mount API.
 *
 * Composes the FSM, RNG, input listener, mesh + animation, HUD, and the
 * side-effect ladder into a single `RevolverHandle` consumed by
 * `scene/index.ts`. Phase 2B kraken-revolver implementation; supersedes
 * the Phase 1 stub which only locked the shape.
 *
 * Public contract:
 *   - `mountRevolver(scene, room, hudContainer, locale, audioBed,
 *      lighting, camera, bangOverlay)` returns a `RevolverHandle`.
 *   - The handle's `dispose()` releases input listeners, animation mixer,
 *     HUD DOM, camera zoom RAF, audio one-shots, and removes the revolver
 *     Group from the scene graph + disposes geometries/materials.
 *   - `getEmptyClickCount()` exposes the lobby progression counter.
 *   - `getState()` returns the current FSM state.
 *
 * State ownership:
 *   - The pure FSM lives in `revolver-state.ts`. This module owns the
 *     **mutable** state holder (`{ value: RevolverState }`) and the
 *     empty-click counter. Counter increment happens at the FSM
 *     transition `firing(empty) → idle`.
 *   - Reveal-lite (6th empty) is a mount-layer decision; the FSM accepts
 *     a `revealLite` boolean flag from this module on `onAnimationComplete`.
 */

import type { Group, PerspectiveCamera, Scene } from 'three';
import type { AudioBedHandle } from '../audio/audio-bed';
import type { BulbLightHandle } from '../lighting';
import type { Locale } from '../../i18n/strings';
import type { LoadedModelHandle } from '../../loader';
import { mountHud, type HudHandle } from './hud/hud';
import { attachInput, type InputHandle } from './revolver-input';
import { mountRevolverMesh, type RevolverMeshHandle } from './revolver-mount';
import { mountRevolverMeshFromGlb } from './revolver-mount-glb';
import { pullTrigger } from './revolver-rng';
import {
  applyRevealLite,
  applyTransition,
  playFallAndOutcome,
  type EffectContext,
} from './revolver-effects';
import {
  onAnimationComplete,
  onMouseDown,
  onMouseUp,
  type RevolverState,
} from './revolver-state';
import { startSceneAnimationLoop, type AnimLoopHandle } from './revolver-loop';

/** Public handle returned from mountRevolver. */
export interface RevolverHandle {
  /** Tear down: remove from scene, dispose HUD, abort input listeners. */
  dispose: () => void;
  /** Empty-click counter — drives the progressive darkening curve. */
  getEmptyClickCount: () => number;
  /** Current FSM state. */
  getState: () => RevolverState;
}

/** Internal bag of allocated resources, scoped to disposeAll. */
interface RevolverResources {
  readonly scene: Scene;
  readonly mesh: RevolverMeshHandle;
  readonly hud: HudHandle;
  readonly input: InputHandle;
  readonly state: MutableFsmState;
  readonly effectCtx: EffectContext;
  readonly animLoop: AnimLoopHandle;
  /** Bang overlay element — cleared on dispose so HMR re-mounts start clean. */
  readonly bangOverlay: HTMLElement;
}

/** Mutable FSM state holder. The pure FSM is functions; this is the cell. */
interface MutableFsmState {
  value: RevolverState;
  emptyClicks: number;
}

/**
 * Mount the revolver subsystem.
 *
 * Args bag is kept compact — adds new optional params for Sprint 3 (e.g.
 * GLB loader callback) without breaking call sites.
 */
export function mountRevolver(
  scene: Scene,
  room: Group,
  hudContainer: HTMLElement,
  locale: Locale,
  audioBed: AudioBedHandle,
  lighting: BulbLightHandle,
  camera: PerspectiveCamera,
  bangOverlay: HTMLElement,
  revolverGlb: LoadedModelHandle | null = null,
): RevolverHandle {
  const args = {
    scene, room, hudContainer, locale, audioBed, lighting, camera, bangOverlay,
    revolverGlb,
  };
  const resources = allocateResources(args);
  resources.hud.setVisible(true);
  // Start idle bob so the revolver doesn't sit static at mount.
  void resources.effectCtx.anim.play('idle');
  // Phase 2B sanity: dev-mode 100-trial RNG fairness audit. Result is stashed
  // on `document.body.dataset['revolverRngSanity']` so DevTools and the
  // electron-log → renderer-error transport pick it up. Sprint 9 promotes
  // this to a vitest assertion.
  runRngSanityCheck();

  return {
    dispose: (): void => disposeRevolver(resources),
    getEmptyClickCount: (): number => resources.state.emptyClicks,
    getState: (): RevolverState => resources.state.value,
  };
}

/** 100-trial pullTrigger fairness audit; result on document.body.dataset. */
function runRngSanityCheck(): void {
  const TRIALS = 100;
  let bangs = 0;
  for (let i = 0; i < TRIALS; i += 1) {
    if (pullTrigger() === 'bang') bangs += 1;
  }
  // 1/6 = 16.67; ±10% tolerance: [12, 22].
  const expected = '16.67±10% [12,22]';
  document.body.dataset['revolverRngSanity'] =
    `bangs=${bangs}/${TRIALS} (expected ${expected})`;
}

/** Mount-args bundle. */
interface MountArgs {
  scene: Scene;
  room: Group;
  hudContainer: HTMLElement;
  locale: Locale;
  audioBed: AudioBedHandle;
  lighting: BulbLightHandle;
  camera: PerspectiveCamera;
  bangOverlay: HTMLElement;
  /**
   * Sprint 3 Phase 2B: a preloaded revolver GLB. If non-null, the mount
   * uses the GLB-based path; if null, falls back to the Sprint 2 primitive
   * rig (e.g. GLB load failed or diagnostic mode).
   */
  revolverGlb: LoadedModelHandle | null;
}

/**
 * Allocate every revolver-subsystem resource. Extracted from mountRevolver
 * so each function body stays under the 50-line ceiling.
 */
function allocateResources(args: MountArgs): RevolverResources {
  const mesh = args.revolverGlb !== null
    ? mountRevolverMeshFromGlb(args.room, args.revolverGlb)
    : mountRevolverMesh(args.room);
  args.scene.add(mesh.group);
  const hud = mountHud(args.hudContainer, args.locale);
  const state: MutableFsmState = {
    value: { kind: 'idle' },
    emptyClicks: 0,
  };

  const effectCtx: EffectContext = buildEffectContext(args, mesh, hud);
  const input = wireInput(args, state, effectCtx);
  const animLoop = startSceneAnimationLoop(effectCtx);
  return {
    scene: args.scene,
    mesh, hud, input, state, effectCtx, animLoop,
    bangOverlay: args.bangOverlay,
  };
}

/** Build the EffectContext bag passed to the side-effect ladder. */
function buildEffectContext(
  args: MountArgs,
  mesh: RevolverMeshHandle,
  hud: HudHandle,
): EffectContext {
  return {
    camera: args.camera,
    lighting: args.lighting,
    audio: args.audioBed,
    anim: mesh.animation,
    hud,
    bangOverlay: args.bangOverlay,
    ramps: { zoom: null, shake: null },
    holdStartMs: 0,
    spinPromise: null,
    tensionTimerId: null,
  };
}

/** Attach input listeners; wire mousedown/mouseup to FSM + side effects. */
function wireInput(
  _args: MountArgs,
  state: MutableFsmState,
  effectCtx: EffectContext,
): InputHandle {
  const onDown = (nowMs: number): void => {
    handleMouseDown(state, effectCtx, nowMs);
  };
  const onUp = (nowMs: number): void => {
    void handleMouseUp(state, effectCtx, nowMs);
  };
  return attachInput(document.body, onDown, onUp);
}

/** mousedown handler — step FSM + apply transition side effects. */
function handleMouseDown(
  state: MutableFsmState,
  ctx: EffectContext,
  nowMs: number,
): void {
  const prev = state.value;
  const next = onMouseDown(prev, nowMs);
  applyTransition(prev, next, ctx, nowMs);
  state.value = next;
}

/**
 * mouseup handler — step FSM + apply transition side effects. If the FSM
 * transitions into `spinning`, we await the spin/fall chain and then
 * advance through `firing → idle` (or `reveal-lite`) with the right
 * empty-click bookkeeping.
 */
async function handleMouseUp(
  state: MutableFsmState,
  ctx: EffectContext,
  nowMs: number,
): Promise<void> {
  const prev = state.value;
  const next = onMouseUp(prev, nowMs, pullTrigger);
  applyTransition(prev, next, ctx, nowMs);
  state.value = next;
  if (next.kind !== 'spinning') return;
  await runFiringSequence(state, ctx, next.rngOutcome);
}

/**
 * Drive the spinning → firing → idle (or reveal-lite) sequence. The mount
 * layer owns this chain because the empty-click counter advances here.
 */
async function runFiringSequence(
  state: MutableFsmState,
  ctx: EffectContext,
  outcome: 'empty' | 'bang',
): Promise<void> {
  // applyTransition stored the spin promise on the context.
  if (ctx.spinPromise !== null) {
    await ctx.spinPromise;
    ctx.spinPromise = null;
  }
  // FSM advances spinning → firing on spin-complete.
  const firing = onAnimationComplete(state.value, 'spin');
  state.value = firing;
  const willBeRevealLite = outcome === 'empty' && state.emptyClicks + 1 === 6;
  const nextEmpty = outcome === 'empty' ? state.emptyClicks + 1 : 0;
  await playFallAndOutcome(ctx, outcome, nextEmpty);
  if (outcome === 'empty') {
    state.emptyClicks = nextEmpty;
  }
  finalizeFiring(state, ctx, outcome, willBeRevealLite);
}

/** Advance through firing → idle (or reveal-lite) and surface side effects. */
function finalizeFiring(
  state: MutableFsmState,
  ctx: EffectContext,
  outcome: 'empty' | 'bang',
  revealLite: boolean,
): void {
  const nextAfterFall = onAnimationComplete(state.value, 'fall', revealLite);
  state.value = nextAfterFall;
  if (outcome === 'bang') {
    // Sprint 4: onAnimationComplete transitions firing(bang) →
    // destruction-active. The revolver FSM is now locked; destruction-
    // director (subscribed to the bang-fired CustomEvent emitted by
    // revolver-effects.triggerBangOverlay) owns the timeline from here.
    return;
  }
  if (revealLite) {
    applyRevealLite(ctx);
  }
}

/** Reverse-allocation disposal of revolver resources. */
function disposeRevolver(resources: RevolverResources): void {
  resources.animLoop.dispose();
  resources.input.dispose();
  // Cancel any in-flight camera zoom ramp.
  if (resources.effectCtx.ramps.zoom !== null) {
    resources.effectCtx.ramps.zoom();
    resources.effectCtx.ramps.zoom = null;
  }
  // Cancel any in-flight camera shake.
  if (resources.effectCtx.ramps.shake !== null) {
    resources.effectCtx.ramps.shake();
    resources.effectCtx.ramps.shake = null;
  }
  // Restore the bulb to baseline so a re-mount lands on a clean room.
  resources.effectCtx.lighting.setBaseIntensityFactor(1.0);
  // Clear bang overlay state so HMR re-mounts and "play again" flows start
  // with a clean overlay (MAJOR-B fix).
  resources.bangOverlay.classList.remove('is-fired');
  delete resources.bangOverlay.dataset['flashMs'];
  delete resources.bangOverlay.dataset['fadeMs'];
  resources.hud.dispose();
  resources.scene.remove(resources.mesh.group);
  resources.mesh.dispose();
}
