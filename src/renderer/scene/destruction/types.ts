import type {
  FAZ8_TEKRAR_BUTTON_CHROME_OWNER,
  FAZ8_CIK_BUTTON_CHROME_OWNER,
  REVEAL_JINGLE_AUDIO_OWNER,
} from '../../../shared/scene-destruction-constants.js';

/**
 * Destruction sequence — canonical type declarations.
 *
 * Sprint 4 Phase 1 canonical site for DestructionState / DestructionPhase /
 * OsVariant / ApartmentBleedKind / NotificationToastSpec / TerminalLine /
 * DestructionDirectorHandle / ApartmentBleedHandle / chrome handle types.
 *
 * Rule (Sprint 4 §147): types live HERE, nowhere else. Other destruction/
 * files import from this module. Type duplication across files (Sprint 2
 * AnimClipName lesson) is a review-blocking offense.
 *
 * Consumers (Phase 2B):
 *   - destruction-director.ts   (DestructionDirectorHandle, DestructionState)
 *   - destruction-state.ts      (DestructionState, DestructionPhase)
 *   - faz0-bang.ts              (no types from here — pure side-effect runner)
 *   - faz1-critical-dialog.ts   (OsVariant)
 *   - faz2-takeover.ts          (OsVariant, NotificationToastSpec)
 *   - faz3-terminal.ts          (OsVariant, TerminalLine)
 *   - apartment-bleed.ts        (ApartmentBleedKind, ApartmentBleedHandle)
 *   - procedural-wallpaper.ts   (OsVariant)
 *   - chrome/mac-dialog.ts      (MacDialogHandle)
 *   - chrome/win-dialog.ts      (WinDialogHandle)
 *   - chrome/mac-menubar.ts     (MacMenubarHandle)
 *   - chrome/win-taskbar.ts     (WinTaskbarHandle)
 *
 * Sprint 5 Phase 1 — Faz 4-7 surface handles (consumers Phase 2B):
 *   - faz4-file-wipe.ts             (OsVariant, Mac/WinProgressDialogHandle)
 *   - faz5-disk-format.ts           (OsVariant; no chrome handle — inline DOM)
 *   - faz6-bsod.ts                  (OsVariant, MacKernelPanic/WinBsodHandle)
 *   - faz7-bootloop.ts              (OsVariant, MacBootloop/WinBiosBootloopHandle)
 *   - chrome/mac-kernel-panic.ts    (MacKernelPanicHandle)
 *   - chrome/mac-progress-dialog.ts (MacProgressDialogHandle)
 *   - chrome/mac-bootloop.ts        (MacBootloopHandle)
 *   - chrome/win-bsod.ts            (WinBsodHandle)
 *   - chrome/win-progress-dialog.ts (WinProgressDialogHandle)
 *   - chrome/win-bios-bootloop.ts   (WinBiosBootloopHandle)
 *
 * Sprint 6 Phase 1 — Faz 8 surface handles (consumers Phase 2B):
 *   - faz8-reveal.ts                 (OsVariant; no chrome handle — fade-out only)
 *   - faz8-son-ekran.ts              (OsVariant, Faz8Disclaimer/RestartHint/VolumetricSmoke)
 *   - chrome/faz8-disclaimer.ts      (Faz8DisclaimerHandle)
 *   - chrome/faz8-restart-hint.ts    (Faz8RestartHintHandle)
 *   - chrome/faz8-volumetric-smoke.ts(Faz8VolumetricSmokeHandle; Phase 2A may drop)
 *
 * External consumer:
 *   - scene/index.ts SceneHandle.destructionDirector field (lazy import).
 *   - scene-mount.ts                 (Sprint 6 R-key binding gates on
 *                                     director.getState().kind === 'faz8-son-ekran').
 */

/* ------------------------------------------------------------------------ */
/* OS variant                                                               */
/* ------------------------------------------------------------------------ */

/**
 * OS variant — destructure FSM branches on this. Distinct from `OsFamily`
 * in ipc-channels.ts (which is the IPC return type 'mac' | 'win'); we keep
 * them in lockstep but the destruction module owns its own variant alias
 * so a future Linux variant (joke app deliberately unsupported per ipc.ts
 * but kept evolvable) would not have to walk across packages.
 */
export type OsVariant = 'mac' | 'win';

/* ------------------------------------------------------------------------ */
/* Destruction FSM                                                          */
/* ------------------------------------------------------------------------ */

/**
 * Phase enumerator — used for telemetry, DOM dataset attributes, and the
 * DestructionState discriminator. Sprint 4 covered faz0..faz3; Sprint 5
 * extends with faz4..faz7 (file wipe + disk format + BSOD + bootloop);
 * Sprint 6 adds faz8-reveal + faz8-son-ekran (reveal phase + closing
 * tableau — split for FSM clarity since reveal/son-ekran have distinct
 * owner constellations and lifecycles).
 */
export type DestructionPhase =
  | 'faz0'
  | 'faz1'
  | 'faz2'
  | 'faz3'
  | 'faz4'
  | 'faz5'
  | 'faz6'
  | 'faz7'
  | 'faz8-reveal'
  | 'faz8-son-ekran';

/**
 * Discriminated union for the destruction-director FSM.
 *
 *   idle               — no bang detected yet; director mounted but inert.
 *   faz0..faz3         — Sprint 4 variants: BANG → Critical Dialog →
 *                        Takeover → Terminal.
 *   faz4..faz7         — Sprint 5 variants: File Wipe → Disk Format → BSOD
 *                        → Bootloop. faz7 carries `cycleIndex` for the
 *                        bootloop iteration counter (each 3s cycle ticks
 *                        the counter; reveal in Sprint 6 reads it to decide
 *                        when to short-circuit to faz8-reveal).
 *   faz8-reveal        — Sprint 6 variant: 50-55sn reveal. Destruction
 *                        overlay fades out, lobby restored, bulb pulse
 *                        normalises, camera dolly-out, audio bed fades in.
 *                        Reference PLAN.md §7 lines 290-303.
 *   faz8-son-ekran     — Sprint 6 variant: 55-65sn closing tableau.
 *                        Revolver-on-table framing held; sigara dumanı
 *                        (optional, designer §6); door-close audio at
 *                        ~7sn into son-ekran; Cyrillic disclaimer "Это
 *                        просто шутка." centred ~3sn into son-ekran +
 *                        TR subtitle "Bu sadece bir şaka."; optional
 *                        restart-hint mounts at ~7sn (Sprint 6 ships
 *                        HINT TEXT only — TEKRAR/ÇIK BUTTON UI is
 *                        deferred to Sprint 7+).
 *   aborted            — terminal state; either user ESC-held or sequence
 *                        completed cleanly. Director can be re-armed only by
 *                        re-mounting (lobby reload) or — for Sprint 6 — by
 *                        R-key (`requestRestart()` on the director handle)
 *                        while in `faz8-son-ekran`.
 *
 * Exhaustive switch on `kind` + `assertNever` (in destruction-state.ts)
 * forces every consumer to handle every variant.
 *
 * Sprint 6 split rationale: reveal (50-55sn) and son-ekran (55-65sn)
 * are TWO discrete phases with DISTINCT owner constellations (reveal
 * owns ambient-recovery audio + camera dolly timer; son-ekran owns
 * door-close audio + disclaimer + restart-hint + R key handler).
 * Combining them into a single `kind: 'faz8'` would re-introduce the
 * shared-owner ambiguity TH-S4-01 closure forbids. Splitting is also
 * consistent with the FSM clarity rule Sprint 5 enforced for faz4-7.
 */
export type DestructionState =
  | { kind: 'idle' }
  | { kind: 'faz0'; startedAtMs: number }
  | { kind: 'faz1'; os: OsVariant; startedAtMs: number }
  | { kind: 'faz2'; os: OsVariant; startedAtMs: number }
  | { kind: 'faz3'; os: OsVariant; startedAtMs: number }
  | { kind: 'faz4'; os: OsVariant; startedAtMs: number }
  | { kind: 'faz5'; os: OsVariant; startedAtMs: number }
  | { kind: 'faz6'; os: OsVariant; startedAtMs: number }
  | { kind: 'faz7'; os: OsVariant; startedAtMs: number; cycleIndex: number }
  | { kind: 'faz8-reveal'; os: OsVariant; startedAtMs: number }
  | { kind: 'faz8-son-ekran'; os: OsVariant; startedAtMs: number }
  | { kind: 'aborted'; reason: 'esc-hold' | 'completed' };

/* ------------------------------------------------------------------------ */
/* Apartment bleed                                                          */
/* ------------------------------------------------------------------------ */

/**
 * Bleed event kind — `bleed-1` triggers at ~11s into destruction (Faz 2),
 * `bleed-2` at ~16s (Faz 3 mid). Each kind has a distinct visible duration
 * (300ms / 200ms per PLAN §7). Sprint 5 extends with bleed-3 / bleed-4.
 */
export type ApartmentBleedKind = 'bleed-1' | 'bleed-2';

/**
 * Handle returned by `mountApartmentBleedOverlay`. Owns the overlay <div>
 * lifecycle. Caller (destruction-director) invokes `triggerBleed(kind)` at
 * the timing milestones; `dispose()` removes the element + unsubscribes
 * matchMedia listeners.
 */
export interface ApartmentBleedHandle {
  /** Fire a single bleed event. Resolves when the flicker ends. */
  readonly triggerBleed: (kind: ApartmentBleedKind) => Promise<void>;
  /** Remove the overlay element + dispose subscriptions. */
  readonly dispose: () => void;
}

/* ------------------------------------------------------------------------ */
/* Notification toast                                                       */
/* ------------------------------------------------------------------------ */

/**
 * Notification toast spec — kraken-faz2-3 consumes a list of these built
 * from TOAST_MESSAGES_MAC / TOAST_MESSAGES_WIN (string keys) plus icon-kind
 * choices. The actual translation lookup happens at render time via
 * i18n/strings.ts STRINGS map.
 */
export interface NotificationToastSpec {
  /** Stable id for keyed reconciliation; also used as DOM data-toast-id. */
  readonly id: string;
  /** i18n key for the toast title (e.g. `destruction.toast.mac.iCloudSync`). */
  readonly titleKey: string;
  /** i18n key for the toast body (e.g. `destruction.toast.mac.iCloudBody`). */
  readonly bodyKey: string;
  /** Icon affordance — drives the SVG glyph rendered left of the text. */
  readonly iconKind: 'warning' | 'error' | 'info';
}

/* ------------------------------------------------------------------------ */
/* Terminal output                                                          */
/* ------------------------------------------------------------------------ */

/**
 * Single line emitted by the Faz 3 terminal typewriter after the rm -rf
 * command runs. `text` already has the username substituted in. `delayMs`
 * is the delay BEFORE this line appears, measured from the previous line
 * (the rate is TYPEWRITER_OUTPUT_LINES_PER_SEC ⇒ ~14ms per line at 70 LPS).
 */
export interface TerminalLine {
  readonly text: string;
  readonly delayMs: number;
}

/* ------------------------------------------------------------------------ */
/* Destruction director                                                     */
/* ------------------------------------------------------------------------ */

/**
 * Public handle returned by `mountDestructionDirector(deps)`. Subscribed
 * by `scene/index.ts` as the optional `SceneHandle.destructionDirector`
 * field. The director owns its own ESC-hold subscription, OS lookup, and
 * FSM step-through; callers only need `start()` / `abort()` / `dispose()`.
 * Sprint 4 Phase 2B kraken-faz0-1 expanded the mount arg from a single
 * `Scene` to a `DestructionDirectorDeps` bag (scene + camera + audio +
 * lighting + lobbySnapshotGetter) so the director can drive Faz 0 cues
 * without re-imports across the scene module boundary.
 *
 *   - `start()` — explicit kick (Phase 2B kraken-faz0-1 also wires an
 *     auto-start path via the document `bang-fired` CustomEvent + a
 *     MutationObserver fallback on `.bang-overlay.is-fired`).
 *   - `abort(reason)` — terminate mid-sequence, dispose all in-flight side
 *     effects, transition to `{kind:'aborted'}`.
 *   - `dispose()` — full teardown; removes all event subscriptions, DOM
 *     overlays, audio nodes. Called by SceneHandle.dispose().
 */
export interface DestructionDirectorHandle {
  /** Begin the FSM from `idle`. No-op if already past `idle`. */
  readonly start: () => Promise<void>;
  /** Force-abort the in-flight sequence; transitions to `aborted`. */
  readonly abort: (reason: 'esc-hold' | 'completed') => void;
  /**
   * Sprint 6 — request restart from the `faz8-son-ekran` state. No-op
   * outside that state (the FSM is monotonic except at this single re-
   * entry point). Implementation walks back through `faz8-reveal`
   * re-entry (designer §6: "another roll" rather than a fresh boot —
   * the restart hint copy uses "TEKRAR" not "YENİDEN BAŞLAT").
   *
   * KIOSK SAFETY (S9 risk): MUST NOT call `app.quit` /
   * `BrowserWindow.close` / `process.exit` / any IPC exit channel —
   * the joke app is a single-window kiosk; quitting would dump the
   * user back to their actual OS shell which kills the bit.
   *
   * Triggered by: R-key listener in `src/renderer/scene-mount.ts`
   * (top-level keydown; gates on FSM `kind === 'faz8-son-ekran'`).
   */
  readonly requestRestart: () => void;
  /** Read current FSM state — used by the R-key gate (Sprint 6 R key
   * binding scaffold only fires when `kind === 'faz8-son-ekran'`). */
  readonly getState: () => DestructionState;
  /** Full teardown; safe to call once. */
  readonly dispose: () => void;
}

/* ------------------------------------------------------------------------ */
/* Chrome handles                                                           */
/* ------------------------------------------------------------------------ */

/**
 * Shared shape returned by every chrome mount function (dialog, menubar,
 * taskbar). Lets the director uniformly dispose them on Faz transitions or
 * ESC-hold abort.
 */
export interface ChromeHandle {
  /** Detach DOM element + cancel any internal RAF / setInterval timers. */
  readonly dispose: () => void;
}

/**
 * Mac dialog handle — extends ChromeHandle with a discriminator and the
 * live countdown updater. The `kind` field enables type narrowing without
 * `as` casts in faz1-critical-dialog.ts.
 */
export interface MacDialogHandle extends ChromeHandle {
  /** Discriminator for narrowing MacDialogHandle vs WinDialogHandle. */
  readonly kind: 'mac-dialog';
  /** Set the countdown number rendered in the dialog body. */
  readonly setCountdown: (n: number) => void;
}

/** Win dialog handle — Win11 fluent variant. No countdown (PLAN §7). */
export interface WinDialogHandle extends ChromeHandle {
  /** Discriminator for narrowing MacDialogHandle vs WinDialogHandle. */
  readonly kind: 'win-dialog';
}

/** macOS top menubar handle — owns the live clock RAF. */
export type MacMenubarHandle = ChromeHandle;

/** Win11 bottom taskbar handle — owns the live clock RAF. */
export type WinTaskbarHandle = ChromeHandle;

/* ------------------------------------------------------------------------ */
/* Sprint 5 chrome handles — Faz 4-7 surfaces                               */
/*                                                                          */
/* TH-S4-04 closure: every handle carries a `kind` discriminator so callers */
/* narrow via `handle.kind === '<x>'` instead of `as`-casting. Sprint 4     */
/* Phase 4 MINOR-10 added the pattern for Mac/WinDialogHandle; Sprint 5     */
/* Phase 1 pre-declares it for every new surface up-front (eliminates       */
/* Phase 4 cast cleanup).                                                   */
/* ------------------------------------------------------------------------ */

/**
 * macOS kernel panic full-screen handle — Faz 6 Mac branch.
 *
 * Owns the full-screen `#1d1d1f` overlay with the 4-language (TR/EN/RU/JP)
 * "You need to restart your computer" text block + the bottom hex panic
 * log dump scroll. `animateHexDump()` kicks the bottom scroll animation;
 * caller (faz6-bsod.ts) invokes it once at mount and the implementation
 * owns the rAF / setInterval lifecycle through to dispose.
 */
export interface MacKernelPanicHandle extends ChromeHandle {
  readonly kind: 'mac-kernel-panic';
  readonly element: HTMLElement;
  /** Start the hex panic-log auto-scroll. Idempotent. */
  animateHexDump(): void;
}

/**
 * macOS file-wipe progress dialog handle — Faz 4 Mac branch.
 *
 * Owns the Finder-style "Securely erasing disk…" sheet (designer-fictional
 * eaten-apple SVG header, progress bar, greyed cancel button). The
 * setters are pure DOM patches — `setProgress(percent)` updates the bar
 * width, `setEta(label)` swaps the ETA caption, etc. Faz 4 runner drives
 * all four setters on independent timers (declared via owner decrees).
 */
export interface MacProgressDialogHandle extends ChromeHandle {
  readonly kind: 'mac-progress-dialog';
  readonly element: HTMLElement;
  /** Update progress bar (0-100 percent). Idempotent same-value calls. */
  setProgress(percent: number): void;
  /** Update ETA caption ("14 hours, 32 minutes" → "1 day, 14 hours"). */
  setEta(label: string): void;
  /** Update items-remaining counter. Localised number formatting in impl. */
  setItemsRemaining(count: number): void;
  /** Update the file-path scrolling readout. */
  setFilePath(path: string): void;
}

/**
 * macOS bootloop handle — Faz 7 Mac branch.
 *
 * Owns the black-background Apple-bootscreen mimic (designer-fictional
 * eaten-apple SVG, progress bar that fills to ~40% and freezes, ⊘
 * overlay, "No bootable OS found" caption). The state machine has three
 * visible stages: 'apple-loading' (initial) → 'frozen' (progress bar
 * stops at FAZ7_PROGRESS_FREEZE_PERCENT) → 'no-boot' (⊘ overlay).
 * `setProgressDrift(percent)` ticks the bar through the per-cycle drift
 * range FAZ7_PROGRESS_DRIFT_RANGE so each iteration looks slightly
 * different.
 */
export interface MacBootloopHandle extends ChromeHandle {
  readonly kind: 'mac-bootloop';
  readonly element: HTMLElement;
  /** Transition through bootloop stages. Idempotent same-state calls. */
  setState(state: 'apple-loading' | 'frozen' | 'no-boot'): void;
  /** Drift progress bar position. Faz 7 runner drives per cycle. */
  setProgressDrift(percent: number): void;
}

/**
 * Win11 BSOD handle — Faz 6 Win branch.
 *
 * Owns the full-screen `#0078D4` background, sad-face `:(`, "Your PC ran
 * into a problem" copy, stop code "CRITICAL_PROCESS_DIED", stuck "0%
 * complete" progress text, and the bottom-left QR PNG element (real QR
 * encoded `https://www.windows.com/stopcode` — Lane D ships the asset
 * at src/renderer/assets/destruction/win-bsod-qr.png).
 * `startFrownyFlicker()` engages the FAZ6_FROWNY_FLICKER_HZ CRT flicker
 * on the `:(` glyph; gated by prefers-reduced-motion in the impl.
 */
export interface WinBsodHandle extends ChromeHandle {
  readonly kind: 'win-bsod';
  readonly element: HTMLElement;
  /** Engage the CRT frowny-face flicker. Idempotent. */
  startFrownyFlicker(): void;
}

/**
 * Win11 file-wipe progress dialog handle — Faz 4 Win branch.
 *
 * Owns the File Explorer "copy dialog" mimic — designer-fictional
 * four-square SVG header (NOT real Win11 logo per S6 closure), file-by-
 * file readout, greyed X button. Same setter quartet as the Mac variant;
 * the two handles are intentionally shape-identical so the Faz 4 runner
 * can manipulate either through a common interface.
 */
export interface WinProgressDialogHandle extends ChromeHandle {
  readonly kind: 'win-progress-dialog';
  readonly element: HTMLElement;
  setProgress(percent: number): void;
  setEta(label: string): void;
  setItemsRemaining(count: number): void;
  setFilePath(path: string): void;
}

/**
 * Win11 BIOS bootloop handle — Faz 7 Win branch.
 *
 * Owns the full-screen mavi (blue) BIOS-style takeover, "No bootable
 * device — Press F1 to retry, F2 for setup" caption, auto-loop after 3s
 * (FAZ7_CYCLE_MS). State machine has two visible stages: 'no-boot' (the
 * BIOS message itself) → 'restart-pending' (a brief black flash before
 * the next cycle). Faz 7 runner ticks the state machine via cycleIndex
 * in the DestructionState.
 */
export interface WinBiosBootloopHandle extends ChromeHandle {
  readonly kind: 'win-bios-bootloop';
  readonly element: HTMLElement;
  setState(state: 'no-boot' | 'restart-pending'): void;
}

/* ------------------------------------------------------------------------ */
/* Sprint 6 chrome handles — Faz 8 reveal + son-ekran surfaces              */
/*                                                                          */
/* TH-S5-04 closure carried forward: every handle carries a `kind`          */
/* discriminator so callers narrow via `handle.kind === '<x>'` instead of  */
/* `as`-casting. Sprint 6 pre-declares this for every Faz 8 surface       */
/* up-front (same discipline as Sprint 5 Phase 1).                          */
/* ------------------------------------------------------------------------ */

/**
 * Faz 8 disclaimer handle — Sprint 6 closing tableau surface.
 *
 * Owns the centred bilingual disclaimer block — Cyrillic primary
 * ("Это просто шутка.") + Turkish subtitle ("Bu sadece bir şaka.").
 * Fades in at FAZ8_SON_EKRAN_DISCLAIMER_ENTER_MS (~3sn into son-ekran)
 * over FAZ8_SON_EKRAN_DISCLAIMER_FADE_IN_MS (1sn). Final opacity capped
 * at FAZ8_DISCLAIMER_OPACITY_MAX (0.9) so the lobby read remains the
 * primary visual; the text is the WHISPER, not the headline.
 *
 * Owner: faz8-son-ekran.ts (FAZ8_DISCLAIMER_OWNER decree). Lane B fills
 * the body (mount DOM, ARIA labelling, CSS class wiring). The setters
 * exist so the runner can swap the primary/secondary copy at any time
 * (e.g. translation re-evaluation under locale-switch — Sprint 7+).
 */
export interface Faz8DisclaimerHandle extends ChromeHandle {
  readonly kind: 'faz8-disclaimer';
  readonly element: HTMLElement;
  /** Replace the primary Cyrillic copy (default: "Это просто шутка."). */
  readonly setPrimaryText: (text: string) => void;
  /** Replace the secondary Turkish copy (default: "Bu sadece bir şaka."). */
  readonly setSecondaryText: (text: string) => void;
}

/**
 * Faz 8 restart-hint handle — Sprint 6 optional surface.
 *
 * Owns the centred bilingual restart-hint text shown at
 * FAZ8_SON_EKRAN_RESTART_HINT_ENTER_MS (~7sn into son-ekran). Sprint 6
 * SCOPE BOUNDARY: this is HINT TEXT only — Sprint 7+ replaces with
 * actual TEKRAR / ÇIK button UI (referenced by PLAN §7 line 302).
 * Opacity capped at FAZ8_SON_EKRAN_RESTART_HINT_OPACITY (0.4) so the
 * hint reads as a discreet whisper, not a UI call-to-action.
 *
 * The hint conveys: "R = TEKRAR" (Cyrillic + TR mirroring). When the
 * user presses R, the destruction-director's `requestRestart()` is
 * invoked (R-key binding in scene-mount.ts).
 *
 * Owner: faz8-son-ekran.ts (FAZ8_RESTART_HINT_OWNER decree).
 */
export interface Faz8RestartHintHandle extends ChromeHandle {
  readonly kind: 'faz8-restart-hint';
  readonly element: HTMLElement;
  /** Replace the bilingual hint copy. */
  readonly setHintText: (textRu: string, textTr: string) => void;
}

/**
 * Faz 8 volumetric-smoke handle — Sprint 6 OPTIONAL surface.
 *
 * Phase 2A designer decision: may be DROPPED if the perf cost outweighs
 * the atmosphere read (the lobby cigarette smoke column already runs
 * via the Sprint 3 SmokeHandle; this is an OPTIONAL second column over
 * the revolver-on-table composite). The scaffold ships in Sprint 6
 * Phase 1 so the type surface is in place; Phase 2A drops the file if
 * the designer decides against the second column.
 *
 * Owner: faz8-son-ekran.ts (FAZ8_VOLUMETRIC_SMOKE_OWNER decree).
 */
export interface Faz8VolumetricSmokeHandle extends ChromeHandle {
  readonly kind: 'faz8-volumetric-smoke';
  readonly element: HTMLElement;
}

/* ------------------------------------------------------------------------ */
/* Sprint 7 chrome handles — Faz 8 TEKRAR / ÇIK action buttons              */
/*                                                                          */
/* TH-S5-04 carries forward: each handle's `kind` discriminator allows      */
/* narrowing without `as` casts. Sprint 7 pre-declares BOTH split kinds     */
/* (faz8-tekrar-button + faz8-cik-button) up front; designer Phase 2A may   */
/* later collapse the two into a single 'faz8-action-buttons' handle, in    */
/* which case Lane A Phase 2B unions the impl behind the combined kind.    */
/* Phase 1 ships the split surface as the safer default — disposing two    */
/* small handles is no more expensive than one combined handle, and the    */
/* TEKRAR/ÇIK semantics differ enough (one calls `requestRestart()` on the */
/* director; the other calls `window.api.quit()`) that the split keeps     */
/* the call sites readable.                                                 */
/*                                                                          */
/* TH-S6-03 carries forward (Sprint 6 BLOCKER-3 lesson): mount fns         */
/* REQUIRE an explicit `hostElement: HTMLElement` field (no default,       */
/* no `?`-optional). The destruction-takeover overlay reaches opacity 0    */
/* by the time the buttons mount, so children of that overlay would be     */
/* invisible regardless of their own opacity. Lane A must pass a sibling   */
/* host (typically the apartment scene root or document.body) — the type   */
/* surface forces the call site to be explicit about which host.           */
/* ------------------------------------------------------------------------ */

/**
 * Host kind enumeration for Sprint 7 Faz 8 buttons. Used by Lane A to
 * declare INTENT at the mount call site (the actual element passed via
 * `hostElement` must match this intent — Lane A wires the matching
 * element from the destruction-director deps bag).
 *
 *   'document.body'         — Top-level mount (fallback / failsafe).
 *   'scene-root'            — Mounted on the apartment scene root
 *                             element (sibling to the destruction-
 *                             takeover overlay; survives the takeover
 *                             fade-out).
 *   'destruction-takeover'  — Mounted INSIDE the destruction-takeover
 *                             overlay. Reserved for the case where
 *                             designer Phase 2A keeps the overlay
 *                             visible behind the son-ekran (currently
 *                             the overlay fades to opacity 0 at reveal
 *                             end, so this host kind would render the
 *                             buttons invisible — Lane A picks one of
 *                             the other two options).
 */
export type Faz8ButtonHostKind =
  | 'document.body'
  | 'scene-root'
  | 'destruction-takeover';

/**
 * Sprint 7 NEW handle — Faz 8 TEKRAR (restart) button. Clicking /
 * Enter / Space invokes `requestRestart()` on the destruction-director
 * (the kiosk-safe renderer-only FSM re-entry; documented in
 * destruction-director.ts and PLAN §12 S9). Lane B Phase 2B implements
 * the body; Phase 1 ships the STUB.
 *
 * The optional setters allow Lane B to mutate the rendered label /
 * aria-label at runtime — Sprint 7+ locale-switch support may need
 * this; Phase 2B implementation can leave them as no-ops if not
 * required.
 */
export interface Faz8TekrarButtonHandle extends ChromeHandle {
  readonly kind: 'faz8-tekrar-button';
  readonly element: HTMLButtonElement;
  /** Replace the rendered button label (e.g. locale switch). */
  readonly setLabelText: (text: string) => void;
  /** Replace the aria-label (e.g. locale switch). */
  readonly setAriaLabel: (text: string) => void;
}

/**
 * Sprint 7 NEW handle — Faz 8 ÇIK (quit) button. Clicking / Enter /
 * Space invokes `window.api.quit()` (S10 Path A: reuses the Sprint 0
 * `app:request-quit` IPC channel via the preload bridge — no new IPC
 * channel introduced for Sprint 7). Lane B Phase 2B implements the
 * body; Phase 1 ships the STUB.
 *
 * S10 IPC contract note: TEKRAR is renderer-only (mutates the FSM,
 * does NOT exit the app — joke-app invariant preserved). ÇIK uses the
 * existing app:quit channel which closes the BrowserWindow + invokes
 * app.quit() in main process — kiosk-safe full quit. If S10 Phase 1
 * decision is Path B (NEW IPC channel) the contract is updated here
 * AND in the new preload exposure.
 */
export interface Faz8CikButtonHandle extends ChromeHandle {
  readonly kind: 'faz8-cik-button';
  readonly element: HTMLButtonElement;
  /** Replace the rendered button label (e.g. locale switch). */
  readonly setLabelText: (text: string) => void;
  /** Replace the aria-label (e.g. locale switch). */
  readonly setAriaLabel: (text: string) => void;
}

/**
 * Sprint 7 NEW option bag — Faz 8 TEKRAR button mount.
 *
 * TH-S6-03 closure: `hostElement` is REQUIRED (no `?`, no default).
 * `hostKind` declares INTENT — Lane A passes both fields and the
 * destination element resolution lives in the call site (not buried
 * inside the mount fn).
 *
 * TH-S6-04 closure: `caller` is type-narrowed to the owner constant.
 * Only modules importing FAZ8_TEKRAR_BUTTON_CHROME_OWNER can construct
 * this option bag — the type system rejects mis-construction; a
 * runtime equality check inside the mount fn is the defence-in-depth
 * fallback for unsafe `as` casts.
 */
export interface Faz8TekrarButtonOptions {
  /** TH-S6-04 caller decree — must be FAZ8_TEKRAR_BUTTON_CHROME_OWNER. */
  readonly caller: typeof FAZ8_TEKRAR_BUTTON_CHROME_OWNER;
  /** Host DOM element the button mounts into. REQUIRED (TH-S6-03). */
  readonly hostElement: HTMLElement;
  /** INTENT enumeration for the host element. */
  readonly hostKind: Faz8ButtonHostKind;
  /**
   * Click / Enter / Space handler. Lane A wires this to
   * destruction-director.requestRestart().
   */
  readonly onClick: () => void;
  /** i18n-resolved aria-label for screen readers. */
  readonly ariaLabel: string;
  /** i18n-resolved button copy. */
  readonly labelText: string;
  /** Abort signal — dispose triggers on signal fire. */
  readonly signal: AbortSignal;
}

/**
 * Sprint 7 NEW option bag — Faz 8 ÇIK button mount.
 *
 * Mirror of Faz8TekrarButtonOptions with the caller type narrowed to
 * the ÇIK button owner constant. Same TH-S6-03 + TH-S6-04 closure
 * discipline applies.
 */
export interface Faz8CikButtonOptions {
  /** TH-S6-04 caller decree — must be FAZ8_CIK_BUTTON_CHROME_OWNER. */
  readonly caller: typeof FAZ8_CIK_BUTTON_CHROME_OWNER;
  /** Host DOM element the button mounts into. REQUIRED (TH-S6-03). */
  readonly hostElement: HTMLElement;
  /** INTENT enumeration for the host element. */
  readonly hostKind: Faz8ButtonHostKind;
  /**
   * Click / Enter / Space handler. Lane A wires this to
   * window.api.quit() (S10 Path A) or window.api.quitApp() (S10 Path B).
   */
  readonly onClick: () => void;
  /** i18n-resolved aria-label for screen readers. */
  readonly ariaLabel: string;
  /** i18n-resolved button copy. */
  readonly labelText: string;
  /** Abort signal — dispose triggers on signal fire. */
  readonly signal: AbortSignal;
}

/* ------------------------------------------------------------------------ */
/* Sprint 7 audio handle — Faz 8 reveal jingle                              */
/* ------------------------------------------------------------------------ */

/**
 * Sprint 7 NEW audio handle — Faz 8 reveal jingle (ADSR chord synth
 * that rings out across the reveal envelope). `play()` schedules the
 * envelope on a fresh OscillatorNode-graph; `dispose()` snaps any
 * in-flight envelope to silence and disconnects the graph.
 *
 * Constructed by faz8-reveal.ts via the createRevealJingle factory in
 * audio/destruction-audio-faz8.ts (REVEAL_JINGLE_AUDIO_OWNER decree).
 * Lane A Phase 2B threads play() into the reveal entry hook.
 */
export interface RevealJingleHandle {
  readonly kind: 'reveal-jingle';
  /** Schedule the jingle envelope. Idempotent second-call within the
   *  same reveal window is a no-op (the envelope is single-fire per
   *  reveal entry by design). */
  readonly play: () => void;
  /** Stop in-flight envelope + disconnect the node graph. */
  readonly dispose: () => void;
}

/**
 * Sprint 7 NEW option bag — Faz 8 reveal jingle factory.
 *
 * TH-S6-04 closure: `caller` is type-narrowed to
 * REVEAL_JINGLE_AUDIO_OWNER. Only faz8-reveal.ts can construct.
 */
export interface RevealJingleOptions {
  /** TH-S6-04 caller decree — must be REVEAL_JINGLE_AUDIO_OWNER. */
  readonly caller: typeof REVEAL_JINGLE_AUDIO_OWNER;
  /** AudioContext from the destruction audio chain. */
  readonly audioContext: AudioContext;
  /** Master GainNode tap for envelope routing. */
  readonly destinationNode: AudioNode;
}
