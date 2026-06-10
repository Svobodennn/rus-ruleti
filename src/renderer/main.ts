/**
 * Renderer entry.
 *
 * Sprint 9.1 removed the intro disclaimer surface; the scene then mounted
 * directly on bootstrap. Post-ship restore adds a clean main-menu entry
 * screen (title + BAŞLA + ÇIKIŞ, NO joke/disclaimer copy — see main-menu.ts).
 *
 * Bootstrap order:
 *   1. Assert window.api exists (preload bridge must be wired).
 *   2. Ask main for OS family, inject body class `os-mac` | `os-win`.
 *   3. Mount the ESC-hold indicator.
 *   4. Mount the scene under #app (dim lobby), then overlay the main menu.
 *   5. BAŞLA dismisses the menu → scene interactive; ÇIKIŞ → api.quit().
 *
 * AudioContext note: Sprint 0 used the disclaimer's Continue button click as
 * the user-gesture ticket for `AudioContext.resume()`. The main menu restores
 * that contract — the BAŞLA click is the gesture that unlocks audio. Until
 * then the AudioContext stays suspended (Chromium autoplay policy); the scene
 * mounts behind the menu but produces no audible content before BAŞLA, and the
 * first cue (Faz 0 BANG) waits on the revolver trigger gesture anyway.
 */

import type { RusRuletiApi } from '../shared/api-types';
import { mountEscapeHatch } from './escape-hatch';
import { mountMainMenu } from './main-menu';
import { activateScene, deactivateScene } from './scene-mount';

declare global {
  interface Window {
    api: RusRuletiApi;
  }
}

async function bootstrap(): Promise<void> {
  const api = window.api;
  if (api === undefined) {
    // Preload failed to load — render a minimal error and abort.
    document.body.textContent = 'Preload bridge missing.';
    return;
  }

  // OS class injection.
  try {
    const os = await api.getOS();
    document.body.classList.add(`os-${os}`);
  } catch (err) {
    // Non-fatal. Log to stderr via DOM so devtools shows it without console.
    document.body.dataset.osError = String(err);
  }

  // ESC-hold visual feedback. Disposer is wired to beforeunload below so
  // dev HMR doesn't accumulate keyboard listeners across reloads.
  const disposeEscapeHatch = mountEscapeHatch(api);

  // Post-ship restore: mount the scene first (the dim lobby renders behind),
  // then overlay the main menu. The menu covers the viewport (pointer-events)
  // until the user clicks BAŞLA — at which point it fades out and the scene
  // (revolver) becomes interactive. The BAŞLA click is also the AudioContext
  // user-gesture, so the ambient bed / cues unlock then. The scene-container
  // under #app keeps the legacy `#next-screen` slot id so the base.css reveal
  // rules continue to fire; the menu is a separate sibling overlay so it never
  // alters the scene DOM the destruction sequence / e2e selectors rely on.
  const appHost = document.querySelector<HTMLElement>('#app') ?? document.body;
  mountSceneIntoApp();
  const menu = mountMainMenu({
    api,
    host: appHost,
    onStart: (): void => {
      // Menu dismissed; the scene canvas is now interactive. Breadcrumb for
      // devtools (mirrors the document.body.dataset.scene contract).
      document.body.dataset.menu = 'dismissed';
    },
  });

  // Wire scene + escape-hatch + menu teardown to beforeunload so dev HMR /
  // window close doesn't leak WebGL contexts, audio nodes, or listeners.
  window.addEventListener('beforeunload', () => {
    menu.dispose();
    disposeEscapeHatch();
    void deactivateScene();
  });
}

/**
 * Mount the scene into a #next-screen slot under #app.
 *
 * The `#next-screen` id is preserved from the Sprint 0 layout so the existing
 * CSS reveal rules in `styles/base.css` (`#next-screen.is-active { display:
 * flex }`) continue to fire and the scene-container fade-in animation
 * remains intact. We immediately mark it `.is-active` so the section
 * occupies the viewport without the prior disclaimer-dismiss bridge.
 *
 * Errors are surfaced via document.body.dataset.sceneError (same pattern
 * Sprint 0 used) — they go to devtools rather than throwing into the
 * top-level event loop. Sprint 2 added a graceful WebGL-unavailable
 * fallback inside scene-mount; Sprint 9.1 keeps that contract intact.
 */
function mountSceneIntoApp(): void {
  let next = document.querySelector<HTMLElement>('#next-screen');
  if (next === null) {
    next = document.createElement('section');
    next.id = 'next-screen';
    next.setAttribute('aria-hidden', 'true');
    const app = document.querySelector<HTMLElement>('#app');
    if (app !== null) {
      app.appendChild(next);
    } else {
      document.body.appendChild(next);
    }
  }
  next.classList.add('is-active');

  // Breadcrumb for devtools (matches Sprint 0 main.ts contract).
  document.body.dataset.scene = 'scene';

  // Mount the Three.js scene. Errors are swallowed by activateScene() —
  // they go to document.body.dataset.sceneError for inspection. The promise
  // is intentionally discarded; a future sprint can `await` this to add a
  // first-frame loading indicator.
  void activateScene(next);
}

// `document.readyState` may already be 'interactive' or 'complete' by the time
// this script runs since it's a <script type="module"> at the bottom of body.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    void bootstrap();
  });
} else {
  void bootstrap();
}
