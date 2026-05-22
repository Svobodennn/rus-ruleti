/**
 * macOS Bootloop screen (Apple-bootscreen mimic) — Sprint 5 Phase 2B
 * Lane C FILL.
 *
 * WHO CALLS THIS: faz7-bootloop.ts#mountMacBootloop — Mac branch only.
 *
 * SHARED RESOURCES OWNED: none — the bootloop cycle setInterval is OWNED
 * by faz7-bootloop.ts (BOOTLOOP_CYCLE_TIMER_OWNER decree). This chrome
 * module receives setState() calls per cycle from the runner.
 *
 * Visual specs (destruction-direction.md §14 Mac variant + Phase 2A
 * constants):
 *   - Full-screen black background `FAZ7_MAC_BG_COLOR (#000000)`.
 *   - Centred designer-fictional eaten-apple SVG (REUSES Sprint 4
 *     mac-dialog.ts SVG path data — same hand-authored "apple-family"
 *     silhouette, NOT real Apple logo per S6 closure + Sprint 4
 *     Lesson #4 no-proprietary-asset). Size
 *     `FAZ7_MAC_APPLE_DIMENSION_PX = 72`.
 *   - Below SVG: progress bar 200×4px per §14 (track
 *     FAZ7_MAC_PROGRESS_BAR_TRACK_COLOR=#3A3A3A, fill
 *     FAZ7_MAC_PROGRESS_BAR_FILL_COLOR=#FFFFFF).
 *
 * State machine (driven by faz7-bootloop runner per FAZ7_CYCLE_MS=3000):
 *   - 'apple-loading' — apple + bar animates 0% → driftPct (~40%) over
 *     800ms, then halts for 200ms (1.0s state). Bar fill width
 *     transitions; reduced-motion gates the transition off.
 *   - 'frozen' — apple + bar HOLDS at driftPct, no animation (1.0s state).
 *   - 'no-boot' — apple fades to 0.3 opacity, ⊘ no-entry glyph fades in
 *     centred (FAZ7_NO_ENTRY_DIAMETER_PX=96, stroke
 *     FAZ7_NO_ENTRY_STROKE_PX=4 white), caption from
 *     t('destruction.faz7.mac.noBoot') 14px -apple-system Light.
 *     Hold 800ms then black-cut to STATE 1 (cycle restart) per §14.
 *
 * `setProgressDrift(pct)` updates the freeze-target percentage per cycle
 * (called by Lane B's faz7-bootloop with values in
 * FAZ7_PROGRESS_DRIFT_RANGE [38, 42] for "different attempt, same failure
 * pattern" reading).
 *
 * Reduced-motion gate (designer Phase 2A §16 row 35):
 *   - Bypass the cycle entirely; hold STATE 'no-boot' (⊘ + caption) for
 *     the full 6-second Faz 7 window. setState() calls become no-ops
 *     other than the initial 'no-boot' setup. Skip the bar animation;
 *     instant state transitions.
 *
 * ARIA (matrix row 35):
 *   - Root: role="application"
 *   - No-entry glyph: aria-hidden="true" (decorative; the noBoot caption
 *     conveys the same info textually).
 *
 * NO SF Pro / Helvetica Neue Light bundled — `-apple-system` reference only.
 */

import type { MacBootloopHandle } from '../types.js';
import {
  FAZ7_MAC_BG_COLOR,
  FAZ7_MAC_FG_COLOR,
  FAZ7_MAC_PROGRESS_BAR_TRACK_COLOR,
  FAZ7_MAC_PROGRESS_BAR_FILL_COLOR,
  FAZ7_MAC_PROGRESS_BAR_FILL_PCT,
  FAZ7_NO_ENTRY_DIAMETER_PX,
  FAZ7_NO_ENTRY_STROKE_PX,
  FAZ7_MAC_APPLE_DIMENSION_PX,
  PREFERS_REDUCED_MOTION_QUERY,
} from '../../../../shared/scene-destruction-constants.js';
import { resolveUserLocale, t } from '../../../i18n/strings.js';

/* ------------------------------------------------------------------------ */
/* Local layout constants — Phase 2A §14 + brief spec                       */
/* ------------------------------------------------------------------------ */

/** Apple silhouette mono fill — white on black bootscreen. */
const APPLE_GLYPH_FILL = FAZ7_MAC_FG_COLOR;
/** Progress bar width on the bootscreen (CSS px). Phase 2A §14: 200px. */
const PROGRESS_BAR_WIDTH_PX = 200;
/** Progress bar height (CSS px). Phase 2A §14: 4px. */
const PROGRESS_BAR_HEIGHT_PX = 4;
/** Vertical gap between apple SVG and progress bar (CSS px). */
const APPLE_TO_BAR_GAP_PX = 32;
/** Vertical gap between no-entry glyph and caption (CSS px). */
const NOENTRY_TO_CAPTION_GAP_PX = 24;
/** Z-index — Phase 2A §13 z-index map: Faz 7 bootloop = 9600. */
const BOOTLOOP_Z_INDEX = '9600';
/** Bar fill transition duration (ms) during 'apple-loading'. Phase 2A §14: 800ms. */
const BAR_FILL_TRANSITION_MS = 800;
/** Apple fade opacity in 'no-boot' state. Phase 2A §14: 0.3. */
const APPLE_FADE_OPACITY = 0.3;
/** State transition fade duration (ms). Phase 2A §14: 200ms. */
const STATE_FADE_MS = 200;

/* ------------------------------------------------------------------------ */
/* Designer-fictional eaten-apple SVG                                       */
/*                                                                          */
/* REUSED from Sprint 4 chrome/mac-dialog.ts. Same path data, single        */
/* monochrome fill, same hand-authored "apple-family" silhouette that is    */
/* NOT trademark-identical to Apple Inc.'s glyph. Sized to                  */
/* FAZ7_MAC_APPLE_DIMENSION_PX (72) for the bootloop screen.                */
/* ------------------------------------------------------------------------ */

const APPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${FAZ7_MAC_APPLE_DIMENSION_PX}" height="${FAZ7_MAC_APPLE_DIMENSION_PX}" aria-hidden="true">
  <path fill="${APPLE_GLYPH_FILL}" d="M18.5,5.2 C18.2,3.9 19.1,2.4 20.6,2.6 C20.9,3.9 20,5.4 18.5,5.2 Z"/>
  <path fill="${APPLE_GLYPH_FILL}" fill-rule="evenodd" d="M16.2,8 C12.7,7.8 9.2,9.3 7.4,12.4 C5.4,15.8 5.7,20.4 8.1,23.7 C9.7,25.8 12.4,27.5 15,27.3 C16,27.2 16.9,26.7 17.9,26.7 C18.9,26.7 19.8,27.2 20.8,27.3 C23.4,27.5 25.8,25.6 27.2,23.4 C26.1,22.8 25.1,22 24.4,21 C22.3,18.2 22.9,14.2 25.7,12.4 C24.4,10.5 22.2,9.4 19.9,9.4 C18.6,9.4 17.3,10 16.2,8 Z M22.2,11.2 C22.4,9.7 23.4,8.4 24.9,7.7 C25,9.1 24.4,10.5 23.4,11.4 C22.9,11.8 22.5,11.6 22.2,11.2 Z"/>
</svg>`;

/* ------------------------------------------------------------------------ */
/* No-entry ⊘ SVG (designer-original, single white circle + diagonal stroke)*/
/*                                                                          */
/* viewBox 0 0 96 96 (=FAZ7_NO_ENTRY_DIAMETER_PX). Circle centred at        */
/* (48,48) with radius 46 = 96-2*FAZ7_NO_ENTRY_STROKE_PX/2 inset. Diagonal  */
/* stroke from upper-left to lower-right inside the circle. Stroke width    */
/* FAZ7_NO_ENTRY_STROKE_PX (4) white. The "no entry" reading: this is the   */
/* system saying "no bootable OS found" without text.                       */
/* ------------------------------------------------------------------------ */

const NO_ENTRY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FAZ7_NO_ENTRY_DIAMETER_PX} ${FAZ7_NO_ENTRY_DIAMETER_PX}" width="${FAZ7_NO_ENTRY_DIAMETER_PX}" height="${FAZ7_NO_ENTRY_DIAMETER_PX}" aria-hidden="true">
  <circle cx="${FAZ7_NO_ENTRY_DIAMETER_PX / 2}" cy="${FAZ7_NO_ENTRY_DIAMETER_PX / 2}" r="${FAZ7_NO_ENTRY_DIAMETER_PX / 2 - FAZ7_NO_ENTRY_STROKE_PX}" fill="none" stroke="${FAZ7_MAC_FG_COLOR}" stroke-width="${FAZ7_NO_ENTRY_STROKE_PX}"/>
  <line x1="${FAZ7_NO_ENTRY_DIAMETER_PX * 0.22}" y1="${FAZ7_NO_ENTRY_DIAMETER_PX * 0.22}" x2="${FAZ7_NO_ENTRY_DIAMETER_PX * 0.78}" y2="${FAZ7_NO_ENTRY_DIAMETER_PX * 0.78}" stroke="${FAZ7_MAC_FG_COLOR}" stroke-width="${FAZ7_NO_ENTRY_STROKE_PX}" stroke-linecap="round"/>
</svg>`;

/* ------------------------------------------------------------------------ */
/* DOM builders                                                             */
/* ------------------------------------------------------------------------ */

/** Build the full-screen root. role="application" so screen readers know
 *  this is an in-app surface, not a document. */
function buildRoot(): HTMLDivElement {
  const root = document.createElement('div');
  root.className = 'faz7-mac-bootloop state-apple-loading';
  root.setAttribute('role', 'application');
  const s = root.style;
  s.position = 'fixed';
  s.inset = '0';
  s.zIndex = BOOTLOOP_Z_INDEX;
  s.background = FAZ7_MAC_BG_COLOR;
  s.color = FAZ7_MAC_FG_COLOR;
  s.fontFamily = '-apple-system, "Helvetica Neue", sans-serif';
  s.fontWeight = '300';
  s.display = 'flex';
  s.flexDirection = 'column';
  s.alignItems = 'center';
  s.justifyContent = 'center';
  s.gap = `${APPLE_TO_BAR_GAP_PX}px`;
  return root;
}

/** Build the eaten-apple SVG element. Opacity transitions per state. */
function buildAppleElement(): HTMLDivElement {
  const apple = document.createElement('div');
  apple.className = 'faz7-mac-bootloop__apple';
  apple.innerHTML = APPLE_SVG;
  const s = apple.style;
  s.width = `${FAZ7_MAC_APPLE_DIMENSION_PX}px`;
  s.height = `${FAZ7_MAC_APPLE_DIMENSION_PX}px`;
  s.opacity = '1';
  s.transition = `opacity ${STATE_FADE_MS}ms ease-out`;
  s.display = 'flex';
  s.alignItems = 'center';
  s.justifyContent = 'center';
  return apple;
}

/**
 * Build the progress bar (track + fill). Returns both so setState() can
 * patch fill.style.width and progress bar visibility per state.
 */
function buildProgressBar(): {
  bar: HTMLDivElement;
  fill: HTMLDivElement;
} {
  const bar = document.createElement('div');
  bar.className = 'faz7-mac-bootloop__bar';
  const bs = bar.style;
  bs.width = `${PROGRESS_BAR_WIDTH_PX}px`;
  bs.height = `${PROGRESS_BAR_HEIGHT_PX}px`;
  bs.background = FAZ7_MAC_PROGRESS_BAR_TRACK_COLOR;
  bs.borderRadius = `${PROGRESS_BAR_HEIGHT_PX / 2}px`;
  bs.overflow = 'hidden';

  const fill = document.createElement('div');
  fill.className = 'faz7-mac-bootloop__fill';
  const fs = fill.style;
  fs.height = '100%';
  fs.width = '0%';
  fs.background = FAZ7_MAC_PROGRESS_BAR_FILL_COLOR;
  fs.borderRadius = `${PROGRESS_BAR_HEIGHT_PX / 2}px`;
  fs.transition = `width ${BAR_FILL_TRANSITION_MS}ms ease-out`;
  bar.appendChild(fill);
  return { bar, fill };
}

/** Build the ⊘ no-entry block (glyph + caption). Hidden by default. */
function buildNoEntryBlock(
  locale: ReturnType<typeof resolveUserLocale>,
): { block: HTMLDivElement; caption: HTMLDivElement } {
  const block = document.createElement('div');
  block.className = 'faz7-mac-bootloop__noentry';
  const s = block.style;
  s.display = 'none';
  s.flexDirection = 'column';
  s.alignItems = 'center';
  s.gap = `${NOENTRY_TO_CAPTION_GAP_PX}px`;
  s.position = 'absolute';
  s.inset = '0';
  s.justifyContent = 'center';
  s.transition = `opacity ${STATE_FADE_MS}ms ease-out`;

  const glyph = document.createElement('div');
  glyph.className = 'faz7-mac-bootloop__noentry-glyph';
  glyph.innerHTML = NO_ENTRY_SVG;
  glyph.style.width = `${FAZ7_NO_ENTRY_DIAMETER_PX}px`;
  glyph.style.height = `${FAZ7_NO_ENTRY_DIAMETER_PX}px`;

  const caption = document.createElement('div');
  caption.className = 'faz7-mac-bootloop__caption';
  caption.textContent = t('destruction.faz7.mac.noBoot', locale);
  caption.style.fontSize = '14px';
  caption.style.fontWeight = '300';
  caption.style.color = FAZ7_MAC_FG_COLOR;
  caption.style.textAlign = 'center';

  block.append(glyph, caption);
  return { block, caption };
}

/* ------------------------------------------------------------------------ */
/* Compose helper — assembles root + children + reduced-motion gating.      */
/* Keeps mountMacBootloop under 50 lines per lint discipline.               */
/* ------------------------------------------------------------------------ */

interface BootloopComposed {
  root: HTMLDivElement;
  apple: HTMLDivElement;
  bar: HTMLDivElement;
  fill: HTMLDivElement;
  noEntryBlock: HTMLDivElement;
}

function composeBootloop(
  reducedMotion: boolean,
  locale: ReturnType<typeof resolveUserLocale>,
): BootloopComposed {
  const root = buildRoot();
  const apple = buildAppleElement();
  const { bar, fill } = buildProgressBar();
  const { block: noEntryBlock } = buildNoEntryBlock(locale);
  root.append(apple, bar, noEntryBlock);
  if (reducedMotion) {
    fill.style.transition = 'none';
    apple.style.transition = 'none';
    noEntryBlock.style.transition = 'none';
  }
  return { root, apple, bar, fill, noEntryBlock };
}

/* ------------------------------------------------------------------------ */
/* State applicator (closes over composed refs + driftPct ref).             */
/* ------------------------------------------------------------------------ */

interface ApplyStateDeps {
  readonly composed: BootloopComposed;
  readonly driftRef: { value: number };
  readonly disposedRef: { value: boolean };
}

function applyBootloopState(
  state: 'apple-loading' | 'frozen' | 'no-boot',
  deps: ApplyStateDeps,
): void {
  const { composed, driftRef, disposedRef } = deps;
  const { root, apple, bar, fill, noEntryBlock } = composed;
  root.classList.remove('state-apple-loading', 'state-frozen', 'state-no-boot');
  root.classList.add(`state-${state}`);
  switch (state) {
    case 'apple-loading': {
      apple.style.opacity = '1';
      bar.style.display = 'block';
      noEntryBlock.style.display = 'none';
      fill.style.width = '0%';
      requestAnimationFrame((): void => {
        if (disposedRef.value) return;
        fill.style.width = `${driftRef.value}%`;
      });
      break;
    }
    case 'frozen': {
      apple.style.opacity = '1';
      bar.style.display = 'block';
      noEntryBlock.style.display = 'none';
      fill.style.width = `${driftRef.value}%`;
      break;
    }
    case 'no-boot': {
      apple.style.opacity = String(APPLE_FADE_OPACITY);
      bar.style.display = 'none';
      noEntryBlock.style.display = 'flex';
      noEntryBlock.style.opacity = '1';
      break;
    }
  }
}

/* ------------------------------------------------------------------------ */
/* Public mount                                                             */
/* ------------------------------------------------------------------------ */

/** Mount-arg bag. */
export interface MountMacBootloopArgs {
  readonly hostElement: HTMLElement;
  readonly signal: AbortSignal;
}

/**
 * Mount the Mac bootloop screen into the destruction container. Returns
 * a handle whose `setState(state)` transitions through bootloop stages
 * and `dispose()` removes the screen.
 *
 * Reduced-motion: the cycle is bypassed entirely; the screen mounts
 * directly into the 'no-boot' state and stays there. setState() calls
 * become no-ops (matrix row 35).
 */
export function mountMacBootloop(
  args: MountMacBootloopArgs,
): MacBootloopHandle {
  const locale = resolveUserLocale();
  const reducedMotion = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;
  const composed = composeBootloop(reducedMotion, locale);
  args.hostElement.appendChild(composed.root);

  const driftRef = { value: FAZ7_MAC_PROGRESS_BAR_FILL_PCT };
  const disposedRef = { value: false };
  const deps: ApplyStateDeps = { composed, driftRef, disposedRef };

  const onAbort = (): void => {
    if (disposedRef.value) return;
    handle.dispose();
  };
  args.signal.addEventListener('abort', onAbort, { once: true });

  applyBootloopState(reducedMotion ? 'no-boot' : 'apple-loading', deps);

  const handle: MacBootloopHandle = {
    kind: 'mac-bootloop',
    element: composed.root,
    setState: (state: 'apple-loading' | 'frozen' | 'no-boot'): void => {
      if (disposedRef.value || reducedMotion) return;
      applyBootloopState(state, deps);
    },
    setProgressDrift: (percent: number): void => {
      if (disposedRef.value) return;
      driftRef.value = Math.max(0, Math.min(100, percent));
    },
    dispose: (): void => {
      if (disposedRef.value) return;
      disposedRef.value = true;
      args.signal.removeEventListener('abort', onAbort);
      composed.root.remove();
    },
  };
  return handle;
}
