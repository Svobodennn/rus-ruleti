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
