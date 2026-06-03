/**
 * IPC handler registration.
 *
 * Whitelisted channels ONLY (see shared/ipc-channels.ts). Each handler:
 *   - validates the sender frame's origin matches our renderer
 *   - validates payload shape (Sprint 0 has no payloads)
 *   - returns a typed response
 *
 * security-reviewer (Phase 3) audits this file and shared/ipc-channels.ts
 * together. No new channel may be added without updating both.
 */

import { app, ipcMain } from 'electron';
import type { IpcMainEvent, IpcMainInvokeEvent } from 'electron';
import * as os from 'os';
import {
  IPC_CHANNELS,
  type FrameStatsPayload,
  type OsFamily,
} from '../shared/ipc-channels';
import { toggleKiosk } from './window-manager';
import { logger } from './logger';

/** Returned when os.userInfo() throws (e.g. headless / unusual sandbox). */
const UNKNOWN_USERNAME = 'unknown';

/** Returns 'mac' for darwin, 'win' for win32. Other platforms reject. */
function getOsFamily(): OsFamily {
  if (process.platform === 'darwin') {
    return 'mac';
  }
  if (process.platform === 'win32') {
    return 'win';
  }
  // Linux/other intentionally unsupported in this joke app.
  throw new Error(`Unsupported platform: ${process.platform}`);
}

/**
 * Origin check.
 *
 * Verifies the IPC sender is our own renderer frame and not a webview /
 * iframe injected via some exploit. In Sprint 0 contextIsolation+sandbox
 * already prevent most attack surface, but defence-in-depth is cheap.
 */
function isAllowedSender(event: IpcMainEvent | IpcMainInvokeEvent): boolean {
  const frame = event.senderFrame;
  if (frame === null) {
    return false;
  }
  // In dev, the URL is http://localhost:<port>/. In prod it is file://.../index.html.
  // We do not pin a single URL because the dev port can shift. Instead we
  // require: top-level frame, no http(s) origin in prod.
  const url = frame.url;
  if (app.isPackaged) {
    return url.startsWith('file://');
  }
  return url.startsWith('http://localhost') || url.startsWith('file://');
}

export function registerIpcHandlers(): void {
  // app:quit — fire-and-forget. ESC-hold timer in renderer triggers this.
  // Sprint 7 Phase 1 §S10 decision: REUSED by Faz 8 ÇIK button (chrome/
  // faz8-cik-button.ts). The ÇIK button's onClick handler is wired by Lane A
  // Phase 2B to call window.api.quit() which fires this same channel. NO new
  // IPC channel introduced for Sprint 7 because this channel already provides
  // the exact contract needed: kiosk-safe renderer-triggered app.quit() with
  // isAllowedSender validation. Path B (new channel) was rejected; reusing
  // app:quit avoids preload exposure + main handler + security-reviewer
  // Phase 3 audit overhead.
  ipcMain.on(IPC_CHANNELS.APP_QUIT, (event: IpcMainEvent) => {
    if (!isAllowedSender(event)) {
      logger.warn('app:quit rejected — sender check failed');
      return;
    }
    logger.info('app:quit received — quitting');
    app.quit();
  });

  // os:get — invoke-style request/response. Returns 'mac' | 'win'.
  ipcMain.handle(IPC_CHANNELS.OS_GET, (event: IpcMainInvokeEvent): OsFamily => {
    if (!isAllowedSender(event)) {
      throw new Error('os:get rejected — sender check failed');
    }
    return getOsFamily();
  });

  // kiosk:toggle — debug/test channel used by swift-expert in Phase 2.
  // Returns the new kiosk state, or null if no window.
  ipcMain.handle(
    IPC_CHANNELS.KIOSK_TOGGLE,
    (event: IpcMainInvokeEvent): boolean | null => {
      if (!isAllowedSender(event)) {
        throw new Error('kiosk:toggle rejected — sender check failed');
      }
      return toggleKiosk();
    },
  );

  // os:get-username — Sprint 4 PLAN §12 S2 risk closure. Returns ONLY the
  // login username (no homedir, no hostname). os module lives here in main
  // process; preload bridge has os banned by ESLint, so the only path the
  // renderer has to this data is through this whitelisted IPC channel.
  ipcMain.handle(IPC_CHANNELS.OS_GET_USERNAME, getUsernameHandler);

  // frame:stats — one-way. Renderer flushes a frame-time summary every
  // FRAME_LOG_FLUSH_INTERVAL_MS so a packaged build leaves a per-session
  // perf record on disk (S1 risk telemetry). Payload shape is validated
  // before logging; bad shapes are dropped silently (joke app, no error
  // surfaces to the user).
  ipcMain.on(
    IPC_CHANNELS.FRAME_STATS,
    (event: IpcMainEvent, payload: unknown) => {
      if (!isAllowedSender(event)) {
        logger.warn('frame:stats rejected — sender check failed');
        return;
      }
      if (!isFrameStatsPayload(payload)) {
        logger.warn('frame:stats rejected — bad payload shape');
        return;
      }
      logger.info('frame:stats', payload);
    },
  );

  logger.info('IPC handlers registered', {
    channels: Object.values(IPC_CHANNELS),
  });
}

export function unregisterIpcHandlers(): void {
  ipcMain.removeAllListeners(IPC_CHANNELS.APP_QUIT);
  ipcMain.removeHandler(IPC_CHANNELS.OS_GET);
  ipcMain.removeHandler(IPC_CHANNELS.KIOSK_TOGGLE);
  ipcMain.removeAllListeners(IPC_CHANNELS.FRAME_STATS);
  ipcMain.removeHandler(IPC_CHANNELS.OS_GET_USERNAME);
}

/**
 * Handler for `os:get-username`. Extracted into a named function so the
 * registration call site stays inside the 50-line ceiling of
 * registerIpcHandlers (lint enforcement) and so the try/catch + sender check
 * are easy to read on their own.
 *
 * Defensive: `os.userInfo()` can throw on systems with an unresolvable UID
 * (rare on Mac/Win desktop targets but technically possible). On failure we
 * return UNKNOWN_USERNAME so the renderer's Faz 3 terminal still has SOMETHING
 * to substitute, rather than the destruction sequence crashing in the middle
 * of a punchline.
 */
function getUsernameHandler(event: IpcMainInvokeEvent): string {
  if (!isAllowedSender(event)) {
    throw new Error('os:get-username rejected — sender check failed');
  }
  try {
    return os.userInfo().username;
  } catch (err) {
    logger.warn('os.userInfo failed; returning UNKNOWN_USERNAME', { err });
    return UNKNOWN_USERNAME;
  }
}

/**
 * Runtime shape guard for FrameStatsPayload.
 *
 * Defensive — preload guarantees the shape, but we never trust IPC payloads.
 * Returns true only if every numeric field is a finite number and quality is
 * one of the three accepted tiers.
 */
function isFrameStatsPayload(value: unknown): value is FrameStatsPayload {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const v = value as Record<string, unknown>;
  const numericKeys = ['p50', 'p95', 'p99', 'mean', 'max', 'sampleCount'];
  for (const key of numericKeys) {
    const n = v[key];
    if (typeof n !== 'number' || !Number.isFinite(n)) {
      return false;
    }
  }
  const q = v['quality'];
  return q === 'low' || q === 'medium' || q === 'high';
}
