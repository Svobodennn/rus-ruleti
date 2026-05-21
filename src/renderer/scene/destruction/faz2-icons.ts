/**
 * Faz 2 desktop icon grid + sequential fade-out — Phase 2B (kraken-faz2-3).
 *
 * Spawns a 4x2 grid of 8 cosmetic icons at viewport top-left, then fades
 * each out sequentially starting at Faz 2 entry + 1000ms:
 *   - Per-icon fade: ICON_FADE_OUT_MS=200ms (CSS opacity transition).
 *   - Inter-icon delay: ICON_FADE_OUT_INTERVAL_MS=400ms.
 *   - Total dissolve: 8 * 400ms = 3.2s, finishing ~800ms before Faz 2 exit.
 *
 * Reduced-motion: `prefers-reduced-motion: reduce` → CSS @media disables
 * the transition; the icon disappears instantly when the `.is-fading`
 * class lands. The 400ms stagger is preserved per designer §8 row 16.
 *
 * Icons are designer-fictional colored squares with a single-letter
 * glyph (NOT real Apple/MS app icons — S6 risk closure).
 */

import {
  ICON_FADE_OUT_INTERVAL_MS,
  ICON_FADE_OUT_MS,
} from '../../../shared/scene-destruction-constants.js';
import type { OsVariant } from './types.js';

/* ------------------------------------------------------------------------ */
/* Public                                                                   */
/* ------------------------------------------------------------------------ */

export interface IconGridHandle {
  /** Begin the sequential fade-out (returns when last icon has faded). */
  readonly startFadeOut: () => Promise<void>;
  readonly dispose: () => void;
}

/**
 * Mount the icon grid + return a handle whose startFadeOut() kicks the
 * sequential dissolve. dispose() removes the grid and cancels any
 * pending fade timeouts.
 */
export function mountIconGrid(
  container: HTMLElement,
  os: OsVariant,
  signal: AbortSignal,
): IconGridHandle {
  const grid = createGridElement();
  const labels = os === 'mac' ? MAC_ICON_LABELS : WIN_ICON_LABELS;
  const icons: HTMLDivElement[] = [];
  for (const label of labels) {
    const icon = buildIconElement(label);
    grid.appendChild(icon);
    icons.push(icon);
  }
  container.appendChild(grid);

  const timeouts = new Set<number>();
  let aborted = false;
  const onAbort = (): void => {
    aborted = true;
    for (const id of timeouts) {
      window.clearTimeout(id);
    }
    timeouts.clear();
    grid.remove();
  };
  signal.addEventListener('abort', onAbort, { once: true });

  return {
    startFadeOut: (): Promise<void> =>
      runSequentialFade(icons, timeouts, () => aborted),
    dispose: (): void => {
      onAbort();
      signal.removeEventListener('abort', onAbort);
    },
  };
}

/* ------------------------------------------------------------------------ */
/* Sequencing                                                               */
/* ------------------------------------------------------------------------ */

function runSequentialFade(
  icons: readonly HTMLDivElement[],
  timeouts: Set<number>,
  isAborted: () => boolean,
): Promise<void> {
  return new Promise<void>((resolve): void => {
    icons.forEach((icon, idx): void => {
      const delay = idx * ICON_FADE_OUT_INTERVAL_MS;
      const id = window.setTimeout((): void => {
        if (isAborted()) {
          return;
        }
        icon.classList.add('is-fading');
      }, delay);
      timeouts.add(id);
    });
    /* Resolve once the last icon's transition has completed.
     * Last icon triggers at (length-1)*interval, then needs ICON_FADE_OUT_MS. */
    const resolveAfter = (icons.length - 1) * ICON_FADE_OUT_INTERVAL_MS + ICON_FADE_OUT_MS;
    const id = window.setTimeout((): void => resolve(), resolveAfter);
    timeouts.add(id);
  });
}

/* ------------------------------------------------------------------------ */
/* DOM builders                                                             */
/* ------------------------------------------------------------------------ */

function createGridElement(): HTMLDivElement {
  const grid = document.createElement('div');
  grid.classList.add('destruction-icon-grid');
  return grid;
}

function buildIconElement(label: string): HTMLDivElement {
  const icon = document.createElement('div');
  icon.classList.add('destruction-icon');
  const glyph = document.createElement('div');
  glyph.classList.add('destruction-icon__glyph');
  glyph.textContent = label.charAt(0).toUpperCase();
  const text = document.createElement('span');
  text.textContent = label;
  icon.appendChild(glyph);
  icon.appendChild(text);
  return icon;
}

/* ------------------------------------------------------------------------ */
/* Designer-fictional icon labels (per OS variant)                          */
/* ------------------------------------------------------------------------ */

const MAC_ICON_LABELS: readonly string[] = [
  'Finder',
  'Documents',
  'Pictures',
  'Desktop',
  'Mail',
  'Notes',
  'Trash',
  'Preferences',
];

const WIN_ICON_LABELS: readonly string[] = [
  'Explorer',
  'Documents',
  'Pictures',
  'Desktop',
  'Mail',
  'Edge',
  'Recycle Bin',
  'Settings',
];
