/**
 * Faz 2B Windows File Explorer window shell — Win11 22H2/23H2 light taste.
 *
 * Owns the fake File Explorer chrome assembled from the split chrome modules:
 * titlebar + command bar + address/breadcrumb row (win-explorer-shell.ts),
 * left navigation pane (win-explorer-nav.ts), and the swappable content host.
 * The content body swaps between the drive view ("This PC"), the C:\ Details
 * list, and the C:\Windows Details list (bodies built in
 * win-explorer-views.ts; SVG icons in win-explorer-icons.ts).
 *
 * The runner (faz2b-explorer.ts) drives the storyboard through the
 * WinExplorerHandle view methods. The ghost cursor (separate handle) supplies
 * pointer motion; this module never animates the cursor.
 *
 * SHARED RESOURCES OWNED: none beyond its own DOM subtree. No timers — the
 * runner owns all scheduling. The transient context menu + access-denied
 * dialog are mounted/removed synchronously via the handle methods.
 *
 * z-index (C2 closure): the window root uses FAZ_2B_Z_EXPLORER (9300, same
 * band as win-progress-dialog) — it does NOT reuse DESTRUCTION_OVERLAY_Z_INDEX
 * (10000). The ctx-menu / access-denied / ghost cursor z-indices live in the
 * FAZ_2B_Z_* ladder (constants SSOT).
 *
 * WHO CALLS THIS: faz2b-explorer.ts `mountWinExplorer(overlay)`.
 */

import {
  FAZ_2B_C_ROOT_FOLDERS,
  FAZ_2B_COLOR,
  FAZ_2B_CTX_MENU_KEYS,
  FAZ_2B_DRIVES,
  FAZ_2B_FONT_STACK,
  FAZ_2B_WIN,
  FAZ_2B_WINDOWS_FOLDERS,
  FAZ_2B_Z_EXPLORER,
  PREFERS_REDUCED_MOTION_QUERY,
} from '../../../../shared/scene-destruction-constants.js';
import { resolveUserLocale } from '../../../i18n/strings.js';
import type { WinExplorerHandle } from '../types.js';
import { createNavPane } from './win-explorer-nav.js';
import {
  createAddressRow,
  createCommandBar,
  createTitleBar,
} from './win-explorer-shell.js';
import {
  createAccessDeniedDialog,
  createContextMenu,
  highlightCtxItem,
} from './win-explorer-dialogs.js';
import {
  createDriveView,
  createFolderGrid,
  localise,
  type ExplorerLocale,
} from './win-explorer-views.js';

const ROW_SHIMMER_MS = 220;
const WIN_ELEVATION_SHADOW =
  '0 2px 4px rgba(0,0,0,0.08), 0 12px 28px rgba(0,0,0,0.18), 0 0 1px rgba(0,0,0,0.20)';

/* ------------------------------------------------------------------------ */
/* Window assembly                                                          */
/* ------------------------------------------------------------------------ */

/** Internal element refs the handle methods mutate. */
interface ExplorerRefs {
  readonly root: HTMLDivElement;
  readonly contentHost: HTMLDivElement;
  readonly setPath: (segments: readonly string[]) => void;
  readonly setNavSelection: (key: string) => void;
  readonly locale: ExplorerLocale;
  readonly reduceMotion: boolean;
  contextMenu: HTMLDivElement | null;
  accessDenied: HTMLDivElement | null;
  disposed: boolean;
}

/** Build the centred backdrop root that hosts the window panel. */
function createRoot(): HTMLDivElement {
  const root = document.createElement('div');
  root.className = 'win-explorer-root';
  root.dataset.role = 'win-explorer-root';
  const s = root.style;
  s.position = 'fixed';
  s.inset = '0';
  s.display = 'flex';
  s.alignItems = 'center';
  s.justifyContent = 'center';
  s.zIndex = String(FAZ_2B_Z_EXPLORER);
  s.pointerEvents = 'none';
  return root;
}

/** Build the Mica window panel (titlebar → command bar → address → lower). */
function createPanel(parts: {
  titleBar: HTMLDivElement;
  commandBar: HTMLDivElement;
  addressRow: HTMLDivElement;
  navPane: HTMLDivElement;
  contentHost: HTMLDivElement;
}): HTMLDivElement {
  const panel = document.createElement('div');
  panel.dataset.role = 'win-explorer-panel';
  const ps = panel.style;
  ps.position = 'relative';
  ps.width = `${FAZ_2B_WIN.widthPx}px`;
  ps.height = `${FAZ_2B_WIN.heightPx}px`;
  ps.background = FAZ_2B_COLOR.chrome;
  ps.color = FAZ_2B_COLOR.text;
  ps.border = `1px solid ${FAZ_2B_COLOR.hairline}`;
  ps.borderRadius = `${FAZ_2B_WIN.panelRadiusPx}px`;
  ps.boxShadow = WIN_ELEVATION_SHADOW;
  ps.fontFamily = FAZ_2B_FONT_STACK;
  ps.overflow = 'hidden';
  ps.display = 'flex';
  ps.flexDirection = 'column';
  panel.appendChild(parts.titleBar);
  panel.appendChild(parts.commandBar);
  panel.appendChild(parts.addressRow);
  const lower = document.createElement('div');
  lower.style.display = 'flex';
  lower.style.flex = '1';
  lower.style.minHeight = '0';
  lower.appendChild(parts.navPane);
  lower.appendChild(parts.contentHost);
  panel.appendChild(lower);
  return panel;
}

/** Build the white content host that swaps view bodies. */
function createContentHost(): HTMLDivElement {
  const host = document.createElement('div');
  host.dataset.role = 'win-explorer-content';
  host.style.flex = '1';
  host.style.minWidth = '0';
  host.style.overflow = 'auto';
  host.style.background = FAZ_2B_COLOR.content;
  return host;
}

/** Swap the content host body to a freshly built view element. */
function swapContent(refs: ExplorerRefs, body: HTMLElement): void {
  if (refs.disposed) return;
  refs.contentHost.replaceChildren(body);
}

/* ------------------------------------------------------------------------ */
/* Handle factory                                                           */
/* ------------------------------------------------------------------------ */

/** Build the WinExplorerHandle bound to the refs. Decomposed for the cap. */
function buildHandle(refs: ExplorerRefs): WinExplorerHandle {
  const thisPc = localise('destruction.win.explorer.thisPc', refs.locale, 'This PC');
  const cLabel = `${localise('destruction.win.explorer.localDisk', refs.locale, 'Local Disk')} (C:)`;
  return {
    kind: 'win-explorer',
    element: refs.root,
    showDrives: (): void => {
      refs.setPath([thisPc]);
      refs.setNavSelection('thisPc');
      swapContent(refs, createDriveView(FAZ_2B_DRIVES, refs.locale));
    },
    enterC: (): void => {
      refs.setPath([thisPc, cLabel]);
      refs.setNavSelection('driveC');
      swapContent(refs, createFolderGrid(FAZ_2B_C_ROOT_FOLDERS, refs.locale));
    },
    enterWindows: (): void => {
      refs.setPath([thisPc, cLabel, 'Windows']);
      refs.setNavSelection('driveC');
      swapContent(refs, createFolderGrid(FAZ_2B_WINDOWS_FOLDERS, refs.locale));
    },
    rowEl: (name: string): HTMLElement | null =>
      refs.contentHost.querySelector<HTMLElement>(`[data-row-name="${name}"]`),
    openContextMenuOn: (name: string): HTMLElement | null =>
      openContextMenu(refs, name),
    deleteRow: (name: string): void => deleteRow(refs, name),
    showAccessDeniedDialog: (): HTMLElement => showAccessDenied(refs),
    dismissAccessDeniedDialog: (): void => dismissAccessDenied(refs),
    dispose: (): void => disposeExplorer(refs),
  };
}

/** Mount the right-click menu anchored at the named row. Returns Delete item. */
function openContextMenu(refs: ExplorerRefs, name: string): HTMLElement | null {
  if (refs.disposed) return null;
  const row = refs.contentHost.querySelector<HTMLElement>(
    `[data-row-name="${name}"]`,
  );
  if (row === null) return null;
  const { element, deleteItem } = createContextMenu(
    FAZ_2B_CTX_MENU_KEYS,
    refs.locale,
  );
  const rowRect = row.getBoundingClientRect();
  const panelRect = refs.root.getBoundingClientRect();
  element.style.left = `${rowRect.right - panelRect.left}px`;
  element.style.top = `${rowRect.top - panelRect.top}px`;
  refs.contextMenu = element;
  refs.root.appendChild(element);
  if (deleteItem !== null) highlightCtxItem(deleteItem);
  return deleteItem;
}

/** Delete a row with a brief shimmer then removal. No-op when absent. */
function deleteRow(refs: ExplorerRefs, name: string): void {
  if (refs.disposed) return;
  if (refs.contextMenu !== null && refs.contextMenu.parentNode !== null) {
    refs.contextMenu.parentNode.removeChild(refs.contextMenu);
    refs.contextMenu = null;
  }
  const row = refs.contentHost.querySelector<HTMLElement>(
    `[data-row-name="${name}"]`,
  );
  if (row === null) return;
  if (refs.reduceMotion) {
    if (row.parentNode !== null) row.parentNode.removeChild(row);
    return;
  }
  row.style.transition = `opacity ${ROW_SHIMMER_MS}ms ease-out`;
  row.style.opacity = '0';
  window.setTimeout((): void => {
    if (row.parentNode !== null) row.parentNode.removeChild(row);
  }, ROW_SHIMMER_MS);
}

/** Mount the access-denied dialog. Returns its element. */
function showAccessDenied(refs: ExplorerRefs): HTMLElement {
  const dialog = createAccessDeniedDialog(refs.locale);
  refs.accessDenied = dialog;
  refs.root.appendChild(dialog);
  return dialog;
}

/** Dismiss the access-denied dialog if mounted. */
function dismissAccessDenied(refs: ExplorerRefs): void {
  if (refs.accessDenied !== null && refs.accessDenied.parentNode !== null) {
    refs.accessDenied.parentNode.removeChild(refs.accessDenied);
  }
  refs.accessDenied = null;
}

/** Remove the entire window subtree. Safe to call multiple times. */
function disposeExplorer(refs: ExplorerRefs): void {
  if (refs.disposed) return;
  refs.disposed = true;
  if (refs.root.parentNode !== null) {
    refs.root.parentNode.removeChild(refs.root);
  }
}

/* ------------------------------------------------------------------------ */
/* Mount entry point                                                        */
/* ------------------------------------------------------------------------ */

/**
 * Mount the fake File Explorer window into the faz2b overlay. The window
 * starts on the drive view via the returned handle's `showDrives()` (the
 * runner calls it as storyboard step 1). `dispose()` removes the subtree.
 */
export function mountWinExplorer(host: HTMLElement): WinExplorerHandle {
  const locale = resolveUserLocale();
  const reduceMotion = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;
  const root = createRoot();
  const { element: addressRow, setPath } = createAddressRow(locale);
  const { element: navPane, setSelection: setNavSelection } = createNavPane(locale);
  const contentHost = createContentHost();
  const panel = createPanel({
    titleBar: createTitleBar(locale),
    commandBar: createCommandBar(),
    addressRow,
    navPane,
    contentHost,
  });
  root.appendChild(panel);
  host.appendChild(root);
  return buildHandle({
    root,
    contentHost,
    setPath,
    setNavSelection,
    locale,
    reduceMotion,
    contextMenu: null,
    accessDenied: null,
    disposed: false,
  });
}
