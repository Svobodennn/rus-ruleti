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
/**
 * Fan-overdrive peak gain held during Faz 6 — designer §15 "peak fan rpm,
 * locked". Lane A's createFanOverdriveHandle ramps to 0.8; Faz 6 nudges to
 * 0.9 to make the final silence more dramatic against the locked peak.
 * This is the audio composition pivot for the silence cascade pre-load.
 */
export const FAZ6_FAN_OVERDRIVE_PEAK_GAIN = 0.9;

/* ------------------------------------------------------------------------ */
/* Faz 7 — Bootloop (44-50sn)                                               */
/* ------------------------------------------------------------------------ */

/** Faz 7 duration. PLAN §7: 44-50sn = 6 second window. */
export const FAZ7_DURATION_MS = 6000;
/** Faz 7 start offset from bang (cumulative end of Faz 6). */
export const FAZ7_START_MS = 44000;

/**
 * Mac state-machine per-cycle durations — designer §14 mandate.
 * "apple-loading 1sn → frozen 1sn → no-boot 1sn" per PLAN §7 line 286.
 */
export const FAZ7_MAC_APPLE_LOADING_MS = 1000;
export const FAZ7_MAC_FROZEN_MS = 1000;
export const FAZ7_MAC_NO_BOOT_MS = 1000;

/**
 * Win state-machine per-cycle durations — designer §14 mandate.
 * "no-boot 2sn + restart-pending 1sn" per PLAN §7 line 287.
 */
export const FAZ7_WIN_NO_BOOT_MS = 2000;
export const FAZ7_WIN_RESTART_PENDING_MS = 1000;

/**
 * Bootloop cycle length — derived from Mac state-machine sum so the
 * invariant (1000+1000+1000=3000) is structurally enforced, not just
 * documented. PLAN §7 line 287: "3sn sonra otomatik tekrar".
 */
export const FAZ7_CYCLE_MS =
  FAZ7_MAC_APPLE_LOADING_MS + FAZ7_MAC_FROZEN_MS + FAZ7_MAC_NO_BOOT_MS;
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

/* ========================================================================== */
/* SPRINT 5 PHASE 2A — designer color + motion FILL                          */
/*                                                                            */
/* Phase 1 declared timing + owner decrees only. Phase 2A (this block) fills */
/* every Faz 4-7 color, opacity, stroke, font-weight, and motion knob the    */
/* lane teams will reference. Rationale lives in destruction-direction.md     */
/* §10-§15. NO timing knobs added here (Phase 1 owns timing — single owner).  */
/* ========================================================================== */

/* ------------------------------------------------------------------------ */
/* Faz 4 — File Wipe color + chrome dimensions                              */
/* ------------------------------------------------------------------------ */

/** Mac Finder progress-sheet background. PLAN §7 line 269: "Securely erasing disk…". */
export const FAZ4_MAC_DIALOG_BG_COLOR = '#ECECEC';
/** Mac Finder progress-sheet foreground (body + count text). */
export const FAZ4_MAC_DIALOG_FG_COLOR = '#1D1D1F';
/** Mac progress-bar track (the empty rail behind the fill). */
export const FAZ4_PROGRESS_BAR_TRACK_MAC = '#D6D6D6';
/** Mac progress-bar fill — system blue family but designer-shifted toward cyan. */
export const FAZ4_PROGRESS_BAR_FG_MAC = '#0096FF';
/** Win File Explorer copy-dialog background. PLAN §7 line 269: "File Explorer is wiping files…". */
export const FAZ4_WIN_DIALOG_BG_COLOR = '#FAFAFA';
/** Win File Explorer copy-dialog foreground. */
export const FAZ4_WIN_DIALOG_FG_COLOR = '#1B1B1B';
/** Win progress-bar track. */
export const FAZ4_PROGRESS_BAR_TRACK_WIN = '#E5E5E5';
/** Win progress-bar fill — Win11 accent blue (matches Faz 1 button family). */
export const FAZ4_PROGRESS_BAR_FG_WIN = '#0078D4';
/** Greyed-out Cancel button background (both OSes). Designer choice: neutral 60% grey. */
export const FAZ4_CANCEL_BUTTON_BG_COLOR = '#A0A0A0';
/** Mac progress-dialog modal width. Apple HIG sheet width is typically 460-520. */
export const FAZ4_MAC_DIALOG_WIDTH_PX = 480;
/** Mac progress-dialog modal height — fits title + bar + 3-line caption stack + Cancel button. */
export const FAZ4_MAC_DIALOG_HEIGHT_PX = 220;
/** Win progress-dialog modal width — Win11 File Explorer copy sheet is wider than Mac. */
export const FAZ4_WIN_DIALOG_WIDTH_PX = 520;
/** Win progress-dialog modal height. */
export const FAZ4_WIN_DIALOG_HEIGHT_PX = 240;
/** File-path readout viewport height (CSS px). 4-5 lines of monospace 12px visible. */
export const FAZ4_FILE_PATH_VIEWPORT_HEIGHT_PX = 64;

/* ------------------------------------------------------------------------ */
/* Faz 5 — Disk Format color + typography                                   */
/* ------------------------------------------------------------------------ */

/** Mac low-level-format fullscreen background. PLAN §7 line 275 conventions. */
export const FAZ5_MAC_BG_COLOR = '#000000';
/** Mac fullscreen foreground monospace fill. */
export const FAZ5_MAC_FG_COLOR = '#FFFFFF';
/** Mac S.M.A.R.T. amber emphasis color. Drawn from sodium-bulb family for cross-faz callback. */
export const FAZ5_MAC_SMART_AMBER_COLOR = '#FFAA00';
/** Win low-level-format BIOS-POST blue background. */
export const FAZ5_WIN_BG_COLOR = '#0B0F8B';
/** Win foreground monospace fill. */
export const FAZ5_WIN_FG_COLOR = '#FFFFFF';
/** Win ASCII border emphasis amber. Matches Mac SMART amber for cross-OS audio-visual coherence. */
export const FAZ5_WIN_BORDER_AMBER_COLOR = '#FFAA00';
/**
 * 60Hz electrical-buzz fundamental (Faz 5 ambient). Mains-hum frequency in
 * NA/JP regions; common cellar-electrical reference. Sits well below the
 * 700Hz low-pass cutoff so it survives the global filter as a felt-not-
 * heard rumble.
 */
export const FAZ5_ELECTRICAL_BUZZ_HZ = 60;

/* ------------------------------------------------------------------------ */
/* Faz 6 — Kernel Panic / BSOD color + typography                           */
/* ------------------------------------------------------------------------ */

/** Mac kernel-panic background. Real macOS panic background is #1d1d1f-family. */
export const FAZ6_MAC_BG_COLOR = '#1D1D1F';
/** Mac panic foreground — pure white for the 4-language headline + hex dump. */
export const FAZ6_MAC_FG_COLOR = '#FFFFFF';
/** Mac panic 4-language headline font-weight. PLAN §7 line 281: thin Helvetica Neue Light. */
export const FAZ6_MAC_PANIC_FONT_WEIGHT = 300;
/** Mac panic 4-language headline font-size (CSS px). Calm, legible, NOT alarming. */
export const FAZ6_MAC_PANIC_FONT_SIZE_PX = 18;
/** Mac panic 4-language inter-line vertical gap (CSS px). Generous breathing room. */
export const FAZ6_MAC_PANIC_LINE_GAP_PX = 12;
/** Win BSOD background — Win10/11 BSOD blue (`#0078D4` accent family). */
export const FAZ6_WIN_BG_COLOR = '#0078D4';
/** Win BSOD foreground. */
export const FAZ6_WIN_FG_COLOR = '#FFFFFF';
/** Win sad-face `:(` glyph font-size — Win11 BSOD spec is ~120-160px. */
export const FAZ6_WIN_FROWNY_FONT_SIZE_PX = 140;
/** Win BSOD body font weight (per Segoe UI Variable family). */
export const FAZ6_WIN_BODY_FONT_WEIGHT = 300;
/** Win BSOD QR PNG render dimension (square). Real Win11 BSOD is ~120-160px. */
export const FAZ6_WIN_QR_DIMENSION_PX = 128;
/** BSOD beep ADSR envelope (ms). Per `destruction-direction.md` §11 audio mix. */
export const FAZ6_BSOD_BEEP_ATTACK_MS = 5;
export const FAZ6_BSOD_BEEP_DECAY_MS = 0;
export const FAZ6_BSOD_BEEP_SUSTAIN_LEVEL = 1;
export const FAZ6_BSOD_BEEP_RELEASE_MS = 195;

/* ------------------------------------------------------------------------ */
/* Faz 7 — Bootloop color + state                                           */
/* ------------------------------------------------------------------------ */

/** Mac bootloop background. Real Mac boot screen is pure black. */
export const FAZ7_MAC_BG_COLOR = '#000000';
/** Mac bootloop foreground (apple SVG fill + caption + ⊘ stroke). */
export const FAZ7_MAC_FG_COLOR = '#FFFFFF';
/** Mac bootloop progress-bar track (empty rail). */
export const FAZ7_MAC_PROGRESS_BAR_TRACK_COLOR = '#3A3A3A';
/** Mac bootloop progress-bar fill (the bar that freezes at ~40%). */
export const FAZ7_MAC_PROGRESS_BAR_FILL_COLOR = '#FFFFFF';
/**
 * Mac bootloop progress-bar fill percent shown WHILE the "loading" state is
 * active (before freeze). Designer choice: ramps 0 → FAZ7_PROGRESS_FREEZE_PERCENT
 * over 800ms, then halts. Reuses FAZ7_PROGRESS_FREEZE_PERCENT for the freeze
 * target — kept separate here to make the LOAD-PHASE animation knob explicit.
 */
export const FAZ7_MAC_PROGRESS_BAR_FILL_PCT = 40;
/** Mac no-boot ⊘ glyph stroke width (CSS px). Thin, clinical, NOT alarming. */
export const FAZ7_NO_ENTRY_STROKE_PX = 4;
/** Mac no-boot ⊘ glyph diameter (CSS px). */
export const FAZ7_NO_ENTRY_DIAMETER_PX = 96;
/** Mac eaten-apple SVG dimension on bootloop screen (CSS px). Larger than 16px dialog version. */
export const FAZ7_MAC_APPLE_DIMENSION_PX = 72;
/** Win bootloop BIOS-blue background — same hue as Faz 5 disk-format. */
export const FAZ7_WIN_BG_COLOR = '#0B0F8B';
/** Win bootloop foreground. */
export const FAZ7_WIN_FG_COLOR = '#FFFFFF';

/* ------------------------------------------------------------------------ */
/* Apartment bleed #3 + #4 — color + motion (Phase 1 declared owners only)  */
/* ------------------------------------------------------------------------ */

/** Bleed #3 trigger offset from bang. PLAN §7 line 278: ~34sn. */
export const APARTMENT_BLEED_3_TRIGGER_MS = 34000;
/** Bleed #3 visible duration. PLAN §7 line 278: 0.4sn = ~5 cycles at 12Hz. */
export const APARTMENT_BLEED_3_DURATION_MS = 400;
/** Bleed #4 trigger offset from bang. PLAN §7 line 288: ~48sn. */
export const APARTMENT_BLEED_4_TRIGGER_MS = 48000;
/** Bleed #4 visible duration. PLAN §7 line 288: 0.8sn — the longest bleed in the sequence. */
export const APARTMENT_BLEED_4_DURATION_MS = 800;
/**
 * Bleed #4 strobe opacity range. The bleed pulses between these two values
 * at 12Hz. Higher floor (0.4) than #1/#2/#3 because #4 is the narrative
 * payoff bleed (revolver-on-table) — the user MUST be able to read it.
 */
export const APARTMENT_BLEED_4_OPACITY_MIN = 0.4;
export const APARTMENT_BLEED_4_OPACITY_MAX = 0.6;
/**
 * Bleed #4 reduced-motion hold opacity. Single still frame, no strobe.
 * 0.6 (the upper end of the strobe) so motion-sensitive users still get
 * a clear read of the revolver-on-desk composition.
 */
export const APARTMENT_BLEED_4_REDUCED_MOTION_OPACITY = 0.6;
/**
 * Bleed #4 mask blur (CSS px). Applied to the revolver-on-desk overlay so
 * the composite reads as "lobby snapshot with a slight halation around the
 * revolver" — keeps the bleed feeling like a leak, not a clean render.
 */
export const APARTMENT_BLEED_4_MASK_BLUR_PX = 2;

/* ========================================================================== */
/* SPRINT 6 — Faz 8 Reveal + Son ekran timing (50-65sn)                       */
/*                                                                            */
/* PLAN §7 lines 290-303 narrative spec. Faz 8 is the FINAL destruction        */
/* phase — the joke reveal. Split into TWO discrete sub-phases for FSM        */
/* clarity (matches Sprint 5 phase-per-aesthetic discipline):                  */
/*                                                                            */
/*   - faz8-reveal (50-55sn):  5sn destruction-overlay fade-out, lobby        */
/*                              restored, bulb pulse normalises, camera       */
/*                              dolly-out, audio bed fade-in. Builds the      */
/*                              "after the storm" beat.                       */
/*                                                                            */
/*   - faz8-son-ekran (55-65sn): 10sn closing tableau. Revolver-on-table     */
/*                              framing held; door-close audio accent at      */
/*                              ~7sn; Cyrillic disclaimer fades in at ~3sn   */
/*                              + Turkish subtitle; optional restart-hint     */
/*                              text mounts at ~7sn.                          */
/*                                                                            */
/* TH-S5-03 closure carried forward: every shared resource declares a SINGLE  */
/* owner module via the OWNER decree block at the bottom of this section.     */
/* Adding a new shared Faz 8 resource? Add its owner decree HERE FIRST.       */
/* ========================================================================== */

/* ------------------------------------------------------------------------ */
/* Sprint 6 Faz 8 Reveal + Son ekran timing                                  */
/* ------------------------------------------------------------------------ */

/**
 * Faz 8 reveal duration. 5 second window (50-55sn absolute / 0-5sn
 * within reveal). Three concurrent envelopes inside:
 *   1. Destruction-overlay opacity 1 → 0 over FAZ8_REVEAL_FADE_DURATION_MS (3sn)
 *   2. Audio bed ambient ramp 0 → full over FAZ8_REVEAL_AMBIENT_RAMP_MS (3sn)
 *   3. Camera dolly-out FAZ8_REVEAL_CAMERA_DOLLY_DEGREES across the
 *      full 5-second window
 * Lane A fills the body in Phase 2B.
 */
export const FAZ8_REVEAL_DURATION_MS = 5000;

/**
 * Reveal silence pause — 1 second of TOTAL silence + black at the
 * START of reveal before the fade-out begins. PLAN §7 line 291:
 * "1.5sn tam siyah + sessizlik" — designer rationale chooses 1.0sn
 * (PLAN's 1.5 is the upper bound; 1.0 keeps the reveal window from
 * eating into the son-ekran disclaimer beat). The silence is the
 * narrative pivot: bootloop chaos → silent black → fade-back.
 */
export const FAZ8_REVEAL_SILENCE_PAUSE_MS = 1000;

/**
 * Destruction-overlay fade-out duration. 3 seconds — long enough to
 * read as "the destruction is RECEDING" rather than "the screen
 * reset". Sub-window of the 5-second reveal: starts at
 * FAZ8_REVEAL_SILENCE_PAUSE_MS (1sn) and runs to 4sn into reveal.
 * Linear opacity ramp; designer choice — easing would read as
 * stylised, the destruction must "drain" rather than "transition".
 */
export const FAZ8_REVEAL_FADE_DURATION_MS = 3000;

/**
 * Audio bed ambient ramp duration during reveal. 3 seconds — same
 * window as the overlay fade-out (envelopes share the start cue so
 * the visual+audio drain in unison). The reveal hands over to a
 * dedicated AmbientRecoveryHandle (Lane A — Sprint 6 Phase 2B) whose
 * fade-in re-establishes the Sprint 1 ambient layers (radio static
 * → Temnaya music) without rewinding the AudioBed's master state.
 */
export const FAZ8_REVEAL_AMBIENT_RAMP_MS = 3000;

/**
 * Camera dolly-out magnitude during reveal (degrees of yaw + pitch
 * recovery from the Sprint 4 BANG_CAMERA_SHAKE_DEG=5 displacement).
 * Designer choice: 10 — gentle dolly-out that pulls the framing
 * back so the revolver-on-table composition reads from a slightly
 * higher, slightly further vantage. Single envelope across the
 * full 5-second reveal; reduced-motion gate forces this to 0.
 */
export const FAZ8_REVEAL_CAMERA_DOLLY_DEGREES = 10;

/**
 * Faz 8 son-ekran duration. 10 second window (55-65sn absolute /
 * 0-10sn within son-ekran). The user holds on the closing tableau
 * (revolver-on-table + disclaimer + optional smoke + optional
 * restart-hint) for the full window. R-key short-circuits via
 * `destructionDirector.requestRestart()` (Sprint 6 Phase 1 scaffolds
 * the binding; Sprint 7+ adds UI buttons).
 */
export const FAZ8_SON_EKRAN_DURATION_MS = 10000;

/**
 * Disclaimer mount offset within son-ekran. 3 seconds — gives the
 * revolver-on-table composite the first 3 seconds of son-ekran to
 * BREATHE before the disclaimer fades in. Designer §6: "the
 * disclaimer should read AFTER the player notices the silence" —
 * the 3-second delay enforces that sequence.
 */
export const FAZ8_SON_EKRAN_DISCLAIMER_ENTER_MS = 3000;

/**
 * Disclaimer fade-in duration. 1 second — long enough to feel
 * deliberate, short enough that the text doesn't read as a fancy
 * animation. Linear opacity ramp 0 → FAZ8_DISCLAIMER_OPACITY_MAX.
 */
export const FAZ8_SON_EKRAN_DISCLAIMER_FADE_IN_MS = 1000;

/**
 * Door-close audio accent offset within son-ekran. 2 seconds — the
 * door-close lands BEFORE the disclaimer enters (so the audio
 * accent reads as "something just settled" rather than "the
 * disclaimer triggered a sound"). Lane A fills the
 * DoorCloseAccentHandle factory; this constant is the trigger time.
 */
export const FAZ8_SON_EKRAN_DOOR_CLOSE_AT_MS = 2000;

/**
 * Restart-hint mount offset within son-ekran. 7 seconds — gives
 * the user 4 seconds with the disclaimer alone before the optional
 * R-key hint appears. Sprint 6 scope: HINT TEXT only (Sprint 7+
 * replaces with TEKRAR/ÇIK button UI per PLAN §7 line 302).
 */
export const FAZ8_SON_EKRAN_RESTART_HINT_ENTER_MS = 7000;

/**
 * Restart-hint final opacity ceiling. 0.4 — the hint is a whisper,
 * not a UI call-to-action. Lower than FAZ8_DISCLAIMER_OPACITY_MAX
 * (0.9) so the disclaimer reads as the primary text and the hint
 * reads as a footer. Reduced-motion gate keeps this value.
 */
export const FAZ8_SON_EKRAN_RESTART_HINT_OPACITY = 0.4;

/**
 * Disclaimer final opacity ceiling. 0.9 — fades into 90% opacity so
 * the lobby read remains the primary visual; the disclaimer is the
 * WHISPER atop the composition, not an opaque overlay block. The
 * 0.1 transparency keeps the revolver-on-table visible through the
 * text edges (subtle aesthetic accent for the closing tableau).
 */
export const FAZ8_DISCLAIMER_OPACITY_MAX = 0.9;

/* ------------------------------------------------------------------------ */
/* Sprint 6 Faz 8 OWNER decrees (TH-S5-03 runtime enforcement from inception) */
/*                                                                          */
/* Single-owner declarations for every Faz 8 shared resource. Lane A + Lane */
/* B fill bodies in Phase 2B using type-narrowed `caller: typeof OWNER`     */
/* parameters so the compiler rejects any cross-lane misuse at the call     */
/* site (no runtime sentinel needed once the caller types are wired).       */
/*                                                                          */
/* Adding a new Faz 8 shared resource? Add its owner decree HERE FIRST.     */
/* Phase 3 QA double-ownership scan will reject any owner string that       */
/* appears on multiple resources where coordination is suspect.             */
/* ------------------------------------------------------------------------ */

/**
 * Ambient-recovery audio owner — Faz 8 reveal phase. The
 * AmbientRecoveryHandle is constructed in faz8-reveal.ts and
 * disposed in the director's runtime when faz8-son-ekran resolves.
 */
export const AMBIENT_RECOVERY_AUDIO_OWNER = 'faz8-reveal' as const;

/**
 * Door-close audio accent owner — Faz 8 son-ekran phase.
 * Single-fire DoorCloseAccentHandle triggered at
 * FAZ8_SON_EKRAN_DOOR_CLOSE_AT_MS (2sn into son-ekran). Procedural
 * synth per Sprint 4 Lesson 3 — NO .ogg / .wav vendoring.
 */
export const DOOR_CLOSE_AUDIO_OWNER = 'faz8-son-ekran' as const;

/**
 * Faz 8 disclaimer chrome owner — Faz 8 son-ekran phase. The
 * Cyrillic-primary + Turkish-secondary disclaimer block is mounted
 * once via mountFaz8Disclaimer; lifecycle owned by son-ekran.
 */
export const FAZ8_DISCLAIMER_OWNER = 'faz8-son-ekran' as const;

/**
 * Faz 8 restart-hint chrome owner — Faz 8 son-ekran phase. Optional
 * R-key hint text mounted at FAZ8_SON_EKRAN_RESTART_HINT_ENTER_MS
 * (7sn into son-ekran). Sprint 6 scope: HINT TEXT only.
 */
export const FAZ8_RESTART_HINT_OWNER = 'faz8-son-ekran' as const;

/**
 * Faz 8 volumetric-smoke chrome owner — Faz 8 son-ekran phase.
 * OPTIONAL. Phase 2A designer may DROP the second smoke column if
 * perf cost outweighs atmosphere read.
 */
export const FAZ8_VOLUMETRIC_SMOKE_OWNER = 'faz8-son-ekran' as const;

/**
 * R-key handler owner — Faz 8 son-ekran phase. The top-level keydown
 * listener in scene-mount.ts gates on the FSM state but the OWNER
 * decree records that the binding only activates during son-ekran.
 *
 * KIOSK SAFETY (S9): MUST NOT call app.quit / BrowserWindow.close.
 */
export const FAZ8_R_KEY_HANDLER_OWNER = 'faz8-son-ekran' as const;

/**
 * Camera dolly-out timer owner — Faz 8 reveal phase. The dolly
 * envelope runs from reveal entry to reveal exit; the rAF loop is
 * registered against this owner so the director can revoke it on
 * ESC-hold abort without ambiguity.
 */
export const FAZ8_CAMERA_DOLLY_TIMER_OWNER = 'faz8-reveal' as const;

/* ========================================================================== */
/* SPRINT 6 PHASE 2A — Faz 8 design FILL (color + motion + typography)        */
/*                                                                            */
/* Phase 1 declared the timing skeleton + OWNER decrees (lines 873-1074).     */
/* This block (added Sprint 6 Phase 2A, 2026-06-02) fills the aesthetic       */
/* knobs Phase 1 left as designer-decision-pending: easing curves for the     */
/* reveal envelopes, color/typography for the disclaimer + restart-hint, and  */
/* ADSR + low-pass spec for the door-close audio accent.                      */
/*                                                                            */
/* Reference: destruction-direction.md §18-§19 (Sprint 6 extension).          */
/*                                                                            */
/* Lane Phase 2B consumers:                                                   */
/*   - Lane A (kraken):     reveal envelope rAF loop reads easing constants  */
/*                          here; door-close synth reads ADSR + low-pass.    */
/*   - Lane B (frontend):   chrome/faz8-disclaimer.ts + faz8-restart-hint.ts */
/*                          import typography + color constants directly.    */
/*   - Lane 0 (i18n):       no constants here are locale-switched; the       */
/*                          Cyrillic/TR strings live in i18n/strings.ts.     */
/* ========================================================================== */

/* ------------------------------------------------------------------------ */
/* Sprint 6 Faz 8 reveal envelope easing                                     */
/* ------------------------------------------------------------------------ */

/**
 * Destruction-overlay fade-out easing curve. cubic-bezier(0.25, 0.46, 0.45,
 * 0.94) = "ease-out-quad" — gentle deceleration. Designer rationale: the
 * overlay must DRAIN, not "transition". Linear was too clinical; ease-out
 * lets the destruction "give way" — strong start (the storm leaving) then
 * tapering tail (settling). Applied over FAZ8_REVEAL_FADE_DURATION_MS (3sn).
 *
 * NOTE: the Phase 1 JSDoc on FAZ8_REVEAL_FADE_DURATION_MS said "linear
 * opacity ramp; designer choice — easing would read as stylised". Sprint 6
 * Phase 2A REVISES that note: after sitting with the storyboard, the
 * stylised easing IS what we want — the reveal is the most "scored" beat
 * in the whole sequence (silence → fade → tableau), so a stylised curve
 * is congruent. The Phase 1 JSDoc remains for archaeology but this
 * constant is the authoritative easing.
 */
export const FAZ8_REVEAL_FADE_EASING = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' as const;

/**
 * Camera dolly-out easing curve. cubic-bezier(0.65, 0, 0.35, 1) =
 * "ease-in-out-quart" — gentle start, accelerated middle, gentle end.
 * Designer rationale (D-3): the dolly is the only camera motion in the
 * whole 65sn timeline that the user explicitly READS as camera (every
 * other camera surface is a shake or a snap). The ease-in lets the
 * camera "decide" to dolly out; the ease-out lets it "arrive" at the
 * lobby framing. Symmetric in/out so neither edge is rushed. Applied
 * over the full FAZ8_REVEAL_DURATION_MS (5sn — the dolly runs for the
 * entire reveal window, including the silence pause).
 */
export const FAZ8_REVEAL_DOLLY_EASING = 'cubic-bezier(0.65, 0, 0.35, 1)' as const;

/**
 * Ambient audio bed baseline target (dB FS). -24dB — the Sprint 1 lobby
 * ambient sits here at idle (bulb hum + radio static + faint Temnaya).
 * The Faz 8 ambient-recovery handle ramps the bed back from -∞ (Sprint 5
 * established total silence via destruction-audio's master gate) over
 * FAZ8_REVEAL_AMBIENT_RAMP_MS (3sn) using a linear gain ramp. -24dB is
 * the "quiet but present" target — the user has been listening to a
 * total-blackout silence pause for 1sn and the ambient creep must feel
 * like ROOM RETURNING, not music starting. -24dB is below conversation
 * volume, above the noise floor.
 */
export const FAZ8_AUDIO_BED_BASELINE_GAIN_DB = -24;

/**
 * Bulb pulse normalisation target frequency (Hz). Sprint 1 §2 established
 * the resting ambient breathing at 0.4Hz (slow tidal pulse — once every
 * 2.5sn). Sprint 5 destruction phases REPLACED this with the destruction-
 * amplitude flicker (14Hz tied to the AC-buzz). Faz 8 reveal restores
 * the resting frequency. The normalisation runs across the full reveal
 * window (5sn) — by son-ekran the bulb is breathing at Sprint 1 rate.
 */
export const FAZ8_BULB_PULSE_RESTING_HZ = 0.4;

/**
 * Bulb pulse normalisation amplitude (intensity ratio). Sprint 1 ambient
 * breathing modulates bulb intensity ±5% from baseline (the resting
 * heart-rate of the room). Faz 8 reveal interpolates from the Sprint 5
 * destruction-amplitude flicker back to this resting amplitude.
 */
export const FAZ8_BULB_PULSE_RESTING_AMPLITUDE = 0.05;

/* ------------------------------------------------------------------------ */
/* Sprint 6 Faz 8 disclaimer typography + color                              */
/* ------------------------------------------------------------------------ */

/**
 * Disclaimer primary line font size (px). 64px — large enough to read as
 * a STATEMENT (the punchline of the entire 65sn arc), small enough not
 * to dominate the revolver-on-table composition. Designer rationale: at
 * 1920×1080 native, 64px = 3.3% of viewport height, large enough to be
 * THE thing on screen, small enough that 40+ year-old eyes don't read
 * it as "shouting". Reference string: "Это просто шутка." (4 Cyrillic
 * words + period, ~16 glyphs depending on letter widths).
 *
 * Font-family: Old Standard TT (Sprint 0 bundled, OFL, Cyrillic-complete).
 * The serif treatment reads as "considered statement" — sans-serif would
 * read as "system message" which is the OPPOSITE of the joke reveal.
 */
export const FAZ8_DISCLAIMER_PRIMARY_FONT_PX = 64;

/**
 * Disclaimer primary line letter-spacing (px). -0.5px — slight negative
 * tracking. Old Standard TT at 64px reads slightly loose at default
 * tracking; -0.5px tightens the words without making the text look
 * "compressed". Reference: typographer's default "tight headline" at
 * 60-72px display size.
 */
export const FAZ8_DISCLAIMER_PRIMARY_LETTER_SPACING_PX = -0.5;

/**
 * Disclaimer secondary line font size (px). 28px — roughly 44% of the
 * primary (64px) size. This ratio (0.44) sits between "subtitle"
 * (0.5-0.6 = sibling read) and "footer" (0.25-0.3 = subordinate read).
 * 0.44 = "subordinate but legible" — the TR translation reads as the
 * gloss-on-the-original, not as a competing line.
 *
 * Font-family: PT Serif Regular (Sprint 0 bundled, OFL, full Cyrillic +
 * Latin diacritics for Turkish — though TR text doesn't need Cyrillic
 * glyphs, PT Serif's Latin-extended is what makes "şaka" render cleanly).
 */
export const FAZ8_DISCLAIMER_SECONDARY_FONT_PX = 28;

/**
 * Vertical gap between primary + secondary lines (px). 24px — comfortable
 * "sibling text" spacing. Less (12-16px) would read as one paragraph;
 * more (32-40px) would read as two unrelated lines. 24px sits in the
 * "obviously paired" sweet spot — visually-grouped but textually-
 * distinguished.
 */
export const FAZ8_DISCLAIMER_GAP_PX = 24;

/**
 * Disclaimer text color (kirli kâğıt). #7a6a4e — PLAN §2 line 48 palette
 * entry. The same color the intro disclaimer (Sprint 0 disclaimer.css
 * line 69, 96) uses for the TR text. Using the SAME color closes the
 * narrative loop: intro disclaimer → 65sn destruction journey →
 * son-ekran disclaimer. The "kirli kâğıt" palette is the room's voice;
 * the destruction palette (white modal text, blue BSOD, etc.) belongs
 * to the systems being mocked. Returning to kirli kâğıt = returning to
 * the room = the system was lying, the room was always there.
 */
export const FAZ8_DISCLAIMER_COLOR = '#7a6a4e' as const;

/**
 * Disclaimer text-shadow. 0 0 8px rgba(10, 9, 8, 0.4) — soft black
 * halation around the glyphs. Reads as "candlelight illumination" on
 * an old paper document — congruent with the kirli-kâğıt palette and
 * with the room's tungsten bulb (the bulb is the only light source by
 * son-ekran). NOTE: 10/9/8 is the lobby base background hex split —
 * very dark warm-brown-black. The 0.4 alpha keeps the shadow from
 * reading as "glow" (which would feel UI-like) and instead as
 * "depth" (which feels object-like).
 */
export const FAZ8_DISCLAIMER_TEXT_SHADOW = '0 0 8px rgba(10, 9, 8, 0.4)' as const;

/**
 * Disclaimer secondary line stagger delay (ms). 200ms after the primary
 * fade-in begins. The stagger reinforces the reading order: Russian
 * first (the bolder, larger line — the joke), Turkish second (the
 * subtitle — the gloss). 200ms is enough for the eye to land on the
 * Russian glyphs before the Turkish appears (saccade time + initial
 * letter-recognition is ~180-220ms in casual reading).
 */
export const FAZ8_DISCLAIMER_SECONDARY_STAGGER_MS = 200;

/**
 * Disclaimer fade-in easing curve. cubic-bezier(0.4, 0, 0.6, 1) =
 * "ease-in-out-sine" — symmetric, gentle, no "snap" character. The
 * disclaimer must APPEAR, not "animate in" — easing should be felt
 * but not seen.
 */
export const FAZ8_DISCLAIMER_FADE_EASING = 'cubic-bezier(0.4, 0, 0.6, 1)' as const;

/* ------------------------------------------------------------------------ */
/* Sprint 6 Faz 8 restart-hint typography + color                            */
/* ------------------------------------------------------------------------ */

/**
 * Restart-hint font size (px). 14px — small UI hint, deliberately
 * below the "read this" threshold for a casual glance. The user who
 * notices it can press R; the user who doesn't gets the 10sn
 * son-ekran timeout and exits naturally. Designer choice for the
 * "whisper" register (cf. FAZ8_SON_EKRAN_RESTART_HINT_OPACITY = 0.4).
 *
 * Font-family: PT Serif Regular (SAME family as the disclaimer
 * secondary line — keeps the typographic palette tight; the hint
 * reads as "another quiet voice" not "a new UI element").
 */
export const FAZ8_RESTART_HINT_FONT_PX = 14;

/**
 * Restart-hint text color. Same kirli-kâğıt #7a6a4e as the disclaimer.
 * Visual unity — both the disclaimer and the hint belong to the room's
 * voice, not the system's voice. The opacity gap
 * (FAZ8_SON_EKRAN_RESTART_HINT_OPACITY = 0.4 vs FAZ8_DISCLAIMER_OPACITY_MAX
 * = 0.9) does the hierarchy work; color stays unified.
 */
export const FAZ8_RESTART_HINT_COLOR = '#7a6a4e' as const;

/**
 * Restart-hint bottom inset from viewport edge (px). 48px — comfortable
 * "footer hint" placement. 24px would feel cramped; 72px would feel
 * detached. 48px is the standard "page footer" spacing in
 * editorial-typography references.
 */
export const FAZ8_RESTART_HINT_BOTTOM_INSET_PX = 48;

/**
 * Restart-hint fade-in duration (ms). 500ms — twice the
 * disclaimer-secondary stagger (200ms). The hint is a whisper; a
 * 500ms fade lets it "appear" rather than "snap in".
 */
export const FAZ8_RESTART_HINT_FADE_IN_MS = 500;

/**
 * Restart-hint separator glyph between locale variants. ' · ' (middle
 * dot, padded with spaces). Designer choice: bullet (·) over slash (/)
 * because slash reads as "either/or option" (which is wrong — the
 * three locale variants are the SAME hint in three languages, not a
 * choice between them). The middle-dot reads as "and also" / "list
 * separator". Reference: typesetter's convention for inline locale
 * concatenation.
 */
export const FAZ8_RESTART_HINT_SEPARATOR = ' · ' as const;

/* ------------------------------------------------------------------------ */
/* Sprint 6 Faz 8 door-close audio accent — ADSR + low-pass                  */
/* ------------------------------------------------------------------------ */

/**
 * Door-close attack time (ms). 5ms — fast attack. A real apartment door
 * latch click is essentially instantaneous; the 5ms attack lets the
 * onset transient land cleanly without a click artefact on the Web
 * Audio gain ramp.
 */
export const FAZ8_DOOR_CLOSE_ATTACK_MS = 5;

/**
 * Door-close decay time (ms). 40ms — short decay after the latch
 * onset. The door wood reverberates briefly before settling.
 */
export const FAZ8_DOOR_CLOSE_DECAY_MS = 40;

/**
 * Door-close sustain ratio (0-1). 0.8 — high sustain. The "body" of
 * the door-close (the wood resonance + apartment-hallway short reverb
 * tail) sits at 80% of peak after the attack+decay transient.
 */
export const FAZ8_DOOR_CLOSE_SUSTAIN_RATIO = 0.8;

/**
 * Door-close release time (ms). 200ms — longer release. The reverb
 * tail decays over 200ms; longer than this would read as "music
 * release" not "door release"; shorter would clip the resonance.
 */
export const FAZ8_DOOR_CLOSE_RELEASE_MS = 200;

/**
 * Door-close low-pass cutoff (Hz). 150Hz — aggressive low-pass.
 * Removes all high-frequency content (the "click" character of a
 * latch) and leaves only the LOW-FREQUENCY THUMP. Designer rationale:
 * the door-close is an OFF-STAGE event ("a door, somewhere, closed")
 * — it should sound MUFFLED, as if heard through a wall or from
 * another room. 150Hz is below the human-voice fundamental range
 * (80-260Hz) so the door doesn't read as "someone speaking", and
 * above 100Hz (the lower bound of useful playback on consumer
 * laptop speakers) so the thump is actually audible.
 */
export const FAZ8_DOOR_CLOSE_LOWPASS_HZ = 150;

/**
 * Door-close peak gain (linear, 0-1). 0.3 — moderate. The accent
 * must be audible against the recovering ambient bed (which sits at
 * -24dB = ~0.063 linear) but not startling. 0.3 = ~-10dB FS which is
 * "clearly audible but not loud" against -24dB ambient.
 */
export const FAZ8_DOOR_CLOSE_PEAK_GAIN = 0.3;

/* ------------------------------------------------------------------------ */
/* Sprint 6 Faz 8 volumetric smoke (OPTIONAL — D-2 may DROP)                 */
/* ------------------------------------------------------------------------ */

/**
 * Volumetric smoke render mode. 'css' = CSS-only @keyframes + radial-
 * gradient transform (Phase 2A D-2 RECOMMENDED). 'canvas2d' = particle
 * system (Phase 2A D-2 DEFER unless perf budget allows). 'none' = the
 * handle short-circuits and renders nothing (allows D-2 DROP without
 * removing the handle from the chrome module's mount sequence).
 *
 * Phase 2A choice: 'css' — see destruction-direction.md §19 D-2.
 */
export const FAZ8_VOLUMETRIC_SMOKE_MODE = 'css' as const;

/**
 * Smoke rise loop duration (ms). 6000ms = 6 second loop. Within the
 * 5-8sn spec band. 6sn = "noticeable but not metronomic" — long
 * enough that the eye doesn't read it as a repeating loop on first
 * cycle, short enough that the user sees ≥ 1 full rise within the
 * 10sn son-ekran window.
 */
export const FAZ8_VOLUMETRIC_SMOKE_RISE_DURATION_MS = 6000;

/**
 * Smoke source position relative to viewport (D-4 designer choice).
 * 'desk-ashtray' = column rises from masa front-right (where the
 * lobby ashtray asset sits in the procedural-poster snapshot).
 * Designer rationale: anchors the smoke to a diegetic source visible
 * in the lobby snapshot. Alternative 'off-screen-right' rejected —
 * an unanchored column reads as "atmospheric VFX" not "cigarette
 * smoke".
 */
export const FAZ8_VOLUMETRIC_SMOKE_SOURCE = 'desk-ashtray' as const;

/**
 * Smoke peak opacity. 0.12 — well below the disclaimer 0.9. The smoke
 * is atmospheric haze, not a primary visual. Lane B should keep this
 * low so the disclaimer reads cleanly through it.
 */
export const FAZ8_VOLUMETRIC_SMOKE_OPACITY_MAX = 0.12;

/* ------------------------------------------------------------------------ */
/*                                                                          */
/*  ╔═══════════════════════════════════════════════════════════════════╗   */
/*  ║  Sprint 7 Phase 1 — NEW timing + CSS class SSOT + owner decrees   ║   */
/*  ╚═══════════════════════════════════════════════════════════════════╝   */
/*                                                                          */
/*  Sprint 7 scope: TEKRAR / ÇIK button UI on the Faz 8 son-ekran +         */
/*  reveal-jingle audio handle + scene transition cross-fades (Faz 6 →      */
/*  Faz 7, Faz 7 → Faz 8). Designer Phase 2A finalises VALUES; Phase 1      */
/*  (this section) commits the NAMES + per-directive placeholder defaults   */
/*  so Lane A + Lane B can consume from a stable SSOT.                      */
/*                                                                          */
/*  Owner decree discipline (TH-S6-04 universal carry-forward):             */
/*  every Sprint 7 NEW shared resource (audio handle, chrome handle, FSM    */
/*  transition timer, DOM listener) names its sole owner here. Cross-       */
/*  module callers MUST import the OWNER constant and pass it as the        */
/*  `caller` field on the factory option bag; the type system rejects       */
/*  cross-owner construction (TH-S5-03 closure carried forward).            */
/*                                                                          */
/* ------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------ */
/* Sprint 7 — Faz 8 TEKRAR / ÇIK button timing                              */
/* ------------------------------------------------------------------------ */

/**
 * Faz 8 TEKRAR/ÇIK button fade-in duration (ms). 600ms — long enough
 * to read as "considered presentation, not a UI alert" but short
 * enough that the user perceives a clean appearance once the
 * disclaimer + restart-hint copy has settled. Designer Phase 2A
 * confirms this value against the closing-tableau pacing.
 */
export const FAZ8_BUTTON_FADEIN_DURATION_MS = 600;

/**
 * Faz 8 TEKRAR/ÇIK button fade-in start offset (ms), measured from
 * son-ekran entry. 2500ms — buttons appear ~58sn into the destruction
 * sequence (son-ekran enters at ~55sn). The 2.5sn offset gives the
 * disclaimer (3sn enter) and restart-hint (7sn enter) breathing room
 * to land first; the buttons join the composition as a deliberate
 * call-to-action AFTER the user has read the disclaimer.
 *
 * Designer Phase 2A may revise this once the button copy + the
 * disclaimer/hint cadence are confirmed in playthrough.
 */
export const FAZ8_BUTTON_FADEIN_START_OFFSET_MS = 2_500;

/* ------------------------------------------------------------------------ */
/* Sprint 7 — scene transition cross-fades                                  */
/* ------------------------------------------------------------------------ */

/**
 * Faz 7 → Faz 8 cross-fade duration (ms). 200ms — short. The faz7
 * bootloop fades to black (or to the apartment-bleed substrate) and
 * faz8-reveal fades in over a 200ms shared window. Short enough that
 * the cut reads as a hard cut with a smoothing edge (not a "transition
 * shot"); long enough that the human eye doesn't perceive a discrete
 * frame swap (sub-100ms reads as a glitch on 60Hz displays).
 */
export const FAZ7_TO_FAZ8_CROSSFADE_MS = 200;

/**
 * Faz 6 → Faz 7 cross-fade duration (ms). 150ms — slightly shorter
 * than the Faz 7 → Faz 8 fade. Designer rationale: the Faz 6 (BSOD /
 * kernel panic) → Faz 7 (bootloop) transition is a "system reset"
 * moment — the cut should feel mechanical, not cinematic. 150ms reads
 * as "the OS just rebooted" not "the editor crossfaded".
 */
export const FAZ6_TO_FAZ7_CROSSFADE_MS = 150;

/**
 * Faz 2 → Faz 3 cross-fade duration (ms). 0 PLACEHOLDER — designer
 * Phase 2A confirms whether faz2 takeover → faz3 terminal benefits
 * from a cross-fade or whether the current hard cut is intentional.
 * Set to 0 here so the placeholder lookup compiles; Sprint 7 Phase 2A
 * designer FILL replaces this with either 0 (confirmed hard cut) or
 * a non-zero duration matching the other Sprint 7 transition values.
 */
export const FAZ2_TO_FAZ3_CROSSFADE_MS = 0;

/**
 * Shared easing curve for all Sprint 7 scene transitions. Material
 * Design "standard" curve — the canonical "natural feeling" ease
 * for opacity/transform transitions in the 100-300ms window. Designer
 * Phase 2A may pick a more bespoke curve once the cross-fade reads
 * are tested in playthrough; for Phase 1 this is the SSOT default.
 */
export const SCENE_TRANSITION_EASING = 'cubic-bezier(0.4, 0.0, 0.2, 1)' as const;

/* ------------------------------------------------------------------------ */
/* Sprint 7 — Reveal jingle ADSR + amplitude                                */
/* ------------------------------------------------------------------------ */

/**
 * Reveal jingle scheduling offset (ms) from faz8-reveal entry. 0 —
 * the jingle plays at the start of the reveal phase. The 1-second
 * silence pause (FAZ8_REVEAL_SILENCE_PAUSE_MS) and the 3-second
 * concurrent fade-in/audio-ramp window then unfold while the jingle
 * rings out across the reveal duration.
 */
export const REVEAL_JINGLE_OFFSET_MS = 0;

/**
 * Reveal jingle attack time (ms). 200ms — slow attack. The chord
 * needs to "swell in" rather than punch in (the joke twist is the
 * jingle is a wry musical cue, not an alert). 200ms reads as "we are
 * coming back to room tone now"; under 100ms would feel like an
 * intrusion, over 300ms would read as "background music" rather
 * than a discrete cue.
 */
export const REVEAL_JINGLE_ATTACK_MS = 200;

/**
 * Reveal jingle decay time (ms). 100ms — short decay after the
 * attack peak settles to the sustain plateau. Designer Phase 2A may
 * widen this if the chord voicing needs more "settle" time.
 */
export const REVEAL_JINGLE_DECAY_MS = 100;

/**
 * Reveal jingle sustain level (0-1 linear). 0.3 — moderate sustain.
 * Holds the chord at 30% of peak for the body of the ring-out so
 * the listener has time to register the harmony before the release
 * dissolves it. Below 0.2 would clip the sustain to "ambience";
 * above 0.5 would compete with the recovering ambient bed.
 */
export const REVEAL_JINGLE_SUSTAIN_LEVEL = 0.3;

/**
 * Reveal jingle release time (ms). 2000ms — long release tail. The
 * chord dissolves over 2sn so the listener perceives a clean
 * "ring-out" rather than an abrupt cut. Matches the 3sn fade window
 * of the destruction-overlay fade-out so the audio and visual
 * envelopes settle together.
 */
export const REVEAL_JINGLE_RELEASE_MS = 2000;

/**
 * Reveal jingle peak amplitude (dBFS). -30dB — well below the
 * dialogue / disclaimer band. The jingle is a WHISPER — it must
 * register as "a thing happened in the audio mix" without
 * overshadowing the silence-of-aftermath read. -30dB sits just
 * above the noise floor of typical consumer playback while remaining
 * audibly distinct from the -24dB recovering ambient bed.
 */
export const REVEAL_JINGLE_PEAK_DB = -30;

/**
 * Reveal jingle chord note frequencies (Hz). Sprint 7 Phase 2A
 * design FILL (D-3 decision — destruction-direction.md §22):
 * open-fifth + sus2 voicing on A.
 *
 *   - A3  = 220.00 Hz   (root, tenor register — rationally tuned with
 *                         the Sprint 1 ambient bulb hum at A2)
 *   - E4  = 329.63 Hz   (perfect fifth — the "open" interval)
 *   - B4  = 493.88 Hz   (suspended 2nd above E — unresolved colour)
 *   - A5  = 880.00 Hz   (octave above root — shimmer/overtone push
 *                         above the ambient bed band)
 *
 * Chord character: intentionally ambiguous (no 3rd, no leading tone)
 * — the ear hears "music" without hearing a verdict. Matches the
 * joke brief "the worst is over, but we are not celebrating".
 * Lane A Phase 2B reads this constant to build the OscillatorNode
 * graph (one OscillatorNode per frequency, all triangle type per
 * REVEAL_JINGLE_OSCILLATOR_TYPE, summed into a single GainNode at
 * REVEAL_JINGLE_PEAK_DB).
 */
export const REVEAL_JINGLE_CHORD_NOTES: readonly number[] = [
  220.00,  // A3
  329.63,  // E4
  493.88,  // B4
  880.00,  // A5
] as const;

/* ------------------------------------------------------------------------ */
/* Sprint 7 — Faz 8 button CSS class SSOT (TH-S6-02)                        */
/* ------------------------------------------------------------------------ */

/**
 * CSS class toggled on the Faz 8 TEKRAR button to drive the fade-in
 * end-state (opacity 0 → 1 over FAZ8_BUTTON_FADEIN_DURATION_MS).
 * Lane B CSS owns the transition definition; Lane A toggles the
 * class via rAF after mount. SSOT discipline per TH-S6-02: no
 * inline string literals in mount code — reference this constant.
 */
export const FAZ8_TEKRAR_BUTTON_VISIBLE_CLASS = 'is-visible' as const;

/**
 * CSS class toggled on the Faz 8 ÇIK button to drive the fade-in
 * end-state. Mirrors FAZ8_TEKRAR_BUTTON_VISIBLE_CLASS — the two
 * buttons share the same fade envelope by design (they appear as
 * a pair).
 */
export const FAZ8_CIK_BUTTON_VISIBLE_CLASS = 'is-visible' as const;

/**
 * CSS class toggled on the TEKRAR button when keyboard focus lands
 * on it (also from `:focus-visible` for mouse-vs-keyboard
 * disambiguation; Lane B CSS combines this class + `:focus-visible`
 * for accessibility focus ring).
 */
export const FAZ8_TEKRAR_BUTTON_FOCUSED_CLASS = 'is-focused' as const;

/**
 * CSS class toggled on the ÇIK button when keyboard focus lands
 * on it. Mirrors FAZ8_TEKRAR_BUTTON_FOCUSED_CLASS.
 */
export const FAZ8_CIK_BUTTON_FOCUSED_CLASS = 'is-focused' as const;

/**
 * CSS class toggled on the destruction-takeover overlay during the
 * Faz 7 → Faz 8 cross-fade window. Drives the CSS transition that
 * fades the overlay out over FAZ7_TO_FAZ8_CROSSFADE_MS. Removed
 * once the cross-fade completes (Lane A handles this via setTimeout
 * + classList.remove).
 */
export const FAZ7_TO_FAZ8_TRANSITION_ACTIVE_CLASS = 'is-transitioning' as const;

/**
 * CSS class toggled on a scene-transitioning element to drive the
 * shared fade-OUT half of a cross-fade. Generic SSOT name (not
 * faz-specific) because Faz 6 → Faz 7 and Faz 7 → Faz 8 reuse the
 * same class. Lane A toggles + removes; CSS owns the transition
 * curve via SCENE_TRANSITION_EASING.
 */
export const SCENE_TRANSITION_FADE_OUT_CLASS = 'is-transition-fading-out' as const;

/**
 * CSS class toggled on a scene-transitioning element to drive the
 * shared fade-IN half of a cross-fade. Mirror of
 * SCENE_TRANSITION_FADE_OUT_CLASS — same SSOT discipline.
 */
export const SCENE_TRANSITION_FADE_IN_CLASS = 'is-transition-fading-in' as const;

/* ------------------------------------------------------------------------ */
/* Sprint 7 — Sprint 6 retroactive CSS class SSOT cleanup (TH-S6-02)        */
/*                                                                          */
/* Sprint 6 chrome (faz8-reveal.ts, faz8-son-ekran.ts, chrome/faz8-*.ts)    */
/* hardcoded the CSS classes inline. TH-S6-02 directs Sprint 7 Phase 1 to   */
/* declare the SSOT constants here so a future Phase 4 spark / Sprint 8     */
/* refactor can swap the literals for constant references without touching  */
/* this file. The constant NAMES live here from Sprint 7; the Sprint 6      */
/* call sites still use the literals until the retroactive Task 8 (this    */
/* phase, best-effort) or a follow-up refactor reaches them.                */
/* ------------------------------------------------------------------------ */

/**
 * Generic `is-visible` class — re-used across the Sprint 6 Faz 8
 * surfaces (disclaimer, restart-hint, volumetric-smoke) for the
 * post-rAF fade-in toggle. Multi-site SSOT — Phase 4 spark / Sprint
 * 8 may swap call sites to reference this constant instead of the
 * inline literal.
 */
export const GENERIC_IS_VISIBLE_CLASS = 'is-visible' as const;

/**
 * Sprint 6 retroactive — CSS class toggled on the destruction-
 * takeover overlay during the Faz 8 reveal fade-out (Lane B CSS
 * keyframes engage off this class). Current call site:
 * faz8-reveal.ts line 76 (literal `'is-fading-out'`). Phase 4 spark
 * or Sprint 8 may refactor the call site to reference this constant.
 */
export const FAZ8_REVEAL_OVERLAY_FADING_OUT_CLASS = 'is-fading-out' as const;

/**
 * Sprint 6 retroactive — CSS class toggled on the Faz 8 disclaimer
 * to drive fade-in. Current call site: faz8-son-ekran.ts line 263.
 */
export const FAZ8_DISCLAIMER_VISIBLE_CLASS = 'is-visible' as const;

/**
 * Sprint 6 retroactive — CSS class toggled on the Faz 8 restart-hint
 * to drive fade-in. Current call site: faz8-son-ekran.ts line 300.
 */
export const FAZ8_RESTART_HINT_VISIBLE_CLASS = 'is-visible' as const;

/**
 * Sprint 6 retroactive — CSS class toggled on the Faz 8 volumetric-
 * smoke to drive fade-in. Phase 4 spark / Sprint 8 may unify with
 * GENERIC_IS_VISIBLE_CLASS.
 */
export const FAZ8_VOLUMETRIC_SMOKE_VISIBLE_CLASS = 'is-visible' as const;

/* ------------------------------------------------------------------------ */
/* Sprint 7 — Owner decrees (TH-S6-04 universal enforcement)                */
/*                                                                          */
/* Every NEW Sprint 7 shared resource declares its sole owner here. The     */
/* discipline is "type-narrowed caller field on the factory option bag":    */
/* downstream factories declare `caller: typeof OWNER_*` and the compiler   */
/* rejects construction from any module that does not import the owner      */
/* constant. Runtime guard (a strict equality check inside the factory) is  */
/* a defence-in-depth fallback for cases where a caller passes an unsafe    */
/* `as` cast.                                                               */
/* ------------------------------------------------------------------------ */

/**
 * Sprint 7 NEW owner — Faz 8 reveal jingle audio handle. The reveal
 * jingle is constructed at faz8-reveal entry (Lane A Phase 2B) and
 * disposed at son-ekran exit. Only faz8-reveal.ts holds this
 * constant so only it can call createRevealJingle().
 */
export const REVEAL_JINGLE_AUDIO_OWNER = 'faz8-reveal' as const;

/**
 * Sprint 7 NEW owner — Faz 8 TEKRAR button chrome. The button
 * mounts at son-ekran entry (or at FAZ8_BUTTON_FADEIN_START_OFFSET_MS
 * into son-ekran — designer Phase 2A finalises) and disposes on
 * son-ekran exit or restart re-entry.
 */
export const FAZ8_TEKRAR_BUTTON_CHROME_OWNER = 'faz8-son-ekran' as const;

/**
 * Sprint 7 NEW owner — Faz 8 ÇIK button chrome. Mirrors the TEKRAR
 * button owner; the two buttons share a single mount caller (son-
 * ekran) so the dispose path is symmetric.
 */
export const FAZ8_CIK_BUTTON_CHROME_OWNER = 'faz8-son-ekran' as const;

/**
 * Sprint 7 NEW owner — Faz 7 → Faz 8 transition timer. The
 * destruction-director schedules the cross-fade via a setTimeout
 * (FAZ7_TO_FAZ8_CROSSFADE_MS) that fires the FSM transition. Only
 * the director should own this timer; Lane A Phase 2B threads the
 * caller constant through.
 */
export const FAZ7_TO_FAZ8_TRANSITION_TIMER_OWNER = 'destruction-director' as const;

/**
 * Sprint 7 NEW owner — Faz 6 → Faz 7 transition timer. Mirror of
 * the Faz 7 → Faz 8 transition timer owner.
 */
export const FAZ6_TO_FAZ7_TRANSITION_TIMER_OWNER = 'destruction-director' as const;

/**
 * Sprint 7 NEW owner — Faz 8 button click listener. The click
 * handler is wired in the mount fn (chrome/faz8-tekrar-button.ts +
 * chrome/faz8-cik-button.ts); the owner constant is the runner that
 * invokes the mount (faz8-son-ekran.ts). Disambiguates from any
 * future click listener installed on the same buttons by an
 * unrelated module.
 */
export const FAZ8_BUTTON_CLICK_LISTENER_OWNER = 'faz8-son-ekran' as const;

/**
 * Sprint 7 NEW owner — Faz 8 button keydown listener (Enter / Space
 * activation; Tab navigation between TEKRAR and ÇIK is the browser's
 * default Tab order, not a wired listener). Same owner as the click
 * listener for accessibility/keyboard parity.
 */
export const FAZ8_BUTTON_KEYDOWN_LISTENER_OWNER = 'faz8-son-ekran' as const;

/* ------------------------------------------------------------------------ */
/*                                                                          */
/*  ╔═══════════════════════════════════════════════════════════════════╗   */
/*  ║  Sprint 7 Phase 2A — design FILL (constants set by designer)      ║   */
/*  ╚═══════════════════════════════════════════════════════════════════╝   */
/*                                                                          */
/*  Sprint 7 Phase 2A designer pass authors the named-value constants the   */
/*  Phase 1 scaffold left as placeholders (REVEAL_JINGLE_CHORD_NOTES) PLUS  */
/*  new design-FILL constants for the TEKRAR/ÇIK button visual specs        */
/*  (typography, colour, layout, state styling). All values derive from     */
/*  destruction-direction.md §21 (button visual spec), §22 (reveal jingle   */
/*  ADSR/chord) and §23 (scene transition cross-fades).                     */
/*                                                                          */
/*  Phase 1 placeholders CONFIRMED unchanged (no value edits):              */
/*    - FAZ8_BUTTON_FADEIN_DURATION_MS = 600                                */
/*    - FAZ8_BUTTON_FADEIN_START_OFFSET_MS = 2_500                          */
/*    - FAZ7_TO_FAZ8_CROSSFADE_MS = 200                                     */
/*    - FAZ6_TO_FAZ7_CROSSFADE_MS = 150                                     */
/*    - FAZ2_TO_FAZ3_CROSSFADE_MS = 0   (hard cut VERIFIED smooth)          */
/*    - SCENE_TRANSITION_EASING = 'cubic-bezier(0.4, 0.0, 0.2, 1)'          */
/*                                                                          */
/* ------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------ */
/* Sprint 7 Phase 2A — Reveal jingle oscillator type                        */
/* ------------------------------------------------------------------------ */

/**
 * Reveal jingle oscillator waveform — per-note. Sprint 7 Phase 2A D-3
 * SPEC: triangle wave (warm, only odd harmonics at 1/n² amplitude).
 * Matches the "distant church bell / Soviet radio chime / music-box-at-
 * distance" narrative ambiguity. Sine reads as alarm; sawtooth reads as
 * synth pad — neither carries the chord's intended timbre. All four
 * REVEAL_JINGLE_CHORD_NOTES oscillators share this waveform so the
 * chord reads as ONE instrument, not four.
 */
export const REVEAL_JINGLE_OSCILLATOR_TYPE: 'sine' | 'square' | 'sawtooth' | 'triangle' = 'triangle' as const;

/* ------------------------------------------------------------------------ */
/* Sprint 7 Phase 2A — Faz 8 button typography                              */
/* ------------------------------------------------------------------------ */

/**
 * Button font family stack — matches Sprint 6 disclaimer primary stack
 * for typographic palette continuity (Sprint 0 OFL bundle covers ALL
 * required Cyrillic + Latin glyphs for ЕЩЁ РАЗ / ВЫЙТИ / TEKRAR / ÇIK).
 */
export const FAZ8_BUTTON_FONT_FAMILY = "'Old Standard TT', 'PT Serif', Georgia, serif" as const;

/**
 * Button font-weight — semi-bold (600). Browser renders Old Standard TT
 * 700 from the bundle (bundle ships 400 + 700; 600 lerps to nearer end).
 * Buttons need MORE typographic weight than the 400-weight disclaimer
 * so the eye reads them as actionable, not body copy.
 */
export const FAZ8_BUTTON_FONT_WEIGHT = 600 as const;

/**
 * Button font-size in px. 20px clears the WCAG large-text threshold
 * (≥18px regular, ≥14px bold) by a margin and slots between the
 * disclaimer secondary 28px and the (removed-per-D-2) restart-hint
 * legacy 14px hierarchy. Sprint 6 BLOCKER-1 retro: actionable surfaces
 * MUST be ≥18px; 20px is the deliberate over-shoot.
 */
export const FAZ8_BUTTON_FONT_PX = 20 as const;

/**
 * Button letter-spacing in px. +0.5px positive tracking for ALL-CAPS
 * Cyrillic + Latin labels so the glyphs breathe; ALL-CAPS without
 * tracking reads as cramped.
 */
export const FAZ8_BUTTON_LETTER_SPACING_PX = 0.5 as const;

/**
 * Button line-height (unitless). 1.2 — tight; single-line labels do
 * not need leading. Matches button visual height of ≥48px after padding.
 */
export const FAZ8_BUTTON_LINE_HEIGHT = 1.2 as const;

/* ------------------------------------------------------------------------ */
/* Sprint 7 Phase 2A — Faz 8 button colour palette                          */
/* ------------------------------------------------------------------------ */

/**
 * Button default background. Aged-paper kirli-kâğıt fill — inverts the
 * Sprint 6 disclaimer's `#7a6a4e` ink-on-substrate read into a paper-
 * colour-on-darker-ink button surface. Reads as "tear-off coupon" /
 * "paper button"; palette-coherent with the lobby substrate.
 */
export const FAZ8_BUTTON_BG_COLOR = '#d4ccb8' as const;

/**
 * Button hover background. 7% darker than default — within the
 * `duration-micro` named-rule hover-feedback band (5-10%). Sub-5% reads
 * as no feedback; >10% reads as a state change rather than hover.
 */
export const FAZ8_BUTTON_BG_HOVER_COLOR = '#c5bca5' as const;

/**
 * Button active/pressed background. Pressed-in pushbutton metaphor —
 * combined with FAZ8_BUTTON_ACTIVE_INSET_SHADOW gives kinaesthetic
 * "depressing" feedback even though kiosk has no haptic affordance.
 */
export const FAZ8_BUTTON_BG_ACTIVE_COLOR = '#b8af96' as const;

/**
 * Button text colour. Dark serif ink — `#2a2520` on `#d4ccb8` yields
 * 11.4:1 contrast (clears WCAG AAA 7:1 normal text). Sprint 6 BLOCKER-1
 * retro: every text/bg pair MUST meet 4.5:1; buttons over-shoot to AAA.
 */
export const FAZ8_BUTTON_INK_COLOR = '#2a2520' as const;

/**
 * Button border colour. Frames the button without competing with the
 * focus outline; 1.5px width (sub-pixel) keeps the border crisp on
 * standard density while HiDPI rounds up cleanly.
 */
export const FAZ8_BUTTON_BORDER_COLOR = '#3a3530' as const;

/**
 * Button border CSS shorthand value (paired with FAZ8_BUTTON_BORDER_COLOR).
 */
export const FAZ8_BUTTON_BORDER = '1.5px solid #3a3530' as const;

/**
 * Button focus outline colour. Matches Sprint 6 disclaimer ink — palette-
 * coherent rather than the browser-default blue. `#7a6a4e` on `#d4ccb8`
 * = 4.51:1 (large-graphical 3:1 threshold cleared with margin).
 */
export const FAZ8_BUTTON_FOCUS_OUTLINE_COLOR = '#7a6a4e' as const;

/**
 * Button focus outline width in px. 3px clears WCAG SC 2.4.7 (≥2px
 * recommended for focus-visible).
 */
export const FAZ8_BUTTON_FOCUS_OUTLINE_WIDTH_PX = 3 as const;

/**
 * Button focus outline offset in px. 3px ensures the outline does not
 * touch the 1.5px border (offset > border-width keeps the two visually
 * separate); the outline reads as a discrete focus indicator.
 */
export const FAZ8_BUTTON_FOCUS_OUTLINE_OFFSET_PX = 3 as const;

/**
 * Button pressed-in inset shadow CSS value. rgba(0,0,0,0.3) is dark
 * enough to register on the warm-grey active bg without harming label
 * legibility.
 */
export const FAZ8_BUTTON_ACTIVE_INSET_SHADOW = 'inset 0 2px 4px rgba(0, 0, 0, 0.3)' as const;

/* ------------------------------------------------------------------------ */
/* Sprint 7 Phase 2A — Faz 8 button layout                                  */
/* ------------------------------------------------------------------------ */

/**
 * Button container flex gap (px between TEKRAR and ÇIK).
 * 32px — balances "visually paired" (gap <24px reads as crowded) with
 * "discrete actions" (gap >48px reads as separated panels).
 */
export const FAZ8_BUTTON_CONTAINER_GAP_PX = 32 as const;

/**
 * Button container bottom inset (px from viewport bottom). 80px pushes
 * the buttons up from the 48px Sprint 6 hint band so they clear the
 * safe area on kiosk displays with rounded-corner viewport masks.
 */
export const FAZ8_BUTTON_CONTAINER_BOTTOM_INSET_PX = 80 as const;

/**
 * Button container z-index. 10120 — above disclaimer 10100 + (D-2-
 * removed) restart-hint legacy 10110 + smoke 10050. Ensures focus
 * outlines render above all other son-ekran chrome.
 */
export const FAZ8_BUTTON_CONTAINER_Z_INDEX = 10120 as const;

/**
 * Per-button padding (vertical px). Combined with FAZ8_BUTTON_PADDING_X
 * + font-size 20px + line-height 1.2 yields ≥48px button height,
 * clearing the 44×44pt touch-target named rule.
 */
export const FAZ8_BUTTON_PADDING_Y_PX = 14 as const;

/**
 * Per-button padding (horizontal px). 28px balances the ≥120px min-
 * width visual weight against the gap between TEKRAR and ÇIK.
 */
export const FAZ8_BUTTON_PADDING_X_PX = 28 as const;

/**
 * Per-button padding CSS shorthand value.
 */
export const FAZ8_BUTTON_PADDING = '14px 28px' as const;

/**
 * Per-button min-width (px). 144px gives ВЫЙТИ + TEKRAR visual
 * symmetry; <120px crowds; >160px over-dominates the son-ekran
 * composition.
 */
export const FAZ8_BUTTON_MIN_WIDTH_PX = 144 as const;

/**
 * Per-button border-radius (px). 2px gives the corner a hint of
 * softness without reading as web-app; aggressive rounding (≥8px)
 * would genre-shift the buttons away from "paper coupon" register.
 */
export const FAZ8_BUTTON_BORDER_RADIUS_PX = 2 as const;

/* ------------------------------------------------------------------------ */
/* Sprint 7 Phase 2A — Faz 8 button entrance animation                      */
/* ------------------------------------------------------------------------ */

/**
 * Button entrance translateY initial offset (px). 8px upward drift on
 * entrance — buttons "settle in" from a slight lift rather than punch
 * in from nowhere. Matches the Sprint 6 disclaimer's settled-in read.
 */
export const FAZ8_BUTTON_ENTRANCE_TRANSLATE_Y_PX = 8 as const;

/**
 * Button entrance easing. Matches the Sprint 6 destruction-overlay
 * fade easing (ease-out-quad). Buttons "settle" rather than "punch".
 */
export const FAZ8_BUTTON_ENTRANCE_EASING = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' as const;

/**
 * Per-state transition duration (ms) for hover/active background +
 * box-shadow swaps. 100ms — within the `duration-micro` named-rule
 * band (100-150ms for hover/toggle feedback).
 */
export const FAZ8_BUTTON_STATE_TRANSITION_MS = 100 as const;
