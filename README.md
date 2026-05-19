# Rus Ruleti

> **DISCLAIMER — Bu bir saka uygulamasidir.** Hicbir gercek dosya, komut veya
> sistem islemi yapilmaz. Tum yikim sahneleri tamamen teatraldir. Detaylar
> icin `LEGAL.md` ve `PLAN.md` dosyalarina bakin.

Sovyet brutalizmi atmosferinde, bir Khrushchyovka bodrumunda gecen tek-oda
rus ruleti simulasyonu. Electron + Three.js + TypeScript ile yazilmistir.

## Quick start

```bash
npm install
npm run dev       # HMR dev server
npm run build     # typecheck + electron-vite build
npm run lint      # eslint --max-warnings 0
npm run typecheck # tsc --noEmit (main, preload, renderer)
```

Distribution builds:

```bash
npm run build:mac   # DMG (Intel + Apple Silicon universal)
npm run build:win   # NSIS installer (x64)
```

## Known behaviors on macOS

The joke app runs in fullscreen + kiosk mode in production builds. macOS
key routing in kiosk mode has several quirks documented below. Most are
intentional or unavoidable; the **3-second ESC hold** is the canonical
emergency exit and is wired to always work.

### Emergency exits (in priority order)

1. **Hold `Esc` for 3 seconds** — primary, always works. Renderer-side
   timer in the preload bridge fires `app:quit` IPC when the hold
   completes. Independent of kiosk state, window menu, and global
   shortcuts. This is the path you want if anything else fails.
2. **`Cmd+Q`** (macOS) / **`Alt+F4`** (Windows) — works in kiosk mode
   thanks to the application menu wired in `src/main/menu.ts` (see C2
   workaround note below).
3. **`Cmd+Option+Esc`** (macOS) / **`Ctrl+Alt+Del`** (Windows) — OS-level
   force quit. We never intercept these.

### C2 workaround — Cmd+Q in kiosk mode

By default, an Electron `BrowserWindow` with `setKiosk(true)` on macOS
silently swallows `Cmd+Q` when no application menu is installed
(electron/electron#3978). To prevent this — which would force users
through the 3-second ESC hold as the only exit — we install an
application menu at `app.whenReady` time with `role: 'quit'` and
`role: 'close'` items. The menu binds the standard `Cmd+Q` and `Cmd+W`
accelerators regardless of kiosk state.

Implementation: `src/main/menu.ts` + `src/main/index.ts` (call site
inside `whenReady` after `registerIpcHandlers()`).

Validated empirically: Rows 1, 6, 7 of the Sprint 0 test matrix (see
`PLAN.md` section "Sprint 0 findings"). Rows 2, 3 confirmed via code
path tracing and Electron docs; final validation requires a signed
dev-build smoke test on a real macOS session.

### Other observed key behaviors (kiosk ON)

| Key            | Behavior                                                        |
|----------------|-----------------------------------------------------------------|
| `Cmd+H`        | Ignored — kiosk suppresses NSApplication hide.                  |
| `Cmd+Tab`      | App switcher still works — runs at WindowServer level, not us.  |
| `Cmd+M`        | Ignored — minimize is suppressed by kiosk.                      |
| `F11`          | No-op on macOS — Electron does not bind F11 by default.         |
| `Esc` (1 tap)  | Consumed by ESC-hold timer; no visible effect on single press.  |
| `Esc` (3s)     | Emergency quit. See "Emergency exits" above.                    |

### Dev-only shortcuts

When running `npm run dev` (i.e. `app.isPackaged === false`):

| Key       | What it does                                                        |
|-----------|---------------------------------------------------------------------|
| `Cmd+K`   | Toggle kiosk mode on the active window. Useful for local Cmd+Q QA. |

These shortcuts are gated on `!app.isPackaged` and never registered in
production builds. See `src/main/index.ts` lines 90-98.

## Known behaviors on Windows

Sprint 0 has not yet performed an empirical Windows kiosk smoke test.
Initial expectations (documented for Sprint 8 validation):

- `Alt+F4` is OS-level; always closes the focused window. Not suppressed
  by kiosk.
- `Win` key — kiosk mode does NOT block the Start menu on Windows
  without group policy / shell replacement. The joke app does not
  attempt to block this.
- `Ctrl+Alt+Del` — OS-level secure attention sequence; always honored.

## Sandbox & security posture

- `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true` —
  see `src/main/window-manager.ts`.
- Preload bridge banned imports: `fs`, `fs/promises`, `child_process`,
  `net`, `http`, `https`, `dgram`, `cluster`, `vm`, `os` — enforced by
  `.eslintrc.cjs`.
- IPC channels are whitelisted in `src/shared/ipc-channels.ts`. Sender
  origin is verified on every call (`src/main/ipc.ts:isAllowedSender`).
- `crashReporter.start({ uploadToServer: false })` — local crash dumps
  only. Sentry DSN is opt-in and not wired in Sprint 0 (see
  `PLAN.md` section 14).

## Reading order

If you are new to the project:

1. `PLAN.md` — full architectural and creative plan.
2. `BUCKSHOT_ROULETTE_THEME.md` — visual reference.
3. `src/main/index.ts` — entry point.
4. `src/preload/index.ts` — read-only renderer API.

## License

UNLICENSED — private joke app, not for redistribution. See `LEGAL.md`.
