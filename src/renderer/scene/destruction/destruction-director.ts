/**
 * Destruction sequence orchestrator.
 *
 * Sprint 4 Phase 2B kraken-faz0-1 fill. The director is the single entry
 * point Sprint 4 wires into the existing lobby. It subscribes to two
 * parallel detection paths (Sprint 4 retro lesson — single detection path
 * = race condition risk):
 *
 *   1. `document` CustomEvent `'bang-fired'` (primary; emitted by
 *      revolver-effects.triggerBangOverlay).
 *   2. MutationObserver on `.bang-overlay` class list (fallback; catches
 *      the `.is-fired` toggle even if the CustomEvent dispatch was missed).
 *
 * On detection (and only the FIRST detection — both paths share a single
 * `started` flag so the second observer is a no-op), the director:
 *   a. Resolves OS via `window.api.getOS()` AND username via `getUsername()`
 *      in parallel.
 *   b. Mounts the destruction overlay container (z-index 10000) and the
 *      apartment-bleed overlay (Lane B body fills `mountApartmentBleedOverlay`).
 *   c. Mounts the destruction-audio extensions (tinnitus, lowpass, chord).
 *   d. Steps through faz0 → faz1 → faz2 → faz3 → faz4 → faz5 → faz6 →
 *      faz7 → faz8-reveal → faz8-son-ekran by awaiting each runner,
 *      threading an AbortSignal so ESC-hold short-circuits mid-Faz.
 *   e. Disposes everything in reverse-allocation order.
 *
 * Sprint 6 R-key restart loop (PLAN §7 lines 290-303 closing tableau):
 *   - `requestRestart()` invoked from scene-mount.ts top-level keydown
 *     listener while FSM kind === 'faz8-son-ekran'. The director walks
 *     the FSM back into a fresh faz8-reveal cycle. KIOSK SAFETY (S9):
 *     this method MUST NOT call app.quit / BrowserWindow.close / any
 *     IPC exit channel — the joke app is a single-window kiosk; quitting
 *     would dump the user back to their OS shell which kills the bit.
 *
 * Sprint 7 Phase 1 — FSM extension scaffold (Lane A Phase 2B implements):
 *   - DirectorRuntime carries a `revealJingle: RevealJingleHandle | null`
 *     field (constructed at faz8-reveal entry via createRevealJingle(),
 *     disposed at son-ekran exit). Phase 1 leaves it null + uses the
 *     SPRINT7_STUB_REVEAL_JINGLE no-op so the type contract compiles.
 *   - Five Lane A hook points commented inside runOneFaz8Cycle:
 *       (a) jingle.play() at reveal entry — replace SPRINT7_STUB_REVEAL_JINGLE
 *           with createRevealJingle() from audio/destruction-audio-faz8.ts;
 *           call jingle.play() at REVEAL_JINGLE_OFFSET_MS into reveal.
 *       (b) button mount at son-ekran entry — replace document.body
 *           default tekrar/cik hosts with the apartment-scene-root sibling
 *           per Faz8ButtonHostKind 'scene-root'.
 *       (c) button dispose at son-ekran exit / restart — call
 *           handle.dispose() before the loop iterates or returns.
 *       (d) faz7→faz8 cross-fade — schedule a transition timer owned
 *           by FAZ7_TO_FAZ8_TRANSITION_TIMER_OWNER + toggle the
 *           SCENE_TRANSITION_FADE_OUT_CLASS on the faz7 chrome.
 *       (e) faz6→faz7 cross-fade — schedule a transition timer owned
 *           by FAZ6_TO_FAZ7_TRANSITION_TIMER_OWNER + toggle the
 *           same CSS class on the faz6 chrome.
 *
 * ESC-hold escape:
 *   - Subscribes to `window.api.onEscapeHold(onProgress, onComplete)`. On
 *     completion the director calls `abort('esc-hold')` which short-
 *     circuits the in-flight Faz and disposes all chrome / audio / DOM
 *     resources. The preload bridge ALSO fires IPC `app:quit` so the
 *     Electron app terminates — the abort path is defensive cleanup; the
 *     user is already on their way out the door.
 *
 * Called by: scene/index.ts `buildResources()` — mounts eagerly so the
 * bang-fired listener is on `document` BEFORE the bang can fire.
 *
 * Disposed by: SceneHandle.dispose() — the dispose chain runs the director's
 * dispose BEFORE revolver.dispose() so the bang-fired listener detaches
 * before the overlay element it observes is reset.
 */

import log from 'electron-log/renderer';
import type { PerspectiveCamera, Scene } from 'three';
import type { AudioBedHandle } from '../audio/audio-bed.js';
import type { BulbLightHandle } from '../lighting.js';
import { mountDestructionAudio } from '../audio/destruction-audio.js';
import type { DestructionAudioHandle } from '../audio/destruction-audio.js';
import { createRevealJingle } from '../audio/destruction-audio-faz8.js';
import {
  AMBIENT_RECOVERY_AUDIO_OWNER,
  DOOR_CLOSE_AUDIO_OWNER,
  REVEAL_JINGLE_AUDIO_OWNER,
} from '../../../shared/scene-destruction-constants.js';
import { runFaz0 } from './faz0-bang.js';
import { runFaz1 } from './faz1-critical-dialog.js';
import { runFaz2 } from './faz2-takeover.js';
import { runFaz3 } from './faz3-terminal.js';
import { startFaz4FileWipe } from './faz4-file-wipe.js';
import { startFaz5DiskFormat } from './faz5-disk-format.js';
import { startFaz6Bsod } from './faz6-bsod.js';
import { startFaz7Bootloop } from './faz7-bootloop.js';
import { startFaz8Reveal } from './faz8-reveal.js';
import { startFaz8SonEkran } from './faz8-son-ekran.js';
import { mountApartmentBleedOverlay } from './apartment-bleed.js';
import {
  runFaz6ToFaz7Transition,
  runFaz7ToFaz8Transition,
} from './destruction-transitions.js';
import {
  initialState,
  onBangFired,
  onFaz0Complete,
  onFaz1Complete,
  onFaz2Complete,
  onFaz3Complete,
  onFaz4Complete,
  onFaz5Complete,
  onFaz6Complete,
  onFaz7Complete,
  onFaz8RevealComplete,
  onFaz8RestartRequested,
  onFaz8SonEkranComplete,
  onEscHold,
} from './destruction-state.js';
import type {
  ApartmentBleedHandle,
  DestructionDirectorHandle,
  DestructionState,
  OsVariant,
  RevealJingleHandle,
} from './types.js';

/**
 * Dependencies the director needs from scene/index.ts. Bag arg keeps the
 * mountDestructionDirector signature stable as Sprint 5+ adds more.
 *
 * `lobbySnapshotGetter` is a function (not a string) because the snapshot
 * is captured via rAF AFTER `mountDestructionDirector` returns. The
 * director invokes the getter at faz2 entry — by then the rAF has
 * resolved and the data URL is populated.
 */
export interface DestructionDirectorDeps {
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly audio: AudioBedHandle;
  readonly lighting: BulbLightHandle;
  readonly lobbySnapshotGetter: () => string | undefined;
}

/** Bang-fired event detail emitted by revolver-effects.triggerBangOverlay. */
interface BangFiredEventDetail {
  readonly timestamp: number;
}

/** Internal mutable state — keeps the director functions under the 50-line cap. */
interface DirectorRuntime {
  started: boolean;
  disposed: boolean;
  abortCtrl: AbortController;
  /**
   * Sprint 6 — separate abort controller for the Faz 8 son-ekran R-key
   * restart short-circuit. When the user presses R, this controller
   * aborts so the in-flight son-ekran runner resolves and the FSM loop
   * walks back into a fresh faz8-reveal. The OUTER abortCtrl is for
   * ESC-hold + dispose; this INNER ctrl is for the restart cycle.
   * Re-allocated at every reveal entry.
   */
  sonEkranAbortCtrl: AbortController | null;
  /**
   * Sprint 6 — current FSM state. Updated via the pure transition
   * functions in destruction-state.ts. Exposed via DestructionDirectorHandle.getState
   * so the R-key listener in scene-mount.ts can gate on
   * `kind === 'faz8-son-ekran'`.
   */
  fsmState: DestructionState;
  destructionAudio: DestructionAudioHandle | null;
  apartmentBleed: ApartmentBleedHandle | null;
  overlay: HTMLElement | null;
  fallbackTimer: ReturnType<typeof setTimeout> | null;
  observer: MutationObserver | null;
  escDispose: (() => void) | null;
  eventHandler: ((ev: Event) => void) | null;
  /**
   * Sprint 7 — Faz 8 reveal jingle handle. Constructed at reveal
   * entry via createRevealJingle() (Lane A Phase 2B); Phase 1 leaves
   * this null and uses the SPRINT7_STUB_REVEAL_JINGLE no-op via the
   * Faz8RevealRunArgs.jingle field directly. Lane A wires the real
   * handle here so dispose() can be threaded into disposeSequence
   * Artifacts() — the jingle ADSR tail must not bleed past teardown.
   */
  revealJingle: RevealJingleHandle | null;
}

/** Time before the MutationObserver fallback engages if no bang-fired event arrived. */
const FALLBACK_DETECTION_TIMEOUT_MS = 100;
/** CSS class watched by the MutationObserver fallback. */
const BANG_FIRED_CLASS = 'is-fired';
/** Z-index for the destruction overlay container (designer §4 row 1). */
const DESTRUCTION_OVERLAY_Z_INDEX = '10000';

/**
 * Mount the destruction director onto the existing Three.js lobby scene.
 *
 * The director begins inert (FSM idle). It subscribes to the bang-fired
 * detection paths and waits. Once a bang is detected, it steps through
 * Faz 0-3 and disposes itself. The handle's `start()` is exposed for
 * test harnesses; production code never calls it.
 */
export function mountDestructionDirector(
  deps: DestructionDirectorDeps,
): DestructionDirectorHandle {
  const runtime = createRuntime();
  attachDetectionPaths(runtime, deps);
  return buildHandle(runtime, deps);
}

/** Construct the mutable runtime bag. Default-init only — no side effects. */
function createRuntime(): DirectorRuntime {
  return {
    started: false, disposed: false,
    abortCtrl: new AbortController(), sonEkranAbortCtrl: null,
    fsmState: initialState(),
    destructionAudio: null, apartmentBleed: null, overlay: null,
    fallbackTimer: null, observer: null, escDispose: null, eventHandler: null,
    revealJingle: null,
  };
}

/** Public handle bound to the runtime. */
function buildHandle(
  runtime: DirectorRuntime,
  deps: DestructionDirectorDeps,
): DestructionDirectorHandle {
  return {
    start: async (): Promise<void> => runSequenceOnce(runtime, deps),
    abort: (reason): void => abortSequence(runtime, reason),
    requestRestart: (): void => requestRestart(runtime),
    getState: (): DestructionState => runtime.fsmState,
    dispose: (): void => disposeDirector(runtime),
  };
}

/* ------------------------------------------------------------------------ */
/* Detection paths                                                          */
/* ------------------------------------------------------------------------ */

/**
 * Attach the two parallel detection paths:
 *   1. `document` CustomEvent listener (primary)
 *   2. MutationObserver on `.bang-overlay` class list (fallback)
 *
 * The ESC-hold subscription also attaches here so the user can abort
 * BEFORE the bang ever fires (no-op until the FSM transitions out of idle,
 * but the listener attachment is cheap and the dispose chain is uniform).
 */
function attachDetectionPaths(
  runtime: DirectorRuntime,
  deps: DestructionDirectorDeps,
): void {
  attachBangFiredListener(runtime, deps);
  attachMutationObserverFallback(runtime, deps);
  attachEscapeHoldSubscription(runtime);
}

/** Subscribe to the document CustomEvent. */
function attachBangFiredListener(
  runtime: DirectorRuntime, deps: DestructionDirectorDeps,
): void {
  const handler = (ev: Event): void => {
    const detail = (ev as CustomEvent<BangFiredEventDetail>).detail;
    log.info('destruction-director: bang-fired event', detail.timestamp);
    void runSequenceOnce(runtime, deps);
  };
  runtime.eventHandler = handler;
  document.addEventListener('bang-fired', handler);
}

/**
 * Install MutationObserver on `.bang-overlay` watching for `.is-fired`
 * class toggle. Engages only AFTER FALLBACK_DETECTION_TIMEOUT_MS without
 * the primary event firing — defence-in-depth, not the primary path. If
 * the primary event arrives first, the fallback observer is disconnected.
 */
function attachMutationObserverFallback(
  runtime: DirectorRuntime, deps: DestructionDirectorDeps,
): void {
  runtime.fallbackTimer = setTimeout((): void => {
    if (runtime.started || runtime.disposed) return;
    const overlay = document.querySelector('.bang-overlay');
    if (overlay === null) return;
    runtime.observer = new MutationObserver((): void => observeBangOverlay(runtime, overlay, deps));
    runtime.observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
  }, FALLBACK_DETECTION_TIMEOUT_MS);
}

/** MutationObserver callback — fires the sequence if `is-fired` is present. */
function observeBangOverlay(
  runtime: DirectorRuntime, overlay: Element, deps: DestructionDirectorDeps,
): void {
  if (runtime.started) return;
  if (overlay.classList.contains(BANG_FIRED_CLASS)) {
    log.info('destruction-director: MutationObserver fallback fired');
    void runSequenceOnce(runtime, deps);
  }
}

/** Subscribe to ESC-hold completion via the preload bridge. */
function attachEscapeHoldSubscription(runtime: DirectorRuntime): void {
  if (typeof window === 'undefined' || window.api === undefined) {
    runtime.escDispose = (): void => undefined;
    return;
  }
  runtime.escDispose = window.api.onEscapeHold((): void => undefined, (): void => abortSequence(runtime, 'esc-hold'));
}

/* ------------------------------------------------------------------------ */
/* Sequence                                                                 */
/* ------------------------------------------------------------------------ */

/**
 * Run the Faz 0-3 sequence exactly once. Idempotent — second call is a
 * no-op. The function is `async` but its callers `void`-discard the result;
 * any unhandled rejection logs via electron-log and disposes the runtime.
 */
async function runSequenceOnce(
  runtime: DirectorRuntime,
  deps: DestructionDirectorDeps,
): Promise<void> {
  if (runtime.started || runtime.disposed) return;
  runtime.started = true;
  cancelFallback(runtime);
  // Sprint 6: record the FSM transition idle → faz0 BEFORE the runners
  // start so a near-simultaneous getState() call lands on the correct
  // kind. nowMs is captured here rather than re-read inside each
  // transition so the entire sequence shares one monotonic clock.
  runtime.fsmState = onBangFired(runtime.fsmState, performance.now());
  try {
    const { os, username } = await resolveOsAndUsername();
    await prepareOverlay(runtime, deps);
    await runFazSequence(runtime, deps, os, username);
  } catch (err) {
    log.error('destruction-director: sequence failed', err);
  } finally {
    disposeSequenceArtifacts(runtime);
  }
}

/** Resolve OS + username in parallel with defensive fallbacks. */
async function resolveOsAndUsername(): Promise<{
  os: OsVariant;
  username: string;
}> {
  try {
    const [os, username] = await Promise.all([
      window.api.getOS(),
      window.api.getUsername(),
    ]);
    return { os, username };
  } catch (err) {
    log.warn('destruction-director: OS/username resolve failed; using defaults', err);
    return { os: 'mac', username: 'user' };
  }
}

/**
 * Prepare the destruction overlay container + apartment bleed overlay +
 * destruction audio extensions. Each artifact is stored on the runtime so
 * dispose chain reaches every node.
 */
async function prepareOverlay(
  runtime: DirectorRuntime, deps: DestructionDirectorDeps,
): Promise<void> {
  runtime.overlay = createOverlayElement();
  document.body.appendChild(runtime.overlay);
  runtime.apartmentBleed = mountApartmentBleedOverlay(deps.lobbySnapshotGetter());
  runtime.destructionAudio = mountDestructionAudio({
    context: deps.audio.context, master: deps.audio.master, insertGlobalFilter: deps.audio.insertGlobalFilter,
  });
  // Yield a tick so the overlay paints before Faz 0 cues fire (camera shake
  // and bulb darken otherwise compete with the same frame).
  await Promise.resolve();
}

/** Create the destruction-takeover overlay <div>. Lane B fills CSS. */
function createOverlayElement(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'destruction-takeover';
  el.style.position = 'fixed';
  el.style.inset = '0';
  el.style.zIndex = DESTRUCTION_OVERLAY_Z_INDEX;
  el.style.pointerEvents = 'none';
  el.style.background = '#000000';
  return el;
}

/** Step through Faz 0-3 sequentially. Each runner respects the abort signal. */
async function runFazSequence(
  runtime: DirectorRuntime,
  deps: DestructionDirectorDeps,
  os: OsVariant,
  username: string,
): Promise<void> {
  const signal = runtime.abortCtrl.signal;
  await runFaz0({
    camera: deps.camera,
    lighting: deps.lighting,
    audio: deps.audio,
    destructionAudio: nonNull(runtime.destructionAudio),
    signal,
  });
  if (signal.aborted) return;
  runtime.fsmState = onFaz0Complete(runtime.fsmState, os, performance.now());
  await runFaz1({
    os,
    container: nonNull(runtime.overlay),
    destructionAudio: nonNull(runtime.destructionAudio),
    signal,
  });
  if (signal.aborted) return;
  runtime.fsmState = onFaz1Complete(runtime.fsmState, performance.now());
  await runFazTakeoverAndTerminal(runtime, deps, os, username);
}

/**
 * Run faz2 (Takeover with bleed #1) then faz3 (Terminal with bleed #2).
 * Extracted because the parent runFazSequence was edging 50 lines.
 */
async function runFazTakeoverAndTerminal(
  runtime: DirectorRuntime,
  deps: DestructionDirectorDeps,
  os: OsVariant,
  username: string,
): Promise<void> {
  const signal = runtime.abortCtrl.signal;
  const apartmentBleed = nonNull(runtime.apartmentBleed);
  await runFaz2({
    os,
    container: nonNull(runtime.overlay),
    lobbySnapshotDataUrl: deps.lobbySnapshotGetter(),
    apartmentBleed,
    signal,
  });
  if (signal.aborted) return;
  runtime.fsmState = onFaz2Complete(runtime.fsmState, performance.now());
  await runFaz3({
    os,
    username,
    container: nonNull(runtime.overlay),
    apartmentBleed,
    signal,
  });
  if (signal.aborted) return;
  runtime.fsmState = onFaz3Complete(runtime.fsmState, performance.now());
  await runFaz4Through7(runtime, deps, os, username);
}

/**
 * Sprint 5 — Run faz4 (file wipe) → faz5 (disk format) → faz6 (BSOD /
 * kernel panic) → faz7 (bootloop). Each runner respects the abort signal
 * + threads through the destruction overlay container.
 *
 * Sprint 6 — extends with faz7 → faz8-reveal → faz8-son-ekran hand-off
 * via runFaz8RevealAndSonEkran. The Faz 8 chain owns the R-key restart
 * loop (see requestRestart()); the Faz 4-7 chain remains monotonic.
 *
 * Lane B (Faz 6 + Faz 7) consumes the destructionAudio handle to:
 *   - register the BSOD beep / electrical-tick handles into the owner pool
 *   - retrieve and silence Faz 4 / Faz 5 audio surfaces (HDD-grind,
 *     fan-overdrive, electrical-buzz) at Faz 6 end
 *
 * Lane B (Faz 7) also consumes the lobbySnapshotDataUrl so bleed #4's
 * revolver-on-table composite has the apartment image to overlay.
 *
 * Extracted from runFazTakeoverAndTerminal to stay under the 50-line
 * ESLint cap (max-lines-per-function).
 */
async function runFaz4Through7(
  runtime: DirectorRuntime,
  deps: DestructionDirectorDeps,
  os: OsVariant,
  username: string,
): Promise<void> {
  const signal = runtime.abortCtrl.signal;
  const container = nonNull(runtime.overlay);
  const destructionAudio = nonNull(runtime.destructionAudio);
  await startFaz4FileWipe({ os, username, container, destructionAudio, signal });
  if (signal.aborted) return;
  runtime.fsmState = onFaz4Complete(runtime.fsmState, performance.now());
  await startFaz5DiskFormat({ os, username, container, destructionAudio, signal });
  if (signal.aborted) return;
  runtime.fsmState = onFaz5Complete(runtime.fsmState, performance.now());
  await startFaz6Bsod({ os, container, destructionAudio, signal });
  if (signal.aborted) return;
  runtime.fsmState = onFaz6Complete(runtime.fsmState, performance.now());
  // Sprint 7 — Faz 6 → Faz 7 cross-fade (150ms, reduced-motion skips).
  await runFaz6ToFaz7Transition(container, signal);
  if (signal.aborted) return;
  await startFaz7Bootloop({
    os, container, destructionAudio,
    lobbySnapshotDataUrl: deps.lobbySnapshotGetter(), signal,
  });
  if (signal.aborted) return;
  runtime.fsmState = onFaz7Complete(runtime.fsmState, performance.now());
  // Sprint 7 — Faz 7 → Faz 8 cross-fade (200ms, reduced-motion skips).
  await runFaz7ToFaz8Transition(container, signal);
  if (signal.aborted) return;
  await runFaz8RevealAndSonEkran(runtime, deps, os);
}

/**
 * Sprint 6 — Run faz8-reveal → faz8-son-ekran with R-key restart loop.
 *
 * Reference: PLAN.md §7 lines 290-303 (Faz 8 narrative spec) +
 * §11 lines 702-721 (Sprint 6 matrix).
 *
 * Each iteration of the loop is one reveal+son-ekran cycle:
 *   1. startFaz8Reveal — 5sn fade-out + camera dolly + ambient ramp
 *   2. startFaz8SonEkran — 10sn closing tableau with disclaimer +
 *      door-close audio + optional restart hint
 *
 * Loop exits via:
 *   - signal.aborted (ESC-hold) — runner short-circuits, FSM goes to
 *     aborted{esc-hold} via onEscHold (already wired in the existing
 *     ESC-hold subscription)
 *   - son-ekran resolves WITHOUT R-key restart — FSM transitions to
 *     aborted{completed} via onFaz8SonEkranComplete; loop exits
 *   - son-ekran resolves DUE to R-key restart — FSM transitions back
 *     to faz8-reveal via onFaz8RestartRequested; loop continues
 *
 * KIOSK SAFETY (S9 closure): the loop NEVER calls app.quit / IPC exit.
 * The restart cycle is purely FSM + signal abort; no Electron lifecycle
 * surface is touched.
 */
async function runFaz8RevealAndSonEkran(
  runtime: DirectorRuntime, deps: DestructionDirectorDeps, os: OsVariant,
): Promise<void> {
  const outerSignal = runtime.abortCtrl.signal;
  // Loop: one reveal+son-ekran cycle per iteration. Exits when son-ekran
  // completes without restart OR outerSignal aborts. FSM in 'faz8-reveal'
  // post-cycle means requestRestart() fired → loop continues.
  while (!outerSignal.aborted) {
    await runOneFaz8Cycle(runtime, deps, os);
    if (outerSignal.aborted) return;
    if (runtime.fsmState.kind !== 'faz8-reveal') return;
  }
}

/**
 * Run a single reveal+son-ekran cycle. Extracted so the loop body
 * stays under the 50-line cap. The cycle allocates a fresh
 * `sonEkranAbortCtrl` so the R-key restart can short-circuit the
 * son-ekran runner independently of the outer ESC-hold abort.
 */
async function runOneFaz8Cycle(
  runtime: DirectorRuntime,
  deps: DestructionDirectorDeps,
  os: OsVariant,
): Promise<void> {
  const outerSignal = runtime.abortCtrl.signal;
  const container = nonNull(runtime.overlay);
  const destructionAudio = nonNull(runtime.destructionAudio);
  // Sprint 7 — construct fresh reveal jingle handle per cycle. The prior
  // cycle's handle (if any) was disposed in requestRestart() so the new
  // ADSR graph allocates clean. Stored on runtime so requestRestart can
  // walk it down symmetric with the Sprint 6 audio handles.
  runtime.revealJingle = createRevealJingle({
    caller: REVEAL_JINGLE_AUDIO_OWNER, audioContext: destructionAudio.context, destinationNode: destructionAudio.destination,
  });
  await startFaz8Reveal({ os, signal: outerSignal, container, destructionAudio, camera: deps.camera, lighting: deps.lighting, jingle: runtime.revealJingle });
  if (outerSignal.aborted) return;
  runtime.fsmState = onFaz8RevealComplete(runtime.fsmState, performance.now());
  runtime.sonEkranAbortCtrl = new AbortController();
  const sonEkranSignal = AbortSignal.any([outerSignal, runtime.sonEkranAbortCtrl.signal]);
  await startFaz8SonEkran({
    os, signal: sonEkranSignal, container, chromeHost: document.body, destructionAudio,
    tekrarButtonHost: document.body, cikButtonHost: document.body,
    requestRestart: (): void => requestRestart(runtime), quit: quitAppFromButton,
  });
  runtime.sonEkranAbortCtrl = null;
  if (outerSignal.aborted) return;
  if (runtime.fsmState.kind === 'faz8-son-ekran') runtime.fsmState = onFaz8SonEkranComplete(runtime.fsmState);
}

/** Sprint 7 — ÇIK button handler. S10 Path A: window.api.quit() (Sprint 0 IPC). */
function quitAppFromButton(): void {
  log.info('destruction-director: ÇIK → window.api.quit()');
  if (typeof window !== 'undefined' && window.api !== undefined) window.api.quit();
}

/* ------------------------------------------------------------------------ */
/* Abort + dispose                                                          */
/* ------------------------------------------------------------------------ */

/** Force-abort the in-flight sequence. */
function abortSequence(
  runtime: DirectorRuntime,
  reason: 'esc-hold' | 'completed',
): void {
  log.info('destruction-director: abort', reason);
  // Sprint 6: if abort is triggered while an active faz is in flight,
  // record the ESC-hold transition on the FSM state so a near-
  // simultaneous getState() lands on the correct kind. The pure
  // function no-ops for idle/aborted/etc.
  if (reason === 'esc-hold') {
    runtime.fsmState = onEscHold(runtime.fsmState);
  }
  runtime.abortCtrl.abort();
  disposeSequenceArtifacts(runtime);
}

/**
 * Sprint 6 — request restart from the `faz8-son-ekran` state.
 *
 * Risk S9 — kiosk-safe restart. Verify Phase 3 QA smoke.
 *
 * KIOSK SAFETY (S9 closure): MUST NOT call app.quit /
 * BrowserWindow.close / process.exit / any IPC exit channel. The
 * joke app is a single-window kiosk — quitting would dump the user
 * back to their OS shell which kills the bit. This function only
 * mutates FSM state + aborts the son-ekran signal + disposes the
 * prior reveal's audio handle so the next cycle re-allocates clean.
 *
 * Triggered by: scene-mount.ts R-key listener (top-level keydown
 * gates on getState().kind === 'faz8-son-ekran').
 *
 * Flow:
 *   1. Verify FSM is in faz8-son-ekran (defence — the R-key listener
 *      already gates, but a stale handle reference could call here
 *      from a different state).
 *   2. Dispose the prior AmbientRecoveryHandle from the audio pool
 *      so the next reveal cycle re-constructs cleanly without
 *      leaking the previous brown-noise BufferSource graph. Chrome
 *      handles (disclaimer + restart-hint) dispose automatically
 *      via their sonEkranSignal abort listeners (Lane B mount fns
 *      attach those at mount time).
 *   3. Apply the onFaz8RestartRequested pure transition so the FSM
 *      records the restart cycle entry.
 *   4. Abort the sonEkranAbortCtrl so the son-ekran runner short-
 *      circuits. The outer loop in runFaz8RevealAndSonEkran observes
 *      the FSM state on the next iteration and runs a fresh reveal.
 */
function requestRestart(runtime: DirectorRuntime): void {
  if (runtime.disposed) return;
  if (runtime.fsmState.kind !== 'faz8-son-ekran') {
    log.warn('destruction-director: requestRestart ignored — FSM not in son-ekran', {
      kind: runtime.fsmState.kind,
    });
    return;
  }
  log.info('destruction-director: requestRestart fired');
  // Dispose prior reveal + son-ekran audio handles so the next cycle
  // re-allocates clean. Sprint 7 — symmetric jingle dispose (the ADSR
  // tail must not bleed into the next cycle). Sprint 7 TEKRAR / ÇIK
  // button chrome handles + the FAZ8_BUTTON_KEYDOWN_LISTENER_OWNER
  // listener auto-dispose via the sonEkranSignal abort listener
  // wired inside startFaz8SonEkran (chrome mount fns +
  // installButtonKeydownListener). Sprint 7 scene transition timers
  // (Faz 6→7, Faz 7→8) are already-completed by the time the FSM
  // reaches faz8-son-ekran — nothing to cancel.
  // KIOSK SAFETY (S9): no window.close / app.quit / IPC exit channel
  // is touched here — the restart cycle is purely FSM + signal abort.
  runtime.destructionAudio?.getOwnedAudio(AMBIENT_RECOVERY_AUDIO_OWNER)?.dispose();
  runtime.destructionAudio?.getOwnedAudio(DOOR_CLOSE_AUDIO_OWNER)?.dispose();
  runtime.revealJingle?.dispose();
  runtime.revealJingle = null;
  runtime.fsmState = onFaz8RestartRequested(runtime.fsmState, performance.now());
  runtime.sonEkranAbortCtrl?.abort();
}

/** Cancel the MutationObserver fallback timer. */
function cancelFallback(runtime: DirectorRuntime): void {
  if (runtime.fallbackTimer !== null) {
    clearTimeout(runtime.fallbackTimer);
    runtime.fallbackTimer = null;
  }
  if (runtime.observer !== null) {
    runtime.observer.disconnect();
    runtime.observer = null;
  }
}

/** Dispose every artifact the sequence allocated. Safe to call multiple times. */
function disposeSequenceArtifacts(runtime: DirectorRuntime): void {
  // Sprint 7 — reveal jingle disposed BEFORE destructionAudio so the
  // ADSR tail's osc.stop() lands on a still-live AudioContext.
  if (runtime.revealJingle !== null) { runtime.revealJingle.dispose(); runtime.revealJingle = null; }
  if (runtime.destructionAudio !== null) {
    runtime.destructionAudio.dispose();
    runtime.destructionAudio = null;
  }
  if (runtime.apartmentBleed !== null) {
    runtime.apartmentBleed.dispose();
    runtime.apartmentBleed = null;
  }
  if (runtime.overlay !== null && runtime.overlay.parentNode !== null) {
    runtime.overlay.parentNode.removeChild(runtime.overlay);
    runtime.overlay = null;
  }
}

/**
 * Full teardown — detaches every listener, cancels every timer, disposes
 * every chrome/audio handle. Called by SceneHandle.dispose() in the reverse-
 * allocation chain.
 */
function disposeDirector(runtime: DirectorRuntime): void {
  if (runtime.disposed) return;
  runtime.disposed = true;
  cancelFallback(runtime);
  if (runtime.eventHandler !== null) {
    document.removeEventListener('bang-fired', runtime.eventHandler);
    runtime.eventHandler = null;
  }
  runtime.escDispose?.();
  runtime.escDispose = null;
  if (!runtime.abortCtrl.signal.aborted) runtime.abortCtrl.abort();
  disposeSequenceArtifacts(runtime);
}

/* ------------------------------------------------------------------------ */
/* Internal helpers                                                         */
/* ------------------------------------------------------------------------ */

/**
 * Narrow `T | null` to `T` via runtime assertion. Used by the FSM step
 * helpers where the runtime fields are guaranteed non-null by the
 * sequence's ordering (prepareOverlay assigns before runFazSequence reads).
 */
function nonNull<T>(value: T | null): T {
  if (value === null) throw new Error('destruction-director: invariant violated — null artifact');
  return value;
}
