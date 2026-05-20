/**
 * Faz 2 — Fullscreen Takeover (7-12sn). Phase 2B (kraken-faz2-3).
 *
 *   1. Mount destruction-overlay (z-index 9100).
 *   2. Activate kiosk via window.api.toggleKiosk() (Sprint 0 reuse).
 *   3. Render procedural wallpaper (Mac/Win variant) and insert as
 *      background layer of the overlay.
 *   4. Mount mac-menubar OR win-taskbar (live clock).
 *   5. Spawn desktop icons grid + start sequential fade-out at +1000ms.
 *   6. Spawn notification toasts via setInterval at TOAST_SPAWN_INTERVAL_MS
 *      cadence (5 mac / 3 win).
 *   7. Trigger ApartmentBleed #1 at APARTMENT_BLEED_1_TRIGGER_MS (relative
 *      to bang) — passed via args.signal-bound clock so director may abort.
 *   8. Resolve at FAZ_2_TAKEOVER_DURATION_MS=5000ms or on signal.aborted.
 *
 * The takeover overlay sits ABOVE the bang overlay 9000 and BELOW the
 * apartment-bleed 9500 so the bleed winks through the takeover for its
 * 300ms strobe.
 *
 * Reduced-motion gate:
 *   - Toast slide / icon fade gates live in destruction.css (@media).
 *   - Wallpaper / clocks are static text — no JS gate needed.
 *   - Apartment bleed strobe gate lives in apartment-bleed.ts CSS.
 */

import {
  APARTMENT_BLEED_1_TRIGGER_MS,
  FAZ_0_BANG_DURATION_MS,
  FAZ_1_DIALOG_DURATION_MS,
  FAZ_2_TAKEOVER_DURATION_MS,
  ICON_FADE_OUT_INTERVAL_MS,
  ICON_FADE_OUT_MS,
  PREFERS_REDUCED_MOTION_QUERY,
} from '../../../shared/scene-destruction-constants.js';
import { resolveUserLocale } from '../../i18n/strings.js';
import { mountMacMenubar } from './chrome/mac-menubar.js';
import { mountWinTaskbar } from './chrome/win-taskbar.js';
import { mountIconGrid } from './faz2-icons.js';
import { startToastSpawner } from './faz2-toasts.js';
import { renderWallpaper } from './procedural-wallpaper.js';
import type { ApartmentBleedHandle, ChromeHandle, OsVariant } from './types.js';

/* ------------------------------------------------------------------------ */
/* Public                                                                   */
/* ------------------------------------------------------------------------ */

export interface Faz2RunArgs {
  readonly os: OsVariant;
  readonly container: HTMLElement;
  /** Snapshot captured at scene mount complete; ApartmentBleed flicker source. */
  readonly lobbySnapshotDataUrl: string | undefined;
  readonly apartmentBleed: ApartmentBleedHandle;
  readonly signal: AbortSignal;
}

/**
 * Run the Faz 2 takeover sequence. Resolves at FAZ_2_TAKEOVER_DURATION_MS
 * or on ESC-hold abort. Mid-sequence triggers ApartmentBleed #1.
 */
export async function runFaz2(args: Faz2RunArgs): Promise<void> {
  const fazStartMs = Date.now();
  const overlay = createOverlay();
  args.container.appendChild(overlay);

  await tryActivateKiosk();

  const wallpaper = renderWallpaper(args.os);
  overlay.appendChild(wallpaper);

  const chromeHandle = mountChromeBar(args.os, overlay);
  const iconHandle = mountIconGrid(overlay, args.os, args.signal);
  const toastHandle = startToastSpawner({
    os: args.os,
    container: overlay,
    locale: resolveUserLocale(),
    signal: args.signal,
  });

  const teardown = (): void => {
    iconHandle.dispose();
    toastHandle.dispose();
    chromeHandle.dispose();
    overlay.remove();
  };
  args.signal.addEventListener('abort', teardown, { once: true });

  scheduleIconFade(iconHandle, args.signal);
  scheduleBleed1(args, fazStartMs);

  await waitFaz2Window(args.signal);
  if (!args.signal.aborted) {
    teardown();
    args.signal.removeEventListener('abort', teardown);
  }
}

/* ------------------------------------------------------------------------ */
/* Internals                                                                */
/* ------------------------------------------------------------------------ */

function createOverlay(): HTMLDivElement {
  const overlay = document.createElement('div');
  overlay.classList.add('destruction-overlay');
  overlay.dataset['phase'] = 'faz2';
  return overlay;
}

async function tryActivateKiosk(): Promise<void> {
  try {
    await window.api?.toggleKiosk?.();
  } catch {
    /* Kiosk toggle failure is non-fatal — the overlay still covers the
     * viewport. Logged silently because the destruction must not bail
     * over an IPC failure. */
  }
}

function mountChromeBar(os: OsVariant, overlay: HTMLElement): ChromeHandle {
  return os === 'mac' ? mountMacMenubar(overlay) : mountWinTaskbar(overlay);
}

function scheduleIconFade(
  iconHandle: { readonly startFadeOut: () => Promise<void> },
  signal: AbortSignal,
): void {
  /* Designer §4: "Starting at Faz 2 entry + 1000ms, icons fade one at a
   * time". Composed from SSOT constants:
   *   ICON_FADE_OUT_INTERVAL_MS * 2 + ICON_FADE_OUT_MS
   *   = 400 * 2 + 200 = 1000ms exact.
   * The composition reads as "two stagger steps' worth of stillness plus
   * one fade-duration of breathing room before the dissolve begins". */
  const headStartMs =
    ICON_FADE_OUT_INTERVAL_MS * 2 + ICON_FADE_OUT_MS;
  const id = window.setTimeout((): void => {
    if (signal.aborted) {
      return;
    }
    void iconHandle.startFadeOut();
  }, headStartMs);
  signal.addEventListener('abort', (): void => window.clearTimeout(id), {
    once: true,
  });
}

function scheduleBleed1(args: Faz2RunArgs, fazStartMs: number): void {
  /* APARTMENT_BLEED_1_TRIGGER_MS is relative to BANG, not Faz 2 entry.
   * Faz 2 entry from bang = FAZ_0 + FAZ_1; bleed offset within Faz 2 =
   * APARTMENT_BLEED_1_TRIGGER_MS - (FAZ_0 + FAZ_1).
   * No hardcoded "7000" — derived from SSOT so changes propagate. */
  const fazEntryFromBangMs =
    FAZ_0_BANG_DURATION_MS + FAZ_1_DIALOG_DURATION_MS;
  const offsetInFaz = APARTMENT_BLEED_1_TRIGGER_MS - fazEntryFromBangMs;
  const id = window.setTimeout((): void => {
    if (args.signal.aborted) {
      return;
    }
    void args.apartmentBleed.triggerBleed('bleed-1');
  }, Math.max(0, offsetInFaz));
  args.signal.addEventListener(
    'abort',
    (): void => window.clearTimeout(id),
    { once: true },
  );
  /* Avoid an unused-variable warning while keeping fazStartMs around for
   * future telemetry hooks. */
  void fazStartMs;
}

function waitFaz2Window(signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve): void => {
    const timeoutId = window.setTimeout((): void => {
      resolve();
    }, FAZ_2_TAKEOVER_DURATION_MS);
    signal.addEventListener(
      'abort',
      (): void => {
        window.clearTimeout(timeoutId);
        resolve();
      },
      { once: true },
    );
  });
}

/* Public for telemetry — used by other modules to check reduced-motion
 * preference without re-importing the SSOT query string. */
export function isReducedMotion(): boolean {
  return window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;
}
