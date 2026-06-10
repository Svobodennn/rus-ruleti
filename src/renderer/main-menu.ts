/**
 * Main menu — entry screen (post-ship restore).
 *
 * A clean game-style menu overlaid on the dim lobby scene: a prominent
 * bilingual title plus BAŞLA (start) and ÇIKIŞ (quit) actions. This REPLACES
 * the removed Sprint 0 intro disclaimer (the "Bu bir şakadır" surface was
 * dropped in Sprint 9.1) and deliberately carries NO joke / disclaimer copy.
 *
 * Behaviour:
 *   - The scene mounts behind the menu, so the dim room reads through the
 *     scrim. The menu covers the viewport (pointer-events) until dismissed,
 *     so the revolver is not clickable while the menu is up.
 *   - BAŞLA: fade the menu out, dispose it, then call `onStart`. The click is
 *     also the AudioContext user-gesture — the ambient bed unlocks naturally.
 *   - ÇIKIŞ: `window.api.quit()` (IPC 'app:quit' → main app.quit()).
 *
 * Accessibility: real <button> elements, role=dialog + aria-modal, the start
 * button receives focus on mount, and the fade transition honours
 * prefers-reduced-motion (CSS gate in styles/main-menu.css).
 */

import type { RusRuletiApi } from '../shared/api-types';
import { resolveUserLocale, t } from './i18n/strings';

const FADE_OUT_MS = 320;

export interface MainMenuHandle {
  /** Remove the menu + detach listeners. Idempotent. */
  readonly dispose: () => void;
}

export interface MainMenuOptions {
  readonly api: RusRuletiApi;
  /** Host the menu is appended to (a sibling layer above the scene). */
  readonly host: HTMLElement;
  /** Called once, after BAŞLA dismisses the menu (scene becomes interactive). */
  readonly onStart: () => void;
}

interface MenuLabels {
  readonly primaryTitle: string;
  readonly cyrillicCaption: string;
  readonly startLabel: string;
  readonly quitLabel: string;
}

interface MenuDom {
  readonly root: HTMLElement;
  readonly startButton: HTMLButtonElement;
  readonly quitButton: HTMLButtonElement;
}

export function mountMainMenu(opts: MainMenuOptions): MainMenuHandle {
  const locale = resolveUserLocale();
  const dom = buildMenuDom({
    primaryTitle: t('menu.title', locale),
    cyrillicCaption: t('menu.title', 'ru'),
    startLabel: t('menu.start', locale),
    quitLabel: t('menu.quit', locale),
  });
  opts.host.appendChild(dom.root);
  return wireMenuInteractions(dom, opts);
}

function buildMenuDom(labels: MenuLabels): MenuDom {
  const root = document.createElement('section');
  root.id = 'main-menu';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', labels.primaryTitle);

  const titleWrap = document.createElement('div');
  titleWrap.className = 'main-menu__title';
  const heading = document.createElement('h1');
  heading.className = 'main-menu__title-primary';
  heading.textContent = labels.primaryTitle;
  const caption = document.createElement('p');
  caption.className = 'main-menu__title-caption';
  caption.textContent = labels.cyrillicCaption;
  caption.setAttribute('aria-hidden', 'true');
  titleWrap.append(heading, caption);

  const actions = document.createElement('div');
  actions.className = 'main-menu__actions';
  const startButton = buildButton(labels.startLabel, 'main-menu__btn--start');
  const quitButton = buildButton(labels.quitLabel, 'main-menu__btn--quit');
  actions.append(startButton, quitButton);

  root.append(titleWrap, actions);
  return { root, startButton, quitButton };
}

function wireMenuInteractions(
  dom: MenuDom,
  opts: MainMenuOptions,
): MainMenuHandle {
  let disposed = false;
  let fadeTimer = 0;
  const listeners = new AbortController();

  const dispose = (): void => {
    if (disposed) {
      return;
    }
    disposed = true;
    window.clearTimeout(fadeTimer);
    listeners.abort();
    dom.root.remove();
  };

  const onStart = (): void => {
    if (disposed) {
      return;
    }
    // Fade out first, then dispose + hand interaction to the scene.
    dom.root.classList.add('is-leaving');
    fadeTimer = window.setTimeout((): void => {
      dispose();
      opts.onStart();
    }, FADE_OUT_MS);
  };

  const onQuit = (): void => {
    try {
      opts.api.quit();
    } catch {
      /* quit IPC failure is non-fatal; nothing else to do in the renderer. */
    }
  };

  const sig = listeners.signal;
  dom.startButton.addEventListener('click', onStart, { signal: sig });
  dom.quitButton.addEventListener('click', onQuit, { signal: sig });
  requestAnimationFrame((): void => {
    if (!disposed) {
      dom.startButton.focus();
    }
  });

  return { dispose };
}

function buildButton(label: string, modifierClass: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `main-menu__btn ${modifierClass}`;
  button.textContent = label;
  return button;
}
