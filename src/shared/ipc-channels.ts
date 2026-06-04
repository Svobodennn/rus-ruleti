/**
 * Whitelisted IPC channels.
 *
 * Single source of truth for the renderer <-> main bridge. Both sides MUST
 * import from here. No string literals scattered through the codebase.
 *
 * Rule: if a channel isn't in this list, ipcMain MUST NOT register a handler
 * for it. The preload contextBridge MUST NOT expose it. Audit enforced by
 * security-reviewer in Phase 3.
 *
 * Sprint 0 contract (per maestro directive + user prompt):
 *   - app:quit       renderer asks main to call app.quit()
 *   - os:get         renderer requests OS family ('mac' | 'win')
 *   - kiosk:toggle   debug/test channel for swift-expert Cmd+Q kiosk testing
 *
 * Sprint 1 additions:
 *   - frame:stats    renderer pushes rolling frame-time summary to main for
 *                    electron-log persistence (S1 risk telemetry).
 *
 * Sprint 4 additions:
 *   - os:get-username  renderer asks main for the OS user's login name
 *                      (os.userInfo().username, main-process side). Closes
 *                      PLAN §12 S2 risk (no hardcoded "USER" in Faz 3
 *                      terminal). Preload bridge exposes only the string —
 *                      no homedir, no hostname, no other os.userInfo fields.
 */

export const IPC_CHANNELS = {
  APP_QUIT: 'app:quit',
  OS_GET: 'os:get',
  KIOSK_TOGGLE: 'kiosk:toggle',
  FRAME_STATS: 'frame:stats',
  OS_GET_USERNAME: 'os:get-username',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

/** Allow-list used by both ipcMain registration and preload bridge. */
export const ALLOWED_IPC_CHANNELS: ReadonlyArray<IpcChannel> = [
  IPC_CHANNELS.APP_QUIT,
  IPC_CHANNELS.OS_GET,
  IPC_CHANNELS.KIOSK_TOGGLE,
  IPC_CHANNELS.FRAME_STATS,
  IPC_CHANNELS.OS_GET_USERNAME,
];

export type OsFamily = 'mac' | 'win';

/**
 * Payload shape for the frame:stats one-way channel.
 *
 * Renderer flushes one of these every FRAME_LOG_FLUSH_INTERVAL_MS. The
 * five p50/p95/p99 + mean/max + sampleCount + quality fields are the
 * Sprint 1 baseline (frame-time percentiles). The five max* perf
 * capture fields are
 * Sprint 8 ADDITIVE extensions for the S11 closure (Three.js + Web
 * Audio profiling). Every Sprint 8 field is OPTIONAL so a renderer
 * built without the Sprint 8 frame-logger extension still emits a
 * payload accepted by the main-process validator (additive contract —
 * backward compat with Sprint 7).
 *
 * Sprint 8 capture dimensions (sampled per frame inside the rolling
 * 60-frame window; reported as MAX per FRAME_LOG_FLUSH_INTERVAL_MS):
 *   - maxDrawCalls:                renderer.info.render.calls
 *   - maxTextureCount:             renderer.info.memory.textures
 *   - maxTextureMemoryEstimateMB:  textureCount × 4 MiB heuristic
 *                                  (assume 1024² RGBA average)
 *   - maxGeometryCount:            renderer.info.memory.geometries
 *   - maxAudioVoiceCount:          getActiveVoiceCount() from
 *                                  audio-voice-counter.ts
 *
 * Numbers are milliseconds (frame-time) / counts (perf) / megabytes
 * (texture estimate). `quality` reflects the active runtime tier
 * (which may differ from the build-time tier after promote/demote).
 */
export interface FrameStatsPayload {
  readonly p50: number;
  readonly p95: number;
  readonly p99: number;
  readonly mean: number;
  readonly max: number;
  readonly quality: 'low' | 'medium' | 'high';
  readonly sampleCount: number;
  /**
   * Sprint 8 — max `renderer.info.render.calls` seen in the rolling
   * 60-frame window. Optional (Sprint 7 builds omit this field).
   */
  readonly maxDrawCalls?: number;
  /**
   * Sprint 8 — max `renderer.info.memory.textures` (count of active
   * Three.js textures) seen in the rolling 60-frame window. Optional.
   */
  readonly maxTextureCount?: number;
  /**
   * Sprint 8 — texture memory ESTIMATE in megabytes. Three.js exposes
   * COUNT not BYTES; estimate = count × 4 MiB (1024² RGBA heuristic,
   * see MAX_TEXTURE_MEMORY_MB in scene-destruction-constants.ts).
   * Optional.
   */
  readonly maxTextureMemoryEstimateMB?: number;
  /**
   * Sprint 8 — max `renderer.info.memory.geometries` (count of active
   * Three.js BufferGeometry instances) seen in the rolling 60-frame
   * window. Optional.
   */
  readonly maxGeometryCount?: number;
  /**
   * Sprint 8 — max active Web Audio voice count (= count of
   * OscillatorNode + AudioBufferSourceNode actively scheduled between
   * start() and stop()/`ended`) seen across the flush window. Sourced
   * from audio-voice-counter.ts. Optional.
   */
  readonly maxAudioVoiceCount?: number;
}
