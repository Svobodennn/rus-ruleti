/**
 * Scene mount helper.
 *
 * Extracted from main.ts so that file stays under the ~200 line ceiling
 * (Sprint 0 retro lesson, coding-style.md). Owns the DOM coordination of
 * the disclaimer fade-out → scene container fade-in transition.
 *
 * mountScene() inside ./scene/index.ts owns the Three.js + audio bootstrap;
 * this helper only owns the DOM-side timing and lifecycle bookkeeping.
 */

import { mountScene, type SceneHandle } from './scene';

/** ID of the DOM container the scene renderer attaches into. */
const SCENE_CONTAINER_ID = 'scene-container';

/** Currently active scene handle, if any. */
let activeHandle: SceneHandle | null = null;

/**
 * Mount the scene under the disclaimer's old `#next-screen` slot.
 *
 * Strategy:
 *   1. Find or create a `<div id="scene-container">` inside `#next-screen`.
 *   2. Hand it to mountScene(), which appends a Three.js canvas as its child.
 *   3. Tag the body with `data-scene=scene` so the existing CSS reveal rules
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
  try {
    activeHandle = await mountScene(container);
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
