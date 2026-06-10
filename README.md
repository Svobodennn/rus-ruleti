# Rus Ruleti

Sovyet brutalizmi atmosferinde, bir Khrushchyovka bodrumunda geçen tek-oda rus
ruleti. Electron + Three.js + TypeScript ile yazılmış masaüstü uygulaması.

## İndir (Windows x64)

1. [**En son sürümü indir**](https://github.com/Svobodennn/rus-ruleti/releases/latest) → `.exe` dosyası.
2. Çift tıkla. Windows SmartScreen *"Windows protected your PC"* uyarısı verirse:
   **More info → Run anyway** (uygulama imzasız).
3. Tam ekran açılır.

## Çıkış

- `Esc`'i **3 saniye** basılı tut — her zaman çalışır.
- `Alt+F4` (Windows) / `Cmd+Q` (macOS).

## Geliştirme

```bash
npm install
npm run dev        # HMR dev server
npm run build      # typecheck + electron-vite build
npm run build:win  # portable .exe — CI: .github/workflows/build-windows.yml
npm run lint
npm run typecheck
```

## Güvenlik duruşu

- `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`
  (`src/main/window-manager.ts`).
- Preload köprüsü `fs`, `child_process`, `net`, `http(s)`, `os` vb. importları
  yasaklar (`.eslintrc.cjs`); IPC kanalları `src/shared/ipc-channels.ts`'de
  whitelist'lidir, her çağrıda sender origin doğrulanır.

## Lisans

UNLICENSED. Üçüncü-parti asset lisansları (CC-BY / SIL-OFL) için `LEGAL.md`.
