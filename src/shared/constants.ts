/**
 * App-wide constants. No magic numbers in source files — they live here.
 * code-reviewer rule: every literal that has semantic meaning must be named.
 */

/** ESC must be held this many milliseconds to fire the emergency quit. */
export const ESC_HOLD_DURATION_MS = 3000;

/** UI tick frequency for the ESC-hold progress indicator. */
export const ESC_HOLD_TICK_MS = 50;

/** Default window dimensions (used only in non-fullscreen dev modes). */
export const DEFAULT_WINDOW_WIDTH = 1280;
export const DEFAULT_WINDOW_HEIGHT = 800;

/** Renderer dev server URL (electron-vite default). */
export const DEV_SERVER_URL_ENV = 'ELECTRON_RENDERER_URL';
