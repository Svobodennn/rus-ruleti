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
 *   - getUsername(): Promise<string>         via 'os:get-username' (Sprint 4 S2)
 *
 * NOTE on onEscapeHold:
 *   The maestro directive says the renderer runs the ESC keydown/keyup timer
 *   itself and fires IPC 'app:quit' on completion. This preload re-exposes the
 *   timer mechanism so the renderer doesn't have to re-implement it inline.
 *   The timer logic lives here in the preload context — still no Node APIs.
 */

import { contextBridge, ipcRenderer } from 'electron';
import { ESC_HOLD_DURATION_MS } from '../shared/constants';
import {
  IPC_CHANNELS,
  type FrameStatsPayload,
  type OsFamily,
} from '../shared/ipc-channels';
import type {
  EscapeHoldCompleteCallback,
  EscapeHoldProgressCallback,
  PlatformId,
  RusRuletiApi,
} from '../shared/api-types';

const ESC_KEY = 'Escape';

/** Mutable timer state shared across the ESC hold handler callbacks. */
interface EscTimerState {
  holdStartedAt: number | null;
  rafId: number | null;
}

/**
 * RAF tick: measures hold progress, fires onProgress each frame, and fires
 * onComplete + IPC quit when ESC_HOLD_DURATION_MS is reached.
 */
function escTick(
  state: EscTimerState,
  onProgress: EscapeHoldProgressCallback,
  onComplete: EscapeHoldCompleteCallback,
): void {
  if (state.holdStartedAt === null) {
    return;
  }
  const elapsed = performance.now() - state.holdStartedAt;
  const progress = Math.min(elapsed / ESC_HOLD_DURATION_MS, 1);
  onProgress(progress);
  if (progress >= 1) {
    state.holdStartedAt = null;
    state.rafId = null;
    onComplete();
    ipcRenderer.send(IPC_CHANNELS.APP_QUIT);
    return;
  }
  state.rafId = requestAnimationFrame(() => escTick(state, onProgress, onComplete));
}

/**
 * Keydown handler: starts the hold timer on first ESC press (skips repeats
 * and ignores subsequent presses while a hold is already in progress).
 */
function onEscKeyDown(
  state: EscTimerState,
  onProgress: EscapeHoldProgressCallback,
  onComplete: EscapeHoldCompleteCallback,
  ev: KeyboardEvent,
): void {
  if (ev.key !== ESC_KEY || ev.repeat || state.holdStartedAt !== null) {
    return;
  }
  state.holdStartedAt = performance.now();
  state.rafId = requestAnimationFrame(() => escTick(state, onProgress, onComplete));
}

/**
 * Keyup handler: cancels the in-progress hold timer and resets progress to 0.
 */
function onEscKeyUp(
  state: EscTimerState,
  onProgress: EscapeHoldProgressCallback,
  ev: KeyboardEvent,
): void {
  if (ev.key !== ESC_KEY) {
    return;
  }
  state.holdStartedAt = null;
  if (state.rafId !== null) {
    cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }
  onProgress(0);
}

function createEscHoldHandler(
  onProgress: EscapeHoldProgressCallback,
  onComplete: EscapeHoldCompleteCallback,
): () => void {
  const state: EscTimerState = { holdStartedAt: null, rafId: null };

  const keyDownHandler = (ev: KeyboardEvent): void =>
    onEscKeyDown(state, onProgress, onComplete, ev);
  const keyUpHandler = (ev: KeyboardEvent): void =>
    onEscKeyUp(state, onProgress, ev);

  window.addEventListener('keydown', keyDownHandler);
  window.addEventListener('keyup', keyUpHandler);

  return (): void => {
    window.removeEventListener('keydown', keyDownHandler);
    window.removeEventListener('keyup', keyUpHandler);
    if (state.rafId !== null) {
      cancelAnimationFrame(state.rafId);
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
  finale: (): void => {
    ipcRenderer.send(IPC_CHANNELS.APP_FINALE);
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
  sendFrameStats: (payload: FrameStatsPayload): void => {
    ipcRenderer.send(IPC_CHANNELS.FRAME_STATS, payload);
  },
  getUsername: async (): Promise<string> => {
    // Defensive — never let an IPC failure crash the renderer. The main
    // handler returns "unknown" on os.userInfo() failure, but if the IPC
    // itself rejects (e.g. handler not registered yet during dev HMR), we
    // also fall back to "unknown" so Faz 3 has something to substitute.
    try {
      const result = (await ipcRenderer.invoke(
        IPC_CHANNELS.OS_GET_USERNAME,
      )) as string;
      return result;
    } catch {
      return 'unknown';
    }
  },
};

contextBridge.exposeInMainWorld('api', api);
