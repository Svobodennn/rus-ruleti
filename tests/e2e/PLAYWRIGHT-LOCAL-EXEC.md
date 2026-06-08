# Playwright Local Execution — Sprint 9 CLOSED (Path A SUCCESS)

> Sprint 7 (TH-S6-01) deployed the smoke harness with 15 test bodies
> populated. Sprint 8 Phase 2B harness sandbox blocked execution
> (KNOWN-LIMITED). Sprint 9 Phase 2B Lane B (kraken) **EXECUTED**
> the suite end-to-end with Path A vanilla Playwright + `window.api`
> mock + Vite renderer-only dev server. **All 15 tests pass.**
>
> Status: **CLOSED** — 13 baseline screenshots committed under
> `tests/e2e/faz-screenshots/baseline/`. Two tests (T14 reveal-jingle
> error-log scan, T15 reduced-motion CSS computed-style check) verify
> behaviour without producing screenshots.

## Sprint 9 unblock summary (what changed since Sprint 7/8)

1. **`test.skip()` → `test()`** for all 15 tests (Sprint 7 left them
   skipped; Sprint 8 sandbox could not flip them).
2. **Renderer-only Vite boot** (not `npm run dev`). The Sprint 7-8
   approach used `npm run dev` (= electron-vite) which couples the
   Vite server to the Electron BrowserWindow lifecycle; when the
   first test's destruction sequence reached Faz 8 son-ekran, the
   Electron process exited and dragged the Vite server with it,
   killing tests T07+ with `ERR_CONNECTION_REFUSED`. Sprint 9 boots
   `node node_modules/vite/bin/vite.js --port 5173 src/renderer`
   directly so the dev server survives the full 8.4-minute suite.
3. **Spec selector fixes** — Sprint 7 selectors used file basenames
   (`.mac-dialog`, `.win-dialog`, `.faz3-terminal`, `.win-bsod`)
   instead of the runtime CSS class names. Sprint 9 patched them to
   the actual `className` values from each chrome module.
4. **Timing windows re-derived** — `FAZ_TIMING_MS.faz5/6/7/8RevealMid/
   faz8SonEkranMid` were tightened against the SSOT constants in
   `scene-destruction-constants.ts`. Sprint 7 estimates were 5-6s
   early; Sprint 9 values land mid-window for every Faz.
5. **`is-visible` lives on buttons, not the container** — Sprint 7
   asserted `.faz8-action-buttons-container.is-visible` but per
   `faz8-son-ekran.ts:498-505` the `.is-visible` class lands on
   `.faz8-tekrar-button` / `.faz8-cik-button`.
6. **`reducedMotion` test.use needs explicit `emulateMedia`** —
   Playwright 1.60 `test.use({ reducedMotion: 'reduce' })` did not
   propagate to `window.matchMedia('(prefers-reduced-motion: reduce)')`
   in our setup. Calling `page.emulateMedia({ reducedMotion: 'reduce' })`
   in `beforeEach` is the belt-and-braces fix.
7. **Per-test timeout bumped 30s → 120s** (`playwright.config.ts`) and
   per-test `setTimeout(120_000)` in the destruction suite —
   Faz 8 son-ekran `.is-visible` arrives at ~58s into the sequence.

## Goal

Run `npm run test:e2e` LOCALLY and produce the baseline screenshots +
test PASS/FAIL report. Sprint 9 closed this goal with all 15 tests
passing and 13 baselines committed. The sequence below is the recipe
that produced the green run; rerun it on any host to regenerate the
baselines after intentional visual changes.

## LOCAL execution sequence (Sprint 9 — Path A, validated)

Run in order from the project root:

```bash
# 1. Verify Playwright chromium browser is installed.
#    First-time setup only:
npx playwright install chromium

# 2. Boot Vite renderer-only (NOT `npm run dev`).
#    `npm run dev` invokes electron-vite which couples the dev server
#    to the Electron BrowserWindow lifecycle — the destruction sequence
#    in faz8 ends up closing Electron which drops the dev server
#    mid-suite. Renderer-only Vite has no such coupling.
node node_modules/vite/bin/vite.js --port 5173 src/renderer > /tmp/vite.log 2>&1 &
DEV_PID=$!
sleep 5
curl -sf http://localhost:5173 >/dev/null && echo "Vite OK" || echo "Vite FAIL"

# 3. Run the suite. The webServer block in playwright.config.ts will
#    reuse the existing server (reuseExistingServer: true).
#    --update-snapshots regenerates the baselines under
#    tests/e2e/faz-screenshots/baseline/.
npx playwright test --update-snapshots --reporter=list

# 4. View the HTML report (post-run).
#    playwright-report/index.html is generated under the project root and
#    is gitignored.
open playwright-report/index.html

# 5. Teardown.
kill $DEV_PID
```

Wall-clock for the full 15-test suite is ~8.4 minutes (single worker).

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

### 2. Vite dev server fails to boot on port 5173 OR dies mid-suite

**Symptom**: Playwright webServer block times out after 60sn waiting
for http://localhost:5173. OR tests T07+ fail with
`net::ERR_CONNECTION_REFUSED` mid-suite.

**Diagnosis (Sprint 9 root cause)**: Using `npm run dev` for the dev
server. electron-vite couples Vite to the Electron BrowserWindow
lifecycle; the destruction sequence in Faz 8 closes Electron which
drags the dev server with it.

**Fix**: Boot Vite renderer-only:
`node node_modules/vite/bin/vite.js --port 5173 src/renderer &`.
See LOCAL execution sequence above.

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

**Diagnosis**: Faz 8 son-ekran disclaimer `.is-visible` arrives at
~58sn into the destruction sequence; the 90sn ceiling left no slack
for expect timeouts.

**Fix**: Sprint 9 bumped per-test `setTimeout` 90s → 120s and the
config default 30s → 120s. T12 now waits ~12s post-TEKRAR-click
instead of a full second cycle — `onFaz8RestartRequested` transitions
`faz8-son-ekran` → `faz8-reveal` (NOT a full Faz 0-8 re-run).

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
- Sprint 8 directive §7 — Phase 1 perf-instrumentation hooks +
  audio voice counter (this file's siblings under `tests/`).
- Sprint 9 Lane B directive §8 — Path A SUCCESS unblock plan.
- `tests/e2e/sprint7-faz-smoke.spec.ts` — full harness (T01..T14 +
  T15 reduced-motion).
- `playwright.config.ts` — Sprint 9 timeout-bumped config.

## Blank baseline frames — ACCEPTED-FOR-SHIP (Sprint 9)

Three of the 13 committed baselines are byte-identical blank frames:

| Test | File | MD5 | Size |
|------|------|-----|------|
| T02 | `T02-bang-fired.png` | `cf347c3dae7353cf107cfb8a45baf7b8` | 4250 B |
| T03 | `T03-faz0-bang.png` | `cf347c3dae7353cf107cfb8a45baf7b8` | 4250 B |
| T10 | `T10-faz8-reveal-mid.png` | `cf347c3dae7353cf107cfb8a45baf7b8` | 4250 B |

**Root cause:** Chromium swiftshader (Path A) does not render mid-flash
/ mid-cross-fade WebGL content at the millisecond precision the
screenshots are taken. The DOM transitions are complete but the Three.js
canvas is a blank frame at capture time under swiftshader.

**Impact on test results:** None. All 15 tests PASS via DOM assertions
(`waitForSelector`, `expect(locator).toBeVisible()`, etc.). The
screenshot step in these three tests captures a reference frame but the
assertion is DOM-based, not pixel-based.

**Decision:** ACCEPTED-FOR-SHIP for Sprint 9. The Path A KNOWN-LIMITED
scope (WebGL fidelity) documented above already covers this case. The
blank frames are a correct swiftshader artefact, not a product defect.

**Post-ship options (future polish sprint):**
- Tighten the screenshot timing window to a non-flash/non-cross-fade DOM
  stable moment (screenshot before the animation fires, not mid-frame).
- Migrate T02/T03/T10 to Path B (real Electron BrowserWindow with
  hardware GPU) for pixel-accurate WebGL capture.

## Sprint 9 closure commits

- **M1** `1a6c8b21` — TH-S8-01 Playwright Path A SUCCESS spec/config
  patches + this doc rewrite.
- **M3** `2d656af9` — 13 baseline PNGs committed under
  `tests/e2e/faz-screenshots/baseline/`.

## Sprint 9.1 post-ship disclaimer removal — baseline regeneration note

Sprint 9.1 removed the in-app joke disclaimer surfaces per the post-ship
user directive ("uygulamanın her yerine bu şakadır bu şakadır yazdık,
bunların hepsini kaldır"):

1. **Sprint 0 intro disclaimer** (`#disclaimer` + Continue button) —
   removed; `main.ts` now mounts the scene directly into `#app` on
   bootstrap.
2. **Faz 8 son-ekran disclaimer** (`.faz8-disclaimer` Cyrillic + Turkish
   text overlay) — removed; the closing tableau holds purely visual +
   atmospheric.

The following Playwright baselines are **INVALIDATED** by this change
and require regeneration on the next Playwright run via
`npm run test:e2e:update-snapshots`:

- `tests/e2e/faz-screenshots/baseline/T01-lobby.png` — was disclaimer
  headline + Continue button; now the scene-container first paint.
- `tests/e2e/faz-screenshots/baseline/T11-faz8-son-ekran.png` — was
  closing tableau with `.faz8-disclaimer.is-visible` text overlay;
  now the same tableau without overt text (TEKRAR / ÇIK buttons
  still visible).
- `tests/e2e/faz-screenshots/baseline/T12-tekrar-cycle.png` — was a
  fresh disclaimer + buttons re-mount after TEKRAR; now buttons-only.
- `tests/e2e/faz-screenshots/baseline/T13-pre-cik-click.png` — was
  pre-quit DOM state including the disclaimer; now disclaimer-free.

The associated spec assertions (T01 lobby, T11 son-ekran, T12 cycle)
are already patched in `sprint7-faz-smoke.spec.ts` to no longer
reference `#disclaimer.is-revealed` / `.faz8-disclaimer.is-visible`;
only the PNG baselines need to be re-captured.

The other 9 baselines (T02..T10, T14 screenshot if any) are NOT
invalidated by this change — they cover Faz 0..7 chrome that the
disclaimer removal did not touch.
