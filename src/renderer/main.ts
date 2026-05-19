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

  // ESC-hold visual feedback.
  mountEscapeHatch(api);

  // i18n: hydrate the disclaimer placeholder with bilingual copy.
  hydrateDisclaimer();
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

  // Build subtree. Using createElement (not innerHTML) so we never have to
  // worry about CSP / sanitization of localised strings.
  const headlineRu = document.createElement('h1');
  headlineRu.className = 'headline-ru';
  headlineRu.lang = 'ru';
  headlineRu.textContent = t('disclaimer.headline', 'ru');

  const headlineTr = document.createElement('p');
  headlineTr.className = 'headline-tr';
  headlineTr.lang = 'tr';
  headlineTr.textContent = t('disclaimer.headline', 'tr');

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

  const continueButton = document.createElement('button');
  continueButton.className = 'continue';
  continueButton.type = 'button';
  // aria-label is the TR label only (screen-reader friendly for the operator).
  continueButton.setAttribute('aria-label', t('disclaimer.continueButton', 'tr'));

  const continueRu = document.createElement('span');
  continueRu.className = 'continue-ru';
  continueRu.lang = 'ru';
  continueRu.textContent = t('disclaimer.continueButton', 'ru');

  const continueSep = document.createElement('span');
  continueSep.className = 'continue-sep';
  continueSep.setAttribute('aria-hidden', 'true');
  continueSep.textContent = '/';

  const continueTr = document.createElement('span');
  continueTr.className = 'continue-tr';
  continueTr.lang = 'tr';
  continueTr.textContent = t('disclaimer.continueButton', 'tr');

  continueButton.append(continueRu, continueSep, continueTr);
  continueButton.addEventListener('click', () => {
    advancePastDisclaimer(slot);
  });

  slot.replaceChildren(headlineRu, headlineTr, body, continueButton);

  // Reveal — the CSS fades from 0 to 1.
  // Use rAF so the browser definitely sees the class transition.
  requestAnimationFrame(() => {
    slot.classList.add('is-revealed');
    // Focus the button so Enter / Space advance the user (and screen readers
    // hear the bilingual content immediately).
    continueButton.focus();
  });
}

/**
 * Advance past the intro disclaimer. Sprint 0 stub: collapse the disclaimer,
 * reveal an empty placeholder next-screen, and emit a single dev breadcrumb.
 *
 * Sprint 2 will replace `#next-screen` with the lobby scene mount.
 */
function advancePastDisclaimer(disclaimer: HTMLElement): void {
  disclaimer.classList.add('is-dismissed');

  // Build (or reveal) the placeholder next screen. We create it lazily here
  // so Sprint 2 can swap in the lobby without touching index.html.
  let next = document.querySelector<HTMLElement>('#next-screen');
  if (next === null) {
    // Sprint 0: empty placeholder section. Sprint 2 mounts the lobby scene
    // here (3D canvas, HUD, revolver). Intentionally no copy here — any
    // visible text must route through i18n/strings.ts.
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

  // A breadcrumb for devtools / main-process log scraping. Console is banned
  // by eslint in renderer source, so we use a DOM dataset marker instead.
  document.body.dataset.scene = 'next-screen';
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
