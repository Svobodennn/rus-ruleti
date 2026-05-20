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
 * External consumer:
 *   - scene/index.ts SceneHandle.destructionDirector field (lazy import).
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
 * DestructionState discriminator. Sprint 4 covers faz0..faz3; Sprint 5 will
 * extend with faz4..faz7; Sprint 6 adds faz8 (reveal).
 */
export type DestructionPhase = 'faz0' | 'faz1' | 'faz2' | 'faz3';

/**
 * Discriminated union for the destruction-director FSM.
 *
 *   idle               — no bang detected yet; director mounted but inert.
 *   faz0..faz3         — active sequence variant carries OS (where relevant)
 *                        and the start timestamp for telemetry / abort math.
 *   aborted            — terminal state; either user ESC-held or sequence
 *                        completed cleanly. Director can be re-armed only by
 *                        re-mounting (lobby reload).
 *
 * Exhaustive switch on `kind` + `assertNever` (in destruction-state.ts)
 * forces every consumer to handle every variant.
 */
export type DestructionState =
  | { kind: 'idle' }
  | { kind: 'faz0'; startedAtMs: number }
  | { kind: 'faz1'; os: OsVariant; startedAtMs: number }
  | { kind: 'faz2'; os: OsVariant; startedAtMs: number }
  | { kind: 'faz3'; os: OsVariant; startedAtMs: number }
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
 * Mac dialog handle — extends ChromeHandle with the live countdown updater.
 * Phase 2B swift-expert reads the countdown value once per second so the
 * "Restarting in 5..." label decrements smoothly.
 */
export interface MacDialogHandle extends ChromeHandle {
  /** Set the countdown number rendered in the dialog body. */
  readonly setCountdown: (n: number) => void;
}

/** Win dialog handle — Win11 fluent variant. No countdown (PLAN §7). */
export type WinDialogHandle = ChromeHandle;

/** macOS top menubar handle — owns the live clock RAF. */
export type MacMenubarHandle = ChromeHandle;

/** Win11 bottom taskbar handle — owns the live clock RAF. */
export type WinTaskbarHandle = ChromeHandle;
