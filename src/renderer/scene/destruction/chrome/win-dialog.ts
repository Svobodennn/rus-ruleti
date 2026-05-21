/**
 * Win11 Critical Dialog chrome — Phase 2B frontend-dev FILL.
 *
 * Pixel-perfect Win11 fluent acrylic modal per destruction-direction.md §3
 * Win11 variant. SSOT for dimensions:
 *   - DIALOG_WIN_WIDTH_PX  = 400
 *   - DIALOG_WIN_HEIGHT_PX = 220
 *
 * Composition (top-to-bottom inside the modal panel):
 *   1. Title row — Win11 four-square logo silhouette (designer-fictional,
 *      single `#0078D4` → `#005FB8` gradient across all squares; NOT four
 *      colors — the four-color rendering would mimic the real Microsoft
 *      trademark. 1px gap between squares.) + "Critical Process Failed"
 *      title (semibold 14px Segoe UI Variable — system font reference;
 *      Segoe UI Variable is NOT bundled in Sprint 0 fonts.css, so the
 *      stack falls through to system 'Segoe UI', sans-serif).
 *   2. Body text (regular 13px, ~360px wrap).
 *   3. Button row right-aligned: "More info" (text button, transparent)
 *      + "OK" (primary, `#0078D4` Win11 blue, white text).
 *
 * The backdrop is a full-viewport `<div>` with Win11 acrylic spec
 * `backdrop-filter: blur(30px) saturate(150%)` (per §3 line 298-301 —
 * deeper than Mac's 20px to read as Win11 Acrylic family). Backdrop
 * tint is rgba(0,0,0,0.2) — the lobby blurs through with a dim tint.
 *
 * Reduced-motion (per §3 line 337-345):
 *   - Modal opacity fade: 200ms default → 0ms (instant) with reduce.
 *   - Backdrop `backdrop-filter` transition: 200ms default → 0ms.
 *   - All other text/typography: unchanged (no motion).
 *
 * S6 risk closure (designer §3 + directive):
 *   - NO real Microsoft Windows logo PNG/JPG asset bundled.
 *   - The four-square SVG is designer-original 2x2 grid geometry with
 *     a single gradient across all four squares (NOT real Win logo).
 *   - Buttons are cosmetic only (no real click handlers — Sprint 4 dialog
 *     is visual chrome; the destruction-director auto-dismisses at
 *     FAZ_1_DIALOG_DURATION_MS).
 *
 * Called by:
 *   - faz1-critical-dialog.ts when os === 'win':
 *     `const handle = mountWinDialog(container); ... handle.dispose();`
 */

import {
  DIALOG_WIN_WIDTH_PX,
  DIALOG_WIN_HEIGHT_PX,
  PREFERS_REDUCED_MOTION_QUERY,
} from '../../../../shared/scene-destruction-constants.js';
import type { WinDialogHandle } from '../types.js';
import { resolveUserLocale, t } from '../../../i18n/strings.js';

/* ------------------------------------------------------------------------ */
/* Win11 fluent design tokens — local to this lane (no SSOT bleed)          */
/* ------------------------------------------------------------------------ */

/** Win11 accent blue — primary button background, gradient start. Win11 standard. */
const WIN_ACCENT_BLUE = '#0078D4';
/** Win11 accent blue deep — gradient end on logo, button hover family. */
const WIN_ACCENT_BLUE_DEEP = '#005FB8';
/** Modal background panel — Win11 fluent light surface. Designer-fictional approx. */
const WIN_PANEL_BG = '#FAFAFA';
/** Body text color — Win11 fluent primary text on light surface. */
const WIN_TEXT_PRIMARY = '#202020';
/** Backdrop tint — semi-translucent dark over the bulb-darkened lobby. */
const WIN_BACKDROP_TINT = 'rgba(0, 0, 0, 0.2)';
/** Acrylic backdrop-filter value — Win11 family approximation per §3. */
const WIN_ACRYLIC_FILTER = 'blur(30px) saturate(150%)';
/** Win11 fluent elevation shadow stack (3 layers per §3 + Lane D §9). */
const WIN_ELEVATION_SHADOW =
  '0 1px 2px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.12)';
/** Win11 standard corner radius — 8px (smaller than Mac's 12px per §3). */
const WIN_CORNER_RADIUS_PX = 8;
/** Button corner radius — 4px (Win11 button standard). */
const WIN_BUTTON_RADIUS_PX = 4;
/** Logo dimensions — 16x16 SVG silhouette per §3 line 303. */
const WIN_LOGO_SIZE_PX = 16;
/** Modal entry fade duration when reduce-motion is OFF (per §3 line 341). */
const MODAL_FADE_IN_MS = 200;
/**
 * Segoe UI Variable font stack — Sprint 0 fonts.css does NOT bundle
 * Segoe UI Variable woff2 (verified by inspection: only Old Standard TT
 * + PT Serif + DSEG7-Classic are bundled). The stack falls through to
 * the system 'Segoe UI' or generic sans-serif. Cross-platform fairness:
 * on macOS dev the stack resolves to sans-serif fallback which renders
 * slightly differently but still reads as a sober UI typeface. Sprint
 * 5+ may bundle a Segoe UI Variable OFL equivalent (e.g. Inter Variable
 * with Win11-family metrics) but Sprint 4 ships the system reference
 * to avoid pulling 200+ KB of font assets that don't exist yet.
 */
const WIN_FONT_STACK = "'Segoe UI Variable', 'Segoe UI', sans-serif";
/** Local stacking context — sits above destruction overlay children (§3 + directive). */
const DIALOG_Z_INDEX = 9150;

/* ------------------------------------------------------------------------ */
/* DOM builders — each function ≤ 50L                                       */
/* ------------------------------------------------------------------------ */

/**
 * Build the full-viewport backdrop element. Owns the Win11 acrylic
 * blur + saturate filter + dim tint. The backdrop is a positioned
 * `<div>` at `position: fixed; inset: 0` so it covers the viewport
 * regardless of container position. The `transition` is gated by
 * prefers-reduced-motion at mount time (caller passes the gate flag).
 */
function createBackdrop(reduceMotion: boolean): HTMLDivElement {
  const backdrop = document.createElement('div');
  backdrop.dataset.role = 'win-dialog-backdrop';
  const s = backdrop.style;
  s.position = 'fixed';
  s.inset = '0';
  s.backgroundColor = WIN_BACKDROP_TINT;
  s.backdropFilter = WIN_ACRYLIC_FILTER;
  // Vendor-prefixed alias for older Chromium fallbacks. Electron's
  // Chromium is recent enough that this is redundant but Sprint 0 retro
  // lesson #3 (defensive CSS): keep the alias.
  s.setProperty('-webkit-backdrop-filter', WIN_ACRYLIC_FILTER);
  s.zIndex = String(DIALOG_Z_INDEX);
  s.display = 'flex';
  s.alignItems = 'center';
  s.justifyContent = 'center';
  s.opacity = '0';
  s.transition = reduceMotion ? 'none' : `opacity ${MODAL_FADE_IN_MS}ms ease-out`;
  return backdrop;
}

/**
 * Build the Win11 four-square logo SVG silhouette. Designer-fictional:
 * a 2x2 grid of squares with 1px gap. Single linear gradient `#0078D4`
 * → `#005FB8` applied across ALL four squares (NOT one color per
 * square, which would mimic the real Microsoft logo). 16x16 viewbox.
 *
 * Path data (path-grid composition):
 *   Square TL: x=0, y=0,  w=7, h=7
 *   Square TR: x=9, y=0,  w=7, h=7
 *   Square BL: x=0, y=9,  w=7, h=7
 *   Square BR: x=9, y=9,  w=7, h=7
 *   Gap = 2px between square edges (1px on each side of imagined gutter).
 */
function createWinLogo(): SVGSVGElement {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', String(WIN_LOGO_SIZE_PX));
  svg.setAttribute('height', String(WIN_LOGO_SIZE_PX));
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('aria-hidden', 'true');
  const defs = document.createElementNS(NS, 'defs');
  const grad = document.createElementNS(NS, 'linearGradient');
  grad.setAttribute('id', 'winLogoGrad');
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
  svg.appendChild(defs);
  const coords: ReadonlyArray<readonly [number, number]> = [
    [0, 0], [9, 0], [0, 9], [9, 9],
  ];
  for (const [x, y] of coords) {
    const rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('x', String(x));
    rect.setAttribute('y', String(y));
    rect.setAttribute('width', '7');
    rect.setAttribute('height', '7');
    rect.setAttribute('fill', 'url(#winLogoGrad)');
    svg.appendChild(rect);
  }
  return svg;
}

/**
 * Build a single button element. `kind === 'primary'` renders the
 * "OK" affordance with Win11 blue background + white text; `kind ===
 * 'secondary'` renders the "More info" text button (transparent
 * background, blue text). Both share dimensions: 32px height, 4px
 * corner radius, 16px horizontal padding (Win11 button standard).
 * Buttons are cosmetic — no real onclick handler (Sprint 4 §3).
 */
function createButton(label: string, kind: 'primary' | 'secondary'): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = label;
  btn.tabIndex = -1; // visual only — no focus, no real interaction
  const s = btn.style;
  s.height = '32px';
  s.padding = '0 16px';
  s.borderRadius = `${WIN_BUTTON_RADIUS_PX}px`;
  s.fontFamily = WIN_FONT_STACK;
  s.fontSize = '13px';
  s.fontWeight = '600';
  s.cursor = 'default';
  s.lineHeight = '32px';
  s.boxSizing = 'border-box';
  if (kind === 'primary') {
    s.backgroundColor = WIN_ACCENT_BLUE;
    s.color = '#FFFFFF';
    s.border = `1px solid ${WIN_ACCENT_BLUE}`;
  } else {
    s.backgroundColor = 'transparent';
    s.color = WIN_ACCENT_BLUE;
    s.border = '1px solid transparent';
  }
  return btn;
}

/**
 * Build the modal panel — the visible white rounded card. Composed of
 * a title row (logo + title text), a body paragraph, and a button row.
 * Layout uses flexbox column with `justify-content: space-between` so
 * the buttons hug the bottom inset.
 */
function createModalPanel(
  reduceMotion: boolean,
  locale: ReturnType<typeof resolveUserLocale>,
): HTMLDivElement {
  const panel = document.createElement('div');
  panel.dataset.role = 'win-dialog-panel';
  const s = panel.style;
  s.width = `${DIALOG_WIN_WIDTH_PX}px`;
  s.height = `${DIALOG_WIN_HEIGHT_PX}px`;
  s.backgroundColor = WIN_PANEL_BG;
  s.borderRadius = `${WIN_CORNER_RADIUS_PX}px`;
  s.boxShadow = WIN_ELEVATION_SHADOW;
  s.padding = '20px';
  s.boxSizing = 'border-box';
  s.display = 'flex';
  s.flexDirection = 'column';
  s.justifyContent = 'space-between';
  s.fontFamily = WIN_FONT_STACK;
  s.color = WIN_TEXT_PRIMARY;
  s.transform = reduceMotion ? 'none' : 'translateY(4px)';
  s.transition = reduceMotion
    ? 'none'
    : `transform ${MODAL_FADE_IN_MS}ms ease-out`;
  panel.appendChild(createTitleSection(locale));
  panel.appendChild(createBodySection(locale));
  panel.appendChild(createButtonRow(locale));
  return panel;
}

/** Title row: 16x16 four-square logo + localised title text. */
function createTitleSection(locale: ReturnType<typeof resolveUserLocale>): HTMLDivElement {
  const row = document.createElement('div');
  const s = row.style;
  s.display = 'flex';
  s.alignItems = 'center';
  s.gap = '10px';
  row.appendChild(createWinLogo());
  const title = document.createElement('div');
  title.textContent = t('destruction.win.dialog.title', locale);
  const ts = title.style;
  ts.fontSize = '14px';
  ts.fontWeight = '600';
  ts.lineHeight = '20px';
  row.appendChild(title);
  return row;
}

/** Body paragraph: 13px regular, ~360px wrap. Localised error copy. */
function createBodySection(locale: ReturnType<typeof resolveUserLocale>): HTMLParagraphElement {
  const body = document.createElement('p');
  body.textContent = t('destruction.win.dialog.body', locale);
  const s = body.style;
  s.fontSize = '13px';
  s.fontWeight = '400';
  s.lineHeight = '18px';
  s.margin = '0';
  s.maxWidth = '360px';
  return body;
}

/** Button row: right-aligned localised labels. 8px gap. */
function createButtonRow(locale: ReturnType<typeof resolveUserLocale>): HTMLDivElement {
  const row = document.createElement('div');
  const s = row.style;
  s.display = 'flex';
  s.justifyContent = 'flex-end';
  s.alignItems = 'center';
  s.gap = '8px';
  row.appendChild(createButton(t('destruction.win.dialog.moreInfoLabel', locale), 'secondary'));
  row.appendChild(createButton(t('destruction.win.dialog.okLabel', locale), 'primary'));
  return row;
}

/* ------------------------------------------------------------------------ */
/* Mount entry point                                                        */
/* ------------------------------------------------------------------------ */

/**
 * Mount a Win11 critical dialog into the destruction container. Returns
 * a handle whose `dispose()` removes the element. Fades in over 200ms
 * (instant under reduced-motion). No internal timers — caller controls
 * lifetime via FAZ_1_DIALOG_DURATION_MS.
 */
export function mountWinDialog(container: HTMLElement): WinDialogHandle {
  const reduceMotion = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;
  const locale = resolveUserLocale();
  const backdrop = createBackdrop(reduceMotion);
  const panel = createModalPanel(reduceMotion, locale);
  backdrop.appendChild(panel);
  container.appendChild(backdrop);
  // Trigger the fade-in on the next frame so the initial opacity:0
  // gets committed before we transition to opacity:1. Under reduce
  // we still set opacity directly (transition is `none`).
  requestAnimationFrame((): void => {
    backdrop.style.opacity = '1';
    if (!reduceMotion) {
      panel.style.transform = 'translateY(0)';
    }
  });
  let disposed = false;
  const handle: WinDialogHandle = {
    kind: 'win-dialog',
    dispose: (): void => {
      if (disposed) {
        return;
      }
      disposed = true;
      if (backdrop.parentNode !== null) {
        backdrop.parentNode.removeChild(backdrop);
      }
    },
  };
  return handle;
}
