/**
 * Faz 2 — Fullscreen Takeover (7-12sn). Phase 1 STUB.
 *
 * The dramatic centrepiece. After Faz 1 critical dialog dismisses, Faz 2:
 *
 *   1. Activates kiosk + setAlwaysOnTop via existing window.api.toggleKiosk()
 *      (Sprint 0 IPC channel reused — no new channel needed).
 *   2. Renders procedural wallpaper via procedural-wallpaper.renderWallpaper(os)
 *      — Mac variant = generic mountain/fog silhouette; Win variant = abstract
 *      Win11-style bloom gradient. No Apple/MS default wallpapers bundled
 *      (PLAN §12 S6 risk closure).
 *   3. Mounts OS chrome:
 *      - Mac: chrome/mac-menubar with live HH:MM:SS clock.
 *      - Win: chrome/win-taskbar with live HH:MM + day/month.
 *   4. Spawns notification toasts every TOAST_SPAWN_INTERVAL_MS from
 *      TOAST_MESSAGES_MAC or TOAST_MESSAGES_WIN.
 *   5. Fades out desktop icons one-by-one (ICON_FADE_OUT_INTERVAL_MS apart,
 *      ICON_FADE_OUT_MS each).
 *   6. At APARTMENT_BLEED_1_TRIGGER_MS (= 11s from bang = ~4s into Faz 2):
 *      triggers ApartmentBleed #1 via the handle owned by the director.
 *
 * The `lobbySnapshotDataUrl` argument is the data URL captured by
 * scene/index.ts at scene mount (after first frame render via rAF). The
 * bleed overlay needs this to flash the lobby back for 0.3s.
 *
 * If `prefers-reduced-motion: reduce`:
 *   - Toast slide-in animation: instant fade (no transform).
 *   - Icon fade-out: instant (no transition).
 *   - Wallpaper render: static (no animated gradient).
 *
 * Called by:
 *   - destruction-director.ts FSM step: `faz1 → faz2` → await `runFaz2(...)`.
 *
 * Phase 2B owner: kraken-faz2-3.
 */

import type { OsVariant, ApartmentBleedHandle } from './types.js';

/**
 * Runner arg bag.
 */
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
 *
 * Phase 2B kraken-faz2-3 fills the body.
 */
export async function runFaz2(_args: Faz2RunArgs): Promise<void> {
  throw new Error('faz2-takeover: Phase 2B kraken-faz2-3 fills runFaz2()');
}
