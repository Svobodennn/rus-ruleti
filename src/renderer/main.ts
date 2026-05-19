/**
 * Renderer entry.
 *
 * Bootstrap order:
 *   1. Assert window.api exists (preload bridge must be wired).
 *   2. Ask main for OS family, inject body class `os-mac` | `os-win`.
 *   3. Mount the ESC-hold indicator.
 *   4. Hydrate the intro disclaimer (bilingual RU + TR).
 */

import type { RusRuletiApi } from '../shared/api-types';
import { mountEscapeHatch } from './escape-hatch';
import { activateScene, deactivateScene } from './scene-mount';
import { t } from './i18n/strings';

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

  // i18n: hydrate the disclaimer placeholder with bilingual copy.
  hydrateDisclaimer();
}

/** Build the RU primary headline and TR caption-size sibling. */
function buildHeadline(): { ru: HTMLElement; tr: HTMLElement } {
  const ru = document.createElement('h1');
  ru.className = 'headline-ru';
  ru.lang = 'ru';
  ru.textContent = t('disclaimer.headline', 'ru');

  const tr = document.createElement('p');
  tr.className = 'headline-tr';
  tr.lang = 'tr';
  tr.textContent = t('disclaimer.headline', 'tr');

  return { ru, tr };
}

/** Build the bilingual body block (3 lines each locale). */
function buildBody(): HTMLElement {
  const body = document.createElement('div');
  body.className = 'body';

  const bodyRu = document.createElement('div');
  bodyRu.className = 'body-ru';
  bodyRu.lang = 'ru';
  bodyRu.textContent = [
    t('disclaimer.bodyLine1', 'ru'),
    t('disclaimer.bodyLine2', 'ru'),
    t('disclaimer.bodyLine3', 'ru'),
  ].join(' ');

  const bodyTr = document.createElement('div');
  bodyTr.className = 'body-tr';
  bodyTr.lang = 'tr';
  bodyTr.textContent = [
    t('disclaimer.bodyLine1', 'tr'),
    t('disclaimer.bodyLine2', 'tr'),
    t('disclaimer.bodyLine3', 'tr'),
  ].join(' ');

  body.append(bodyRu, bodyTr);
  return body;
}

/** Build the continue button with RU + TR text and click handler. */
function buildContinueButton(onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'continue';
  button.type = 'button';
  // aria-label is the TR label only (screen-reader friendly for the operator).
  button.setAttribute('aria-label', t('disclaimer.continueButton', 'tr'));

  const ruSpan = document.createElement('span');
  ruSpan.className = 'continue-ru';
  ruSpan.lang = 'ru';
  ruSpan.textContent = t('disclaimer.continueButton', 'ru');

  const sep = document.createElement('span');
  sep.className = 'continue-sep';
  sep.setAttribute('aria-hidden', 'true');
  sep.textContent = '/';

  const trSpan = document.createElement('span');
  trSpan.className = 'continue-tr';
  trSpan.lang = 'tr';
  trSpan.textContent = t('disclaimer.continueButton', 'tr');

  button.append(ruSpan, sep, trSpan);
  button.addEventListener('click', onClick);
  return button;
}

/**
 * Build the intro disclaimer DOM and wire the continue button.
 *
 * The `<section id="disclaimer" data-i18n-slot="intro">` placeholder is
 * authored in index.html; we fill it imperatively so all visible copy stays
 * in `i18n/strings.ts` (no Cyrillic hardcoded in HTML).
 *
 * After the user clicks Continue we mark the disclaimer dismissed and reveal
 * a placeholder `#next-screen` — Sprint 2 replaces this with the lobby.
 */
function hydrateDisclaimer(): void {
  const slot = document.querySelector<HTMLElement>('#disclaimer[data-i18n-slot="intro"]');
  if (slot === null) {
    // Index.html is the source of truth; if the placeholder is gone we want
    // to know about it loudly during development. In production a missing
    // disclaimer is also a bug — log via DOM so it shows in devtools.
    document.body.dataset.disclaimerError = 'missing-slot';
    return;
  }

  const { ru: hRu, tr: hTr } = buildHeadline();
  const body = buildBody();
  const button = buildContinueButton(() => { advancePastDisclaimer(slot); });

  slot.replaceChildren(hRu, hTr, body, button);

  // Reveal — the CSS fades from 0 to 1.
  // Use rAF so the browser definitely sees the class transition.
  requestAnimationFrame(() => {
    slot.classList.add('is-revealed');
    // Focus the button so Enter / Space advance the user (and screen readers
    // hear the bilingual content immediately).
    button.focus();
  });
}

/**
 * Advance past the intro disclaimer. Sprint 1: collapse the disclaimer,
 * reveal the scene container, and kick off the Three.js mount.
 *
 * The user-click that fires this is also the user gesture the AudioContext
 * needs to come out of suspended state — see scene/audio/audio-bed.ts.
 */
function advancePastDisclaimer(disclaimer: HTMLElement): void {
  disclaimer.classList.add('is-dismissed');

  // Build (or reveal) the next-screen section. We create it lazily here
  // so HTML doesn't need to know about Sprint-specific mounts.
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

  // Breadcrumb for devtools.
  document.body.dataset.scene = 'scene';

  // Mount the Three.js scene. Errors are swallowed by activateScene() —
  // they go to document.body.dataset.sceneError for inspection. The promise
  // is discarded; Sprint 2 will await this to add a loading indicator.
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
