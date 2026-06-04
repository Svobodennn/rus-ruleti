# Playwright Local Execution — Sprint 8 Phase 1 prep notes

> Sprint 7 (TH-S6-01) deployed the smoke harness with 15 test bodies
> populated. Sprint 8 Phase 2B (qa-engineer) **EXECUTES** the suite for
> the first time against the packaged build. This document is the
> pre-flight checklist + Path A/B fallback contingency plan.

## Goal

Run `npm run test:e2e` LOCALLY and produce the baseline screenshots +
test PASS/FAIL report. The Sprint 7 harness was AUTHORED but never
executed end-to-end (Sprint 7 retro: Phase 3 marked all tests as
`test.skip()` placeholders with bodies populated for Phase 4 review).

Sprint 8 lifts the `test.skip()` gate, runs the suite, captures the
baseline screenshots under `tests/e2e/faz-screenshots/baseline/`, and
files any test failures as Sprint 8 Phase 4 escalation candidates.

## LOCAL execution sequence

Run in order from the project root:

```bash
# 1. Verify Playwright chromium browser is installed.
#    Sprint 7 did not install browsers (CI-only build path); local run needs:
npx playwright install chromium

# 2. Verify Vite dev server boots in standalone (no Electron).
#    Sprint 7 playwright.config.ts uses `npm run dev` which spawns
#    electron-vite (= Vite + Electron). For Playwright the renderer-side
#    Vite HTTP server is the only consumer; Electron window is irrelevant.
#    Confirm port 5173 is reachable:
npm run dev &      # boot Vite + Electron (Electron window can be closed)
DEV_PID=$!
sleep 5
curl -sf http://localhost:5173 >/dev/null && echo "Vite OK" || echo "Vite FAIL"

# 3. Run the suite. Sprint 8 Phase 2B unskips T01..T14 + T15-reduced-motion.
#    The webServer block in playwright.config.ts reuses the existing dev
#    server (reuseExistingServer: true) so no second `npm run dev` boot.
npm run test:e2e

# 4. View the HTML report (post-run).
#    playwright-report/index.html is generated under the project root and
#    is gitignored.
open playwright-report/index.html

# 5. Teardown (only if you used the manual dev boot above).
kill $DEV_PID
```

## Path A — `window.api` mock fallback (Sprint 7 default)

The Sprint 7 harness installs a `window.api` mock via
`page.addInitScript()` so the renderer's `Preload bridge missing.`
early-return does not fire. This is the **PRIMARY** path Sprint 8
Phase 2B uses for the suite execution.

Mock surface (`installWindowApiMock` in `sprint7-faz-smoke.spec.ts`):

```typescript
// Excerpt from tests/e2e/sprint7-faz-smoke.spec.ts:92-128
await page.addInitScript((): void => {
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
```

Path A is the **default**. The Vite dev server serves the renderer
bundle; Playwright launches chromium against http://localhost:5173;
the renderer mounts because `window.api` exists. Tests assert DOM +
overlay behaviour without touching Electron main process semantics
(kiosk, app.quit, IPC).

### Path A KNOWN-LIMITED scope

- **WebGL**: Playwright chromium uses swiftshader/SwiftGL by default;
  Three.js scene mount may NOT produce identical pixel output as a real
  Electron BrowserWindow. Baseline screenshots taken in Path A are
  reference-only for DOM + chrome rendering — NOT for WebGL fidelity.
- **Audio**: Web Audio API is gated by user-gesture in chromium.
  Reveal-jingle assertions use the analyser-graph code path (verifying
  GainNode construction), NOT actual speaker output.
- **IPC**: T13 (ÇIK click) verifies the mock spy `__qaQuitCallCount`
  was incremented; it does NOT verify actual Electron termination.

## Path B — playwright-electron package fallback

Reserved for Sprint 8 Phase 2B contingency: ONLY IF Path A's
`window.api` mock fails to satisfy the renderer's preload-bridge gate
(e.g. a Sprint 8 mutation added a new IPC channel the mock does not
provide). Path B replaces the mock with a real Electron BrowserWindow
that loads the actual preload bundle.

High-level setup (DO NOT execute unless Path A blocks):

```bash
# Install playwright-electron + Electron test fixtures.
npm install --save-dev @playwright/test electron

# Use _electron.launch() to boot the actual Electron app + connect
# Playwright to the BrowserWindow's renderer. Reference:
# https://playwright.dev/docs/api/class-electronapplication
```

Test fixture pattern (Path B):

```typescript
import { test, _electron as electron } from '@playwright/test';

test('Sprint 8 Faz smoke (Path B — real preload bridge)', async () => {
  const app = await electron.launch({
    args: ['out/main/index.js'],  // packaged main entry point
  });
  const window = await app.firstWindow();
  // window.api is the REAL preload bridge — no mock needed.
  await window.locator('#disclaimer button.continue').click();
  // ... rest of the test body.
  await app.close();
});
```

Path B trade-offs:
- + Real preload bridge — IPC end-to-end verification.
- + Real Electron BrowserWindow — WebGL rendering matches production.
- - Slower (Electron boot + teardown per test ~3-5sn).
- - Headless-incompatible on macOS (Electron requires a real window —
  CI runners need xvfb/Xvnc).
- - Sprint 7 retro: deferred because Path A covered the required
  surface; Sprint 8 Phase 2B only opens Path B if Path A blocks.

## Anticipated failure modes (with diagnosis)

Order them by likelihood (most likely first):

### 1. `npm run test:e2e` fails immediately with "Browser not installed"

**Symptom**: `Error: browserType.launch: Executable doesn't exist at
/Users/.../ms-playwright/chromium-XXXX/chrome-mac/Chromium.app/...`

**Diagnosis**: Playwright was installed via `npm install` but
chromium browser binary was NOT installed.

**Fix**: Run `npx playwright install chromium`.

### 2. Vite dev server fails to boot on port 5173

**Symptom**: Playwright webServer block times out after 60sn waiting
for http://localhost:5173. The `npm run dev` command may have:
- Port 5173 already in use → kill the existing process or change port
  in `electron.vite.config.ts`.
- electron-vite startup hang (rare; usually module resolution issue).

**Diagnosis**: Open a second terminal, run `npm run dev` manually,
observe output. Look for "Local: http://localhost:5173" line.

**Fix**: Kill conflicting process (`lsof -i :5173`) or set
`reuseExistingServer: false` in `playwright.config.ts` to force
restart.

### 3. Renderer aborts with "Preload bridge missing."

**Symptom**: T01 (Mount lobby) fails immediately because
`#disclaimer.is-revealed` selector never appears.

**Diagnosis**: The Path A `window.api` mock did not install in time.
Check that `installWindowApiMock(page)` runs in `beforeEach` BEFORE
`page.goto('/')` — the order matters (`addInitScript` only runs on
fresh page navigation).

**Fix**: Verify `beforeEach` order matches Sprint 7 harness pattern
(`installWindowApiMock` then `page.goto`).

### 4. Three.js scene mount throws WebGL error in headless chromium

**Symptom**: Console error `WebGL2RenderingContext.createShader: not
implemented in swiftshader` or `out of memory`.

**Diagnosis**: Path A KNOWN-LIMITED — swiftshader has partial WebGL2
support. Some shaders the Sprint 1 PS1 pipeline uses may not compile
under swiftshader.

**Fix**: Either:
- Mark the failing test as KNOWN-LIMITED (matches Sprint 7 §5 caveat).
- Promote to Path B (real Electron BrowserWindow with hardware GPU).

### 5. Test timeout exceeds 90sn

**Symptom**: T12 (TEKRAR restart cycle) fails with `Test timeout of
90000ms exceeded`.

**Diagnosis**: Full Faz 0..8 sequence takes ~55-60sn; restart cycle
adds another reveal+son-ekran round (~15sn). 90sn ceiling is tight.

**Fix**: Bump `test.setTimeout(120_000)` in the offending test.
Sprint 7 baseline used 90sn — Sprint 8 retro candidate to raise to
120sn for restart-cycle tests specifically.

### 6. Baseline screenshot path missing

**Symptom**: Test fails with `ENOENT: no such file or directory,
mkdir 'tests/e2e/faz-screenshots/baseline'`.

**Diagnosis**: First-run before the directory exists. Sprint 7 added
a `.gitkeep` to keep the directory tracked, but Playwright's
`page.screenshot({path})` does NOT auto-mkdir on every system.

**Fix**: `mkdir -p tests/e2e/faz-screenshots/baseline` before
`npm run test:e2e`. Sprint 8 Phase 2B may codify this in a
pre-test script.

### 7. Tests pass locally but fail in CI

**Symptom**: Sprint 8 Phase 2B local run is green; Sprint 8 ship
candidate CI run is red.

**Diagnosis**: CI runner lacks xvfb or hardware GPU. Path B requires
hardware GPU; Path A requires only swiftshader (available in
CI chromium build).

**Fix**: Keep CI on Path A. If a test genuinely needs Path B (real
GPU), mark it as `@local-only` and skip in CI.

## Reference

- Sprint 7 directive §5 (TH-S6-01 first deployment).
- `tests/e2e/sprint7-faz-smoke.spec.ts` — full harness (T01..T14 +
  T15 reduced-motion).
- `playwright.config.ts` — Sprint 7 baseline config.
- Sprint 8 directive §7 — Phase 1 perf-instrumentation hooks +
  audio voice counter (this file's siblings under `tests/`).
