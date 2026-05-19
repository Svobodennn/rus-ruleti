/**
 * Electron main process entry.
 *
 * Responsibilities:
 *   - app lifecycle (whenReady, window-all-closed, activate)
 *   - delegate window creation to window-manager
 *   - delegate IPC registration to ipc module
 *   - crashReporter bootstrap (local-only, no upload — joke app sandbox)
 *   - application menu installation (C2 workaround — Sprint 0 Phase 2)
 *   - dev-only Cmd+K global shortcut for kiosk toggle testing
 *
 * Out of scope for this sprint:
 *   - Sentry DSN wiring (PLAN section 14 — Sprint 9, opt-in)
 */

import {
  app,
  BrowserWindow,
  crashReporter,
  globalShortcut,
  session,
} from 'electron';
import { createMainWindow, toggleKiosk } from './window-manager';
import { registerIpcHandlers, unregisterIpcHandlers } from './ipc';
import { installApplicationMenu } from './menu';
import { logger } from './logger';

// Single-instance lock — refuse second launches. Stops the joke app spawning
// twice and confusing the kiosk state.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

// Crash reporting — local dumps only, NO upload. Electron writes minidumps to
// userData/crashes (resolved per-platform by app.getPath('crashDumps')).
//
// PLAN section 14 explicitly marks Sentry DSN as opt-in / Sprint 9 work, so
// uploadToServer stays false and submitURL is empty. crashReporter.start()
// must run BEFORE app.whenReady() so child renderer / GPU processes inherit
// the reporter config.
crashReporter.start({
  productName: 'Rus Ruleti',
  companyName: 'famelink',
  submitURL: '',
  uploadToServer: false,
  ignoreSystemCrashHandler: false,
  compress: true,
});
logger.info('crashReporter started (local-only)', {
  crashDumpsPath: app.getPath('crashDumps'),
});

app.on('second-instance', () => {
  // If somebody double-clicks the icon, focus the existing window.
  const windows = BrowserWindow.getAllWindows();
  const first = windows[0];
  if (first !== undefined && !first.isDestroyed()) {
    if (first.isMinimized()) {
      first.restore();
    }
    first.focus();
  }
});

app
  .whenReady()
  .then(() => {
    // Defence-in-depth (Sprint 0 retro L.1). Sandbox + contextIsolation
    // already block direct Node access from renderer, but the renderer can
    // still ask Chromium for camera/mic/geo/notifications via WebAPIs.
    // The joke app needs none of these. Deny everything globally — there
    // is no UI surface to grant a permission and the renderer should not
    // be silently allowed to use any of them in a packaged build.
    session.defaultSession.setPermissionRequestHandler(
      (_wc, _permission, callback) => callback(false),
    );

    registerIpcHandlers();

    // C2 workaround (Sprint 0 Phase 2): install the application menu so
    // Cmd+Q (mac) / Alt+F4-equivalent (win) keeps quitting the app even
    // when the BrowserWindow is in kiosk mode. See src/main/menu.ts header
    // for the empirical test matrix that motivates this. MUST run after
    // app.whenReady() because `app.name` is only stable at that point, and
    // BEFORE createMainWindow() so the menu is wired before any kiosk
    // toggle could request it.
    installApplicationMenu();

    createMainWindow();

    // Dev-only debug shortcut: Cmd+K (mac) / Ctrl+K (win) toggles kiosk.
    // Lets a developer reproduce the C2 scenario without recompiling. Only
    // registered in dev to keep production behaviour predictable (kiosk
    // state is driven by initial window options + IPC 'kiosk:toggle' in
    // production builds).
    //
    // Important caveats:
    //   - globalShortcut intercepts the key OS-wide while our app has
    //     focus. We intentionally choose Cmd+K (not Cmd+Q) so we never
    //     compete with the menu's quit accelerator.
    //   - We do NOT register globalShortcut('CmdOrCtrl+Q') because the
    //     application menu's role: 'quit' is the canonical channel and
    //     globalShortcut would shadow the menu (Electron docs warn this
    //     prevents the menu from receiving the key event).
    if (!app.isPackaged) {
      const registered = globalShortcut.register('CommandOrControl+K', () => {
        const state = toggleKiosk();
        logger.info('dev kiosk toggle via Cmd+K', { kiosk: state });
      });
      if (!registered) {
        logger.warn('Cmd+K dev shortcut failed to register (already taken?)');
      }
    }

    app.on('activate', () => {
      // macOS dock click — recreate window if none open.
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      }
    });
  })
  .catch((err: unknown) => {
    logger.error('app.whenReady failed', err);
    app.quit();
  });

app.on('will-quit', () => {
  // Mirror the registerIpcHandlers / unregisterIpcHandlers symmetry: any
  // global shortcuts we asked for must be released before the process dies
  // so a second launch (or test runner) does not see "shortcut already
  // registered" errors. unregisterAll is a no-op if nothing is registered.
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  // On macOS apps usually stay alive without windows. For the joke app we
  // quit on all platforms so ESC-hold reliably terminates the process.
  unregisterIpcHandlers();
  app.quit();
});

// Hard-deny child windows / opening external URLs unless we explicitly allow.
app.on('web-contents-created', (_event, contents) => {
  contents.setWindowOpenHandler(() => ({ action: 'deny' }));
});
