# Release Checklist — rus-ruleti

> Operational pre-ship + post-ship checklist for cutting a tagged release of
> `rus-ruleti`. Sprint 9 Phase 1 scaffold; Lane A Phase 2B may extend with
> dryrun-verified build outputs.
>
> Companions: `build/CODE-SIGNING.md` (cert env var contract),
> `LEGAL-CHECKLIST.md` (per-asset audit), `LEGAL.md` (narrative legal
> posture), `electron-builder.yml` (3-platform target config).

---

## Pre-ship checklist (before pushing release tag)

### Gates from Sprint 0-8 baselines

- [ ] All Sprint 0-8 quality gates green: `npm run typecheck && npm run lint && npm run build`
- [ ] `electron-builder` dryrun succeeds: `npm run build:dryrun` produces unpacked `dist/` without errors
- [ ] Bundle size ≤ 8.0 MB (Sprint 9 ceiling; Sprint 8 baseline 7.7 MB + tolerated delta ≤ +0.3 MB for icons/entitlements/LEGAL updates)
- [ ] CSP unchanged from Sprint 0 baseline — no new `media-src` / `connect-src` / `script-src` entries
- [ ] IPC channel count = 5 (Sprint 0-8 closed at 5; Sprint 9 introduces ZERO new channels)
- [ ] `npm audit --production` = 0 vulnerabilities (high/critical block ship; moderate may be triaged)
- [ ] No `console.log` / `debugger` left in production code (`grep -rn 'console\.log\|debugger' src/` returns only intentional logging)
- [ ] No `TODO` / `FIXME` / `XXX` blockers in `src/` (informational TODOs may remain; FIXME blockers must be resolved or explicitly deferred)

### LEGAL gates (Sprint 9 Lane A)

- [ ] `LEGAL.md` reviewed — Sprint 9 distributable verification section appended (~50-80L)
- [ ] `LEGAL-CHECKLIST.md` fully filled — every row has VERIFIED status + SHA-256 hashes where applicable (per Lane A Phase 2B audit dimensions)
- [ ] SHA-256 manifest re-confirmed against Sprint 3 Model Freeze Checkpoint — zero drift
- [ ] Font OFL license files present in `resources/fonts/` (Old Standard TT + PT Serif + DSEG7-Classic)
- [ ] Audio: `grep -r '\.ogg\|\.wav\|\.mp3' src/` returns 0 matches (TH-S4-03 canonical: 100% procedural)
- [ ] Designer icon files present: `build/icon.icns`, `build/icon.ico`, `build/icon.png` (Sprint 9 Phase 2A designer originals; Sovyet brutalist mark)

### Code signing gates (per `build/CODE-SIGNING.md`)

- [ ] macOS: `APPLE_TEAM_ID` + Notary auth env vars populated (Notary API key flow preferred over legacy app-specific password)
- [ ] macOS: `CSC_LINK` / `CSC_KEY_PASSWORD` (file flow) OR `CSC_NAME` (Keychain flow) populated
- [ ] Windows: `CSC_LINK` + `CSC_KEY_PASSWORD` populated (or vendor HSM signing tool configured per vendor docs)
- [ ] Windows timestamping endpoint reachable: `curl -I http://timestamp.digicert.com` returns 200/302
- [ ] All cert env vars in secrets manager (NOT in shell history, NOT in `.env` committed to git)

### Manual smoke-test gates (per platform — Sprint 0 + PLAN §13 explicit)

- [ ] macOS arm64 hardware: app launches, intro disclaimer presents, revolver mechanic works, ESC-hold escape works, Cmd+Q quits cleanly
- [ ] macOS x64 hardware (if available): same gates pass; OR document x64 as untested ship deviation
- [ ] Windows 10/11 hardware: app installs via NSIS, consent screen presents (joke disclaimer), app launches, Alt+F4 quits cleanly
- [ ] Linux desktop hardware (NEW Sprint 9): AppImage runs without manual install; desktop entry shows under Games category
- [ ] Manual smoke on each: revolver chance ~16.7% per pull (random — verify ~6 runs to feel chance); destruction sequence triggers + reveals; no real fs/shell/network access observed via OS-level monitoring tool (e.g., macOS Activity Monitor → Network tab shows zero outbound for the app process)

---

## Build steps (run in order)

1. `npm ci` — clean install verifies lockfile integrity (no transitive drift from `node_modules` you may have had locally)
2. `npm run typecheck && npm run lint && npm run build` — quality gate before any packaging
3. `npm run build:dryrun` — unsigned unpacked `dist/` for fast verification; spot-check that `out/main/index.js`, `out/preload/index.js`, `out/renderer/index.html` are all present in the packaged tree
4. `npm run build:mac` — DMG + ZIP (x64 + arm64). Requires macOS host. Signing via env vars (see Step 8).
5. `npm run build:win` — NSIS + MSI (x64). Cross-builds from macOS via Wine OR runs on Windows host. Signing via env vars (see Step 8).
6. `npm run build:linux` — AppImage + .deb (x64). Cross-builds from macOS via fpm + electron-builder OR runs on Linux host (recommended for `.deb`).
7. Verify `dist/` contents: DMG + ZIP (mac) + NSIS .exe + MSI .msi (win) + AppImage + .deb (linux). Total 6 artifacts.
8. Code-sign each platform per `build/CODE-SIGNING.md` (env vars populated; electron-builder handles signing during steps 4-6 automatically when env vars present).
9. Notarize macOS — electron-builder calls Apple Notary service automatically when `APPLE_API_KEY` / `APPLE_API_KEY_ID` / `APPLE_API_ISSUER` (or legacy `APPLE_ID` + `APPLE_APP_SPECIFIC_PASSWORD`) are present. Wait for notarization to complete (~5-15 min).
10. Stamp Windows installers — RFC 3161 timestamp via `http://timestamp.digicert.com` (electron-builder applies automatically when configured in `electron-builder.yml`).

---

## Post-ship checklist (after tagging release)

### First-run smoke (each platform)

- [ ] Manual install + launch on actual hardware (NOT just CI dryrun): macOS DMG → drag-to-Applications → launch → intro presents within ~3s
- [ ] Verify joke disclaimer presents on intro screen (Cyrillic + Turkish text legible; font fallback OK)
- [ ] Verify joke disclaimer presents on reveal screen (post-destruction reveal copy)
- [ ] Verify revolver mechanic: ~6 pulls feels like ~16.7% per pull; deterministic-feeling on subsequent runs after restart (RNG seeded per session)
- [ ] Verify destruction sequence triggers when revolver "fires" (Sprint 4-7 destruction scenes play in expected order)
- [ ] Verify ESC-hold 3-second escape works mid-destruction (Sprint 5+ feature)
- [ ] Verify Cmd+Q (macOS) / Alt+F4 (Windows/Linux) clean quit works
- [ ] Verify no real fs/shell/network access: OS-level monitor shows zero outbound network connections; no `/private/tmp` writes; no process spawned outside the Electron app tree

### Distribution gates

- [ ] Git tag: `git tag v0.0.1` (or chosen ship version; bump per semver if not first release) + `git push origin v0.0.1`
- [ ] GitHub Releases manual upload (per PLAN §14 — NO auto-publish):
  - [ ] Upload macOS DMG + ZIP (both archs if both built)
  - [ ] Upload Windows NSIS .exe + MSI .msi
  - [ ] Upload Linux AppImage + .deb
  - [ ] Release notes draft: link `LEGAL.md` + `LEGAL-CHECKLIST.md` + brief "joke app disclaimer" paragraph + ESC-hold escape mention
  - [ ] Mark release as **private** OR **prerelease** initially to control rollout (per PLAN §14: GitHub Releases manual private + disclaimer)

### Monitoring (first week)

- [ ] Watch issue tracker for joke-app trolling patterns (users opening "this destroyed my computer" issues — point to LEGAL.md disclaimer)
- [ ] Watch for false-positive AV flags on Windows (especially during NSIS reputation build-up if OV cert used instead of EV)
- [ ] Watch for macOS Gatekeeper warnings (notarization sometimes lags; user reports of "Apple cannot check this app for malicious software" → re-verify notarization log)
- [ ] Watch for Linux distro packaging requests (.rpm, Snap, Flatpak — out of Sprint 9 scope but track demand)
- [ ] Watch for accessibility / locale issues (Cyrillic glyph rendering on older Linux distros; Turkish keyboard ESC-hold conflicts)

---

## Escape hatches / known deviations

- **x64 macOS cross-build:** If x64 build blocks in CI/local harness, arm64-only ship is acceptable; document as ship-time deviation in release notes.
- **.deb cross-build from macOS:** If `fpm` flow blocks, AppImage-only ship is acceptable; document as deviation; users on Debian/Ubuntu can install via AppImage.
- **Notarization timeout:** If Apple Notary service has > 30 min delay, retry once; if persistent, document as "unsigned macOS build, Gatekeeper bypass instructions in release notes (`xattr -dr com.apple.quarantine`)".
- **Playwright LOCAL e2e baseline:** Sprint 8 + Sprint 9 deferred. Final-deferral acceptable for joke-app ship; visual regression coverage added post-launch if real-user issues surface (see Sprint 9 directive §0 Friction 1).

- **`npm run build:dryrun` from worktree harness (TH-S9-01 KNOWN-LIMITED):**
  Sprint 9 Lane A M5 attempted `npm run build:dryrun` from inside a git
  worktree (`.claude/worktrees/agent-<id>/`). The `electron-vite build`
  prefix step succeeded — `out/main`, `out/preload`, `out/renderer` all
  emitted at ~7.7 MB total. The `electron-builder --dir` packing step
  failed with:

  ```
  ⨯ Cannot compute electron version from installed node modules - none of
    the possible electron modules are installed and version ("^30.1.0") is
    not fixed in project.
  See https://github.com/electron-userland/electron-builder/issues/3984
  ```

  Root cause: a git worktree does NOT inherit `node_modules/` from the
  parent repo's tree. While Node's module resolution walks UP the
  directory tree and DOES find `../../node_modules/typescript` (so
  `tsc`/`eslint`/`electron-vite` work via npm script PATH), electron-
  builder runs a separate `app-builder` subprocess that reads
  `<project-root>/node_modules/electron/package.json` for the resolved
  Electron version. With no local `node_modules/electron/`, that lookup
  fails. The caret-ranged `"electron": "^30.1.0"` in `package.json` is
  not enough for electron-builder to resolve absent the local install.

  **Ship-time user procedure** (NOT a worktree task — orchestrator runs
  the merged main branch, where `node_modules/` is present):

  ```sh
  # Step 1 — From main repo root (NOT a worktree), ensure deps installed:
  cd /Users/svoboden/development/rus-ruleti
  npm ci

  # Step 2 — Verify electron resolves:
  node -e "console.log(require('electron/package.json').version)"
  # → 30.x.y (specific resolved version)

  # Step 3 — Run the full dryrun:
  npm run build:dryrun

  # Step 4 — Verify outputs:
  ls -la dist/mac-arm64/  # OR dist/mac/, dist/win-unpacked/, etc.
  du -sh dist/
  # Sprint 9 ceiling: ≤ 8.0 MB for app bundle (excluding Electron framework)
  ```

  **What WAS verified Sprint 9 Lane A M5 (without running the full pack):**

  1. `electron-builder.yml` YAML parses cleanly via `js-yaml` (Lane A M1
     YAML still parses post-M2 raster commits).
  2. `build/entitlements.mac.plist` XML parses cleanly via `plutil -lint`
     (Apple's native plist validator).
  3. `out/` bundle size from `electron-vite build` step: 7.7 MB ≤ 8.0 MB
     ceiling (acceptance criterion 9 met for the application portion).
  4. All 5 raster artifacts present at `build/icon.{icns,ico,png}` +
     `build/dmg-bg.png` + `build/nsis-banner.bmp` (Lane A M2).
  5. All 3 platform target blocks (mac DMG+ZIP, win NSIS+MSI, linux
     AppImage+deb) syntactically valid in YAML.

  **This is NOT a blocker for ship.** The dryrun failure is purely a
  worktree-environment limitation; it does not impact the actual ship
  build path (which runs from main branch with deps installed). The
  electron-builder configuration is correct and parses; the icons exist;
  LEGAL is closed; entitlements XML is well-formed. The maintainer
  executes the ship-time procedure above from the main repo before
  tagging release.
