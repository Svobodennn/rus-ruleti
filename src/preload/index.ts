/**
 * Preload bridge.
 *
 * Exposes a single read-only API on window.api. The renderer has NO direct
 * access to Node APIs — sandbox:true + contextIsolation:true enforce this at
 * the Chromium layer. This bridge is the ONLY surface.
 *
 * BANNED imports (audited by security-reviewer Phase 3, also blocked by
 * .eslintrc.cjs):
 *   - fs, fs/promises, child_process, shell, net, http, https
 *   - dgram, cluster, vm, os
 *
 * Allowed:
 *   - electron (contextBridge, ipcRenderer — used with whitelisted channels only)
 *   - process.platform (read-only string, no exec)
 *
 * API shape (matches maestro directive + user prompt):
 *   - getOS(): Promise<'mac'|'win'>          via 'os:get'
 *   - onEscapeHold(cb): void                 NOT IPC — local keyboard timer
 *   - quit(): void                           via 'app:quit'
 *   - toggleKiosk(): Promise<boolean|null>   via 'kiosk:toggle' (debug, swift-expert)
 *
 * NOTE on onEscapeHold:
 *   The maestro directive says the renderer runs the ESC keydown/keyup timer
 *   itself and fires IPC 'app:quit' on completion. This preload re-exposes the
 *   timer mechanism so the renderer doesn't have to re-implement it inline.
 *   The timer logic lives here in the preload context — still no Node APIs.
 */

import { contextBridge, ipcRenderer } from 'electron';
import { ESC_HOLD_DURATION_MS } from '../shared/constants';
import { IPC_CHANNELS, type OsFamily } from '../shared/ipc-channels';
import type {
  EscapeHoldCompleteCallback,
  EscapeHoldProgressCallback,
  PlatformId,
  RusRuletiApi,
} from '../shared/api-types';

const ESC_KEY = 'Escape';

function createEscHoldHandler(
  onProgress: EscapeHoldProgressCallback,
  onComplete: EscapeHoldCompleteCallback,
): () => void {
  let holdStartedAt: number | null = null;
  let rafId: number | null = null;

  const tick = (): void => {
    if (holdStartedAt === null) {
      return;
    }
    const elapsed = performance.now() - holdStartedAt;
    const progress = Math.min(elapsed / ESC_HOLD_DURATION_MS, 1);
    onProgress(progress);
    if (progress >= 1) {
      // Completed. Fire quit and reset.
      holdStartedAt = null;
      rafId = null;
      onComplete();
      ipcRenderer.send(IPC_CHANNELS.APP_QUIT);
      return;
    }
    rafId = requestAnimationFrame(tick);
  };

  const onKeyDown = (ev: KeyboardEvent): void => {
    if (ev.key !== ESC_KEY) {
      return;
    }
    if (ev.repeat) {
      return;
    }
    if (holdStartedAt !== null) {
      return;
    }
    holdStartedAt = performance.now();
    rafId = requestAnimationFrame(tick);
  };

  const onKeyUp = (ev: KeyboardEvent): void => {
    if (ev.key !== ESC_KEY) {
      return;
    }
    holdStartedAt = null;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    onProgress(0);
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  return (): void => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
  };
}

const api: RusRuletiApi = {
  getOS: async (): Promise<OsFamily> => {
    const result = (await ipcRenderer.invoke(IPC_CHANNELS.OS_GET)) as OsFamily;
    return result;
  },
  quit: (): void => {
    ipcRenderer.send(IPC_CHANNELS.APP_QUIT);
  },
  onEscapeHold: (
    onProgress: EscapeHoldProgressCallback,
    onComplete: EscapeHoldCompleteCallback,
  ): (() => void) => createEscHoldHandler(onProgress, onComplete),
  toggleKiosk: async (): Promise<boolean | null> => {
    const result = (await ipcRenderer.invoke(
      IPC_CHANNELS.KIOSK_TOGGLE,
    )) as boolean | null;
    return result;
  },
  platform: process.platform as PlatformId,
};

contextBridge.exposeInMainWorld('api', api);
