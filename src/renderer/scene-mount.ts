/**
 * Scene mount helper.
 *
 * Extracted from main.ts so that file stays under the ~200 line ceiling
 * (Sprint 0 retro lesson, coding-style.md). Owns the DOM coordination of
 * the disclaimer fade-out → scene container fade-in transition.
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

/** Currently active scene handle, if any. */
let activeHandle: SceneHandle | null = null;

/**
 * Mount the scene under the disclaimer's old `#next-screen` slot.
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
    // We do not throw — the disclaimer flow has already advanced and the
    // user should not see a broken state. Future sprints add a graceful
    // fallback (static image room) when WebGL is unavailable.
    document.body.dataset['sceneError'] = String(err);
    throw err;
  }
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
  await activeHandle.dispose();
  activeHandle = null;
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
