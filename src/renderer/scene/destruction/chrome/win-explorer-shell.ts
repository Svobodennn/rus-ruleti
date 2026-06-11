/**
 * Faz 2B File Explorer — window-shell chrome builders (designer §2–§5).
 *
 * Split out of `win-explorer.ts` (400-line cap). Owns the static chrome that
 * frames the swappable content body: titlebar (logo + title + caption
 * buttons), command bar (the defining Win11 22H2 icon ribbon), address /
 * breadcrumb row (nav buttons + chip-and-chevron pill + search box), and the
 * left navigation pane (Mica tree with leading icons + blue selection bar).
 *
 * All chrome is visual-only theatre — no click handlers fire. The nav pane
 * exposes a `setSelection(key)` so the window shell can couple the selected
 * tree node with the current view ("This PC" on drives, "Local Disk (C:)" in
 * C:\ / C:\Windows — the deeper folder is NOT a nav node, correct Win11
 * behavior). NO emoji — every glyph is an SVG line icon.
 *
 * WHO CALLS THIS: chrome/win-explorer.ts.
 */

import {
  FAZ_2B_COLOR,
  FAZ_2B_FONT_STACK,
  FAZ_2B_WIN,
} from '../../../../shared/scene-destruction-constants.js';
import { createWinFourSquareLogo } from './_shared/win-four-square-logo.js';
import {
  createLineIcon,
  createSearchIcon,
  ICON_PATHS,
} from './win-explorer-icons.js';
import { localise, type ExplorerLocale } from './win-explorer-views.js';

/* ------------------------------------------------------------------------ */
/* Titlebar (§2)                                                            */
/* ------------------------------------------------------------------------ */

/** Build the titlebar — logo + title + visual-only caption buttons. */
export function createTitleBar(locale: ExplorerLocale): HTMLDivElement {
  const bar = document.createElement('div');
  bar.dataset.role = 'win-explorer-titlebar';
  const s = bar.style;
  s.display = 'flex';
  s.alignItems = 'center';
  s.justifyContent = 'space-between';
  s.height = `${FAZ_2B_WIN.titleBarHeightPx}px`;
  s.padding = '0 0 0 12px';
  const left = document.createElement('div');
  left.style.display = 'flex';
  left.style.alignItems = 'center';
  left.style.gap = '10px';
  left.appendChild(createWinFourSquareLogo(FAZ_2B_WIN.logoSizePx));
  const titleText = document.createElement('span');
  titleText.style.fontSize = '13px';
  titleText.style.fontWeight = '400';
  titleText.style.color = FAZ_2B_COLOR.text;
  titleText.textContent = localise(
    'destruction.win.explorer.title',
    locale,
    'File Explorer',
  );
  left.appendChild(titleText);
  bar.appendChild(left);
  bar.appendChild(createCaptionButtons());
  return bar;
}

/** Build the `— □ ✕` caption-button cluster (visual only, no-op). */
function createCaptionButtons(): HTMLDivElement {
  const cluster = document.createElement('div');
  cluster.style.display = 'flex';
  const glyphs: ReadonlyArray<[string, boolean]> = [
    ['—', false],
    ['□', false],
    ['✕', true],
  ];
  for (const [glyph, isClose] of glyphs) {
    const btn = document.createElement('div');
    btn.dataset.role = 'win-explorer-caption-btn';
    if (isClose) btn.dataset.captionClose = 'true';
    btn.setAttribute('aria-hidden', 'true');
    btn.textContent = glyph;
    const bs = btn.style;
    bs.width = '46px';
    bs.height = `${FAZ_2B_WIN.titleBarHeightPx}px`;
    bs.display = 'flex';
    bs.alignItems = 'center';
    bs.justifyContent = 'center';
    bs.fontSize = '10px';
    bs.color = FAZ_2B_COLOR.text;
    if (isClose) bs.borderTopRightRadius = `${FAZ_2B_WIN.panelRadiusPx}px`;
    cluster.appendChild(btn);
  }
  return cluster;
}

/* ------------------------------------------------------------------------ */
/* Command bar (§3 — the defining Win11 22H2 ribbon replacement)            */
/* ------------------------------------------------------------------------ */

/** Command-bar buttons in order; `split` adds the 8px chevron affordance. */
const CMD_BUTTONS: ReadonlyArray<{ icon: string; split?: boolean }> = [
  { icon: 'new', split: true },
  { icon: 'cut' },
  { icon: 'copy' },
  { icon: 'paste' },
  { icon: 'rename' },
  { icon: 'delete' },
  { icon: 'sort', split: true },
  { icon: 'view', split: true },
];

/** Build the slim Win11 command bar (icon-only action buttons + See more). */
export function createCommandBar(): HTMLDivElement {
  const bar = document.createElement('div');
  bar.dataset.role = 'win-explorer-command-bar';
  const s = bar.style;
  s.display = 'flex';
  s.alignItems = 'center';
  s.gap = '2px';
  s.height = `${FAZ_2B_WIN.commandBarHeightPx}px`;
  s.padding = '0 8px';
  s.background = FAZ_2B_COLOR.content;
  s.borderBottom = `1px solid ${FAZ_2B_COLOR.border}`;
  let separated = false;
  for (let i = 0; i < CMD_BUTTONS.length; i += 1) {
    const spec = CMD_BUTTONS[i];
    if (spec === undefined) continue;
    if (spec.icon === 'sort' && !separated) {
      bar.appendChild(createCmdSeparator());
      separated = true;
    }
    bar.appendChild(createCmdButton(spec.icon, spec.split ?? false));
  }
  const more = createCmdButton('more', false);
  more.style.marginLeft = 'auto';
  bar.appendChild(more);
  return bar;
}

/** Build one command-bar icon button (square pill, optional split chevron). */
function createCmdButton(iconKey: string, split: boolean): HTMLDivElement {
  const btn = document.createElement('div');
  btn.dataset.role = 'win-explorer-cmd-btn';
  btn.setAttribute('aria-hidden', 'true');
  const s = btn.style;
  s.display = 'flex';
  s.alignItems = 'center';
  s.justifyContent = 'center';
  s.gap = '2px';
  s.height = '32px';
  s.minWidth = '36px';
  s.padding = '0 4px';
  s.borderRadius = '4px';
  s.cursor = 'default';
  btn.appendChild(createLineIcon(ICON_PATHS[iconKey] ?? [], 16));
  if (split) {
    const chevron = document.createElement('span');
    chevron.style.fontSize = '8px';
    chevron.style.color = FAZ_2B_COLOR.textMuted;
    chevron.textContent = '▾';
    btn.appendChild(chevron);
  }
  return btn;
}

/** Build the thin vertical separator between command-bar groups. */
function createCmdSeparator(): HTMLDivElement {
  const sep = document.createElement('div');
  sep.style.width = '1px';
  sep.style.height = '20px';
  sep.style.margin = '0 6px';
  sep.style.background = '#E0E0E0';
  return sep;
}

/* ------------------------------------------------------------------------ */
/* Address / breadcrumb row (§4)                                            */
/* ------------------------------------------------------------------------ */

/** Build the address row + a setter that rebuilds the chip breadcrumb. */
export function createAddressRow(locale: ExplorerLocale): {
  element: HTMLDivElement;
  setPath: (segments: readonly string[]) => void;
} {
  const row = document.createElement('div');
  row.dataset.role = 'win-explorer-address';
  const s = row.style;
  s.display = 'flex';
  s.alignItems = 'center';
  s.gap = '8px';
  s.height = `${FAZ_2B_WIN.addressBarHeightPx}px`;
  s.padding = '0 10px';
  s.background = FAZ_2B_COLOR.content;
  s.borderBottom = `1px solid ${FAZ_2B_COLOR.border}`;
  s.fontFamily = FAZ_2B_FONT_STACK;
  row.appendChild(createNavButton('back', false));
  row.appendChild(createNavButton('forward', true));
  row.appendChild(createNavButton('up', false));
  const pill = createBreadcrumbPill();
  row.appendChild(pill.element);
  row.appendChild(createSearchBox(locale));
  return { element: row, setPath: pill.setPath };
}

/** Build a back/forward/up nav button (disabled = lower opacity). */
function createNavButton(iconKey: string, disabled: boolean): HTMLDivElement {
  const btn = document.createElement('div');
  btn.dataset.role = 'win-explorer-nav-btn';
  btn.setAttribute('aria-hidden', 'true');
  const s = btn.style;
  s.display = 'flex';
  s.alignItems = 'center';
  s.justifyContent = 'center';
  s.width = '30px';
  s.height = '28px';
  s.borderRadius = '4px';
  s.cursor = 'default';
  if (disabled) s.opacity = '0.35';
  btn.appendChild(createLineIcon(ICON_PATHS[iconKey] ?? [], 16));
  return btn;
}

/** Build the breadcrumb pill (PC glyph + chip/chevron setter). */
function createBreadcrumbPill(): {
  element: HTMLDivElement;
  setPath: (segments: readonly string[]) => void;
} {
  const pill = document.createElement('div');
  pill.dataset.role = 'win-explorer-breadcrumb';
  const s = pill.style;
  s.flex = '1';
  s.minWidth = '0';
  s.height = '30px';
  s.display = 'flex';
  s.alignItems = 'center';
  s.gap = '4px';
  s.padding = '0 8px';
  s.background = FAZ_2B_COLOR.content;
  s.border = `1px solid ${FAZ_2B_COLOR.borderStrong}`;
  s.borderRadius = '4px';
  s.overflow = 'hidden';
  const setPath = (segments: readonly string[]): void => {
    rebuildBreadcrumb(pill, segments);
  };
  return { element: pill, setPath };
}

/** Rebuild the breadcrumb chips + chevrons from the path segments. */
function rebuildBreadcrumb(pill: HTMLElement, segments: readonly string[]): void {
  pill.replaceChildren();
  const leadIcon = createLineIcon(ICON_PATHS.pc, 14, FAZ_2B_COLOR.iconMuted);
  leadIcon.style.flex = '0 0 14px';
  pill.appendChild(leadIcon);
  for (let i = 0; i < segments.length; i += 1) {
    if (i > 0) {
      const chevron = createLineIcon(ICON_PATHS.chevron, 14, FAZ_2B_COLOR.textMuted);
      chevron.style.flex = '0 0 14px';
      pill.appendChild(chevron);
    }
    const chip = document.createElement('span');
    chip.dataset.role = 'win-explorer-crumb';
    chip.style.fontSize = '12px';
    chip.style.color = FAZ_2B_COLOR.text;
    chip.style.padding = '2px 6px';
    chip.style.borderRadius = '4px';
    chip.style.whiteSpace = 'nowrap';
    chip.textContent = segments[i] ?? '';
    pill.appendChild(chip);
  }
}

/** Build the right-flush search box (magnifier + placeholder). */
function createSearchBox(locale: ExplorerLocale): HTMLDivElement {
  const box = document.createElement('div');
  box.dataset.role = 'win-explorer-search';
  const s = box.style;
  s.display = 'flex';
  s.alignItems = 'center';
  s.gap = '6px';
  s.width = '180px';
  s.height = '30px';
  s.padding = '0 8px';
  s.background = FAZ_2B_COLOR.content;
  s.border = `1px solid ${FAZ_2B_COLOR.borderStrong}`;
  s.borderRadius = '4px';
  box.appendChild(createSearchIcon(14));
  const placeholder = document.createElement('span');
  placeholder.style.fontSize = '12px';
  placeholder.style.color = FAZ_2B_COLOR.textCaption;
  placeholder.textContent = localise(
    'destruction.win.explorer.searchPlaceholder',
    locale,
    'Search This PC',
  );
  box.appendChild(placeholder);
  return box;
}
