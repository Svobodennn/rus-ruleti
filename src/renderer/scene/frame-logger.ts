/**
 * Frame-time ring buffer + periodic IPC flush.
 *
 * S1 risk mitigation (PLAN §12): PS1 shader stack risks dropping below 60fps
 * on low-end hardware. We need real telemetry from packaged builds to know
 * when to auto-demote. This module accumulates per-frame ms durations in a
 * fixed-size ring buffer, computes p50/p95/p99/mean/max on flush, and ships
 * the summary to main via IPC `frame:stats` (electron-log persists it to
 * `~/Library/Logs/Rus Ruleti/main.log`).
 *
 * Memory: one Float64Array of size FRAME_LOG_RING_SIZE (4.8KB). Negligible.
 *
 * Cost per frame: one array write + one mod. The percentile computation is
 * deferred to flush time so the render loop stays at O(1).
 */

import type { FrameStatsPayload } from '../../shared/api-types';
import {
  FRAME_LOG_FLUSH_INTERVAL_MS,
  FRAME_LOG_RING_SIZE,
  type QualityLevel,
} from '../../shared/scene-constants';

/** Latest computed summary, exposed via getFrameStats(). */
export interface FrameStats {
  readonly p50: number;
  readonly p95: number;
  readonly p99: number;
  readonly mean: number;
  readonly max: number;
  readonly sampleCount: number;
}

/** Public handle returned from createFrameLogger. */
export interface FrameLoggerHandle {
  /** Record one frame duration in ms. Cheap — single ring write. */
  markFrame: (deltaMs: number) => void;
  /** Returns the last computed stats; undefined if no flush yet. */
  getFrameStats: () => FrameStats | undefined;
  /** Stop the periodic flush and release listeners. */
  dispose: () => void;
}

/** Function the frame-logger uses to read current runtime quality at flush time. */
export type QualityReader = () => QualityLevel;

/** IPC bridge — main process logs payload via electron-log. */
export type FrameStatsSink = (payload: FrameStatsPayload) => void;

/**
 * Create a frame logger.
 *
 * The buffer is preallocated. Writes wrap. On every flush tick, we sort a
 * copy of the populated slice to compute percentiles. Sort cost is small
 * (~600 items) and runs once every 5 seconds, off the render path.
 */
export function createFrameLogger(
  qualityReader: QualityReader,
  sink: FrameStatsSink,
): FrameLoggerHandle {
  const buffer = new Float64Array(FRAME_LOG_RING_SIZE);
  let writeIndex = 0;
  let filledCount = 0;
  let lastStats: FrameStats | undefined;

  const markFrame = (deltaMs: number): void => {
    if (!Number.isFinite(deltaMs) || deltaMs < 0) {
      return;
    }
    buffer[writeIndex] = deltaMs;
    writeIndex = (writeIndex + 1) % FRAME_LOG_RING_SIZE;
    if (filledCount < FRAME_LOG_RING_SIZE) {
      filledCount += 1;
    }
  };

  const flush = (): void => {
    if (filledCount === 0) {
      return;
    }
    const stats = computeStats(buffer, filledCount);
    lastStats = stats;
    sink({
      p50: stats.p50,
      p95: stats.p95,
      p99: stats.p99,
      mean: stats.mean,
      max: stats.max,
      sampleCount: stats.sampleCount,
      quality: qualityReader(),
    });
  };

  const intervalId = window.setInterval(flush, FRAME_LOG_FLUSH_INTERVAL_MS);

  return {
    markFrame,
    getFrameStats: (): FrameStats | undefined => lastStats,
    dispose: (): void => {
      window.clearInterval(intervalId);
    },
  };
}

/**
 * Compute percentile stats from a populated buffer slice.
 *
 * Extracted for unit-testability and to keep createFrameLogger under the
 * 50-line function ceiling.
 */
function computeStats(buffer: Float64Array, populated: number): FrameStats {
  const slice = new Float64Array(populated);
  for (let i = 0; i < populated; i += 1) {
    slice[i] = buffer[i] as number;
  }
  slice.sort();
  let sum = 0;
  let max = 0;
  for (let i = 0; i < populated; i += 1) {
    const v = slice[i] as number;
    sum += v;
    if (v > max) {
      max = v;
    }
  }
  return {
    p50: percentile(slice, 0.5),
    p95: percentile(slice, 0.95),
    p99: percentile(slice, 0.99),
    mean: sum / populated,
    max,
    sampleCount: populated,
  };
}

/** Pick the value at the q-th quantile in a pre-sorted array. */
function percentile(sortedSlice: Float64Array, q: number): number {
  if (sortedSlice.length === 0) {
    return 0;
  }
  const indexFloat = q * (sortedSlice.length - 1);
  const lower = Math.floor(indexFloat);
  const upper = Math.ceil(indexFloat);
  const lowVal = sortedSlice[lower] ?? 0;
  if (lower === upper) {
    return lowVal;
  }
  const upVal = sortedSlice[upper] ?? lowVal;
  const t = indexFloat - lower;
  return lowVal * (1 - t) + upVal * t;
}
