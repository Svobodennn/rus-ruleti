/**
 * Faz 2 notification toast spawner — Phase 2B (kraken-faz2-3).
 *
 * Spawns toasts at TOAST_SPAWN_INTERVAL_MS=1000ms cadence using the
 * TOAST_MESSAGES_MAC / TOAST_MESSAGES_WIN key rotations. Each toast:
 *   - Slides in over TOAST_SLIDE_IN_DURATION_MS=300ms (CSS transition).
 *   - Visible for TOAST_LIFETIME_MS=4000ms.
 *   - Slides out reverse of slide-in.
 *
 * Lane E (i18n-expert) wires the STRINGS.destruction.toast.* subtree in
 * parallel. We resolve keys via a permissive lookup that falls back to
 * the key literal if Lane E has not yet wired it (typecheck-friendly:
 * we cast to LocaleKey because the destruction subtree is added by Lane E).
 *
 * Reduced-motion gate is handled CSS-side (destruction.css @media block);
 * the JS spawner unchanged.
 */

import {
  TOAST_LIFETIME_MS,
  TOAST_MESSAGES_MAC,
  TOAST_MESSAGES_WIN,
  TOAST_SLIDE_IN_DURATION_MS,
  TOAST_SPAWN_INTERVAL_MS,
} from '../../../shared/scene-destruction-constants.js';
import { t, type Locale, type LocaleKey } from '../../i18n/strings.js';
import type { OsVariant } from './types.js';

/* ------------------------------------------------------------------------ */
/* Public                                                                   */
/* ------------------------------------------------------------------------ */

export interface ToastSpawnerHandle {
  readonly dispose: () => void;
}

export interface ToastSpawnerArgs {
  readonly os: OsVariant;
  readonly container: HTMLElement;
  readonly locale: Locale;
  readonly signal: AbortSignal;
}

/**
 * Start spawning toasts at the SSOT cadence. Spawning stops automatically
 * when the rotation completes; dispose() removes any currently-visible
 * toasts and cancels pending timeouts.
 */
export function startToastSpawner(args: ToastSpawnerArgs): ToastSpawnerHandle {
  const keys = args.os === 'mac' ? TOAST_MESSAGES_MAC : TOAST_MESSAGES_WIN;
  const variant = args.os;
  const liveToasts = new Set<HTMLElement>();
  const timeouts = new Set<number>();
  let aborted = false;

  const onAbort = (): void => {
    aborted = true;
    for (const id of timeouts) {
      window.clearTimeout(id);
    }
    timeouts.clear();
    for (const el of liveToasts) {
      el.remove();
    }
    liveToasts.clear();
  };
  args.signal.addEventListener('abort', onAbort, { once: true });

  scheduleAllToasts(keys, args, variant, liveToasts, timeouts, () => aborted);

  return {
    dispose: (): void => {
      onAbort();
      args.signal.removeEventListener('abort', onAbort);
    },
  };
}

/* ------------------------------------------------------------------------ */
/* Scheduling                                                               */
/* ------------------------------------------------------------------------ */

function scheduleAllToasts(
  keys: readonly string[],
  args: ToastSpawnerArgs,
  variant: OsVariant,
  liveToasts: Set<HTMLElement>,
  timeouts: Set<number>,
  isAborted: () => boolean,
): void {
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key === undefined) {
      continue;
    }
    const delay = i * TOAST_SPAWN_INTERVAL_MS;
    const id = window.setTimeout((): void => {
      if (isAborted()) {
        return;
      }
      spawnSingleToast(key, args, variant, liveToasts, timeouts, isAborted);
    }, delay);
    timeouts.add(id);
  }
}

function spawnSingleToast(
  key: string,
  args: ToastSpawnerArgs,
  variant: OsVariant,
  liveToasts: Set<HTMLElement>,
  timeouts: Set<number>,
  isAborted: () => boolean,
): void {
  const toast = buildToastElement(key, args.locale, variant, liveToasts.size);
  args.container.appendChild(toast);
  liveToasts.add(toast);
  /* Force reflow so transition fires reliably on the next frame. */
  void toast.offsetWidth;
  toast.classList.add('is-visible');
  const removeId = window.setTimeout((): void => {
    if (isAborted()) {
      return;
    }
    toast.classList.remove('is-visible');
    const cleanupId = window.setTimeout((): void => {
      toast.remove();
      liveToasts.delete(toast);
    }, TOAST_SLIDE_IN_DURATION_MS);
    timeouts.add(cleanupId);
  }, TOAST_LIFETIME_MS);
  timeouts.add(removeId);
}

/* ------------------------------------------------------------------------ */
/* DOM construction                                                         */
/* ------------------------------------------------------------------------ */

function buildToastElement(
  key: string,
  locale: Locale,
  variant: OsVariant,
  stackIndex: number,
): HTMLDivElement {
  const toast = document.createElement('div');
  toast.classList.add(
    'destruction-toast',
    variant === 'mac' ? 'destruction-toast--mac' : 'destruction-toast--win',
  );
  toast.dataset['toastKey'] = key;
  applyStackOffset(toast, variant, stackIndex);
  toast.appendChild(buildToastIcon());
  const body = document.createElement('div');
  body.classList.add('destruction-toast__body');
  const title = document.createElement('div');
  title.classList.add('destruction-toast__title');
  title.textContent = lookupString(`${key}.title`, locale, deriveFallbackTitle(key));
  const message = document.createElement('div');
  message.classList.add('destruction-toast__message');
  message.textContent = lookupString(`${key}.body`, locale, deriveFallbackBody(key));
  body.appendChild(title);
  body.appendChild(message);
  toast.appendChild(body);
  return toast;
}

function applyStackOffset(
  toast: HTMLDivElement,
  variant: OsVariant,
  stackIndex: number,
): void {
  const stackGap = 92; /* toast height 80 + 12px gutter */
  if (variant === 'mac') {
    toast.style.top = `${40 + stackIndex * stackGap}px`;
  } else {
    toast.style.bottom = `${64 + stackIndex * stackGap}px`;
  }
}

function buildToastIcon(): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '28');
  svg.setAttribute('height', '28');
  svg.setAttribute('viewBox', '0 0 28 28');
  svg.classList.add('destruction-toast__icon');
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '14');
  circle.setAttribute('cy', '14');
  circle.setAttribute('r', '12');
  circle.setAttribute('fill', '#E04A4A');
  const bang = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  bang.setAttribute('d', 'M14 7 L14 17 M14 20 L14 22');
  bang.setAttribute('stroke', '#FFFFFF');
  bang.setAttribute('stroke-width', '2.5');
  bang.setAttribute('stroke-linecap', 'round');
  svg.appendChild(circle);
  svg.appendChild(bang);
  return svg;
}

/* ------------------------------------------------------------------------ */
/* i18n lookup (Lane E key resolution + fallback)                           */
/* ------------------------------------------------------------------------ */

/**
 * Resolve a destruction.* key, falling back to the supplied literal if
 * Lane E (i18n-expert) has not wired the key yet. We cast to LocaleKey
 * because `t()` is strict-typed but the destruction subtree is added
 * by Lane E in parallel.
 */
function lookupString(key: string, locale: Locale, fallback: string): string {
  const resolved = t(key as LocaleKey, locale);
  return resolved === key ? fallback : resolved;
}

function deriveFallbackTitle(key: string): string {
  const tail = key.split('.').pop() ?? key;
  return humanise(tail);
}

function deriveFallbackBody(key: string): string {
  const tail = key.split('.').pop() ?? key;
  return `System notification: ${humanise(tail)}`;
}

function humanise(camelCase: string): string {
  return camelCase
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c): string => c.toUpperCase())
    .trim();
}
