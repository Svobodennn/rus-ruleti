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
 * Sprint 8 Phase 1 — S11 closure prep:
 *   Frame logger now ALSO captures three Three.js + one Web Audio perf
 *   dimensions per frame, with a rolling 60-frame window tracking the MAX:
 *     - renderer.info.render.calls       → maxDrawCalls
 *     - renderer.info.memory.textures    → maxTextureCount (+ MB estimate)
 *     - renderer.info.memory.geometries  → maxGeometryCount
 *     - getActiveVoiceCount()             → maxAudioVoiceCount
 *   Each dimension is reported at the existing 5-second flush cadence.
 *   The capture is OPTIONAL — callers that omit `sceneStatsReader` ship
 *   the Sprint 7 payload shape (no Sprint 8 max* fields). Backward
 *   compat with packaged Sprint 7 builds preserved.
 *
 * Memory: one Float64Array of size FRAME_LOG_RING_SIZE (4.8KB) for frame
 * times + four 60-slot rolling buffers for the Sprint 8 perf samples
 * (~2KB combined). Negligible.
 *
 * Cost per frame: one array write + one mod for frame time. Sprint 8
 * adds one Three.js info read + one voice-count read + four buffer
 * writes — all O(1), stays well under the 16.67ms frame budget.
 */

import type { FrameStatsPayload } from '../../shared/api-types';
import {
  FRAME_LOG_FLUSH_INTERVAL_MS,
  FRAME_LOG_RING_SIZE,
  type QualityLevel,
} from '../../shared/scene-constants';

/**
 * Sprint 8 — per-frame perf snapshot read by the frame logger via the
 * optional `SceneStatsReader` callback. Each field is one of the four
 * Sprint 8 capture dimensions; the reader is the integration point so
 * the frame-logger module stays decoupled from Three.js + audio-voice-
 * counter (allowing unit-test substitution).
 */
export interface ScenePerfSample {
  /** `renderer.info.render.calls` — WebGL draw calls this frame. */
  readonly drawCalls: number;
  /** `renderer.info.memory.textures` — active Three.js texture count. */
  readonly textureCount: number;
  /** `renderer.info.memory.geometries` — active BufferGeometry count. */
  readonly geometryCount: number;
  /** `getActiveVoiceCount()` — active Web Audio voice count. */
  readonly audioVoiceCount: number;
}

/**
 * Sprint 8 — reader callback the frame-logger calls once per frame
 * inside `markFrame()`. Caller-supplied so frame-logger.ts has no
 * direct dependency on `three` or the audio-voice-counter module.
 *
 * O(1) by contract — reads are cheap property accesses (THREE.WebGL
 * Renderer.info exposes counters maintained by the renderer's own
 * draw pipeline; getActiveVoiceCount returns a module-local number).
 *
 * Return `undefined` for the frame if no sample is available (e.g.
 * scene not yet mounted) — the frame logger then SKIPS perf capture
 * for that frame without polluting the rolling-max.
 */
export type SceneStatsReader = () => ScenePerfSample | undefined;

/**
 * Sprint 8 — rolling window size for the perf-dimension max-trackers.
 * 60 frames ≈ 1 second at 60fps. The flush at 5sn reports the MAX
 * seen across the most recent 60-frame window (NOT across the full
 * 5sn flush window — a 1sn window captures the worst transient spike
 * without being dominated by post-transient steady state).
 */
const PERF_ROLLING_WINDOW_SIZE = 60;

/**
 * Sprint 8 — texture memory MB heuristic.
 *
 * Three.js exposes `renderer.info.memory.textures` as a COUNT not a
 * BYTE total. We estimate by assuming each texture is 1024² RGBA
 * (= 1024 × 1024 × 4 bytes ≈ 4 MiB). This MATCHES the methodology
 * documented at `MAX_TEXTURE_MEMORY_MB` in
 * `src/shared/scene-destruction-constants.ts`. Lane B Phase 2B
 * (@profiler) may revise this heuristic against actual GPU memory
 * readings — if the heuristic shifts, this constant + the
 * scene-destruction-constants.ts JSDoc MUST move together.
 */
const BYTES_PER_TEXTURE_ESTIMATE = 4 * 1024 * 1024; // 4 MiB ≈ 1024² RGBA

/** Latest computed summary, exposed via getFrameStats(). */
export interface FrameStats {
  readonly p50: number;
  readonly p95: number;
  readonly p99: number;
  readonly mean: number;
  readonly max: number;
  readonly sampleCount: number;
  /** Sprint 8 — max draw calls in the rolling 60-frame window, if captured. */
  readonly maxDrawCalls?: number;
  /** Sprint 8 — max active texture count, if captured. */
  readonly maxTextureCount?: number;
  /** Sprint 8 — max texture memory MB estimate, if captured. */
  readonly maxTextureMemoryEstimateMB?: number;
  /** Sprint 8 — max active geometry count, if captured. */
  readonly maxGeometryCount?: number;
  /** Sprint 8 — max active Web Audio voice count, if captured. */
  readonly maxAudioVoiceCount?: number;
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
 * Sprint 8 — internal mutable max-trackers for the four perf
 * dimensions. Wrapped in one object so the rolling window can be
 * managed without four sets of independent mutable variables (which
 * `prefer-const` would block).
 */
interface PerfMaxState {
  /** Cursor into the per-dimension ring buffers (mod PERF_ROLLING_WINDOW_SIZE). */
  cursor: number;
  /** Whether any sample has been recorded yet. */
  hasSample: boolean;
  drawCalls: Float64Array;
  textureCount: Float64Array;
  geometryCount: Float64Array;
  audioVoiceCount: Float64Array;
}

/**
 * Create a frame logger.
 *
 * The buffer is preallocated. Writes wrap. On every flush tick, we sort a
 * copy of the populated slice to compute percentiles. Sort cost is small
 * (~600 items) and runs once every 5 seconds, off the render path.
 *
 * Sprint 8 ADDITIVE parameter `sceneStatsReader` — caller-supplied
 * reader the logger calls inside markFrame() to capture the four
 * Sprint 8 perf dimensions. Omit (or pass `undefined`) to ship the
 * Sprint 7 payload shape without max* fields.
 */
export function createFrameLogger(
  qualityReader: QualityReader,
  sink: FrameStatsSink,
  sceneStatsReader?: SceneStatsReader,
): FrameLoggerHandle {
  const buffer = new Float64Array(FRAME_LOG_RING_SIZE);
  const perf = createPerfMaxState();
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
    capturePerfSampleIfReader(perf, sceneStatsReader);
  };

  const flush = (): void => {
    if (filledCount === 0) {
      return;
    }
    const stats = computeFlushStats(buffer, filledCount, perf);
    lastStats = stats;
    sink(buildPayload(stats, qualityReader()));
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
 * Allocate the Sprint 8 per-dimension rolling buffers. Float64Array is
 * used (not Uint32Array) so the perf state shares the same primitive
 * type as the frame-time buffer — keeps `computeMax` uniform.
 */
function createPerfMaxState(): PerfMaxState {
  return {
    cursor: 0,
    hasSample: false,
    drawCalls: new Float64Array(PERF_ROLLING_WINDOW_SIZE),
    textureCount: new Float64Array(PERF_ROLLING_WINDOW_SIZE),
    geometryCount: new Float64Array(PERF_ROLLING_WINDOW_SIZE),
    audioVoiceCount: new Float64Array(PERF_ROLLING_WINDOW_SIZE),
  };
}

/**
 * Capture a single perf sample from the reader (Sprint 8 only). If no
 * reader was supplied OR the reader returned undefined, no sample is
 * recorded for this frame (the rolling max stays unchanged).
 */
function capturePerfSampleIfReader(
  perf: PerfMaxState,
  sceneStatsReader: SceneStatsReader | undefined,
): void {
  if (sceneStatsReader === undefined) return;
  const sample = sceneStatsReader();
  if (sample === undefined) return;
  perf.drawCalls[perf.cursor] = sample.drawCalls;
  perf.textureCount[perf.cursor] = sample.textureCount;
  perf.geometryCount[perf.cursor] = sample.geometryCount;
  perf.audioVoiceCount[perf.cursor] = sample.audioVoiceCount;
  perf.cursor = (perf.cursor + 1) % PERF_ROLLING_WINDOW_SIZE;
  perf.hasSample = true;
}

/**
 * Compose the FrameStats result from the frame-time buffer + the
 * Sprint 8 rolling perf max-trackers (if any sample present).
 * Extracted so flush stays under the 50-line function ceiling.
 */
function computeFlushStats(
  buffer: Float64Array,
  filledCount: number,
  perf: PerfMaxState,
): FrameStats {
  const base = computeStats(buffer, filledCount);
  if (!perf.hasSample) return base;
  const maxDrawCalls = computeMax(perf.drawCalls);
  const maxTextureCount = computeMax(perf.textureCount);
  const maxGeometryCount = computeMax(perf.geometryCount);
  const maxAudioVoiceCount = computeMax(perf.audioVoiceCount);
  const maxTextureMemoryEstimateMB =
    (maxTextureCount * BYTES_PER_TEXTURE_ESTIMATE) / (1024 * 1024);
  return {
    ...base,
    maxDrawCalls,
    maxTextureCount,
    maxTextureMemoryEstimateMB,
    maxGeometryCount,
    maxAudioVoiceCount,
  };
}

/**
 * Build the IPC payload from a FrameStats summary + the current
 * quality tier. Sprint 8 max* fields are forwarded only if present
 * (matches the FrameStatsPayload optional-field contract).
 */
function buildPayload(
  stats: FrameStats,
  quality: QualityLevel,
): FrameStatsPayload {
  const payload: FrameStatsPayload = {
    p50: stats.p50,
    p95: stats.p95,
    p99: stats.p99,
    mean: stats.mean,
    max: stats.max,
    sampleCount: stats.sampleCount,
    quality,
  };
  // Spread Sprint 8 optional fields only if captured this flush.
  return mergeOptionalPerfFields(payload, stats);
}

/**
 * Merge Sprint 8 max* fields into the payload if the corresponding
 * FrameStats entries are present. Extracted so `buildPayload` stays
 * under the 50-line function ceiling. Returns a NEW payload object
 * (immutability — never mutates the input).
 *
 * Sprint 8 contract: all five max* fields are populated together
 * inside `computeFlushStats` when `perf.hasSample === true`, so a
 * defined `maxDrawCalls` implies the other four are also defined.
 * The undefined-coalesce guards (`?? 0`) satisfy strict
 * `exactOptionalPropertyTypes` without weakening the runtime path.
 */
function mergeOptionalPerfFields(
  base: FrameStatsPayload,
  stats: FrameStats,
): FrameStatsPayload {
  const maxDrawCalls = stats.maxDrawCalls;
  if (maxDrawCalls === undefined) return base;
  return {
    ...base,
    maxDrawCalls,
    maxTextureCount: stats.maxTextureCount ?? 0,
    maxTextureMemoryEstimateMB: stats.maxTextureMemoryEstimateMB ?? 0,
    maxGeometryCount: stats.maxGeometryCount ?? 0,
    maxAudioVoiceCount: stats.maxAudioVoiceCount ?? 0,
  };
}

/**
 * Pick the maximum value in a Float64Array (linear scan). Used for
 * the Sprint 8 rolling perf dimensions. Slots that have not yet been
 * written hold 0, which is fine — 0 is the natural lower bound for
 * draw calls / texture count / geometry count / voice count, so the
 * max never undershoots.
 */
function computeMax(arr: Float64Array): number {
  let max = 0;
  for (let i = 0; i < arr.length; i += 1) {
    const v = arr[i] as number;
    if (v > max) max = v;
  }
  return max;
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
