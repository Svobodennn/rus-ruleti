/**
 * Faz 2B — Windows Gezgini & "system32 sil" sahnesi (~8sn, Windows-only).
 *
 * Inserted between faz2 (takeover) and faz3 (terminal). A ghost cursor drives
 * a fake Win11 File Explorer:
 *
 *   1. Window opens → "This PC" drive view (C: + D: capacity bars)     0.6s
 *   2. Cursor → C: → double-click → C:\ root folders (~8)              ~1.5s
 *   3. Cursor → Windows → double-click → C:\Windows folders (~18)      ~1.5s
 *   4. Cursor → System32 → right-click → context menu                  ~0.9s
 *   5. Cursor → "Delete" → highlight → click                           ~0.8s
 *   6. Fake "Access denied" dialog → ~1s → dismissed → System32 row    ~1.2s
 *      shimmers out (the warning is ignored)
 *   7. Silent dread beat + glitch → hand off to faz3                   0.7s
 *
 * 100% DOM theatre — zero real fs / IPC. Mac: the runner returns immediately
 * (the FSM still steps through faz2b-explorer; the director gates the visual
 * scene to Windows). Sessiz: no audio cue fires anywhere in this phase
 * (FAZ2B-EXPLORER-PLAN §3 / kullanıcı kararı 2).
 *
 * Abort: every storyboard step checks `signal.aborted` before/after its
 * delay; the cursor + explorer teardown is bound to the signal so ESC-hold
 * cleans the subtree mid-sequence. No bleed is triggered here (W1: bleed #1
 * already fired inside faz2).
 *
 * Called by: destruction-director.ts between onFaz2Complete and
 * onFaz2bExplorerComplete.
 */

import {
  FAZ_2B_ACCESS_DENIED_DWELL_MS,
  FAZ_2B_CTXMENU_OPEN_MS,
  FAZ_2B_CURSOR_MOVE_MS,
  FAZ_2B_DELETE_CONFIRM_MS,
  FAZ_2B_DOUBLECLICK_DWELL_MS,
  FAZ_2B_DREAD_BEAT_MS,
  FAZ_2B_ROW_DELETE_MS,
  FAZ_2B_TARGET_FOLDER,
  FAZ_2B_WINDOW_OPEN_MS,
} from '../../../shared/scene-destruction-constants.js';
import { mountGhostCursor } from './chrome/_shared/ghost-cursor.js';
import { mountWinExplorer } from './chrome/win-explorer.js';
import type { GhostCursorHandle, OsVariant, WinExplorerHandle } from './types.js';

/* ------------------------------------------------------------------------ */
/* Public                                                                   */
/* ------------------------------------------------------------------------ */

export interface Faz2bRunArgs {
  readonly os: OsVariant;
  readonly container: HTMLElement;
  readonly signal: AbortSignal;
}

/**
 * Run the Faz 2B explorer sequence. Windows-only: on Mac the function
 * returns immediately (Mac pass-through — the FSM still advances). Resolves
 * at the end of the dread beat or on ESC-hold abort.
 */
export async function runFaz2bExplorer(args: Faz2bRunArgs): Promise<void> {
  if (args.os !== 'win') return; // Mac pass-through (FSM still steps through).
  const overlay = createOverlay();
  args.container.appendChild(overlay);

  const explorer = mountWinExplorer(overlay);
  const cursor = mountGhostCursor(overlay, args.signal);

  const teardown = (): void => {
    cursor.dispose();
    explorer.dispose();
    overlay.remove();
  };
  args.signal.addEventListener('abort', teardown, { once: true });

  await playStoryboard(explorer, cursor, args.signal);

  if (!args.signal.aborted) {
    teardown();
    args.signal.removeEventListener('abort', teardown);
  }
}

/* ------------------------------------------------------------------------ */
/* Storyboard                                                               */
/* ------------------------------------------------------------------------ */

/**
 * Play the seven storyboard beats. Each `await`ed segment is abortable; a
 * fired signal short-circuits the remaining beats (the teardown bound to
 * the signal removes the subtree).
 */
async function playStoryboard(
  explorer: WinExplorerHandle,
  cursor: GhostCursorHandle,
  signal: AbortSignal,
): Promise<void> {
  if (await beatDriveView(explorer, signal)) return;
  if (await beatEnterC(explorer, cursor, signal)) return;
  if (await beatEnterWindows(explorer, cursor, signal)) return;
  const deleteItem = await beatContextMenu(explorer, cursor, signal);
  if (signal.aborted) return;
  if (await beatClickDelete(deleteItem, cursor, signal)) return;
  if (await beatAccessDenied(explorer, signal)) return;
  await delay(FAZ_2B_DREAD_BEAT_MS, signal); // Step 7 — silent dread beat.
}

/** Step 1 — window opens, drive view dwell. Returns true if aborted. */
async function beatDriveView(
  explorer: WinExplorerHandle,
  signal: AbortSignal,
): Promise<boolean> {
  explorer.showDrives();
  await delay(FAZ_2B_WINDOW_OPEN_MS, signal);
  return signal.aborted;
}

/** Step 2 — cursor → C:, double-click, enter C:\. Returns true if aborted. */
async function beatEnterC(
  explorer: WinExplorerHandle,
  cursor: GhostCursorHandle,
  signal: AbortSignal,
): Promise<boolean> {
  const cDrive = explorer.rowEl('C:');
  if (cDrive !== null) await cursor.moveTo(cDrive, FAZ_2B_CURSOR_MOVE_MS);
  if (signal.aborted) return true;
  cursor.doubleClick();
  await delay(FAZ_2B_DOUBLECLICK_DWELL_MS, signal);
  if (signal.aborted) return true;
  explorer.enterC();
  return false;
}

/** Step 3 — cursor → Windows, double-click, enter C:\Windows. */
async function beatEnterWindows(
  explorer: WinExplorerHandle,
  cursor: GhostCursorHandle,
  signal: AbortSignal,
): Promise<boolean> {
  const windowsRow = explorer.rowEl('Windows');
  if (windowsRow !== null) await cursor.moveTo(windowsRow, FAZ_2B_CURSOR_MOVE_MS);
  if (signal.aborted) return true;
  cursor.doubleClick();
  await delay(FAZ_2B_DOUBLECLICK_DWELL_MS, signal);
  if (signal.aborted) return true;
  explorer.enterWindows();
  return false;
}

/** Step 4 — cursor → System32, right-click, open context menu. */
async function beatContextMenu(
  explorer: WinExplorerHandle,
  cursor: GhostCursorHandle,
  signal: AbortSignal,
): Promise<HTMLElement | null> {
  const target = explorer.rowEl(FAZ_2B_TARGET_FOLDER);
  if (target !== null) await cursor.moveTo(target, FAZ_2B_CURSOR_MOVE_MS);
  if (signal.aborted) return null;
  cursor.rightClick();
  const deleteItem = explorer.openContextMenuOn(FAZ_2B_TARGET_FOLDER);
  await delay(FAZ_2B_CTXMENU_OPEN_MS, signal);
  return deleteItem;
}

/** Step 5 — cursor → Delete item, click. Returns true if aborted. */
async function beatClickDelete(
  deleteItem: HTMLElement | null,
  cursor: GhostCursorHandle,
  signal: AbortSignal,
): Promise<boolean> {
  if (deleteItem !== null) await cursor.moveTo(deleteItem, FAZ_2B_CURSOR_MOVE_MS);
  if (signal.aborted) return true;
  cursor.click();
  await delay(FAZ_2B_DELETE_CONFIRM_MS, signal);
  return signal.aborted;
}

/**
 * Step 6 — fake "Access denied" dialog lingers then auto-dismisses
 * (ignored); System32 row shimmers out. Returns true if aborted.
 */
async function beatAccessDenied(
  explorer: WinExplorerHandle,
  signal: AbortSignal,
): Promise<boolean> {
  explorer.showAccessDeniedDialog();
  await delay(FAZ_2B_ACCESS_DENIED_DWELL_MS, signal);
  if (signal.aborted) return true;
  explorer.dismissAccessDeniedDialog();
  explorer.deleteRow(FAZ_2B_TARGET_FOLDER);
  await delay(FAZ_2B_ROW_DELETE_MS, signal);
  return signal.aborted;
}

/* ------------------------------------------------------------------------ */
/* Internals                                                                */
/* ------------------------------------------------------------------------ */

/** Build the faz2b overlay. Reuses the shared .destruction-overlay class. */
function createOverlay(): HTMLDivElement {
  const overlay = document.createElement('div');
  overlay.classList.add('destruction-overlay');
  overlay.dataset['phase'] = 'faz2b-explorer';
  // a11y (a11y-expert Bulgu A): AUTONOMOUS decorative theatre — the user never
  // interacts (the ghost cursor drives it). Hide the whole subtree (fake File
  // Explorer, drive cards, folder names, the access-denied alertdialog) from
  // assistive tech so a screen-reader user is not misled into thinking real
  // files are deleted. Mirrors the apartment-bleed.ts:86 convention.
  overlay.setAttribute('aria-hidden', 'true');
  return overlay;
}

/** Abortable delay — resolves at `ms` or immediately on signal abort. */
function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve): void => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const id = window.setTimeout((): void => {
      resolve();
    }, ms);
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
