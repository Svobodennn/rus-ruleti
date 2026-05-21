/**
 * Win11 bottom taskbar mimik — Phase 2B (kraken-faz2-3 owner).
 *
 *   - TASKBAR_WIN_HEIGHT_PX (48px) bar at bottom of viewport.
 *   - Dark acrylic background (designer-fictional, NO real Win11 PNG).
 *   - Win11 four-square procedural SVG logo center-aligned (PLAN §8 spec
 *     — Win11 is center-justified). Lane B simplification: single
 *     #0078D4 → #005FB8 gradient applied to all four squares; Lane D's
 *     win-dialog will have the precise per-square geometry.
 *   - Cosmetic search bar middle (no input handler).
 *   - System tray: WiFi + volume glyph + live clock HH:MM (designer §4
 *     specifies per-minute updates on Win), date below.
 *
 * Reduced-motion: only the clock interval moves (text content swap),
 * no animation surface — designer §8 row 12 unchanged.
 */

import { TASKBAR_WIN_HEIGHT_PX } from '../../../../shared/scene-destruction-constants.js';
import type { WinTaskbarHandle } from '../types.js';

/* ------------------------------------------------------------------------ */
/* Public                                                                   */
/* ------------------------------------------------------------------------ */

export function mountWinTaskbar(container: HTMLElement): WinTaskbarHandle {
  const bar = createBarElement();
  const clock = createClockElement();
  bar.appendChild(buildLeftCluster());
  bar.appendChild(buildCenterCluster());
  bar.appendChild(buildRightCluster(clock));
  container.appendChild(bar);

  /* Win11 native taskbar clock updates per minute. Designer §4 specifies
   * 1/60Hz cadence. setInterval at 60000ms is enough granularity. */
  const interval = window.setInterval((): void => {
    setClockContent(clock, new Date());
  }, 60000);

  let disposed = false;
  return {
    dispose: (): void => {
      if (disposed) {
        return;
      }
      disposed = true;
      window.clearInterval(interval);
      bar.remove();
    },
  };
}

/* ------------------------------------------------------------------------ */
/* Builders                                                                 */
/* ------------------------------------------------------------------------ */

function createBarElement(): HTMLDivElement {
  const bar = document.createElement('div');
  bar.classList.add('win-taskbar');
  bar.style.height = `${TASKBAR_WIN_HEIGHT_PX}px`;
  return bar;
}

function createClockElement(): HTMLSpanElement {
  const span = document.createElement('span');
  span.classList.add('win-taskbar__clock');
  setClockContent(span, new Date());
  return span;
}

function buildLeftCluster(): HTMLDivElement {
  const left = document.createElement('div');
  left.classList.add('win-taskbar__left');
  /* Center on Win11 is reserved for the four-square logo + pinned apps.
   * Left cluster is intentionally near-empty to preserve the Win11
   * center-justified illusion. */
  return left;
}

function buildCenterCluster(): HTMLDivElement {
  const center = document.createElement('div');
  center.classList.add('win-taskbar__center');
  center.appendChild(buildFourSquareLogo());
  center.appendChild(buildSearchBar());
  return center;
}

function buildSearchBar(): HTMLDivElement {
  const search = document.createElement('div');
  search.classList.add('win-taskbar__search');
  search.textContent = 'Search';
  return search;
}

function buildRightCluster(clock: HTMLSpanElement): HTMLDivElement {
  const right = document.createElement('div');
  right.classList.add('win-taskbar__right');
  right.appendChild(buildWifiGlyph());
  right.appendChild(buildVolumeGlyph());
  right.appendChild(clock);
  return right;
}

/* ------------------------------------------------------------------------ */
/* SVG glyphs (designer-fictional silhouettes)                              */
/* ------------------------------------------------------------------------ */

function buildFourSquareLogo(): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '20');
  svg.setAttribute('height', '20');
  svg.setAttribute('viewBox', '0 0 20 20');
  /* Designer-fictional gradient: single #0078D4 → #005FB8 ramp applied
   * to all four squares (NOT four colors as in real Microsoft logo).
   * Lane D's win-dialog has the precise variant. */
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const grad = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'linearGradient',
  );
  grad.setAttribute('id', 'win-taskbar-logo-grad');
  grad.setAttribute('x1', '0');
  grad.setAttribute('y1', '0');
  grad.setAttribute('x2', '1');
  grad.setAttribute('y2', '1');
  const stopA = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stopA.setAttribute('offset', '0%');
  stopA.setAttribute('stop-color', '#0078D4');
  const stopB = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stopB.setAttribute('offset', '100%');
  stopB.setAttribute('stop-color', '#005FB8');
  grad.appendChild(stopA);
  grad.appendChild(stopB);
  defs.appendChild(grad);
  svg.appendChild(defs);
  appendSquareRects(svg);
  return svg;
}

function appendSquareRects(svg: SVGElement): void {
  const fill = 'url(#win-taskbar-logo-grad)';
  const positions: ReadonlyArray<[number, number]> = [
    [2, 2],
    [11, 2],
    [2, 11],
    [11, 11],
  ];
  for (const [x, y] of positions) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(x));
    rect.setAttribute('y', String(y));
    rect.setAttribute('width', '7');
    rect.setAttribute('height', '7');
    rect.setAttribute('fill', fill);
    svg.appendChild(rect);
  }
}

function buildWifiGlyph(): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '12');
  svg.setAttribute('viewBox', '0 0 16 12');
  const arcs: readonly string[] = [
    'M2 8 Q8 3 14 8',
    'M5 10 Q8 7 11 10',
  ];
  for (const d of arcs) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', '#FFFFFF');
    path.setAttribute('stroke-width', '1.4');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    svg.appendChild(path);
  }
  return svg;
}

function buildVolumeGlyph(): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '14');
  svg.setAttribute('height', '14');
  svg.setAttribute('viewBox', '0 0 14 14');
  const speaker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  speaker.setAttribute('d', 'M2 5 L5 5 L8 2 L8 12 L5 9 L2 9 Z');
  speaker.setAttribute('fill', '#FFFFFF');
  const wave = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  wave.setAttribute('d', 'M10 5 Q12 7 10 9');
  wave.setAttribute('stroke', '#FFFFFF');
  wave.setAttribute('stroke-width', '1.4');
  wave.setAttribute('fill', 'none');
  wave.setAttribute('stroke-linecap', 'round');
  svg.appendChild(speaker);
  svg.appendChild(wave);
  return svg;
}

/* ------------------------------------------------------------------------ */
/* Util                                                                     */
/* ------------------------------------------------------------------------ */

/**
 * Populate the clock element with time (HH:MM) and date lines using
 * safe DOM APIs — no innerHTML smell.
 */
function setClockContent(span: HTMLElement, now: Date): void {
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const date = now.toLocaleDateString(undefined, {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
  span.textContent = '';
  span.appendChild(document.createTextNode(`${hh}:${mm}`));
  span.appendChild(document.createElement('br'));
  span.appendChild(document.createTextNode(date));
}
