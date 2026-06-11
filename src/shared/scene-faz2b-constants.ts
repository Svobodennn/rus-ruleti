/**
 * Faz 2B — Windows Gezgini & "system32 sil" sahnesi constants (Windows-only).
 * Split out of `scene-destruction-constants.ts` (400-line cap).
 *
 * SSOT for every timing / dimension / list / colour the faz2b lane references.
 * All consumers import these via `scene-destruction-constants.js`, which
 * re-exports this module (`export * from './scene-faz2b-constants.js'`), so no
 * downstream import path changes when symbols move here.
 *
 * New FSM phase between faz2 (takeover) and faz3 (terminal). A ghost cursor
 * drives a fake Win11 File Explorer through C:\ → C:\Windows → right-click
 * System32 → Delete → fake "Access denied" dialog → System32 row vanishes →
 * dread beat → faz3. 100% DOM theatre; zero real fs work. Mac = no-op runner
 * (FSM still steps through). Reference FAZ2B-EXPLORER-PLAN.md §6 / §8.
 *
 * Inline magic numbers in faz2b code are review-blocking. z-index is a LOCAL
 * const in chrome/win-explorer.ts (per C2 closure — DESTRUCTION_OVERLAY_Z_INDEX
 * is NOT reused).
 */

/* ------------------------------------------------------------------------ */
/* Faz 2B — storyboard timing (§8, ~8sn total, every step abortable)        */
/* ------------------------------------------------------------------------ */

/** Step 1 — window opens → "This PC" drive view dwell. */
export const FAZ_2B_WINDOW_OPEN_MS = 600 as const;
/** Cursor glide duration between any two storyboard targets (steps 2-5). */
export const FAZ_2B_CURSOR_MOVE_MS = 700 as const;
/** Dwell AFTER a double-click before the folder view swaps (steps 2-3). */
export const FAZ_2B_DOUBLECLICK_DWELL_MS = 350 as const;
/** Step 4 — right-click → context-menu open + settle dwell. */
export const FAZ_2B_CTXMENU_OPEN_MS = 500 as const;
/** Step 5/6 — dwell after the "Delete" click before the access-denied dialog. */
export const FAZ_2B_DELETE_CONFIRM_MS = 450 as const;
/** Step 6 — how long the fake "Access denied" dialog lingers before auto-dismiss. */
export const FAZ_2B_ACCESS_DENIED_DWELL_MS = 1000 as const;
/** Step 6 — System32 row shimmer/vanish after the dialog dismisses. */
export const FAZ_2B_ROW_DELETE_MS = 400 as const;
/** Step 7 — silent dread beat (+ glitch) before handing off to faz3. */
export const FAZ_2B_DREAD_BEAT_MS = 700 as const;

/* ------------------------------------------------------------------------ */
/* Faz 2B — drive view ("This PC")                                          */
/* ------------------------------------------------------------------------ */

/**
 * Drive descriptor for the "This PC" view. `usedPct` drives the Win11
 * capacity bar fill; >= FAZ_2B_DRIVE_BAR_WARN_PCT turns the bar red (the
 * "almost full" affordance Win11 shows). `id` is the drive letter shown in
 * the breadcrumb, `labelKey` resolves the localised volume label. `totalGb`
 * is the disk size; the "X GB free of Y GB" caption derives free space as
 * `totalGb * (1 - usedPct/100)` (designer §6 — authentic Win11 drive tile).
 */
export interface Faz2bDriveSpec {
  readonly id: string;
  readonly labelKey: 'localDisk' | 'dataDisk';
  readonly usedPct: number;
  readonly totalGb: number;
}

/** Drive list for the "This PC" view. C: nearly full (red bar), D: roomy. */
export const FAZ_2B_DRIVES: readonly Faz2bDriveSpec[] = [
  { id: 'C:', labelKey: 'localDisk', usedPct: 91, totalGb: 476 },
  { id: 'D:', labelKey: 'dataDisk', usedPct: 38, totalGb: 1863 },
];

/** Capacity-bar threshold (percent) at/above which the bar turns red. */
export const FAZ_2B_DRIVE_BAR_WARN_PCT = 85 as const;

/* ------------------------------------------------------------------------ */
/* Faz 2B — folder grids (English on purpose — Windows folders ARE English) */
/* ------------------------------------------------------------------------ */

/** C:\ root folders (~8 items, §10 / kullanıcı kararı 4). */
export const FAZ_2B_C_ROOT_FOLDERS: readonly string[] = [
  'PerfLogs',
  'Program Files',
  'Program Files (x86)',
  'ProgramData',
  'Recovery',
  'Users',
  'Windows',
  '$Recycle.Bin',
];

/** C:\Windows folders (~18 items, §10 — System32 must be visible). */
export const FAZ_2B_WINDOWS_FOLDERS: readonly string[] = [
  'addins',
  'appcompat',
  'apppatch',
  'assembly',
  'Boot',
  'Fonts',
  'Globalization',
  'INF',
  'L2Schemas',
  'LiveKernelReports',
  'Logs',
  'Media',
  'Performance',
  'System32',
  'SysWOW64',
  'Temp',
  'WinSxS',
  'security',
];

/** The folder the ghost cursor right-clicks → deletes. */
export const FAZ_2B_TARGET_FOLDER = 'System32' as const;

/**
 * Context-menu entry i18n key references (resolved via
 * `destruction.win.explorer.<key>`). `delete` is the highlighted target the
 * cursor clicks. Order matches a real Win11 right-click menu top-to-bottom.
 */
export const FAZ_2B_CTX_MENU_KEYS: readonly string[] = [
  'ctxOpen',
  'ctxOpenNewWindow',
  'ctxPin',
  'ctxRename',
  'ctxDelete',
];

/* ------------------------------------------------------------------------ */
/* Faz 2B — ghost cursor motion knobs                                       */
/* ------------------------------------------------------------------------ */

/** Ghost-cursor click ripple lifetime (ms) — single fade-out. */
export const FAZ_2B_CURSOR_RIPPLE_MS = 350 as const;
/** Gap (ms) between the two ripples of a double-click. */
export const FAZ_2B_DOUBLE_CLICK_GAP_MS = 120 as const;
/** Ghost-cursor glyph size (CSS px). */
export const FAZ_2B_CURSOR_SIZE_PX = 22 as const;

/* ------------------------------------------------------------------------ */
/* Faz 2B — single-owner decrees (TH-S4-01 closure — owner decree per W3)   */
/*                                                                          */
/* Every timer / RAF the faz2b lane owns declares a SINGLE owner module     */
/* here FIRST, mirroring the Sprint 5 _TIMER_OWNER / _AUDIO_OWNER cluster.  */
/* ------------------------------------------------------------------------ */

/** Faz 2B storyboard step-sequencing setTimeout owner. */
export const FAZ2B_STORYBOARD_TIMER_OWNER = 'faz2b-explorer' as const;
/** Faz 2B ghost-cursor glide requestAnimationFrame owner. */
export const FAZ2B_GHOST_CURSOR_RAF_OWNER = 'faz2b-ghost-cursor' as const;

/* ------------------------------------------------------------------------ */
/* Faz 2B — z-index ladder (C2 closure: all inside .destruction-overlay     */
/* 9100, all below CRT 9999). The ghost cursor is a SIBLING of the explorer */
/* root in the overlay, so its z-index must clear the whole explorer        */
/* subtree (root 9300). The ctx-menu / access-denied are CHILDREN of the    */
/* root — their z-index is resolved within the root's stacking context, so  */
/* they ride above the panel yet the cursor (9400 sibling) still wins. The  */
/* prior bug: cursor was 30 → painted UNDER the panel (9300).               */
/* ------------------------------------------------------------------------ */

/** Explorer window root — same band as win-progress-dialog. */
export const FAZ_2B_Z_EXPLORER = 9300 as const;
/** Right-click context menu — child of root, explicit above the panel. */
export const FAZ_2B_Z_CTX_MENU = 9350 as const;
/** "Access denied" dialog — above the context menu. */
export const FAZ_2B_Z_ACCESS_DENIED = 9360 as const;
/** Ghost cursor — sibling of root, floats above window/menu/dialog (THE FIX). */
export const FAZ_2B_Z_GHOST_CURSOR = 9400 as const;

/* ------------------------------------------------------------------------ */
/* Faz 2B — File Explorer visual tokens (Win11 22H2/23H2 light, designer    */
/* spec §1–§9). SSOT for every color / dimension; SVG path data lives in    */
/* code but all sizes + colors reference these named constants.             */
/* ------------------------------------------------------------------------ */

/** Window shell geometry (designer §1). */
export const FAZ_2B_WIN = {
  widthPx: 840,
  heightPx: 560,
  titleBarHeightPx: 40,
  commandBarHeightPx: 48,
  addressBarHeightPx: 40,
  navWidthPx: 210,
  panelRadiusPx: 8,
  logoSizePx: 16,
} as const;

/** Win11 light-theme palette (designer §1–§9). */
export const FAZ_2B_COLOR = {
  chrome: '#F3F3F3', // Mica body / titlebar / nav / footer
  content: '#FFFFFF', // white content well
  text: '#1B1B1B',
  textMuted: '#5C5C5C',
  textCaption: '#767676',
  hairline: 'rgba(0,0,0,0.06)',
  border: '#EDEDED',
  borderStrong: '#DDDDDD',
  tileBorder: '#E5E5E5',
  tileHoverBg: '#F5F5F5',
  tileHoverBorder: '#D0D0D0',
  hoverWash: 'rgba(0,0,0,0.06)',
  activeWash: 'rgba(0,0,0,0.10)',
  rowHover: '#F0F0F0',
  selectedBg: '#E5F3FF',
  selectedBorder: '#CCE4F7',
  accent: '#0067C0', // Win11 selection accent / primary button
  accentHover: '#0058A8',
  danger: '#C42B1C', // close-hover, full-disk bar, error icon
  separator: '#E5E5E5',
  iconLine: '#1B1B1B',
  iconMuted: '#5C5C5C',
} as const;

/** Win11 font stack (designer §10 — unchanged, confirmed correct). */
export const FAZ_2B_FONT_STACK =
  "system-ui, 'Segoe UI Variable', 'Segoe UI', sans-serif" as const;

/** Drive-glyph fill ramp (designer §6 hard-drive bay, fictional). */
export const FAZ_2B_DRIVE_GLYPH = {
  body: '#E8E8E8',
  bodyStroke: '#B8B8B8',
  slot: '#9A9A9A',
  led: '#0067C0',
} as const;

/** Win11 manila folder gradient stops (designer §7 — 3D lip). */
export const FAZ_2B_FOLDER = {
  gradTop: '#FFD66B',
  gradBottom: '#F2B636',
  tab: '#E8A92E',
  flapTop: '#FFE08A',
  flapBottom: '#FFC94D',
} as const;

/** Static decorative metadata for Details-list folder rows (§7). */
export const FAZ_2B_FOLDER_DATE = '5/12/2026 9:41 AM' as const;
