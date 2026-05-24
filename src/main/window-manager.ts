/**
 * Window manager.
 *
 * Owns the single BrowserWindow used by the app. Kiosk-capable but kiosk is
 * NOT enabled by default in dev — swift-expert (Phase 2) will toggle it via
 * the IPC 'kiosk:toggle' channel to empirically test Cmd+Q behavior (C2 risk).
 *
 * Security stance (audited by security-reviewer Phase 3):
 *   - sandbox: true
 *   - contextIsolation: true
 *   - nodeIntegration: false
 *   - webSecurity: true (default, not overridden)
 *   - preload: pinned to compiled preload bundle, no remote module
 */

import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';
import {
  DEFAULT_WINDOW_HEIGHT,
  DEFAULT_WINDOW_WIDTH,
  DEV_SERVER_URL_ENV,
} from '../shared/constants';
import { logger } from './logger';

let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

export function createMainWindow(): BrowserWindow {
  if (mainWindow !== null && !mainWindow.isDestroyed()) {
    return mainWindow;
  }

  // Preload path: electron-vite emits to out/preload/index.js next to out/main.
  const preloadPath = join(__dirname, '../preload/index.js');

  const win = new BrowserWindow({
    width: DEFAULT_WINDOW_WIDTH,
    height: DEFAULT_WINDOW_HEIGHT,
    show: false,
    frame: false,
    // Fullscreen ON in production, OFF in dev (so DevTools/inspector remains usable).
    fullscreen: !isDev,
    // Kiosk OFF by default in dev. swift-expert toggles via IPC for Cmd+Q test.
    kiosk: false,
    backgroundColor: '#0a0908',
    autoHideMenuBar: true,
    webPreferences: {
      preload: preloadPath,
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      devTools: isDev,
    },
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  // Refuse any window.open() attempts from renderer — joke app should not
  // open external URLs without explicit user intent (none in Sprint 0).
  win.webContents.setWindowOpenHandler(({ url }) => {
    logger.warn('Blocked window.open attempt', { url });
    // Allow nothing for now. Designer/i18n can add a whitelisted "Learn more"
    // link to README disclaimer in a later sprint via shell.openExternal.
    return { action: 'deny' };
  });

  // Block in-page navigation away from the renderer bundle.
  win.webContents.on('will-navigate', (event, url) => {
    const devUrl = process.env[DEV_SERVER_URL_ENV];
    if (devUrl !== undefined && url.startsWith(devUrl)) {
      return;
    }
    logger.warn('Blocked navigation attempt', { url });
    event.preventDefault();
  });

  loadRenderer(win);

  mainWindow = win;
  return win;
}

function loadRenderer(win: BrowserWindow): void {
  const devUrl = process.env[DEV_SERVER_URL_ENV];
  if (isDev && devUrl !== undefined && devUrl !== '') {
    win.loadURL(devUrl).catch((err: unknown) => {
      logger.error('Failed to load dev URL', err);
    });
    return;
  }
  const htmlPath = join(__dirname, '../renderer/index.html');
  win.loadFile(htmlPath).catch((err: unknown) => {
    logger.error('Failed to load renderer HTML', err);
  });
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

/**
 * Toggle kiosk mode for the active window.
 *
 * Used by swift-expert (Phase 2) to test how Cmd+Q behaves in kiosk on macOS.
 * Returns the new kiosk state, or null if no window exists.
 */
export function toggleKiosk(): boolean | null {
  const win = getMainWindow();
  if (win === null || win.isDestroyed()) {
    logger.warn('toggleKiosk: no active window');
    return null;
  }
  const next = !win.isKiosk();
  win.setKiosk(next);
  logger.info('kiosk toggled', { kiosk: next });
  return next;
}

