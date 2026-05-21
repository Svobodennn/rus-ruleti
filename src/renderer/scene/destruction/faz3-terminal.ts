/**
 * Faz 3 — Terminal rm -rf typewriter (12-22sn). Phase 2B (kraken-faz2-3).
 *
 *   1. Mount terminal chrome (Mac Terminal.app-like OR Win PowerShell-like).
 *   2. After 500ms: typewriter command `sudo rm -rf / --no-preserve-root`
 *      at TYPEWRITER_COMMAND_CHARS_PER_SEC=15.
 *   3. Append "Password: " line, type ******** at 5 chars/sec.
 *   4. 300ms Enter pause — just the cursor blinking.
 *   5. Stream output lines at TYPEWRITER_OUTPUT_LINES_PER_SEC=70 from
 *      FAKE_FILE_PATHS_MAC / _WIN with USERNAME_PLACEHOLDER substituted
 *      with the cached username arg.
 *   6. Trigger ApartmentBleed #2 at APARTMENT_BLEED_2_TRIGGER_MS (relative
 *      to bang = +4000ms within Faz 3).
 *   7. Resolve at FAZ_3_TERMINAL_DURATION_MS=10000ms or on signal abort.
 *
 * Reduced-motion:
 *   - Cursor blink → CSS @media gate (destruction.css) makes it solid.
 *   - Command + password typing → typeChars() instant-render branch.
 *   - Output flow → unchanged (the joke depends on volume).
 */

import {
  APARTMENT_BLEED_2_TRIGGER_MS,
  FAKE_FILE_PATHS_MAC,
  FAKE_FILE_PATHS_WIN,
  FAZ_0_BANG_DURATION_MS,
  FAZ_1_DIALOG_DURATION_MS,
  FAZ_2_TAKEOVER_DURATION_MS,
  FAZ_3_TERMINAL_DURATION_MS,
  PREFERS_REDUCED_MOTION_QUERY,
  TYPEWRITER_COMMAND_CHARS_PER_SEC,
  TYPEWRITER_CURSOR_BLINK_HZ,
  TYPEWRITER_OUTPUT_LINES_PER_SEC,
  USERNAME_PLACEHOLDER,
} from '../../../shared/scene-destruction-constants.js';
import {
  createPathGenerator,
  streamLines,
  typeChars,
} from './faz3-typewriter.js';
import type { ApartmentBleedHandle, OsVariant } from './types.js';

/* ------------------------------------------------------------------------ */
/* Public                                                                   */
/* ------------------------------------------------------------------------ */

export interface Faz3RunArgs {
  readonly os: OsVariant;
  /** Live username from window.api.getUsername(); already cached by director. */
  readonly username: string;
  readonly container: HTMLElement;
  readonly apartmentBleed: ApartmentBleedHandle;
  readonly signal: AbortSignal;
}

/* Designer-prose timing constants (destruction-direction.md §5):
 *  - 500ms initial pause before the command typewriter starts.
 *  - 5 chars/sec for password (slower than command for "visual gravitas").
 *  - 300ms Enter pause between password Enter and output stream start.
 * These are designer-internal implementation cadences, NOT SSOT-exposed
 * (per directive scope: scene-destruction-constants.ts is read-only).
 * Named locally so they grep-able and so future SSOT promotion is a
 * single-line move. Mirror of Lane A's bulb-hum 1500ms convention.
 */
const TERMINAL_PROMPT_PAUSE_MS = 500;
const TERMINAL_PASSWORD_CHARS_PER_SEC = 5;
const TERMINAL_ENTER_PAUSE_MS = 300;

/**
 * Run the Faz 3 terminal sequence. Resolves at FAZ_3_TERMINAL_DURATION_MS
 * or on ESC-hold abort. Mid-sequence triggers ApartmentBleed #2.
 */
export async function runFaz3(args: Faz3RunArgs): Promise<void> {
  const terminal = createTerminalChrome(args.os);
  args.container.appendChild(terminal.root);
  const reducedMotion = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;

  const teardown = (): void => {
    terminal.root.remove();
  };
  args.signal.addEventListener('abort', teardown, { once: true });

  scheduleBleed2(args);

  const sequenceDone = runSequence(terminal, args, reducedMotion);
  const guardrail = waitWindow(args.signal);
  await Promise.race([sequenceDone, guardrail]);

  if (!args.signal.aborted) {
    teardown();
    args.signal.removeEventListener('abort', teardown);
  }
}

/* ------------------------------------------------------------------------ */
/* Sequence orchestration                                                   */
/* ------------------------------------------------------------------------ */

async function runSequence(
  terminal: TerminalChrome,
  args: Faz3RunArgs,
  reducedMotion: boolean,
): Promise<void> {
  await sleep(TERMINAL_PROMPT_PAUSE_MS, args.signal);
  if (args.signal.aborted) {
    return;
  }
  await typeCommandLine(terminal, args.signal, reducedMotion);
  await typePasswordLine(terminal, args.signal, reducedMotion);
  await sleep(TERMINAL_ENTER_PAUSE_MS, args.signal);
  if (args.signal.aborted) {
    return;
  }
  await streamOutputLines(terminal, args, reducedMotion);
}

async function typeCommandLine(
  terminal: TerminalChrome,
  signal: AbortSignal,
  reducedMotion: boolean,
): Promise<void> {
  const commandPrompt = '$ ';
  const command = 'sudo rm -rf / --no-preserve-root';
  appendLine(terminal, commandPrompt, true);
  await typeChars({
    text: command,
    charsPerSec: TYPEWRITER_COMMAND_CHARS_PER_SEC,
    signal,
    reducedMotion,
    onChar: (soFar): void => {
      updateLastTypingLine(terminal, `${commandPrompt}${soFar}`);
    },
  });
  finalizeTypingLine(terminal);
}

async function typePasswordLine(
  terminal: TerminalChrome,
  signal: AbortSignal,
  reducedMotion: boolean,
): Promise<void> {
  const prefix = 'Password: ';
  appendLine(terminal, prefix, true);
  await typeChars({
    text: '********',
    charsPerSec: TERMINAL_PASSWORD_CHARS_PER_SEC,
    signal,
    reducedMotion,
    onChar: (soFar): void => {
      updateLastTypingLine(terminal, `${prefix}${soFar}`);
    },
  });
  finalizeTypingLine(terminal);
}

async function streamOutputLines(
  terminal: TerminalChrome,
  args: Faz3RunArgs,
  reducedMotion: boolean,
): Promise<void> {
  const paths =
    args.os === 'mac' ? FAKE_FILE_PATHS_MAC : FAKE_FILE_PATHS_WIN;
  const next = createPathGenerator(paths, args.username, USERNAME_PLACEHOLDER);
  const outputWindowMs = computeOutputWindowMs();
  await streamLines({
    nextLine: next,
    linesPerSec: TYPEWRITER_OUTPUT_LINES_PER_SEC,
    signal: args.signal,
    durationMs: outputWindowMs,
    onLine: (line): void => {
      appendLine(terminal, line, false);
    },
  });
  /* Reduced-motion path is the same as default — the line rate IS the
   * joke, and gating it would make the paths unreadable rather than more
   * accessible. Designer §8 row 22 — functional, unchanged. */
  void reducedMotion;
}

/* ------------------------------------------------------------------------ */
/* Terminal DOM construction                                                */
/* ------------------------------------------------------------------------ */

interface TerminalChrome {
  readonly root: HTMLDivElement;
  readonly content: HTMLPreElement;
}

function createTerminalChrome(os: OsVariant): TerminalChrome {
  const root = document.createElement('div');
  root.classList.add(
    'destruction-terminal',
    os === 'mac' ? 'destruction-terminal-mac' : 'destruction-terminal-win',
  );
  root.dataset['os'] = os;
  root.appendChild(buildTitlebar(os));
  const content = document.createElement('pre');
  content.classList.add('destruction-terminal__content');
  root.appendChild(content);
  return { root, content };
}

function buildTitlebar(os: OsVariant): HTMLDivElement {
  const bar = document.createElement('div');
  bar.classList.add('destruction-terminal__titlebar');
  if (os === 'mac') {
    bar.appendChild(buildTrafficLights());
    const title = document.createElement('span');
    title.textContent = 'Terminal — bash — 100x40';
    bar.appendChild(title);
  } else {
    const title = document.createElement('span');
    title.textContent = 'Windows PowerShell';
    bar.appendChild(title);
    bar.appendChild(buildWinControls());
  }
  return bar;
}

function buildTrafficLights(): HTMLDivElement {
  const container = document.createElement('div');
  container.classList.add('destruction-terminal__traffic-lights');
  const colors: readonly string[] = ['#FF5F57', '#FFBD2E', '#28C840'];
  for (const color of colors) {
    const dot = document.createElement('span');
    dot.classList.add('destruction-terminal__traffic-light');
    dot.style.background = color;
    container.appendChild(dot);
  }
  return container;
}

function buildWinControls(): HTMLDivElement {
  const wrap = document.createElement('div');
  wrap.classList.add('destruction-terminal__win-controls');
  for (const glyph of ['−', '□', '×']) {
    const span = document.createElement('span');
    span.textContent = glyph;
    wrap.appendChild(span);
  }
  return wrap;
}

/* ------------------------------------------------------------------------ */
/* Line append + cursor management                                          */
/* ------------------------------------------------------------------------ */

function appendLine(
  terminal: TerminalChrome,
  text: string,
  withCursor: boolean,
): void {
  const removeExistingCursor = terminal.content.querySelector(
    '.destruction-typewriter-cursor',
  );
  if (removeExistingCursor !== null) {
    removeExistingCursor.remove();
  }
  /* Each new line is a flat text append for the streaming path; the
   * "active typing" line is mutated via updateLastTypingLine. We store
   * the active line in a separate child so the rapid streaming path
   * remains O(1) per line. */
  if (terminal.content.lastChild?.nodeType !== Node.TEXT_NODE) {
    terminal.content.appendChild(document.createTextNode(''));
  }
  const lastText = terminal.content.lastChild as Text;
  lastText.data += `${text}\n`;
  if (withCursor) {
    terminal.content.appendChild(buildCursorElement());
    markActiveTypingLine(terminal, text);
  }
  terminal.content.scrollTop = terminal.content.scrollHeight;
}

function updateLastTypingLine(terminal: TerminalChrome, content: string): void {
  const lastText = terminal.content.lastChild?.previousSibling;
  if (lastText !== null && lastText !== undefined && lastText.nodeType === Node.TEXT_NODE) {
    const node = lastText as Text;
    const prefix = node.data.split('\n').slice(0, -2).join('\n');
    node.data = prefix === '' ? `${content}\n` : `${prefix}\n${content}\n`;
  }
  terminal.content.scrollTop = terminal.content.scrollHeight;
}

function finalizeTypingLine(terminal: TerminalChrome): void {
  const cursor = terminal.content.querySelector('.destruction-typewriter-cursor');
  if (cursor !== null) {
    cursor.remove();
  }
  terminal.content.appendChild(buildCursorElement());
}

function markActiveTypingLine(terminal: TerminalChrome, _initial: string): void {
  void terminal;
  void _initial;
}

function buildCursorElement(): HTMLSpanElement {
  const cursor = document.createElement('span');
  cursor.classList.add('destruction-typewriter-cursor');
  // Drive blink speed from SSOT constant so CSS and JS stay in sync.
  const blinkMs = Math.round(1000 / TYPEWRITER_CURSOR_BLINK_HZ);
  cursor.style.setProperty('--cursor-blink-ms', `${blinkMs}ms`);
  return cursor;
}

/* ------------------------------------------------------------------------ */
/* Timing helpers                                                           */
/* ------------------------------------------------------------------------ */

function computeOutputWindowMs(): number {
  /* Designer §5: setup = prompt pause + command typing duration +
   * password typing duration + Enter pause. The output window is the
   * remainder of Faz 3. All four durations derived from SSOT or local
   * designer-prose constants — zero magic numbers. */
  const commandText = 'sudo rm -rf / --no-preserve-root';
  const passwordText = '********';
  const commandTypingMs =
    (commandText.length / TYPEWRITER_COMMAND_CHARS_PER_SEC) * 1000;
  const passwordTypingMs =
    (passwordText.length / TERMINAL_PASSWORD_CHARS_PER_SEC) * 1000;
  const setupMs =
    TERMINAL_PROMPT_PAUSE_MS +
    commandTypingMs +
    passwordTypingMs +
    TERMINAL_ENTER_PAUSE_MS;
  return Math.max(0, FAZ_3_TERMINAL_DURATION_MS - setupMs);
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve): void => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const id = window.setTimeout((): void => resolve(), ms);
    signal.addEventListener(
      'abort',
      (): void => {
        window.clearTimeout(id);
        resolve();
      },
      { once: true },
    );
  });
}

function scheduleBleed2(args: Faz3RunArgs): void {
  /* Faz 3 entry from bang = FAZ_0 + FAZ_1 + FAZ_2; bleed offset within
   * Faz 3 = APARTMENT_BLEED_2_TRIGGER_MS - (Faz 0 + 1 + 2).
   * No hardcoded "12000" — derived from SSOT so changes propagate. */
  const fazEntryFromBangMs =
    FAZ_0_BANG_DURATION_MS +
    FAZ_1_DIALOG_DURATION_MS +
    FAZ_2_TAKEOVER_DURATION_MS;
  const offsetInFaz = APARTMENT_BLEED_2_TRIGGER_MS - fazEntryFromBangMs;
  const id = window.setTimeout((): void => {
    if (args.signal.aborted) {
      return;
    }
    void args.apartmentBleed.triggerBleed('bleed-2');
  }, Math.max(0, offsetInFaz));
  args.signal.addEventListener(
    'abort',
    (): void => window.clearTimeout(id),
    { once: true },
  );
}

function waitWindow(signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve): void => {
    const id = window.setTimeout(
      (): void => resolve(),
      FAZ_3_TERMINAL_DURATION_MS,
    );
    signal.addEventListener(
      'abort',
      (): void => {
        window.clearTimeout(id);
        resolve();
      },
      { once: true },
    );
  });
}
