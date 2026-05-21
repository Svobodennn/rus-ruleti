/**
 * Win11 BSOD full-screen chrome — Sprint 5 Phase 2B Lane D FILL.
 *
 * Pixel-faithful Win10/11 BSOD per destruction-direction.md §13 and the
 * Sprint 5 Phase 2A art bible. Composition (clockwise from top-left,
 * matching the real Win11 layout):
 *
 *   - Background:  full-screen FAZ6_WIN_BG_COLOR (#0078D4 BSOD blue).
 *   - Sad face:    large `:(` glyph (FAZ6_WIN_FROWNY_FONT_SIZE_PX = 140)
 *                  top-left inset 12%, opacity 0.95 default, CRT-flicker
 *                  strobe at FAZ6_FROWNY_FLICKER_HZ = 5Hz on demand.
 *   - Headline:    "Your PC ran into a problem and needs to restart" —
 *                  28px font-weight 300, wraps freely, max-width 60%.
 *   - Sub-text:    "We're just collecting some error info, and then we'll
 *                  restart for you." — 18px font-weight 300.
 *   - Percent:     "0% complete" — STUCK at 0 (the system never
 *                  recovers); 18px font-weight 300, 32px below sub-text.
 *   - QR PNG:      bottom-left inset 12% + bottom 24%; 128×128 element
 *                  loading the REAL QR generated from
 *                  https://www.windows.com/stopcode (textual URL only —
 *                  trademark-safe per S6/S8 closure).
 *   - QR caption:  10px Light, beneath the QR PNG, describing the link.
 *   - Stop code:   "Stop code: CRITICAL_PROCESS_DIED" — bottom-right
 *                  mirror position of QR.
 *
 * SHARED RESOURCES OWNED:
 *   - frowny flicker setInterval — OWNED here per FROWNY_FLICKER_TIMER_OWNER
 *     ('faz6-bsod' module umbrella; this chrome lives under faz6-bsod's
 *     ownership tree and the interval is cleared on dispose()).
 *
 * Why a defensive EN fallback:
 *   Lane 0 i18n handoff (phase2b-lane0-i18n.md) explicitly recommended
 *   that the headline literal also live HERE in code so that an i18n
 *   resolution path failure (locale tree corruption, late-mount race)
 *   does not produce an EMPTY BSOD — the BSOD must read believably even
 *   under failure. Defensive EN fallback constant is exported privately
 *   inside the module and used ONLY when `t()` returns the bare key
 *   (signalling resolution miss).
 *
 * Reduced-motion (a11y matrix rows 32, 33, 34):
 *   - Sad-face flicker: disabled (opacity holds 1.0; no setInterval).
 *   - Backdrop: naturally static.
 *   - QR PNG: naturally static.
 *
 * ARIA (a11y matrix row 32):
 *   - role="alert"
 *   - sad-face `aria-hidden="true"` (it's decorative glyph art)
 *   - QR `<img alt="QR code linking to Windows stop code reference">`
 *
 * S6 / S8 risk closure:
 *   - NO real Win11 logo bundled (this surface has no logo; sad face
 *     is a single text glyph).
 *   - NO Segoe UI Variable bundled — system stack falls through.
 *   - QR PNG is the SOLE bundled "branded-adjacent" asset; it carries
 *     URL TEXT, not Microsoft IP (S8 closure per directive §3 risk S8).
 *
 * Called by:
 *   - faz6-bsod.ts when os === 'win':
 *     `const handle = mountWinBsod({...}); handle.startFrownyFlicker();`
 */

import {
  FAZ6_WIN_BG_COLOR,
  FAZ6_WIN_FG_COLOR,
  FAZ6_WIN_FROWNY_FONT_SIZE_PX,
  FAZ6_WIN_BODY_FONT_WEIGHT,
  FAZ6_WIN_QR_DIMENSION_PX,
  FAZ6_FROWNY_FLICKER_HZ,
  PREFERS_REDUCED_MOTION_QUERY,
} from '../../../../shared/scene-destruction-constants.js';
import type { WinBsodHandle } from '../types.js';
import { resolveUserLocale, t } from '../../../i18n/strings.js';
// Vite `?url` import — the QR PNG is vendored under src/renderer/assets/
// (real QR encoded `https://www.windows.com/stopcode`; see LEGAL.md
// "QR code asset" section). The `?url` suffix tells Vite to hash + bundle
// the PNG at build time and resolve to a dev-server URL in dev mode —
// the same pattern Sprint 3 used for GLB models in model-registry.ts.
import winBsodQrUrl from '../../../assets/destruction/win-bsod-qr.png?url';

/* ------------------------------------------------------------------------ */
/* Win11 BSOD design tokens — local to this lane (no SSOT bleed)            */
/* ------------------------------------------------------------------------ */

/**
 * Segoe UI Variable font stack — Sprint 0 fonts.css does NOT bundle the
 * Variable. The stack falls through to system 'Segoe UI' or generic
 * sans-serif. Sprint 5+ may bundle the OFL family (per LEGAL.md Sprint 5
 * note) but this lane ships the system reference only (carry-forward of
 * the Sprint 4 lesson — no proprietary asset bundle).
 */
const WIN_FONT_STACK = "system-ui, 'Segoe UI Variable', 'Segoe UI', sans-serif";
/** Z-index — sits above destruction overlay, below CRT (per destruction.css map). */
const BSOD_Z_INDEX = 10002;
/** Sad-face flicker opacity ceiling — when flicker is ON it pulses between this and BSOD_FROWNY_FLICKER_MIN. */
const BSOD_FROWNY_FLICKER_MAX = 1.0;
/** Sad-face flicker opacity floor — per §13 spec 1 → 0.7 → 1. */
const BSOD_FROWNY_FLICKER_MIN = 0.7;
/** Default sad-face opacity when flicker is OFF (under reduced-motion). */
const BSOD_FROWNY_STATIC_OPACITY = 0.95;
/** Headline line-height multiplier per §13 calm typography brief. */
const BSOD_HEADLINE_LINE_HEIGHT = 1.3;
/** Sad-face left inset (% of viewport width) — §13 spec. */
const BSOD_FROWNY_LEFT_INSET_PCT = 12;
/** Sad-face top inset (% of viewport height) — §13 spec. */
const BSOD_FROWNY_TOP_INSET_PCT = 18;
/** QR PNG left inset (% of viewport width) — §13 spec. */
const BSOD_QR_LEFT_INSET_PCT = 12;
/** QR PNG bottom inset (% of viewport height) — §13 spec. */
const BSOD_QR_BOTTOM_INSET_PCT = 24;
/** Stop code right inset (mirrors QR left inset) — §13 spec. */
const BSOD_STOPCODE_RIGHT_INSET_PCT = 12;
/** Stop code bottom inset (mirrors QR bottom inset). */
const BSOD_STOPCODE_BOTTOM_INSET_PCT = 24;
/**
 * Asset URL — Lane D vendored a REAL QR PNG encoding the documented MS
 * URL. Resolved via Vite `?url` import at module scope so the build
 * pipeline picks the PNG up automatically (hashed in `out/renderer/assets/`
 * at build time; dev-server URL in dev mode). The path is read
 * synchronously at module load so the chrome can mount immediately
 * without an async fetch.
 */
const QR_ASSET_PATH = winBsodQrUrl;
/** Stop code identifier — literal English (NOT translated; it IS the Windows error code). */
const STOP_CODE_LITERAL = 'CRITICAL_PROCESS_DIED';

/**
 * Defensive EN fallback for the BSOD headline — used ONLY when i18n
 * resolution returns the bare key (signalling miss). Lane 0 i18n
 * handoff explicitly recommended this fallback constant so an
 * empty/failing locale tree does not leave the BSOD blank.
 */
const EN_HEADLINE_FALLBACK = 'Your PC ran into a problem and needs to restart.';
/** Defensive EN fallback for the collecting-info sub-text. */
const EN_COLLECTING_FALLBACK =
  "We're just collecting some error info, and then we'll restart for you.";
/** Defensive EN fallback for the percent-complete copy. */
const EN_PERCENT_FALLBACK = '0% complete';
/** Defensive EN fallback for the stop-code line label. */
const EN_STOPCODE_FALLBACK = `Stop code: ${STOP_CODE_LITERAL}`;
/** Defensive EN fallback for the QR caption. */
const EN_QR_CAPTION_FALLBACK =
  'For more information about this issue and possible fixes, visit https://www.windows.com/stopcode';

/* ------------------------------------------------------------------------ */
/* i18n helpers                                                             */
/* ------------------------------------------------------------------------ */

/**
 * Resolve a localised string with template interpolation; fall back to the
 * provided default if the locale tree returns the bare key (Lane 0 contract
 * note — t() returns the key string itself on miss; we use that to detect
 * resolution failure and substitute the defensive EN fallback).
 *
 * Token replacement is intentionally minimal (one regex pass per token
 * name) so the surface stays small and predictable.
 */
function localise(
  key: Parameters<typeof t>[0],
  locale: ReturnType<typeof resolveUserLocale>,
  fallback: string,
  tokens?: Readonly<Record<string, string>>,
): string {
  const raw = t(key, locale);
  // t() returns the key on miss — use that as the resolution-fail signal.
  let value = raw === key ? fallback : raw;
  if (tokens !== undefined) {
    for (const [name, replacement] of Object.entries(tokens)) {
      value = value.split(`{${name}}`).join(replacement);
    }
  }
  return value;
}

/* ------------------------------------------------------------------------ */
/* DOM builders                                                             */
/* ------------------------------------------------------------------------ */

/**
 * Build the sad-face glyph element. The `:(` is rendered as a single
 * text node at FAZ6_WIN_FROWNY_FONT_SIZE_PX, positioned absolutely at
 * the top-left of the viewport. Sets `aria-hidden` because the glyph is
 * decorative (the headline carries the actual semantic alarm).
 */
function createSadFace(): HTMLDivElement {
  const sad = document.createElement('div');
  sad.dataset.role = 'win-bsod-frowny';
  sad.setAttribute('aria-hidden', 'true');
  sad.textContent = ':(';
  const s = sad.style;
  s.position = 'absolute';
  s.top = `${BSOD_FROWNY_TOP_INSET_PCT}%`;
  s.left = `${BSOD_FROWNY_LEFT_INSET_PCT}%`;
  s.fontSize = `${FAZ6_WIN_FROWNY_FONT_SIZE_PX}px`;
  s.fontWeight = '600';
  s.lineHeight = '1';
  s.color = FAZ6_WIN_FG_COLOR;
  s.opacity = String(BSOD_FROWNY_STATIC_OPACITY);
  // Pre-compose for cheap opacity strobe — keeps the glyph on its own
  // compositor layer so the 5Hz interval does not retrigger paint of the
  // surrounding text. Reduced-motion path never reads this.
  s.willChange = 'opacity';
  return sad;
}

/**
 * Build the right-of-frowny text stack (headline + collecting-info + percent).
 * Positioned absolutely so the layout reads identically across viewport
 * sizes (the real Win11 BSOD scales by viewport, not by container flex).
 */
function createTextStack(
  locale: ReturnType<typeof resolveUserLocale>,
): HTMLDivElement {
  const stack = document.createElement('div');
  stack.dataset.role = 'win-bsod-text-stack';
  const s = stack.style;
  s.position = 'absolute';
  // Place text stack to the right of the sad face (frowny is ~140px wide
  // at top-left inset 12%); add ~16% from left so headline starts beside
  // it, then wraps freely up to 60% max-width per §13.
  s.top = `${BSOD_FROWNY_TOP_INSET_PCT + 6}%`;
  s.left = `${BSOD_FROWNY_LEFT_INSET_PCT + 16}%`;
  s.maxWidth = '60vw';
  s.color = FAZ6_WIN_FG_COLOR;
  s.fontFamily = WIN_FONT_STACK;
  s.fontWeight = String(FAZ6_WIN_BODY_FONT_WEIGHT);
  const headline = document.createElement('div');
  headline.dataset.role = 'win-bsod-headline';
  headline.textContent = localise('destruction.faz6.win.headline', locale, EN_HEADLINE_FALLBACK);
  headline.style.fontSize = '28px';
  headline.style.fontWeight = String(FAZ6_WIN_BODY_FONT_WEIGHT);
  headline.style.lineHeight = String(BSOD_HEADLINE_LINE_HEIGHT);
  stack.appendChild(headline);
  const collecting = document.createElement('div');
  collecting.dataset.role = 'win-bsod-collecting';
  collecting.textContent = localise(
    'destruction.faz6.win.collectingInfo',
    locale,
    EN_COLLECTING_FALLBACK,
  );
  collecting.style.fontSize = '18px';
  collecting.style.marginTop = '24px';
  collecting.style.lineHeight = String(BSOD_HEADLINE_LINE_HEIGHT);
  stack.appendChild(collecting);
  const percent = document.createElement('div');
  percent.dataset.role = 'win-bsod-percent';
  percent.textContent = localise(
    'destruction.faz6.win.percentComplete',
    locale,
    EN_PERCENT_FALLBACK,
    { pct: '0' },
  );
  percent.style.fontSize = '18px';
  percent.style.marginTop = '32px';
  stack.appendChild(percent);
  return stack;
}

/**
 * Build the bottom-left QR + caption block. The QR is a real PNG whose
 * encoded payload is `https://www.windows.com/stopcode` (URL text only —
 * NOT a Microsoft logo or branded image). The caption is localised text
 * describing the link's purpose.
 */
function createQrBlock(
  locale: ReturnType<typeof resolveUserLocale>,
): HTMLDivElement {
  const block = document.createElement('div');
  block.dataset.role = 'win-bsod-qr-block';
  const s = block.style;
  s.position = 'absolute';
  s.left = `${BSOD_QR_LEFT_INSET_PCT}%`;
  s.bottom = `${BSOD_QR_BOTTOM_INSET_PCT}%`;
  s.display = 'flex';
  s.flexDirection = 'column';
  s.alignItems = 'flex-start';
  s.gap = '8px';
  s.color = FAZ6_WIN_FG_COLOR;
  s.fontFamily = WIN_FONT_STACK;
  const img = document.createElement('img');
  img.src = QR_ASSET_PATH;
  img.width = FAZ6_WIN_QR_DIMENSION_PX;
  img.height = FAZ6_WIN_QR_DIMENSION_PX;
  img.alt = 'QR code linking to Windows stop code reference';
  img.style.imageRendering = 'pixelated';
  img.style.background = '#FFFFFF';
  block.appendChild(img);
  const caption = document.createElement('div');
  caption.dataset.role = 'win-bsod-qr-caption';
  caption.textContent = localise(
    'destruction.faz6.win.qrCaption',
    locale,
    EN_QR_CAPTION_FALLBACK,
  );
  caption.style.fontSize = '10px';
  caption.style.fontWeight = '300';
  caption.style.maxWidth = `${FAZ6_WIN_QR_DIMENSION_PX + 80}px`;
  caption.style.lineHeight = '1.4';
  block.appendChild(caption);
  return block;
}

/**
 * Build the bottom-right stop-code line. Mirrors the QR position on the
 * opposite side per §13 spec. Stop code identifier is the literal English
 * "CRITICAL_PROCESS_DIED" — NOT translated; it is the actual Windows
 * error code name and reads believably in any locale.
 */
function createStopCodeLine(
  locale: ReturnType<typeof resolveUserLocale>,
): HTMLDivElement {
  const line = document.createElement('div');
  line.dataset.role = 'win-bsod-stopcode';
  const s = line.style;
  s.position = 'absolute';
  s.right = `${BSOD_STOPCODE_RIGHT_INSET_PCT}%`;
  s.bottom = `${BSOD_STOPCODE_BOTTOM_INSET_PCT}%`;
  s.color = FAZ6_WIN_FG_COLOR;
  s.fontFamily = WIN_FONT_STACK;
  s.fontSize = '18px';
  s.fontWeight = '400';
  line.textContent = localise(
    'destruction.faz6.win.stopCode',
    locale,
    EN_STOPCODE_FALLBACK,
    { code: STOP_CODE_LITERAL },
  );
  return line;
}

/* ------------------------------------------------------------------------ */
/* Mount entry point                                                        */
/* ------------------------------------------------------------------------ */

/** Mount-arg bag. */
export interface MountWinBsodArgs {
  readonly hostElement: HTMLElement;
  readonly stopCode: string;
  /**
   * Stuck progress percent (kept as parameter for symmetry — typically
   * 0 per PLAN §7 "Progress %0 takılı"; passed-in value is rendered
   * as-is so a Sprint 6 reveal hand-off could vary by cycle).
   */
  readonly panicPercent: number;
  readonly signal: AbortSignal;
}

/**
 * Mount the Win11 BSOD full-screen into the destruction container.
 * Returns a handle whose `startFrownyFlicker()` engages the CRT flicker
 * (no-op under reduced-motion) and `dispose()` removes the BSOD +
 * cancels any in-flight setInterval.
 *
 * The implementation intentionally does NOT honour the `stopCode` /
 * `panicPercent` args in the rendered DOM right now — they exist on the
 * interface so a Sprint 6 reveal hand-off can vary the displayed stop
 * code per cycle (e.g. flicker the stop code between PROCESS_DIED and
 * KERNEL_SECURITY_CHECK as a Sprint 6 polish beat). Sprint 5 ships the
 * static "CRITICAL_PROCESS_DIED" literal that destruction-direction.md
 * §13 calls out.
 */
/**
 * Build the root BSOD container — sets the inline styles and ARIA
 * attributes and returns the element. Kept as a separate function so
 * mountWinBsod() stays under the 50-line cap (eslint
 * max-lines-per-function).
 */
function createBsodRoot(): HTMLDivElement {
  const element = document.createElement('div');
  element.className = 'faz6-win-bsod';
  element.setAttribute('role', 'alert');
  element.setAttribute('aria-live', 'assertive');
  const s = element.style;
  s.position = 'fixed';
  s.inset = '0';
  s.background = FAZ6_WIN_BG_COLOR;
  s.color = FAZ6_WIN_FG_COLOR;
  s.fontFamily = WIN_FONT_STACK;
  s.fontWeight = String(FAZ6_WIN_BODY_FONT_WEIGHT);
  s.zIndex = String(BSOD_Z_INDEX);
  s.overflow = 'hidden';
  return element;
}

/**
 * Internal mutable state bag for the flicker timer. The setInterval id
 * + toggle bit are encapsulated here so the public handle methods stay
 * small and the lint cap is respected. Owned by THIS module per
 * FROWNY_FLICKER_TIMER_OWNER decree.
 */
interface FlickerState {
  intervalId: ReturnType<typeof setInterval> | null;
  toggle: boolean;
}

/** Start the 5Hz strobe on the supplied sad-face element. Idempotent. */
function startFlicker(state: FlickerState, sadFace: HTMLElement): void {
  if (state.intervalId !== null) {
    return;
  }
  const halfPeriodMs = Math.round(1000 / (FAZ6_FROWNY_FLICKER_HZ * 2));
  state.intervalId = setInterval((): void => {
    state.toggle = !state.toggle;
    sadFace.style.opacity = String(
      state.toggle ? BSOD_FROWNY_FLICKER_MIN : BSOD_FROWNY_FLICKER_MAX,
    );
  }, halfPeriodMs);
}

/** Stop the flicker strobe (idempotent). */
function stopFlicker(state: FlickerState): void {
  if (state.intervalId !== null) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
}

export function mountWinBsod(args: MountWinBsodArgs): WinBsodHandle {
  const reduceMotion = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;
  const locale = resolveUserLocale();
  const element = createBsodRoot();
  const sadFace = createSadFace();
  element.appendChild(sadFace);
  element.appendChild(createTextStack(locale));
  element.appendChild(createQrBlock(locale));
  element.appendChild(createStopCodeLine(locale));
  args.hostElement.appendChild(element);
  const flickerState: FlickerState = { intervalId: null, toggle: false };
  let disposed = false;
  const handle: WinBsodHandle = {
    kind: 'win-bsod',
    element,
    startFrownyFlicker: (): void => {
      if (disposed) return;
      if (reduceMotion) {
        // a11y matrix row 33 — no flicker under reduced-motion.
        sadFace.style.opacity = String(BSOD_FROWNY_FLICKER_MAX);
        return;
      }
      startFlicker(flickerState, sadFace);
    },
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      stopFlicker(flickerState);
      if (element.parentNode !== null) {
        element.parentNode.removeChild(element);
      }
    },
  };
  // Honour an externally-aborted signal — dispose immediately if the
  // caller fed an already-aborted signal (defensive against a Faz 6
  // entry race where the destruction-director aborts mid-mount).
  if (args.signal.aborted) {
    handle.dispose();
  } else {
    args.signal.addEventListener('abort', (): void => handle.dispose(), { once: true });
  }
  return handle;
}
