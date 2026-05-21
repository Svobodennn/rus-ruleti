/**
 * Destruction sequence SSOT — Sprint 4 Phase 2A designer FILL.
 *
 * 7th sibling of the constants split (palette / audio / shader / revolver /
 * model / scene / **destruction**). Names every per-faz timing, audio param,
 * dialog dimension, toast spawn rate, typewriter rate, wallpaper palette,
 * OS-chrome dimension, fake-file-path list, and toast message id list.
 * Phase 1 scaffolded the NAMES + placeholder defaults; Phase 2A (this pass)
 * FILLED the VALUES per `src/renderer/scene/destruction/destruction-direction.md`.
 * Phase 2B (kraken-faz0-1 / kraken-faz2-3 / swift-expert / frontend-dev) CONSUMES.
 *
 * Structural rule (Sprint 3+4): no inline-with-comment magic-number loophole.
 * Every value Phase 2B will reference is NAMED here. Inline magic numbers in
 * destruction/ code are review-blocking under code-reviewer.
 *
 * Ownership map (post-Phase-2A):
 *   - designer (Phase 2A, this file): FAZ_*_DURATION_MS, TINNITUS_FREQ_HZ,
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
 * Re-exported from `scene-constants.ts` barrel — Sprint 4 Phase 1 added the
 * `export * from './scene-destruction-constants';` line as the 7th sibling.
 *
 * Designer rationale for values (full text in destruction-direction.md):
 *   - Faz durations match PLAN §7 line 230 spec literally (0-2s, 2-7s, 7-12s,
 *     12-22s). No deviation; PLAN is the senior contract.
 *   - LOW_PASS_CUTOFF_HZ=700 sits in the 600-800 "muffled ringing" band; 700
 *     is the choice for "voice of god muffled by cotton wool". Above 1000 the
 *     effect reads as EQ; below 500 the room loses too much body and the
 *     tinnitus 4kHz no longer rings against any low-frequency context.
 *     (Phase 1 default was 800; designer Phase 2A overrides to 700.)
 *   - APARTMENT_BLEED_FLICKER_HZ=12 is the lower edge of perceptible-strobe.
 *     A 12Hz strobe at 300ms duration produces ~4 visible flicker cycles
 *     (intentional — leaks "the room is still there" without becoming a
 *     migraine surface; reduced-motion replaces strobe with single 1s fade).
 *   - Wallpaper palettes are DESIGNER-AUTHORED and recognisably Mac/Win
 *     "aesthetic family" without sampling real assets (S6 risk closure;
 *     palette rationale in destruction-direction.md §4).
 *
 * Phase 2A designer additions (NEW vs Phase 1 stub — flagged for handoff):
 *   - TINNITUS_AMPLITUDE_REDUCED_MOTION_DB — explicit a11y-gated amplitude
 *     (Phase 1 only had TINNITUS_AMPLITUDE_DB at -12). Cross-referenced in
 *     destruction-direction.md §8.
 */

/* ------------------------------------------------------------------------ */
/* Faz durations — PLAN §7 literal                                          */
/* ------------------------------------------------------------------------ */

/** Faz 0 — BANG continuation. PLAN §7: 0-2sn. Black screen + tinnitus + low-pass + radio fade. */
export const FAZ_0_BANG_DURATION_MS = 2000;
/** Faz 1 — Critical Dialog (Mac/Win). PLAN §7: 2-7sn (5 second dialog hold + countdown). */
export const FAZ_1_DIALOG_DURATION_MS = 5000;
/** Faz 2 — Takeover (wallpaper + menubar/taskbar + toasts + icon fade + bleed #1). PLAN §7: 7-12sn. */
export const FAZ_2_TAKEOVER_DURATION_MS = 5000;
/** Faz 3 — Terminal (rm -rf typewriter + dynamic username + bleed #2). PLAN §7: 12-22sn. */
export const FAZ_3_TERMINAL_DURATION_MS = 10000;

/* ------------------------------------------------------------------------ */
/* Faz 0 audio — designer Phase 2A fill                                     */
/* ------------------------------------------------------------------------ */

/** Tinnitus oscillator fundamental. PLAN §7 + §10: 4kHz pure sine, the "ear ringing" cue. */
export const TINNITUS_FREQ_HZ = 4000;

/**
 * BiquadFilterNode low-pass cutoff applied to global audio bus during Faz 0
 * and held through Faz 3. Designer choice: 700Hz — sits in the 600-800Hz
 * "muffled by cotton wool" band. The bulb hum at 50Hz passes; the radio
 * static (broad-spectrum) is choked to its lower body; speech-band content
 * (~300-3kHz fundamentals) is rolled off, producing the "the world is far
 * away but you can still hear it breathing" reading from §7 of the art
 * bible. Slope Q=1.0 (standard 12dB/octave) — designer specifies the Q in
 * destruction-direction.md §7 but exposes only the cutoff here because the
 * Q is a kraken-faz0-1 implementation detail.
 */
export const LOW_PASS_CUTOFF_HZ = 700;

/** Tinnitus amplitude full-strength. PLAN §10 spec: -12dB sine. */
export const TINNITUS_AMPLITUDE_DB = -12;

/**
 * Tinnitus amplitude with prefers-reduced-motion active. Designer choice:
 * -18dB (~half-amplitude on the linear gain scale). Audible enough to keep
 * the "the bang really did happen" cue; not loud enough to provoke a
 * vestibular response in motion-sensitive players. Cross-referenced with
 * destruction-direction.md §8 reduced-motion matrix.
 *
 * NEW in Phase 2A — Phase 1 stub only had TINNITUS_AMPLITUDE_DB.
 */
export const TINNITUS_AMPLITUDE_REDUCED_MOTION_DB = -18;

/** Camera shake amplitude during bang. PLAN §7: 5 degrees peak. */
export const BANG_CAMERA_SHAKE_DEG = 5;

/**
 * Camera shake duration during bang. Designer choice: 400ms. The Sprint 2
 * +2deg kick shake was 200ms; Sprint 4 doubles BOTH the amplitude and the
 * decay so the bang reads as a categorically bigger event. Critically-
 * damped recovery (no overshoot — overshoot reads as "stylised", we want
 * "concussive jolt the mount can barely absorb"). Reduced-motion gate
 * forces amplitude to 0; the duration constant is consulted only when
 * the gate is OFF.
 */
export const BANG_CAMERA_SHAKE_DURATION_MS = 400;

/**
 * Bulb darken envelope duration on bang. Designer choice: 600ms. The
 * Sprint 1 §2 BULB_LIGHT.intensity=3.4 drops to 0 over this window with
 * a linear envelope (no easing — a power-cut is not an ease-out, it is
 * a sag). At 600ms the bulb visibly fades rather than snap-cuts; the
 * snap-cut reading would feel "the system rebooted the renderer" instead
 * of "the bulb burnt out". Reduced-motion gate shortens this to 200ms
 * (the fade is functional — it pushes the room into black — but the
 * smoothness is decorative; the destruction-direction.md §8 matrix names
 * this).
 */
export const BULB_DARKEN_DURATION_MS = 600;

/**
 * Radio static fade-out duration on bang. Designer choice: 1200ms. Longer
 * than the bulb darken because the radio is the LAST diegetic sound layer
 * the player notices fade — the bulb is visual, the camera shake is
 * vestibular, the tinnitus arrives in the foreground; the radio static
 * fade is the "you only realise it was there once it's gone" beat.
 * audioBed.fadeOutAmbient() handles the implementation; this is the
 * envelope length.
 */
export const RADIO_FADE_DURATION_MS = 1200;

/* ------------------------------------------------------------------------ */
/* Apartment bleed — designer Phase 2A fill                                 */
/* ------------------------------------------------------------------------ */

/**
 * Apartment bleed #1 trigger offset from bang. PLAN §7: ~11s. = Faz 2
 * entry (7000ms) + 4000ms (mid-Faz 2). The takeover has been on-screen
 * long enough that the player is forming "the game has escaped the
 * window" — and the bleed flickers the lobby back to plant the doubt.
 */
export const APARTMENT_BLEED_1_TRIGGER_MS = 11000;

/** Apartment bleed #1 visible duration. PLAN §7: 0.3sn = 4 flicker cycles at 12Hz. */
export const APARTMENT_BLEED_1_DURATION_MS = 300;

/**
 * Apartment bleed #2 trigger offset from bang. PLAN §7: ~16s. = Faz 3
 * entry (12000ms) + 4000ms (mid-Faz 3). Same 4-second offset as bleed #1
 * is INTENTIONAL — the rhythm is "every 4 seconds into a faz, the room
 * winks back" until Sprint 5 extends with #3 and #4 at non-4s offsets.
 * The 4-second cadence is deliberate enough to land subliminally, not
 * deliberate enough to read as a rule.
 */
export const APARTMENT_BLEED_2_TRIGGER_MS = 16000;

/** Apartment bleed #2 visible duration. PLAN §7: 0.2sn = ~2-3 flicker cycles at 12Hz. */
export const APARTMENT_BLEED_2_DURATION_MS = 200;

/**
 * Bleed flicker strobe rate when prefers-reduced-motion NOT set. Designer
 * choice: 12Hz — sits at the lower edge of the perceptible-strobe band
 * (10-20Hz). Above 20Hz the eye sees a steady grey; below 8Hz the strobe
 * reads as "obvious blinking" and breaks the "accidental leak" feeling.
 * 12Hz produces a flicker that feels INVOLUNTARY — the kind of strobe you
 * blink at without meaning to. Cross-checked against Sprint 1 bulb 14Hz
 * ripple in destruction-direction.md §6 (incommensurable: 12Hz x 11000ms
 * = 132 cycles, 14Hz x 11000ms = 154 cycles; gcd far below 1 cycle so
 * the bleed never resonates with the bulb pulse).
 *
 * IMPORTANT: photosensitive epilepsy safety — 12Hz at 300ms = 4 cycles
 * total visible. Sprint 6 retro will add the prefers-reduced-motion
 * fade-only fallback (destruction-direction.md §8).
 */
export const APARTMENT_BLEED_FLICKER_HZ = 12;

/* ------------------------------------------------------------------------ */
/* Faz 1 dialog dimensions — designer Phase 2A fill                         */
/* ------------------------------------------------------------------------ */

/** macOS critical dialog width. Apple HIG modal sizing (380px is a typical Apple alert width). */
export const DIALOG_MAC_WIDTH_PX = 380;
/** macOS critical dialog height. Just over square-aspect; fits title + body + 2 buttons. */
export const DIALOG_MAC_HEIGHT_PX = 200;
/** Win11 critical dialog width. Win11 fluent alert sizing — slightly wider than Mac. */
export const DIALOG_WIN_WIDTH_PX = 400;
/** Win11 critical dialog height. Fits a longer body wrap typical of Win error copy. */
export const DIALOG_WIN_HEIGHT_PX = 220;
/** Initial countdown value shown in Mac dialog body (e.g. "Restarting in 5..."). */
export const DIALOG_COUNTDOWN_START = 5;
/** Countdown tick interval (1 second). Maps to one decrement of the rendered N. */
export const DIALOG_COUNTDOWN_INTERVAL_MS = 1000;

/* ------------------------------------------------------------------------ */
/* Faz 2 toast + chrome — designer Phase 2A fill                            */
/* ------------------------------------------------------------------------ */

/** Toast spawn cadence — 1 toast per second per PLAN §7 line 245. */
export const TOAST_SPAWN_INTERVAL_MS = 1000;

/**
 * Toast slide-in animation duration. Designer choice: 300ms — matches the
 * macOS Notification Center slide-in default closely enough to feel
 * familiar without being a copy. Reduced-motion gate forces this to 0
 * (instant appear; the toast still spawns and ticks down on schedule).
 */
export const TOAST_SLIDE_IN_DURATION_MS = 300;

/**
 * Toast visible lifetime before fade-out. Designer choice: 4000ms — long
 * enough that the Faz 2 player reads the title + body (the joke depends
 * on the user catching "iCloud sync paused" / "BitLocker protection
 * failed" — those are the diegetic cues that "the system is dying"). At
 * 3 toasts visible simultaneously (4s lifetime x 1s spawn cadence approx 3-4
 * stacked on-screen) the stack reads "the alerts are piling up" — which
 * is the desired Faz 2 panic atmosphere.
 */
export const TOAST_LIFETIME_MS = 4000;

/**
 * Per-icon fade-out duration during Faz 2 desktop ikon dissolve. Designer
 * choice: 200ms — fast enough to feel "the icon was eaten", slow enough
 * to register the eating. Reduced-motion forces this to 0 (icons just
 * disappear; the 400ms inter-icon stagger still applies so the dissolve
 * still ripples through the icon grid).
 */
export const ICON_FADE_OUT_MS = 200;

/**
 * Inter-icon delay so icons fade out one-by-one, not all at once. 400ms
 * x 8 icons = 3.2s total dissolve, completes ~800ms before Faz 2 exit at
 * 5000ms. The staggered fade reads "the desktop is being eaten left to
 * right" — left-to-right reading direction reinforces the violence
 * narrative; an all-at-once disappear would feel "the screen reloaded".
 */
export const ICON_FADE_OUT_INTERVAL_MS = 400;

/** macOS menubar bar height. PLAN §8: native menubar is 24-28px; we use 28 (Mac11+ default). */
export const MENUBAR_MAC_HEIGHT_PX = 28;

/** Win11 taskbar height. PLAN §8: Win11 default is 48px. */
export const TASKBAR_WIN_HEIGHT_PX = 48;

/* ------------------------------------------------------------------------ */
/* Faz 3 terminal — designer Phase 2A fill                                  */
/* ------------------------------------------------------------------------ */

/**
 * Typewriter command typing rate. PLAN §7: ~15 chars/sec. Designer ratifies
 * 15 — slow enough that the user reads `sudo rm -rf / --no-preserve-root`
 * character-by-character (the joke depends on recognition mid-typing); the
 * full 32-character command takes ~2.1s. Faster would read as "an automated
 * scrubbing"; slower would read as "the system is hesitating".
 */
export const TYPEWRITER_COMMAND_CHARS_PER_SEC = 15;

/**
 * Terminal output line rate after Enter. PLAN §7: 60-80 lines/sec. Designer
 * choice: 70 — the visual reading is "the rm is gushing files"; the player
 * cannot read individual paths (which is fine — the joke is the volume,
 * not the comprehension), but the named file motifs (tax-returns,
 * passwords-master, thesis-final) catch the eye 1-2 times during the
 * 8-second output window via designer-placed positioning in the rotation.
 */
export const TYPEWRITER_OUTPUT_LINES_PER_SEC = 70;

/**
 * Terminal cursor blink rate. Designer choice: 2Hz (500ms on / 500ms off).
 * Standard terminal-cursor cadence; faster would read as "loading"; slower
 * as "stale". Reduced-motion gate replaces the blink with solid 100%
 * opacity (the cursor still indicates the prompt position, just without
 * the strobe surface).
 */
export const TYPEWRITER_CURSOR_BLINK_HZ = 2;

/* ------------------------------------------------------------------------ */
/* Wallpaper palettes — designer Phase 2A fill                              */
/*                                                                          */
/* PLAN §7 / S6 risk closure: Apple/MS default wallpapers NEVER used —      */
/* procedural SVG/Canvas2D only. Mac variant evokes "abstract mountain at   */
/* dawn" (the Big-Sur-aesthetic-family but a designer-authored palette);    */
/* Win variant evokes "Win11 fluent bloom gradient" (the family, not the    */
/* asset). Both palettes were authored by reading the PLAN §2 lobby palette */
/* (sodium / oak / rust / shadow) and choosing OPPOSITES — Mac wallpaper    */
/* uses cool dawn-blues, Win uses tech-blue gradient. The visual contrast   */
/* between "cellar palette" (lobby) and "OS palette" (destruction) is part  */
/* of the violation reading: the destruction is in a different VISUAL       */
/* LANGUAGE than the lobby, which makes the apartment-bleed flickers hit    */
/* harder (the bleed snaps the player back to the warm-sodium palette).    */
/* ------------------------------------------------------------------------ */

/**
 * Mac wallpaper colour stops — abstract dawn mountain. Designer-authored.
 * The palette evokes a "macOS Big-Sur-style abstract landscape" without
 * being a copy: cool teals at the sky top, warmer dusty-blue at the
 * horizon, deep mountain-silhouette indigo, warm sun bloom. NO real
 * macOS wallpaper sampled.
 *
 * Authoring note: each value was tested against the lobby PALETTE.shadow
 * (#0a0908) and PALETTE.sodium (#c89b3c) to ensure the wallpaper reads
 * as "different visual language" — none of these hex values appear in
 * the lobby palette.
 */
export const WALLPAPER_MAC_PALETTE = {
  /** Upper-sky gradient stop — deep dawn teal. */
  skyTop: '#3D5A80',
  /** Lower-sky gradient stop — dusty horizon blue. */
  skyBottom: '#98C1D9',
  /** Mountain silhouette fill — deep indigo, sits dark against the sky. */
  mountain: '#293241',
  /** Sun-bloom highlight — warm cream, single radial top-right. */
  sun: '#EE9B5B',
} as const;

/**
 * Win wallpaper colour stops — abstract Win11 fluent bloom. Designer-
 * authored. The palette evokes the "Win11 default wallpaper aesthetic
 * family" (deep saturated blue with a brighter accent bloom) without
 * sampling the real asset. The accent is shifted toward cyan-cool
 * rather than the real Win11 cyan to keep this OBVIOUSLY designer-
 * fictional.
 */
export const WALLPAPER_WIN_PALETTE = {
  /** Gradient start — deep Win11-family blue. */
  gradientStart: '#0A3D62',
  /** Gradient end — darker mid-blue, sinks toward bottom of viewport. */
  gradientEnd: '#062847',
  /** Bloom accent — cool cyan radial, mid-lower of viewport. */
  accentBloom: '#3DD1E7',
} as const;

/* ------------------------------------------------------------------------ */
/* Fake file paths — designer Phase 2A fill (18 patterns per OS rotating)   */
/*                                                                          */
/* Username token "USER" replaced at runtime with window.api.getUsername()  */
/* result. Templates honour PLAN §7 line 257-265 motifs: tax-returns,       */
/* passwords-master, messages-backup, thesis-final, ssh keys, AWS creds,    */
/* keychain "Device busy" line. Plus 8-11 additional designer-chosen        */
/* "what would a real rm -rf reveal about your life" entries.               */
/*                                                                          */
/* SECURITY NOTE: every path is FICTIONAL. The terminal never touches the   */
/* filesystem — it only renders these strings. The "Device busy" line is    */
/* a literal `rm:` error format mimic (NOT a real rm error capture from any */
/* user's machine).                                                         */
/* ------------------------------------------------------------------------ */

/**
 * Mac fake file path templates. 18 entries — 16 `removed` paths + 2
 * `rm: cannot remove ... : Device busy` lines for authenticity. The 4
 * PLAN §7 motifs (tax-returns, passwords-master, messages-backup,
 * thesis-final) are present and positioned in the rotation so that
 * within any 4-second visible window during Faz 3 (the terminal scrolls
 * past ~280 lines at 70 LPS in 4s, looping the 18-entry list ~15 times)
 * the motif-bearing entries appear ~15-20 times each — enough that the
 * user's eye catches them at least 1-2 times during the 8s output
 * window. Path style: `/Users/USER/...`.
 *
 * Substitution: `USER` literal is replaced with the runtime username at
 * render time per USERNAME_PLACEHOLDER. Sprint 4 Phase 1 IPC channel
 * `os:get-username` returns the local username from `os.userInfo()`.
 */
export const FAKE_FILE_PATHS_MAC: readonly string[] = [
  // PLAN §7 motif entries
  "removed '/Users/USER/Documents/tax-returns-2025.pdf'",
  "removed '/Users/USER/Documents/passwords-master.txt'",
  "removed '/Users/USER/Documents/messages-backup/'",
  "removed '/Users/USER/Documents/thesis-final-FINAL-v3.docx'",
  // Designer additions — "what your home directory looks like at 2am"
  "removed '/Users/USER/Documents/2026-finance-Q1.xlsx'",
  "removed '/Users/USER/Pictures/Photos Library.photoslibrary/originals/4/abcd1234.jpg'",
  "removed '/Users/USER/Desktop/passport-scan.pdf'",
  "removed '/Users/USER/.ssh/id_rsa'",
  "removed '/Users/USER/.ssh/id_rsa.pub'",
  "removed '/Users/USER/.aws/credentials'",
  "removed '/Users/USER/.aws/config'",
  "removed '/Users/USER/Music/iTunes/iTunes Library.itl'",
  "removed '/Users/USER/Movies/family-2024/birthday.mov'",
  "removed '/Users/USER/Downloads/contract-signed-final.pdf'",
  "removed '/Users/USER/Library/Application Support/Notes/Notes.sqlite'",
  "removed '/Users/USER/Documents/medical/lab-results-2025.pdf'",
  // "Device busy" lines — system files that fail to remove (authenticity beat)
  "rm: cannot remove '/Users/USER/Library/Keychains/login.keychain-db': Device busy",
  "rm: cannot remove '/Users/USER/Library/Cookies/Cookies.binarycookies': Resource busy",
];

/**
 * Win fake file path templates. 18 entries — 16 `removed` paths + 2
 * `rm: cannot remove ... : Device busy` lines. Same PLAN §7 motif
 * coverage as the Mac list. Path style: `C:\\Users\\USER\\...`
 * (escaped backslashes because string literal).
 *
 * Note: the `rm:` prefix is used on Win too — the renderer is reading a
 * coreutils-style error format. On a real Windows machine PowerShell's
 * `Remove-Item` would produce a different error string; we deliberately
 * use the GNU `rm:` format on both Mac and Win because the player's
 * mental model of "rm -rf" is the unified one across both OSes.
 */
export const FAKE_FILE_PATHS_WIN: readonly string[] = [
  // PLAN §7 motif entries
  'removed C:\\Users\\USER\\Documents\\tax-returns-2025.pdf',
  'removed C:\\Users\\USER\\Documents\\passwords-master.txt',
  'removed C:\\Users\\USER\\Documents\\messages-backup\\',
  'removed C:\\Users\\USER\\Documents\\thesis-final-FINAL-v3.docx',
  // Designer additions — "what a Windows home directory looks like"
  'removed C:\\Users\\USER\\Documents\\2026-finance-Q1.xlsx',
  'removed C:\\Users\\USER\\Pictures\\Camera Roll\\IMG_0042.jpg',
  'removed C:\\Users\\USER\\Desktop\\passport-scan.pdf',
  'removed C:\\Users\\USER\\.ssh\\id_rsa',
  'removed C:\\Users\\USER\\.ssh\\id_rsa.pub',
  'removed C:\\Users\\USER\\.aws\\credentials',
  'removed C:\\Users\\USER\\.aws\\config',
  'removed C:\\Users\\USER\\AppData\\Roaming\\Microsoft\\Outlook\\Outlook.pst',
  'removed C:\\Users\\USER\\Videos\\family-2024\\birthday.mp4',
  'removed C:\\Users\\USER\\Downloads\\contract-signed-final.pdf',
  'removed C:\\Users\\USER\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Login Data',
  'removed C:\\Users\\USER\\Documents\\medical\\lab-results-2025.pdf',
  // "Device busy" lines — locked system files
  "rm: cannot remove 'C:\\Users\\USER\\AppData\\Local\\Microsoft\\Windows\\WebCache\\WebCacheV01.dat': Device busy",
  "rm: cannot remove 'C:\\Users\\USER\\AppData\\Local\\Packages\\Microsoft.Windows.StartMenuExperienceHost_*\\TempState\\cache.db': Resource busy",
];

/* ------------------------------------------------------------------------ */
/* Toast message ID lists — designer Phase 2A confirms keys                 */
/*                                                                          */
/* i18n-expert Phase 2B wires actual translation strings to these keys.     */
/* The destruction module imports the key list and looks up real text via   */
/* the existing i18n/strings.ts STRINGS map.                                */
/*                                                                          */
/* Mac list = 5 entries (one per TOAST_SPAWN_INTERVAL_MS = 5 toasts in the  */
/* 5-second Faz 2 window). Win list = 3 entries (the Win toast cadence is   */
/* the same 1s but Win has fewer canonical "system is dying" surfaces, so   */
/* the rotation repeats after 3 — repeats are FINE; the joke is the volume).*/
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
 * Designer Phase 2A §8 enumerates the cross-system matrix; every
 * implementation file imports this constant rather than hardcoding the query
 * (single source of truth for the a11y gate).
 *
 * The CSS `@media (prefers-reduced-motion: reduce)` rules in
 * `src/renderer/styles/*.css` use the literal media query at the start of
 * the at-rule; this JS constant must stay in lockstep with that string.
 */
export const PREFERS_REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/* ------------------------------------------------------------------------ */
/* Username substitution token                                              */
/* ------------------------------------------------------------------------ */

/**
 * Placeholder substring inside FAKE_FILE_PATHS_* templates. The terminal
 * replaces this with the real `window.api.getUsername()` result at runtime.
 * Kept as a NAMED constant so the substitution site can grep for it (PLAN
 * S2 risk closure — no hardcoded username anywhere in the destruction tree;
 * the destruction never SEES the username string at module load time).
 *
 * Phase 2B kraken-faz2-3 implementation contract:
 *   1. await `window.api.getUsername()` once at destruction-director entry
 *   2. cache the returned string
 *   3. for each FAKE_FILE_PATHS_*[i] template, run
 *      `template.split(USERNAME_PLACEHOLDER).join(username)`
 *   4. render the substituted strings to the terminal
 *
 * If `window.api.getUsername()` rejects or returns empty, the substitution
 * falls back to literal "USER" — the terminal still reads but the
 * username-reveal joke degrades gracefully.
 */
export const USERNAME_PLACEHOLDER = 'USER';

/* ========================================================================== */
/* SPRINT 5 — Faz 4-7 timing constants                                        */
/*                                                                            */
/* PLAN §7 lines 268-289 narrative spec. Faz 4 = 21-30sn (file wipe), Faz 5  */
/* = 30-37sn (disk format), Faz 6 = 37-44sn (BSOD), Faz 7 = 44-50sn          */
/* (bootloop). Designer Phase 2A may add color/motion knobs alongside these  */
/* timing constants; kraken Phase 1 declares the timing scaffolding only.   */
/* ========================================================================== */

/* ------------------------------------------------------------------------ */
/* Faz 4 — File Wipe Progress (21-30sn)                                     */
/* ------------------------------------------------------------------------ */

/** Faz 4 duration. PLAN §7: 21-30sn = 9 second window. */
export const FAZ4_DURATION_MS = 9000;
/** Faz 4 start offset from bang (cumulative: 2+5+5+10-1=21sn). */
export const FAZ4_START_MS = 21000;
/**
 * Progress bar initial position. Designer choice: starts at 80% so the
 * regression to 12% reads as "the disk is being eaten BACKWARDS" — the
 * joke depends on seeing the bar UNDO progress, which requires a high
 * starting point.
 */
export const FAZ4_PROGRESS_INITIAL_PERCENT = 80;
/** Progress bar floor — it never goes below this. 12% reads "almost gone". */
export const FAZ4_PROGRESS_FLOOR_PERCENT = 12;
/**
 * Stochastic decrement cadence — every 600ms the bar drops by 1-3%.
 * Slower than 600ms reads as "the system froze"; faster reads as
 * "intentional reset" rather than "leak".
 */
export const FAZ4_PROGRESS_TICK_MS = 600;
/** Items-remaining initial count. PLAN §7 line 270: 1,847,293. */
export const FAZ4_ITEMS_REMAINING_INITIAL = 1_847_293;
/**
 * ETA growth sequence — the ETA gets WORSE over time, signaling "this is
 * never going to finish". Each step is shown for FAZ4_DURATION_MS /
 * length seconds before the next replaces it.
 */
export const FAZ4_ETA_GROWTH_STEPS = [
  '14 hours, 32 minutes',
  '17 hours, 8 minutes',
  '22 hours, 17 minutes',
  '1 day, 14 hours',
  '3 days, 8 hours',
] as const;
/** File-path scrolling cadence — 12 paths per second across the readout. */
export const FAZ4_FILE_PATH_SCROLL_HZ = 12;

/* ------------------------------------------------------------------------ */
/* Faz 5 — Disk Format (30-37sn)                                            */
/* ------------------------------------------------------------------------ */

/** Faz 5 duration. PLAN §7: 30-37sn = 7 second window. */
export const FAZ5_DURATION_MS = 7000;
/** Faz 5 start offset from bang (cumulative end of Faz 4). */
export const FAZ5_START_MS = 30000;
/** Sector total — PLAN §7 line 276: 2,000,000,000 sectors. */
export const FAZ5_SECTOR_TOTAL = 2_000_000_000;
/** Sector counter initial value — PLAN §7 line 276: 8,492,103. */
export const FAZ5_SECTOR_INITIAL = 8_492_103;
/**
 * Sector counter increment per second. Designer choice: 40 — the counter
 * visibly ticks but barely moves against the 2-billion total (visually
 * conveys "this will take forever"; mathematically the joke).
 */
export const FAZ5_SECTOR_INCREMENT_PER_SEC = 40;
/**
 * S.M.A.R.T. error / bad-sector reallocation interval. PLAN §7 line 277:
 * "Bad sector. Reallocating." / "S.M.A.R.T. error: drive failing." /
 * "WARN: SSD wear level 142%" — one error message every ~900ms.
 */
export const FAZ5_SMART_ERROR_INTERVAL_MS = 900;

/* ------------------------------------------------------------------------ */
/* Faz 6 — Kernel Panic / BSOD (37-44sn)                                    */
/* ------------------------------------------------------------------------ */

/** Faz 6 duration. PLAN §7: 37-44sn = 7 second window. */
export const FAZ6_DURATION_MS = 7000;
/** Faz 6 start offset from bang (cumulative end of Faz 5). */
export const FAZ6_START_MS = 37000;
/**
 * Mac hex-dump line auto-scroll rate. Designer choice: 6Hz — the hex
 * dump scrolls fast enough to feel "the system is dumping kernel
 * memory" but slow enough that the player notices individual hex bytes
 * tick past.
 */
export const FAZ6_HEX_DUMP_LINE_HZ = 6;
/**
 * Win BSOD frowny-face `:(` CRT flicker rate. Designer choice: 5Hz — the
 * frowny visibly flickers but doesn't strobe-jitter. Reduced-motion gate
 * disables the flicker entirely.
 */
export const FAZ6_FROWNY_FLICKER_HZ = 5;
/** BSOD beep fundamental. Square wave 800Hz, 200ms, ADSR. */
export const FAZ6_BSOD_BEEP_HZ = 800;
/** BSOD beep duration. PLAN §7 line 283: classic short beep. */
export const FAZ6_BSOD_BEEP_MS = 200;

/* ------------------------------------------------------------------------ */
/* Faz 7 — Bootloop (44-50sn)                                               */
/* ------------------------------------------------------------------------ */

/** Faz 7 duration. PLAN §7: 44-50sn = 6 second window. */
export const FAZ7_DURATION_MS = 6000;
/** Faz 7 start offset from bang (cumulative end of Faz 6). */
export const FAZ7_START_MS = 44000;
/** Bootloop cycle length. PLAN §7 line 287: "3sn sonra otomatik tekrar". */
export const FAZ7_CYCLE_MS = 3000;
/**
 * Mac progress-bar freeze position. PLAN §7 line 286: "yarıda donar" —
 * designer interpretation: ~40% gives "almost reached the halfway
 * milestone, abandoned just before". Above 50% reads "the boot was
 * nearly done"; below 30% reads "the boot barely started".
 */
export const FAZ7_PROGRESS_FREEZE_PERCENT = 40;
/**
 * Per-cycle drift range around FAZ7_PROGRESS_FREEZE_PERCENT. Each cycle
 * the bar lands somewhere in [38, 42]% to telegraph "different attempt,
 * same failure pattern" rather than "the same frame is being repeated".
 */
export const FAZ7_PROGRESS_DRIFT_RANGE = [38, 42] as const;
/**
 * Electrical-tick (low-frequency stray-current click) cadence. 0.5Hz =
 * one tick per 2 seconds. Reads as "the dead system is still drawing
 * trickle current and twitching". Reduced-motion gate silences entirely.
 */
export const FAZ7_ELECTRICAL_TICK_HZ = 0.5;

/* ========================================================================== */
/* SPRINT 5 — Apartment bleed single-owner decree (TH-S4-01 closure)         */
/*                                                                            */
/* SHARED-RESOURCE OWNERSHIP DECREE — Sprint 5 architectural rule.            */
/*                                                                            */
/* Every shared resource (timer, audio node, scheduled bleed) MUST declare    */
/* a SINGLE owner module. Phase 3 qa-engineer SCANS for double-ownership      */
/* violations. Sprint 4 BLOCKER (apartment-bleed double-fire) was caused by  */
/* Lane A and Lane B both scheduling bleeds; Sprint 5 forecloses by         */
/* PRE-declaring every owner in the shared SSOT before Phase 2B lanes start. */
/*                                                                            */
/* Adding a new shared resource? Add its owner decree HERE FIRST. Phase 3    */
/* QA double-ownership scan will REJECT any owner string that appears on    */
/* multiple resources where coordination is suspect.                          */
/* ========================================================================== */

/** Bleed #3 owner — Faz 4 (file wipe) at ~26sn (5sn into Faz 4). 0.4sn. */
export const BLEED_3_OWNER = 'faz4-file-wipe' as const;
/** Bleed #4 owner — Faz 7 (bootloop) at ~48sn (4sn into Faz 7). 0.8sn longest. */
export const BLEED_4_OWNER = 'faz7-bootloop' as const;
/** HDD-grind audio owner — starts in Faz 4. */
export const HDD_GRIND_AUDIO_OWNER = 'faz4-file-wipe' as const;
/**
 * Fan-overdrive audio owner — starts in Faz 4, extends through Faz 5 +
 * Faz 6. Single-owner is the START site; Faz 5/6 import the handle and
 * call `setGain()` / `stop()` but never re-construct.
 */
export const FAN_OVERDRIVE_AUDIO_OWNER = 'faz4-file-wipe' as const;
/** Electrical-buzz audio owner — Faz 5 disk-format ambient buzz. */
export const ELECTRICAL_BUZZ_AUDIO_OWNER = 'faz5-disk-format' as const;
/** BSOD-beep audio owner — Faz 6 single fire. */
export const BSOD_BEEP_AUDIO_OWNER = 'faz6-bsod' as const;
/** Electrical-tick audio owner — Faz 7 0.5Hz click loop. */
export const ELECTRICAL_TICK_AUDIO_OWNER = 'faz7-bootloop' as const;
/** Mac hex panic-log dump scroll RAF owner — Faz 6 Mac branch. */
export const HEX_PANIC_DUMP_OWNER = 'faz6-bsod' as const;
/** Win BSOD frowny-flicker setInterval owner — Faz 6 Win branch. */
export const FROWNY_FLICKER_TIMER_OWNER = 'faz6-bsod' as const;
/** Faz 5 sector-counter increment timer owner. */
export const SECTOR_COUNTER_TIMER_OWNER = 'faz5-disk-format' as const;
/** Faz 5 S.M.A.R.T. error stream interval owner. */
export const SMART_ERROR_STREAM_TIMER_OWNER = 'faz5-disk-format' as const;
/** Faz 4 progress-bar regression decrement timer owner. */
export const PROGRESS_BAR_REGRESSION_TIMER_OWNER = 'faz4-file-wipe' as const;
/** Faz 4 ETA-growth advance timer owner. */
export const ETA_GROWTH_TIMER_OWNER = 'faz4-file-wipe' as const;
/** Faz 4 items-remaining counter decrement timer owner. */
export const ITEMS_REMAINING_TIMER_OWNER = 'faz4-file-wipe' as const;
/** Faz 4 file-path scrolling readout timer owner. */
export const FILE_PATH_SCROLL_TIMER_OWNER = 'faz4-file-wipe' as const;
/** Faz 7 bootloop cycle-advance setInterval owner. */
export const BOOTLOOP_CYCLE_TIMER_OWNER = 'faz7-bootloop' as const;
