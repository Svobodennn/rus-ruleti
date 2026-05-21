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
 *   d. Steps through faz0 → faz1 → faz2 → faz3 by awaiting each runner,
 *      threading an AbortSignal so ESC-hold short-circuits mid-Faz.
 *   e. Disposes everything in reverse-allocation order.
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
import { runFaz0 } from './faz0-bang.js';
import { runFaz1 } from './faz1-critical-dialog.js';
import { runFaz2 } from './faz2-takeover.js';
import { runFaz3 } from './faz3-terminal.js';
import { startFaz4FileWipe } from './faz4-file-wipe.js';
import { startFaz5DiskFormat } from './faz5-disk-format.js';
import { startFaz6Bsod } from './faz6-bsod.js';
import { startFaz7Bootloop } from './faz7-bootloop.js';
import { mountApartmentBleedOverlay } from './apartment-bleed.js';
import type { ApartmentBleedHandle, DestructionDirectorHandle, OsVariant } from './types.js';

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
  destructionAudio: DestructionAudioHandle | null;
  apartmentBleed: ApartmentBleedHandle | null;
  overlay: HTMLElement | null;
  fallbackTimer: ReturnType<typeof setTimeout> | null;
  observer: MutationObserver | null;
  escDispose: (() => void) | null;
  eventHandler: ((ev: Event) => void) | null;
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
    started: false,
    disposed: false,
    abortCtrl: new AbortController(),
    destructionAudio: null,
    apartmentBleed: null,
    overlay: null,
    fallbackTimer: null,
    observer: null,
    escDispose: null,
    eventHandler: null,
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
  runtime: DirectorRuntime,
  deps: DestructionDirectorDeps,
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
  runtime: DirectorRuntime,
  deps: DestructionDirectorDeps,
): void {
  runtime.fallbackTimer = setTimeout((): void => {
    if (runtime.started || runtime.disposed) return;
    const overlay = document.querySelector('.bang-overlay');
    if (overlay === null) return;
    runtime.observer = new MutationObserver(
      (): void => observeBangOverlay(runtime, overlay, deps),
    );
    runtime.observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
  }, FALLBACK_DETECTION_TIMEOUT_MS);
}

/** MutationObserver callback — fires the sequence if `is-fired` is present. */
function observeBangOverlay(
  runtime: DirectorRuntime,
  overlay: Element,
  deps: DestructionDirectorDeps,
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
  runtime.escDispose = window.api.onEscapeHold(
    (): void => undefined,
    (): void => abortSequence(runtime, 'esc-hold'),
  );
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
  runtime: DirectorRuntime,
  deps: DestructionDirectorDeps,
): Promise<void> {
  runtime.overlay = createOverlayElement();
  document.body.appendChild(runtime.overlay);
  runtime.apartmentBleed = mountApartmentBleedOverlay(deps.lobbySnapshotGetter());
  runtime.destructionAudio = mountDestructionAudio({
    context: deps.audio.context,
    master: deps.audio.master,
    insertGlobalFilter: deps.audio.insertGlobalFilter,
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
  await runFaz1({
    os,
    container: nonNull(runtime.overlay),
    destructionAudio: nonNull(runtime.destructionAudio),
    signal,
  });
  if (signal.aborted) return;
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
  await runFaz3({
    os,
    username,
    container: nonNull(runtime.overlay),
    apartmentBleed,
    signal,
  });
  if (signal.aborted) return;
  await runFaz4Through7(runtime, os);
}

/**
 * Sprint 5 — Run faz4 (file wipe) → faz5 (disk format) → faz6 (BSOD /
 * kernel panic) → faz7 (bootloop). Each runner respects the abort signal
 * + threads through the destruction overlay container. faz7 is the
 * terminal active phase — Sprint 6 will add the faz8 reveal hand-off.
 *
 * Extracted from runFazTakeoverAndTerminal to stay under the 50-line
 * ESLint cap (max-lines-per-function).
 */
async function runFaz4Through7(
  runtime: DirectorRuntime,
  os: OsVariant,
): Promise<void> {
  const signal = runtime.abortCtrl.signal;
  const container = nonNull(runtime.overlay);
  await startFaz4FileWipe({ os, container, signal });
  if (signal.aborted) return;
  await startFaz5DiskFormat({ os, container, signal });
  if (signal.aborted) return;
  await startFaz6Bsod({ os, container, signal });
  if (signal.aborted) return;
  await startFaz7Bootloop({ os, container, signal });
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
  runtime.abortCtrl.abort();
  disposeSequenceArtifacts(runtime);
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
  if (runtime.escDispose !== null) {
    runtime.escDispose();
    runtime.escDispose = null;
  }
  if (!runtime.abortCtrl.signal.aborted) {
    runtime.abortCtrl.abort();
  }
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
  if (value === null) {
    throw new Error('destruction-director: invariant violated — null artifact');
  }
  return value;
}
