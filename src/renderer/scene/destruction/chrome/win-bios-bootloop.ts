/**
 * Win11 BIOS-style bootloop screen — Sprint 5 Phase 2B Lane D FILL.
 *
 * Composition (top-to-bottom, all inside the ASCII border box):
 *   - Header text:       "American Megatrends Inc." style POST line.
 *   - Drive detection:   "Detecting drives..." preamble.
 *   - Headline:          localised "No bootable device" message.
 *   - Action prompt:     localised "Press F1 to retry, F2 for setup".
 *   - Footer:            blinking "Restarting…" indicator (visible only
 *                        in 'restart-pending' state).
 *
 * The screen is a full-viewport `<pre>`-like monospace container with
 * box-drawing characters (═║╔╗╚╝) forming the outer border. Background
 * is FAZ7_WIN_BG_COLOR (#0B0F8B BIOS POST blue — distinct from Faz 6
 * BSOD blue) and foreground is FAZ7_WIN_FG_COLOR (#FFFFFF).
 *
 * SHARED RESOURCES OWNED:
 *   - none. The bootloop cycle setInterval is OWNED by faz7-bootloop.ts
 *     (BOOTLOOP_CYCLE_TIMER_OWNER decree). This chrome receives setState
 *     calls from the runner; it never starts a timer of its own. The
 *     "Restarting…" blink in restart-pending state is the ONE local
 *     animation, and it's a CSS @keyframes (not a JS interval) so the
 *     ownership-decree contract is upheld.
 *
 * State machine (driven by faz7-bootloop runner via setState):
 *   - 'no-boot':         primary content visible ("No bootable device"
 *                        + F1/F2 prompt).
 *   - 'restart-pending': same primary content + blinking "Restarting…"
 *                        footer.
 *
 * Reduced-motion (a11y matrix row 36):
 *   - Bypass cycle entirely — hold "No bootable device" caption for
 *     the full Faz 7 window. This module does not enforce the cycle
 *     bypass (Lane A's runner decides whether to call setState at all);
 *     here we only ensure the blink animation is removed under reduced
 *     motion so an externally-driven restart-pending hold reads as
 *     static "Restarting…" (no strobe).
 *
 * ARIA (a11y matrix row 36):
 *   - role="application" (the BIOS takeover IS a fake application
 *     surface; "alert" would over-claim semantic urgency for a
 *     decorative joke screen).
 *
 * S6 risk closure:
 *   - NO real BIOS vendor logo bundled.
 *   - "American Megatrends Inc." is rendered as PLAIN TEXT in a
 *     monospace font — it is a well-known PC BIOS vendor brand reference
 *     used as common-noun BIOS-POST flavour text. NOT a logo, NOT a
 *     trademark-styled mark. The §13 directive expressly permitted this
 *     header line as flavour.
 *   - NO Consolas / Cascadia Code bundled — system stack fallback only.
 *
 * WHO CALLS THIS:
 *   - faz7-bootloop.ts when os === 'win':
 *     `const handle = mountWinBiosBootloop({...});
 *      handle.setState('no-boot');`
 */

import {
  FAZ7_WIN_BG_COLOR,
  FAZ7_WIN_FG_COLOR,
  PREFERS_REDUCED_MOTION_QUERY,
} from '../../../../shared/scene-destruction-constants.js';
import type { WinBiosBootloopHandle } from '../types.js';
import { resolveUserLocale, t } from '../../../i18n/strings.js';

/* ------------------------------------------------------------------------ */
/* Local design tokens                                                      */
/* ------------------------------------------------------------------------ */

/** Z-index — Faz 7 bootloop full-screen tier per destruction.css map. */
const WIN_BIOS_Z_INDEX = 9600;
/** Monospace font stack — Consolas → system mono. NO bundled fonts. */
const WIN_BIOS_MONO_STACK = "'Consolas', ui-monospace, 'Cascadia Mono', monospace";
/** Base monospace font size (CSS px) — matches Faz 5 Win surface for cross-faz coherence. */
const WIN_BIOS_FONT_SIZE_PX = 14;
/** ASCII border total width in monospace cells. */
const WIN_BIOS_BOX_WIDTH = 78;
/** Restart-pending blink rate (Hz) — gated under reduced-motion. */
const WIN_BIOS_BLINK_HZ = 1;

/**
 * Defensive EN fallback strings — used ONLY when i18n resolution returns
 * the bare key (signalling miss). Mirrors the win-bsod.ts pattern.
 */
const EN_HEADLINE_FALLBACK = 'No bootable device';
const EN_ACTION_FALLBACK = 'Press F1 to retry, F2 for setup';
/**
 * Restart indicator EN fallback — keyed as `destruction.faz7.win.restarting`
 * for locale switching (RU: "Перезапуск…", TR: "Yeniden başlatılıyor…").
 */
const EN_RESTARTING_FALLBACK = 'Restarting…';
/**
 * Header line — designer-fictional but recognisably BIOS-POST family.
 * "American Megatrends Inc." appears as plain monospace text (NOT a
 * logo/trademark mark) per §14 directive. Followed by a fictional
 * motherboard model line for verisimilitude.
 */
const BIOS_HEADER_LINE_1 = 'American Megatrends Inc. — BIOS Setup Utility';
const BIOS_HEADER_LINE_2 = 'Model: AMI-9F45-X86_64  ·  Rev: 4.6.5  ·  Build: 2026-05-21';
/** Drive detection preamble text. */
const DRIVE_DETECT_LINE = 'Detecting drives ........................ [NONE]';

/* ------------------------------------------------------------------------ */
/* i18n helper (mirrors win-bsod.ts pattern)                                */
/* ------------------------------------------------------------------------ */

function localise(
  key: Parameters<typeof t>[0],
  locale: ReturnType<typeof resolveUserLocale>,
  fallback: string,
): string {
  const raw = t(key, locale);
  return raw === key ? fallback : raw;
}

/* ------------------------------------------------------------------------ */
/* DOM builder                                                              */
/* ------------------------------------------------------------------------ */

/**
 * Compose the inner text content of the BIOS frame as a series of
 * monospace lines wrapped in box-drawing characters. The frame is
 * rendered as a single `<pre>`-style block so the spacing reads
 * faithfully across font-size scaling.
 *
 * Layout (78-cell wide):
 *
 *   ╔══════════════════════════════════════════════════════════════════════════╗
 *   ║   American Megatrends Inc. — BIOS Setup Utility                          ║
 *   ║   Model: AMI-9F45-X86_64  ·  Rev: 4.6.5  ·  Build: 2026-05-21            ║
 *   ║                                                                          ║
 *   ║   Detecting drives ........................ [NONE]                      ║
 *   ║                                                                          ║
 *   ║   <localised "No bootable device">                                       ║
 *   ║   <localised "Press F1 to retry, F2 for setup">                          ║
 *   ║                                                                          ║
 *   ║   [restart-pending only]  Restarting…                                    ║
 *   ╚══════════════════════════════════════════════════════════════════════════╝
 */
function composeFrame(args: {
  readonly headline: string;
  readonly action: string;
}): string {
  const inner = WIN_BIOS_BOX_WIDTH - 2; // minus the two ║ side chars
  const top = `╔${'═'.repeat(inner)}╗`;
  const bottom = `╚${'═'.repeat(inner)}╝`;
  const blank = `║${' '.repeat(inner)}║`;
  const row = (content: string): string => {
    // Indent content 3 cells, then pad to (inner - 3).
    const padded = `   ${content}`.padEnd(inner, ' ').slice(0, inner);
    return `║${padded}║`;
  };
  return [
    top,
    blank,
    row(BIOS_HEADER_LINE_1),
    row(BIOS_HEADER_LINE_2),
    blank,
    row(DRIVE_DETECT_LINE),
    blank,
    row(args.headline),
    row(args.action),
    blank,
    bottom,
  ].join('\n');
}

/* ------------------------------------------------------------------------ */
/* Mount entry point                                                        */
/* ------------------------------------------------------------------------ */

/** Mount-arg bag. */
export interface MountWinBiosBootloopArgs {
  readonly hostElement: HTMLElement;
  readonly signal: AbortSignal;
}

/**
 * Mount the Win11 BIOS bootloop screen into the destruction container.
 * Returns a handle whose `setState(state)` transitions between no-boot
 * (primary content) and restart-pending (primary content + blinking
 * "Restarting…" footer) and `dispose()` removes the screen.
 */
/** Build the root BIOS container — sets inline styles and ARIA. */
function createBiosRoot(): HTMLDivElement {
  const element = document.createElement('div');
  element.className = 'faz7-win-bios-bootloop';
  element.setAttribute('role', 'application');
  element.setAttribute('aria-label', 'BIOS boot screen');
  const s = element.style;
  s.position = 'fixed';
  s.inset = '0';
  s.background = FAZ7_WIN_BG_COLOR;
  s.color = FAZ7_WIN_FG_COLOR;
  s.fontFamily = WIN_BIOS_MONO_STACK;
  s.fontSize = `${WIN_BIOS_FONT_SIZE_PX}px`;
  s.lineHeight = '1.4';
  s.zIndex = String(WIN_BIOS_Z_INDEX);
  s.overflow = 'hidden';
  s.display = 'flex';
  s.alignItems = 'center';
  s.justifyContent = 'center';
  return element;
}

/** Build the ASCII <pre> frame populated with the localised content. */
function createFrameElement(text: string): HTMLPreElement {
  const frame = document.createElement('pre');
  frame.dataset.role = 'win-bios-frame';
  frame.textContent = text;
  const fs = frame.style;
  fs.margin = '0';
  fs.fontFamily = WIN_BIOS_MONO_STACK;
  fs.fontSize = `${WIN_BIOS_FONT_SIZE_PX}px`;
  fs.lineHeight = '1.4';
  fs.color = FAZ7_WIN_FG_COLOR;
  fs.whiteSpace = 'pre';
  fs.padding = '24px';
  return frame;
}

/**
 * Build the "Restarting…" indicator. Hidden by default; shown when
 * setState('restart-pending') runs. Under reduced-motion, the blink
 * animation is suppressed so the indicator reads as static.
 * Text is locale-switched via `destruction.faz7.win.restarting`.
 */
function createRestartIndicator(restartingText: string, reduceMotion: boolean): HTMLDivElement {
  const indicator = document.createElement('div');
  indicator.dataset.role = 'win-bios-restart';
  indicator.textContent = restartingText;
  const rs = indicator.style;
  rs.position = 'absolute';
  rs.bottom = '48px';
  rs.left = '0';
  rs.right = '0';
  rs.textAlign = 'center';
  rs.fontFamily = WIN_BIOS_MONO_STACK;
  rs.fontSize = `${WIN_BIOS_FONT_SIZE_PX}px`;
  rs.color = FAZ7_WIN_FG_COLOR;
  rs.display = 'none';
  if (!reduceMotion) {
    rs.animation = `winBiosRestartBlink ${1 / WIN_BIOS_BLINK_HZ}s steps(2, start) infinite`;
  }
  return indicator;
}

export function mountWinBiosBootloop(
  args: MountWinBiosBootloopArgs,
): WinBiosBootloopHandle {
  const reduceMotion = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;
  const locale = resolveUserLocale();
  const headline = localise('destruction.faz7.win.headline', locale, EN_HEADLINE_FALLBACK);
  const action = localise('destruction.faz7.win.action', locale, EN_ACTION_FALLBACK);
  const restarting = localise('destruction.faz7.win.restarting', locale, EN_RESTARTING_FALLBACK);
  const element = createBiosRoot();
  element.appendChild(createFrameElement(composeFrame({ headline, action })));
  const restartIndicator = createRestartIndicator(restarting, reduceMotion);
  element.appendChild(restartIndicator);
  args.hostElement.appendChild(element);
  let disposed = false;
  const handle: WinBiosBootloopHandle = {
    kind: 'win-bios-bootloop',
    element,
    setState: (state: 'no-boot' | 'restart-pending'): void => {
      if (disposed) return;
      restartIndicator.style.display = state === 'restart-pending' ? 'block' : 'none';
    },
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      if (element.parentNode !== null) {
        element.parentNode.removeChild(element);
      }
    },
  };
  if (args.signal.aborted) {
    handle.dispose();
  } else {
    args.signal.addEventListener('abort', (): void => handle.dispose(), { once: true });
  }
  return handle;
}
