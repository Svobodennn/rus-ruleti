/**
 * macOS Finder-style "Securely erasing disk…" progress dialog — Sprint 5
 * Phase 2B Lane C FILL.
 *
 * WHO CALLS THIS: faz4-file-wipe.ts#mountProgressDialog (Mac branch).
 *
 * SHARED RESOURCES OWNED: none (all timers driving the setters are OWNED
 * by faz4-file-wipe.ts per the owner-decree constants —
 * PROGRESS_BAR_REGRESSION_TIMER_OWNER, ETA_GROWTH_TIMER_OWNER,
 * ITEMS_REMAINING_TIMER_OWNER, FILE_PATH_SCROLL_TIMER_OWNER).
 *
 * CALLEES (Phase 2B Lane C wires):
 *   - inline DOM construction
 *   - i18n/strings.ts `t(key, locale)` for headline, subhead, items-remaining,
 *     estimated-time, cancel button labels (Lane 0 published the keys)
 *
 * Visual specs (destruction-direction.md §11 Mac variant + Phase 2A
 * constants):
 *   - Finder-style sheet: top-attached at 35% viewport top (Apple HIG
 *     sheets attach below window title bar, NOT vertical centre).
 *   - Modal dimensions: FAZ4_MAC_DIALOG_WIDTH_PX (480) ×
 *     FAZ4_MAC_DIALOG_HEIGHT_PX (220).
 *   - Background FAZ4_MAC_DIALOG_BG_COLOR (#ECECEC), foreground
 *     FAZ4_MAC_DIALOG_FG_COLOR (#1D1D1F), rounded corners 12px.
 *   - Designer-fictional eaten-apple SVG header — REUSES Sprint 4
 *     `mac-dialog.ts` SVG path data verbatim (designer-fictional silhouette,
 *     NOT real Apple logo per S6 closure / Sprint 4 Lesson #4).
 *     Size ~64px (per brief — larger than dialog 16px, smaller than
 *     bootloop 72px).
 *   - Progress bar: WebKit progress-indicator style — rounded blue fill
 *     FAZ4_PROGRESS_BAR_FG_MAC (#0096FF) on track FAZ4_PROGRESS_BAR_TRACK_MAC
 *     (#D6D6D6), 6px height.
 *   - File-path readout: monospace small, animated horizontal scroll
 *     (cadence driven externally via setFilePath()).
 *   - Cancel button: greyed (opacity 0.4; cursor: default), tabIndex={-1},
 *     aria-disabled="true". Label from t('destruction.faz4.mac.cancel').
 *
 * Setter methods (called by Faz 4 runner on independent timers):
 *   - setProgress(percent): updates bar width 0-100%
 *   - setEta(label): swaps ETA caption text
 *   - setItemsRemaining(count): swaps items-remaining counter
 *   - setFilePath(path): updates the file-path readout
 *
 * Reduced-motion gate (designer Phase 2A §16 rows 23-27):
 *   - Modal entry opacity: instant snap-in (CSS handles).
 *   - Progress bar: still receives setter calls (functional joke);
 *     the BAR width transition is gated OFF in CSS so updates snap.
 *   - File-path readout: holds single static line; horizontal scroll
 *     disabled (no animation declared here; CSS gates the marquee).
 *
 * ARIA (matrix row 23):
 *   - Root: role="dialog" aria-busy="true" aria-modal="true"
 *     aria-labelledby={headlineId}
 *   - Cancel button: role="button" aria-disabled="true"
 *
 * NO SF Pro / Helvetica Neue Light bundled — `-apple-system` reference only
 * (S6 closure + Sprint 4 Lesson #4).
 */

import type { MacProgressDialogHandle } from '../types.js';
import {
  FAZ4_MAC_DIALOG_WIDTH_PX,
  FAZ4_MAC_DIALOG_HEIGHT_PX,
  FAZ4_MAC_DIALOG_BG_COLOR,
  FAZ4_MAC_DIALOG_FG_COLOR,
  FAZ4_PROGRESS_BAR_TRACK_MAC,
  FAZ4_PROGRESS_BAR_FG_MAC,
  FAZ4_CANCEL_BUTTON_BG_COLOR,
  FAZ4_FILE_PATH_VIEWPORT_HEIGHT_PX,
  PREFERS_REDUCED_MOTION_QUERY,
} from '../../../../shared/scene-destruction-constants.js';
import { resolveUserLocale, t } from '../../../i18n/strings.js';

/* ------------------------------------------------------------------------ */
/* Local layout constants — Phase 2A §11 spec values                        */
/* ------------------------------------------------------------------------ */

/** Apple silhouette mono fill — matches Sprint 4 mac-dialog.ts. */
const APPLE_GLYPH_FILL = '#1D1D1F';
/** Header apple SVG dimension (CSS px). Brief: ~64px header. */
const HEADER_APPLE_SIZE_PX = 64;
/** Progress bar width as percentage of modal — Phase 2A §11: 80% (= 384px). */
const PROGRESS_BAR_WIDTH_PCT = 80;
/** Progress bar height (CSS px). Phase 2A §11 Mac uses 6px (Win uses 4px). */
const PROGRESS_BAR_HEIGHT_PX = 6;
/** Cancel button width (CSS px). Phase 2A §11: 80px × 28px. */
const CANCEL_BUTTON_WIDTH_PX = 80;
/** Cancel button height. */
const CANCEL_BUTTON_HEIGHT_PX = 28;
/** Modal corner radius — matches Sprint 4 §3 Mac dialog. */
const MODAL_CORNER_RADIUS_PX = 12;
/** Modal padding (CSS px). Sheet padding gives breathing room. */
const MODAL_PADDING_PX = 20;
/** Drop shadow — heavier than Sprint 4 dialog because the sheet sits on a
 *  fullscreen takeover, not just a blurred backdrop (Phase 2A §11). */
const MODAL_SHADOW = '0 16px 48px rgba(0, 0, 0, 0.4)';
/** Modal vertical anchor — Phase 2A §11: 35% from viewport top. */
const MODAL_TOP_PCT = '35%';
/** Z-index — Phase 2A §13 z-index map: Faz 4 modal = 9200. */
const MODAL_Z_INDEX = '9200';
/** Greyed cancel-button opacity — visibly disabled (brief: 0.4). */
const CANCEL_BUTTON_OPACITY = 0.4;

/* ------------------------------------------------------------------------ */
/* Designer-fictional eaten-apple SVG                                       */
/*                                                                          */
/* REUSED from Sprint 4 chrome/mac-dialog.ts. Same path data, single        */
/* monochrome fill, same hand-authored "apple-family" silhouette that is    */
/* NOT trademark-identical to Apple Inc.'s glyph. Sized to                  */
/* HEADER_APPLE_SIZE_PX (64) for the progress dialog header.                */
/* ------------------------------------------------------------------------ */

const APPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${HEADER_APPLE_SIZE_PX}" height="${HEADER_APPLE_SIZE_PX}" aria-hidden="true">
  <path fill="${APPLE_GLYPH_FILL}" d="M18.5,5.2 C18.2,3.9 19.1,2.4 20.6,2.6 C20.9,3.9 20,5.4 18.5,5.2 Z"/>
  <path fill="${APPLE_GLYPH_FILL}" fill-rule="evenodd" d="M16.2,8 C12.7,7.8 9.2,9.3 7.4,12.4 C5.4,15.8 5.7,20.4 8.1,23.7 C9.7,25.8 12.4,27.5 15,27.3 C16,27.2 16.9,26.7 17.9,26.7 C18.9,26.7 19.8,27.2 20.8,27.3 C23.4,27.5 25.8,25.6 27.2,23.4 C26.1,22.8 25.1,22 24.4,21 C22.3,18.2 22.9,14.2 25.7,12.4 C24.4,10.5 22.2,9.4 19.9,9.4 C18.6,9.4 17.3,10 16.2,8 Z M22.2,11.2 C22.4,9.7 23.4,8.4 24.9,7.7 C25,9.1 24.4,10.5 23.4,11.4 C22.9,11.8 22.5,11.6 22.2,11.2 Z"/>
</svg>`;

/* ------------------------------------------------------------------------ */
/* DOM builders (each ≤50L per max-lines-per-function discipline).          */
/* ------------------------------------------------------------------------ */

/** Build the modal root element with Finder-sheet positioning + chrome. */
function buildModalRoot(headlineId: string): HTMLDivElement {
  const root = document.createElement('div');
  root.className = 'faz4-progress-dialog faz4-mac-progress-dialog os-mac';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-busy', 'true');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', headlineId);
  const s = root.style;
  s.position = 'fixed';
  s.top = MODAL_TOP_PCT;
  s.left = '50%';
  s.transform = 'translate(-50%, -50%)';
  s.zIndex = MODAL_Z_INDEX;
  s.width = `${FAZ4_MAC_DIALOG_WIDTH_PX}px`;
  s.height = `${FAZ4_MAC_DIALOG_HEIGHT_PX}px`;
  s.background = FAZ4_MAC_DIALOG_BG_COLOR;
  s.color = FAZ4_MAC_DIALOG_FG_COLOR;
  s.borderRadius = `${MODAL_CORNER_RADIUS_PX}px`;
  s.boxShadow = MODAL_SHADOW;
  s.fontFamily = "-apple-system, BlinkMacSystemFont, sans-serif";
  s.padding = `${MODAL_PADDING_PX}px`;
  s.boxSizing = 'border-box';
  s.display = 'flex';
  s.flexDirection = 'column';
  s.gap = '12px';
  return root;
}

/** Build the header row: eaten-apple SVG + headline text. */
function buildHeaderRow(
  headlineId: string,
  locale: ReturnType<typeof resolveUserLocale>,
): { row: HTMLDivElement; subhead: HTMLDivElement } {
  const row = document.createElement('div');
  row.className = 'faz4-mac-progress-dialog__header';
  const s = row.style;
  s.display = 'flex';
  s.flexDirection = 'row';
  s.alignItems = 'center';
  s.gap = '14px';

  const icon = document.createElement('div');
  icon.className = 'faz4-mac-progress-dialog__apple';
  icon.style.width = `${HEADER_APPLE_SIZE_PX}px`;
  icon.style.height = `${HEADER_APPLE_SIZE_PX}px`;
  icon.style.flexShrink = '0';
  icon.innerHTML = APPLE_SVG;

  const textBlock = document.createElement('div');
  textBlock.style.display = 'flex';
  textBlock.style.flexDirection = 'column';
  textBlock.style.gap = '4px';

  const headline = document.createElement('div');
  headline.id = headlineId;
  headline.textContent = t('destruction.faz4.mac.headline', locale);
  headline.style.fontSize = '14px';
  headline.style.fontWeight = '600';
  headline.style.lineHeight = '1.3';

  const subhead = document.createElement('div');
  subhead.className = 'faz4-mac-progress-dialog__subhead';
  subhead.textContent = t('destruction.faz4.mac.subhead', locale);
  subhead.style.fontSize = '13px';
  subhead.style.fontWeight = '400';
  subhead.style.lineHeight = '1.4';
  subhead.style.opacity = '0.75';

  textBlock.append(headline, subhead);
  row.append(icon, textBlock);
  return { row, subhead };
}

/**
 * Build the file-path readout. Single-line monospace. Set via setFilePath()
 * from Faz 4 runner cadence (12Hz scroll through 18-template cycle).
 */
function buildFilePathReadout(): HTMLDivElement {
  const readout = document.createElement('div');
  readout.className = 'faz4-mac-progress-dialog__filepath';
  readout.setAttribute('role', 'log');
  readout.setAttribute('aria-live', 'polite');
  const s = readout.style;
  s.fontFamily = 'ui-monospace, "SF Mono", Menlo, monospace';
  s.fontSize = '11px';
  s.lineHeight = '1.4';
  s.height = `${FAZ4_FILE_PATH_VIEWPORT_HEIGHT_PX}px`;
  s.overflow = 'hidden';
  s.whiteSpace = 'nowrap';
  s.textOverflow = 'ellipsis';
  s.opacity = '0.7';
  s.padding = '4px 8px';
  s.background = 'rgba(0, 0, 0, 0.04)';
  s.borderRadius = '4px';
  return readout;
}

/**
 * Build the progress bar. Track + fill <div>s; the fill width is patched
 * by setProgress(percent). Rounded ends (Mac convention — Win uses square).
 */
function buildProgressBar(initialProgress: number): {
  bar: HTMLDivElement;
  fill: HTMLDivElement;
} {
  const bar = document.createElement('div');
  bar.className = 'faz4-mac-progress-dialog__bar';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  bar.setAttribute('aria-valuenow', String(initialProgress));
  const bs = bar.style;
  bs.width = `${PROGRESS_BAR_WIDTH_PCT}%`;
  bs.height = `${PROGRESS_BAR_HEIGHT_PX}px`;
  bs.background = FAZ4_PROGRESS_BAR_TRACK_MAC;
  bs.borderRadius = `${PROGRESS_BAR_HEIGHT_PX / 2}px`;
  bs.alignSelf = 'center';
  bs.overflow = 'hidden';

  const fill = document.createElement('div');
  fill.className = 'faz4-mac-progress-dialog__fill';
  const fs = fill.style;
  fs.height = '100%';
  fs.width = `${Math.max(0, Math.min(100, initialProgress))}%`;
  fs.background = FAZ4_PROGRESS_BAR_FG_MAC;
  fs.borderRadius = `${PROGRESS_BAR_HEIGHT_PX / 2}px`;
  fs.transition = 'width 200ms ease-out';
  bar.appendChild(fill);
  return { bar, fill };
}

/**
 * Build the items-remaining + ETA caption block (both come from i18n
 * templates with {n} / {label} tokens — see Lane 0 handoff for the
 * brace-exact contract). Returns the live <div>s so the setters can
 * patch text in O(1).
 */
function buildCounterBlock(
  locale: ReturnType<typeof resolveUserLocale>,
): {
  block: HTMLDivElement;
  itemsNode: HTMLDivElement;
  itemsTemplate: string;
  etaNode: HTMLDivElement;
  etaTemplate: string;
} {
  const block = document.createElement('div');
  block.className = 'faz4-mac-progress-dialog__counters';
  block.style.display = 'flex';
  block.style.flexDirection = 'column';
  block.style.gap = '4px';
  block.style.fontSize = '12px';
  block.style.lineHeight = '1.4';

  const itemsTemplate = t('destruction.faz4.mac.itemsRemaining', locale);
  const items = document.createElement('div');
  items.className = 'faz4-mac-progress-dialog__items';
  items.setAttribute('role', 'status');
  items.textContent = itemsTemplate.replace('{n}', '—');

  const etaTemplate = t('destruction.faz4.mac.estimatedTime', locale);
  const eta = document.createElement('div');
  eta.className = 'faz4-mac-progress-dialog__eta';
  eta.setAttribute('role', 'status');
  eta.textContent = etaTemplate.replace('{label}', '—');

  block.append(items, eta);
  return { block, itemsNode: items, itemsTemplate, etaNode: eta, etaTemplate };
}

/**
 * Build the greyed Cancel button. tabIndex=-1 + aria-disabled="true" +
 * cursor:default keeps it non-interactive and announced as disabled.
 */
function buildCancelButton(label: string): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'faz4-mac-progress-dialog__cancel';
  btn.textContent = label;
  btn.setAttribute('aria-disabled', 'true');
  btn.disabled = true;
  btn.tabIndex = -1;
  const s = btn.style;
  s.width = `${CANCEL_BUTTON_WIDTH_PX}px`;
  s.height = `${CANCEL_BUTTON_HEIGHT_PX}px`;
  s.background = FAZ4_CANCEL_BUTTON_BG_COLOR;
  s.color = '#FFFFFF';
  s.border = 'none';
  s.borderRadius = '6px';
  s.fontFamily = 'inherit';
  s.fontSize = '13px';
  s.fontWeight = '400';
  s.cursor = 'default';
  s.opacity = String(CANCEL_BUTTON_OPACITY);
  s.alignSelf = 'flex-end';
  s.marginTop = 'auto';
  return btn;
}

/* ------------------------------------------------------------------------ */
/* Compose helper — assembles root + children, returns inner refs so the    */
/* mount function can pass them into setter closures. Keeps                 */
/* mountMacProgressDialog under 50 lines per lint discipline.               */
/* ------------------------------------------------------------------------ */

interface ProgressDialogComposed {
  root: HTMLDivElement;
  bar: HTMLDivElement;
  fill: HTMLDivElement;
  counters: ReturnType<typeof buildCounterBlock>;
  filePathReadout: HTMLDivElement;
}

function composeProgressDialog(
  initialProgress: number,
  reducedMotion: boolean,
  locale: ReturnType<typeof resolveUserLocale>,
): ProgressDialogComposed {
  const headlineId = `faz4-mac-progress-headline-${Math.random().toString(36).slice(2, 9)}`;
  const root = buildModalRoot(headlineId);
  const { row: header } = buildHeaderRow(headlineId, locale);
  const { bar, fill } = buildProgressBar(initialProgress);
  const counters = buildCounterBlock(locale);
  const filePathReadout = buildFilePathReadout();
  const cancel = buildCancelButton(t('destruction.faz4.mac.cancel', locale));
  root.append(header, bar, counters.block, filePathReadout, cancel);
  if (reducedMotion) {
    fill.style.transition = 'none';
  }
  return { root, bar, fill, counters, filePathReadout };
}

/* ------------------------------------------------------------------------ */
/* Public mount                                                             */
/* ------------------------------------------------------------------------ */

/** Mount-arg bag. */
export interface MountMacProgressDialogArgs {
  readonly hostElement: HTMLElement;
  readonly initialProgress: number;
  readonly signal: AbortSignal;
}

/**
 * Mount the Mac progress dialog into the destruction container. Returns
 * a handle whose four setters update the live counters and `dispose()`
 * removes the dialog.
 *
 * Reduced-motion: the modal still renders (functional joke); the bar's
 * width transition is disabled so updates snap (matrix row 23).
 */
export function mountMacProgressDialog(
  args: MountMacProgressDialogArgs,
): MacProgressDialogHandle {
  const locale = resolveUserLocale();
  const reducedMotion = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;
  const composed = composeProgressDialog(args.initialProgress, reducedMotion, locale);
  args.hostElement.appendChild(composed.root);

  let disposed = false;
  const onAbort = (): void => {
    if (disposed) return;
    handle.dispose();
  };
  args.signal.addEventListener('abort', onAbort, { once: true });

  const handle: MacProgressDialogHandle = {
    kind: 'mac-progress-dialog',
    element: composed.root,
    setProgress: (percent: number): void => {
      if (disposed) return;
      const clamped = Math.max(0, Math.min(100, percent));
      composed.fill.style.width = `${clamped}%`;
      composed.bar.setAttribute('aria-valuenow', String(Math.round(clamped)));
    },
    setEta: (label: string): void => {
      if (disposed) return;
      composed.counters.etaNode.textContent =
        composed.counters.etaTemplate.replace('{label}', label);
    },
    setItemsRemaining: (count: number): void => {
      if (disposed) return;
      const formatted = count.toLocaleString(locale === 'ru' ? 'ru-RU' : 'tr-TR');
      composed.counters.itemsNode.textContent =
        composed.counters.itemsTemplate.replace('{n}', formatted);
    },
    setFilePath: (path: string): void => {
      if (disposed) return;
      composed.filePathReadout.textContent = path;
    },
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      args.signal.removeEventListener('abort', onAbort);
      composed.root.remove();
    },
  };
  return handle;
}
