/**
 * Faz 2B Windows File Explorer views — content-area builders (Win11 22H2/23H2
 * light, designer spec §6–§9). Split out of `win-explorer.ts` (400-line cap).
 *
 * This module owns the swappable content bodies the explorer window hosts:
 * the "This PC" drive tiles (glyph + capacity bar + "X GB free of Y GB"
 * caption), the C:\ / C:\Windows folder views (Win11 Details list with
 * Name/Date/Type/Size columns + gradient manila folder icon), the right-click
 * context menu (leading icons, grey hover, red trash on Delete), and the fake
 * "Access denied" dialog (white body / grey footer / SVG red-circle icon).
 *
 * Each builder is a pure factory. No module-level mutable state; no timers
 * (the window shell + runner own all scheduling). Folder/drive rows carry
 * `data-row-name` so `win-explorer.ts` can resolve a row by display name for
 * the ghost-cursor target. SVG icons come from win-explorer-icons.ts.
 *
 * i18n: every visible string resolves through `localise()` against the
 * `destruction.win.explorer.*` tree. Folder names stay English on purpose —
 * real Windows folders ARE English. NO emoji (all glyphs are SVG).
 *
 * WHO CALLS THIS: chrome/win-explorer.ts.
 */

import {
  FAZ_2B_COLOR,
  FAZ_2B_DRIVE_BAR_WARN_PCT,
  FAZ_2B_FOLDER_DATE,
  FAZ_2B_FONT_STACK,
  type Faz2bDriveSpec,
} from '../../../../shared/scene-destruction-constants.js';
import { t, type Locale } from '../../../i18n/strings.js';
import {
  createDriveGlyph,
  createFolderIcon,
} from './win-explorer-icons.js';

export type ExplorerLocale = Locale;

/* ------------------------------------------------------------------------ */
/* i18n helper (mirrors win-progress-dialog.ts localise pattern)            */
/* ------------------------------------------------------------------------ */

export function localise(
  key: Parameters<typeof t>[0],
  locale: ExplorerLocale,
  fallback: string,
): string {
  const raw = t(key, locale);
  return raw === key ? fallback : raw;
}

/* ------------------------------------------------------------------------ */
/* Drive view ("This PC") — designer §6                                     */
/* ------------------------------------------------------------------------ */

/** Build a single Win11 drive tile (glyph + label + capacity + caption). */
function createDriveCard(
  drive: Faz2bDriveSpec,
  locale: ExplorerLocale,
): HTMLDivElement {
  const card = document.createElement('div');
  card.dataset.role = 'win-explorer-drive';
  card.dataset.rowName = drive.id;
  const s = card.style;
  s.display = 'flex';
  s.alignItems = 'center';
  s.gap = '12px';
  s.width = '240px';
  s.padding = '12px 14px';
  s.border = `1px solid ${FAZ_2B_COLOR.tileBorder}`;
  s.borderRadius = '6px';
  s.background = FAZ_2B_COLOR.content;
  const glyph = createDriveGlyph(40);
  glyph.style.flex = '0 0 auto';
  card.appendChild(glyph);
  card.appendChild(createDriveTextColumn(drive, locale));
  return card;
}

/** Build the text column of a drive tile (label + bar + free caption). */
function createDriveTextColumn(
  drive: Faz2bDriveSpec,
  locale: ExplorerLocale,
): HTMLDivElement {
  const col = document.createElement('div');
  col.style.flex = '1';
  col.style.minWidth = '0';
  const labelKey =
    drive.labelKey === 'localDisk'
      ? 'destruction.win.explorer.localDisk'
      : 'destruction.win.explorer.dataDisk';
  const fallback = drive.labelKey === 'localDisk' ? 'Local Disk' : 'Data';
  const label = document.createElement('div');
  label.style.fontSize = '13px';
  label.style.color = FAZ_2B_COLOR.text;
  label.textContent = `${localise(labelKey, locale, fallback)} (${drive.id})`;
  col.appendChild(label);
  col.appendChild(createCapacityBar(drive.usedPct));
  col.appendChild(createFreeCaption(drive));
  return col;
}

/** Build the Win11 capacity bar (red when at/over the warn threshold). */
function createCapacityBar(usedPct: number): HTMLDivElement {
  const track = document.createElement('div');
  track.dataset.role = 'win-explorer-capacity-track';
  const ts = track.style;
  ts.width = '100%';
  ts.height = '4px';
  ts.background = FAZ_2B_COLOR.tileBorder;
  ts.borderRadius = '2px';
  ts.margin = '6px 0 4px';
  ts.overflow = 'hidden';
  const fill = document.createElement('div');
  const clamped = Math.max(0, Math.min(100, usedPct));
  fill.style.height = '100%';
  fill.style.borderRadius = '2px';
  fill.style.width = `${clamped}%`;
  fill.style.background =
    clamped >= FAZ_2B_DRIVE_BAR_WARN_PCT
      ? FAZ_2B_COLOR.danger
      : FAZ_2B_COLOR.accent;
  track.appendChild(fill);
  return track;
}

/** Build the "X GB free of Y GB" caption (free derived from usedPct). */
function createFreeCaption(drive: Faz2bDriveSpec): HTMLDivElement {
  const caption = document.createElement('div');
  caption.dataset.role = 'win-explorer-drive-caption';
  caption.style.fontSize = '12px';
  caption.style.color = FAZ_2B_COLOR.textCaption;
  const freeGb = Math.round(drive.totalGb * (1 - drive.usedPct / 100) * 10) / 10;
  caption.textContent = `${freeGb} GB free of ${drive.totalGb} GB`;
  return caption;
}

/** Build the "This PC" drive view body (section header + tile grid). */
export function createDriveView(
  drives: readonly Faz2bDriveSpec[],
  locale: ExplorerLocale,
): HTMLDivElement {
  const body = document.createElement('div');
  body.dataset.role = 'win-explorer-drives';
  const s = body.style;
  s.padding = '16px 20px';
  s.fontFamily = FAZ_2B_FONT_STACK;
  s.overflowY = 'auto';
  const heading = document.createElement('div');
  heading.style.fontSize = '12px';
  heading.style.fontWeight = '600';
  heading.style.color = FAZ_2B_COLOR.text;
  heading.style.marginBottom = '12px';
  heading.textContent = localise(
    'destruction.win.explorer.devicesAndDrives',
    locale,
    'Devices and drives',
  );
  body.appendChild(heading);
  const grid = document.createElement('div');
  grid.style.display = 'flex';
  grid.style.flexWrap = 'wrap';
  grid.style.gap = '16px';
  for (const drive of drives) grid.appendChild(createDriveCard(drive, locale));
  body.appendChild(grid);
  return body;
}

/* ------------------------------------------------------------------------ */
/* Folder view — Win11 Details list (designer §7)                          */
/* ------------------------------------------------------------------------ */

/** Column template shared by the header row and every folder row. */
const FOLDER_GRID_COLUMNS = '1fr 160px 120px 90px';

/** Build the sticky column-header row (Name / Date modified / Type / Size). */
function createColumnHeader(locale: ExplorerLocale): HTMLDivElement {
  const header = document.createElement('div');
  header.dataset.role = 'win-explorer-folder-header';
  const s = header.style;
  s.display = 'grid';
  s.gridTemplateColumns = FOLDER_GRID_COLUMNS;
  s.alignItems = 'center';
  s.height = '28px';
  s.position = 'sticky';
  s.top = '0';
  s.background = FAZ_2B_COLOR.content;
  s.borderBottom = `1px solid ${FAZ_2B_COLOR.border}`;
  s.fontSize = '12px';
  s.color = FAZ_2B_COLOR.textMuted;
  const labels: ReadonlyArray<[string, string, string]> = [
    ['destruction.win.explorer.colName', 'Name', '0 0 0 12px'],
    ['destruction.win.explorer.colDate', 'Date modified', '0'],
    ['destruction.win.explorer.colType', 'Type', '0'],
    ['destruction.win.explorer.colSize', 'Size', '0'],
  ];
  for (const [key, fallback, pad] of labels) {
    const cell = document.createElement('span');
    cell.style.padding = pad;
    if (fallback === 'Size') cell.style.textAlign = 'right';
    cell.textContent = localise(key as Parameters<typeof t>[0], locale, fallback);
    header.appendChild(cell);
  }
  return header;
}

/** Build one Details folder row (icon+name / date / type / blank size). */
function createFolderRow(name: string, locale: ExplorerLocale): HTMLDivElement {
  const row = document.createElement('div');
  row.dataset.role = 'win-explorer-folder';
  row.dataset.rowName = name;
  const s = row.style;
  s.display = 'grid';
  s.gridTemplateColumns = FOLDER_GRID_COLUMNS;
  s.alignItems = 'center';
  s.height = '28px';
  s.fontSize = '13px';
  s.color = FAZ_2B_COLOR.text;
  row.appendChild(createNameCell(name));
  row.appendChild(makeCell(FAZ_2B_FOLDER_DATE, FAZ_2B_COLOR.textMuted));
  row.appendChild(
    makeCell(
      localise('destruction.win.explorer.fileFolder', locale, 'File folder'),
      FAZ_2B_COLOR.textMuted,
    ),
  );
  row.appendChild(makeCell('', FAZ_2B_COLOR.textMuted, 'right'));
  return row;
}

/** Build the Name cell (folder icon + label, left-padded). */
function createNameCell(name: string): HTMLDivElement {
  const cell = document.createElement('div');
  cell.style.display = 'flex';
  cell.style.alignItems = 'center';
  cell.style.gap = '10px';
  cell.style.paddingLeft = '8px';
  cell.style.minWidth = '0';
  cell.appendChild(createFolderIcon(24));
  const label = document.createElement('span');
  label.style.overflow = 'hidden';
  label.style.textOverflow = 'ellipsis';
  label.style.whiteSpace = 'nowrap';
  label.textContent = name;
  cell.appendChild(label);
  return cell;
}

/** Build a plain text cell (date/type/size columns). */
function makeCell(text: string, color: string, align = 'left'): HTMLSpanElement {
  const cell = document.createElement('span');
  cell.style.fontSize = '12px';
  cell.style.color = color;
  cell.style.textAlign = align;
  if (align === 'right') cell.style.paddingRight = '12px';
  cell.textContent = text;
  return cell;
}

/** Build a Details folder list from a list of folder names. */
export function createFolderGrid(
  folders: readonly string[],
  locale: ExplorerLocale,
): HTMLDivElement {
  const body = document.createElement('div');
  body.dataset.role = 'win-explorer-folder-grid';
  const s = body.style;
  s.fontFamily = FAZ_2B_FONT_STACK;
  s.overflowY = 'auto';
  s.background = FAZ_2B_COLOR.content;
  body.appendChild(createColumnHeader(locale));
  for (const name of folders) body.appendChild(createFolderRow(name, locale));
  return body;
}
