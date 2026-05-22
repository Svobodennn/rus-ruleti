/**
 * Win11 File Explorer "copy dialog" progress mimic — Sprint 5 Phase 2B
 * Lane D FILL.
 *
 * Pixel-faithful Win11 File Explorer copy-style sheet per directive §4.2
 * and Phase 2A art bible §10. Composition (top-to-bottom):
 *
 *   - Title bar: designer-fictional four-square SVG (REUSED from
 *     win-dialog.ts — single gradient, NOT four-color, NOT the real
 *     Win11 trademark) + "Dosyalar siliniyor…" headline + greyed
 *     out X close button (right-aligned, tabIndex -1, aria-disabled
 *     true; clicks are no-ops).
 *   - Subtitle: localised sub-headline ("Dosya Gezgini güvenli şekilde
 *     siliyor").
 *   - File path readout: monospace small (Consolas → ui-monospace
 *     fallback). Horizontal scroll animation at 12Hz (Lane A's owner
 *     setter drives the content; this lane provides the host element +
 *     the per-frame transform animation).
 *   - Progress bar: Win11 fluent style — rounded blue fill
 *     (FAZ4_PROGRESS_BAR_FG_WIN=#0078D4) on a light grey track.
 *   - Items-remaining + ETA labels: live counters below the bar; updated
 *     via setter API.
 *
 * SHARED RESOURCES OWNED:
 *   - none. All four setters are pure DOM patches. The driving timers
 *     (PROGRESS_BAR_REGRESSION_TIMER_OWNER, ETA_GROWTH_TIMER_OWNER,
 *     ITEMS_REMAINING_TIMER_OWNER, FILE_PATH_SCROLL_TIMER_OWNER) all
 *     live in `faz4-file-wipe.ts` (Lane A). This module is a passive
 *     view layer — it never starts a timer of its own.
 *
 * Reduced-motion (a11y matrix rows 23-27):
 *   - Progress bar regression: still ticks (functional joke — Lane A
 *     owner decides whether to hold).
 *   - File path scroll: capped at 1/4 cadence (Lane A enforces);
 *     this view simply renders whatever path string Lane A passes.
 *   - Modal entry opacity: no fade-in (we never add one; modal is
 *     present instantly).
 *
 * ARIA (a11y matrix rows 23-27):
 *   - root role="dialog" aria-busy="true" aria-modal="true"
 *   - X button role="button" aria-disabled="true" tabIndex=-1
 *   - items-remaining + ETA caption role="status"
 *   - file-path readout role="log" aria-live (gated under reduced-motion)
 *
 * S6 risk closure:
 *   - Four-square header SVG: REUSED from Sprint 4 win-dialog.ts —
 *     designer-fictional 2x2 grid with a single gradient across all
 *     four squares (NOT the real Microsoft Windows logo).
 *   - Segoe UI Variable / Cascadia Code: system stack fallbacks ONLY.
 *
 * Called by:
 *   - faz4-file-wipe.ts when os === 'win':
 *     `const dlg = mountWinProgressDialog({...});
 *      dlg.setProgress(80); dlg.setFilePath('removed C:\\…'); …`
 */

import {
  FAZ4_WIN_DIALOG_WIDTH_PX,
  FAZ4_WIN_DIALOG_HEIGHT_PX,
  FAZ4_WIN_DIALOG_BG_COLOR,
  FAZ4_WIN_DIALOG_FG_COLOR,
  FAZ4_PROGRESS_BAR_TRACK_WIN,
  FAZ4_PROGRESS_BAR_FG_WIN,
  FAZ4_CANCEL_BUTTON_BG_COLOR,
  FAZ4_FILE_PATH_VIEWPORT_HEIGHT_PX,
  FAZ4_PROGRESS_INITIAL_PERCENT,
  FAZ4_ITEMS_REMAINING_INITIAL,
  FAZ4_ETA_GROWTH_STEPS,
  PREFERS_REDUCED_MOTION_QUERY,
} from '../../../../shared/scene-destruction-constants.js';
import type { WinProgressDialogHandle } from '../types.js';
import { resolveUserLocale, t } from '../../../i18n/strings.js';
import { createWinFourSquareLogo } from './_shared/win-four-square-logo.js';

/* ------------------------------------------------------------------------ */
/* Local design tokens                                                      */
/* ------------------------------------------------------------------------ */

/** Z-index — sits above destruction overlay, below CRT (per destruction.css map). */
const WIN_PROGRESS_Z_INDEX = 9300;
/** Title-bar height (CSS px) — Win11 File Explorer title strip. */
const WIN_TITLE_BAR_HEIGHT_PX = 32;
/** Progress bar height (CSS px) — Win11 fluent slim bar. */
const WIN_PROGRESS_BAR_HEIGHT_PX = 4;
/** Progress bar corner radius — rounded fluent style. */
const WIN_PROGRESS_BAR_RADIUS_PX = 2;
/** Modal corner radius — Win11 standard 8px (shared with win-dialog.ts). */
const WIN_PANEL_RADIUS_PX = 8;
/** X close button size (CSS px) — Win11 caption-button width. */
const WIN_X_BUTTON_WIDTH_PX = 46;
/** Four-square logo SVG dimensions (CSS px) — matches win-dialog.ts taste. */
const WIN_LOGO_SIZE_PX = 16;
/** Greyed X button opacity — disabled affordance per a11y matrix row 24. */
const WIN_X_DISABLED_OPACITY = 0.4;
/** Win11 fluent elevation shadow — same stack as win-dialog.ts. */
const WIN_ELEVATION_SHADOW =
  '0 1px 2px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.12)';
/** Title font stack — Win11 Segoe UI Variable system fallback. */
const WIN_FONT_STACK = "system-ui, 'Segoe UI Variable', 'Segoe UI', sans-serif";
/** Monospace font stack — Cascadia Code system fallback for the file path readout. */
const WIN_MONO_STACK = "'Cascadia Code', 'Consolas', ui-monospace, monospace";

/* ------------------------------------------------------------------------ */
/* i18n helper (mirrors win-bsod.ts pattern)                                */
/* ------------------------------------------------------------------------ */

function localise(
  key: Parameters<typeof t>[0],
  locale: ReturnType<typeof resolveUserLocale>,
  fallback: string,
  tokens?: Readonly<Record<string, string>>,
): string {
  const raw = t(key, locale);
  let value = raw === key ? fallback : raw;
  if (tokens !== undefined) {
    for (const [name, replacement] of Object.entries(tokens)) {
      value = value.split(`{${name}}`).join(replacement);
    }
  }
  return value;
}

/* ------------------------------------------------------------------------ */
/* DOM builders                                                             */
/* ------------------------------------------------------------------------ */

/**
 * Build the designer-fictional four-square Win logo SVG. Delegates to
 * the shared helper in `_shared/win-four-square-logo.ts`. The geometry
 * is IDENTICAL to Sprint 4 win-dialog.ts (single gradient across all
 * four squares — NOT the real Microsoft trademark). See the helper
 * module for S6 risk closure rationale.
 */
function createWinLogo(): SVGSVGElement {
  return createWinFourSquareLogo(WIN_LOGO_SIZE_PX);
}

/**
 * Build the title bar — four-square logo + headline + greyed X button.
 * The X button is cosmetic only; clicks are no-ops, tabIndex is -1 so it
 * cannot receive keyboard focus, aria-disabled signals to AT users.
 */
/** Build the left cluster of the title bar — logo + headline text. */
function createTitleLeftCluster(
  locale: ReturnType<typeof resolveUserLocale>,
): HTMLDivElement {
  const left = document.createElement('div');
  left.style.display = 'flex';
  left.style.alignItems = 'center';
  left.style.gap = '8px';
  left.appendChild(createWinLogo());
  const headline = document.createElement('div');
  headline.dataset.role = 'win-progress-headline';
  headline.textContent = localise(
    'destruction.faz4.win.headline',
    locale,
    'File Explorer is wiping files…',
  );
  headline.style.fontSize = '13px';
  headline.style.fontWeight = '600';
  left.appendChild(headline);
  return left;
}

/** Build the greyed-out close (X) button — visual only, no real interaction. */
function createGreyedXButton(
  locale: ReturnType<typeof resolveUserLocale>,
): HTMLButtonElement {
  const xBtn = document.createElement('button');
  xBtn.type = 'button';
  xBtn.dataset.role = 'win-progress-x';
  xBtn.textContent = '×'; // × multiplication sign — Win11 caption convention
  xBtn.setAttribute('aria-disabled', 'true');
  xBtn.setAttribute(
    'aria-label',
    localise('destruction.faz4.win.cancelTitle', locale, 'Stop'),
  );
  xBtn.tabIndex = -1;
  const xs = xBtn.style;
  xs.width = `${WIN_X_BUTTON_WIDTH_PX}px`;
  xs.height = `${WIN_TITLE_BAR_HEIGHT_PX}px`;
  xs.background = FAZ4_CANCEL_BUTTON_BG_COLOR;
  xs.color = '#FFFFFF';
  xs.border = '0';
  xs.fontSize = '14px';
  xs.fontFamily = WIN_FONT_STACK;
  xs.cursor = 'default';
  xs.opacity = String(WIN_X_DISABLED_OPACITY);
  // Visual-only — block any click reaching the parent host (defensive
  // even though the destruction overlay is pointer-events: none).
  xBtn.addEventListener('click', (evt): void => evt.preventDefault());
  return xBtn;
}

function createTitleBar(
  locale: ReturnType<typeof resolveUserLocale>,
): HTMLDivElement {
  const bar = document.createElement('div');
  bar.dataset.role = 'win-progress-titlebar';
  const s = bar.style;
  s.display = 'flex';
  s.alignItems = 'center';
  s.justifyContent = 'space-between';
  s.height = `${WIN_TITLE_BAR_HEIGHT_PX}px`;
  s.padding = '0 0 0 12px';
  s.borderBottom = '1px solid #E5E5E5';
  bar.appendChild(createTitleLeftCluster(locale));
  bar.appendChild(createGreyedXButton(locale));
  return bar;
}

/** Build the subtitle (under the title bar). */
function createSubtitle(
  locale: ReturnType<typeof resolveUserLocale>,
): HTMLDivElement {
  const subtitle = document.createElement('div');
  subtitle.textContent = localise(
    'destruction.faz4.win.subhead',
    locale,
    'File Explorer is securely deleting files',
  );
  subtitle.style.fontSize = '12px';
  subtitle.style.fontWeight = '400';
  subtitle.style.opacity = '0.75';
  return subtitle;
}

/** Build the monospace file-path viewport + return both the wrapper and the inner span. */
function createPathViewport(reduceMotion: boolean): {
  viewport: HTMLDivElement;
  pathSpan: HTMLSpanElement;
} {
  const viewport = document.createElement('div');
  viewport.dataset.role = 'win-progress-path-viewport';
  viewport.setAttribute('role', 'log');
  viewport.setAttribute('aria-live', reduceMotion ? 'off' : 'polite');
  const pv = viewport.style;
  pv.height = `${FAZ4_FILE_PATH_VIEWPORT_HEIGHT_PX}px`;
  pv.overflow = 'hidden';
  pv.background = '#F4F4F4';
  pv.border = '1px solid #E0E0E0';
  pv.borderRadius = '4px';
  pv.padding = '8px';
  pv.fontFamily = WIN_MONO_STACK;
  pv.fontSize = '12px';
  pv.lineHeight = '1.4';
  pv.color = FAZ4_WIN_DIALOG_FG_COLOR;
  pv.whiteSpace = 'nowrap';
  pv.position = 'relative';
  const pathSpan = document.createElement('span');
  pathSpan.dataset.role = 'win-progress-path';
  pathSpan.textContent = '';
  viewport.appendChild(pathSpan);
  return { viewport, pathSpan };
}

/** Build the Win11 fluent progress bar (track + fill); return both. */
function createProgressBar(
  initialProgress: number,
  reduceMotion: boolean,
): { track: HTMLDivElement; fillDiv: HTMLDivElement } {
  const track = document.createElement('div');
  track.dataset.role = 'win-progress-track';
  track.setAttribute('role', 'progressbar');
  track.setAttribute('aria-valuemin', '0');
  track.setAttribute('aria-valuemax', '100');
  track.setAttribute('aria-valuenow', String(initialProgress));
  const ts = track.style;
  ts.height = `${WIN_PROGRESS_BAR_HEIGHT_PX}px`;
  ts.background = FAZ4_PROGRESS_BAR_TRACK_WIN;
  ts.borderRadius = `${WIN_PROGRESS_BAR_RADIUS_PX}px`;
  ts.overflow = 'hidden';
  const fillDiv = document.createElement('div');
  fillDiv.dataset.role = 'win-progress-fill';
  const fs = fillDiv.style;
  fs.height = '100%';
  fs.width = `${clampPercent(initialProgress)}%`;
  fs.background = FAZ4_PROGRESS_BAR_FG_WIN;
  fs.borderRadius = `${WIN_PROGRESS_BAR_RADIUS_PX}px`;
  fs.transition = reduceMotion ? 'none' : 'width 200ms ease-out';
  track.appendChild(fillDiv);
  return { track, fillDiv };
}

/** Build the bottom caption row (items + ETA spans, justified). */
function createCaptionRow(
  locale: ReturnType<typeof resolveUserLocale>,
): { row: HTMLDivElement; itemsSpan: HTMLSpanElement; etaSpan: HTMLSpanElement } {
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.justifyContent = 'space-between';
  row.style.fontSize = '12px';
  row.style.fontWeight = '400';
  row.style.color = FAZ4_WIN_DIALOG_FG_COLOR;
  const itemsSpan = document.createElement('span');
  itemsSpan.dataset.role = 'win-progress-items';
  itemsSpan.setAttribute('role', 'status');
  itemsSpan.textContent = localise(
    'destruction.faz4.win.itemsRemaining',
    locale,
    'Items remaining: {n}',
    { n: FAZ4_ITEMS_REMAINING_INITIAL.toLocaleString(locale === 'tr' ? 'tr-TR' : 'ru-RU') },
  );
  const etaSpan = document.createElement('span');
  etaSpan.dataset.role = 'win-progress-eta';
  etaSpan.setAttribute('role', 'status');
  etaSpan.textContent = localise(
    'destruction.faz4.win.estimatedTime',
    locale,
    'Estimated time remaining: {label}',
    { label: FAZ4_ETA_GROWTH_STEPS[0] },
  );
  row.appendChild(itemsSpan);
  row.appendChild(etaSpan);
  return { row, itemsSpan, etaSpan };
}

/**
 * Build the body region — subtitle + file path readout + progress bar +
 * items-remaining + ETA caption. Returns the body container plus the
 * mutable references the setters need (path span, fill div, items-span,
 * eta-span). The factory pattern avoids module-level mutable state and
 * keeps the handle setters as pure DOM patches.
 */
function createBody(
  locale: ReturnType<typeof resolveUserLocale>,
  initialProgress: number,
  reduceMotion: boolean,
): {
  body: HTMLDivElement;
  pathSpan: HTMLSpanElement;
  fillDiv: HTMLDivElement;
  itemsSpan: HTMLSpanElement;
  etaSpan: HTMLSpanElement;
} {
  const body = document.createElement('div');
  body.dataset.role = 'win-progress-body';
  const s = body.style;
  s.padding = '16px 20px';
  s.display = 'flex';
  s.flexDirection = 'column';
  s.gap = '12px';
  body.appendChild(createSubtitle(locale));
  const { viewport: pathViewport, pathSpan } = createPathViewport(reduceMotion);
  body.appendChild(pathViewport);
  const { track, fillDiv } = createProgressBar(initialProgress, reduceMotion);
  body.appendChild(track);
  const { row: captionRow, itemsSpan, etaSpan } = createCaptionRow(locale);
  body.appendChild(captionRow);
  return { body, pathSpan, fillDiv, itemsSpan, etaSpan };
}

/** Defensive clamp — Lane A passes 0-100 percents but a Sprint 6 hand-off might overshoot. */
function clampPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value < 0) {
    return 0;
  }
  if (value > 100) {
    return 100;
  }
  return value;
}

/* ------------------------------------------------------------------------ */
/* Mount entry point                                                        */
/* ------------------------------------------------------------------------ */

/** Mount-arg bag. */
export interface MountWinProgressDialogArgs {
  readonly hostElement: HTMLElement;
  readonly initialProgress: number;
  readonly signal: AbortSignal;
}

/**
 * Mount the Win11 progress dialog into the destruction container.
 * Returns a handle whose four setters update the live counters and
 * `dispose()` removes the dialog. The setters are pure DOM patches —
 * each is safe to call from any timer driven by Lane A.
 */
/**
 * Build the root backdrop wrapper that centres the modal in the
 * viewport. The destruction overlay is `pointer-events: none` so we set
 * our own backdrop tint here without intercepting clicks beyond the
 * BSOD region.
 */
function createBackdropRoot(): HTMLDivElement {
  const element = document.createElement('div');
  element.className = 'faz4-progress-dialog faz4-win-progress-dialog os-win';
  element.setAttribute('role', 'dialog');
  element.setAttribute('aria-busy', 'true');
  element.setAttribute('aria-modal', 'true');
  const es = element.style;
  es.position = 'fixed';
  es.inset = '0';
  es.display = 'flex';
  es.alignItems = 'center';
  es.justifyContent = 'center';
  es.zIndex = String(WIN_PROGRESS_Z_INDEX);
  es.background = 'rgba(0,0,0,0.2)';
  return element;
}

/** Build the inner white panel — Win11 fluent surface that hosts the title + body. */
function createPanel(): HTMLDivElement {
  const panel = document.createElement('div');
  panel.dataset.role = 'win-progress-panel';
  const ps = panel.style;
  ps.width = `${FAZ4_WIN_DIALOG_WIDTH_PX}px`;
  ps.height = `${FAZ4_WIN_DIALOG_HEIGHT_PX}px`;
  ps.background = FAZ4_WIN_DIALOG_BG_COLOR;
  ps.color = FAZ4_WIN_DIALOG_FG_COLOR;
  ps.borderRadius = `${WIN_PANEL_RADIUS_PX}px`;
  ps.boxShadow = WIN_ELEVATION_SHADOW;
  ps.fontFamily = WIN_FONT_STACK;
  ps.overflow = 'hidden';
  ps.display = 'flex';
  ps.flexDirection = 'column';
  return panel;
}

/**
 * Construct the WinProgressDialogHandle object that the mount returns.
 * Decomposed out of mountWinProgressDialog() so the public entry point
 * stays under the 50-line cap.
 */
function buildHandle(args: {
  readonly element: HTMLDivElement;
  readonly pathSpan: HTMLSpanElement;
  readonly fillDiv: HTMLDivElement;
  readonly itemsSpan: HTMLSpanElement;
  readonly etaSpan: HTMLSpanElement;
  readonly itemsTemplate: string;
  readonly etaTemplate: string;
  readonly locale: ReturnType<typeof resolveUserLocale>;
}): WinProgressDialogHandle {
  let disposed = false;
  const handle: WinProgressDialogHandle = {
    kind: 'win-progress-dialog',
    element: args.element,
    setProgress: (percent: number): void => {
      if (disposed) return;
      const clamped = clampPercent(percent);
      args.fillDiv.style.width = `${clamped}%`;
      const track = args.fillDiv.parentElement;
      if (track !== null) {
        track.setAttribute('aria-valuenow', String(Math.round(clamped)));
      }
    },
    setEta: (label: string): void => {
      if (disposed) return;
      args.etaSpan.textContent = args.etaTemplate.split('{label}').join(label);
    },
    setItemsRemaining: (count: number): void => {
      if (disposed) return;
      const localeTag = args.locale === 'tr' ? 'tr-TR' : 'ru-RU';
      const formatted = count.toLocaleString(localeTag);
      args.itemsSpan.textContent = args.itemsTemplate.split('{n}').join(formatted);
    },
    setFilePath: (path: string): void => {
      if (disposed) return;
      args.pathSpan.textContent = path;
    },
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      if (args.element.parentNode !== null) {
        args.element.parentNode.removeChild(args.element);
      }
    },
  };
  return handle;
}

export function mountWinProgressDialog(
  args: MountWinProgressDialogArgs,
): WinProgressDialogHandle {
  const reduceMotion = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;
  const locale = resolveUserLocale();
  const initialProgress = clampPercent(
    args.initialProgress > 0 ? args.initialProgress : FAZ4_PROGRESS_INITIAL_PERCENT,
  );
  const element = createBackdropRoot();
  const panel = createPanel();
  panel.appendChild(createTitleBar(locale));
  const { body, pathSpan, fillDiv, itemsSpan, etaSpan } = createBody(
    locale,
    initialProgress,
    reduceMotion,
  );
  panel.appendChild(body);
  element.appendChild(panel);
  args.hostElement.appendChild(element);
  // Cache the i18n templates so setters don't re-resolve through t() per tick.
  const itemsTemplate = localise(
    'destruction.faz4.win.itemsRemaining',
    locale,
    'Items remaining: {n}',
  );
  const etaTemplate = localise(
    'destruction.faz4.win.estimatedTime',
    locale,
    'Estimated time remaining: {label}',
  );
  const handle = buildHandle({
    element,
    pathSpan,
    fillDiv,
    itemsSpan,
    etaSpan,
    itemsTemplate,
    etaTemplate,
    locale,
  });
  if (args.signal.aborted) {
    handle.dispose();
  } else {
    args.signal.addEventListener('abort', (): void => handle.dispose(), { once: true });
  }
  return handle;
}
