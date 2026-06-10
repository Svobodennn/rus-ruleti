/**
 * Faz 8 exit handlers — the two ways the destruction sequence ends.
 *
 * Extracted from destruction-director.ts (which sits at its max-lines cap) so
 * the lifecycle-exit side-effects live in one small place:
 *   - quitAppFromButton: ÇIK button — plain app quit (S10 Path A, Sprint 0
 *     IPC). The user chose to bail; no finale video.
 *   - triggerFinale: NATURAL son-ekran completion — open the finale video in
 *     the default browser then quit. Main owns the URL + the quit (see
 *     main/ipc.ts finaleHandler / FINALE_VIDEO_URL); the renderer passes
 *     nothing. Replaces the old dark "black screen" idle ending.
 *
 * Both guard `window`/`window.api` defensively so a non-Electron mount (dev
 * Vite-only, e2e) never throws on the exit path.
 */

import log from 'electron-log/renderer';

/** ÇIK button → window.api.quit() (S10 Path A). */
export function quitAppFromButton(): void {
  log.info('faz8-exit: ÇIK → window.api.quit()');
  if (typeof window !== 'undefined' && window.api !== undefined) {
    window.api.quit();
  }
}

/** Natural son-ekran end → finale video + quit via window.api.finale(). */
export function triggerFinale(): void {
  log.info('faz8-exit: natural end → window.api.finale()');
  if (typeof window !== 'undefined' && window.api?.finale !== undefined) {
    window.api.finale();
  }
}
