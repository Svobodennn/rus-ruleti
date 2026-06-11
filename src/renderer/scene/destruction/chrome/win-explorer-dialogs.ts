/**
 * Faz 2B Windows File Explorer dialogs — the right-click context menu
 * (designer §8) and the fake "Access denied" error dialog (designer §9).
 * Split out of `win-explorer-views.ts` (400-line cap).
 *
 * This module owns the two overlay surfaces the explorer window summons on
 * top of its content body: the Win11 right-click context menu (leading line
 * icons, quiet grey hover, red trash icon on Delete + "Del" shortcut hint)
 * and the centred "Access denied" modal (white body / grey footer / SVG
 * red-circle icon + greyed no-op caption X). Both are pure factories with no
 * module-level mutable state and no timers (the window shell + runner own all
 * scheduling).
 *
 * i18n: every visible string resolves through `localise()` against the
 * `destruction.win.explorer.*` tree. NO emoji (all glyphs are SVG; the
 * caption-X is a unicode glyph mirroring the existing views chrome).
 *
 * WHO CALLS THIS: chrome/win-explorer.ts.
 */

import {
  FAZ_2B_COLOR,
  FAZ_2B_FONT_STACK,
  FAZ_2B_Z_ACCESS_DENIED,
  FAZ_2B_Z_CTX_MENU,
} from '../../../../shared/scene-destruction-constants.js';
import type { t } from '../../../i18n/strings.js';
import { localise, type ExplorerLocale } from './win-explorer-views.js';
import {
  createAccessDeniedIcon,
  createLineIcon,
  ICON_PATHS,
} from './win-explorer-icons.js';

/* ------------------------------------------------------------------------ */
/* Context menu (designer §8)                                               */
/* ------------------------------------------------------------------------ */

/** Fallback English labels keyed by the i18n ctx-menu key suffix. */
const CTX_FALLBACK: Readonly<Record<string, string>> = {
  ctxOpen: 'Open',
  ctxOpenNewWindow: 'Open in new window',
  ctxPin: 'Pin to Quick access',
  ctxRename: 'Rename',
  ctxDelete: 'Delete',
};

/** Leading-icon path lookup per ctx key (reuses the line-icon library). */
const CTX_ICON: Readonly<Record<string, readonly string[]>> = {
  ctxOpen: ['M3 7 h6 l2 2 h10 v10 H3 Z'],
  ctxOpenNewWindow: ['M5 5 h9 v9 H5 Z', 'M16 8 l3-3 M19 5 v4 M19 5 h-4'],
  ctxPin: ['M12 2 v7 M9 9 h6 l-1 5 h-4 Z M12 14 v6'],
  ctxRename: ICON_PATHS.rename ?? [],
  ctxDelete: ICON_PATHS.delete ?? [],
};

/** Build one context-menu item (leading icon + label, optional shortcut). */
function createCtxItem(key: string, locale: ExplorerLocale): HTMLDivElement {
  const item = document.createElement('div');
  item.dataset.role = 'win-explorer-ctx-item';
  item.dataset.ctxKey = key;
  const s = item.style;
  s.display = 'flex';
  s.alignItems = 'center';
  s.gap = '12px';
  s.height = '32px';
  s.margin = '0 2px';
  s.padding = '0 12px';
  s.fontSize = '13px';
  s.color = FAZ_2B_COLOR.text;
  s.borderRadius = '4px';
  s.cursor = 'default';
  const icon = createLineIcon(CTX_ICON[key] ?? [], 16);
  icon.dataset.role = 'win-explorer-ctx-icon';
  icon.style.flex = '0 0 16px';
  item.appendChild(icon);
  const label = document.createElement('span');
  label.style.flex = '1';
  label.textContent = localise(
    `destruction.win.explorer.${key}` as Parameters<typeof t>[0],
    locale,
    CTX_FALLBACK[key] ?? key,
  );
  item.appendChild(label);
  if (key === 'ctxDelete') item.appendChild(createShortcutHint('Del'));
  return item;
}

/** Build a right-aligned keyboard-shortcut hint (e.g. "Del"). */
function createShortcutHint(text: string): HTMLSpanElement {
  const hint = document.createElement('span');
  hint.style.fontSize = '12px';
  hint.style.color = FAZ_2B_COLOR.textCaption;
  hint.textContent = text;
  return hint;
}

/** Build a thin separator rule between menu groups. */
function createCtxSeparator(): HTMLDivElement {
  const sep = document.createElement('div');
  sep.dataset.role = 'win-explorer-ctx-separator';
  sep.style.height = '1px';
  sep.style.margin = '4px 8px';
  sep.style.background = FAZ_2B_COLOR.separator;
  return sep;
}

/**
 * Build the right-click context menu. Returns the menu element plus the
 * "Delete" item ref so the runner can target it with the ghost cursor. A
 * separator is inserted before "Rename" to match Win11 grouping.
 */
export function createContextMenu(
  ctxKeys: readonly string[],
  locale: ExplorerLocale,
): { element: HTMLDivElement; deleteItem: HTMLDivElement | null } {
  const menu = document.createElement('div');
  menu.dataset.role = 'win-explorer-ctx-menu';
  const s = menu.style;
  s.position = 'absolute';
  s.minWidth = '240px';
  s.padding = '4px';
  s.background = '#FBFBFB';
  s.border = '1px solid rgba(0,0,0,0.08)';
  s.borderRadius = '8px';
  s.boxShadow = '0 8px 20px rgba(0,0,0,0.18), 0 0 1px rgba(0,0,0,0.20)';
  s.fontFamily = FAZ_2B_FONT_STACK;
  s.zIndex = String(FAZ_2B_Z_CTX_MENU);
  let deleteItem: HTMLDivElement | null = null;
  for (const key of ctxKeys) {
    if (key === 'ctxRename') menu.appendChild(createCtxSeparator());
    const item = createCtxItem(key, locale);
    if (key === 'ctxDelete') deleteItem = item;
    menu.appendChild(item);
  }
  return { element: menu, deleteItem };
}

/**
 * Apply the highlighted affordance to the Delete item before the click.
 * Win11 hover is a quiet grey wash (NOT a blue full-row fill); for Delete
 * the leading trash icon turns red (the destructive cue).
 */
export function highlightCtxItem(item: HTMLElement): void {
  item.style.background = FAZ_2B_COLOR.rowHover;
  const icon = item.querySelector<SVGSVGElement>(
    "[data-role='win-explorer-ctx-icon']",
  );
  if (icon !== null) {
    for (const path of icon.querySelectorAll('path')) {
      path.setAttribute('stroke', FAZ_2B_COLOR.danger);
    }
  }
}

/* ------------------------------------------------------------------------ */
/* Access-denied dialog (designer §9)                                       */
/* ------------------------------------------------------------------------ */

/**
 * Build the fake "Access denied" error dialog (centred modal). 100% theatre:
 * it lingers FAZ_2B_ACCESS_DENIED_DWELL_MS then auto-dismisses, ignored.
 */
export function createAccessDeniedDialog(
  locale: ExplorerLocale,
): HTMLDivElement {
  const titleId = `f2b-ad-title-${Math.random().toString(36).slice(2, 8)}`;
  const backdrop = document.createElement('div');
  backdrop.dataset.role = 'win-explorer-access-denied';
  backdrop.setAttribute('role', 'alertdialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-labelledby', titleId);
  const bs = backdrop.style;
  bs.position = 'absolute';
  bs.inset = '0';
  bs.display = 'flex';
  bs.alignItems = 'center';
  bs.justifyContent = 'center';
  bs.background = 'rgba(0,0,0,0.30)';
  bs.zIndex = String(FAZ_2B_Z_ACCESS_DENIED);
  bs.fontFamily = FAZ_2B_FONT_STACK;
  backdrop.appendChild(createAccessDeniedPanel(locale, titleId));
  return backdrop;
}

/** Build the inner white panel (title bar + body + grey footer). */
function createAccessDeniedPanel(
  locale: ExplorerLocale,
  titleId: string,
): HTMLDivElement {
  const panel = document.createElement('div');
  const ps = panel.style;
  ps.width = '400px';
  ps.background = FAZ_2B_COLOR.content;
  ps.color = FAZ_2B_COLOR.text;
  ps.borderRadius = '8px';
  ps.boxShadow = '0 8px 24px rgba(0,0,0,0.28), 0 0 1px rgba(0,0,0,0.20)';
  ps.overflow = 'hidden';
  panel.appendChild(createAccessDeniedTitleBar(locale, titleId));
  panel.appendChild(createAccessDeniedBody(locale));
  panel.appendChild(createAccessDeniedFooter(locale));
  return panel;
}

/** Build the title bar (text + greyed no-op caption X). */
function createAccessDeniedTitleBar(
  locale: ExplorerLocale,
  titleId: string,
): HTMLDivElement {
  const bar = document.createElement('div');
  const s = bar.style;
  s.display = 'flex';
  s.alignItems = 'center';
  s.justifyContent = 'space-between';
  s.height = '40px';
  s.padding = '0 0 0 16px';
  const titleText = document.createElement('span');
  titleText.id = titleId;
  titleText.style.fontSize = '14px';
  titleText.style.fontWeight = '600';
  titleText.textContent = localise(
    'destruction.win.explorer.accessDenied.title',
    locale,
    'Folder Access Denied',
  );
  bar.appendChild(titleText);
  bar.appendChild(createGreyedXButton());
  return bar;
}

/** Build a greyed, disabled caption-X button (visual only, no-op). */
function createGreyedXButton(): HTMLDivElement {
  const btn = document.createElement('div');
  btn.dataset.role = 'win-explorer-caption-btn';
  btn.setAttribute('aria-hidden', 'true');
  btn.setAttribute('aria-disabled', 'true');
  btn.textContent = '✕';
  const s = btn.style;
  s.width = '46px';
  s.height = '40px';
  s.display = 'flex';
  s.alignItems = 'center';
  s.justifyContent = 'center';
  s.fontSize = '10px';
  s.color = FAZ_2B_COLOR.text;
  s.opacity = '0.4';
  return btn;
}

/** Build the dialog body (red icon + headline + localized body text). */
function createAccessDeniedBody(locale: ExplorerLocale): HTMLDivElement {
  const body = document.createElement('div');
  const s = body.style;
  s.display = 'flex';
  s.gap = '14px';
  s.alignItems = 'flex-start';
  s.padding = '20px';
  const icon = createAccessDeniedIcon(32);
  icon.style.flex = '0 0 auto';
  body.appendChild(icon);
  const text = document.createElement('div');
  const headline = document.createElement('div');
  headline.style.fontSize = '13px';
  headline.style.fontWeight = '600';
  headline.style.color = FAZ_2B_COLOR.text;
  headline.textContent = localise(
    'destruction.win.explorer.accessDenied.headline',
    locale,
    "You'll need to provide administrator permission to delete this folder",
  );
  text.appendChild(headline);
  const detail = document.createElement('div');
  detail.style.fontSize = '13px';
  detail.style.lineHeight = '1.45';
  detail.style.color = FAZ_2B_COLOR.textMuted;
  detail.style.marginTop = '6px';
  detail.textContent = localise(
    'destruction.win.explorer.accessDenied.body',
    locale,
    'You have been denied access to this folder.',
  );
  text.appendChild(detail);
  body.appendChild(text);
  return body;
}

/** Build the grey footer with Continue (primary) + Cancel (secondary). */
function createAccessDeniedFooter(locale: ExplorerLocale): HTMLDivElement {
  const footer = document.createElement('div');
  const s = footer.style;
  s.display = 'flex';
  s.justifyContent = 'flex-end';
  s.gap = '8px';
  s.padding = '12px 16px';
  s.background = FAZ_2B_COLOR.chrome;
  s.borderTop = `1px solid ${FAZ_2B_COLOR.border}`;
  footer.appendChild(
    createDialogButton(
      localise('destruction.win.explorer.accessDenied.continue', locale, 'Continue'),
      true,
    ),
  );
  footer.appendChild(
    createDialogButton(
      localise('destruction.win.explorer.accessDenied.cancel', locale, 'Cancel'),
      false,
    ),
  );
  return footer;
}

/** Build a dialog button (primary = filled accent, secondary = outlined). */
function createDialogButton(label: string, primary: boolean): HTMLDivElement {
  const btn = document.createElement('div');
  btn.dataset.role = 'win-explorer-dialog-btn';
  btn.setAttribute('aria-hidden', 'true');
  const s = btn.style;
  s.display = 'flex';
  s.alignItems = 'center';
  s.justifyContent = 'center';
  s.minWidth = '90px';
  s.padding = '6px 20px';
  s.fontSize = '13px';
  s.borderRadius = '4px';
  s.cursor = 'default';
  if (primary) {
    s.background = FAZ_2B_COLOR.accent;
    s.color = '#FFFFFF';
  } else {
    s.background = '#FDFDFD';
    s.color = FAZ_2B_COLOR.text;
    s.border = `1px solid ${FAZ_2B_COLOR.borderStrong}`;
  }
  btn.textContent = label;
  return btn;
}
