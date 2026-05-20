/**
 * Quality-tier resolver + runtime promote/demote logic.
 *
 * Build-time:
 *   getBuildQualityLevel() reads the Vite-injected `__VITE_QUALITY_LEVEL__`
 *   identifier. If the identifier is missing (running outside Vite, e.g. a
 *   unit test runner) we fall back to DEFAULT_QUALITY_LEVEL.
 *
 * Runtime:
 *   createQualityController() owns the current tier. Every
 *   AUTO_PROMOTE_SAMPLE_SIZE frames it inspects the latest frame-logger
 *   stats. If 95p < AUTO_PROMOTE_THRESHOLD_MS, promote one tier (capped at
 *   'high'). If 95p > AUTO_DEMOTE_THRESHOLD_MS, demote one tier (floor
 *   'low'). Hysteresis: at most one transition per 2 * sample-size frames.
 *
 * Phase 2 shader/post-fx code subscribes via onQualityChange to react
 * (e.g. disable a render pass when demoted to 'low').
 */

import {
  AUTO_DEMOTE_THRESHOLD_MS,
  AUTO_PROMOTE_SAMPLE_SIZE,
  AUTO_PROMOTE_THRESHOLD_MS,
  DEFAULT_QUALITY_LEVEL,
  QUALITY_LEVELS,
  type QualityLevel,
} from '../../shared/scene-constants';
import type { FrameLoggerHandle } from './frame-logger';

/** Vite static-replaces this identifier with a JSON-stringified tier. */
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __VITE_QUALITY_LEVEL__: QualityLevel | undefined;

/**
 * Resolve the build-time quality tier.
 *
 * The identifier is rewritten to a string literal by Vite at build time (see
 * `electron.vite.config.ts` `define`). In environments without Vite the
 * identifier is undefined and we use the SSOT default. The typeof guard
 * keeps TypeScript happy when the identifier is not declared at all.
 */
export function getBuildQualityLevel(): QualityLevel {
  if (typeof __VITE_QUALITY_LEVEL__ === 'undefined') {
    return DEFAULT_QUALITY_LEVEL;
  }
  return __VITE_QUALITY_LEVEL__;
}

/** Callback invoked when the active quality tier changes. */
export type QualityChangeListener = (
  next: QualityLevel,
  prev: QualityLevel,
  reason: 'promote' | 'demote',
) => void;

/** Console-like logger so we can route to electron-log via injection. */
export interface QualityLogger {
  info: (message: string) => void;
}

/** Public handle returned from createQualityController. */
export interface QualityControllerHandle {
  /** The current runtime tier. */
  getQualityLevel: () => QualityLevel;
  /**
   * Drive the controller one frame forward. Cheap — increments a counter
   * and only runs the promote/demote check at sample-size boundaries.
   */
  tick: () => void;
  /** Subscribe to tier changes. Returns an unsubscribe fn. */
  onQualityChange: (listener: QualityChangeListener) => () => void;
  /** Stop accepting ticks and clear listeners. */
  dispose: () => void;
}

/** Mutable controller state shared across tick/evaluate/transition helpers. */
interface ControllerState {
  current: QualityLevel;
  listeners: Set<QualityChangeListener>;
  framesSinceCheck: number;
  framesSinceLastChange: number;
}

/**
 * Advance the controller by one frame.
 * Increments counters and triggers evaluate at each sample-size boundary.
 */
function tickController(
  state: ControllerState,
  frameLogger: FrameLoggerHandle,
  logger: QualityLogger,
): void {
  state.framesSinceCheck += 1;
  state.framesSinceLastChange += 1;
  if (state.framesSinceCheck < AUTO_PROMOTE_SAMPLE_SIZE) {
    return;
  }
  state.framesSinceCheck = 0;
  evaluateController(state, frameLogger, logger);
}

/**
 * Check frame stats and promote/demote if thresholds are met.
 * Hysteresis: skips if fewer than 2×sample-size frames since last transition.
 */
function evaluateController(
  state: ControllerState,
  frameLogger: FrameLoggerHandle,
  logger: QualityLogger,
): void {
  if (state.framesSinceLastChange < AUTO_PROMOTE_SAMPLE_SIZE * 2) {
    return;
  }
  const stats = frameLogger.getFrameStats();
  if (stats === undefined) {
    return;
  }
  if (stats.p95 < AUTO_PROMOTE_THRESHOLD_MS && state.current !== 'high') {
    transitionController(state, stepUp(state.current), 'promote', stats.p95, logger);
    return;
  }
  if (stats.p95 > AUTO_DEMOTE_THRESHOLD_MS && state.current !== 'low') {
    transitionController(state, stepDown(state.current), 'demote', stats.p95, logger);
  }
}

/**
 * Apply a quality tier transition, reset hysteresis counter, and notify listeners.
 */
function transitionController(
  state: ControllerState,
  next: QualityLevel,
  reason: 'promote' | 'demote',
  p95: number,
  logger: QualityLogger,
): void {
  const prev = state.current;
  state.current = next;
  state.framesSinceLastChange = 0;
  logger.info(
    `quality level: ${prev} → ${next} (${reason}, 95p=${p95.toFixed(1)}ms)`,
  );
  for (const listener of state.listeners) {
    listener(next, prev, reason);
  }
}

/**
 * Create the quality controller.
 *
 * Hysteresis is implemented by tracking `framesSinceLastChange`. We refuse
 * to promote/demote again until at least 2 * AUTO_PROMOTE_SAMPLE_SIZE
 * frames have elapsed since the last transition (~4 seconds at 60fps).
 * Without this, a borderline-95p value would flap between two tiers.
 */
export function createQualityController(
  frameLogger: FrameLoggerHandle,
  logger: QualityLogger,
): QualityControllerHandle {
  const state: ControllerState = {
    current: getBuildQualityLevel(),
    listeners: new Set<QualityChangeListener>(),
    framesSinceCheck: 0,
    framesSinceLastChange: Number.POSITIVE_INFINITY,
  };

  return {
    getQualityLevel: (): QualityLevel => state.current,
    tick: (): void => tickController(state, frameLogger, logger),
    onQualityChange: (listener: QualityChangeListener): (() => void) => {
      state.listeners.add(listener);
      return (): void => {
        state.listeners.delete(listener);
      };
    },
    dispose: (): void => {
      state.listeners.clear();
    },
  };
}

/** Move one tier up. Saturates at 'high'. */
function stepUp(level: QualityLevel): QualityLevel {
  const idx = QUALITY_LEVELS.indexOf(level);
  const next = QUALITY_LEVELS[Math.min(idx + 1, QUALITY_LEVELS.length - 1)];
  return next ?? level;
}

/** Move one tier down. Saturates at 'low'. */
function stepDown(level: QualityLevel): QualityLevel {
  const idx = QUALITY_LEVELS.indexOf(level);
  const next = QUALITY_LEVELS[Math.max(idx - 1, 0)];
  return next ?? level;
}
