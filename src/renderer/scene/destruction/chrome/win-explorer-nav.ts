/**
 * Faz 2B File Explorer — left navigation pane (designer §5).
 *
 * Split out of the shell so each chrome file stays under the 400-line cap.
 * Builds the Mica-grey tree (Home / Gallery / OneDrive / This PC ⌄ / Local
 * Disk (C:) / Data (D:) / Network) with 16px leading line icons and the
 * signature pale-blue selection fill + 3px blue left accent bar.
 *
 * Exposes `setSelection(key)` so the window shell couples the selected node
 * with the current view: "thisPc" on the drive view, "driveC" inside C:\ /
 * C:\Windows (the deeper folder is NOT a nav node — correct Win11 behavior).
 *
 * Visual-only theatre — no click handlers. NO emoji (all SVG line icons).
 *
 * WHO CALLS THIS: chrome/win-explorer.ts.
 */

import {
  FAZ_2B_COLOR,
  FAZ_2B_FONT_STACK,
  FAZ_2B_WIN,
} from '../../../../shared/scene-destruction-constants.js';
import { createLineIcon, ICON_PATHS } from './win-explorer-icons.js';
import { localise, type ExplorerLocale } from './win-explorer-views.js';

/** A nav tree node spec. `indent` is the tree-level left padding (px). */
interface NavNodeSpec {
  readonly key: string;
  readonly icon: string;
  readonly i18nKey?: string;
  readonly fallback: string;
  readonly indent: number;
  readonly gapBefore?: boolean;
}

/** Static decorative tree (designer §5 contents). */
const NAV_NODES: readonly NavNodeSpec[] = [
  { key: 'home', icon: 'home', fallback: 'Home', indent: 0 },
  { key: 'gallery', icon: 'gallery', fallback: 'Gallery', indent: 0 },
  { key: 'oneDrive', icon: 'cloud', fallback: 'OneDrive', indent: 0 },
  {
    key: 'thisPc',
    icon: 'pc',
    i18nKey: 'destruction.win.explorer.thisPc',
    fallback: 'This PC',
    indent: 0,
    gapBefore: true,
  },
  {
    key: 'driveC',
    icon: 'drive',
    i18nKey: 'destruction.win.explorer.localDisk',
    fallback: 'Local Disk (C:)',
    indent: 16,
  },
  {
    key: 'driveD',
    icon: 'drive',
    i18nKey: 'destruction.win.explorer.dataDisk',
    fallback: 'Data (D:)',
    indent: 16,
  },
  { key: 'network', icon: 'network', fallback: 'Network', indent: 0, gapBefore: true },
];

/** Resolve a node's visible label (drives append the letter to the label). */
function nodeLabel(node: NavNodeSpec, locale: ExplorerLocale): string {
  if (node.i18nKey === undefined) return node.fallback;
  const base = localise(
    node.i18nKey as Parameters<typeof localise>[0],
    locale,
    node.fallback,
  );
  if (node.key === 'driveC') return `${base} (C:)`;
  if (node.key === 'driveD') return `${base} (D:)`;
  return base;
}

/** Build one nav row (accent bar slot + icon + label, indented per level). */
function createNavRow(node: NavNodeSpec, locale: ExplorerLocale): HTMLDivElement {
  const row = document.createElement('div');
  row.dataset.role = 'win-explorer-nav-item';
  row.dataset.navKey = node.key;
  const s = row.style;
  s.position = 'relative';
  s.display = 'flex';
  s.alignItems = 'center';
  s.gap = '8px';
  s.height = '32px';
  s.padding = `0 8px 0 ${8 + node.indent}px`;
  s.borderRadius = '4px';
  s.fontSize = '12px';
  s.color = FAZ_2B_COLOR.text;
  if (node.gapBefore === true) s.marginTop = '8px';
  if (node.key === 'thisPc') row.appendChild(createTreeChevron());
  const icon = createLineIcon(ICON_PATHS[node.icon] ?? [], 16, FAZ_2B_COLOR.iconMuted);
  icon.style.flex = '0 0 16px';
  row.appendChild(icon);
  const label = document.createElement('span');
  label.style.overflow = 'hidden';
  label.style.textOverflow = 'ellipsis';
  label.style.whiteSpace = 'nowrap';
  label.textContent = nodeLabel(node, locale);
  row.appendChild(label);
  return row;
}

/** Build the expanded ⌄ chevron shown on the "This PC" node. */
function createTreeChevron(): HTMLSpanElement {
  const chevron = document.createElement('span');
  chevron.style.position = 'absolute';
  chevron.style.left = '-6px';
  chevron.style.fontSize = '10px';
  chevron.style.color = FAZ_2B_COLOR.textMuted;
  chevron.textContent = '⌄';
  return chevron;
}

/** Apply / clear the selected affordance (pale-blue fill + 3px accent bar). */
function applySelection(rows: readonly HTMLDivElement[], key: string): void {
  for (const row of rows) {
    const selected = row.dataset.navKey === key;
    row.style.background = selected ? FAZ_2B_COLOR.selectedBg : 'transparent';
    const existing = row.querySelector("[data-role='win-explorer-nav-accent']");
    if (selected && existing === null) {
      const bar = document.createElement('div');
      bar.dataset.role = 'win-explorer-nav-accent';
      const bs = bar.style;
      bs.position = 'absolute';
      bs.left = '2px';
      bs.width = '3px';
      bs.height = '16px';
      bs.borderRadius = '2px';
      bs.background = FAZ_2B_COLOR.accent;
      row.appendChild(bar);
    } else if (!selected && existing !== null) {
      existing.remove();
    }
  }
}

/** Build the left navigation pane + a `setSelection(key)` coupler. */
export function createNavPane(locale: ExplorerLocale): {
  element: HTMLDivElement;
  setSelection: (key: string) => void;
} {
  const pane = document.createElement('div');
  pane.dataset.role = 'win-explorer-nav';
  const s = pane.style;
  s.width = `${FAZ_2B_WIN.navWidthPx}px`;
  s.flex = `0 0 ${FAZ_2B_WIN.navWidthPx}px`;
  s.background = FAZ_2B_COLOR.chrome;
  s.borderRight = `1px solid ${FAZ_2B_COLOR.border}`;
  s.padding = '6px 6px';
  s.overflowY = 'auto';
  s.fontFamily = FAZ_2B_FONT_STACK;
  const rows: HTMLDivElement[] = [];
  for (const node of NAV_NODES) {
    const row = createNavRow(node, locale);
    rows.push(row);
    pane.appendChild(row);
  }
  return {
    element: pane,
    setSelection: (key: string): void => applySelection(rows, key),
  };
}
