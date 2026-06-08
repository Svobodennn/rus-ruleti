/**
 * Renderer entry.
 *
 * Sprint 9.1 — Intro disclaimer surface REMOVED post-ship.
 *
 * Bootstrap order:
 *   1. Assert window.api exists (preload bridge must be wired).
 *   2. Ask main for OS family, inject body class `os-mac` | `os-win`.
 *   3. Mount the ESC-hold indicator.
 *   4. Mount the scene directly under #app (no Continue gate).
 *
 * AudioContext note: Sprint 0 used the disclaimer's Continue button click as
 * the user-gesture ticket for `AudioContext.resume()`. With the disclaimer
 * removed, the renderer creates the scene immediately and the AudioContext
 * stays suspended until the first user interaction (revolver trigger click,
 * keydown, etc.) — Chromium's autoplay policy allows the resume call to
 * succeed silently once a real user gesture lands. The scene mount never
 * blocks on audio readiness; the first audible cue (Faz 0 BANG) waits on
 * the trigger gesture anyway, so no audible content is missed.
 */

import type { RusRuletiApi } from '../shared/api-types';
import { mountEscapeHatch } from './escape-hatch';
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

  // Wire scene + escape-hatch teardown to beforeunload so dev HMR / window
  // close doesn't leak WebGL contexts, audio nodes, or keyboard listeners.
  window.addEventListener('beforeunload', () => {
    disposeEscapeHatch();
    void deactivateScene();
  });

  // Sprint 9.1 — mount the scene directly. The disclaimer→Continue gate is
  // removed; the renderer presents the lobby on launch with no intermediate
  // surface. The scene-container under #app is created lazily by
  // scene-mount.ts (it preserves the legacy `#next-screen` slot id so the
  // existing CSS reveal rules in base.css continue to fire).
  mountSceneIntoApp();
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
