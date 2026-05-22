/**
 * Faz 5 — Disk Format (30-37sn). Sprint 5 Phase 2B Lane A FILL.
 *
 * WHO CALLS THIS: destruction-director.ts step('faz5') — single caller.
 *
 * SHARED RESOURCES OWNED (per scene-destruction-constants.ts owner decrees):
 *   - ELECTRICAL_BUZZ_AUDIO_OWNER (destruction-audio.ts ambient buzz layer)
 *   - SECTOR_COUNTER_TIMER_OWNER (setInterval incrementing sector count)
 *   - SMART_ERROR_STREAM_TIMER_OWNER (setInterval streaming S.M.A.R.T.
 *     errors / bad-sector reallocations / SSD wear-level absurdities)
 *
 * SHARED RESOURCES CONSUMED (NOT owned — sourced from Faz 4 owner pool):
 *   - HDD-grind audio: this runner calls setVolume(0.85) on the handle
 *     Faz 4 registered. NEVER re-constructs.
 *   - Fan-overdrive audio: sustained from Faz 4 — Faz 5 leaves it untouched
 *     (Faz 6 owns the peak adjust + stop in the silence cascade).
 *
 * Disk-format visual (PLAN §7 lines 274-277):
 *   - Full ekran ATTENTION headline (mac: Menlo white-on-black; win:
 *     Consolas white-on-#0B0F8B BIOS blue with ASCII box border).
 *   - "Wiping sector 8,492,103 / 2,000,000,000" — ticks at
 *     FAZ5_SECTOR_INCREMENT_PER_SEC.
 *   - 4 rotating S.M.A.R.T. error templates one per FAZ5_SMART_ERROR_INTERVAL_MS.
 *
 * Reduced-motion: SMART error stream throttled to half cadence; sector
 * counter still ticks (functional info). Electrical-buzz handle ships
 * with its own -6dB clamp internally (see destruction-audio-faz45.ts).
 */

import {
  ELECTRICAL_BUZZ_AUDIO_OWNER,
  FAZ5_DURATION_MS,
  FAZ5_MAC_BG_COLOR,
  FAZ5_MAC_FG_COLOR,
  FAZ5_SECTOR_INCREMENT_PER_SEC,
  FAZ5_SECTOR_INITIAL,
  FAZ5_SECTOR_TOTAL,
  FAZ5_SMART_ERROR_INTERVAL_MS,
  FAZ5_WIN_BG_COLOR,
  FAZ5_WIN_BORDER_AMBER_COLOR,
  FAZ5_WIN_FG_COLOR,
  HDD_GRIND_AUDIO_OWNER,
  PREFERS_REDUCED_MOTION_QUERY,
} from '../../../shared/scene-destruction-constants.js';
import {
  createElectricalBuzzHandle,
  type DestructionAudioHandle,
} from '../audio/destruction-audio.js';
import { resolveUserLocale, t, type LocaleKey } from '../../i18n/strings.js';
import type { OsVariant } from './types.js';

/** Runner arg bag. */
export interface Faz5RunArgs {
  readonly os: OsVariant;
  readonly username: string;
  readonly container: HTMLElement;
  readonly destructionAudio: DestructionAudioHandle;
  readonly signal: AbortSignal;
}

/* ------------------------------------------------------------------------ */
/* Local timing + layout constants — designer §13 spec values               */
/* ------------------------------------------------------------------------ */

/** HDD-grind setVolume target for Faz 5 (louder than Faz 4 0.6 default). */
const FAZ5_HDD_GRIND_VOLUME = 0.85;
/** Sector counter tick cadence (ms). 100ms × 4/tick = 40/sec total. */
const FAZ5_SECTOR_TICK_MS = 100;
/** Sectors added per tick — derived from the 40/sec SSOT constant. */
const FAZ5_SECTOR_INCREMENT_PER_TICK = Math.max(
  1,
  Math.round(FAZ5_SECTOR_INCREMENT_PER_SEC / (1000 / FAZ5_SECTOR_TICK_MS)),
);
/** Max number of SMART stream lines visible (older rows scroll out). */
const FAZ5_SMART_STREAM_MAX_ROWS = 12;
/** SSD wear absurdity — designer §13: "wear level 142%" reads as cosmic failure. */
const FAZ5_SMART_WEAR_PERCENT = 142;
/** Z-index — Phase 2A §13 z-index map: Faz 5 takeover = 9300 (above Faz 4 modal). */
const FAZ5_Z_INDEX = '9300';
/** ASCII box-drawing characters for the Win variant border. */
const ASCII_BOX_CHARS = {
  topLeft: '╔',
  topRight: '╗',
  bottomLeft: '╚',
  bottomRight: '╝',
  horizontal: '═',
  vertical: '║',
} as const;
/** Win ASCII box horizontal length (cell count). */
const ASCII_BOX_HORIZONTAL_LEN = 64;

/* ------------------------------------------------------------------------ */
/* Public                                                                   */
/* ------------------------------------------------------------------------ */

/**
 * Run the Faz 5 disk-format sequence. Resolves at FAZ5_DURATION_MS or
 * earlier on ESC-hold abort. Mounts the inline disk-format takeover,
 * boosts HDD-grind, starts the electrical-buzz audio, drives the sector
 * counter + SMART error stream timers, and disposes screen + timers at end.
 */
export async function startFaz5DiskFormat(args: Faz5RunArgs): Promise<void> {
  if (args.signal.aborted) return;
  const screen = mountDiskFormatScreen(args.os, args.container);
  args.container.appendChild(screen.root);
  // Show after the next frame so the opacity transition runs.
  requestAnimationFrame((): void => {
    screen.root.classList.add('is-visible');
  });
  boostHDDGrind(args.destructionAudio);
  const buzz = startElectricalBuzz(args.destructionAudio);
  const timers = startFaz5Timers(screen, args);
  await waitForFaz5End(args.signal);
  timers.forEach((id): void => clearInterval(id));
  void buzz;
  // NB: electrical-buzz handle stays alive in the owner pool — Faz 6's
  // silence cascade calls stop(). We dispose only the screen here.
  screen.root.remove();
}

/* ------------------------------------------------------------------------ */
/* Internals — screen construction                                          */
/* ------------------------------------------------------------------------ */

interface DiskFormatScreen {
  readonly root: HTMLDivElement;
  readonly sectorNode: HTMLDivElement;
  readonly streamNode: HTMLDivElement;
  readonly sectorTemplate: string;
}

/** Build the OS-specific disk-format full-screen takeover and return refs. */
function mountDiskFormatScreen(
  os: OsVariant,
  _container: HTMLElement,
): DiskFormatScreen {
  const locale = resolveUserLocale();
  const root = buildRootElement(os);
  const inner = document.createElement('div');
  inner.className = 'faz5-disk-format-screen__inner';
  const headline = buildHeadline(os, locale);
  inner.appendChild(headline);
  if (os === 'win') {
    inner.appendChild(buildAsciiBoxLine('top'));
  }
  const sectorTemplate = t(buildKey('sectorLabel', os), locale);
  const sectorNode = buildSectorNode(sectorTemplate);
  inner.appendChild(sectorNode);
  const streamNode = buildStreamContainer();
  inner.appendChild(streamNode);
  if (os === 'win') {
    inner.appendChild(buildAsciiBoxLine('bottom'));
  }
  root.appendChild(inner);
  return { root, sectorNode, streamNode, sectorTemplate };
}

/** Build the root takeover element with the OS-specific variant class. */
function buildRootElement(os: OsVariant): HTMLDivElement {
  const root = document.createElement('div');
  root.className = `faz5-disk-format-screen ${
    os === 'mac' ? 'faz5-mac-disk-format os-mac' : 'faz5-win-disk-format os-win'
  }`;
  root.setAttribute('role', 'alert');
  root.setAttribute('aria-busy', 'true');
  const s = root.style;
  s.position = 'fixed';
  s.inset = '0';
  s.zIndex = FAZ5_Z_INDEX;
  s.background = os === 'mac' ? FAZ5_MAC_BG_COLOR : FAZ5_WIN_BG_COLOR;
  s.color = os === 'mac' ? FAZ5_MAC_FG_COLOR : FAZ5_WIN_FG_COLOR;
  return root;
}

/** Build the ATTENTION headline element. */
function buildHeadline(
  os: OsVariant,
  locale: ReturnType<typeof resolveUserLocale>,
): HTMLDivElement {
  const headline = document.createElement('div');
  headline.className = 'faz5-disk-format-screen__attention';
  headline.textContent = t(buildKey('headline', os), locale);
  return headline;
}

/** Build the sector-counter node — the template is held by the runner. */
function buildSectorNode(template: string): HTMLDivElement {
  const sector = document.createElement('div');
  sector.className = 'faz5-disk-format-screen__sector';
  sector.setAttribute('role', 'status');
  sector.textContent = formatSectorLine(
    template,
    FAZ5_SECTOR_INITIAL,
    FAZ5_SECTOR_TOTAL,
  );
  return sector;
}

/** Build the SMART error stream container. */
function buildStreamContainer(): HTMLDivElement {
  const stream = document.createElement('div');
  stream.className = 'faz5-disk-format-screen__stream';
  stream.setAttribute('role', 'log');
  stream.setAttribute('aria-live', 'off');
  return stream;
}

/** Build a single horizontal ASCII box-drawing line for the Win variant. */
function buildAsciiBoxLine(position: 'top' | 'bottom'): HTMLDivElement {
  const line = document.createElement('div');
  line.className = 'faz5-disk-format-screen__box';
  line.style.color = FAZ5_WIN_BORDER_AMBER_COLOR;
  const leftCorner =
    position === 'top' ? ASCII_BOX_CHARS.topLeft : ASCII_BOX_CHARS.bottomLeft;
  const rightCorner =
    position === 'top' ? ASCII_BOX_CHARS.topRight : ASCII_BOX_CHARS.bottomRight;
  line.textContent =
    leftCorner +
    ASCII_BOX_CHARS.horizontal.repeat(ASCII_BOX_HORIZONTAL_LEN) +
    rightCorner;
  return line;
}

/** Compose `destruction.faz5.{os}.{leaf}` locale-key path. */
function buildKey(leaf: string, os: OsVariant): LocaleKey {
  return `destruction.faz5.${os}.${leaf}` as LocaleKey;
}

/** Replace `{current}` / `{total}` tokens in the sector-label template. */
function formatSectorLine(template: string, current: number, total: number): string {
  const locale = resolveUserLocale();
  const localeTag = locale === 'ru' ? 'ru-RU' : 'tr-TR';
  return template
    .split('{current}')
    .join(current.toLocaleString(localeTag))
    .split('{total}')
    .join(total.toLocaleString(localeTag));
}

/* ------------------------------------------------------------------------ */
/* Internals — audio coordination                                           */
/* ------------------------------------------------------------------------ */

/** Lift the Faz 4 HDD-grind handle to the louder Faz 5 grind reading. */
function boostHDDGrind(audio: DestructionAudioHandle): void {
  const hdd = audio.getOwnedAudio(HDD_GRIND_AUDIO_OWNER);
  if (hdd?.kind === 'hdd-grind') {
    hdd.setVolume(FAZ5_HDD_GRIND_VOLUME);
  }
}

/** Construct + start the electrical-buzz handle and register into owner pool. */
function startElectricalBuzz(audio: DestructionAudioHandle): void {
  const buzz = createElectricalBuzzHandle(audio.context, audio.destination);
  buzz.start();
  audio.registerOwnedAudio(ELECTRICAL_BUZZ_AUDIO_OWNER, buzz);
}

/* ------------------------------------------------------------------------ */
/* Internals — timer drivers                                                */
/* ------------------------------------------------------------------------ */

interface SectorState {
  current: number;
  smartIdx: number;
}

/** Spawn the sector-counter + SMART-error-stream timers. */
function startFaz5Timers(screen: DiskFormatScreen, args: Faz5RunArgs): number[] {
  const state: SectorState = { current: FAZ5_SECTOR_INITIAL, smartIdx: 0 };
  const reducedMotion = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;
  const smartIntervalMs = reducedMotion
    ? FAZ5_SMART_ERROR_INTERVAL_MS * 2
    : FAZ5_SMART_ERROR_INTERVAL_MS;
  return [
    spawnSectorCounterTimer(screen, state),
    spawnSmartErrorStreamTimer(screen, state, args.os, smartIntervalMs),
  ];
}

/** Sector counter: increment FAZ5_SECTOR_INCREMENT_PER_TICK every 100ms. */
function spawnSectorCounterTimer(screen: DiskFormatScreen, state: SectorState): number {
  return window.setInterval((): void => {
    state.current += FAZ5_SECTOR_INCREMENT_PER_TICK;
    screen.sectorNode.textContent = formatSectorLine(
      screen.sectorTemplate,
      state.current,
      FAZ5_SECTOR_TOTAL,
    );
  }, FAZ5_SECTOR_TICK_MS);
}

/** SMART error stream: rotate 4 templates with random {addr} / {hex} / {pct}. */
function spawnSmartErrorStreamTimer(
  screen: DiskFormatScreen,
  state: SectorState,
  os: OsVariant,
  intervalMs: number,
): number {
  const locale = resolveUserLocale();
  const templates: readonly LocaleKey[] = [
    buildKey('smartError1', os),
    buildKey('smartError2', os),
    buildKey('smartError3', os),
    buildKey('smartError4', os),
  ];
  return window.setInterval((): void => {
    const key = templates[state.smartIdx % templates.length];
    state.smartIdx += 1;
    if (key === undefined) return;
    const line = renderSmartLine(t(key, locale));
    appendStreamLine(screen.streamNode, line, /* amber */ true);
  }, intervalMs);
}

/** Interpolate the SMART template tokens ({addr}, {hex}, {pct}). */
function renderSmartLine(template: string): string {
  return template
    .split('{addr}')
    .join(randomSectorAddress())
    .split('{hex}')
    .join(randomHexAddress())
    .split('{pct}')
    .join(String(FAZ5_SMART_WEAR_PERCENT));
}

/** 10-digit zero-padded random sector address. */
function randomSectorAddress(): string {
  const value = Math.floor(Math.random() * FAZ5_SECTOR_TOTAL);
  return value.toString().padStart(10, '0');
}

/** 8-char hex sector address with 0x prefix. */
function randomHexAddress(): string {
  const value = Math.floor(Math.random() * 0xffffffff);
  return `0x${value.toString(16).toUpperCase().padStart(8, '0')}`;
}

/** Append a SMART error line + scroll the stream (drop the oldest row). */
function appendStreamLine(streamNode: HTMLDivElement, text: string, amber: boolean): void {
  const line = document.createElement('div');
  line.className = `faz5-disk-format-screen__stream-line${amber ? ' is-amber' : ''}`;
  line.textContent = text;
  streamNode.appendChild(line);
  while (streamNode.children.length > FAZ5_SMART_STREAM_MAX_ROWS) {
    streamNode.removeChild(streamNode.firstChild as ChildNode);
  }
}

/** Wait for FAZ5_DURATION_MS unless the signal aborts first. */
function waitForFaz5End(signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve): void => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const timeoutId = window.setTimeout(resolve, FAZ5_DURATION_MS);
    const onAbort = (): void => {
      window.clearTimeout(timeoutId);
      resolve();
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}
