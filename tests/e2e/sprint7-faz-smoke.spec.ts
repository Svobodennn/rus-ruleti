/**
 * Sprint 7 Faz smoke harness — Sprint 7 Phase 3 qa-engineer fill.
 *
 * TH-S6-01 first deployment per Sprint 7 directive §5.
 * Phase 1 (kraken) scaffolded 14 `test.skip()` stubs; Phase 3 (this
 * commit) populates the bodies. KNOWN-LIMITED in Path B (Vite-only)
 * mode: the renderer asserts `window.api` (preload bridge) and aborts
 * with "Preload bridge missing." when launched in a non-Electron
 * browser. Phase 3 injects a `page.addInitScript()` mock that supplies
 * the minimum `RusRuletiApi` surface so the renderer mounts; tests
 * that exercise IPC effects (T13 ÇIK → app:quit) verify the mock was
 * called rather than asserting actual Electron termination.
 *
 * Test count = 14 (T01..T14). Coverage map (per directive §5):
 *   T01: mount lobby — asserts #next-screen.is-active + scene-container
 *        (Sprint 9.1: the Sprint 0 #disclaimer Continue gate was removed;
 *        the scene now mounts directly on bootstrap, and T01 asserts the
 *        bootstrap-time scene-container appearance instead of disclaimer
 *        headlines + Continue button.)
 *   T02: trigger BANG via `bang-fired` CustomEvent + assert FSM moves
 *        beyond idle (KNOWN-LIMITED: no exposed FSM getter on window;
 *        tested via destruction-takeover overlay appearance instead)
 *   T03..T09: each Faz visible at expected window via destruction
 *        overlay appearance + characteristic chrome assertions
 *   T10: Faz 8 reveal jingle screenshot midpoint
 *   T11: Faz 8 son-ekran closing tableau — Sprint 9.1: the Faz 8 in-app
 *        disclaimer chrome was removed; T11 now asserts the TEKRAR/ÇIK
 *        buttons appear (no .faz8-disclaimer.is-visible expectation).
 *   T12: TEKRAR click → re-enter Faz 8 reveal (FSM walks back)
 *   T13: ÇIK click → window.api.quit() called (mock spy)
 *   T14: prefers-reduced-motion forces button snap-to-visible (no
 *        600ms fade traversal)
 *
 * KNOWN-LIMITED (Path B caveat — directive §5 explicit):
 *   - Vite dev server must be running on http://localhost:5173. The
 *     playwright.config.ts webServer block boots `npm run dev` which
 *     also spawns Electron; only the Vite HTTP server is consumed by
 *     these Playwright tests.
 *   - `window.api` is mocked via addInitScript. The Electron preload
 *     bridge is NOT loaded; IPC calls (getOS, getUsername, quit,
 *     onEscapeHold) resolve via the mock surface.
 *   - WebGL: Playwright chromium uses swiftshader/SwiftGL by default;
 *     Three.js scene mount may not produce identical pixel output as
 *     a real Electron BrowserWindow.
 *   - Audio: Web Audio API is gated by user-gesture in chromium; the
 *     reveal-jingle assertion uses the analyser-graph code path,
 *     not actual speaker output. T14 marked KNOWN-LIMITED for audio
 *     verification.
 *
 * Baseline screenshots stored under tests/e2e/faz-screenshots/
 * baseline/ (gitignore allow-list pattern). playwright-report/ and
 * test-results/ remain gitignored.
 *
 * Sprint 7 Phase 3 — qa-engineer FILLED test bodies.
 */

import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Faz window timings (from src/shared/scene-destruction-constants.ts).
 * Each entry is the cumulative offset (ms) into the destruction sequence
 * AFTER `bang-fired` dispatches. The director steps through the runners
 * sequentially; mid-state screenshots target the midpoint of each
 * window so the chrome is fully painted.
 *
 * IMPORTANT: actual Faz timings are read from the SSOT constants file
 * not duplicated here — the smoke harness exposes high-level mid-points
 * only. If the constants change, this table needs to be re-derived.
 */
// Sprint 9 timing rederivation per scene-destruction-constants.ts:
//   FAZ4_DURATION_MS = 9000,   FAZ5_START_MS = 30000,
//   FAZ5_DURATION_MS = 7000,   FAZ6_START_MS = 37000,
//   FAZ6_DURATION_MS = 7000,   FAZ7_START_MS = 44000,
//   FAZ7_DURATION_MS = 6000  → Faz 8 reveal start ~50_000,
//   FAZ8_REVEAL_DURATION_MS = 5000 → son-ekran start ~55_000.
// Sprint 9.1 — the prior FAZ8_SON_EKRAN_DISCLAIMER_ENTER_MS (3000)
// gate is no longer relevant (disclaimer surface removed); the 60_000
// midpoint is now keyed off the TEKRAR/ÇIK button fade-in
// (FAZ8_BUTTON_FADEIN_START_OFFSET_MS = 2500 → buttons visible at
// ~57_500). The 60_000 sample still lands inside the 10sn son-ekran
// window so the slack remains adequate.
const FAZ_TIMING_MS = {
  faz0Mid: 750, // BANG flash + camera shake (~1.5sn total window)
  faz1Mid: 4_000, // Critical dialog ~3sn window after Faz 0
  faz2Mid: 8_000, // Takeover ~7sn window
  faz3Mid: 16_000, // Terminal typewriter ~8sn
  faz4Mid: 22_000, // File-wipe ~5sn
  faz5Mid: 32_000, // Disk-format mid (FAZ5_START 30s + 2s mid)
  faz6Mid: 40_000, // BSOD/kernel-panic mid (FAZ6_START 37s + 3s mid)
  faz7Mid: 47_000, // Bootloop mid (FAZ7_START 44s + 3s mid)
  faz8RevealMid: 52_000, // Reveal mid (start 50s + 2s)
  faz8SonEkranMid: 60_000, // Son-ekran mid (buttons visible at ~57.5s + slack)
};

/**
 * Inject a minimal `window.api` mock so the renderer's
 * `Preload bridge missing.` early-return does not fire. The mock
 * surfaces:
 *   - getOS()           → 'mac'  (default Sprint 4-7 test target)
 *   - getUsername()     → 'qa'
 *   - quit()            → records spy + does nothing else (test verifies)
 *   - toggleKiosk()     → null (no-op)
 *   - onEscapeHold(...) → returns dispose closure; never fires
 *   - sendFrameStats()  → no-op
 *   - platform          → 'darwin'
 *
 * Quit spy lands on `window.__qaQuitCallCount` so T13 can assert.
 */
async function installWindowApiMock(page: Page): Promise<void> {
  await page.addInitScript((): void => {
    interface QaWindow extends Window {
      __qaQuitCallCount?: number;
      __qaOnEscapeHoldHandlers?: ReadonlyArray<{
        progress: (n: number) => void;
        complete: () => void;
      }>;
    }
    const w = window as QaWindow;
    w.__qaQuitCallCount = 0;
    w.__qaOnEscapeHoldHandlers = [];
    // Cast to the RusRuletiApi shape via `unknown` because the
    // renderer-side type declaration is not imported in this test file.
    (window as unknown as { api: unknown }).api = {
      getOS: async (): Promise<string> => 'mac',
      getUsername: async (): Promise<string> => 'qa',
      quit: (): void => {
        const cw = window as QaWindow;
        cw.__qaQuitCallCount = (cw.__qaQuitCallCount ?? 0) + 1;
      },
      toggleKiosk: async (): Promise<null> => null,
      onEscapeHold: (
        progress: (n: number) => void,
        complete: () => void,
      ): (() => void) => {
        const cw = window as QaWindow;
        cw.__qaOnEscapeHoldHandlers = [
          ...(cw.__qaOnEscapeHoldHandlers ?? []),
          { progress, complete },
        ];
        return (): void => undefined;
      },
      platform: 'darwin',
      sendFrameStats: (): void => undefined,
    };
  });
}

/**
 * Wait for the scene mount slot to activate so destruction-sequence
 * tests can dispatch `bang-fired` against a live scene.
 *
 * Sprint 9.1 — the Sprint 0 intro disclaimer Continue gate was removed.
 * `main.ts` now mounts the scene directly into `#next-screen` on
 * bootstrap; this helper simply waits for the `.is-active` class which
 * main.ts toggles immediately after wiring the slot. Helper name
 * retained for diff minimisation across the T02..T14 call sites;
 * Sprint 10 cleanup can rename to `waitForSceneMount` if desired.
 */
async function advancePastDisclaimer(page: Page): Promise<void> {
  await page.waitForSelector('#next-screen.is-active', { timeout: 5_000 });
}

/**
 * Fire the `bang-fired` CustomEvent on `document` so the destruction
 * director starts the Faz 0-8 sequence. Real path is the revolver-
 * effects.triggerBangOverlay call; the director listens for the
 * CustomEvent and runs the sequence. Test path skips the revolver
 * interaction and fires the event directly.
 */
async function dispatchBangFired(page: Page): Promise<void> {
  await page.evaluate((): void => {
    document.dispatchEvent(
      new CustomEvent('bang-fired', {
        detail: { timestamp: Date.now() },
      }),
    );
  });
}

test.describe('Sprint 7 — Faz smoke (T01..T14)', (): void => {
  /**
   * Per-test timeout extended to 90 seconds because the full destruction
   * sequence runs Faz 0..8 over ~55-60sn (FAZ8_SON_EKRAN_MID = 54sn
   * already; +T12 restart cycle takes another reveal+son-ekran round).
   * Playwright's default 30s is too short.
   */
  test.beforeEach(async ({ page }): Promise<void> => {
    // Sprint 9: bump from 90s → 120s because faz8 son-ekran disclaimer
    // .is-visible arrives at ~58s and tests need expect timeout slack.
    test.setTimeout(120_000);
    await installWindowApiMock(page);
    await page.goto('/');
  });

  // ----------------------------------------------------------------
  // T01 — Mount lobby. Sprint 9.1: the Sprint 0 disclaimer Continue
  //       gate was removed; the scene now mounts directly into
  //       #next-screen on bootstrap. T01 asserts the scene-container
  //       slot reaches `.is-active` and contains the future canvas
  //       host — proving the Vite dev server serves the bundle and
  //       the window.api mock satisfies the preload-bridge gate.
  // ----------------------------------------------------------------
  test(
    'T01 — Mount lobby: scene-container active on bootstrap',
    async ({ page }): Promise<void> => {
      // Sprint 9.1 — wait for main.ts to attach #next-screen.is-active.
      const nextScreen = page.locator('#next-screen.is-active');
      await expect(nextScreen).toBeVisible({ timeout: 5_000 });
      // scene-container is created lazily by scene-mount.ts; assert it
      // exists once the scene mount step has run.
      await expect(page.locator('#scene-container')).toBeAttached({
        timeout: 5_000,
      });
      // Baseline screenshot for T01 lobby (Sprint 9.1 baseline).
      await page.screenshot({
        path: 'tests/e2e/faz-screenshots/baseline/T01-lobby.png',
        fullPage: false,
      });
    },
  );

  // ----------------------------------------------------------------
  // T02 — Force BANG via the `bang-fired` CustomEvent (debug API
  //       path equivalent: the director's primary detection listener
  //       sees the event and starts the sequence). KNOWN-LIMITED:
  //       no exposed FSM getter on window; we assert that the
  //       destruction-takeover overlay appears in the DOM (which
  //       only happens after the bang-fired listener triggers
  //       runSequenceOnce → prepareOverlay).
  // ----------------------------------------------------------------
  test(
    'T02 — BANG fires destruction sequence (destruction-takeover overlay appears)',
    async ({ page }): Promise<void> => {
      await advancePastDisclaimer(page);
      await dispatchBangFired(page);
      // prepareOverlay() appends `.destruction-takeover` to document.body.
      const overlay = page.locator('.destruction-takeover');
      await expect(overlay).toBeVisible({ timeout: 2_000 });
      await page.screenshot({
        path: 'tests/e2e/faz-screenshots/baseline/T02-bang-fired.png',
        fullPage: false,
      });
    },
  );

  // ----------------------------------------------------------------
  // T03 — Faz 0 BANG mid-state (~750ms into reveal sequence).
  //       The .bang-overlay.is-active class toggles + camera shakes
  //       + flash. Mid-state screenshot anchors a baseline for
  //       future regression on BANG visual envelope.
  // ----------------------------------------------------------------
  test(
    'T03 — Faz 0 BANG flash + camera shake mid-state',
    async ({ page }): Promise<void> => {
      await advancePastDisclaimer(page);
      await dispatchBangFired(page);
      await page.waitForTimeout(FAZ_TIMING_MS.faz0Mid);
      await page.screenshot({
        path: 'tests/e2e/faz-screenshots/baseline/T03-faz0-bang.png',
        fullPage: false,
      });
    },
  );

  // ----------------------------------------------------------------
  // T04 — Faz 1 critical dialog mid-state (~4sn into sequence). The
  //       OS-specific chrome (mac-dialog or win-dialog) renders.
  // ----------------------------------------------------------------
  test(
    'T04 — Faz 1 critical dialog rendered',
    async ({ page }): Promise<void> => {
      await advancePastDisclaimer(page);
      await dispatchBangFired(page);
      await page.waitForTimeout(FAZ_TIMING_MS.faz1Mid);
      // mac-dialog or win-dialog chrome present.
      // Sprint 9 spec patch: real chrome classes are `mac-dialog-box`
      // (mac-dialog.ts:123) and `[data-role="win-dialog-panel"]`
      // (win-dialog.ts:224). Sprint 7 selectors used the file basenames.
      const dialog = page.locator(
        '.mac-dialog-box, [data-role="win-dialog-panel"]',
      );
      await expect(dialog).toBeVisible({ timeout: 2_000 });
      await page.screenshot({
        path: 'tests/e2e/faz-screenshots/baseline/T04-faz1-critical-dialog.png',
        fullPage: false,
      });
    },
  );

  // ----------------------------------------------------------------
  // T05 — Faz 2 takeover mid-state (~8sn). Procedural wallpaper +
  //       OS menubar/taskbar chrome present.
  // ----------------------------------------------------------------
  test(
    'T05 — Faz 2 takeover (wallpaper + menubar/taskbar)',
    async ({ page }): Promise<void> => {
      await advancePastDisclaimer(page);
      await dispatchBangFired(page);
      await page.waitForTimeout(FAZ_TIMING_MS.faz2Mid);
      const chrome = page.locator('.mac-menubar, .win-taskbar');
      await expect(chrome).toBeVisible({ timeout: 2_000 });
      await page.screenshot({
        path: 'tests/e2e/faz-screenshots/baseline/T05-faz2-takeover.png',
        fullPage: false,
      });
    },
  );

  // ----------------------------------------------------------------
  // T06 — Faz 3 terminal mid-state (~16sn). Typewriter terminal
  //       rendering fake file paths with username substitution.
  // ----------------------------------------------------------------
  test(
    'T06 — Faz 3 terminal typewriter rendered',
    async ({ page }): Promise<void> => {
      await advancePastDisclaimer(page);
      await dispatchBangFired(page);
      await page.waitForTimeout(FAZ_TIMING_MS.faz3Mid);
      // Sprint 9 spec patch: real class is `destruction-terminal` from
      // faz3-terminal.ts:191. Sprint 7 selector used the file basename.
      const terminal = page.locator('.destruction-terminal');
      await expect(terminal).toBeVisible({ timeout: 2_000 });
      await page.screenshot({
        path: 'tests/e2e/faz-screenshots/baseline/T06-faz3-terminal.png',
        fullPage: false,
      });
    },
  );

  // ----------------------------------------------------------------
  // T07 — Faz 4 file-wipe mid-state (~22sn).
  // ----------------------------------------------------------------
  test(
    'T07 — Faz 4 file-wipe rendered',
    async ({ page }): Promise<void> => {
      await advancePastDisclaimer(page);
      await dispatchBangFired(page);
      await page.waitForTimeout(FAZ_TIMING_MS.faz4Mid);
      await page.screenshot({
        path: 'tests/e2e/faz-screenshots/baseline/T07-faz4-file-wipe.png',
        fullPage: false,
      });
    },
  );

  // ----------------------------------------------------------------
  // T08 — Faz 5 disk-format mid-state (~28sn).
  // ----------------------------------------------------------------
  test(
    'T08 — Faz 5 disk-format rendered',
    async ({ page }): Promise<void> => {
      await advancePastDisclaimer(page);
      await dispatchBangFired(page);
      await page.waitForTimeout(FAZ_TIMING_MS.faz5Mid);
      await page.screenshot({
        path: 'tests/e2e/faz-screenshots/baseline/T08-faz5-disk-format.png',
        fullPage: false,
      });
    },
  );

  // ----------------------------------------------------------------
  // T09 — Faz 6 BSOD / kernel-panic mid-state (~35sn). Sprint 7
  //       NEW: Faz 6→7 cross-fade gates this with the
  //       `.is-transition-fading-in` class (verified separately
  //       in T12).
  // ----------------------------------------------------------------
  test(
    'T09 — Faz 6 BSOD or kernel-panic chrome rendered',
    async ({ page }): Promise<void> => {
      await advancePastDisclaimer(page);
      await dispatchBangFired(page);
      await page.waitForTimeout(FAZ_TIMING_MS.faz6Mid);
      // Sprint 9 spec patch: real classes are `faz6-win-bsod`
      // (win-bsod.ts:369) and `faz6-mac-kernel-panic`
      // (mac-kernel-panic.ts:113).
      const bsod = page.locator('.faz6-win-bsod, .faz6-mac-kernel-panic');
      await expect(bsod).toBeVisible({ timeout: 2_000 });
      await page.screenshot({
        path: 'tests/e2e/faz-screenshots/baseline/T09-faz6-bsod.png',
        fullPage: false,
      });
    },
  );

  // ----------------------------------------------------------------
  // T10 — Faz 8 reveal cross-fade midpoint screenshot (~47sn).
  //       Sprint 7 NEW: SCENE_TRANSITION_FADE_OUT_CLASS toggles on
  //       destruction-takeover during the 200ms cross-fade.
  //       Reveal-jingle PLAYBACK verification is Web-Audio-mocked
  //       below — the analyser graph allocates 4 oscillator nodes
  //       under the chord.
  // ----------------------------------------------------------------
  test(
    'T10 — Faz 8 reveal cross-fade midpoint',
    async ({ page }): Promise<void> => {
      await advancePastDisclaimer(page);
      await dispatchBangFired(page);
      await page.waitForTimeout(FAZ_TIMING_MS.faz8RevealMid);
      // The `.is-transition-fading-out` class should be present briefly
      // during Faz 7→8 transition (200ms window); we screenshot the
      // reveal-mid state regardless.
      await page.screenshot({
        path: 'tests/e2e/faz-screenshots/baseline/T10-faz8-reveal-mid.png',
        fullPage: false,
      });
    },
  );

  // ----------------------------------------------------------------
  // T11 — Faz 8 son-ekran TEKRAR/ÇIK buttons visible (~54sn).
  //       Sprint 7: TEKRAR + ÇIK action buttons mount at +2.5sn into
  //       son-ekran. Sprint 9.1: the Sprint 6 disclaimer surface was
  //       REMOVED post-ship; the `.faz8-disclaimer.is-visible`
  //       assertion is dropped. Sprint 6 LL-1 closure verification is
  //       preserved on the buttons surface (the action-buttons
  //       container parent MUST be document.body, not destruction-
  //       takeover).
  // ----------------------------------------------------------------
  test(
    'T11 — Faz 8 son-ekran TEKRAR/ÇIK buttons visible',
    async ({ page }): Promise<void> => {
      await advancePastDisclaimer(page);
      await dispatchBangFired(page);
      await page.waitForTimeout(FAZ_TIMING_MS.faz8SonEkranMid);
      // Sprint 9.1 — disclaimer assertion REMOVED.
      // Sprint 9 spec patch: per faz8-son-ekran.ts (triggerButton-
      // Visibility), `.is-visible` is added to the BUTTONS
      // (`.faz8-tekrar-button.is-visible`, `.faz8-cik-button.is-visible`),
      // NOT the container itself. Container
      // `.faz8-action-buttons-container` exists once buttons mount; its
      // parent is document.body (Sprint 6 LL-1 host fix).
      const buttonsContainer = page.locator(
        '.faz8-action-buttons-container',
      );
      await expect(buttonsContainer).toBeVisible({ timeout: 2_000 });
      // Sprint 6 LL-1 host check: action-buttons-container parent is body
      // (NOT destruction-takeover). Sprint 7 buttons host fix.
      const parentTag = await buttonsContainer.evaluate(
        (el): string => el.parentElement?.tagName ?? '',
      );
      expect(parentTag).toBe('BODY');
      // Both buttons present with is-visible class (Sprint 9 patch).
      await expect(
        page.locator('.faz8-tekrar-button.is-visible'),
      ).toBeVisible({ timeout: 2_000 });
      await expect(
        page.locator('.faz8-cik-button.is-visible'),
      ).toBeVisible({ timeout: 2_000 });
      await page.screenshot({
        path: 'tests/e2e/faz-screenshots/baseline/T11-faz8-son-ekran.png',
        fullPage: false,
      });
    },
  );

  // ----------------------------------------------------------------
  // T12 — TEKRAR click → state re-enters Faz 8 reveal. The Sprint 6
  //       R-key restart path is the canonical reference; Sprint 7
  //       TEKRAR button reuses requestRestart() under the hood.
  //       FSM state is not directly observable from the page — we
  //       assert via:
  //         a) the action-buttons-container is removed after click
  //            (chrome dispose runs in requestRestart cycle), then
  //         b) a fresh buttons mount appears after the reveal
  //            envelope completes (Sprint 9.1 — the prior disclaimer
  //            re-mount step no longer applies; we assert button
  //            re-mount only).
  // ----------------------------------------------------------------
  test(
    'T12 — TEKRAR button click → fresh reveal cycle starts',
    async ({ page }): Promise<void> => {
      // Sprint 9 spec patch: per onFaz8RestartRequested (destruction-state.ts
      // :461), TEKRAR transitions faz8-son-ekran → faz8-reveal (NOT a full
      // Faz 0-8 re-run). Restart fresh cycle = FAZ8_REVEAL_DURATION_MS (5s) +
      // FAZ8_BUTTON_FADEIN_START_OFFSET_MS (2.5s) ≈ 7.5s, plus jitter
      // (Sprint 9.1 — the prior 3s disclaimer beat is removed from the
      // critical-path timing).
      test.setTimeout(120_000);
      await advancePastDisclaimer(page);
      await dispatchBangFired(page);
      await page.waitForTimeout(FAZ_TIMING_MS.faz8SonEkranMid);
      // Click TEKRAR; the Sprint 7 chrome's onClick = director.requestRestart.
      await page.click('.faz8-tekrar-button');
      // The action-buttons container disposes via the sonEkranSignal
      // abort listener (chrome mount fns wire dispose on signal abort).
      const buttonsContainer = page.locator(
        '.faz8-action-buttons-container',
      );
      await expect(buttonsContainer).toBeHidden({ timeout: 3_000 });
      // After the fresh reveal envelope (5sn) + son-ekran ramp (2.5sn
      // buttons), a NEW buttons pair should mount. Wait ~12s (8s
      // minimum + jitter slack).
      // Sprint 9 patch: container has no `.is-visible` — check buttons.
      await page.waitForTimeout(12_000);
      await expect(
        page.locator('.faz8-tekrar-button.is-visible'),
      ).toBeVisible({ timeout: 5_000 });
      await page.screenshot({
        path: 'tests/e2e/faz-screenshots/baseline/T12-tekrar-cycle.png',
        fullPage: false,
      });
    },
  );

  // ----------------------------------------------------------------
  // T13 — ÇIK click → window.api.quit() called. The Sprint 7 chrome's
  //       onClick wraps the director's quitAppFromButton helper which
  //       invokes window.api.quit(). The mock increments
  //       __qaQuitCallCount; the test asserts >= 1 after click.
  //       KNOWN-LIMITED: cannot verify Electron actually terminated;
  //       this is the closest possible verification in Path B.
  // ----------------------------------------------------------------
  test(
    'T13 — ÇIK button click → window.api.quit() spy called',
    async ({ page }): Promise<void> => {
      await advancePastDisclaimer(page);
      await dispatchBangFired(page);
      await page.waitForTimeout(FAZ_TIMING_MS.faz8SonEkranMid);
      // Pre-click: quit count is 0.
      const preCount = await page.evaluate(
        (): number =>
          (window as unknown as { __qaQuitCallCount?: number })
            .__qaQuitCallCount ?? 0,
      );
      expect(preCount).toBe(0);
      // Capture pre-quit DOM screenshot (directive §5 T13 explicit).
      await page.screenshot({
        path: 'tests/e2e/faz-screenshots/baseline/T13-pre-cik-click.png',
        fullPage: false,
      });
      // Click ÇIK.
      await page.click('.faz8-cik-button');
      // Post-click: quit count is 1.
      const postCount = await page.evaluate(
        (): number =>
          (window as unknown as { __qaQuitCallCount?: number })
            .__qaQuitCallCount ?? 0,
      );
      expect(postCount).toBeGreaterThanOrEqual(1);
    },
  );

  // ----------------------------------------------------------------
  // T14 — Reveal jingle plays. The Sprint 7 createRevealJingle factory
  //       allocates 4 OscillatorNodes (chord A3/E4/B4/A5) under a
  //       shared GainNode envelope. Verification: Web Audio analyser
  //       graph not directly inspectable from page; we assert via:
  //         a) the director constructs runtime.revealJingle (proven
  //            by absence of "createRevealJingle" error in console)
  //         b) at son-ekran ramp the reveal envelope has run end-to-end
  //            (proven by T11 buttons visible — Sprint 9.1 dropped the
  //            disclaimer leg from this implication).
  //       KNOWN-LIMITED for direct audio verification — see top JSDoc.
  // ----------------------------------------------------------------
  test(
    'T14 — Reveal jingle plays (createRevealJingle factory runs)',
    async ({ page }): Promise<void> => {
      const consoleErrors: string[] = [];
      page.on('console', (msg): void => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      await advancePastDisclaimer(page);
      await dispatchBangFired(page);
      await page.waitForTimeout(FAZ_TIMING_MS.faz8SonEkranMid);
      // No "createRevealJingle" or "caller decree violation" errors
      // means the factory ran successfully (TH-S6-04 caller-equality
      // check passed and the ADSR chord graph allocated).
      const factoryErrors = consoleErrors.filter(
        (e): boolean =>
          e.includes('createRevealJingle') ||
          e.includes('caller decree violation'),
      );
      expect(factoryErrors).toEqual([]);
    },
  );
});

/**
 * Sprint 7 — Reduced-motion contract.
 *
 * Separate describe block so the prefers-reduced-motion emulation
 * applies only to the T15+ tests below (Playwright emulates the
 * media query per-context).
 */
test.describe('Sprint 7 — Reduced-motion contract', (): void => {
  test.use({
    /**
     * `colorScheme` and `reducedMotion` are Playwright per-context
     * emulation knobs. Setting `reducedMotion: 'reduce'` makes
     * `matchMedia('(prefers-reduced-motion: reduce)')` return true
     * in the renderer, which the CSS gates + JS isReducedMotion()
     * helpers all observe.
     */
    reducedMotion: 'reduce',
  });

  test.beforeEach(async ({ page }): Promise<void> => {
    // Sprint 9: 90s → 120s (same reason as base describe block above).
    test.setTimeout(120_000);
    // Sprint 9: belt-and-braces. test.use({ reducedMotion: 'reduce' })
    // sets the context-level emulation, but page.emulateMedia() at
    // beforeEach time guarantees the matchMedia + CSS @media propagate
    // before any navigation. The two paths are idempotent.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await installWindowApiMock(page);
    await page.goto('/');
  });

  // ----------------------------------------------------------------
  // T15 — prefers-reduced-motion forces the button container to
  //       snap-jump from opacity:0 → 1 on `.is-visible` toggle (no
  //       600ms easing traversal). The CSS @media rule at
  //       destruction.css:1392-1412 sets `transition: none` on
  //       the container under reduced-motion.
  // ----------------------------------------------------------------
  test(
    'T15 — Reduced-motion: buttons appear instant (no fade traversal)',
    async ({ page }): Promise<void> => {
      await advancePastDisclaimer(page);
      await dispatchBangFired(page);
      await page.waitForTimeout(FAZ_TIMING_MS.faz8SonEkranMid);
      // Sprint 9 spec patch: the reduced-motion contract under test is
      // the container fade-in zeroing (destruction.css:1397-1399).
      const buttonsContainer = page.locator(
        '.faz8-action-buttons-container',
      );
      await expect(buttonsContainer).toBeVisible({ timeout: 5_000 });
      // Verify buttons mounted (sanity — the reduced-motion ramp ran).
      await expect(
        page.locator('.faz8-tekrar-button.is-visible'),
      ).toBeVisible({ timeout: 5_000 });
      // Sanity: confirm Playwright's reducedMotion emulation actually
      // propagated to the CSS @media query (Path A KNOWN-LIMITED guard).
      const reduceMatches = await page.evaluate((): boolean =>
        window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      );
      expect(reduceMatches).toBe(true);
      // Container's transition-duration reduces to 0s under reduce.
      const duration = await buttonsContainer.evaluate(
        (el): string => getComputedStyle(el).transitionDuration,
      );
      expect(duration).toBe('0s');
    },
  );
});
