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
  let current: QualityLevel = getBuildQualityLevel();
  const listeners = new Set<QualityChangeListener>();
  let framesSinceCheck = 0;
  let framesSinceLastChange = Number.POSITIVE_INFINITY;

  const tick = (): void => {
    framesSinceCheck += 1;
    framesSinceLastChange += 1;
    if (framesSinceCheck < AUTO_PROMOTE_SAMPLE_SIZE) {
      return;
    }
    framesSinceCheck = 0;
    evaluate();
  };

  const evaluate = (): void => {
    if (framesSinceLastChange < AUTO_PROMOTE_SAMPLE_SIZE * 2) {
      return;
    }
    const stats = frameLogger.getFrameStats();
    if (stats === undefined) {
      return;
    }
    if (
      stats.p95 < AUTO_PROMOTE_THRESHOLD_MS &&
      current !== 'high'
    ) {
      transition(stepUp(current), 'promote', stats.p95);
      return;
    }
    if (stats.p95 > AUTO_DEMOTE_THRESHOLD_MS && current !== 'low') {
      transition(stepDown(current), 'demote', stats.p95);
    }
  };

  const transition = (
    next: QualityLevel,
    reason: 'promote' | 'demote',
    p95: number,
  ): void => {
    const prev = current;
    current = next;
    framesSinceLastChange = 0;
    logger.info(
      `quality level: ${prev} → ${next} (${reason}, 95p=${p95.toFixed(1)}ms)`,
    );
    for (const listener of listeners) {
      listener(next, prev, reason);
    }
  };

  return {
    getQualityLevel: (): QualityLevel => current,
    tick,
    onQualityChange: (listener: QualityChangeListener): (() => void) => {
      listeners.add(listener);
      return (): void => {
        listeners.delete(listener);
      };
    },
    dispose: (): void => {
      listeners.clear();
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
