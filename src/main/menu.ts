/**
 * Application menu.
 *
 * Reason this file exists (Sprint 0 Phase 2 — C2 workaround):
 *   When BrowserWindow is in `setKiosk(true)` mode on macOS, the OS-level key
 *   routing consumes Cmd+Q UNLESS an application menu with a `role: 'quit'`
 *   menu item has been explicitly installed via `Menu.setApplicationMenu`.
 *   Without this menu, `Cmd+Q` is silently swallowed inside kiosk and the
 *   user's only escape becomes the 3-second ESC-hold (kraken's path).
 *
 *   Reference threads documenting this behavior:
 *     electron/electron#3978  (kiosk consumes Cmd+Q without app menu)
 *     electron/electron#20978 (re-confirmed for Electron 11+)
 *
 *   Tradeoffs considered:
 *     (a) Menu.setApplicationMenu with role:'quit'  ← CHOSEN
 *         Local to our app. macOS menubar route works in kiosk. Pure Electron.
 *     (b) globalShortcut.register('CmdOrCtrl+Q', app.quit)
 *         Pollutes the OS-wide shortcut table while our app is focused, and
 *         globalShortcut on macOS requires accessibility entitlements that
 *         joke app won't have. Also overshadows the system "force quit"
 *         shortcut Cmd+Option+Esc which we explicitly DO NOT want to touch.
 *
 *   Net effect for the user:
 *     - Cmd+Q quits even in kiosk (joke app exits cleanly).
 *     - The ESC-3s-hold path (preload → 'app:quit' IPC) is UNCHANGED.
 *     - On Windows the same menu is harmless; Alt+F4 is OS-level and unaffected.
 *
 * Scope:
 *   - macOS gets the standard 2-item menu structure (App menu + Window menu)
 *     because macOS REQUIRES an App menu at index 0 for `role: 'quit'` to bind
 *     to the system Cmd+Q.
 *   - Windows gets a minimal File menu with `role: 'close'` — Alt+F4 already
 *     works at the OS level so this is mostly for parity / future Cmd+W-like
 *     bindings if we ever add a Windows kiosk mode.
 *   - The `autoHideMenuBar: true` in window-manager.ts hides the menu visually
 *     on Windows (mac always shows menubar at top of screen — that's correct).
 */

import { Menu, app } from 'electron';
import type { MenuItemConstructorOptions } from 'electron';
import { logger } from './logger';

/**
 * Build the macOS menu template.
 *
 * The first submenu MUST be the App menu (label is ignored by macOS — it
 * displays `app.name` instead). The `role: 'quit'` item inside is what binds
 * `Cmd+Q` even when the window is in kiosk mode.
 */
function buildMacTemplate(): MenuItemConstructorOptions[] {
  const appName = app.name;

  const appMenu: MenuItemConstructorOptions = {
    label: appName,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      // The critical entry — `role: 'quit'` wires the standard Cmd+Q
      // accelerator AND ensures macOS knows we are quit-capable while in
      // kiosk. Removing this re-introduces the C2 bug.
      { role: 'quit' },
    ],
  };

  const windowMenu: MenuItemConstructorOptions = {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      // 'close' wires Cmd+W. The window manager's `frame: false` hides the
      // OS close button, so Cmd+W is the only way to close a window without
      // quitting the whole app. Useful for dev. Production kiosk does not
      // care because there is only one window and it is fullscreen.
      { role: 'close' },
    ],
  };

  return [appMenu, windowMenu];
}

/**
 * Build the Windows / fallback menu template.
 *
 * Windows already routes Alt+F4 through the OS shell, so this menu mostly
 * exists for parity and future-proofing. The `autoHideMenuBar: true` in
 * window-manager.ts hides this menu unless the user presses Alt — kiosk
 * mode on Windows already blocks Alt as a takeover key, so the menu is
 * effectively invisible. We still register it so `role: 'quit'` is wired
 * in case a future kiosk mode needs the bind.
 */
function buildWinTemplate(): MenuItemConstructorOptions[] {
  const fileMenu: MenuItemConstructorOptions = {
    label: 'File',
    submenu: [
      // Ctrl+W close window (no-op in single-window app, harmless).
      { role: 'close' },
      { type: 'separator' },
      // Ctrl+Q is not a Windows convention, but we register the role so
      // either accelerator binds correctly via Electron's defaults.
      { role: 'quit' },
    ],
  };
  return [fileMenu];
}

/**
 * Install the application menu.
 *
 * Idempotent — calling twice replaces the existing menu (Electron handles
 * the disposal of the previous menu reference internally).
 *
 * Must be called AFTER `app.whenReady()` resolves (Electron requirement —
 * `app.name` is not stable before ready).
 */
export function installApplicationMenu(): void {
  const template =
    process.platform === 'darwin' ? buildMacTemplate() : buildWinTemplate();
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  logger.info('application menu installed', {
    platform: process.platform,
    submenus: template.length,
  });
}
