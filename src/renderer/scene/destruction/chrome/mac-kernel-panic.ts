/**
 * macOS Kernel Panic full-screen chrome — Sprint 5 Phase 2B Lane C FILL.
 *
 * WHO CALLS THIS: faz6-bsod.ts#mountMacKernelPanic — single caller, Mac
 * branch only.
 *
 * SHARED RESOURCES OWNED: none directly — the hex panic-log scroll cadence
 * is OWNED by faz6-bsod.ts (HEX_PANIC_DUMP_OWNER decree) but the setInterval
 * driver lives here; faz6 invokes `animateHexDump()` once after mount and
 * the impl owns the interval id until `dispose()`.
 *
 * CALLEES (Phase 2B Lane C wires):
 *   - inline DOM construction (no other module imports)
 *   - destruction-direction.md §13 4-language text block (EN/JP/RU/TR)
 *     — EN+JP HARDCODED as presentation constants per Phase 2A §13
 *       (presentation strings, NOT i18n keys);
 *     — RU+TR resolved via i18n keys `destruction.faz6.mac.panicHeadline{Ru,Tr}`
 *
 * Visual specs (destruction-direction.md §13 + scene-destruction-constants.ts):
 *   - DOM: full-screen `position: fixed; inset: 0; background:
 *     FAZ6_MAC_BG_COLOR (#1D1D1F); color: FAZ6_MAC_FG_COLOR (#FFFFFF)`.
 *   - Font-family `-apple-system, "Helvetica Neue", sans-serif`
 *     reference (NO SF Pro bundle / NO Helvetica Neue Light bundle per
 *     S6 closure + Sprint 4 Lesson #4 no-proprietary-asset).
 *   - Font-weight FAZ6_MAC_PANIC_FONT_WEIGHT (300 = Light).
 *   - 4-language headline centred:
 *       EN: "You need to restart your computer." (HARDCODED literal)
 *       JP: "コンピュータを再起動する必要があります。" (HARDCODED literal)
 *       RU: t('destruction.faz6.mac.panicHeadlineRu')
 *       TR: t('destruction.faz6.mac.panicHeadlineTr')
 *     Each line FAZ6_MAC_PANIC_FONT_SIZE_PX=18, line-height 1.5,
 *     inter-line gap FAZ6_MAC_PANIC_LINE_GAP_PX=12.
 *   - Hex dump bottom area: monospace 11px / opacity 0.6,
 *     `ui-monospace, "SF Mono", Menlo, monospace` reference (no SF Mono
 *     bundle — system fallback to Menlo). Scrolls bottom-to-top at
 *     FAZ6_HEX_DUMP_LINE_HZ=6 lines/sec. Top fade-out gradient mask.
 *   - Position: hex dump 80px below headline block per Phase 2A §13.
 *
 * Reduced-motion gate (designer Phase 2A §16 row 31):
 *   - Hex-dump auto-scroll: first 20 lines rendered statically; no
 *     interval started; `aria-live="off"` so screen readers don't try
 *     to read random hex.
 *
 * ARIA (matrix row 30, 31):
 *   - Root: `role="alert" aria-live="assertive"` (the panic is the
 *     loudest possible system surface).
 *   - Hex dump container: `role="log" aria-live="off"` (random hex is
 *     not screen-reader content).
 */

import type { MacKernelPanicHandle } from '../types.js';
import {
  FAZ6_MAC_BG_COLOR,
  FAZ6_MAC_FG_COLOR,
  FAZ6_MAC_PANIC_FONT_WEIGHT,
  FAZ6_MAC_PANIC_FONT_SIZE_PX,
  FAZ6_MAC_PANIC_LINE_GAP_PX,
  FAZ6_HEX_DUMP_LINE_HZ,
  PREFERS_REDUCED_MOTION_QUERY,
} from '../../../../shared/scene-destruction-constants.js';
import { resolveUserLocale, t } from '../../../i18n/strings.js';

/* ------------------------------------------------------------------------ */
/* Presentation constants — Phase 2A §13 mandate                            */
/*                                                                          */
/* EN + JP literals are DESIGNER-MANDATED presentation strings. They render */
/* regardless of runtime locale; the multilingual visual IS the design.    */
/* Lane 0 i18n handoff (phase2b-lane0-i18n.md §"Faz 6 Mac Kernel Panic")   */
/* explicitly forbids adding them to STRINGS.* — they are NOT translatable */
/* content, they are typography composing a visual identity.               */
/* ------------------------------------------------------------------------ */

/** EN panic headline — presentation constant, renders regardless of locale. */
const KERNEL_PANIC_EN =
  'You need to restart your computer. Hold down the Power button for several seconds or press the Restart button.';

/** JP panic headline — presentation constant, renders regardless of locale. */
const KERNEL_PANIC_JP =
  'コンピュータを再起動する必要があります。パワーボタンを数秒間押し続けるか、リスタートボタンを押してください。';

/* ------------------------------------------------------------------------ */
/* Hex dump layout constants — local to this lane (no SSOT bleed)           */
/* ------------------------------------------------------------------------ */

/** Hex dump font-size (CSS px). Smaller than headline — secondary surface. */
const HEX_DUMP_FONT_SIZE_PX = 11;
/** Hex dump opacity — visibly less prominent than the headline. */
const HEX_DUMP_OPACITY = 0.6;
/** Hex dump line-height multiplier. Tight monospace — reads as logs. */
const HEX_DUMP_LINE_HEIGHT = 1.3;
/** Hex dump container max-height (CSS px). Bottom ~40% of viewport. */
const HEX_DUMP_MAX_HEIGHT_PX = 280;
/** Vertical gap between headline block and hex dump (CSS px). Phase 2A §13. */
const HEADLINE_TO_HEXDUMP_GAP_PX = 80;
/** Number of static lines rendered when reduced-motion is active. */
const REDUCED_MOTION_STATIC_LINES = 20;
/** Max retained lines in the dump (FIFO eviction past this). */
const HEX_DUMP_MAX_LINES = 200;
/** Z-index inside destruction container — Phase 2A §13 z-index map (9400). */
const KERNEL_PANIC_Z_INDEX = '9400';

/* ------------------------------------------------------------------------ */
/* DOM builders (each ≤50L per max-lines-per-function discipline).          */
/* ------------------------------------------------------------------------ */

/**
 * Build the full-screen root element. Background + foreground + font-family
 * + z-index. ARIA role+live set here so the panic surface announces itself
 * the moment it mounts.
 */
function buildRoot(): HTMLDivElement {
  const root = document.createElement('div');
  root.className = 'faz6-mac-kernel-panic';
  root.setAttribute('role', 'alert');
  root.setAttribute('aria-live', 'assertive');
  const s = root.style;
  s.position = 'fixed';
  s.inset = '0';
  s.zIndex = KERNEL_PANIC_Z_INDEX;
  s.background = FAZ6_MAC_BG_COLOR;
  s.color = FAZ6_MAC_FG_COLOR;
  s.fontFamily = '-apple-system, "Helvetica Neue", sans-serif';
  s.fontWeight = String(FAZ6_MAC_PANIC_FONT_WEIGHT);
  s.display = 'flex';
  s.flexDirection = 'column';
  s.alignItems = 'center';
  s.justifyContent = 'flex-start';
  s.paddingTop = '15vh';
  s.boxSizing = 'border-box';
  s.overflow = 'hidden';
  return root;
}

/**
 * Build a single centred headline line. Reused four times (EN/JP/RU/TR).
 * Returns a <p> with the 18px / line-height-1.5 / centred typography spec.
 */
function buildHeadlineLine(text: string, lang: string): HTMLParagraphElement {
  const p = document.createElement('p');
  p.textContent = text;
  p.lang = lang;
  const s = p.style;
  s.margin = '0';
  s.padding = '0';
  s.textAlign = 'center';
  s.fontSize = `${FAZ6_MAC_PANIC_FONT_SIZE_PX}px`;
  s.lineHeight = '1.5';
  s.fontWeight = String(FAZ6_MAC_PANIC_FONT_WEIGHT);
  s.maxWidth = '720px';
  return p;
}

/**
 * Build the 4-language headline block. Order is DESIGNER-MANDATED:
 * EN → JP → RU → TR. EN + JP literals come from local presentation
 * constants; RU + TR come from i18n at runtime.
 */
function buildHeadlineBlock(): HTMLDivElement {
  const block = document.createElement('div');
  block.className = 'faz6-mac-kernel-panic__headline';
  const s = block.style;
  s.display = 'flex';
  s.flexDirection = 'column';
  s.alignItems = 'center';
  s.gap = `${FAZ6_MAC_PANIC_LINE_GAP_PX}px`;
  s.maxWidth = '720px';

  const locale = resolveUserLocale();
  const en = buildHeadlineLine(KERNEL_PANIC_EN, 'en');
  const jp = buildHeadlineLine(KERNEL_PANIC_JP, 'ja');
  const ru = buildHeadlineLine(t('destruction.faz6.mac.panicHeadlineRu', locale), 'ru');
  const tr = buildHeadlineLine(t('destruction.faz6.mac.panicHeadlineTr', locale), 'tr');

  block.append(en, jp, ru, tr);
  return block;
}

/**
 * Build the hex-dump container. Monospace + opacity 0.6 + top fade-out
 * gradient mask. The container scrolls bottom-to-top: new lines append at
 * the bottom and older lines fade out the top edge through the CSS mask.
 *
 * `role="log" aria-live="off"` so screen readers don't try to read random
 * hex bytes (matrix row 31).
 */
function buildHexDump(): HTMLDivElement {
  const dump = document.createElement('div');
  dump.className = 'faz6-mac-kernel-panic__hexdump';
  dump.setAttribute('role', 'log');
  dump.setAttribute('aria-live', 'off');
  const s = dump.style;
  s.marginTop = `${HEADLINE_TO_HEXDUMP_GAP_PX}px`;
  s.fontFamily = 'ui-monospace, "SF Mono", Menlo, monospace';
  s.fontSize = `${HEX_DUMP_FONT_SIZE_PX}px`;
  s.lineHeight = String(HEX_DUMP_LINE_HEIGHT);
  s.opacity = String(HEX_DUMP_OPACITY);
  s.color = FAZ6_MAC_FG_COLOR;
  s.width = '80%';
  s.maxWidth = '900px';
  s.maxHeight = `${HEX_DUMP_MAX_HEIGHT_PX}px`;
  s.overflow = 'hidden';
  s.display = 'flex';
  s.flexDirection = 'column';
  s.justifyContent = 'flex-end';
  // Top fade-out gradient mask — older lines fade into transparency at the
  // top edge. Vendor-prefixed mirror for Safari.
  const maskGradient = 'linear-gradient(to bottom, transparent 0%, black 30%, black 100%)';
  s.maskImage = maskGradient;
  s.setProperty('-webkit-mask-image', maskGradient);
  s.whiteSpace = 'pre';
  return dump;
}

/* ------------------------------------------------------------------------ */
/* Hex-line procedural generation                                           */
/* ------------------------------------------------------------------------ */

/**
 * Default panic-log line provider. Used when the caller (faz6-bsod.ts)
 * does NOT supply a custom panicLogProvider. The line format mimics a
 * real macOS panic kernel dump row:
 *   `0x00007fff8a1c2340  41 6c 6c 65 ...`
 *
 * All bytes are Math.random()-generated; NOT a copy of any real macOS
 * panic log content.
 */
function generateDefaultHexLine(addressCounter: { value: number }): string {
  const address = `0x${addressCounter.value.toString(16).padStart(16, '0')}`;
  const bytes: string[] = [];
  for (let i = 0; i < 16; i += 1) {
    bytes.push(
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, '0'),
    );
  }
  addressCounter.value += 16;
  return `${address}  ${bytes.join(' ')}`;
}

/**
 * Append a hex line to the dump, evicting the oldest line once we exceed
 * HEX_DUMP_MAX_LINES to keep the DOM bounded.
 */
function appendHexLine(dump: HTMLDivElement, text: string): void {
  const line = document.createElement('span');
  line.textContent = text;
  line.style.display = 'block';
  dump.appendChild(line);
  while (dump.childElementCount > HEX_DUMP_MAX_LINES) {
    const first = dump.firstElementChild;
    if (first !== null) {
      first.remove();
    } else {
      break;
    }
  }
}

/* ------------------------------------------------------------------------ */
/* Compose helper — assembles root + headline + dump and pre-renders the    */
/* reduced-motion static block. Keeps mountMacKernelPanic under 50 lines    */
/* per max-lines-per-function discipline.                                   */
/* ------------------------------------------------------------------------ */

function composeKernelPanic(
  reducedMotion: boolean,
  provider: () => string,
): { root: HTMLDivElement; dump: HTMLDivElement } {
  const root = buildRoot();
  const headline = buildHeadlineBlock();
  const dump = buildHexDump();
  root.append(headline, dump);
  if (reducedMotion) {
    for (let i = 0; i < REDUCED_MOTION_STATIC_LINES; i += 1) {
      appendHexLine(dump, provider());
    }
  }
  return { root, dump };
}

/* ------------------------------------------------------------------------ */
/* Public mount                                                             */
/* ------------------------------------------------------------------------ */

/** Mount-arg bag. `panicLogProvider` returns lines of hex/text on demand. */
export interface MountMacKernelPanicArgs {
  readonly hostElement: HTMLElement;
  readonly panicLogProvider?: () => string;
  readonly signal: AbortSignal;
}

/**
 * Mount the Mac kernel-panic full-screen overlay into the destruction
 * container. Returns a handle whose `animateHexDump()` kicks the hex log
 * scroll and `dispose()` removes the overlay + clears the interval.
 *
 * Idempotent: `animateHexDump()` is a no-op if already running; `dispose()`
 * is safe to call multiple times.
 */
export function mountMacKernelPanic(
  args: MountMacKernelPanicArgs,
): MacKernelPanicHandle {
  const reducedMotion = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;
  const addressCounter = { value: 0x7fff8a1c2340 };
  const provider = args.panicLogProvider ?? ((): string => generateDefaultHexLine(addressCounter));
  const { root, dump } = composeKernelPanic(reducedMotion, provider);
  args.hostElement.appendChild(root);

  let intervalId: ReturnType<typeof setInterval> | null = null;
  let disposed = false;
  let animationStarted = false;

  const onAbort = (): void => {
    if (disposed) return;
    handle.dispose();
  };
  args.signal.addEventListener('abort', onAbort, { once: true });

  const handle: MacKernelPanicHandle = {
    kind: 'mac-kernel-panic',
    element: root,
    animateHexDump: (): void => {
      if (disposed || animationStarted) return;
      animationStarted = true;
      if (reducedMotion) return;
      const intervalMs = 1000 / FAZ6_HEX_DUMP_LINE_HZ;
      intervalId = setInterval((): void => {
        if (disposed) return;
        appendHexLine(dump, provider());
      }, intervalMs);
    },
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      args.signal.removeEventListener('abort', onAbort);
      root.remove();
    },
  };
  return handle;
}
