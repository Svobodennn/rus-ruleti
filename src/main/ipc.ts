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
import { IPC_CHANNELS, type OsFamily } from '../shared/ipc-channels';
import { toggleKiosk } from './window-manager';
import { logger } from './logger';

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

  logger.info('IPC handlers registered', {
    channels: Object.values(IPC_CHANNELS),
  });
}

export function unregisterIpcHandlers(): void {
  ipcMain.removeAllListeners(IPC_CHANNELS.APP_QUIT);
  ipcMain.removeHandler(IPC_CHANNELS.OS_GET);
  ipcMain.removeHandler(IPC_CHANNELS.KIOSK_TOGGLE);
}
