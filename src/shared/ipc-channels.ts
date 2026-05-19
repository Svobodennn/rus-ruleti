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
 */

export const IPC_CHANNELS = {
  APP_QUIT: 'app:quit',
  OS_GET: 'os:get',
  KIOSK_TOGGLE: 'kiosk:toggle',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

/** Allow-list used by both ipcMain registration and preload bridge. */
export const ALLOWED_IPC_CHANNELS: ReadonlyArray<IpcChannel> = [
  IPC_CHANNELS.APP_QUIT,
  IPC_CHANNELS.OS_GET,
  IPC_CHANNELS.KIOSK_TOGGLE,
];

export type OsFamily = 'mac' | 'win';
