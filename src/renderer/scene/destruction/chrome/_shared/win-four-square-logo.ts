/**
 * Designer-fictional Win11 four-square logo SVG builder — Sprint 5 Lane D
 * extracted shared helper.
 *
 * The geometry is IDENTICAL to Sprint 4 win-dialog.ts: a 2x2 grid of
 * squares (7x7 each, 2px gap) with a single linear gradient (#0078D4 →
 * #005FB8) applied across all four squares. The four-color rendering
 * would mimic the real Microsoft Windows trademark; that rendering is
 * deliberately not produced here.
 *
 * S6 risk closure (Sprint 4 carry-forward + Sprint 5 reuse):
 *   - NOT the real Win11 logo. Single-gradient, monochromatic.
 *   - Re-used by chrome/win-dialog.ts (visually) and by Lane D's
 *     chrome/win-progress-dialog.ts via this helper.
 *
 * Per-mount gradient id randomisation: a `gradId` suffix is generated
 * so multiple simultaneous mounts (a future Sprint 6 polish where the
 * Faz 1 dialog and Faz 4 progress dialog briefly overlap during a
 * reveal-hand-off transition) cannot collide on the `#winLogoGrad`
 * identifier inside their respective SVG fragments.
 */

const NS = 'http://www.w3.org/2000/svg';
const WIN_ACCENT_BLUE = '#0078D4';
const WIN_ACCENT_BLUE_DEEP = '#005FB8';

/**
 * Build the four-square Win logo SVG. The `size` parameter is the
 * width AND height in CSS pixels (the SVG renders inside a 16x16
 * viewBox regardless of size, so any size scales uniformly).
 */
export function createWinFourSquareLogo(size: number): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('aria-hidden', 'true');
  const gradId = `winFourSquareLogoGrad-${Math.random().toString(36).slice(2, 8)}`;
  svg.appendChild(buildGradientDefs(gradId));
  const coords: ReadonlyArray<readonly [number, number]> = [
    [0, 0],
    [9, 0],
    [0, 9],
    [9, 9],
  ];
  for (const [x, y] of coords) {
    svg.appendChild(buildSquare(x, y, gradId));
  }
  return svg;
}

function buildGradientDefs(gradId: string): SVGDefsElement {
  const defs = document.createElementNS(NS, 'defs');
  const grad = document.createElementNS(NS, 'linearGradient');
  grad.setAttribute('id', gradId);
  grad.setAttribute('x1', '0');
  grad.setAttribute('y1', '0');
  grad.setAttribute('x2', '1');
  grad.setAttribute('y2', '1');
  const stop1 = document.createElementNS(NS, 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('stop-color', WIN_ACCENT_BLUE);
  const stop2 = document.createElementNS(NS, 'stop');
  stop2.setAttribute('offset', '100%');
  stop2.setAttribute('stop-color', WIN_ACCENT_BLUE_DEEP);
  grad.appendChild(stop1);
  grad.appendChild(stop2);
  defs.appendChild(grad);
  return defs;
}

function buildSquare(x: number, y: number, gradId: string): SVGRectElement {
  const rect = document.createElementNS(NS, 'rect');
  rect.setAttribute('x', String(x));
  rect.setAttribute('y', String(y));
  rect.setAttribute('width', '7');
  rect.setAttribute('height', '7');
  rect.setAttribute('fill', `url(#${gradId})`);
  return rect;
}
