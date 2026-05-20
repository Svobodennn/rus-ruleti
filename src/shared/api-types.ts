/**
 * Renderer-visible type contract for window.api.
 *
 * The preload module exports the runtime; this file exports just the types so
 * both sides (preload + renderer) can import without crossing tsconfig roots.
 *
 * Anything you add here must also be implemented in src/preload/index.ts and
 * (where backed by IPC) registered in src/main/ipc.ts.
 */

import type { FrameStatsPayload, OsFamily } from './ipc-channels';

export type { FrameStatsPayload };

export type EscapeHoldProgressCallback = (progress: number) => void;
export type EscapeHoldCompleteCallback = () => void;

/**
 * Runtime-supported platforms.
 *
 * Sprint 0 retro L.4 narrowed this union from the full NodeJS.Platform set
 * to the two platforms we actually ship. macOS (Intel + Apple Silicon) and
 * Windows 10/11 x64 are the PLAN §1 targets. Any other platform throws in
 * src/main/ipc.ts:getOsFamily(), so renderer code that depends on a 3rd
 * value would be dead at runtime.
 *
 * Preload casts `process.platform` to this via an `as` cast — the cast is
 * safe because the main process refuses to start on platforms outside this
 * set (see ipc.ts).
 */
export type PlatformId = 'darwin' | 'win32';

export interface RusRuletiApi {
  /** Returns the OS family, resolved via IPC 'os:get'. */
  getOS: () => Promise<OsFamily>;
  /** Quits the app via IPC 'app:quit'. */
  quit: () => void;
  /**
   * Subscribe to the ESC-hold timer. onProgress fires 0..1 on each rAF tick.
   * onComplete fires once progress reaches 1.0 (preload also fires IPC quit).
   * Returns a dispose function.
   */
  onEscapeHold: (
    onProgress: EscapeHoldProgressCallback,
    onComplete: EscapeHoldCompleteCallback,
  ) => () => void;
  /** Debug only — swift-expert Phase 2. Returns new kiosk state, null if no window. */
  toggleKiosk: () => Promise<boolean | null>;
  /** node platform identifier ('darwin' | 'win32'). Read-only. */
  readonly platform: PlatformId;
  /**
   * Fire a frame-time summary to main via IPC 'frame:stats'.
   *
   * Scene's frame-logger drains its ring buffer periodically and calls this.
   * Fire-and-forget — main writes to electron-log and never replies.
   */
  sendFrameStats: (payload: FrameStatsPayload) => void;
  /**
   * Returns the OS login username (Sprint 4 PLAN §12 S2 risk closure).
   *
   * Resolved via IPC `os:get-username`; main process owns the `os` module
   * call and returns ONLY the username string (no homedir, no hostname, no
   * other os.userInfo fields). Renderer's Faz 3 terminal substitutes the
   * result into FAKE_FILE_PATHS_* templates so the joke uses the user's real
   * login name instead of a hardcoded "USER" / "Melih". If the main-process
   * lookup fails the resolved string is "unknown" (see main/ipc.ts).
   *
   * Called by: src/renderer/scene/destruction/destruction-director.ts (FSM
   * entry — caches username before entering Faz 3 so the typewriter does not
   * block on IPC mid-sequence).
   */
  getUsername: () => Promise<string>;
}
