/**
 * Logger — electron-log v5 main-process transport.
 *
 * Wraps electron-log so all call sites in src/main/* depend on the SHAPE
 * (Logger interface) and not on electron-log directly. If we ever swap
 * loggers (Sentry breadcrumb sink, JSON line transport, etc.) only this
 * file changes.
 *
 * File transport path:
 *   - macOS:  ~/Library/Logs/Rus Ruleti/main.log
 *   - Win:    %APPDATA%/Rus Ruleti/logs/main.log
 *   (electron-log resolves these from app.getPath('userData') / 'logs').
 *
 * Levels (Sprint 0 baseline):
 *   - transports.file.level    = 'info'   — disk persists info+ for prod debug.
 *   - transports.console.level = 'debug'  — stdout for dev / packaged --inspect.
 *
 * Unhandled errors:
 *   errorHandler.startCatching() — converts uncaught exceptions and unhandled
 *   rejections into ERROR-level log entries before the process dies. This is
 *   the *only* visibility we have once the app is shipped (no Sentry yet —
 *   PLAN section 14 marks DSN as opt-in / Sprint 9). Crash dumps still go
 *   to crashReporter (configured in index.ts).
 *
 * IMPORTANT: electron-log's `info`/`warn`/`error`/`debug` are variadic.
 * We preserve the variadic signature so existing call sites in ipc.ts and
 * window-manager.ts (e.g. logger.info('IPC handlers registered', { ... }))
 * keep working without churn.
 */

import log from 'electron-log/main';

export interface Logger {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

// One-time transport configuration. Runs at module load — main.ts imports
// `logger` before app.whenReady, so transports are armed before any other
// subsystem (IPC, window) starts logging.
log.transports.file.level = 'info';
log.transports.console.level = 'debug';

// Renderer IPC bridge: lets renderer call window.log.info(...) via preload
// (preload wiring is Sprint 1+ work — initialize is idempotent and harmless
// to call now). spyRendererConsole=false because the renderer has no console
// transport in Sprint 0; we'll enable it once @i18n-expert wires the disclaimer.
/* TEMP DIAGNOSTIC for BANG → destruction bug. Revert in Sprint 6 polish. */
log.initialize({ preload: false, spyRendererConsole: true });

// Catch uncaught exceptions / unhandled rejections in the main process.
// Without this the joke app would die silently with no log line on disk.
log.errorHandler.startCatching({
  showDialog: false,
});

export const logger: Logger = {
  info: (...args: unknown[]): void => {
    log.info(...args);
  },
  warn: (...args: unknown[]): void => {
    log.warn(...args);
  },
  error: (...args: unknown[]): void => {
    log.error(...args);
  },
  debug: (...args: unknown[]): void => {
    log.debug(...args);
  },
};
