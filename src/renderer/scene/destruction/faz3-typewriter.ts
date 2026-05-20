/**
 * Faz 3 typewriter primitives — Phase 2B (kraken-faz2-3).
 *
 * Encapsulates the per-char (command + password) and per-line (output)
 * cadences so faz3-terminal.ts stays focused on orchestration + DOM
 * structure. All callbacks honour the signal.aborted contract.
 *
 *   - typeChars(text, charsPerSec, signal, onChar)
 *       Per-character setTimeout chain. onChar(soFar) gets the running
 *       prefix; caller appends to DOM.
 *   - streamLines(generator, linesPerSec, signal, onLine)
 *       Per-line setTimeout chain. generator() returns next string; the
 *       loop is driven by the line rate, stopping on abort or generator
 *       returning undefined.
 *
 * Reduced-motion gate is callers' responsibility — destruction.css gates
 * the cursor blink animation; typeChars / streamLines are FUNCTIONAL
 * cadences (the joke depends on the rendered cadence). Designer §8 rows
 * 20/21/22 — output flow is unchanged under reduced-motion (functional).
 */

/* ------------------------------------------------------------------------ */
/* Per-char (command + password)                                            */
/* ------------------------------------------------------------------------ */

export interface TypeCharsArgs {
  readonly text: string;
  readonly charsPerSec: number;
  readonly signal: AbortSignal;
  readonly reducedMotion: boolean;
  readonly onChar: (soFar: string) => void;
}

/**
 * Type a string one character at a time at the given chars/sec rate.
 * Resolves when typing completes or abort fires.
 *
 * Reduced-motion: text is rendered instantly in a single onChar call.
 */
export function typeChars(args: TypeCharsArgs): Promise<void> {
  return new Promise<void>((resolve): void => {
    if (args.reducedMotion) {
      args.onChar(args.text);
      resolve();
      return;
    }
    const intervalMs = 1000 / args.charsPerSec;
    let idx = 0;
    let timeoutId = -1;
    const onAbort = (): void => {
      if (timeoutId !== -1) {
        window.clearTimeout(timeoutId);
      }
      resolve();
    };
    args.signal.addEventListener('abort', onAbort, { once: true });
    const step = (): void => {
      if (args.signal.aborted) {
        return;
      }
      idx += 1;
      args.onChar(args.text.slice(0, idx));
      if (idx >= args.text.length) {
        args.signal.removeEventListener('abort', onAbort);
        resolve();
        return;
      }
      timeoutId = window.setTimeout(step, intervalMs);
    };
    timeoutId = window.setTimeout(step, intervalMs);
  });
}

/* ------------------------------------------------------------------------ */
/* Per-line (output stream)                                                 */
/* ------------------------------------------------------------------------ */

export interface StreamLinesArgs {
  readonly nextLine: () => string | undefined;
  readonly linesPerSec: number;
  readonly signal: AbortSignal;
  readonly durationMs: number;
  readonly onLine: (line: string) => void;
}

/**
 * Stream lines at the given lines/sec rate until durationMs elapses, the
 * signal aborts, or nextLine() returns undefined.
 */
export function streamLines(args: StreamLinesArgs): Promise<void> {
  return new Promise<void>((resolve): void => {
    const intervalMs = 1000 / args.linesPerSec;
    const startMs = performance.now();
    let timeoutId = -1;
    const onAbort = (): void => {
      if (timeoutId !== -1) {
        window.clearTimeout(timeoutId);
      }
      resolve();
    };
    args.signal.addEventListener('abort', onAbort, { once: true });
    const step = (): void => {
      if (args.signal.aborted) {
        return;
      }
      const elapsed = performance.now() - startMs;
      if (elapsed >= args.durationMs) {
        args.signal.removeEventListener('abort', onAbort);
        resolve();
        return;
      }
      const line = args.nextLine();
      if (line === undefined) {
        args.signal.removeEventListener('abort', onAbort);
        resolve();
        return;
      }
      args.onLine(line);
      timeoutId = window.setTimeout(step, intervalMs);
    };
    timeoutId = window.setTimeout(step, intervalMs);
  });
}

/* ------------------------------------------------------------------------ */
/* Path rotation helper                                                     */
/* ------------------------------------------------------------------------ */

/**
 * Build a generator that loops the path list indefinitely, substituting
 * USERNAME_PLACEHOLDER with the live username (cached at Faz 3 entry).
 *
 * Falls back to literal 'USER' if username is empty (designer S2 closure).
 */
export function createPathGenerator(
  paths: readonly string[],
  username: string,
  usernamePlaceholder: string,
): () => string | undefined {
  if (paths.length === 0) {
    return (): string | undefined => undefined;
  }
  const safeUsername = username.length === 0 ? 'USER' : username;
  let idx = 0;
  return (): string => {
    const template = paths[idx % paths.length];
    idx += 1;
    if (template === undefined) {
      /* Type narrowing — modulo with non-zero length guarantees defined. */
      return '';
    }
    return template.split(usernamePlaceholder).join(safeUsername);
  };
}
