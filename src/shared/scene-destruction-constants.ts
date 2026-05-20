/**
 * Destruction sequence SSOT — Sprint 4 Phase 1 scaffold.
 *
 * 7th sibling of the constants split (palette / audio / shader / revolver /
 * model / scene / **destruction**). Pre-populates the NAMES of every per-faz
 * timing, audio param, dialog dimension, toast spawn rate, typewriter rate,
 * wallpaper palette, OS-chrome dimension, fake-file-path list, and toast
 * message id list. Phase 2A designer FILLS the values; Phase 2B kraken-faz0-1
 * + kraken-faz2-3 + swift-expert + frontend-dev consume.
 *
 * Structural rule (Sprint 3+4): no inline-with-comment magic-number loophole.
 * Every value Phase 2B will reference is NAMED here. Inline magic numbers in
 * destruction/ code are review-blocking under code-reviewer.
 *
 * Ownership map:
 *   - designer (Phase 2A): FAZ_*_DURATION_MS, TINNITUS_FREQ_HZ,
 *     LOW_PASS_CUTOFF_HZ, BANG_CAMERA_SHAKE_DEG, APARTMENT_BLEED_*_*,
 *     DIALOG_*_DIMENSIONS, TOAST_SPAWN_INTERVAL_MS, TYPEWRITER_*_CHARS_PER_SEC,
 *     WALLPAPER_*_PALETTE, MENUBAR_MAC_HEIGHT_PX, TASKBAR_WIN_HEIGHT_PX,
 *     FAKE_FILE_PATHS_*, TOAST_MESSAGES_*
 *   - kraken-faz0-1 (Phase 2B): consumes Faz 0 + Faz 1 + audio knobs
 *   - kraken-faz2-3 (Phase 2B): consumes Faz 2 + Faz 3 + bleed knobs
 *   - swift-expert (Phase 2B): consumes DIALOG_MAC_* + MENUBAR_MAC_*
 *   - frontend-dev (Phase 2B): consumes DIALOG_WIN_* + TASKBAR_WIN_*
 *   - i18n-expert (Phase 2B): consumes TOAST_MESSAGES_* keys (translates them)
 *
 * Unit suffix discipline (carries forward from scene-revolver-constants.ts /
 * scene-model-constants.ts):
 *   `_MS` (milliseconds), `_HZ` (hertz), `_DB` (decibels), `_PX` (CSS pixels),
 *   `_DEG` (degrees), `_CHARS_PER_SEC` (typewriter rate),
 *   `_LINES_PER_SEC` (terminal output rate).
 *
 * Re-exported from `scene-constants.ts` barrel — Sprint 4 Phase 1 adds the
 * `export * from './scene-destruction-constants';` line as the 7th sibling.
 */

/* ------------------------------------------------------------------------ */
/* Faz durations — designer Phase 2A fills (placeholders from PLAN §7 spec) */
/* ------------------------------------------------------------------------ */

/** Faz 0 — BANG continuation. PLAN §7 spec: 0-2sn. */
export const FAZ_0_BANG_DURATION_MS = 2000;
/** Faz 1 — Critical Dialog (Mac/Win). PLAN §7 spec: 2-7sn (5 second window). */
export const FAZ_1_DIALOG_DURATION_MS = 5000;
/** Faz 2 — Takeover (wallpaper + menubar/taskbar + toasts + icon fade). PLAN §7: 7-12sn. */
export const FAZ_2_TAKEOVER_DURATION_MS = 5000;
/** Faz 3 — Terminal (rm -rf typewriter + dynamic username). PLAN §7: 12-22sn. */
export const FAZ_3_TERMINAL_DURATION_MS = 10000;

/* ------------------------------------------------------------------------ */
/* Faz 0 audio — designer Phase 2A fills                                    */
/* ------------------------------------------------------------------------ */

/** Tinnitus oscillator fundamental. PLAN §7 + §10 spec: 4kHz. */
export const TINNITUS_FREQ_HZ = 4000;
/**
 * BiquadFilterNode low-pass cutoff applied to global audio bus during Faz 0.
 * Designer Phase 2A overrides; ~500-1000Hz typical for "ringing in ears" feel.
 */
export const LOW_PASS_CUTOFF_HZ = 800;
/** Tinnitus amplitude. PLAN §10 spec: -12dB sine. */
export const TINNITUS_AMPLITUDE_DB = -12;
/** Camera shake amplitude during bang. PLAN §7 spec: 5 degrees. */
export const BANG_CAMERA_SHAKE_DEG = 5;
/** Camera shake duration during bang. Designer Phase 2A fills. */
export const BANG_CAMERA_SHAKE_DURATION_MS = 400;
/** Bulb darken envelope duration on bang. Designer Phase 2A fills. */
export const BULB_DARKEN_DURATION_MS = 600;
/** Radio static fade-out duration on bang. Designer Phase 2A fills. */
export const RADIO_FADE_DURATION_MS = 1200;

/* ------------------------------------------------------------------------ */
/* Apartment bleed — designer Phase 2A fills                                */
/* ------------------------------------------------------------------------ */

/**
 * Apartment bleed #1 trigger offset from bang. PLAN §7: ~11s into destruction
 * (= start of Faz 2 + 4s). Bleed reveals the lobby for a fraction of a second.
 */
export const APARTMENT_BLEED_1_TRIGGER_MS = 11000;
/** Apartment bleed #1 visible duration. PLAN §7 spec: 0.3sn. */
export const APARTMENT_BLEED_1_DURATION_MS = 300;
/** Apartment bleed #2 trigger offset from bang. PLAN §7: ~16s. */
export const APARTMENT_BLEED_2_TRIGGER_MS = 16000;
/** Apartment bleed #2 visible duration. PLAN §7 spec: 0.2sn. */
export const APARTMENT_BLEED_2_DURATION_MS = 200;
/** Bleed flicker strobe rate when prefers-reduced-motion NOT set. */
export const APARTMENT_BLEED_FLICKER_HZ = 12;

/* ------------------------------------------------------------------------ */
/* Faz 1 dialog dimensions — designer Phase 2A fills                        */
/* ------------------------------------------------------------------------ */

/** macOS critical dialog width. Apple HIG modal sizing. */
export const DIALOG_MAC_WIDTH_PX = 380;
/** macOS critical dialog height. Apple HIG modal sizing. */
export const DIALOG_MAC_HEIGHT_PX = 200;
/** Win11 critical dialog width. Win11 fluent spec. */
export const DIALOG_WIN_WIDTH_PX = 400;
/** Win11 critical dialog height. Win11 fluent spec. */
export const DIALOG_WIN_HEIGHT_PX = 220;
/** Initial countdown value shown in dialog (e.g. "Restarting in 5..."). */
export const DIALOG_COUNTDOWN_START = 5;
/** Countdown tick interval (1 second). */
export const DIALOG_COUNTDOWN_INTERVAL_MS = 1000;

/* ------------------------------------------------------------------------ */
/* Faz 2 toast + chrome — designer Phase 2A fills                           */
/* ------------------------------------------------------------------------ */

/** Toast spawn cadence — 1 toast per second per PLAN §7. */
export const TOAST_SPAWN_INTERVAL_MS = 1000;
/** Toast slide-in animation duration. Designer Phase 2A fills. */
export const TOAST_SLIDE_IN_DURATION_MS = 300;
/** Toast visible lifetime before fade-out. */
export const TOAST_LIFETIME_MS = 4000;
/** Per-icon fade-out duration during Faz 2 desktop ikon dissolve. */
export const ICON_FADE_OUT_MS = 200;
/** Inter-icon delay so icons fade out one-by-one, not all at once. */
export const ICON_FADE_OUT_INTERVAL_MS = 400;
/** macOS menubar bar height. PLAN §8 spec. */
export const MENUBAR_MAC_HEIGHT_PX = 28;
/** Win11 taskbar height. PLAN §8 spec. */
export const TASKBAR_WIN_HEIGHT_PX = 48;

/* ------------------------------------------------------------------------ */
/* Faz 3 terminal — designer Phase 2A fills                                 */
/* ------------------------------------------------------------------------ */

/** Typewriter command typing rate. PLAN §7 spec: ~15 chars/sec. */
export const TYPEWRITER_COMMAND_CHARS_PER_SEC = 15;
/** Terminal output line rate after Enter. PLAN §7 spec: 60-80 lines/sec. */
export const TYPEWRITER_OUTPUT_LINES_PER_SEC = 70;
/** Terminal cursor blink rate (Hz). */
export const TYPEWRITER_CURSOR_BLINK_HZ = 2;

/* ------------------------------------------------------------------------ */
/* Wallpaper palettes — designer Phase 2A fills                             */
/* PLAN §7 / S6 risk closure: Apple/MS default wallpapers NEVER used —      */
/* procedural SVG/Canvas2D only. Mac variant generic mountain/fog; Win      */
/* variant abstract Win11-style bloom gradient.                             */
/* ------------------------------------------------------------------------ */

/** Mac wallpaper colour stops — generic mountain/fog silhouette. */
export const WALLPAPER_MAC_PALETTE = {
  /** Upper-sky gradient stop. */
  skyTop: '#4A6FA5',
  /** Lower-sky gradient stop. */
  skyBottom: '#A8C8E8',
  /** Mountain silhouette fill. */
  mountain: '#2C3E50',
  /** Sun-bloom highlight. */
  sun: '#F9E79F',
} as const;

/** Win wallpaper colour stops — abstract Win11-style bloom gradient. */
export const WALLPAPER_WIN_PALETTE = {
  /** Win11 signature blue gradient start. */
  gradientStart: '#0078D4',
  /** Win11 darker blue gradient end. */
  gradientEnd: '#005FB8',
  /** Cyan bloom accent overlay. */
  accentBloom: '#50E6FF',
} as const;

/* ------------------------------------------------------------------------ */
/* Fake file paths — designer Phase 2A fills (16-20 per OS rotating)        */
/* Username token "USER" replaced at runtime with window.api.getUsername()  */
/* result. Templates honor PLAN §7 spec: tax-returns, passwords-master,     */
/* messages-backup, thesis-final, plus 1-2 "cannot remove ... Device busy"  */
/* lines for authenticity.                                                  */
/* ------------------------------------------------------------------------ */

/**
 * Mac fake file path templates. Each entry is a string containing `USER`
 * which the terminal substitutes with the live username at render time.
 * Path style: `/Users/USER/...`.
 */
export const FAKE_FILE_PATHS_MAC: readonly string[] = [
  "removed '/Users/USER/Documents/2026-finance-Q1.xlsx'",
  "removed '/Users/USER/Pictures/Photos Library.photoslibrary/originals/4/abcd1234.jpg'",
  "removed '/Users/USER/Desktop/passport-scan.pdf'",
  "removed '/Users/USER/Documents/tax-returns-2025.pdf'",
  "removed '/Users/USER/Documents/passwords-master.txt'",
  "removed '/Users/USER/Documents/messages-backup/'",
  "removed '/Users/USER/Documents/thesis-final-FINAL-v3.docx'",
  // designer Phase 2A adds 8-12 more entries + 1-2 "cannot remove ... Device busy" lines
];

/**
 * Win fake file path templates. Each entry is a string containing `USER`
 * which the terminal substitutes with the live username at render time.
 * Path style: `C:\\Users\\USER\\...` (double backslash because string literal).
 */
export const FAKE_FILE_PATHS_WIN: readonly string[] = [
  'removed C:\\Users\\USER\\Documents\\2026-finance-Q1.xlsx',
  'removed C:\\Users\\USER\\Pictures\\Camera Roll\\IMG_0042.jpg',
  'removed C:\\Users\\USER\\Desktop\\passport-scan.pdf',
  'removed C:\\Users\\USER\\Documents\\tax-returns-2025.pdf',
  'removed C:\\Users\\USER\\Documents\\passwords-master.txt',
  'removed C:\\Users\\USER\\Documents\\messages-backup\\',
  'removed C:\\Users\\USER\\Documents\\thesis-final-FINAL-v3.docx',
  // designer Phase 2A adds 8-12 more entries + 1-2 "cannot remove ... Device busy" lines
];

/* ------------------------------------------------------------------------ */
/* Toast message ID lists — designer Phase 2A confirms keys exist           */
/* i18n-expert Phase 2B wires actual translation strings to these keys.     */
/* The destruction module imports the key list and looks up real text via   */
/* the existing i18n/strings.ts STRINGS map.                                */
/* ------------------------------------------------------------------------ */

/** Mac toast i18n keys. Spawned 1 per TOAST_SPAWN_INTERVAL_MS during Faz 2. */
export const TOAST_MESSAGES_MAC: readonly string[] = [
  'destruction.toast.mac.iCloudSyncPaused',
  'destruction.toast.mac.timeMachineBackupLost',
  'destruction.toast.mac.finderDiskEjectError',
  'destruction.toast.mac.kernelTaskTermination',
  'destruction.toast.mac.spotlightIndexStopped',
];

/** Win toast i18n keys. Spawned 1 per TOAST_SPAWN_INTERVAL_MS during Faz 2. */
export const TOAST_MESSAGES_WIN: readonly string[] = [
  'destruction.toast.win.oneDriveSyncError',
  'destruction.toast.win.defenderStopped',
  'destruction.toast.win.bitLockerProtectionFailed',
];

/* ------------------------------------------------------------------------ */
/* Cross-system a11y                                                        */
/* ------------------------------------------------------------------------ */

/**
 * matchMedia query string used by every motion/strobe surface in destruction/.
 * Designer Phase 2A section 8 enumerates the cross-system matrix; every
 * implementation file imports this constant rather than hardcoding the query
 * (single source of truth for the a11y gate).
 */
export const PREFERS_REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/* ------------------------------------------------------------------------ */
/* Username substitution token                                              */
/* ------------------------------------------------------------------------ */

/**
 * Placeholder substring inside FAKE_FILE_PATHS_* templates. The terminal
 * replaces this with the real `window.api.getUsername()` result at runtime.
 * Kept as a NAMED constant so the substitution site can grep for it (PLAN
 * S2 risk closure — no hardcoded username anywhere in the destruction tree).
 */
export const USERNAME_PLACEHOLDER = 'USER';
