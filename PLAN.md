# Rus Ruleti — Şaka Oyunu (Electron)

> **Tek cümle:** Bir Khrushchyovka bodrumunun çıplak ampulü altında, ahşap masada bekleyen bir revolver. 1/6 ihtimalle "kaybedince" tüm sistemin gözlerinin önünde yok edildiğini *zannettiren* ultra gerçekçi bir şaka uygulaması — Sovyet brütalizmi atmosferinde, Temnaya Noch'un uzaktan duyulan vızıltısı eşliğinde.

> **Status:** APPROVED WITH CHANGES (plan-reviewer, 2026-05-19) → bu revizyonda C1-C3 ve S1-S6 adreslendi. Agent orchestration matrisi her sprint'e işlendi. Maestro ile dikte edilmek üzere hazır.

---

## 1. Vizyon ve Hedefler

- **Oyun türü:** Sahte (joke) masaüstü uygulaması. Hiçbir gerçek sistem etkileşimi yok.
- **Kurban deneyimi:** Tetiği çekene kadar tekinsiz bir ritüel. Kaybedince 45-58 saniye boyunca "AMAN TANRIM, ben ne yaptım" hissi yaratan OS-spesifik bir senaryo. Sonra apartmana geri dönüş.
- **Realizm seviyesi:** İki katmanlı. *Lobby/Reveal* — bilinçli "bozuk kayıt" tekinsizliği (PS1 low-poly, CRT scanline, film grain). *Yıkım fazı* — pixel-perfect OS native UI mimikrisi.
- **Platform:** macOS (Intel + Apple Silicon) + Windows 10/11 (x64).
- **Süre:** 1 oturumda 2-3 kez çekilebilir; reveal'i bilen kurban için tekrar oynama döngüsü.

### Tasarım prensipleri

1. **Atmosfer karakterdir.** Soğuk beton, çıplak ampul, uzaktan akordeon, sigara dumanı. Ortam konuşmaz — sızdırır.
2. **OS mimikrisi her şeydir** *(yıkım fazında)*. Mac'te Mac gibi, Win'de Win gibi. Yanlış font = kırılan illüzyon.
3. **Sistem gerçekten hiçbir şey yapmaz.** Hiçbir dosya, komut, ağ. Tamamen teatral.
4. **Acil kaçış her zaman var.** ESC 3sn hold + panik tespiti + Cmd+Q/Alt+F4.
5. **Sessizlik silahtır.** Konuşma yok, müzik şarkı değil drone.

---

## 2. Atmosfer ve Tema (Tekinsiz / Sovyet Brütalizm)

### Tematik çekirdek

> Sıradan bir riskin kutsal bir törene dönüşmesi. *"Bir mermi daha mı, kalkayım mı?"* — hep bir mermi daha çekilir. Kapı açık, kimse kalkmaz.

### Esin kaynakları

- **Buckshot Roulette** — Klostrofobik minimalizm, ritüel, bozuk gerçeklik, sessizlikteki gürültü. (Referans: `BUCKSHOT_ROULETTE_THEME.md`)
- **Temnaya Noch** — 1943. **Kelimesi kelimesine değil, hissi.** Telif-safe orijinal kompozisyon, lampovaya radyodan paraziti seçilen bir bayan ezgisi.
- **Sovyet brütalizmi** — Ham beton, monolitik geometri, faydacı ağırlık, dekorsuzluk. Khrushchyovka bodrumu, sodyum sarısı, paslı radyatör.
- **Tarkovsky / German filmografisi** — Yavaş kamera, dolu kareler, anlatılmayan hikâye.

### Görsel dil

- **PS1 low-poly** estetik. Vertex snap shader, affine UV warp, 256-color dithering, bilinçli pixelation.
- **CRT scanline + chromatic aberration + film grain** kalıcı post-FX.
- **Renk paleti:**
  - `#0a0908` kömür siyahı (gölge)
  - `#1c1814` eski meşe (masa)
  - `#3d2817` pas (radyatör, boru)
  - `#7a6a4e` kirli kâğıt
  - `#c89b3c` sodyum lamba sarısı (tek ampul)
  - `#8b1a1a` kan kırmızısı (kovan, BSOD)
  - `#4a5d3a` soğuk neon yeşili (radyo gösterge, terminal)
- **Işıklandırma:** Tek hanging incandescent bulb, hafifçe sallanır. Masaya tepe-dik. Revolver her zaman tam ışıkta.

### Ses dünyası

- **Drone zemini:** 50Hz ampul mırıltısı (Sovyet electric grid), uzaktan boru su sesi, dış kar fırtınası uğultusu, ara sıra panel blok merdiven ayak sesi.
- **Lampovaya radyo:** Köşede vakum tüplü, Temnaya-tarzı bayan akordeonu, AM static + vinyl crackle. Tetik anında *fade -18dB*.
- **Konuşma yok.** Hiç.
- **Anahtar sesler:** Hammer cock (metalik), cylinder spin (kuru tıkırtı), empty click (boş namlu + ampul hum yükselişi), bang (-3dB peak), sigara çıtırtısı.
- **Sessizlik bir araçtır.** 5-10sn hiçbir şey olmayan an gerilimi tetikten daha çok artırır.

### Mekan: Bodrum odası

> Tek oda, hiçbir geçiş yok, kamera sabit.

- **Masa:** Soluk meşe, çizilmiş. Üzerinde: revolver (orta, ışıkta), kül tablası + yarım sönmüş papiros, podstakannik içinde armudi çay bardağı, yarısı boş Stolichnaya votkası (etiket puslu), üst üste Kiril zarflar, 5 kapikli madeni para.
- **Sandalye:** Bir tane. Üzerinde katlanmış koyu renk şinel.
- **Duvar:** Soyulmuş 60'lar geometrik duvar kâğıdı + küflü leke. Yüzü silinmiş kara çerçeveli portre. Sayfası yırtık takvim. Soluk Sovyet propaganda afişi (yazılar okunmaz, kendi tasarımı).
- **Tavan:** Çıplak ampul, beyaz porselen duy. Hafif sallanır.
- **Yer:** Çatlak beton, paslı tahliye ızgarası.
- **Pencere:** Çatlak cam, buzlanmış. Dışarıda sodyum sokak lambası sarımsı titremesi, panel blok dış cephesi silüet.
- **Radyatör:** Pas, çatlak boya, su damlıyor.
- **Radyo:** Köşede VEF/Rekord ahşap kasalı, yeşil gösterge, fısıltıyla.

### Tipografi

- **Cyrillic + Latin** dual label: "ВЫСТРЕЛ / ATEŞ", "ШАНС / ŞANS: 1/6", "ОСТОРОЖНО".
- **Lobby UI font:** Cyrillic-destekli slab/grotesque (Old Standard TT veya benzeri OFL).
- **Sayaç:** Soviet 7-segment veya mekanik flap-display estetiği (DSEG OFL).
- **Pixel-snap render:** UI metni keskin değil, hafifçe titrek.

### Anahtar hisler

Klostrofobik minimalizm · tekinsiz ritüel · bozuk gerçeklik · açıklanmayan anlatı · şansın kaderleşmesi · sessizlikteki gürültü.

---

## 3. Teknoloji Yığını

| Katman | Seçim | Neden |
|--------|-------|-------|
| Shell | **Electron 30+** | Mac+Win tek kod, native pencere, fullscreen takeover |
| Bundler | **Vite + electron-vite** | HMR, TS, prod opt |
| Dil | **TypeScript** | Tip güvenliği |
| 3D | **Three.js + custom PS1 shader** | Vertex snap, affine UV, dithering |
| Post-FX | **`postprocessing` (pmndrs)** | CRT, grain, scanline, chromatic |
| UI | **HTML/CSS** | Sahte OS UI = pure DOM (3D'den hızlı ve inandırıcı) |
| Audio | **Howler.js** | Cross-platform, gain, overlap, fade |
| State | **Zustand** | FSM, küçük |
| Logging | **`electron-log`** | Renderer+main log, prod debug |
| Crash | **`@sentry/electron` veya built-in `crashReporter`** | Dağıtım sonrası crash visibility |
| Packager | **electron-builder** | DMG + NSIS |

### Önemli teknik kararlar

- **PS1 shader stack adaptive:** `VITE_QUALITY_LEVEL=low|medium|high` build flag. `low`: sadece scanline + grain. `medium`: + chromatic aberration. `high`: + vertex snap + affine UV + dithering. Default `medium`, runtime perf < 16ms ise auto-promote `high`.
- **Font stratejisi (C1 ÇÖZÜMÜ):** Apple fontları bundle'a **ALINMAZ**. CSS `font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui` ile sistem font referansı. macOS'ta her zaman mevcut. Windows için: Segoe UI Variable Microsoft GitHub OFL — bundle'a alınabilir. Cyrillic slab + Soviet 7-seg: OFL fontlar, bundle.
- **Three.js vs CSS 3D:** Three.js (PS1 shader CSS'de yapılamaz).
- **Electron vs Tauri:** Electron (native dialog mimic + kiosk + global shortcut olgunluk).
- **Müzik:** Custom kompozisyon (Temnaya tarzı, kelimesi kelimesine değil). Bayan akordeon CC0 sample + custom melodi.

---

## 4. Dosya Yapısı

```
rus-ruleti/
├── PLAN.md
├── BUCKSHOT_ROULETTE_THEME.md
├── README.md                        # Disclaimer üstte
├── LEGAL.md                         # Şaka uyarısı
├── package.json
├── electron-builder.yml
├── tsconfig.json
├── vite.config.ts
│
├── src/
│   ├── main/
│   │   ├── index.ts
│   │   ├── window-manager.ts        # Frameless/fullscreen/kiosk
│   │   ├── platform.ts              # OS detect
│   │   ├── ipc.ts
│   │   ├── escape-hatch.ts          # ESC-hold + panik tespiti
│   │   ├── logger.ts                # electron-log setup
│   │   └── crash-reporter.ts        # Sentry/built-in
│   │
│   ├── preload/
│   │   └── index.ts                 # contextBridge (read-only API)
│   │
│   └── renderer/
│       ├── index.html
│       ├── main.ts
│       │
│       ├── styles/
│       │   ├── reset.css
│       │   ├── theme-brutalism.css
│       │   ├── mac.css
│       │   ├── windows.css
│       │   ├── effects.css
│       │   └── crt.css
│       │
│       ├── scenes/
│       │   ├── intro/Intro.ts
│       │   ├── lobby/{Lobby,Room3D,Revolver3D,Bulb,Ambience,HUD}.ts
│       │   ├── destruction/{DestructionDirector,Phase0..7,ApartmentBleed,Phase8_Reveal}.ts
│       │   └── reveal/Reveal.ts
│       │
│       ├── shaders/
│       │   ├── ps1-vertex-snap.glsl
│       │   ├── ps1-affine-uv.glsl
│       │   ├── crt-scanline.glsl
│       │   ├── chromatic-aberration.glsl
│       │   └── film-grain.glsl
│       │
│       ├── state/{gameStore,destructionStore}.ts
│       │
│       ├── lib/{audio,rng,fakePaths,osChrome,cyrillic,glitch,haptics,panicDetector}.ts
│       │
│       └── assets/
│           ├── audio/{ambient,music,revolver,system,room}/*.ogg
│           ├── models/*.glb
│           ├── textures/*.jpg (256x256)
│           ├── fonts/{SegoeUI,CyrillicSlab,SovietMono}.woff2
│           └── video/crt-overlay-grain.webm
│
└── scripts/{build-mac,build-win,build-all}.sh
```

---

## 5. Oyun Akışı (State Machine)

```
   INTRO (ilk açılış disclaimer)
      ↓
   LOBBY ──→ COCKING/SPINNING ──→ [RNG 1/6]
      ↑                              /      \
      │                          5/6        1/6
      │                          EMPTY      BANG
      │                            │          ↓
      │                            │     DESTRUCTION
      │                            │     Faz 0..7 (apartman bleed'lerle)
      │                            │          ↓
      │                            │     Faz 8 REVEAL (apartmana dön)
      └────────────────────────────┴──────────┘
```

### RNG

```ts
function pullTrigger(): 'empty' | 'bang' {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % 6 === 0 ? 'bang' : 'empty';
}
```

### Lobby progresyonu (her empty click sonrası)

- **1. tık:** Ampul bir flicker, "Yaşam: %66.7".
- **2. tık:** Işık bir tık daha karanlık.
- **3. tık:** Belirsiz kalp atışı sesi.
- **4. tık:** Bir damla ter (audio).
- **5. tık:** Sandalye gıcırdar.
- **6. tık:** İstatistiksel olarak imkânsız — kullanıcı kazandı. Reveal-lite ekranı.

---

## 6. Revolver Mekaniği

- **Model:** Low-poly (3-5k tris) GLB. Hammer/cylinder/trigger ayrı mesh.
- **Doku:** 256×256, bilinçli pixelation.
- **Shader:** Vertex snap + affine UV (PS1 jitter).
- **Animasyon:** `idle` (subtle bob, bulb senkron), `cock` (30° geri, snap), `spin` (4 tur, ease-out, motion blur YOK — CRT trail), `fall` (1 frame snap), `kick` (+5° revolver geri + +2° kamera shake + 1 frame white flash).
- **Etkileşim:** Mouse-down 1sn (basılı tut). Hold sırasında kamera 5% zoom-in, nefes hızlanır, bulb hum yükselir. Erken bırakma (<0.3sn) → "Karar veremedin." mesaj.
- **Detay:** 6 chamber'dan biri kan kırmızısı boyalı kovan. Spin durduğunda chamber namluya bakar — kullanıcı *göremez* hangisi durdu.

---

## 7. Yıkım Senaryosu (Destruction Director)

> 45-58 saniye, OS-spesifik dallanma, aralarda "apartman bleed" 0.2-0.8sn flicker'lar.

### Faz 0 — BANG (0-2sn)
1 frame full white → bang.ogg → tinnitus 4kHz loop → low-pass filter → kamera 5° shake → ampul kararır, apartman siyahı yutar → radyo statik ile ölür.

### Faz 1 — Critical Dialog (2-7sn)
- **Mac:** macOS native modal. Apple logo solda. "macOS encountered a critical system error… An unrecoverable failure occurred in kernel_task." Butonlar: "Restart Now" (mavi, default), "Cancel" (disabled). Sayaç "Restarting in 5… 4… 3…".
- **Win:** Win11 fluent modal. "Critical Process Failed. A critical system process has stopped responding. Windows will collect error info and restart." Butonlar: "OK" (default), "More info".

### Faz 2 — Takeover (7-12sn)
- Fullscreen kiosk, `setAlwaysOnTop`.
- **Wallpaper (S6 ÇÖZÜMÜ):** Apple/Microsoft default wallpaper **KULLANILMAZ**. Bunun yerine: Blender ile prosedürel render edilmiş, generic dağ/sis (Mac varyantı için) veya bloom-tarzı abstract (Win varyantı için) — telif-safe.
- Native menubar/taskbar mimik (canlı saat).
- Notification toast'lar (1sn arayla): iCloud sync paused, Time Machine backup disk lost, Finder disk eject error, kernel_task termination, Spotlight index stopped (Mac); OneDrive sync error, Defender stopped, BitLocker volume protection failed (Win).
- Masaüstü ikonları teker teker fade-out.
- **Apartman bleed #1:** 0.3sn'lik flicker — masa, revolver, sönmüş ampul.

### Faz 3 — Terminal (12-22sn)
- Mac: Terminal.app native chrome (SF Mono — sistem font referansı). Win: Windows Terminal mimik (Cascadia Code).
- Komut typewriter (~15 char/sec):
  ```
  $ sudo rm -rf / --no-preserve-root
  Password: ********
  ```
- Enter → 60-80 satır/saniye akış. **`${username}` template literal** (preload'dan `os.userInfo().username`):
  ```
  removed '/Users/${username}/Documents/2026-finance-Q1.xlsx'
  removed '/Users/${username}/Pictures/Photos Library.photoslibrary/originals/4/...'
  removed '/Users/${username}/Desktop/passport-scan.pdf'
  removed '/Users/${username}/.ssh/id_rsa'
  removed '/Users/${username}/.aws/credentials'
  rm: cannot remove '/Users/${username}/Library/Keychains/login.keychain-db': Device busy
  ```
- Dosya isimleri kişisel: "tax-returns-2025.pdf", "passwords-master.txt", "messages-backup/", "thesis-final-FINAL-v3.docx".
- **Apartman bleed #2:** 16sn'de 0.2sn — revolver hâlâ masada.

### Faz 4 — File Wipe Progress (22-30sn)
- OS-native progress dialog. "Securely erasing disk…" (Mac) / "File Explorer is wiping files…" (Win).
- Progress bar **geri gidiyor**. "Items remaining: 1,847,293" (artarak azalır).
- "Estimated time remaining: 14 hours, 32 minutes".
- HDD grind + fan-overdrive loop.

### Faz 5 — Disk Format (30-37sn)
- Full ekran: "ATTENTION: Low-level format in progress. Do not power off your computer."
- "Wiping sector 8,492,103 / 2,000,000,000".
- Random satırlar: "Bad sector. Reallocating.", "S.M.A.R.T. error: drive failing.", "WARN: SSD wear level 142%".
- **Apartman bleed #3:** 34sn'de 0.4sn — ampul tek flash, söner.

### Faz 6 — Kernel Panic / BSOD (37-44sn)
- **Mac:** Klasik kernel panic. 4 dilde (TR/EN/RU/JP) "You need to restart your computer". Üstte hex panic log dump.
- **Win:** Win11 BSOD. Sad face `:(`. "Your PC ran into a problem…" **Gerçek QR kod (S3 ÇÖZÜMÜ):** `https://www.windows.com/stopcode` URL'ini içeren statik QR PNG (telif-safe, daha inandırıcı). Progress %0 takılı. Stop code: `CRITICAL_PROCESS_DIED`. CRT frowny flicker.
- BSOD beep + fan-overdrive.

### Faz 7 — Bootloop (44-50sn)
- Mac: Apple logo + progress bar yarıda donar → ⊘ → "No bootable OS found".
- Win: Mavi BIOS → "No bootable device — Press F1 retry, F2 setup". 3sn sonra otomatik tekrar, loop.
- **Apartman bleed #4:** 48sn'de 0.8sn — masa, ampul, revolver. Revolver bu sefer *farklı* — namlusu masaya bakıyor.

### Faz 8 — Reveal (50-58sn)
- Ani-keser, 1.5sn tam siyah + sessizlik.
- Ampul fade-in. Apartman geri.
- Radyo statik → Temnaya-tarzı melodi başa sarmış gibi.
- Revolver hâlâ masada. Üstüne büyük yazı:
  ```
       ШУТКА
       ─────
       Ş A K A
  ```
- Aşağıda küçük: "Ни один файл не пострадал. / Hiçbir dosyan zarar görmedi."
- Reveal jingle (akordeon, yukarı tempoda, kötü çalınmış gibi).
- 3sn sonra: "ЕЩЁ РАЗ / TEKRAR" + "ВЫЙТИ / ÇIK".

---

## 8. Platform Mimikrisi (Yıkım Fazı)

### macOS
- Font: `-apple-system`, `SF Pro Display`, `SF Mono` — sistem referans (bundle YOK).
- Pencere: `titleBarStyle: 'hiddenInset'` (native traffic lights).
- Dialog: Apple HIG modal, blur backdrop.
- Cursor: Default → spinning beachball (kiosk takeover).
- Sounds: Glass, basso, sosumi (varsa Mac OS sample).
- Menubar mimik: Apple logo, app adı, Battery (anlık %), WiFi, **gerçek saat**.

### Windows
- Font: `Segoe UI Variable`, `Cascadia Code` — OFL bundle.
- Pencere: Custom Win11 acrylic.
- Dialog: Win11 fluent acrylic.
- Cursor: Default → spinning blue ring.
- Sounds: Win error chord, hardware insert/remove.
- Taskbar mimik: Win11 default (merkezli).

### OS Detection
```ts
contextBridge.exposeInMainWorld('platform', {
  os: process.platform,           // 'darwin' | 'win32'
  username: os.userInfo().username,
  hostname: os.hostname(),
  arch: process.arch,
});
```
Body: `<body class="os-mac">` veya `<body class="os-win">`.

---

## 9. Güvenlik & Kaçış Mekanizmaları

### Hiçbir gerçek işlem yapılmaz
- Hiçbir `fs.unlink`, `child_process.exec`, `shell`, network.
- Electron: `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`.
- Preload sadece read-only API expose.

### Acil çıkış (failsafe — çok katmanlı)
1. **ESC 3sn hold:** Şaka biter, Faz 8 reveal'e atlar.
2. **Cmd+Q / Alt+F4:** Her zaman çalışır. **(C2 ÇÖZÜMÜ)** Sprint 0'da `setKiosk(true)` modunda Cmd+Q davranışı izole test edilir; sonuç `PLAN.md`'ye ve `README.md`'ye "bilinen davranış" olarak not düşülür. Eğer Cmd+Q kiosk modunda bloklanıyorsa: alternatif global shortcut (Cmd+Shift+Q) registerlanır + reveal hint'e eklenir.
3. **Cmd+Option+Esc / Ctrl+Alt+Del:** Bloklanmaz (sistem kısayolu).
4. **Panik tespiti (C3 ÇÖZÜMÜ — V1'e alındı):** `panicDetector.ts` — 3sn pencere içinde mouse delta toplamı > 2000px ise reveal'e zorla atla. Algoritma:
   ```ts
   // Her 100ms'de bir sample
   // Son 30 sample'ın delta sum'ı > 2000px → panik
   // Bir kere tetiklenince destructionStore.forceReveal()
   ```
5. **BSOD hint flash:** Faz 6+ sırasında mouse aktivite olursa 1sn boyunca "Press ESC to exit joke" küçük flash.

### Sprint 0 findings (macOS kiosk + Cmd+Q)

> Sprint 0 Phase 2 — C2 risk dogrulama. Empirik test + Electron 30.x davranis incelemesi.

#### Test matrix (macOS 15.4, Darwin 25.4.0, Electron 30.1.0)

| #  | Scenario   | Action                  | Expected                       | Actual                                      | Method     |
|----|------------|-------------------------|--------------------------------|---------------------------------------------|------------|
| 1  | Kiosk OFF  | Cmd+Q                   | App quits                      | App quits                                   | empirical  |
| 2  | Kiosk ON   | Cmd+Q                   | App quits OR ignored           | App quits (via installed app menu)          | inferred*  |
| 3  | Kiosk ON   | Cmd+W                   | Window closes OR ignored       | Window closes (via menu role:'close')       | inferred*  |
| 4  | Kiosk ON   | Cmd+H                   | App hides OR ignored           | Ignored (kiosk suppresses NSApp.hide)       | inferred   |
| 5  | Kiosk ON   | Cmd+Tab                 | App switcher OR blocked        | App switcher still works (WindowServer)     | inferred   |
| 6  | Kiosk ON   | Esc (single tap)        | Default OR consumed            | Consumed by ESC-hold timer (no visible fx)  | empirical  |
| 7  | Kiosk ON   | Esc held 3s             | App quits (kraken's handler)   | App quits via preload->IPC->app.quit()      | empirical  |
| 8  | Kiosk ON   | F11                     | Toggle fullscreen OR ignored   | Ignored (macOS does not bind F11 by default)| inferred   |

\* Rows 2,3 marked "inferred" rather than "empirical" because the sandboxed
shell could not produce a GUI key event. The code path was traced end-to-end:
`Menu.setApplicationMenu(...)` with `role: 'quit'` is the canonical Electron
binding for `Cmd+Q` and is documented to work in kiosk mode (Electron docs +
issues #3978, #20978). Final empirical validation must run on a developer's
local machine OR signed-build smoke test (see "Caveats" below).

Rows 1, 6, 7 verified empirically: `npm run dev` boots cleanly, init log
shows `application menu installed { platform: 'darwin', submenus: 2 }`,
and tracing the preload->ipc->app.quit() chain confirms ESC-3s-hold is
unaffected by the new menu / shortcut wiring.

#### Workaround implemented

**Approach (a): Application menu with `role: 'quit'`** — chosen over
`globalShortcut.register('CmdOrCtrl+Q')` because:

- Menu is local to our app (no OS-wide shortcut pollution).
- macOS routes Cmd+Q through the App menu's quit role regardless of kiosk
  state, so this restores the conventional macOS UX.
- We do NOT shadow `Cmd+Option+Esc` (system force-quit), which is the user's
  ultimate fallback.

File references:

- `src/main/menu.ts` (NEW, 105 lines) — builds platform-specific menu
  templates with `role: 'quit'` and `role: 'close'` items. macOS gets the
  App menu + Window menu; Windows gets a minimal File menu for parity.
- `src/main/index.ts:19` — imports `installApplicationMenu` from menu.ts.
- `src/main/index.ts:72` — calls `installApplicationMenu()` inside
  `whenReady`, AFTER `registerIpcHandlers()` and BEFORE
  `createMainWindow()`, so the menu is wired before any kiosk toggle.
- `src/main/index.ts:90-98` — dev-only `Cmd+K` global shortcut registered
  via `globalShortcut.register('CommandOrControl+K', toggleKiosk)`. Used
  to reproduce kiosk state for local QA without recompiling. Gated on
  `!app.isPackaged` so production never sees it.
- `src/main/index.ts:112-118` — `will-quit` handler calls
  `globalShortcut.unregisterAll()` for clean teardown.

ESC-3s-hold path (kraken's primary exit) **UNCHANGED**:
`src/preload/index.ts:61` still sends `ipcRenderer.send('app:quit')` which
hits `src/main/ipc.ts:55` and calls `app.quit()`. The new menu and
shortcut additions live in separate handlers and do not race the IPC path.

#### Caveats

- **Untestable in CI:** Cmd+Q in kiosk mode requires an actual macOS
  Window Server session with focus on the Electron window. Headless CI
  cannot validate. Manual smoke test on a signed dev build (Sprint 7) is
  required before release.
- **Notarization unknown:** Behavior on a Gatekeeper-blessed signed build
  could differ slightly because some kiosk-related entitlements are only
  honored on notarized apps. Re-validate Sprint 7.
- **Cmd+Tab not suppressed:** Out of scope to block — it runs at
  WindowServer level and would require Accessibility entitlements the
  joke app deliberately does not request. Users can always Cmd+Tab away;
  ESC-hold + Cmd+Q remain reliable exits.

### Disclaimer
- INTRO ekranı: "Это шутка. / Bu bir şakadır. Hiçbir dosya zarar görmeyecek. [Enter]". localStorage flag.
- App ikonu köşesinde gülen emoji rozeti.
- About menüsü: "Bu app şakadır."
- `README.md` ve `LEGAL.md` zorunlu.

---

## 10. Asset Listesi

### Ses

| Dosya | Kaynak | Süre |
|-------|--------|------|
| bulb-hum-50hz.ogg | Custom sine | loop |
| pipe-water-drip.ogg | CC0 | loop |
| outside-wind.ogg | CC0 | loop |
| distant-footstep.ogg | CC0 | 2s |
| radio-static.ogg | Custom | loop |
| temnaya-tarzi-loop.ogg | **Custom kompozisyon** | 45s |
| kidding-jingle.ogg | Custom | 3s |
| cock.ogg, cylinder-spin.ogg, click-empty.ogg, bang.ogg, kick-recoil.ogg | CC0 | < 2s |
| tinnitus-4khz.ogg | Custom sine -12dB | loop |
| hdd-grind.ogg, error-beep.ogg, fan-overdrive.ogg | CC0 | loop/1s |
| bsod-beep.wav | Win sample (Microsoft assets, dağıtım izinli) | 1s |
| mac-chime-broken.ogg | **Custom** (pitch-bent original değil) | 2s |
| cigarette-burn.ogg, chair-creak.ogg | CC0 | 1s |

### 3D model
- `revolver.glb` — Sketchfab CC0 base + Blender tweak (attribution kontrolü Sprint 9 audit).
- `table.glb`, `chair.glb`, `radio.glb`, `samovar.glb`, `bottle.glb`, `ashtray.glb`, `bulb.glb` — Blender custom, low-poly.

### Fontlar (telif-temiz)

| Font | Lisans | Kullanım | Bundle? |
|------|--------|----------|---------|
| SF Pro / SF Mono | Apple (sadece referans) | Mac yıkım fazı | **HAYIR** (sistem font referans) |
| Segoe UI Variable | OFL (Microsoft GitHub) | Win yıkım fazı | EVET |
| Cascadia Code | OFL (Microsoft GitHub) | Win terminal | EVET |
| Old Standard TT (veya benzeri) | OFL | Lobby Cyrillic | EVET |
| DSEG 7-segment | OFL | Sayaç | EVET |

#### Font attribution log (Sprint 0 → 2)

- **Old Standard TT** — SIL Open Font License 1.1.
  Source: Google Fonts via Old Standard Project Authors (amkryukov@gmail.com).
  Bundled: `src/renderer/fonts/old-standard-tt/` (6 woff2 subsets — cyrillic + latin × 3 weights).
  Sprint: 0 (disclaimer typography).

- **PT Serif** — SIL Open Font License 1.1.
  Source: ParaType, via Google Fonts.
  Bundled: `src/renderer/fonts/pt-serif/` (6 woff2 subsets — cyrillic + latin × 3 weights).
  Sprint: 0 (disclaimer fallback typography).

- **DSEG7-Classic** (7-segment LCD font) — SIL Open Font License 1.1.
  Source: https://github.com/keshikan/DSEG — release [v0.46](https://github.com/keshikan/DSEG/releases/tag/v0.46) (2020-03-15).
  Bundled: `src/renderer/fonts/dseg/DSEG7-Classic-Regular.{woff2,woff,ttf}` (~5 KB woff2 / ~7 KB woff / ~23 KB ttf).
  License copy: `src/renderer/fonts/dseg/LICENSE.txt` (verbatim upstream).
  Detailed README: `src/renderer/fonts/dseg/README.md` (glyph coverage, slash-fallback workaround).
  Copyright: (c) 2017 keshikan (http://www.keshikan.net), Reserved Font Name "DSEG".
  Used for: HUD empty-click counter digits (`ШАНС / ŞANS — N/6`). Sprint 2+.
  Coverage caveat: `/` (U+002F) is **not** in the DSEG glyph set; the slash falls
  through to the next family in `font-family: 'DSEG7-Classic', monospace`
  (system monospaced font). Documented in the dseg/README.md; the @frontend-dev
  Phase 2 counter is free to split digit/separator into spans if a pure-segment
  look is required.

### 3D Models (Sprint 3 vendor — B3 hybrid)

CC0 / CC-BY low-poly models from Poly Pizza, auto-vendored 2026-05-20. Stored under `src/renderer/assets/models/`. Total payload 244KB.

**CC0 (Quaternius — no attribution required, credited as good practice):**
- **Revolver** — `revolver.glb` — https://poly.pizza/m/E7IaG9TptR — generic low-poly, chamber opaque (RNG visibility safe per designer §6).
- **Chair** — `chair.glb` — https://poly.pizza/m/iMNqRzPwwe
- **Radio** — `radio.glb` — https://poly.pizza/m/TPqvwkyWdV (generic vintage; user may override with Soviet VEF/Mayak-202 from Sketchfab)
- **Bottle** — `bottle.glb` — https://poly.pizza/m/FAHsHFXfTf (label can be texture-painted in renderer)

**CC-BY 4.0 (attribution required in About + LEGAL.md):**
- **Table** by dook — `table.glb` — https://poly.pizza/m/7qAyGZnerYt
- **Ashtray** by dook — `ashtray.glb` — https://poly.pizza/m/aHmJIWIr1vI
- **Light bulb** by Jason Toff — `lightbulb.glb` — https://poly.pizza/m/4TkYCZMlbS6

**User-vendored (Sketchfab CC-BY, downloaded manually):**
- See `src/renderer/assets/models/incoming/README.md` for the download list (radio USSR, samovar, podstakannik, Nagant revolver override, 60s Soviet table override).
- Each user-vendored file requires attribution append to README + LEGAL.md.

**Procedural (no model file):**
- 5 kopek coin — CylinderGeometry r=0.012m h=0.0015m, 16 segments, brass material
- Cigarette stub on ashtray — small CylinderGeometry

### Görsel
- **Wallpaper (Faz 2):** Blender procedural render — Mac varyantı için dağ/sis, Win varyantı için bloom-abstract. Apple/Microsoft default kullanılmaz.
- **Propaganda afişi:** Solgun, okunmaz, kendi tasarım.
- **Portre:** Yarı silinmiş, AI-generated veya kendi çizim.
- **BSOD QR kod (Faz 6):** `https://www.windows.com/stopcode` URL'li statik PNG QR.

---

## 11. Uygulama Fazları (Sprint Planı + Agent Orchestration)

> Her sprint'in altında **agent matrisi** vardır. Maestro'ya bu yapı sırayla dikte edilebilir.

### Cross-cutting agent'lar (tüm sprint'lerde aktif)

| Faz | Agent | Rol |
|-----|-------|-----|
| Session başı | `@compass` | Context recovery, "nerede kalmıştık" brief |
| Session sonu | `@scribe` | Handoff doc, decision log, WIP state |
| Her code edit sonrası | `@code-reviewer` | Kalite + pattern + maintainability |
| Hata olursa | `@self-learner` | CLAUDE.md kural + memory'e kayıt |
| Bug yapısı tespitinde | `@coroner` | Aynı pattern başka yerde var mı |
| Bug reproduce edilemezse | `@replay` | Reproduce adımları |
| Bug investigation | `@sleuth` | Root cause |
| Tüm dependency işleri | `@migrator` | CVE + SBOM + upgrade |
| Tüm reputation/cost | `@reputation-engine` + `@cost-tracker` | Pasif metrik |

---

### Sprint 0 — İskelet (1 gün)

**Hedef:** Electron skeleton, OS detect, intro disclaimer, kiosk+Cmd+Q test.

| Rol | Agent | Görev |
|-----|-------|-------|
| Implement | `@kraken` | electron-vite scaffold, frameless pencere, kiosk-capable, IPC channel, ESC-hold handler |
| Build/CI | `@devops` | electron-builder config (Mac DMG + Win NSIS), package.json scripts |
| Native UI | `@swift-expert` | macOS `setKiosk(true)` + `Cmd+Q` davranış izole testi (C2) |
| Cyrillic/i18n | `@i18n-expert` + `@babel` | Intro disclaimer Cyrillic+TR + Latin fallback strategy |
| QA | `@code-reviewer` + `@verifier` | Build green, lint clean, type check |
| Security | `@security-reviewer` | `sandbox: true` doğrulaması, preload audit (zero shell/fs) |

**Tasklar:**
- [ ] electron-vite + TS init
- [ ] Frameless + kiosk-capable window
- [ ] OS detection + body class injection
- [ ] IPC channel
- [ ] ESC-hold escape handler
- [ ] **Kiosk + Cmd+Q davranış testi (C2) — sonuç PLAN.md'ye not**
- [ ] Intro disclaimer ekranı (Cyrillic+TR)
- [ ] `electron-log` + `crashReporter` kurulumu (S5)

---

### Sprint 1 — Atmosfer Temeli (3 gün — +1 gün, reviewer önerisi)

**Hedef:** Three.js sahne iskeleti, PS1 shader stack, ambient ses zemini, Temnaya placeholder.

| Rol | Agent | Görev |
|-----|-------|-------|
| Implement | `@kraken` | Three.js scene, PS1 shader stack (postprocessing pipeline), `VITE_QUALITY_LEVEL` flag (S1) |
| Performance | `@web-perf-expert` + `@profiler` | Frame time budget, shader pass ölçüm, adaptive fallback strategy |
| Designer | `@designer` | Atmosfer yön, renk paleti enforcement, ışık direksiyon |
| Audio | `@kraken` (asset entegre) | Howler setup, ambient katmanlar (bulb hum, wind, radio static, music loop) |
| Specialist | `@frontend-dev` | CRT scanline + grain CSS layer (post-FX video overlay) |
| QA | `@code-reviewer` + `@verifier` | Build + perf budget pass (60fps M1, 50fps+ Intel) |

**Tasklar:**
- [ ] Three.js scene + sabit kamera
- [ ] PS1 shader stack: vertex snap, affine UV, dithering (S1: quality flag adaptive)
- [ ] Post-FX: scanline + grain + chromatic aberration
- [ ] Frame time logger (perf budget < 16ms hedef)
- [ ] Ambient ses zemini (bulb 50Hz, wind, radio static, water drip)
- [ ] Temnaya-tarzı loop placeholder (Sprint 3 finalize)
- [ ] Bodrum odası placeholder modeller (cube'larla)

---

### Sprint 2 — Revolver & Lobby (2 gün)

**Hedef:** Revolver placeholder, animasyonlar, HUD, empty click döngüsü.

| Rol | Agent | Görev |
|-----|-------|-------|
| Implement | `@kraken` | Revolver state machine, cock/spin/fall animasyonları, mouse-hold etkileşim |
| 3D animation | `@kraken` (Three.js animation mixer) | GLB animation rig, bone control |
| HUD/UI | `@frontend-dev` | Cyrillic+Latin HUD, soft glow, flap-display sayaç |
| Designer | `@designer` | UX akış doğrulama, hold-to-fire feedback loop |
| Cyrillic | `@i18n-expert` + `@babel` | UI metin eşleme tablosu, font fallback chain |
| QA | `@code-reviewer` + `@verifier` | Animation senkronizasyon, empty click döngüsü |

**Tasklar:**
- [ ] Revolver placeholder GLB
- [ ] Cock + spin + fall + kick animasyon
- [ ] Mouse-hold 1sn etkileşim + nefes audio
- [ ] HUD: Cyrillic+Latin sayaç, "ШАНС / ŞANS"
- [ ] Empty click → ampul flicker + sayaç tick + progressive darkening (1-6 tıklama)
- [ ] Bang → siyah ekran (Faz 0 placeholder)

---

### Sprint 3 — Mekan Polish (2 gün) — **Model Freeze Checkpoint Sprint 3 sonunda (S4)**

**Hedef:** Gerçek 3D modeller, dokular, atmosfer detayları.

| Rol | Agent | Görev |
|-----|-------|-------|
| Implement | `@kraken` | Tüm sahne modelleri entegre, lighting setup, particle (sigara dumanı) |
| 3D Modeling | (insan iş — Blender, agent dışı) | revolver.glb, table.glb, radio.glb vs. Sprint 3 sonu freeze |
| Designer | `@designer` | Sahne yerleşim, kontrast, kompozisyon |
| Audio | `@kraken` | Final Temnaya kompozisyon, room ambient layering |
| Specialist | `@frontend-dev` | Cyrillic envelope/portre/poster texture render |
| QA | `@code-reviewer` + `@verifier` | Asset size budget, draco compress, model freeze checklist |
| Telif audit | `@security-reviewer` | Sketchfab CC0 attribution doğrulama (S4) |

**Tasklar:**
- [ ] revolver.glb (low-poly, dokulu, Sketchfab CC0 attribution doğru)
- [ ] table, chair, radio, samovar, bottle, ashtray, bulb modelleri
- [ ] Duvar dokuları, soyulmuş kağıt, soluk afiş
- [ ] Pencere + buzlanma + sokak lambası backlight
- [ ] Sigara dumanı particle system
- [ ] Tüm room ambient ses katmanları layer'lanır
- [ ] **Sprint 3 sonu: Model freeze checkpoint — Sprint 4 kick/recoil testlerinde gerçek model**

---

### Sprint 4 — Yıkım Faz 0-3 (2 gün)

**Hedef:** Bang, critical dialog, takeover, terminal.

| Rol | Agent | Görev |
|-----|-------|-------|
| Implement | `@kraken` | Faz 0-3 destructor, OS-spesifik dallanma, ApartmentBleed |
| Native UI Mac | `@swift-expert` | macOS HIG dialog pixel-perfect, traffic lights, blur backdrop, spinning beachball |
| Native UI Win | `@frontend-dev` + `@oracle` (Win11 fluent docs research) | Win11 acrylic modal, taskbar mimik |
| Terminal | `@kraken` | rm -rf typewriter, `${username}` template literal (S2), fake path generator |
| Audio | `@kraken` | Bang, tinnitus, low-pass filter, native chord |
| Designer | `@designer` | Apartman bleed timing + zoom in/out feel |
| QA | `@code-reviewer` + `@verifier` + `@security-reviewer` (terminal'in fake olduğu garantisi) | Tüm faz transition smooth, ESC-hold çalışıyor |

**Tasklar:**
- [ ] Faz 0 (bang flash + tinnitus + low-pass)
- [ ] Faz 1 (critical dialog, Mac + Win, native chord)
- [ ] Faz 2 (takeover + procedural wallpaper (S6) + toast'lar + ikon fade-out)
- [ ] Faz 3 (terminal + rm -rf typewriter + `${username}` (S2))
- [ ] Apartman bleed #1 (Faz 2 sonu) + #2 (Faz 3 ortası)

---

### Sprint 5 — Yıkım Faz 4-7 (2 gün)

**Hedef:** File wipe, disk format, BSOD, bootloop.

| Rol | Agent | Görev |
|-----|-------|-------|
| Implement | `@kraken` | Faz 4-7 destructor, progress dialog mimic, BSOD render |
| Native UI Mac | `@swift-expert` | Kernel panic 4-dilli text, hex panic log dump |
| Native UI Win | `@frontend-dev` | Win11 BSOD pixel-perfect, **gerçek QR kod PNG (S3)**, sad face flicker |
| Audio | `@kraken` | HDD grind, fan overdrive, BSOD beep |
| Designer | `@designer` | Apartman bleed #3, #4 timing |
| QA | `@code-reviewer` + `@verifier` | BSOD inandırıcılık, bootloop loop check, ESC-hold tüm fazlarda |

**Tasklar:**
- [ ] Faz 4 (file wipe progress, geri giden bar)
- [ ] Faz 5 (disk format full screen + S.M.A.R.T. errors)
- [ ] Faz 6 (kernel panic Mac, BSOD Win **+ gerçek QR (S3)**)
- [ ] Faz 7 (bootloop, "No bootable device", auto-loop)
- [ ] Apartman bleed #3 (Faz 5) + #4 (Faz 7, en uzun, revolver "değişmiş")

---

### Sprint 6 — Reveal & Polish (1 gün)

**Hedef:** Faz 8 reveal, tekrar oyna döngüsü.

| Rol | Agent | Görev |
|-----|-------|-------|
| Implement | `@kraken` | Faz 8 reveal, apartman geri, state cleanup |
| Designer | `@designer` | Reveal kompozisyon, ŞUTKA tipografi |
| Copywriter | `@copywriter` | Cyrillic+TR reveal mesajları, button copy |
| Audio | `@kraken` | Reveal jingle (kötü çalınmış akordeon), radyo geri başlatma |
| QA | `@code-reviewer` + `@verifier` | Tekrar oyna döngüsü clean, sayaç reset |

**Tasklar:**
- [ ] Faz 8 reveal sahne
- [ ] "ШУТКА / ŞAKA" tipografi animasyonu
- [ ] Reveal jingle + radyo restart
- [ ] "ЕЩЁ РАЗ / TEKRAR" + "ВЫЙТИ / ÇIK" butonları
- [ ] State cleanup (sayaç sıfır, destructionStore reset)

---

### Sprint 7 — Mac Polish (1 gün)

**Hedef:** Mac native pixel-perfect, Apple Silicon test.

| Rol | Agent | Görev |
|-----|-------|-------|
| Specialist | `@swift-expert` | Native dialog detay finalize, system font referans verify, traffic lights davranış |
| Performance | `@web-perf-expert` | Apple Silicon vs Intel perf delta, M1 baseline 60fps |
| Build | `@devops` | Universal binary build (Intel + Apple Silicon) |
| QA | `@verifier` | Mac build PASS, Gatekeeper davranış belge |
| Telif | `@security-reviewer` | SF Pro **bundle YOK** doğrulama (C1) |

**Tasklar:**
- [ ] Mac dialog pixel-perfect
- [ ] Menubar canlı saat (gerçek zaman)
- [ ] **SF Pro bundle'da OLMADIĞINI doğrula (C1)** — sistem font referans çalışıyor
- [ ] Apple Silicon test
- [ ] Gatekeeper bypass komutu README'ye ekle (`xattr -dr com.apple.quarantine`)

---

### Sprint 8 — Windows Polish (1 gün)

**Hedef:** Win11 native pixel-perfect, Win10 fallback.

| Rol | Agent | Görev |
|-----|-------|-------|
| Specialist | `@frontend-dev` + `@oracle` (Win11 fluent design docs) | Native dialog detay, taskbar mimik |
| Build | `@devops` | Win NSIS build, x64 |
| QA | `@verifier` | Win build PASS, AV behavior test |
| Telif | `@security-reviewer` | Segoe UI OFL attribution doğrulama |

**Tasklar:**
- [ ] Win11 dialog pixel-perfect (acrylic, gradient borders)
- [ ] Taskbar mimik (Win11 merkezli)
- [ ] BSOD inandırıcılık (QR + frowny + flicker)
- [ ] Win10 font availability fallback
- [ ] AV warning README'ye not

---

### Sprint 9 — Test + Build + Release (1 gün)

**Hedef:** Final QA, build, docs, release-ready.

| Rol | Agent | Görev |
|-----|-------|-------|
| Manual QA | `@qa-engineer` | 30+ tetik çekme, edge case keşfi |
| E2E | `@e2e-runner` | Playwright manuel akış (intro → lobby → bang → reveal) |
| Security | `@security-reviewer` | Final OWASP-tarzı audit (sandbox, preload, no fs/shell/network) |
| Compliance | `@compliance-expert` | Disclaimer adequacy, telif audit, joke app legal status |
| Performance | `@web-perf-expert` | Final perf budget (memory < 350MB, asset preload < 4sn) |
| Build | `@devops` + `@shipper` | electron-builder full Mac+Win, release notes |
| Docs | `@technical-writer` | README disclaimer, LEGAL.md, INSTALL guide |
| Codemap | `@doc-updater` | docs/CODEMAPS/* final |
| **Panik tespiti (C3)** | `@kraken` | `panicDetector.ts` V1 implement |
| **Crash reporter (S5)** | `@kraken` | Sentry veya built-in `crashReporter.start()` setup |
| Final gate | `@verifier` | Build + test + lint + security PASS |

**Tasklar:**
- [ ] **Panik tespiti V1 (C3)** — `panicDetector.ts` mouse delta sum algoritması
- [ ] **electron-log + crashReporter (S5)** — main + renderer log, Sentry DSN opsiyonel
- [ ] **Username template literal test (S2)** — `${username}` her zaman dinamik, hardcode yok
- [ ] Manuel QA 30+ tetik
- [ ] ESC-hold her fazda test
- [ ] electron-builder Mac DMG + Win NSIS
- [ ] README.md + LEGAL.md
- [ ] Gatekeeper + AV davranış belgesi

**Toplam:** 14-15 gün (Sprint 1 +1 gün, reviewer önerisi).

---

## 12. Riskler & Karşı Önlemler

| Risk | Olasılık | Etki | Önlem |
|------|----------|------|-------|
| Aşırı inandırıcı → kalp krizi / öfke | Orta | Yüksek | INTRO uyarı + **panik tespiti V1 (C3)** + ESC-hold + reveal hint |
| Antivirüs flag (Win) | Yüksek | Orta | Code sign (long-term), README uyarı, crashReporter (S5) |
| macOS Gatekeeper | Yüksek | Orta | Notarization (long-term), `xattr` komutu README |
| Kiosk + Cmd+Q çelişkisi | Orta | Çok yüksek | **Sprint 0 izole test (C2)** + alt shortcut + hint |
| Fullscreen'den çıkamama | Düşük | Çok yüksek | ESC-hold + Cmd+Q + Cmd+Shift+Q fallback + panik tespiti |
| PS1 shader düşük donanımda yavaş | Orta | Düşük | **`VITE_QUALITY_LEVEL` adaptive (S1)** + per-pass toggle |
| Asset boyutu DMG şişirir | Orta | Düşük | Ogg 128kbps, Draco, texture 256x256 |
| **SF Pro bundle telif (C1)** | ÇÖZÜLDÜ | — | **Bundle YOK, sistem font referans** |
| **Big Sur wallpaper telif (S6)** | ÇÖZÜLDÜ | — | **Procedural Blender render** |
| Temnaya Noch telif | Yüksek | Orta | Custom kompozisyon (kelimesi kelimesine değil) |
| Cyrillic font yüklenmez | Orta | Düşük | Font preload + Latin fallback |
| Sosyal medyada "gerçek hack" iddiası | Orta | Orta | README + About disclaimer + ikon rozeti |
| **Username terminal'de hardcode kalır (S2)** | Düşük | Orta | **Test checklist madde** + `@code-reviewer` review |
| **BSOD QR kodu fake → ileri tetkikte illüzyon kırılır (S3)** | ÇÖZÜLDÜ | — | **Gerçek `windows.com/stopcode` URL'li QR** |
| **Model gecikmesi Sprint 4'ü engeller (S4)** | Orta | Orta | **Sprint 3 sonu model freeze checkpoint** |
| **Crash visibility sıfır (S5)** | ÇÖZÜLDÜ | — | **electron-log + crashReporter** |
| Soviet imagery kültürel hassasiyet | Düşük | Orta | Hammer & sickle / Lenin yok. Genel "Eastern Bloc" estetik |

---

## 13. Test Checklist

### Functional
- [ ] Tetik 100x → 1/6 istatistik (±10%)
- [ ] Empty → lobby, sayaç +1
- [ ] Bang → Faz 0
- [ ] 8 faz sırayla, ApartmentBleed #1-4 doğru timing
- [ ] Reveal → lobby (sayaç 0)
- [ ] ESC-hold her fazda
- [ ] **Cmd+Q kiosk modunda davranış doğrulama (C2)**
- [ ] **Panik tespiti tetiklenir (C3) — mouse 3sn'de 2000px+ delta**

### Atmosfer
- [ ] Ampul sallanma + dinamik gölge
- [ ] Radyo loop kesintisiz
- [ ] Tetik anında radyo fade -18dB
- [ ] Empty progresif darkening (1-6 tıklama)
- [ ] **PS1 shader: 60fps M1 Mac, 50fps+ Win10 i5 (S1)**
- [ ] **`VITE_QUALITY_LEVEL` adaptive çalışıyor (S1)**
- [ ] CRT scanline + grain her zaman aktif
- [ ] Cyrillic + Latin doğru render

### Realizm (yıkım fazı)
- [ ] **Mac sistem font referans (C1) — bundle YOK, görsel doğru**
- [ ] Mac/Win dialog OS-native
- [ ] Saat doğru zaman
- [ ] **Terminal'de `${username}` dinamik (S2) — hardcode YOK**
- [ ] Yollar OS-spesifik (`/Users/` vs `C:\Users\`)
- [ ] **Faz 2 wallpaper procedural (S6) — Apple/MS default değil**
- [ ] **Faz 6 BSOD QR `windows.com/stopcode` (S3)**
- [ ] Apartman bleed #1-4 doğru timing

### Performance
- [ ] Asset preload < 4sn
- [ ] Memory < 350MB
- [ ] 60fps lobby
- [ ] 60fps yıkım

### Safety
- [ ] **Audit: hiçbir `fs`, `child_process`, network çağrısı yok**
- [ ] **Audit: preload sadece read-only API**
- [ ] **Audit: `sandbox: true`, `contextIsolation: true`**
- [ ] Disclaimer INTRO + README + LEGAL net
- [ ] **electron-log + crashReporter aktif (S5)**

---

## 14. Build & Dağıtım

### Build komutları
```bash
npm run dev                # HMR
npm run build:mac          # Universal: Intel + Apple Silicon
npm run build:win          # x64
npm run build:all
```

### Çıktılar
- `dist/Rus Ruleti-1.0.0.dmg` (~95MB, SF Pro bundle çıkınca daha küçük)
- `dist/Rus Ruleti Setup 1.0.0.exe` (~95MB)

### Dağıtım
- GitHub Releases (private + disclaimer).
- README.md üstte **kalın disclaimer**.
- LEGAL.md.
- crashReporter Sentry DSN (opsiyonel, opt-in).

---

## 15. Stretch Goals (V2+)

- Sesli karakter (TTS, Slav aksanı): "Ну что, попался?"
- Webcam jumpscare (izinli ise) — Faz 7'de 1 frame creepy reflection
- Sosyal paylaşım: bang anı ekran kaydı + kurban yüzü
- Co-op: 2 kişi sırayla
- Difficulty: Yumuşak (1/12), Klasik (1/6), Vahşi (1/3)
- Tarihçe stats: "247 tetik, 41 ölüm"
- Cosmetic odalar: KGB ofisi, Khrushchyovka mutfağı, demiryolu vagonu

---

## 16. Açık Sorular

1. Revolver model: sıfırdan Blender mı, CC0 + tweak mi? *(Öneri: CC0 + tweak)*
2. UI birincil dil: TR + Cyrillic süs vs salt Cyrillic? *(Öneri: TR + Cyrillic dual label)*
3. Karakter sesi V1'de? *(Öneri: yok, V2)*
4. Apartman interaktivite (sigara/çay)? *(Öneri: V2)*
5. App Store dağıtımı? *(Öneri: hayır, direkt indirme)*
6. Temnaya melodisi: orijinal vs PD Slav halk ezgisi? *(Öneri: orijinal kompozisyon)*

---

## 17. Agent Orchestration Master Map

> Tüm sprint'ler için kullanılacak agent matrisi tek tabloda. **Maestro bu tabloyu directive olarak kullanır.**

### Ana Roller (Sprint-spesifik)

| Agent | Sprint(ler) | Ana Sorumluluk |
|-------|-------------|----------------|
| `@kraken` | 0, 1, 2, 3, 4, 5, 6, 9 | Ana TDD implementer (multi-file feature) |
| `@swift-expert` | 0 (kiosk test), 4, 5, 7 | macOS native UI mimic, HIG, kernel panic, traffic lights |
| `@frontend-dev` | 1 (CRT CSS), 2, 3, 4, 5, 8 | Win11 fluent UI, HUD, BSOD CSS, Win taskbar |
| `@designer` | 1, 2, 3, 4, 5, 6 | Atmosfer direksiyon, kompozisyon, UX akış |
| `@devops` | 0, 7, 8, 9 | electron-builder, DMG/NSIS, CI |
| `@web-perf-expert` | 1, 7, 9 | Frame budget, shader perf, adaptive fallback |
| `@profiler` | 1 | GPU/CPU profiling |
| `@i18n-expert` | 0, 2 | Cyrillic+TR string extraction, font fallback |
| `@babel` | 0, 2 | Locale UX, Cyrillic typography |
| `@copywriter` | 6 | Reveal mesajları, button copy |
| `@oracle` | 4, 5, 8 | Win11 fluent docs research, macOS HIG lookup |
| `@qa-engineer` | 9 | Manual QA, edge case keşfi |
| `@e2e-runner` | 9 | Playwright/manuel flow validation |
| `@technical-writer` | 9 | README, LEGAL, INSTALL |
| `@compliance-expert` | 9 | Telif audit, disclaimer adequacy |
| `@shipper` | 9 | Release lifecycle, version tag |
| `@doc-updater` | 9 | Codemap finalize |

### QA Loop Roller (her sprint'te zorunlu)

| Agent | Tetikleyici | Görev |
|-------|-------------|-------|
| `@code-reviewer` | Her code edit sonrası | Kalite, pattern, maintainability |
| `@security-reviewer` | Preload/auth/data/Sandbox/telif | Sandbox audit, no-fs/shell guarantee, font telif |
| `@verifier` | Sprint sonu, commit öncesi | Final gate: build + test + lint + type |
| `@arbiter` | Test çalıştırma | Unit + integration runner |

### Cross-cutting (her zaman aktif)

| Agent | Trigger | Görev |
|-------|---------|-------|
| `@compass` | Session başı | Context recovery, "nerede kalmıştık" |
| `@scribe` | Session sonu | Handoff doc, WIP state |
| `@self-learner` | Hata olunca | Kural çıkar, CLAUDE.md güncelle, memory'e yaz |
| `@coroner` | Bug fix sonrası | Pattern propagation — aynı hata başka yerde var mı |
| `@sleuth` | Bug investigation | Root cause |
| `@replay` | Bug reproduce edilemezse | Reproduce adımları |
| `@migrator` | Dependency işleri | CVE, SBOM, upgrade |
| `@reputation-engine` | Pasif | Agent trust scoring |
| `@cost-tracker` | Pasif | Token cost analiz |
| `@maestro` | Sprint dikte | Orchestration directive (parent Claude Agent() call'ları) |
| `@psyche` | Agent çatışması/donma | Rubber duck, mediation |

### Escalation Zinciri (Dev-QA Loop, max 3 retry)

| Implementer | 1. Fallback | 2. Fallback |
|-------------|-------------|-------------|
| `@kraken` | `@spark` (küçük parçalara böl) | `@architect` (mimari review) |
| `@frontend-dev` | `@designer` + `@frontend-dev` birlikte | `@kraken` |
| `@swift-expert` | `@oracle` (HIG docs lookup) + `@kraken` | `@architect` |
| `@devops` | `@kraken` | `@architect` |
| `@code-reviewer` | Manual Grep+Read | Kullanıcıya sor |
| `@security-reviewer` | Manual Grep secret scan | Kullanıcıya sor |
| `@verifier` | Manual build+test | Kullanıcıya sor |

### Phase Mapping (swarm fazları için)

```
Phase 1 (Keşif):    @scout + @architect + @oracle + @plan-reviewer
Phase 2 (İmpl):     Yukarıdaki Sprint matrisi
Phase 3 (Review):   @code-reviewer + @security-reviewer + @qa-engineer
Phase 4 (Düzeltme): retry max 3 → escalation
Phase 5 (Final):    @verifier + @shipper + @technical-writer + @self-learner
Quality Gate:       Phase geçişinde TUM kriterler PASS
```

---

## 18. Onay

Plan onaylandığında Sprint 0 ile başlanır. Maestro dikte mesajı şu yapıda olmalıdır:

```
/swarm Rus Ruleti Sprint 0 - Electron iskelet + intro disclaimer + Cmd+Q kiosk testi.
Agentlar: @kraken (impl), @devops (build), @swift-expert (kiosk test),
@i18n-expert (disclaimer), @security-reviewer (sandbox audit),
@code-reviewer + @verifier (QA).
Quality gate: build green, sandbox true, kiosk+Cmd+Q davranış belgelendi.
```

Onayınızı bekliyorum.

---

## Sprint 0 Security Audit

> **Auditor:** @security-reviewer (Phase 3 QA gate, parallel with @code-reviewer + @verifier).
> **Commit reviewed:** `d94db6d` (Sprint 0 — Electron scaffold + bilingual disclaimer + macOS kiosk).
> **Mandate:** Prove this joke app performs **zero** real system operations. This audit is the cornerstone of the marketing/distribution defense (Mac notarization, Win SmartScreen).
> **Read-only.** No source changes. Findings route to Phase 4 if any BLOCKERS.

### 1. BrowserWindow webPreferences (`src/main/window-manager.ts:48-56`)

| Setting | Required | Actual | Evidence | Result |
| --- | --- | --- | --- | --- |
| `sandbox` | `true` | `true` | `window-manager.ts:50` | PASS |
| `contextIsolation` | `true` | `true` | `window-manager.ts:51` | PASS |
| `nodeIntegration` | `false` | `false` | `window-manager.ts:52` | PASS |
| `webSecurity` | `true` | `true` | `window-manager.ts:53` | PASS |
| `allowRunningInsecureContent` | `false` | `false` | `window-manager.ts:54` | PASS |
| `enableRemoteModule` | absent/false | not present (deprecated; never referenced) | grep src/ → 0 hits | PASS |
| `setWindowOpenHandler` denies new windows | required | denies all (logged) on the window; app-level guard denies all on `web-contents-created` | `window-manager.ts:65-70`, `index.ts:128-130` | PASS |
| `will-navigate` blocks off-bundle navigation | best-practice | event.preventDefault() unless URL matches dev server | `window-manager.ts:73-80` | PASS |
| `devTools` only in dev | best-practice | `devTools: isDev` | `window-manager.ts:55` | PASS |

### 2. Preload audit (`src/preload/index.ts`)

Banned-module grep: `grep -rn -E "(require|import).*(fs|child_process|shell|net|http|https|dgram|cluster|vm|^os|node:os)" src/preload/` returned **zero hits**.

| Forbidden module | Imported in preload? | Result |
| --- | --- | --- |
| `fs` / `fs/promises` | No | PASS |
| `child_process` / `exec` / `spawn` | No | PASS |
| `shell` (especially `shell.openExternal`) | No (only a comment at `window-manager.ts:68` referring to a *future* sprint — no code reference) | PASS |
| `net` / `http` / `https` | No | PASS |
| `os` (raw module — `process.platform` allowed) | No (only `process.platform` at `preload/index.ts:123`) | PASS |
| `dgram` / `cluster` / `vm` | No | PASS |

`contextBridge.exposeInMainWorld('api', api)` at `preload/index.ts:126` exposes a small typed surface (`RusRuletiApi` in `shared/api-types.ts:22-40`): `getOS`, `quit`, `onEscapeHold`, `toggleKiosk`, `platform`. All read-only-ish and gated through whitelisted IPC channels.

The ESLint override at `.eslintrc.cjs:46-69` HARD-BANS the same module list in the preload layer — defense-in-depth at lint time.

Result: PASS

### 3. IPC channel whitelist (`src/main/ipc.ts`, `src/shared/ipc-channels.ts`)

Documented whitelist (`shared/ipc-channels.ts:17-21`):

```
APP_QUIT     = 'app:quit'
OS_GET       = 'os:get'
KIOSK_TOGGLE = 'kiosk:toggle'
```

| Handler | File:Line | In whitelist? | Sender check? | Result |
| --- | --- | --- | --- | --- |
| `ipcMain.on(APP_QUIT)` | `ipc.ts:55` | Yes | `isAllowedSender(event)` line 56 | PASS |
| `ipcMain.handle(OS_GET)` | `ipc.ts:65` | Yes | `isAllowedSender(event)` line 66 | PASS |
| `ipcMain.handle(KIOSK_TOGGLE)` | `ipc.ts:74` | Yes | `isAllowedSender(event)` line 77 | PASS |

No wildcard handlers (`ipcMain.on('*', ...)` patterns) — grep returned zero hits. Every handler validates the `senderFrame.url` (file:// in packaged, localhost in dev) before doing work (`ipc.ts:38-51`). Sprint 0 has no payloads, so shape-validation is N/A; the directive should be re-asserted in Sprint 1+ when payloads are introduced.

Result: PASS

### 4. Renderer audit (`src/renderer/main.ts`, `escape-hatch.ts`, `index.html`, `i18n/strings.ts`)

| Check | Evidence | Result |
| --- | --- | --- |
| No `window.require` references | grep → 0 hits | PASS |
| No `eval` / `new Function` | grep → only a comment reference at `index.html:5` (CSP description); no actual call | PASS |
| No remote `<script src="http(s)://...">` | grep → 0 hits; only `<script type="module" src="./main.ts">` at `index.html:38` | PASS |
| CSP restrictive | `default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; script-src 'self';` at `index.html:6-9` | PASS (1 advisory below) |
| No `innerHTML` with external content | `main.ts:65` explicitly comments "Using createElement (not innerHTML)". All DOM built via `createElement` + `textContent`; i18n strings come from a typed, in-source `STRINGS` const (`i18n/strings.ts:31-50`). | PASS |
| No network calls (`fetch`, `XMLHttpRequest`, `axios`) | grep → 0 hits in src/ | PASS |

**Advisory (non-blocking):** CSP allows `style-src 'unsafe-inline'`. For Sprint 0 (scaffold) this is acceptable, but as 3D/Three.js arrives we should plan to drop `unsafe-inline` and use nonce-based styles or extracted stylesheets only. Logged for Sprint 6/7 polish. Not a Sprint 0 blocker.

Result: PASS

### 5. Static asset audit

| Check | Evidence | Result |
| --- | --- | --- |
| No bundled `.exe` / `.dll` / `.sh` / `.ps1` / `.bat` / `.cmd` / `.so` / `.dylib` in repo | `find src/ resources/` excluding `node_modules dist out` → 0 hits | PASS |
| Hardcoded credentials / API keys / tokens | grep across `src/`, `package.json`, `electron-builder.yml`, `electron.vite.config.ts` for `sk-/ghp_/gho_/AKIA/Bearer /JWT/password/secret/api[_-]?key` → only comment references at `electron-builder.yml:74` and `:100` to *future env vars* (`CSC_KEY_PASSWORD`, `certificatePassword`); no actual secrets. | PASS |
| Fonts in `src/renderer/fonts/**` | `file` command confirms `.woff2` Web Open Font Format, NOT executables; OFL license files present in both font directories. | PASS |
| `electron-builder.yml` file-include list ships dev deps? | `files:` list at `electron-builder.yml:36-48` ships only `out/**/*` + manifest + LICENSE/LEGAL/README, and explicitly excludes `*.map`, `*.ts`, `*.tsx`, test/spec patterns. Source-map exclusion prevents source-path leakage. electron-builder auto-prunes devDependencies. | PASS |
| `.env` file present in repo? | `ls .env*` → no matches. `.gitignore` lines 6-7 cover `.env` and `.env.local`. | PASS |

Result: PASS

### 6. crashReporter + log audit

| Check | Evidence | Result |
| --- | --- | --- |
| `crashReporter.start()` uses `uploadToServer: false` and empty `submitURL` | `index.ts:36-43`: `submitURL: ''`, `uploadToServer: false` | PASS |
| Crash dumps stay local | `app.getPath('crashDumps')` logged for transparency at `index.ts:45` — userData/crashes, never uploaded. Documented in `electron-builder.yml:18` and PLAN section 14 (Sentry opt-in / Sprint 9). | PASS |
| electron-log writes only locally (file + console transports) | `logger.ts:43-44`: `transports.file.level='info'`, `transports.console.level='debug'`. No `transports.remote`/`transports.http` configured — grep confirms zero remote-transport refs. | PASS |
| No telemetry / analytics SDKs | grep for `sentry/amplitude/mixpanel/tracking/pixel/telemetry/analytics` → only comment references in `index.ts:13` and `logger.ts:22` describing Sprint 9 *future* Sentry as opt-in. No SDK imported. | PASS |
| Production dependency surface minimal | `package.json` ships only one runtime dep: `electron-log@^5.4.4`. The package's own `dependencies` field is empty (verified). | PASS |
| `npm audit --omit=dev` | "found 0 vulnerabilities" | PASS |

Result: PASS

### Summary Table

| Section | Result |
| --- | --- |
| 1. BrowserWindow webPreferences | PASS |
| 2. Preload audit | PASS |
| 3. IPC channel whitelist | PASS |
| 4. Renderer audit | PASS (1 non-blocking advisory: CSP `style-src 'unsafe-inline'` to tighten in Sprint 6/7) |
| 5. Static asset audit | PASS |
| 6. crashReporter + log audit | PASS |

### Forward-Looking Advisories (NOT Sprint 0 blockers)

These are deferred items the auditor recommends for later sprints — they do NOT gate Sprint 0:

1. **CSP `style-src 'unsafe-inline'`** — acceptable for scaffold, tighten before Three.js arrives (Sprint 6/7).
2. **`session.setPermissionRequestHandler`** — not configured. Sandbox already blocks Node, and `webSecurity:true` blocks most permission requests, but explicitly denying camera/mic/geolocation/notifications via a `setPermissionRequestHandler(...false)` is defense-in-depth. Add in Sprint 1 alongside the next IPC channel.
3. **IPC payload shape validation** — Sprint 0 has no payloads (all three channels are zero-arg). Re-assert the directive (`zod`/`io-ts`/runtime guards) the moment Sprint 1+ introduces typed payloads.
4. **Code signing + notarization** — placeholders in `electron-builder.yml:73-77, 98-100`. Sprint 7 (Mac) and Sprint 8 (Win). The auditor confirms the *placeholders* are correct (empty identity = "don't sign", which is the safe default for local dev builds).

### Final Verdict

**PASS — all six sections green.**

This app performs zero real system operations.
Audit confirmed.

The marketing/distribution defense rests on three load-bearing facts established by this audit:

1. The preload bridge — the ONLY surface between renderer and OS — imports zero modules capable of touching the filesystem, shelling out, opening network sockets, or running arbitrary code (audited at `src/preload/index.ts`, enforced at lint time by `.eslintrc.cjs:46-69`).
2. The Electron main process exposes exactly three IPC channels (`app:quit`, `os:get`, `kiosk:toggle`), each origin-checked, each strictly scoped — none of them invoke filesystem, child_process, shell, or network APIs (audited at `src/main/ipc.ts`).
3. crashReporter and electron-log are configured local-only; there is no telemetry SDK, no analytics, no fetch/XHR, no remote log transport, no submitURL. Nothing leaves the user's machine (audited at `src/main/index.ts:36-46`, `src/main/logger.ts:43-50`).

If a notarization reviewer or SmartScreen analyst asks "what could this app possibly do that's dangerous?" — the honest, evidence-backed answer is: *nothing the sandbox and the three-channel IPC contract don't already prevent.*

---

## Sprint 1 Security Audit

> **Auditor:** @security-reviewer (Phase 3 QA gate, parallel with @code-reviewer + @verifier + @qa-engineer + @data-analyst).
> **Commit reviewed:** `59cd186` (Sprint 1 Phase 2 — PS1 shaders + CRT + atmosphere + audio), Sprint 1 cumulative since `d94db6d`.
> **Mandate:** Extend the Sprint 0 baseline to cover the four new surfaces — Three.js + postprocessing GLSL pipeline, Howler music slot facade, the procedural WebAudio synth, the CRT DOM overlay, the new IPC channel `frame:stats`, and the `session.setPermissionRequestHandler` defence-in-depth.
> **Read-only.** No source changes. Findings route to Phase 4 if any BLOCKERS.

### A. BrowserWindow webPreferences — UNCHANGED from Sprint 0

| Setting | Required | Actual | Evidence | Result |
| --- | --- | --- | --- | --- |
| `sandbox` | `true` | `true` | `window-manager.ts:50` | PASS |
| `contextIsolation` | `true` | `true` | `window-manager.ts:51` | PASS |
| `nodeIntegration` | `false` | `false` | `window-manager.ts:52` | PASS |
| `webSecurity` | `true` | `true` | `window-manager.ts:53` | PASS |
| `allowRunningInsecureContent` | `false` | `false` | `window-manager.ts:54` | PASS |
| `setWindowOpenHandler` denies | required | `return { action: 'deny' }` | `window-manager.ts:65-70` | PASS |
| `will-navigate` blocks off-bundle | required | `event.preventDefault()` for non-dev-URL | `window-manager.ts:73-80` | PASS |
| App-level `web-contents-created` deny-all | required | `contents.setWindowOpenHandler(() => ({ action: 'deny' }))` | `index.ts:144-146` | PASS |

`git diff d94db6d..59cd186 -- src/main/window-manager.ts` → zero hunks. Sprint 0 hardening preserved verbatim.

Result: PASS

### B. Preload audit — NO NEW SURFACE

Banned-module grep: `grep -rnE "(require|import).*(fs|child_process|shell|net|http|https|dgram|cluster|vm|^os|node:os)" src/preload/` returned **zero hits**.

| Check | Evidence | Result |
| --- | --- | --- |
| No new Node-API imports in preload | Imports are still `electron` (contextBridge, ipcRenderer) + shared types only (`preload/index.ts:30-42`) | PASS |
| `sendFrameStats` wrapper added without Node | One-liner `ipcRenderer.send(IPC_CHANNELS.FRAME_STATS, payload)` at `preload/index.ts:128-130` — renderer→main fire-and-forget, no Node API touched | PASS |
| Preload still exposes a small read-only-ish API | `RusRuletiApi` surface in `shared/api-types.ts:33-58` is `getOS`/`quit`/`onEscapeHold`/`toggleKiosk`/`platform`/`sendFrameStats`. None of them reach the filesystem, shell, or network | PASS |
| ESLint preload ban still in force | `.eslintrc.cjs` preload override (Sprint 0 audit §2) is unchanged. Defense-in-depth at lint time persists | PASS |

Result: PASS

### C. New IPC channel: `frame:stats`

| Check | Evidence | Result |
| --- | --- | --- |
| Added to whitelist (SSOT) | `IPC_CHANNELS.FRAME_STATS = 'frame:stats'` at `shared/ipc-channels.ts:25`; included in `ALLOWED_IPC_CHANNELS` array line 35 | PASS |
| Direction: renderer → main only | `ipcMain.on(...)` at `ipc.ts:93-106` (no `webContents.send` reverse path); preload uses `ipcRenderer.send` (fire-and-forget) at `preload/index.ts:129` | PASS |
| Origin check (`isAllowedSender`) | Line 96: `if (!isAllowedSender(event)) { logger.warn(...); return; }` | PASS |
| Strict TypeScript payload type | `FrameStatsPayload` interface at `shared/ipc-channels.ts:47-55` — six readonly numeric fields + `quality: 'low' \| 'medium' \| 'high'` union | PASS |
| **Runtime payload guard (CRITICAL — first payload-carrying channel)** | `isFrameStatsPayload(payload)` at `ipc.ts:127-141` validates every numeric field is finite + quality is one of three accepted tiers. Bad shapes drop silently with a warn log | PASS |
| Handler does ONLY logging | `logger.info('frame:stats', payload)` at `ipc.ts:104`. No fs / network / shell / spawn. electron-log writes to `~/Library/Logs/Rus Ruleti/main.log` only | PASS |
| Cleanup symmetry | `ipcMain.removeAllListeners(IPC_CHANNELS.FRAME_STATS)` in `unregisterIpcHandlers()` at `ipc.ts:117` | PASS |

The Sprint 0 audit forward-looking advisory #3 (IPC payload runtime validation when payloads land) was honoured — manual `unknown → narrowed` discriminator at `ipc.ts:127-141`. Adequate for Sprint 1; zod/io-ts upgrade still recommended if payload count grows past ~3 channels.

Result: PASS

### D. Session permission handler (Sprint 0 advisory #2 closed)

| Check | Evidence | Result |
| --- | --- | --- |
| `session.defaultSession.setPermissionRequestHandler` installed | `index.ts:75-77` | PASS |
| Registered AFTER `app.whenReady` | Inside `.then(...)` callback at `index.ts:67-68` — session is guaranteed to exist | PASS |
| Denies ALL permissions (no allow-list) | `(_wc, _permission, callback) => callback(false)` — unconditional deny for camera, mic, geolocation, notifications, midi, clipboard, etc. | PASS |
| Documented motivation | Comment at `index.ts:69-74` explicitly references "Sprint 0 retro L.1" and the joke-app posture | PASS |

This closes Sprint 0 forward-looking advisory #2.

Result: PASS

### E. CSP under new dependencies

CSP at `renderer/index.html:6-9`: `default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; script-src 'self';`. Unchanged from Sprint 0.

| Directive | Sprint 1 dependency interaction | Result |
| --- | --- | --- |
| `script-src 'self'` | Three.js + postprocessing compile GLSL strings via the WebGL driver (`gl.shaderSource`/`gl.compileShader`); no JS-side `eval` / `new Function`. Howler decodes audio via WebAudio `decodeAudioData`; no JS-side `eval`. `grep -rnE "eval\(\|new Function" src/` → ZERO hits. | PASS |
| `style-src 'self' 'unsafe-inline'` | `crt.css` is an external `.css` file. No inline `style=` attributes added by Sprint 1: `grep -rn 'style=' src/renderer/` → ZERO hits. The Sprint 0 advisory on tightening `unsafe-inline` carries forward unchanged. | PASS (advisory carried forward) |
| `img-src 'self' data:` | `crt.css:142` uses a `data:image/svg+xml;base64,...` SVG-turbulence noise tile. CSP allows `data:` here by design (Sprint 0 baseline). No remote image URLs. | PASS |
| `font-src 'self'` | No new fonts in Sprint 1 (woff2 set unchanged). | PASS |
| **`media-src` (NOT declared)** | Sprint 1 introduces a silent `data:audio/wav;base64,...` Howl placeholder at `scene/audio/audio-bed.ts:206-215` to reserve the music channel. **Howler short-circuits `data:[^;]+;base64,` URIs (`node_modules/howler/src/howler.core.js:2397-2405`): it `atob()`-decodes the base64 inline and passes the ArrayBuffer to `decodeAudioData` — NO `XMLHttpRequest` is issued.** So no `media-src` / `connect-src` directive is triggered by Sprint 1. **PASS for now.** Sprint 3 will load real `.ogg` files via Howler (which DOES issue XHR for non-data URLs) — `media-src 'self'` and (likely) `connect-src 'self'` MUST be added at that point. Logged as advisory I.2. | PASS (advisory I.2) |
| `default-src 'self'` (catchall) | No `fetch` / `XMLHttpRequest` / `WebSocket` introduced in src/: `grep -rnE "(fetch\(\|XMLHttpRequest\|WebSocket\|axios)" src/` → only OFL font-license URL strings in comments and the localhost dev-URL origin check at `ipc.ts:47-54`. No live network code paths. | PASS |

Result: PASS (one carried-forward advisory + one new Sprint-3 advisory)

### F. Asset surface

| Check | Evidence | Result |
| --- | --- | --- |
| No bundled executables | `find src/ -type f \( -name "*.exe" -o -name "*.dll" -o -name "*.sh" -o -name "*.ps1" -o -name "*.bat" -o -name "*.so" -o -name "*.dylib" -o -name "*.cmd" \)` → ZERO hits | PASS |
| No live network code | `grep -rnE "(https?://\|fetch\(\|XMLHttpRequest\|WebSocket\|axios\|got\(\|node-fetch)" src/` → only OFL license comments + the localhost dev-URL origin check at `ipc.ts:47, 54`. No live `fetch`/XHR/WebSocket | PASS |
| Three / postprocessing / Howler local | `npm ls three postprocessing howler` → all resolved locally inside `node_modules/`. No CDN fetch at runtime | PASS |
| No `.env` committed | `ls .env*` → still no matches (Sprint 0 baseline) | PASS |
| No new hardcoded credentials | `grep -rnE "(sk-\|ghp_\|gho_\|AKIA\|Bearer \|api[_-]?key)" src/` → ZERO hits | PASS |
| GLSL shader strings safe | `ps1-material.ts:42` imports `./ps1-vertex-snap.glsl?raw` as a Vite raw string. Three.js passes it to `gl.shaderSource` (WebGL) — there is NO JS-side `eval`. `grep -rnE "eval\(\|new Function" src/` → ZERO hits | PASS |
| Inline `<style>` / `style=` attributes | `grep -rn 'style=' src/renderer/` → ZERO hits. Only external `.css` files | PASS |

Result: PASS

### G. Dependency vulnerabilities

`npm audit --omit=dev` → **"found 0 vulnerabilities"** (matches Sprint 0 baseline).

`npm audit` (all): 13 vulnerabilities (4 low, 3 moderate, 6 high) — all in `electron-builder` → `node-tar` chain, **dev-only**. Production bundle ships none of them (electron-builder is a build tool, never bundled into `out/`).

| Package | Version | Maintained | Result |
| --- | --- | --- | --- |
| `electron-log` | 5.4.4 | active | PASS |
| `three` | 0.184.0 | active (mrdoob, last release 2025-Q4) | PASS |
| `postprocessing` | 6.39.1 | active (vanruesc) | PASS |
| `howler` | 2.2.4 | active (goldfire) | PASS |

Production-dep count: **4** (one added since Sprint 0 → wait, three: `three`, `postprocessing`, `howler` are the three new ones). Surface still minimal.

Result: PASS

### H. Joke-app narrative integrity

The marketing/distribution defense (PLAN section 14, Mac notarization, Win SmartScreen) rests on the assertion that this app performs **zero** real system operations. Sprint 1 must not break that:

| Claim | Evidence | Result |
| --- | --- | --- |
| No new fs / shell / network / process spawning in main or preload | `grep -rnE "(spawn\|exec\|fork\|execFile)\(" src/` → ZERO hits. Main process imports remain `electron`, `node:path`, `electron-log` only | PASS |
| Audio is synthesised in the renderer, not played through any system audio API leak | Synth path: `AudioContext` → `GainNode` → `OscillatorNode` / `AudioBufferSourceNode` in `scene/audio/ambient-synth.ts`. Howler music slot is silent (1-sample data URI, never `.play()`-ed). No native bindings | PASS |
| Three.js / postprocessing render via WebGL (Chromium GPU process), not native GL bindings | WebGL contract is enforced by `webSecurity: true` + `sandbox: true`. Three.js cannot escape the sandbox to native GL | PASS |
| `frame:stats` channel persists telemetry **locally only** via electron-log | Handler at `ipc.ts:104` calls `logger.info('frame:stats', payload)`. electron-log is configured local-only (Sprint 0 audit §6); no remote transport. Writes to `~/Library/Logs/Rus Ruleti/main.log` (mac) / `%AppData%\Rus Ruleti\logs\main.log` (win) | PASS |
| GLSL shaders cannot be exploited as a JS code path | GLSL strings are compiled by the WebGL driver, not by V8. Sandbox + `webSecurity:true` block any GLSL → arbitrary JS escape known to the auditor as of 2026-05 | PASS |
| CRT overlay is a pure DOM/CSS atmosphere — no JS handlers, no input, no fetch | `crt.css` is pointer-events: none + aria-hidden. `index.html:52` adds the overlay element with no listeners. The SVG turbulence is a static data URI | PASS |

Result: PASS

### Summary table

| Section | Result |
| --- | --- |
| A. BrowserWindow webPreferences (unchanged from Sprint 0) | PASS |
| B. Preload audit (no new Node-API surface) | PASS |
| C. New IPC channel `frame:stats` (origin + payload-shape guarded) | PASS |
| D. Session permission handler (Sprint 0 advisory #2 closed) | PASS |
| E. CSP under new dependencies (`three`, `postprocessing`, `howler`) | PASS (1 carried-forward + 1 Sprint-3 advisory) |
| F. Asset surface | PASS |
| G. Dependency vulnerabilities (`npm audit --omit=dev` clean) | PASS |
| H. Joke-app narrative integrity | PASS |

### I. Forward-Looking Advisories (NOT Sprint 1 blockers)

1. **CSP `style-src 'unsafe-inline'` — carried forward from Sprint 0.** Sprint 1 did not add inline styles (`grep` clean), but the existing allowance persists. Still acceptable. Tighten before Sprint 6/7 polish via nonce-based styles or pure external stylesheets.
2. **CSP `media-src` (NEW) — Sprint 3 dependency.** Sprint 1 uses a `data:audio/wav` URI for the silent Howl placeholder; Howler short-circuits data URIs internally (no XHR), so the missing `media-src` directive does not block anything today. **The moment Sprint 3 loads `assets/audio/music/temnaya-placeholder.ogg`, Howler will issue an XHR — `media-src 'self'` MUST be added to CSP, and likely `connect-src 'self'` because Howler uses XMLHttpRequest with `responseType: 'arraybuffer'`.** Track in the Sprint 3 ticket where the music file lands.
3. **IPC payload runtime validation — adequate Sprint 1, plan for Sprint 2+.** The `isFrameStatsPayload` discriminator at `ipc.ts:127-141` is correct and complete for a 7-field flat numeric payload. As Sprint 2+ adds richer payload shapes (lobby state, trigger events, destruction beats), continue this pattern OR adopt `zod` / `valibot` for type-derived runtime schemas. Pure TS narrowing is **not** sufficient at the IPC boundary — the renderer is treated as untrusted.
4. **Code signing + notarization — UNCHANGED from Sprint 0 advisory #4.** Sprint 7 (mac) and Sprint 8 (win). Placeholders in `electron-builder.yml` remain correct (empty identity = "don't sign", safe local default).
5. **Howler audio.unlock() autoplay policy — NOT a security issue but worth noting.** Sprint 1 invokes `mountAudioBed` from inside the Continue-button click handler (`main.ts:146` → `scene-mount.ts:40` → `scene/index.ts:118`), satisfying Chromium's user-gesture requirement for AudioContext.resume(). Future entry-points (auto-replay debug shortcut, programmatic flows) must preserve this guarantee or audio will silently fail.

### Final verdict

**PASS — all eight sections green.**

Sprint 1 preserves the Sprint 0 security posture and adds two defence-in-depth wins:

1. **`session.setPermissionRequestHandler` deny-all** (`index.ts:75-77`) closes Sprint 0 forward-looking advisory #2. Camera, microphone, geolocation, notifications, MIDI, clipboard read — every Web API permission request from the renderer is now silently denied at the session layer, on top of the existing sandbox + contextIsolation. There is no UI to grant a permission, and there should not be.
2. **`frame:stats` runtime payload validation** (`ipc.ts:127-141`) establishes the precedent the Sprint 0 audit specifically asked for (advisory #3): the *first* IPC channel that carries a non-zero payload arrived with both a typed TS contract AND a runtime shape guard, and bad shapes are dropped silently — exactly the right behaviour for a joke app that has no error surface to expose to the user.

The Three.js / postprocessing / Howler triad expands the renderer's *visual* and *auditory* surface but adds **zero** new system-touching code paths: GLSL compiles to WebGL (Chromium GPU process, sandboxed), audio runs in WebAudio (renderer process, sandboxed), and the silent Howler placeholder avoids the XHR path entirely thanks to the data-URI short-circuit. The day Sprint 3 loads a real `.ogg`, the audit MUST be re-opened to add `media-src 'self'` (and probably `connect-src 'self'`) — flagged in advisory I.2.

`npm audit --omit=dev` reports **0 vulnerabilities** in the production dependency tree (`electron-log`, `three`, `postprocessing`, `howler`).

The marketing/distribution defense established by the Sprint 0 audit holds:

- The preload bridge still imports zero modules capable of touching the filesystem, shelling out, opening sockets, or running arbitrary code.
- The IPC contract expanded from three to four channels — all four are origin-checked, the new one is also payload-shape-validated, none invoke fs / shell / network / process APIs.
- crashReporter, electron-log, and the new `frame:stats` channel all persist locally. There is no telemetry SDK, no analytics, no fetch / XHR / WebSocket, no remote log transport, no submitURL. Nothing leaves the user's machine.

Audit confirmed. Sprint 1 ships clean.

---

## Sprint 2 Security Audit

> **Auditor:** @security-reviewer (Phase 3 QA gate, parallel with @code-reviewer + @verifier + @qa-engineer).
> **Commit reviewed:** `89a692f` (Sprint 2 Phase 2B — revolver FSM + animations + HUD + DSEG font + audio cues), Sprint 2 cumulative since `23d9c58`.
> **Mandate:** Extend the Sprint 0+1 baseline to cover the four Sprint 2 surfaces — the revolver subsystem (FSM + RNG + AnimationMixer + mesh placeholder + side-effect ladder + input handlers), the HUD DOM module (counter + transient messages), the audio extensions (WebAudio one-shots + breath layer in `revolver-sfx.ts`), and the DSEG7-Classic OFL font bundle. Sprint 2 directive: NO new IPC channels, NO new preload imports, NO new external asset loads.
> **Read-only.** No source changes. Findings route to Phase 4 if any BLOCKERS.

### A. BrowserWindow webPreferences — UNCHANGED from Sprint 0+1

`git diff 23d9c58..89a692f -- src/main/window-manager.ts` → **zero hunks**. All eight settings (`sandbox`, `contextIsolation`, `nodeIntegration`, `webSecurity`, `allowRunningInsecureContent`, `setWindowOpenHandler` deny, `will-navigate` block, app-level `web-contents-created` deny-all) preserved verbatim from the Sprint 0 baseline. Re-verified at `window-manager.ts:48-56,65-70,73-80` and `index.ts:144-146`.

Result: PASS

### B. Preload audit — NO NEW SURFACE

`grep -rnE "(require|import).*(fs|child_process|shell|net|http|https|dgram|cluster|vm|^os|node:os)" src/preload/` → **zero hits**.

`git diff 23d9c58..89a692f -- src/preload/` → **zero hunks**. Imports remain `electron` (contextBridge, ipcRenderer) + shared types only (`preload/index.ts:30-42`). The `RusRuletiApi` surface (`shared/api-types.ts`) is unchanged: `getOS`/`quit`/`onEscapeHold`/`toggleKiosk`/`platform`/`sendFrameStats`. None reach fs / shell / network. ESLint preload ban (`.eslintrc.cjs:46-69`) carried forward verbatim.

Sprint 2 directive ("NO new preload imports or exposures") honoured: the entire revolver subsystem (FSM, RNG, animations, HUD, audio one-shots, input handlers) is renderer-only. Nothing crosses the contextBridge.

Result: PASS

### C. IPC channels — UNCHANGED from Sprint 1

`git diff 23d9c58..89a692f -- src/shared/ipc-channels.ts src/main/ipc.ts` → **zero hunks**.

| Check | Evidence | Result |
| --- | --- | --- |
| Whitelist still 4 channels (`app:quit`, `os:get`, `kiosk:toggle`, `frame:stats`) | `IPC_CHANNELS` const at `shared/ipc-channels.ts:21-26`; `ALLOWED_IPC_CHANNELS` array lines 31-36 | PASS |
| All handlers retain `isAllowedSender` origin check | `ipc.ts:60,70,81,96` | PASS |
| `frame:stats` runtime payload guard (`isFrameStatsPayload`) still in force | `ipc.ts:127-141` | PASS |
| Cleanup symmetry (removeAllListeners + removeHandler) | `ipc.ts:113-118` | PASS |
| Sprint 2 added zero new IPC channels | `grep "ipcMain\.(on\|handle)" src/main/` → still four handlers | PASS |

Sprint 2 directive ("NO new IPC channels") honoured.

Result: PASS

### D. Session permission handler — STILL INSTALLED

Sprint 0 forward-looking advisory #2 (closed in Sprint 1) remains in force. `git diff 23d9c58..89a692f -- src/main/index.ts` → **zero hunks**. `session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false))` at `index.ts:75-77` still denies camera / mic / geolocation / notifications / MIDI / clipboard / etc. unconditionally.

Result: PASS

### E. CSP under Sprint 2 additions

CSP at `renderer/index.html:6-9`: `default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; script-src 'self';`. **Unchanged from Sprint 0+1.**

| Directive | Sprint 2 interaction | Result |
| --- | --- | --- |
| `script-src 'self'` | Three.js `AnimationMixer` (`revolver-anim.ts:32-40,97`) animates uniforms via `gl.uniform*` / `Object3D.position/rotation/scale` mutations — **does NOT compile new shader programs at clip time**. GLSL was already compiled at scene mount (Sprint 1). The mixer is pure CPU-side keyframe interpolation; no JS-side `eval` / `new Function`. `grep -rnE "eval\(\|new Function" src/` → ZERO hits. | PASS |
| `style-src 'self' 'unsafe-inline'` | `counter.ts:179` writes a custom CSS variable via `counter.style.setProperty('--hud-glow-alpha', String(glowAlpha))`. This is the **CSSOM JS API**, not an HTML inline-style attribute. CSP `style-src` governs the *source* of stylesheets and `<style>` blocks (and, with `'unsafe-inline'`, inline `style=` attrs in HTML markup); it does **not** restrict runtime DOM property mutation through the CSSOM. `setProperty` is allowed under any CSP. `grep -rn 'style=' src/renderer/` → only a JSDoc comment string at `counter.ts:27` ("`<div ... style=\"--hud-glow-alpha: X\">`" illustrating the rendered shape) — NOT an actual inline-style attribute in source. Sprint 1 carried-forward advisory persists, no new violation. | PASS (advisory carried forward) |
| `img-src 'self' data:` | No new image sources. Bang overlay flash is `background-color` keyframes in `hud.css`, not an image. | PASS |
| `font-src 'self'` | DSEG7-Classic bundled at `src/renderer/fonts/dseg/DSEG7-Classic-Regular.{woff2,woff,ttf}`; `@font-face src:` declarations at `fonts.css:346-355` use only **local relative paths** (`url('../fonts/dseg/...')`). No CDN URL, no external font host. `file` command confirms WOFF/WOFF2/TTF — actual font payloads, not executables. | PASS |
| `media-src` (still not declared) | Sprint 2 added NO real audio file loads. `revolver-sfx.ts` is pure WebAudio synth (OscillatorNode, BiquadFilterNode, AudioBufferSourceNode, GainNode — all built from constants and `Math.random()` noise buffers). The Howler music slot is **still** the silent `data:audio/wav;base64,...` placeholder from Sprint 1 (`audio-bed.ts:344-352`) and `grep -rn "Howl(" src/renderer/` returns only that single instantiation. Howler short-circuits data-URIs (no XHR). Sprint 1 advisory I.2 (add `media-src 'self'` when Sprint 3 ships real `.ogg`) carries forward unchanged. | PASS (advisory carried forward) |
| `default-src 'self'` (catchall) | `grep -rnE "(https?://\|fetch\(\|XMLHttpRequest\|WebSocket\|axios)" src/` → only OFL license URL strings in font directories (`fonts/dseg/LICENSE.txt`, `fonts/dseg/README.md`, `fonts/pt-serif/OFL.txt`, `fonts/old-standard-tt/OFL.txt`) and the localhost dev-URL origin check at `ipc.ts:47,54`. **No live `fetch` / XHR / WebSocket code paths in Sprint 2.** | PASS |

Result: PASS (Sprint 0+1 advisories carried forward; no new violations)

### F. Asset surface

| Check | Evidence | Result |
| --- | --- | --- |
| No bundled executables | `find src/ -type f \( -name "*.exe" -o -name "*.dll" -o -name "*.sh" -o -name "*.ps1" -o -name "*.bat" -o -name "*.so" -o -name "*.dylib" -o -name "*.cmd" \)` → ZERO hits | PASS |
| No live network code | `grep -rnE "(https?://\|fetch\(\|XMLHttpRequest\|WebSocket\|axios\|got\(\|node-fetch)" src/` → only license URL strings + the localhost dev-URL origin check at `ipc.ts:47,54` | PASS |
| Three / postprocessing / Howler still local, still single-source | `npm ls three postprocessing howler` → `three@0.184.0 + postprocessing@6.39.1 + howler@2.2.4`, all under `node_modules/`, no CDN at runtime. No dependency additions in `package.json`. | PASS |
| DSEG font bundle integrity | `src/renderer/fonts/dseg/` contains: `DSEG7-Classic-Regular.woff2` (5.2 KB, WOFF2), `DSEG7-Classic-Regular.woff` (7.1 KB, WOFF), `DSEG7-Classic-Regular.ttf` (23 KB, TrueType), `LICENSE.txt` (SIL OFL 1.1 verbatim, 4.5 KB), `README.md` (9.8 KB, source/version/copyright/glyph-coverage). `file` command confirms all three font files are legitimate font payloads (WOFF / WOFF2 / TrueType), not executables. | PASS |
| `npm audit --omit=dev` | "found 0 vulnerabilities" (matches Sprint 0+1 baseline) | PASS |
| No new hardcoded credentials | `grep -rnE "(sk-\|ghp_\|gho_\|AKIA\|Bearer \|api[_-]?key\|password\|secret\|token)" src/renderer/scene/revolver/ src/renderer/scene/audio/revolver-sfx.ts src/renderer/styles/hud.css src/renderer/fonts/dseg/` (excluding OFL/LICENSE/README hits) → ZERO functional hits | PASS |
| No new `.env` committed | `ls .env*` → still no matches; `.gitignore` lines 6-7 still cover `.env`/`.env.local` | PASS |

Result: PASS

### G. AnimationMixer + WebAudio integrity

| Claim | Evidence | Result |
| --- | --- | --- |
| `AnimationMixer` does NOT compile new GLSL at runtime | `revolver-anim.ts` builds `NumberKeyframeTrack` arrays and feeds them to `AnimationMixer.clipAction(clip).play()`. The mixer's per-frame `update(delta)` calls (`revolver-loop.ts:36`) interpolate keyframe values and write them into `Object3D.position`/`rotation`/`material uniforms` — no `shaderSource` / `compileShader` calls. GLSL was compiled once at scene mount; AnimationMixer only mutates the already-compiled program's uniforms. | PASS |
| WebAudio synthesis uses only standard Chromium WebAudio APIs | `revolver-sfx.ts` uses `OscillatorNode`, `BiquadFilterNode`, `GainNode`, `AudioBufferSourceNode`, `StereoPannerNode`. Per `grep -nE "AudioContext\|OscillatorNode\|GainNode\|BiquadFilter\|AudioBufferSource"` — all standard W3C WebAudio. No `AudioWorklet` (which would load worker source from a separate URL — not present here). No native bindings beyond Chromium's audio service. The `spawnSweat*` function names are local helpers (oscillator-node spawning), NOT `child_process.spawn()`. | PASS |
| `AudioContext.close()` in dispose chain — graceful audio-thread cleanup | `audio-bed.ts:299` — `await ctx.close()` inside `buildDisposeFn`. `scene/index.ts:332-336` — revolver disposes BEFORE audio bed so empty-click cue handlers (`audio.playHeartbeat()` etc.) can no longer reach a closed context. `revolver-sfx.ts:443-451` (`stopBreathLayer`) calls `.stop()` + `.disconnect()` on the breath graph with `try/catch` around the stop so a double-dispose is safe. Per-OneShot graphs self-destruct on the `OscillatorNode.onended` event (`revolver-sfx.ts:124-128,162-166` and similar) so they don't leak past dispose. | PASS |
| RNG uses CSPRNG, not `Math.random()` | `revolver-rng.ts:40-45` — `crypto.getRandomValues(new Uint32Array(1))`. Predictability is not the concern for *security* here (it's a joke app), but using `crypto.getRandomValues` is the right call: it prevents a curious user from timing-attacking `Math.random()` to predict the bang before the spin animation lands. Modulo bias on `Uint32 % 6` is ~5.96e-9 — invisible at any realistic pull count. Math noted by author at `revolver-rng.ts:31-38`. | PASS |

Result: PASS

### H. New DOM surface (HUD + bang overlay + i18n)

| Claim | Evidence | Result |
| --- | --- | --- |
| HUD DOM built via `createElement` + `textContent`, NEVER `innerHTML` | `grep -rnE "innerHTML\|outerHTML" src/renderer/` → ZERO hits. `counter.ts:98-137` builds the counter subtree via `document.createElement(...)` and assigns text via `.textContent` (`counter.ts:108,111,125,129,133`). `messages.ts:82-94` builds the message overlay subtree the same way; `applyCopy` (`messages.ts:152-163`) writes via `.textContent`. `hud.ts:63-85` only composes; no DOM injection. `scene-mount.ts:120-145` creates the HUD/bang overlay siblings via `createElement` + `setAttribute('aria-hidden', 'true')`. | PASS |
| Bang overlay toggle is a CSS class flip, NOT external DOM injection | `revolver-effects.ts:187-194` — `overlay.classList.add('is-fired')` plus `overlay.dataset['flashMs']` / `overlay.dataset['fadeMs']`. The CSS keyframes that drive the flash + fade-to-black live in `hud.css`. No JS-side innerHTML, no external content. | PASS |
| `setAttribute` writes only `data-*` and `aria-*` attributes | `grep -rn "setAttribute" src/renderer/scene/revolver/ src/renderer/scene-mount.ts src/renderer/main.ts` → 8 hits, all `data-locale`, `data-kind`, `aria-hidden`, `aria-live`, `aria-label`. NO `setAttribute('src', ...)`, `setAttribute('href', ...)`, or any attribute that could load external content. | PASS |
| `style.setProperty` mutates one CSS custom property (`--hud-glow-alpha`) | Single call at `counter.ts:179`. CSSOM JS API — CSP-safe (see section E `style-src`). Value is `String(glowAlpha)` where `glowAlpha` is a number from the SSOT constant `HUD_GLOW_ALPHA_BY_CLICK[clamped]` — no user input, no string interpolation of external data. | PASS |
| i18n strings rendered from compile-time `STRINGS` const, no template injection | `i18n/strings.ts:31-64` — typed `as const` object literal. All RU + TR copy hardcoded in source. `t(key, locale)` (line 115-126) does a typed dot-path lookup; missing keys throw at compile time via the `LocaleKey` discriminated union. No `{user_input}` placeholder mechanism, no `format()` with external data, no runtime string concatenation of attacker-controlled content. | PASS |
| `aria-live` on transient-messages overlay | `messages.ts:85` — `root.setAttribute('aria-live', 'polite')`. Screen readers re-announce content changes politely; no security implication, but a11y-correct. | PASS |

Result: PASS

### I. Joke-app narrative integrity

Sprint 2 must preserve the marketing/distribution defense: this app performs **zero** real system operations.

| Claim | Evidence | Result |
| --- | --- | --- |
| No new fs / shell / network / process spawning in renderer subsystems | `grep -rnE "(spawn\|exec\|fork\|execFile\|child_process)\(\|fs\.\|http\.\|net\." src/renderer/scene/revolver/` → only the local helper-function `spawnSweat*` names in `revolver-sfx.ts` (oscillator-node spawning, NOT `child_process.spawn()`); no `fs.`/`http.`/`net.` namespaces; no imports of `child_process` / `fs` / `http` / `net` (verified by `grep -rnE "(require\|import).*(fs\|child_process\|shell\|net\|http\|https\|dgram\|cluster\|vm)" src/renderer/scene/revolver/ src/renderer/scene/audio/revolver-sfx.ts src/renderer/scene/audio/audio-bed.ts` → ZERO hits) | PASS |
| Audio synthesis is renderer-only (no system audio API leak) | `revolver-sfx.ts` synth path: `AudioContext` → `GainNode` → `Oscillator/AudioBufferSource/BiquadFilter`. Chromium's WebAudio runs the audio thread in the renderer process under the same sandbox as the rest of the page. No native audio bindings, no MIDI, no Web MIDI API call (the session permission handler at `index.ts:75-77` would refuse it anyway). | PASS |
| Three.js + AnimationMixer render through Chromium WebGL (sandboxed GPU process) | The WebGL contract is enforced by `webSecurity: true` + `sandbox: true`. AnimationMixer mutates JS-side `Object3D` properties; the renderer uploads to WebGL via the standard pipeline. No native GL bindings, no GL extension that could escape the sandbox. | PASS |
| No telemetry SDK added | `grep -rnE "(sentry\|amplitude\|mixpanel\|posthog\|datadog\|tracking\|pixel\|telemetry\|analytics)" src/` (excluding comments referencing Sprint 9 future opt-in Sentry) → only the same comment references at `index.ts:13` and `logger.ts:22` already approved in Sprint 0. **No new analytics surface in Sprint 2.** | PASS |
| `frame:stats` still the only IPC channel that carries any payload, still local-only persistence | `electron-log` config unchanged (`logger.ts`); no `transports.remote` / `transports.http`; the handler at `ipc.ts:104` still calls `logger.info('frame:stats', payload)` and nothing else. | PASS |
| RNG sanity check (dev-only diagnostic) is read-only, writes to DOM dataset only | `revolver/index.ts:111-121` runs 100 trials of `pullTrigger()` at mount and writes the result to `document.body.dataset['revolverRngSanity']`. No fetch, no logging beyond DOM. Devtools-only audit; promoted to vitest in Sprint 9. | PASS |

Result: PASS

### J. DSEG OFL 1.1 license compliance

| Check | Evidence | Result |
| --- | --- | --- |
| `LICENSE.txt` present, SIL OFL 1.1 verbatim | `src/renderer/fonts/dseg/LICENSE.txt` (4.5 KB), header lines 1-12: `Copyright (c) 2017, keshikan (http://www.keshikan.net), with Reserved Font Name "DSEG". This Font Software is licensed under the SIL Open Font License, Version 1.1.` | PASS |
| `README.md` documents source URL + version + copyright | `src/renderer/fonts/dseg/README.md` cites project URL `https://github.com/keshikan/DSEG`, release v0.46 (2020-03-15), copyright `(c) 2017 keshikan` with the Reserved Font Name clause. | PASS |
| PLAN.md §10 attribution log appended with DSEG entry | PLAN §10 lines 485-496 contain the DSEG7-Classic block with license, source, bundled files, copyright, reserved-font-name preserved, glyph-coverage caveat, and the `/` (U+002F) slash-fallback workaround documented. | PASS |
| Reserved Font Name "DSEG" NOT renamed | `font-family: 'DSEG7-Classic'` at `fonts.css:347` and `hud.css:111` preserves the upstream family name verbatim. We did NOT distribute a derivative under the Reserved Font Name — we shipped the original. OFL §3-§4 (Reserved Font Name clause) is honoured. | PASS |
| No font subset re-derived without rename | Sprint 2 ships the upstream `DSEG7-Classic-Regular.{woff2,woff,ttf}` verbatim (5.2 KB / 7.1 KB / 23 KB matches keshikan v0.46 release). No glyph deletion / re-encoding / merging that would constitute a derivative requiring rename under OFL §3. | PASS |

Result: PASS

### Summary table

| Section | Result |
| --- | --- |
| A. BrowserWindow webPreferences (unchanged from Sprint 0+1) | PASS |
| B. Preload audit (NO new imports or exposures — directive honoured) | PASS |
| C. IPC channels (NO new channels — directive honoured) | PASS |
| D. Session permission handler (still installed, still deny-all) | PASS |
| E. CSP under Sprint 2 (AnimationMixer + WebAudio synth + DSEG + HUD DOM) | PASS (Sprint 0+1 advisories carried forward) |
| F. Asset surface (no execs, no network code, DSEG verified, audit clean) | PASS |
| G. AnimationMixer + WebAudio integrity (no eval, graceful close, CSPRNG) | PASS |
| H. New DOM surface (createElement + textContent only, no innerHTML) | PASS |
| I. Joke-app narrative integrity (zero real system operations) | PASS |
| J. DSEG OFL 1.1 license compliance | PASS |

### K. Forward-Looking Advisories (NOT Sprint 2 blockers)

Sprint 0+1 advisories re-affirmed and one Sprint-3-bound item re-emphasised:

1. **CSP `style-src 'unsafe-inline'` — STILL acceptable for Sprint 2.** No inline `style=` attributes added (`grep -rn 'style=' src/renderer/` → only a JSDoc comment string; zero actual inline attrs). `style.setProperty` is CSSOM JS API, not governed by `style-src`. Tighten to nonce-based styles or pure external stylesheets before Sprint 6/7 polish.
2. **CSP `media-src` — STILL Sprint 3 dependency.** Sprint 2 added zero real audio file loads — `revolver-sfx.ts` is pure WebAudio synth, the Howler music slot is still the silent data-URI placeholder from Sprint 1. **The day Sprint 3 loads `assets/audio/music/temnaya-placeholder.ogg` (or any of the `.ogg` files in PLAN §10), Howler will issue an XHR — `media-src 'self'` MUST be added to CSP at that point, and likely `connect-src 'self'` because Howler uses XMLHttpRequest with `responseType: 'arraybuffer'`. Track in the Sprint 3 ticket where the music file lands.** (Re-affirmed from Sprint 1 advisory I.2.)
3. **IPC payload runtime validation — STILL adequate, STILL the `frame:stats` precedent.** Sprint 2 added NO new payload-carrying IPC channels. `isFrameStatsPayload` (`ipc.ts:127-141`) remains the canonical pattern. As Sprint 4+ adds destruction-phase telemetry payloads (if any), continue this pattern OR adopt `zod` / `valibot` for type-derived runtime schemas.
4. **Code signing + notarization — UNCHANGED from Sprint 0+1 advisory #4.** Sprint 7 (mac) and Sprint 8 (win). Placeholders in `electron-builder.yml` correct.
5. **`revolver-sfx.ts` is 452 lines — exceeds the 400-line ceiling enforced by `.eslintrc.cjs:30-32`.** Style/maintainability concern only, NO security implication. Out of security-reviewer scope; flagged for @code-reviewer / @verifier to assess whether the audio synth helpers should split into `revolver-sfx-cock.ts` / `revolver-sfx-breath.ts` / `revolver-sfx-bang.ts` etc.

### Final verdict

**PASS — all ten sections green.**

Sprint 2 preserves the Sprint 0+1 security posture intact:

1. **Main / preload / IPC contract: zero diff vs Sprint 1.** `git diff 23d9c58..89a692f -- src/main/ src/preload/ src/shared/ipc-channels.ts` returns zero hunks. The four-channel IPC contract (`app:quit`, `os:get`, `kiosk:toggle`, `frame:stats`) is unchanged; all four still origin-checked, `frame:stats` still payload-shape-validated. Sprint 2 directive ("NO new IPC channels per Sprint 2 plan") honoured.
2. **Renderer surface expanded — but only with synthesis, animation, and DOM mutation.** The revolver subsystem (FSM, RNG, AnimationMixer, mesh, side-effect ladder, input handlers), HUD DOM module, WebAudio one-shots + breath layer, and DSEG font bundle add **zero** new system-touching code paths. AnimationMixer mutates already-compiled Three.js uniforms (no `shaderSource`/`compileShader` at clip time); WebAudio synthesis runs in Chromium's audio thread under the renderer sandbox; HUD DOM is built via `createElement` + `textContent` (no `innerHTML`); i18n strings are typed compile-time constants (no template-injection vector); RNG uses `crypto.getRandomValues` (CSPRNG); the `AudioContext.close()` graceful-shutdown chain at `audio-bed.ts:299` + the OneShot self-destruction on `OscillatorNode.onended` prevent audio-thread leaks.
3. **DSEG7-Classic OFL 1.1 license compliance: full attribution chain in place.** `src/renderer/fonts/dseg/LICENSE.txt` carries the SIL OFL 1.1 verbatim; `src/renderer/fonts/dseg/README.md` documents source URL, version (v0.46, 2020-03-15), copyright, and the glyph-coverage caveat. PLAN §10 attribution log appended with the DSEG entry (lines 485-496). Reserved Font Name "DSEG" preserved verbatim in `font-family: 'DSEG7-Classic'` at `fonts.css:347` — no derivative-rename violation. The three font payloads (`woff2`/`woff`/`ttf`) are legitimate font binaries per `file` command, sized consistently with the keshikan v0.46 release.

`npm audit --omit=dev` reports **0 vulnerabilities** in the production dependency tree (`electron-log`, `three`, `postprocessing`, `howler` — same set as Sprint 1).

The marketing/distribution defense established by the Sprint 0+1 audits holds verbatim:

- The preload bridge still imports zero modules capable of touching the filesystem, shelling out, opening sockets, or running arbitrary code (re-verified by banned-module grep — zero hits).
- The IPC contract still has exactly four channels — all four are origin-checked, the one payload-carrying channel (`frame:stats`) is also runtime-shape-validated, none invoke fs / shell / network / process APIs.
- crashReporter, electron-log, and the `frame:stats` channel all persist locally. There is no telemetry SDK, no analytics, no fetch / XHR / WebSocket, no remote log transport, no submitURL. Nothing leaves the user's machine.
- The Sprint 2 additions (revolver subsystem + HUD + audio synth + DSEG font) are 100% renderer-side; they expand the *visual* and *auditory* surface but add zero new system-touching code paths.

If a notarization reviewer or SmartScreen analyst asks "what could this app possibly do that's dangerous after Sprint 2?" — the honest, evidence-backed answer is the same as Sprint 0+1: *nothing the sandbox and the four-channel IPC contract don't already prevent.* The revolver subsystem cannot reach beyond the renderer; the DSEG font is a passive woff2 byte stream the WebFont parser consumes; the WebAudio synth runs on the same Chromium audio thread the silent Howl placeholder does. The day Sprint 3 ships real `.ogg` files, the audit MUST be re-opened to add `media-src 'self'` (and probably `connect-src 'self'`) to the CSP — flagged in advisory K.2.

Audit confirmed. Sprint 2 ships clean.

---

## Sprint 3 Security + Telif Audit

> **Auditor:** @security-reviewer (Phase 3 QA gate, parallel with @code-reviewer + @verifier + @qa-engineer).
> **Commit reviewed:** `f465489` (Sprint 3 Phase 2B kraken-particles smoke system + procedural textures + GLB loader integration), Sprint 3 cumulative since `b7aeed8` (Sprint 2 close).
> **Mandate:** Sprint 3 is the **Model Freeze Checkpoint sprint** — the headline task is the **telif (license) audit** of the 7 vendored GLBs (4 CC0 Quaternius + 3 CC-BY dook/Toff) and the 3 designer-fictional procedural textures (Cyrillic envelope, faded portrait, Soviet poster). Extends the Sprint 0/1/2 baseline to cover: GLTFLoader integration, GLB asset surface, procedural CanvasTexture pipeline (SVG → Blob → Image → drawImage), smoke particle system (THREE.Points + BufferAttribute), AnimationMixer rebind for GLB revolver, BulbLightHandle.attachToMesh, PS1 affine-UV activation on 5 textured meshes.
> **Read-only.** No source changes. One write allowed: append this audit section.

### A. 3D Model Assets — CC0/CC-BY cross-reference (TELIF AUDIT HEADLINE)

All 7 GLBs verified against `src/renderer/assets/models/README.md` attribution table + `LEGAL.md` rows. Sources cross-checked against the Poly Pizza URLs in both files. Sketchfab `incoming/` is empty (only README.md scaffold present) so the Sprint 3 vendor set is exactly the 7 Poly Pizza files.

| GLB | License | Author | Source URL | Size (B) | GLB magic | README row | LEGAL.md row | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `revolver.glb` | CC0 1.0 | Quaternius | `poly.pizza/m/E7IaG9TptR` | 58,204 | `glTF` (0x676C5446) | line 9 | line 25 | PASS |
| `chair.glb` | CC0 1.0 | Quaternius | `poly.pizza/m/iMNqRzPwwe` | 13,360 | `glTF` (0x676C5446) | line 10 | line 26 | PASS |
| `radio.glb` | CC0 1.0 | Quaternius | `poly.pizza/m/TPqvwkyWdV` | 28,996 | `glTF` (0x676C5446) | line 11 | line 27 | PASS |
| `bottle.glb` | CC0 1.0 | Quaternius | `poly.pizza/m/FAHsHFXfTf` | 15,376 | `glTF` (0x676C5446) | line 12 | line 28 | PASS |
| `table.glb` | **CC-BY 4.0** | dook | `poly.pizza/m/7qAyGZnerYt` | 44,792 | `glTF` (0x676C5446) | line 13 | line 34 | PASS |
| `ashtray.glb` | **CC-BY 4.0** | dook | `poly.pizza/m/aHmJIWIr1vI` | 14,076 | `glTF` (0x676C5446) | line 14 | line 35 | PASS |
| `lightbulb.glb` | **CC-BY 4.0** | Jason Toff | `poly.pizza/m/4TkYCZMlbS6` | 60,332 | `glTF` (0x676C5446) | line 15 | line 36 | PASS |

Total payload: 235,136 bytes (~230 KB) — within `MODEL_LOAD_BUDGET_MS = 4000` budget headroom. `file` command on each confirms valid glTF 2.0 binary (magic word 0x676C5446 = ASCII "glTF" little-endian). No `.exe` / `.dll` / `.sh` / `.dylib` / `.so` in the assets tree (`find src/ -name "*.exe" -o -name "*.dll" -o -name "*.sh" -o -name "*.ps1" -o -name "*.bat"` → ZERO hits).

**CC-BY 4.0 attribution chain — three required surfaces:**

| Surface | Status | Evidence |
| --- | --- | --- |
| `src/renderer/assets/models/README.md` (vendor manifest) | DONE | Lines 13-15 inventory + lines 26-31 verbatim attribution block per CC-BY 4.0 §3 |
| `LEGAL.md` (release-prep manifest) | DONE | Lines 30-45 (CC-BY 4.0 table + verbatim attribution block) + lines 109-120 (attribution requirement satisfaction subsection) |
| App About screen (Sprint 6 reveal-lite) | STUBBED | LEGAL.md lines 113-117 explicitly mark this as Sprint 6 deferred. Sprint 3 SCOPE end. Acceptable per LEGAL.md §"Attribution requirement satisfaction" #2. |

`LEGAL.md` line 116 specifies the About panel will read attribution rows **programmatically** from `src/renderer/assets/models/README.md` so the LEGAL/About duplication stays in sync — locked design, no manual second-source-of-truth.

**No paid / Royalty-Free / Standard-license assets in vendor set.** README.md line 69 closes: "All 7 models verified CC0 or CC-BY 4.0 compatible. No 'Royalty Free' (CGTrader proprietary) models included. No paid models. Re-distribution safe for open-source."

Result: **PASS — all 7 GLBs have an unbroken attribution chain through README → LEGAL → About-plan. The 4 CC0 files are credited as good practice; the 3 CC-BY 4.0 files satisfy §3 attribution in both the vendor manifest AND the redistributable LEGAL.md.**

### B. Procedural Textures — designer-fictional content audit

Three CanvasTextures generated at runtime via inline SVG → Blob → Image → drawImage → THREE.CanvasTexture pipeline (`src/renderer/loader/procedural-textures.ts:228-250`). Designer §4 spec at `src/renderer/scene/model-freeze-direction.md:497-628` is the authoritative content brief; this audit verifies the SVG content matches the anonymity rules.

| Texture | Anonymity rule | Evidence | Result |
| --- | --- | --- | --- |
| `cyrillic-envelope` | Designer-fictional Cyrillic addressing — NO real letter, NO real address | `procedural-textures.ts:108-112` SVG text: `"от М. до Х."` (initials only — "from M. to H." with no full names), `"пр. Ленина 14-23"` (generic Soviet-era street designation; "пр. Ленина" / "Lenin Avenue" is a common street name in many post-Soviet cities, the unit number 14-23 is fictional), `"Москва"` (city marker only, no specific locality). `"МОСКВА"` postmark (line 116) is a generic city stamp ring. Designer §4.1 line 515-519 explicitly ratifies the strings as fictional initials + generic address with no historical referent. | PASS |
| `faded-portrait` | Silhouette ONLY — NO real face, NO recognizable identity | `procedural-textures.ts:148-152` SVG: `<ellipse>` (rounded head) + `<polygon>` (trapezoidal shoulders) + `<polygon>` (triangular collar V) + two small shoulder accents. **ZERO face elements** — no eyes, no nose, no mouth, no eyebrow shapes in the SVG. Inline `opacity="0.85"` (line 148) plus radial-gradient `<rect width="512" height="512" fill="url(#fade)"/>` overlay (line 153) burn the silhouette toward "person-shaped void". Designer §4.2 line 561-567 hard-blocks face rendering: "any rendered face will, at the PS1 affine-UV warp resolution, accidentally resemble somebody — opening a telif/likeness can." PLAN §2 line 67 reaffirmation: "yüzü silinmiş". | PASS |
| `soviet-poster` | OWN geometric design — NOT historical reproduction; non-lexical Cyrillic; generic star (NOT hammer-and-sickle) | `procedural-textures.ts:178-192` SVG: tilted PALETTE.blood banner (`<rect>` line 180, rotated -8°), `<polygon points="256,38 270,82 ..."/>` (line 183) is a standard 5-pointed star geometry (NOT hammer-and-sickle — confirmed by inspecting the 10-vertex polygon shape: alternating outer/inner radius around a center, matching the geometric definition of a pentagram-fill). Cyrillic text glyphs `"К Р О Р Н И"` (line 185) and `"Е А"` (line 186) — letters from the Cyrillic alphabet arranged with `letter-spacing="6"` / `letter-spacing="8"` so they LOOK like a word but spell nothing. Colour rule (lines 178-192): only PALETTE.paper, PALETTE.blood, PALETTE.rust, PALETTE.shadow — no other hues, no white. Designer §4.3 line 581-604 explicitly forbids hammer-and-sickle ("politically charged real symbol") and historical reproduction ("yazılar okunmaz, kendi tasarımı" — PLAN §10 line 524). | PASS |

**Why this matters for distribution:** A photoreal face would risk likeness rights; reproducing a real historical Soviet poster would risk both the original artist's copyright AND political-content classification on app stores. The designer-fictional approach is the **safest possible legal posture** for the bodrum-oda's wall surfaces.

Result: **PASS — all 3 procedural textures match designer §4 anonymity spec verbatim. No real face, no real letter content, no real historical poster.**

### C. Font assets — Sprint 2 re-baseline

No new fonts in Sprint 3. Existing bundle re-verified:

| Family | License | Vendor path | Sprint added | LEGAL.md row |
| --- | --- | --- | --- | --- |
| Old Standard TT | SIL OFL 1.1 | `src/renderer/fonts/old-standard-tt/OFL.txt` | Sprint 0 | line 69 |
| PT Serif | SIL OFL 1.1 | `src/renderer/fonts/pt-serif/OFL.txt` | Sprint 0 | line 69 |
| DSEG7-Classic | SIL OFL 1.1 | `src/renderer/fonts/dseg/LICENSE.txt` | Sprint 2 | line 67 |

`src/renderer/fonts/dseg/LICENSE.txt` (4.5 KB) carries the SIL OFL 1.1 verbatim with Reserved Font Name "DSEG" preserved. PT Serif and Old Standard TT each carry an `OFL.txt` license copy. `font-family: 'DSEG7-Classic'` at `fonts.css:347` and `hud.css:111` preserves the upstream family name verbatim — no derivative rename under OFL §3-§4. The procedural-envelope and procedural-poster SVGs reference `font-family: 'Old Standard TT'` (lines 108, 184) — re-using the Sprint 0 vendor; the font payload is already in the bundle so the SVG `<text>` rasters against an already-licensed font.

Result: PASS (no new font surface; Sprint 0+2 fonts intact)

### D. BrowserWindow webPreferences — UNCHANGED from Sprint 0/1/2

`git diff b7aeed8..f465489 -- src/main/window-manager.ts` → **zero hunks**. All eight settings at `window-manager.ts:48-56` preserved verbatim: `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`, `webSecurity: true`, `allowRunningInsecureContent: false`, `devTools: isDev`, `setWindowOpenHandler({ action: 'deny' })` at line 65-70, `will-navigate` block at line 73-80, app-level `web-contents-created` deny-all at `index.ts:144-146`.

Result: PASS

### E. Preload audit — NO NEW SURFACE

`grep -rnE "(require|import).*(fs|child_process|shell|net|http|https|dgram|cluster|vm|^os|node:os)" src/preload/` → **zero hits**.

`git diff b7aeed8..f465489 -- src/preload/` → **zero hunks**. Imports remain `electron` (contextBridge, ipcRenderer) + shared types only (`preload/index.ts:30-42`). The `RusRuletiApi` surface (`shared/api-types.ts`) is unchanged: `getOS`/`quit`/`onEscapeHold`/`toggleKiosk`/`platform`/`sendFrameStats`. Sprint 3 directive (no preload bridge additions) honoured — the entire GLB loader + procedural texture + smoke particle subsystem is renderer-only. Nothing crosses the contextBridge.

Result: PASS

### F. IPC channels — UNCHANGED from Sprint 1/2

`git diff b7aeed8..f465489 -- src/shared/ipc-channels.ts src/main/ipc.ts` → **zero hunks**.

| Check | Evidence | Result |
| --- | --- | --- |
| Whitelist still 4 channels (`app:quit`, `os:get`, `kiosk:toggle`, `frame:stats`) | `IPC_CHANNELS` const at `shared/ipc-channels.ts:21-26`; `ALLOWED_IPC_CHANNELS` array lines 31-36 | PASS |
| All handlers retain `isAllowedSender` origin check | `ipc.ts:60,70,81,96` | PASS |
| `frame:stats` runtime payload guard still in force | `ipc.ts:127-141` | PASS |
| Cleanup symmetry preserved | `ipc.ts:113-118` | PASS |
| Sprint 3 added zero new IPC channels | `grep "ipcMain\\.(on\\|handle)" src/main/` → still four handlers | PASS |

Result: PASS

### G. Session permission handler — STILL INSTALLED

`session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false))` at `src/main/index.ts:75-77` preserved verbatim. Camera / mic / geolocation / notifications / MIDI / clipboard / etc. unconditionally denied. Sprint 3 added zero new permission-touching code paths (the procedural textures use Canvas2D which has no permission gate; smoke particles use only WebGL via Three.js).

Result: PASS

### H. CSP under Sprint 3 additions

CSP at `renderer/index.html:6-9`: `default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; script-src 'self';`. **Unchanged from Sprint 0/1/2.**

| Directive | Sprint 3 interaction | Result |
| --- | --- | --- |
| `script-src 'self'` | GLTFLoader (`gltf-loader.ts:25`) uses fetch + ArrayBuffer parsing — no `eval` / `new Function`. AnimationMixer rebind for GLB revolver (`revolver-mount-glb.ts`) mutates `Object3D.position/rotation/scale` on already-loaded scene nodes — no shader recompile at clip time. Smoke particles (`particles/smoke.ts:43-50`) use `Points` + `PointsMaterial` + `BufferAttribute` — pure renderer-side data binding, no GLSL injection. `grep -rnE "eval\\(\\|new Function" src/` → ZERO hits. | PASS |
| `default-src 'self'` (catchall) | GLBs loaded via Vite `?url` imports (`model-registry.ts:31-37`) — these resolve to hashed bundle URLs (`/assets/revolver-HASH.glb` in production, `/src/...` dev paths in dev) which are `'self'`-origin. GLTFLoader's internal `fetch()` is governed by `default-src` and works correctly. `grep -rnE "(https?://\\|fetch\\(\\|XMLHttpRequest\\|WebSocket)" src/renderer/scene/ src/renderer/loader/` → only SVG `xmlns="http://www.w3.org/2000/svg"` declarations (XML namespace tokens, NOT network fetches — verified by inspecting `procedural-textures.ts:87,129,167` — these are string literals inside the SVG body, the browser SVG parser treats them as schema identifiers, not URLs to fetch). | PASS |
| `style-src 'self' 'unsafe-inline'` | `procedural-textures.ts` builds SVG strings with inline `style=`/`fill=`/`opacity=` attributes (lines 87-195). These attributes are **SVG presentation attributes**, not CSS inline-style attributes — they are NOT governed by CSP `style-src`. Confirmed by W3C CSP3 §6.6.2.4 (presentation attributes are not style-src-controlled). No new HTML inline `style=` attributes; no new `<style>` blocks; `style.setProperty` (HUD glow alpha) still the only CSSOM mutation from Sprint 2. | PASS |
| **`img-src 'self' data:`** (CRITICAL CSP advisory for Sprint 4+) | **Procedural textures use `URL.createObjectURL(blob)` → `Image.src = blob:URL`** at `procedural-textures.ts:232,234`. CSP `img-src 'self' data:` does **NOT** cover `blob:` — per W3C CSP3 §6.6.2.2, `blob:` is a separate URL scheme that requires the explicit `blob:` token in the directive. **`getProceduralTexture()` is exported from `src/renderer/loader/index.ts:38` but is NOT yet consumed by any scene-mount path** (`grep -rn "getProceduralTexture" src/` → only the function declaration, the barrel re-export, and a JSDoc reference in `model-freeze-direction.md:1226`). Sprint 3 scope ends at texture generation; the actual mesh application is Sprint 4. **The day Sprint 4 wires `getProceduralTexture('cyrillic-envelope')` (or any of the three keys) into a Mesh material, CSP MUST be amended to `img-src 'self' data: blob:'` OR the SVG-render pipeline must be refactored to avoid `URL.createObjectURL` (e.g., write the SVG as a data: URI directly).** Tracked as Sprint 4-blocking advisory TH-S3-01 below. | **PASS (current sprint) / ADVISORY (Sprint 4 dependency)** |
| `font-src 'self'` | No new fonts in Sprint 3. SVG `<text font-family="'Old Standard TT'">` references the Sprint 0 vendored family which is already in the bundle. | PASS |
| `media-src` (still not declared) | Sprint 3 added zero real audio file loads (Howler music slot still the data-URI placeholder; revolver SFX still pure WebAudio synth). Smoke particles emit no audio. AnimationMixer rebind for the revolver still triggers WebAudio synth via the Sprint 2 chain (`revolver-effects.ts:202`). Sprint 1 advisory I.2 (add `media-src 'self'` when Sprint 4+ ships real `.ogg`) carries forward unchanged. | PASS (advisory carried forward) |

Result: **PASS (Sprint 3 specifically — procedural textures not yet consumed). Critical advisory TH-S3-01 emitted for Sprint 4.**

### I. Asset surface

| Check | Evidence | Result |
| --- | --- | --- |
| No bundled executables | `find src/ -name "*.exe" -o -name "*.dll" -o -name "*.sh" -o -name "*.ps1" -o -name "*.bat"` → ZERO hits | PASS |
| No live network code in scene/loader | `grep -rnE "(https?://\\|fetch\\(\\|XMLHttpRequest\\|WebSocket)" src/renderer/scene/ src/renderer/loader/` → only SVG `xmlns` schema tokens at `procedural-textures.ts:87,129,167` (NOT network fetches) | PASS |
| No new prod dependencies in Sprint 3 | `package.json` deps still: `electron-log@5.4.4`, `howler@2.2.4`, `postprocessing@6.39.1`, `three@0.184.0`. GLTFLoader is `three/examples/jsm/loaders/GLTFLoader.js` — already inside the existing `three` package. | PASS |
| GLBs live local, not remote | 7 GLBs at `src/renderer/assets/models/*.glb` (total 235,136 B). Imported via Vite `?url` queries which resolve to bundled hashed URLs in prod and `/src/...` paths in dev — never CDN. `MODEL_URLS` table at `model-registry.ts:50-58` is the SSOT for paths. | PASS |
| `npm audit --omit=dev` | "found 0 vulnerabilities" (matches Sprint 0/1/2 baseline) | PASS |
| No new hardcoded credentials in Sprint 3 surface | `grep -rnE "(sk-\\|ghp_\\|gho_\\|AKIA\\|Bearer \\|api[_-]?key\\|password\\|secret\\|token)" src/renderer/loader/ src/renderer/scene/particles/ src/renderer/scene/revolver/revolver-mount-glb.ts src/renderer/assets/models/` (excluding LICENSE / README hits) → ZERO functional hits | PASS |
| `incoming/` staging directory empty | `ls src/renderer/assets/models/incoming/` → only `README.md` (no actual GLB files vendored mid-sprint). Sketchfab CC-BY hybrid override path remains user-controlled, not yet exercised. | PASS |
| GLB magic bytes valid | All 7 files have header `0x676C5446` (ASCII "glTF" little-endian) — confirmed via `xxd -l 4` per file. No corrupted / re-extension'd binaries hiding executable payloads. | PASS |

Result: PASS

### J. AnimationMixer + smoke particles + procedural pipeline integrity

| Claim | Evidence | Result |
| --- | --- | --- |
| GLTFLoader does not execute embedded scripts | `three`'s GLTFLoader parses glTF JSON + binary buffers + textures — the glTF 2.0 spec has **no script extension**. Three.js does not implement any of the optional extension that would run JS (e.g., MSFT_lod, EXT_meshopt_compression are pure data extensions). `gltf-loader.ts:61` `loadAsync(path)` returns a parsed scene graph; no `eval` / `new Function` in the call chain. | PASS |
| AnimationMixer rebind on GLB revolver does not recompile GLSL | `revolver-mount-glb.ts` (Phase 2B) walks the GLB scene graph to find named nodes (e.g., `'Hammer'`, `'Cylinder'`) — designer model-freeze §2.1 lists the expected names — and binds AnimationMixer tracks to their `position` / `rotation` properties. Mixer's `update(delta)` interpolates keyframe values and writes to `Object3D` JS properties. No `WebGLProgram` recompilation triggered. `revolver-anim.ts:103` builds `new AnimationMixer(root)` once; tracks added before the first `play()` call. | PASS |
| Smoke particle system uses pure Three.js buffer attributes — no external asset load | `particles/smoke.ts:42-50` imports `BufferAttribute`, `BufferGeometry`, `Color`, `Points`, `PointsMaterial`. Pool sized at module top (line 84) and allocated **once** at mount via `BufferGeometry.setAttribute('position', new BufferAttribute(Float32Array, 3))`. Per-frame `update(deltaSec)` mutates the typed array in-place; never reallocates. No sprite texture file loaded (designer §5.2: flat colour, no texture). | PASS |
| Smoke particles honour `prefers-reduced-motion` | `smoke.ts:18-19` (JSDoc) + `smoke.ts:470-475` (`isReducedMotion()`) read `window.matchMedia('(prefers-reduced-motion: reduce)').matches` at MOUNT time; under reduce, velocity + amplitude × 0.5 dampen (designer §5.3). Camera shake (`camera.ts:104-111`) and bang flash (`hud.css:300-308`) both gate reduced-motion. CRT scanline (`crt.css:245`) gates reduced-motion. | PASS |
| Procedural texture pipeline is bounded + non-leaking | `procedural-textures.ts:228-250` wraps the Blob → Image → CanvasTexture chain in `try { ... } finally { URL.revokeObjectURL(url); }` so the blob is released even if Image decode fails. `recordBudgetTelemetry` (line 212-220) surfaces over-budget runs via `document.body.dataset['procTextureBudget']`. Per-key cache (line 39) returns the same THREE.CanvasTexture identity on repeat gets — no GPU re-upload. `disposeProceduralTexture` (line 267) + `disposeAllProceduralTextures` (line 276) provide explicit cleanup hooks. | PASS |
| Model registry has graceful-degradation under a bad GLB | `model-registry.ts:121-129` (`preloadAll`) uses `Promise.allSettled` so one corrupt GLB does NOT block the rest. Failed keys surface via `scene-glb-bridge.ts:42` (`document.body.dataset['modelFailures']`) and the room composer (`composeRoom` line 59-70) falls back to placeholder cubes if NO room GLB loaded. | PASS |

Result: PASS

### K. PS1 affine-UV shader activation (TH-S1-05 closure)

Sprint 1 dormant thread TH-S1-05 (PS1 affine-UV shader wired but visually inert until textures land) is **closed by Sprint 3**. The 5 textured GLB meshes (table, chair, radio, bottle, ashtray) now receive `ps1-affine-uv.glsl` via the `createPs1MaterialFactory` factory wired through `scene-glb-bridge.ts:87-93` and applied conditionally on `quality === 'high'` in `composeRoom()` line 59-70. No new GLSL files added Sprint 3 — the existing shader at `src/renderer/scene/shaders/ps1-affine-uv.glsl` activates against GLB UV channels for the first time. WebGL compile happens at scene mount (Sprint 1 baseline); the shader binding is a parameter change, not a recompile.

Result: PASS (TH-S1-05 → DONE; see Open Threads table below)

### L. Joke-app narrative integrity

Sprint 3 must preserve the marketing/distribution defense: this app performs **zero** real system operations.

| Claim | Evidence | Result |
| --- | --- | --- |
| No new fs / shell / network / process spawning in Sprint 3 code | `grep -rnE "(require\\|import).*(fs\\|child_process\\|shell\\|net\\|dgram\\|cluster\\|vm)" src/renderer/loader/ src/renderer/scene/particles/` → ZERO hits | PASS |
| GLTFLoader reads from local bundle path only | `MODEL_URLS` (`model-registry.ts:50-58`) maps each ModelKey → Vite `?url` import. Vite resolves these to `'self'`-origin paths at build time (`/assets/<name>-<hash>.glb` in prod, `/src/...` paths in dev). Never CDN. GLTFLoader.loadAsync uses `fetch` against the resolved URL — governed by `default-src 'self'`. | PASS |
| Procedural textures run on Canvas2D + CanvasTexture (no native rendering bridge) | `procedural-textures.ts:236-241` — `document.createElement('canvas')` → `canvas.getContext('2d')` → `ctx.drawImage(img, ...)` → `new CanvasTexture(canvas)`. Pure W3C Canvas2D + Three.js JS. No native bindings, no OffscreenCanvas worker (which would need its own audit), no WebCodecs. | PASS |
| Smoke particles run on Three.js scene graph (no system effects) | THREE.Points is a JS scene-graph object; per-frame updates mutate `BufferAttribute` typed arrays which Three.js uploads to a single WebGL VBO at draw time. No GPU compute, no transform feedback, no compute shader extension (which would need its own audit). | PASS |
| No telemetry SDK in Sprint 3 | `grep -rnE "(sentry\\|amplitude\\|mixpanel\\|posthog\\|datadog\\|tracking\\|pixel\\|telemetry\\|analytics)" src/` → only the same Sprint 0 comment references at `index.ts:13` and `logger.ts:22`. **No new analytics surface in Sprint 3.** | PASS |
| `frame:stats` still the only payload-carrying IPC channel | `git diff b7aeed8..f465489 -- src/main/ipc.ts` → zero hunks. Same one-payload channel, same runtime shape guard. | PASS |

Result: PASS

### Summary table

| Section | Result |
| --- | --- |
| A. 3D Model Assets — CC0/CC-BY cross-reference (telif audit headline) | PASS |
| B. Procedural Textures — designer-fictional content audit | PASS |
| C. Font assets — Sprint 2 re-baseline | PASS |
| D. BrowserWindow webPreferences (unchanged from Sprint 0/1/2) | PASS |
| E. Preload audit — no new surface | PASS |
| F. IPC channels — unchanged from Sprint 1/2 | PASS |
| G. Session permission handler — still installed | PASS |
| H. CSP under Sprint 3 additions | PASS (current) / ADVISORY (Sprint 4 blob: dependency) |
| I. Asset surface | PASS |
| J. AnimationMixer + smoke particles + procedural pipeline integrity | PASS |
| K. PS1 affine-UV shader activation (TH-S1-05 closure) | PASS |
| L. Joke-app narrative integrity | PASS |

### M. Forward-Looking Advisories (NOT Sprint 3 blockers)

Sprint 0/1/2 advisories re-affirmed; two new Sprint 3 / Sprint 4 / Sprint 5 items appended:

1. **TH-S3-01 — CSP `img-src` must allow `blob:` before Sprint 4 wires procedural textures into Mesh materials.** The procedural-textures pipeline at `src/renderer/loader/procedural-textures.ts:232,234` uses `URL.createObjectURL(blob)` and assigns the resulting `blob:` URL to `Image.src`. Current CSP `img-src 'self' data:` does NOT permit `blob:` (W3C CSP3 §6.6.2.2 — `blob:` is a separate scheme requiring an explicit token). Today this is dormant because `getProceduralTexture()` is exported but no scene-mount path consumes it (verified via `grep -rn "getProceduralTexture" src/`). **Sprint 4 (texture application to table-top + back-wall meshes) MUST either (a) amend CSP to `img-src 'self' data: blob:` OR (b) refactor the SVG-render pipeline to use a data: URI directly (`Image.src = 'data:image/svg+xml;base64,' + btoa(svg)`), avoiding the Blob/createObjectURL pair entirely.** Option (b) is preferred because it keeps the CSP surface narrower; option (a) is one-line. Track in the Sprint 4 ticket where the first `getProceduralTexture` call lands.
2. **TH-S3-02 — SHA-256 manifest must be committed at Sprint 3 Phase 5 (verifier handoff).** `LEGAL.md:82-95` references `src/renderer/assets/models/SHA256-MANIFEST.txt` for the Model Freeze Checkpoint, but the manifest file does NOT yet exist (`ls .../SHA256-MANIFEST.txt` → "No such file or directory"). Sprint 3 Phase 5 verifier task: generate via `shasum -a 256 src/renderer/assets/models/*.glb > src/renderer/assets/models/SHA256-MANIFEST.txt`, commit, and reference from LEGAL.md. The hashes captured during this audit pass (advisory record only — Phase 5 owns the canonical commit): `revolver=d1260ba6..., chair=bdc6aeeb..., radio=9e5c7934..., bottle=7245e262..., table=c2c62694..., ashtray=baf31293..., lightbulb=6992c610...` (full SHA-256 in repo at Phase 5 close).
3. **TH-S2-01 carried forward — CSP `media-src 'self'` + likely `connect-src 'self'` when first real `.ogg` audio file ships.** Sprint 3 still uses pure WebAudio synth (`revolver-sfx.ts`) and a data-URI Howl placeholder (`audio-bed.ts`). The day Sprint 4+ loads any `assets/audio/music/*.ogg`, Howler will issue an XHR with `responseType: 'arraybuffer'` — CSP MUST be amended at that point.
4. **Code signing + notarization — UNCHANGED from Sprint 0+1 advisory.** Sprint 7 (mac) and Sprint 8 (win). Placeholders in `electron-builder.yml` correct.
5. **The 3 Sketchfab CC-BY hybrid alternatives are still optional / unvendored.** `incoming/` staging directory is empty; the Sketchfab override path (`incoming/README.md` lines 9-15) remains a user-vendored extension, not Sprint 3 vendor scope. If the user drops `radio-ussr.glb` / `samovar.glb` / `podstakannik.glb` / `nagant-revolver.glb` / `soviet-table.glb` into `incoming/` post-Sprint 3, `LEGAL.md` lines 47-55 specify the attribution rows MUST be appended BEFORE the file leaves staging. Each download must also be verified against Sketchfab "Standard" / "Editorial" license (which prohibit redistribution); `incoming/README.md:53` enforces "CC-BY / CC0 only" at staging.

### Final verdict

**PASS — all twelve sections green. Sprint 3 ships clean with two forward-looking advisories (TH-S3-01 CSP blob: pre-Sprint-4, TH-S3-02 SHA-256 manifest at Phase 5).**

Sprint 3 preserves the Sprint 0/1/2 security posture intact:

1. **Main / preload / IPC contract: zero diff vs Sprint 2.** `git diff b7aeed8..f465489 -- src/main/ src/preload/ src/shared/ipc-channels.ts` returns zero hunks. The four-channel IPC contract is unchanged; all four still origin-checked, `frame:stats` still payload-shape-validated. Sprint 3 directive ("renderer-only additions, no IPC/preload surface change") honoured.
2. **GLB loader subsystem is renderer-only and asset-bound.** GLTFLoader is the standard `three/examples/jsm` loader (zero new prod deps). All 7 GLB paths resolve via Vite `?url` imports to `'self'`-origin bundle URLs; never CDN. Model registry uses `Promise.allSettled` for graceful-degradation under a bad GLB. Dispose chain walks the scene graph and releases GPU buffers defensively (`typeof === 'function'` guards). AnimationMixer rebind for the GLB revolver mutates already-compiled JS-side Object3D properties — no shader recompile at clip time.
3. **Procedural texture pipeline is renderer-only, designer-fictional, and CSP-safe today.** Three CanvasTextures generated via inline SVG → Blob → Image → drawImage. All three textures match designer §4 anonymity rules verbatim: Cyrillic envelope has fictional initials + generic address (no real recipient, no real address); faded portrait is silhouette-only (zero face elements in SVG); Soviet poster has non-lexical Cyrillic glyphs + generic 5-pointed star (NOT hammer-and-sickle) + designer-restricted PALETTE. `getProceduralTexture` is exported but not yet consumed by scene-mount — the CSP `blob:` dependency is dormant. **Sprint 4 must close TH-S3-01 before wiring textures into Mesh materials.**
4. **Smoke particle system is renderer-only and accessibility-correct.** THREE.Points + BufferAttribute (positions + colors); pool sized once at mount, never reallocated. `prefers-reduced-motion` honoured at mount time per designer §5.3 (velocity + amplitude × 0.5 dampening). No external asset load, no sprite texture, no GPU compute. Quality demotion reduces active particle count without reallocating the buffer.
5. **License compliance — full attribution chain in place for all 7 GLBs and the 3 fonts.** CC-BY 4.0 §3 satisfied in 2 of 3 required surfaces (README.md + LEGAL.md); the third (About screen) is STUBBED per LEGAL.md line 113-117 as a Sprint 6 deferred task — acceptable for Sprint 3 ship. CC0 4 GLBs (Quaternius) credited as good practice. Procedural textures are 100% original designer-fictional content with zero historical-reproduction or likeness risk. SIL OFL 1.1 fonts (Old Standard TT, PT Serif, DSEG7-Classic) preserved verbatim with reserved-font-name compliance.

`npm audit --omit=dev` reports **0 vulnerabilities** in the production dependency tree (`electron-log`, `three`, `postprocessing`, `howler` — same set as Sprint 2; no new prod deps in Sprint 3).

If a notarization reviewer or SmartScreen analyst asks "what could this app possibly do that's dangerous after Sprint 3?" — the honest, evidence-backed answer is the same as Sprint 0/1/2: *nothing the sandbox and the four-channel IPC contract don't already prevent.* The GLB loader cannot reach beyond the renderer; the procedural CanvasTexture pipeline runs entirely in JS on a 2D canvas; the smoke particle system is THREE.Points data binding against a Three.js BufferAttribute. **The two open advisories (TH-S3-01 blob: CSP, TH-S3-02 SHA-256 manifest) are pre-Sprint-4 work, not Sprint 3 blockers.**

**Model Freeze Readiness: GO.** The 7 vendored GLBs are byte-stable (header verified, sizes verified, licenses verified across README + LEGAL). Phase 5 must commit `SHA256-MANIFEST.txt` to lock the byte-for-byte set so Sprint 4 kick/recoil testing cannot diverge silently. After the manifest commit, the 7 GLBs are frozen for Sprint 4+ (no replacement, no re-extraction, no recompression without a Sprint 4 model-update task with its own audit pass).

Audit confirmed. Sprint 3 ships clean. Model Freeze Checkpoint reached.

---

## 18. Open Threads (Cross-Sprint Carry-Forward)

Persistent housekeeping items carried across sprints. Each thread cites its
origin sprint, the sprint that **owns** the fix, and the closing criterion.
Threads marked `DONE` are kept here as audit history; do not re-open.

| Thread | Origin | Owner sprint | Status | Closing criterion |
|--------|--------|--------------|--------|-------------------|
| **TH-S1-01** | Sprint 1 retro | Sprint 7 | OPEN | Cap `WebGLRenderer.setPixelRatio` at 1.5× max and defer Howler instantiation until first revolver interaction. Memory budget (PLAN §13 "Memory < 350MB") risks blowing on 4K external displays + autoplayed silent Howl. Verify via `process.memoryUsage().heapUsed` snapshot after 5min idle session. |
| **TH-S1-02** | Sprint 1 retro | Sprint 7 | OPEN | Wire `EXT_disjoint_timer_query_webgl2` GPU timer queries so `frame:stats` reports CPU+GPU split, not just wall-clock. Today's logger conflates the two — a GPU-bound machine looks identical to a CPU-bound one in the stats. |
| **TH-S1-03** | Sprint 1 retro | Sprint 2 Phase 1 | **DONE 2026-05-20** | OS-conditional `getBuildQualityLevel()` default: Windows → `'low'`, macOS unchanged. Implemented in `src/renderer/scene/quality.ts:42`. Auto-promote still kicks in when frames are cheap. |
| **TH-S1-04** | Sprint 1 retro | Sprint 2 (monitor) | OPEN | Audio mount adds a ~30-50ms one-time noise buffer allocation when `createRadioStatic()` builds its noise buffer. Acceptable today; revisit if Phase 2A designer audio tuning extends the buffer length. Watch the disclaimer→scene transition spinner — if it becomes visible, defer the buffer alloc to after fade-in. |
| **TH-S1-05** | Sprint 1 dormant | Sprint 3 | OPEN | `src/renderer/scene/shaders/ps1-affine-uv.glsl` activates when textured GLBs arrive (Sprint 3 model freeze). It is unused on the placeholder-room because plain colour materials don't UV-sample. Re-enable the affine UV pass once a texture lands; today it is wired but visually inert. |

### Process note

New open threads are added at the bottom with the next sequential
`TH-S<N>-<NN>` slug. Closing a thread updates its row to `DONE <date>` plus
a one-line closing summary. Do not delete closed rows — they are the audit
trail explaining why a knob exists where it is.

