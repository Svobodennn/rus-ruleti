/**
 * Side-effect ladder for revolver FSM transitions.
 *
 * The pure FSM (`revolver-state.ts`) returns the next state. This module
 * owns the side effects keyed off the (prev, next) transition pair:
 *
 *   idle           → cocking         : start cock anim + hold-state ramp
 *   cocking        → idle (early)    : reverse ramps 2x + "early-release" msg
 *   cocking        → idle (late)     : reverse ramps 2x + spring-back
 *   cocking        → spinning        : play spin anim
 *   spinning       → firing(empty)   : play fall + empty cue + lighting flicker
 *                                       + darken curve + audio progression
 *   spinning       → firing(bang)    : play fall + kick + bang overlay + msg
 *   firing(empty)  → idle | reveal-lite : counter advance handled by mount layer
 *
 * The mount layer (`revolver/index.ts`) calls `applyTransition(prev, next,
 * ctx)` after each FSM step. Counter increment + reveal-lite gate live in
 * the mount layer because they depend on cross-transition state the FSM
 * does not track.
 */

import type { PerspectiveCamera } from 'three';
import {
  BANG_FADE_TO_BLACK_MS,
  BANG_FLASH_DURATION_MS,
  DARKEN_CURVE_PER_CLICK,
  EARLY_RELEASE_MESSAGE_DURATION_MS,
  EARLY_RELEASE_MS,
  EMPTY_CLICK_CHAIR_CREAK_THRESHOLD,
  EMPTY_CLICK_FLICKER_MS,
  EMPTY_CLICK_HEARTBEAT_THRESHOLD,
  EMPTY_CLICK_SWEAT_THRESHOLD,
  HOLD_BREATH_GAIN_DB,
  HOLD_BULB_HUM_GAIN_DB,
  HOLD_ZOOM_DURATION_MS,
  HOLD_ZOOM_FACTOR,
  KICK_CAMERA_SHAKE_DEG,
  KICK_CAMERA_SHAKE_DURATION_MS,
  SPRING_BACK_MS,
} from '../../../shared/scene-revolver-constants';
import { CAMERA } from '../../../shared/scene-constants';
import type { AudioBedHandle } from '../audio/audio-bed';
import type { BulbLightHandle } from '../lighting';
import { startCameraZoom, triggerCameraShake } from '../camera';
import type { AnimHandle } from './revolver-anim';
import type { HudHandle } from './hud/hud';
import type { RevolverState } from './revolver-state';

/** Bag of side-effect handles + mutable RAF disposers. */
export interface EffectContext {
  readonly camera: PerspectiveCamera;
  readonly lighting: BulbLightHandle;
  readonly audio: AudioBedHandle;
  readonly anim: AnimHandle;
  readonly hud: HudHandle;
  readonly bangOverlay: HTMLElement;
  /** Mutable RAF disposers — owned by mount layer, mutated here on ramps. */
  ramps: { zoom: (() => void) | null };
  /** Cock animation timestamp; used to compute released-held ms. */
  holdStartMs: number;
  /**
   * Promise for the in-flight spin clip — populated by applyTransition on
   * cocking → spinning so the mount layer can await it without re-invoking
   * `anim.play('spin')`. `null` outside the spinning state.
   */
  spinPromise: Promise<void> | null;
}

/**
 * Dispatch side effects for a transition. Returns the new context (the
 * old one is mutated; we return for callers that want to chain).
 */
export function applyTransition(
  prev: RevolverState,
  next: RevolverState,
  ctx: EffectContext,
  nowMs: number,
): EffectContext {
  if (prev.kind === 'idle' && next.kind === 'cocking') {
    onIdleToCocking(ctx, nowMs);
  } else if (prev.kind === 'cocking' && next.kind === 'idle') {
    onCockingToIdle(prev, ctx, nowMs);
  } else if (prev.kind === 'cocking' && next.kind === 'spinning') {
    onCockingToSpinning(ctx);
  }
  return ctx;
}

/** Side effects for idle → cocking. Start cock anim + hold ramp. */
function onIdleToCocking(ctx: EffectContext, nowMs: number): void {
  ctx.holdStartMs = nowMs;
  void ctx.anim.play('cock');
  ctx.audio.playCockSound();
  startHoldRamps(ctx);
}

/** Start the three hold-state ramps (camera zoom, breath, bulb hum). */
function startHoldRamps(ctx: EffectContext): void {
  const targetFov = CAMERA.fovDeg / HOLD_ZOOM_FACTOR;
  ctx.ramps.zoom = startCameraZoom(
    ctx.camera, targetFov, HOLD_ZOOM_DURATION_MS,
  );
  // Designer §3: breath +6dB and bulb-hum +3dB linear over 900ms.
  const breathTarget = dbToFraction(HOLD_BREATH_GAIN_DB);
  ctx.audio.fadeBreathInOut(breathTarget, HOLD_ZOOM_DURATION_MS);
  ctx.audio.bumpBulbHum(HOLD_BULB_HUM_GAIN_DB, HOLD_ZOOM_DURATION_MS);
}

/**
 * Side effects for cocking → idle. Two branches:
 *   - heldMs < EARLY_RELEASE_MS → show "early-release" message.
 *   - heldMs ≥ EARLY_RELEASE_MS → silent spring-back.
 * Both reverse the hold ramps at 2× speed.
 */
function onCockingToIdle(
  prev: Extract<RevolverState, { kind: 'cocking' }>,
  ctx: EffectContext,
  nowMs: number,
): void {
  reverseHoldRamps(ctx);
  // Spring-back: the `fall` clip snaps the hammer rotation back to 0 over
  // SPRING_BACK_MS. AnimationMixer reverse-play would be cleaner but the
  // fall clip is already a 1-frame snap so it reads identical.
  void ctx.anim.play('fall');
  const heldMs = nowMs - prev.holdStartMs;
  if (heldMs < EARLY_RELEASE_MS) {
    ctx.hud.messages.show('early-release', EARLY_RELEASE_MESSAGE_DURATION_MS);
  }
}

/** Reverse the three hold ramps at 2× speed. */
function reverseHoldRamps(ctx: EffectContext): void {
  if (ctx.ramps.zoom !== null) {
    ctx.ramps.zoom();
    ctx.ramps.zoom = null;
  }
  ctx.ramps.zoom = startCameraZoom(
    ctx.camera, CAMERA.fovDeg, SPRING_BACK_MS,
  );
  ctx.audio.fadeBreathInOut(0, SPRING_BACK_MS);
  ctx.audio.bumpBulbHum(0, SPRING_BACK_MS);
}

/** Side effects for cocking → spinning. Play spin anim, store promise. */
function onCockingToSpinning(ctx: EffectContext): void {
  ctx.spinPromise = ctx.anim.play('spin');
}

/**
 * Play the fall clip and dispatch outcome-specific side effects. Returns a
 * promise the mount layer awaits before advancing the FSM.
 */
export async function playFallAndOutcome(
  ctx: EffectContext,
  outcome: 'empty' | 'bang',
  emptyClicksAfter: number,
): Promise<void> {
  await ctx.anim.play('fall');
  if (outcome === 'bang') {
    await playBangSequence(ctx);
  } else {
    playEmptySequence(ctx, emptyClicksAfter);
  }
}

/** Bang sequence — kick, camera shake, overlay flash + fade. */
async function playBangSequence(ctx: EffectContext): Promise<void> {
  ctx.audio.playBangSound();
  ctx.hud.messages.show('bang');
  triggerCameraShake(
    ctx.camera, KICK_CAMERA_SHAKE_DEG, KICK_CAMERA_SHAKE_DURATION_MS,
  );
  triggerBangOverlay(ctx.bangOverlay);
  await ctx.anim.play('kick');
}

/**
 * Add `.is-fired` class to the bang overlay. The CSS keyframes that drive
 * the flash + fade-to-black are defined by frontend-dev in `styles/hud.css`
 * (Phase 2B parallel). This module is the trigger only.
 *
 * Coordination contract: kraken-revolver TOGGLES `.is-fired`. frontend-dev
 * defines `.bang-overlay.is-fired .bang-flash { animation: ... }` and
 * `.bang-overlay.is-fired .bang-black { animation: ... }`. Durations come
 * from BANG_FLASH_DURATION_MS / BANG_FADE_TO_BLACK_MS in the SSOT.
 */
function triggerBangOverlay(overlay: HTMLElement): void {
  overlay.classList.add('is-fired');
  // Stash durations in dataset so frontend-dev's CSS can use them via JS
  // pickup or animation-duration variables. Defensive — frontend-dev may
  // alternatively read SSOT constants from a TS module via custom prop.
  overlay.dataset['flashMs'] = String(BANG_FLASH_DURATION_MS);
  overlay.dataset['fadeMs'] = String(BANG_FADE_TO_BLACK_MS);
}

/** Empty sequence — flicker bulb, darken, increment cues, update counter. */
function playEmptySequence(ctx: EffectContext, emptyClicksAfter: number): void {
  ctx.audio.playEmptyClickSound();
  ctx.lighting.triggerFlicker(EMPTY_CLICK_FLICKER_MS);
  applyDarkenCurve(ctx, emptyClicksAfter);
  playProgressionCues(ctx, emptyClicksAfter);
  ctx.hud.counter.update(emptyClicksAfter);
  // Reverse the hold ramps once the empty click resolves (the mount layer
  // does NOT call onCockingToIdle for the spinning→firing path).
  reverseHoldRamps(ctx);
}

/** Look up DARKEN_CURVE[click] and apply to the bulb. */
function applyDarkenCurve(ctx: EffectContext, click: number): void {
  const clamped = Math.min(click, DARKEN_CURVE_PER_CLICK.length - 1);
  const factor = DARKEN_CURVE_PER_CLICK[clamped] ?? 1.0;
  ctx.lighting.setBaseIntensityFactor(factor);
}

/** Empty-click ≥3 → heartbeat, ≥4 → sweat drip, ≥5 → chair creak. */
function playProgressionCues(ctx: EffectContext, click: number): void {
  if (click >= EMPTY_CLICK_HEARTBEAT_THRESHOLD) {
    ctx.audio.playHeartbeat();
  }
  if (click === EMPTY_CLICK_SWEAT_THRESHOLD) {
    ctx.audio.playSweatDrip();
  }
  if (click === EMPTY_CLICK_CHAIR_CREAK_THRESHOLD) {
    ctx.audio.playChairCreak();
  }
}

/**
 * Reveal-lite side effects (6th empty). Show the reveal-lite message;
 * lighting at click 6 is the absence of flicker — designer §4 explicitly
 * forbids the click-6 flicker.
 */
export function applyRevealLite(ctx: EffectContext): void {
  ctx.hud.messages.show('reveal-lite');
}

/**
 * Convert a dB gain bump (above the breath baseline of -18dB) into a linear
 * amplitude. Designer §3: baseline -18dB, peak +6dB → effective -12dB.
 * 10^(-18/20) ≈ 0.126; +6dB doubles to ≈ 0.251.
 */
function dbToFraction(db: number): number {
  const BREATH_BASELINE_DB = -18;
  return Math.pow(10, (BREATH_BASELINE_DB + db) / 20);
}
