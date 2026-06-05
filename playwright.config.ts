/**
 * Playwright config — Sprint 7 Phase 1 first deployment (TH-S6-01).
 *
 * Smoke harness for Faz 0..8 visual + interaction regression. Targets the
 * Vite dev preview (renderer-only) because the smoke surface is the
 * destruction overlay DOM + chrome — none of the Faz 0..8 sequences
 * depend on Electron main process semantics (kiosk, app.quit, IPC). The
 * destruction-director runs entirely renderer-side after BANG.
 *
 * baseURL = http://localhost:5173 (Vite default; directive §5 TH-S6-01
 * Path B). The webServer block boots `npm run dev` (which Spawns Vite +
 * Electron via electron-vite; Playwright connects to the renderer-side
 * Vite HTTP server only — the Electron window itself is irrelevant to
 * the smoke run since chromium project runs in a headless browser).
 *
 * reuseExistingServer: true — local dev iteration can leave a dev
 * server running and re-run the suite without restart. CI gets a fresh
 * server each invocation.
 *
 * retries: 0 — Sprint 7 baseline. Sprint 8 may raise to 1 once flake
 * patterns surface.
 *
 * reporter: 'list' (terminal) + 'html' (post-run static report under
 * playwright-report/ — gitignored).
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  // Sprint 9: bumped 30s → 120s — Faz 8 son-ekran disclaimer .is-visible
  // arrives at ~58s into destruction sequence; per-test `test.setTimeout`
  // overrides this for the longer tests but the default needs headroom.
  timeout: 120_000,
  retries: 0,
  reporter: [['list'], ['html']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    timeout: 60_000,
    reuseExistingServer: true,
  },
});
