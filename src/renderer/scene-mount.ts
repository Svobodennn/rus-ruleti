/**
 * Scene mount helper.
 *
 * Extracted from main.ts so that file stays under the ~200 line ceiling
 * (Sprint 0 retro lesson, coding-style.md). Owns the DOM coordination of
 * the scene-container reveal — Sprint 9.1 removed the prior intro
 * disclaimer fade-out bridge, so the reveal now fires immediately on
 * #app bootstrap rather than after a Continue button click.
 *
 * mountScene() inside ./scene/index.ts owns the Three.js + audio bootstrap;
 * this helper only owns the DOM-side timing and lifecycle bookkeeping.
 *
 * Sprint 2 Phase 1: this module now also creates two sibling DIVs of
 * #scene-container — #hud-overlay and #bang-overlay (with .bang-flash and
 * .bang-black children). Both sit above the canvas and below the CRT
 * overlay (z-index documented in styles/base.css). They are forwarded to
 * mountScene so the revolver subsystem can mount its HUD into hud-overlay,
 * and Phase 2 frontend-dev can drive bang-overlay's flash/fade.
 */

import { mountScene, type SceneHandle } from './scene';

/** ID of the DOM container the scene renderer attaches into. */
const SCENE_CONTAINER_ID = 'scene-container';

/** Sibling overlays — created lazily by ensureOverlays(). */
const HUD_OVERLAY_ID = 'hud-overlay';
const BANG_OVERLAY_ID = 'bang-overlay';

/**
 * Sprint 6 — R-key restart binding for the Faz 8 son-ekran closing
 * tableau. Top-level keydown listener attached when the scene mounts;
 * the handler gates on
 * `destructionDirector.getState().kind === 'faz8-son-ekran'` so the R
 * key is INERT at every other point in the destruction sequence
 * (including the lobby, where the user may type R freely).
 *
 * KIOSK SAFETY (Risk S9 closure): the handler ONLY calls
 * `destructionDirector.requestRestart()` which mutates the FSM and
 * aborts the son-ekran signal. It does NOT call:
 *   - app.quit
 *   - BrowserWindow.close
 *   - window.api IPC exit channels (none exist; preload bridge has no
 *     exit surface)
 *   - process.exit
 * The joke app is a single-window kiosk — quitting would dump the
 * user back to their OS shell which kills the bit. Phase 3 QA smoke
 * MUST verify this by typing R outside son-ekran (no-op) + inside
 * son-ekran (restart cycle, window stays open).
 *
 * Risk S9 — kiosk-safe restart; verify Phase 3 QA smoke.
 */
const FAZ8_RESTART_KEY = 'r' as const;

/** Currently active scene handle, if any. */
let activeHandle: SceneHandle | null = null;

/** Sprint 6 — registered R-key listener (so beforeunload can detach). */
let activeRestartKeyDisposer: (() => void) | null = null;

/**
 * Mount the scene under the `#next-screen` slot (Sprint 9.1: created
 * directly by main.ts on bootstrap; pre-Sprint-9.1 this slot was the
 * disclaimer's dismiss target).
 *
 * Strategy:
 *   1. Find or create a `<div id="scene-container">` inside `#next-screen`.
 *   2. Find or create `<div id="hud-overlay">` + `<div id="bang-overlay">`
 *      as siblings of scene-container.
 *   3. Hand all three to mountScene(), which appends a Three.js canvas to
 *      scene-container and mounts the revolver HUD into hud-overlay.
 *   4. Tag the body with `data-scene=scene` so the existing CSS reveal rules
 *      still fire (main.ts also writes this for breadcrumb consistency).
 *
 * Idempotent — calling twice with an existing scene returns the same handle.
 */
export async function activateScene(
  nextScreen: HTMLElement,
): Promise<SceneHandle> {
  if (activeHandle !== null) {
    return activeHandle;
  }

  const container = ensureContainer(nextScreen);
  const { hud, bang } = ensureOverlays(nextScreen);
  try {
    activeHandle = await mountScene(container, hud, bang);
  } catch (err) {
    // Surfacing scene-mount failures: stash on DOM for devtools inspection.
    // We do not throw — Sprint 9.1 main.ts has already marked the
    // #next-screen slot active and the user should not see a broken
    // state. Future sprints add a graceful fallback (static image room)
    // when WebGL is unavailable.
    document.body.dataset['sceneError'] = String(err);
    throw err;
  }
  // Sprint 6 — wire the Faz 8 R-key restart binding now that the scene
  // (and therefore the destructionDirector) exists. The handler gates
  // on the FSM state so the R key is inert outside son-ekran.
  activeRestartKeyDisposer = installFaz8RestartKey(activeHandle);
  return activeHandle;
}

/**
 * Tear down the active scene (if any) and remove its container.
 *
 * Wired to the renderer's `beforeunload` listener so dev HMR doesn't leak
 * GPU buffers. Safe to call when no scene is active.
 */
export async function deactivateScene(): Promise<void> {
  if (activeHandle === null) {
    return;
  }
  // Sprint 6 — detach the R-key listener BEFORE the scene disposes
  // (the listener captures the SceneHandle reference; tearing the
  // scene down while the listener still observes window keydown would
  // leak a closure that points at a disposed director handle).
  if (activeRestartKeyDisposer !== null) {
    activeRestartKeyDisposer();
    activeRestartKeyDisposer = null;
  }
  await activeHandle.dispose();
  activeHandle = null;
}

/**
 * Sprint 6 — install the Faz 8 R-key restart binding.
 *
 * Top-level keydown listener on `window` that fires `requestRestart()`
 * on the destruction director ONLY when the FSM is in `faz8-son-ekran`.
 *
 * KIOSK SAFETY (Risk S9): the handler does NOT call any IPC exit
 * surface. Verify Phase 3 QA smoke by typing R both inside and
 * outside son-ekran.
 *
 * The destruction-director may be undefined on the scene handle when
 * the scene mount path does not allocate it (Sprint 5+ always does;
 * the optional `?` type modifier exists for forward-compat). The
 * handler guards on the field at firing time so a missing director
 * is a no-op rather than a runtime error.
 */
function installFaz8RestartKey(handle: SceneHandle): () => void {
  const onKeyDown = (ev: KeyboardEvent): void => {
    if (ev.key.toLowerCase() !== FAZ8_RESTART_KEY) return;
    const director = handle.destructionDirector;
    if (director === null || director === undefined) return;
    if (director.getState().kind !== 'faz8-son-ekran') return;
    // Risk S9 — kiosk-safe: requestRestart() only mutates FSM and
    // aborts the son-ekran signal. It does NOT touch app.quit or any
    // IPC exit channel.
    director.requestRestart();
  };
  window.addEventListener('keydown', onKeyDown);
  return (): void => window.removeEventListener('keydown', onKeyDown);
}

/** Find or lazily create the scene container under nextScreen. */
function ensureContainer(nextScreen: HTMLElement): HTMLElement {
  const existing = nextScreen.querySelector<HTMLElement>(
    `#${SCENE_CONTAINER_ID}`,
  );
  if (existing !== null) {
    return existing;
  }
  const div = document.createElement('div');
  div.id = SCENE_CONTAINER_ID;
  nextScreen.appendChild(div);
  return div;
}

/**
 * Find or lazily create the HUD + bang sibling overlays.
 *
 * Bang overlay has two children: `.bang-flash` (white) and `.bang-black`
 * (faded-in after the flash). Both start invisible; Phase 2 frontend-dev
 * drives them via CSS transitions / class toggles.
 *
 * Returns the freshly created (or existing) elements so the scene mount
 * step can forward them to the revolver subsystem.
 */
function ensureOverlays(nextScreen: HTMLElement): {
  hud: HTMLElement;
  bang: HTMLElement;
} {
  const hud = ensureHudOverlay(nextScreen);
  const bang = ensureBangOverlay(nextScreen);
  return { hud, bang };
}

/** Hud overlay DIV — sibling of #scene-container under #next-screen. */
function ensureHudOverlay(nextScreen: HTMLElement): HTMLElement {
  const existing = nextScreen.querySelector<HTMLElement>(`#${HUD_OVERLAY_ID}`);
  if (existing !== null) {
    return existing;
  }
  const div = document.createElement('div');
  div.id = HUD_OVERLAY_ID;
  div.className = 'hud-overlay';
  div.setAttribute('aria-hidden', 'true');
  nextScreen.appendChild(div);
  return div;
}

/** Bang overlay DIV — sibling of #scene-container, with flash + black children. */
function ensureBangOverlay(nextScreen: HTMLElement): HTMLElement {
  const existing = nextScreen.querySelector<HTMLElement>(`#${BANG_OVERLAY_ID}`);
  if (existing !== null) {
    return existing;
  }
  const div = document.createElement('div');
  div.id = BANG_OVERLAY_ID;
  div.className = 'bang-overlay';
  div.setAttribute('aria-hidden', 'true');
  const flash = document.createElement('div');
  flash.className = 'bang-flash';
  const black = document.createElement('div');
  black.className = 'bang-black';
  div.append(flash, black);
  nextScreen.appendChild(div);
  return div;
}
