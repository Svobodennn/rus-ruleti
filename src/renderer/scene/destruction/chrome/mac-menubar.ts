/**
 * macOS top menubar mimik — Phase 2B (kraken-faz2-3 owner).
 *
 *   - MENUBAR_MAC_HEIGHT_PX (28px) bar at top of viewport.
 *   - Background gradient #F2F2F7 → #E5E5EA (designer-fictional palette).
 *   - Apple logo procedural SVG silhouette at left, 16x16 monochrome
 *     #1D1D1F. The Apple is a SIMPLIFIED designer-original shape
 *     (round body + leaf) — the pixel-perfect Apple HIG path is in
 *     Lane C swift-expert's mac-dialog; the menubar variant is a reduced
 *     glyph because at 16x16 in a busy menubar the silhouette reads as
 *     "apple-family icon" without the dialog's geometric precision.
 *   - App name "Finder" right of logo.
 *   - Right status row: WiFi simplified SVG + battery "BAT 87%" + live
 *     clock HH:MM:SS updated every 1s via setInterval.
 *
 * Live clock: `new Date().toLocaleTimeString()` is the source — real
 * system time, not simulated. Designer §4 acceptance: "the live clock
 * updates by toLocaleTimeString — REAL time, no simulation".
 *
 * Reduced-motion: clock setInterval is text-content swap (no animation
 * surface gated — designer §8 matrix row 12 unchanged).
 */

import { MENUBAR_MAC_HEIGHT_PX } from '../../../../shared/scene-destruction-constants.js';
import type { MacMenubarHandle } from '../types.js';

/* ------------------------------------------------------------------------ */
/* Public                                                                   */
/* ------------------------------------------------------------------------ */

export function mountMacMenubar(container: HTMLElement): MacMenubarHandle {
  const bar = createBarElement();
  const clock = createClockElement();
  bar.appendChild(buildLeftCluster());
  bar.appendChild(buildRightCluster(clock));
  container.appendChild(bar);

  const interval = window.setInterval((): void => {
    clock.textContent = formatClock();
  }, 1000);

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
  bar.classList.add('mac-menubar');
  bar.style.height = `${MENUBAR_MAC_HEIGHT_PX}px`;
  return bar;
}

function createClockElement(): HTMLSpanElement {
  const span = document.createElement('span');
  span.classList.add('mac-menubar__clock');
  span.textContent = formatClock();
  return span;
}

function buildLeftCluster(): HTMLDivElement {
  const left = document.createElement('div');
  left.classList.add('mac-menubar__left');
  left.appendChild(buildAppleLogoSvg());
  const finder = document.createElement('strong');
  finder.textContent = 'Finder';
  left.appendChild(finder);
  appendMenuItems(left, ['File', 'Edit', 'View', 'Go', 'Window', 'Help']);
  return left;
}

function appendMenuItems(parent: HTMLElement, items: readonly string[]): void {
  for (const text of items) {
    const span = document.createElement('span');
    span.textContent = text;
    parent.appendChild(span);
  }
}

function buildRightCluster(clock: HTMLSpanElement): HTMLDivElement {
  const right = document.createElement('div');
  right.classList.add('mac-menubar__right');
  right.appendChild(buildWifiGlyph());
  right.appendChild(buildSpotlightGlyph());
  const battery = document.createElement('span');
  battery.textContent = 'BAT 87%';
  right.appendChild(battery);
  right.appendChild(clock);
  return right;
}

/* ------------------------------------------------------------------------ */
/* SVG glyphs (designer-fictional silhouettes)                              */
/* ------------------------------------------------------------------------ */

function buildAppleLogoSvg(): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '14');
  svg.setAttribute('height', '16');
  svg.setAttribute('viewBox', '0 0 14 16');
  /* Designer-fictional eaten-apple silhouette: round body + leaf + bite
   * at right side ~60% height. NOT pixel-identical to Apple Inc. trademark. */
  const body = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  body.setAttribute(
    'd',
    'M7 4 C3.5 4 1 7 1 10.5 C1 13 3 15 5 15 C6 15 6.5 14.5 7 14.5 C7.5 14.5 8 15 9 15 C11 15 13 13 13 10.5 C13 8 11.5 6 9 5.5 C8.5 6 7.5 6 7 5.5 Z',
  );
  body.setAttribute('fill', '#1D1D1F');
  const leaf = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  leaf.setAttribute('d', 'M8 1 C9 2 9 4 7.5 4.5 C7 3 7 1.5 8 1 Z');
  leaf.setAttribute('fill', '#1D1D1F');
  svg.appendChild(body);
  svg.appendChild(leaf);
  return svg;
}

function buildWifiGlyph(): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '12');
  svg.setAttribute('viewBox', '0 0 16 12');
  const arcs: readonly string[] = [
    'M2 8 Q8 3 14 8',
    'M4 9.5 Q8 6 12 9.5',
    'M6 11 Q8 9.5 10 11',
  ];
  for (const d of arcs) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', '#1D1D1F');
    path.setAttribute('stroke-width', '1.4');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    svg.appendChild(path);
  }
  return svg;
}

function buildSpotlightGlyph(): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '14');
  svg.setAttribute('height', '14');
  svg.setAttribute('viewBox', '0 0 14 14');
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '6');
  circle.setAttribute('cy', '6');
  circle.setAttribute('r', '4');
  circle.setAttribute('stroke', '#1D1D1F');
  circle.setAttribute('stroke-width', '1.4');
  circle.setAttribute('fill', 'none');
  const stem = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  stem.setAttribute('x1', '9.2');
  stem.setAttribute('y1', '9.2');
  stem.setAttribute('x2', '13');
  stem.setAttribute('y2', '13');
  stem.setAttribute('stroke', '#1D1D1F');
  stem.setAttribute('stroke-width', '1.4');
  stem.setAttribute('stroke-linecap', 'round');
  svg.appendChild(circle);
  svg.appendChild(stem);
  return svg;
}

/* ------------------------------------------------------------------------ */
/* Util                                                                     */
/* ------------------------------------------------------------------------ */

function formatClock(): string {
  return new Date().toLocaleTimeString();
}
