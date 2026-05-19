/**
 * Renderer-visible type contract for window.api.
 *
 * The preload module exports the runtime; this file exports just the types so
 * both sides (preload + renderer) can import without crossing tsconfig roots.
 *
 * Anything you add here must also be implemented in src/preload/index.ts and
 * (where backed by IPC) registered in src/main/ipc.ts.
 */

import type { OsFamily } from './ipc-channels';

export type EscapeHoldProgressCallback = (progress: number) => void;
export type EscapeHoldCompleteCallback = () => void;

/**
 * Subset of NodeJS.Platform we actually care about. Renderer tsconfig does
 * not pull in @types/node, so we narrow here to a portable union.
 */
export type PlatformId = 'darwin' | 'win32' | 'linux' | 'freebsd' | 'sunos' | 'openbsd' | 'aix' | 'android' | 'haiku' | 'netbsd' | 'cygwin';

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
  /** node platform identifier ('darwin' | 'win32' | ...). Read-only. */
  readonly platform: PlatformId;
}
