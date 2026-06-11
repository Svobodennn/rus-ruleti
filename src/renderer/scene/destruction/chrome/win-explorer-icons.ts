/**
 * Faz 2B File Explorer — SVG line-icon factory (designer §3–§9 idiom).
 *
 * Split out of `win-explorer-views.ts` / `win-explorer.ts` so both stay
 * under the 400-line cap. Every icon follows the win-taskbar.ts idiom:
 * `viewBox="0 0 24 24"`, `fill:none; stroke:#1B1B1B; stroke-width:1.5;
 * stroke-linecap:round; stroke-linejoin:round` for line icons, and explicit
 * fills for the filled glyphs (drive bay, folder, error circle). NO emoji —
 * all "icons" are procedural SVG (anti-emoji policy / S6 risk closure).
 *
 * Pure factories: each `createX()` returns a fresh SVGSVGElement. Colors +
 * sizes come from FAZ_2B_* tokens (SSOT); only the path geometry is local.
 *
 * WHO CALLS THIS: chrome/win-explorer.ts, chrome/win-explorer-views.ts.
 */

import {
  FAZ_2B_COLOR,
  FAZ_2B_DRIVE_GLYPH,
  FAZ_2B_FOLDER,
} from '../../../../shared/scene-destruction-constants.js';

const NS = 'http://www.w3.org/2000/svg';

/* ------------------------------------------------------------------------ */
/* Generic builders                                                         */
/* ------------------------------------------------------------------------ */

/** Build a stroked-line icon SVG (24x24 viewBox) from one or more paths. */
export function createLineIcon(
  paths: readonly string[] | undefined,
  sizePx: number,
  stroke: string = FAZ_2B_COLOR.iconLine,
): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(sizePx));
  svg.setAttribute('height', String(sizePx));
  svg.setAttribute('aria-hidden', 'true');
  for (const d of paths ?? []) {
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', stroke);
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
  }
  return svg;
}

/** Named command-bar / nav line-icon geometry (designer §3–§5). */
export const ICON_PATHS: Readonly<Record<string, readonly string[]>> = {
  new: ['M3 7 h6 l2 2 h10 v10 H3 Z', 'M12 12 v6 M9 15 h6'],
  cut: ['M6 9 L18 17 M6 17 L18 9', 'M6 9 m-2 0 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0'],
  copy: ['M9 9 h9 v9 h-9 Z', 'M6 6 h9 v3'],
  paste: ['M6 7 h12 v13 H6 Z', 'M9 5 h6 v3 H9 Z'],
  rename: ['M5 19 l1-4 L16 4 l3 3 L8 18 Z'],
  delete: ['M6 7 h12 M9 7 V5 h6 v2 M8 7 l1 13 h6 l1-13'],
  sort: ['M7 8 h10 M9 12 h6 M11 16 h2'],
  view: ['M6 6 h5 v5 H6 Z', 'M13 6 h5 v5 h-5 Z', 'M6 13 h5 v5 H6 Z', 'M13 13 h5 v5 h-5 Z'],
  more: ['M6 12 h.01 M12 12 h.01 M18 12 h.01'],
  back: ['M15 6 L9 12 L15 18'],
  forward: ['M9 6 L15 12 L9 18'],
  up: ['M12 18 V6 M7 11 L12 6 L17 11'],
  chevron: ['M9 6 L15 12 L9 18'],
  search: ['M14.5 14.5 L19 19'],
  pc: ['M4 6 h16 v9 H4 Z', 'M9 19 h6 M12 15 v4'],
  home: ['M5 11 L12 5 L19 11 V19 H5 Z'],
  gallery: ['M5 6 h14 v12 H5 Z', 'M8 14 l3-3 3 3 2-2 3 3'],
  cloud: ['M7 16 a4 4 0 0 1 1-7.8 a5 5 0 0 1 9.6 1.3 a3 3 0 0 1 -.6 6.5 Z'],
  drive: ['M4 8 h16 v8 H4 Z', 'M7 12 h3'],
  network: ['M5 6 h14 v9 H5 Z', 'M9 19 h6 M12 15 v4'],
};

/* ------------------------------------------------------------------------ */
/* Search magnifier (circle + handle)                                       */
/* ------------------------------------------------------------------------ */

/** Build the search magnifier (circle + diagonal handle). */
export function createSearchIcon(sizePx: number): SVGSVGElement {
  const svg = createLineIcon(ICON_PATHS.search, sizePx, FAZ_2B_COLOR.iconMuted);
  const circle = document.createElementNS(NS, 'circle');
  circle.setAttribute('cx', '10');
  circle.setAttribute('cy', '10');
  circle.setAttribute('r', '6');
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke', FAZ_2B_COLOR.iconMuted);
  circle.setAttribute('stroke-width', '1.5');
  svg.insertBefore(circle, svg.firstChild);
  return svg;
}

/* ------------------------------------------------------------------------ */
/* Drive glyph (hard-drive bay — designer §6)                               */
/* ------------------------------------------------------------------------ */

/** Build the 40px hard-drive bay glyph (filled, with activity LED). */
export function createDriveGlyph(sizePx: number): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 32 32');
  svg.setAttribute('width', String(sizePx));
  svg.setAttribute('height', String(sizePx));
  svg.setAttribute('aria-hidden', 'true');
  appendPath(
    svg,
    'M5 11 h22 a2 2 0 0 1 2 2 v8 a2 2 0 0 1 -2 2 H5 a2 2 0 0 1 -2 -2 v-8 a2 2 0 0 1 2 -2 Z',
    FAZ_2B_DRIVE_GLYPH.body,
    FAZ_2B_DRIVE_GLYPH.bodyStroke,
  );
  appendStroke(svg, 'M7 16 h6', FAZ_2B_DRIVE_GLYPH.slot);
  appendStroke(svg, 'M7 19 h4', FAZ_2B_DRIVE_GLYPH.slot);
  appendStroke(svg, 'M5 12 h22', 'rgba(255,255,255,0.7)');
  const led = document.createElementNS(NS, 'circle');
  led.setAttribute('cx', '25');
  led.setAttribute('cy', '18');
  led.setAttribute('r', '1.5');
  led.setAttribute('fill', FAZ_2B_DRIVE_GLYPH.led);
  svg.appendChild(led);
  return svg;
}

/* ------------------------------------------------------------------------ */
/* Win11 manila folder (gradient + 3D lip — designer §7)                    */
/* ------------------------------------------------------------------------ */

/** Build the Win11 gradient folder icon (24x24) with a soft front lip. */
export function createFolderIcon(sizePx: number): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(sizePx));
  svg.setAttribute('height', String(sizePx));
  svg.setAttribute('aria-hidden', 'true');
  const gradId = `f2bFolder-${Math.random().toString(36).slice(2, 8)}`;
  svg.appendChild(buildFolderDefs(gradId));
  appendPath(
    svg,
    'M3 6 a1.5 1.5 0 0 1 1.5-1.5 H8.5 l2 2 H19.5 a1.5 1.5 0 0 1 1.5 1.5 V8 H3 Z',
    FAZ_2B_FOLDER.tab,
  );
  appendPath(
    svg,
    'M3 8 H21 V17.5 a1.5 1.5 0 0 1 -1.5 1.5 H4.5 A1.5 1.5 0 0 1 3 17.5 Z',
    `url(#${gradId}-body)`,
  );
  const flap = appendPath(
    svg,
    'M3.5 9.5 H20.5 a1 1 0 0 1 1 1 L20.5 17.8 a1.4 1.4 0 0 1 -1.4 1.2 H4.9 a1.4 1.4 0 0 1 -1.4 -1.2 Z',
    `url(#${gradId}-flap)`,
  );
  flap.setAttribute('opacity', '0.55');
  appendStroke(svg, 'M3 8 H21', 'rgba(255,255,255,0.6)', '0.75');
  return svg;
}

/** Build the two folder gradients (body + front flap). */
function buildFolderDefs(gradId: string): SVGDefsElement {
  const defs = document.createElementNS(NS, 'defs');
  defs.appendChild(
    buildVerticalGradient(
      `${gradId}-body`,
      FAZ_2B_FOLDER.gradTop,
      FAZ_2B_FOLDER.gradBottom,
    ),
  );
  defs.appendChild(
    buildVerticalGradient(
      `${gradId}-flap`,
      FAZ_2B_FOLDER.flapTop,
      FAZ_2B_FOLDER.flapBottom,
    ),
  );
  return defs;
}

/** Build a top-to-bottom linear gradient with two stops. */
function buildVerticalGradient(
  id: string,
  top: string,
  bottom: string,
): SVGLinearGradientElement {
  const grad = document.createElementNS(NS, 'linearGradient');
  grad.setAttribute('id', id);
  grad.setAttribute('x1', '0');
  grad.setAttribute('y1', '0');
  grad.setAttribute('x2', '0');
  grad.setAttribute('y2', '1');
  const stopTop = document.createElementNS(NS, 'stop');
  stopTop.setAttribute('offset', '0%');
  stopTop.setAttribute('stop-color', top);
  const stopBottom = document.createElementNS(NS, 'stop');
  stopBottom.setAttribute('offset', '100%');
  stopBottom.setAttribute('stop-color', bottom);
  grad.appendChild(stopTop);
  grad.appendChild(stopBottom);
  return grad;
}

/* ------------------------------------------------------------------------ */
/* Error icon (red "no entry" circle — designer §9)                         */
/* ------------------------------------------------------------------------ */

/** Build the red "access denied" circle with a white bar (no emoji). */
export function createAccessDeniedIcon(sizePx: number): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(sizePx));
  svg.setAttribute('height', String(sizePx));
  svg.setAttribute('aria-hidden', 'true');
  const circle = document.createElementNS(NS, 'circle');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '12');
  circle.setAttribute('r', '9');
  circle.setAttribute('fill', FAZ_2B_COLOR.danger);
  svg.appendChild(circle);
  appendStroke(svg, 'M8 12 h8', '#FFFFFF', '2');
  return svg;
}

/* ------------------------------------------------------------------------ */
/* Small primitives                                                         */
/* ------------------------------------------------------------------------ */

/** Append a filled path (optional stroke) and return it. */
function appendPath(
  svg: SVGSVGElement,
  d: string,
  fill: string,
  stroke?: string,
): SVGPathElement {
  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', fill);
  if (stroke !== undefined) {
    path.setAttribute('stroke', stroke);
    path.setAttribute('stroke-width', '1');
  }
  svg.appendChild(path);
  return path;
}

/** Append a stroke-only path (no fill) and return it. */
function appendStroke(
  svg: SVGSVGElement,
  d: string,
  stroke: string,
  width = '1',
): SVGPathElement {
  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', stroke);
  path.setAttribute('stroke-width', width);
  path.setAttribute('stroke-linecap', 'round');
  svg.appendChild(path);
  return path;
}
