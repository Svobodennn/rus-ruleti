# Destruction Direction — Sprint 4 Phase 2A

> Designer note. Authored 2026-05-21 by designer agent (Sprint 4 Phase 2A SOLO
> retry — earlier dispatch hit a transient API socket error) for the
> Sprint 4 Phase 2B parallel implementers: `kraken-faz0-1`, `kraken-faz2-3`,
> `swift-expert`, `frontend-dev`, `i18n-expert`. Sprint 1's
> `atmosphere-direction.md`, Sprint 2's `revolver/revolver-direction.md`, and
> Sprint 3's `model-freeze-direction.md` are the prerequisite reading. The
> three documents share constants and language. If a tweak makes the
> destruction "feel funnier" but breaks the §1 emotional arc, reject it. If a
> tweak makes the destruction "feel scarier" but breaks the
> apartment-bleed §6 rhythm, reject it.
>
> Sprint 4's mission is not horror. It is not comedy. It is the **slow
> collapse from cathartic violence into uncanny familiarity into named
> personal violence**. The user has just shot themselves in the head; the
> game refuses to let that be the joke. The joke arrives in Faz 3 by the
> typewriter — and even then, the apartment refuses to fully die.

---

## Table of contents

- [§1 Decision philosophy — emotional arc Faz 0-3](#1-decision-philosophy--emotional-arc-faz-0-3)
- [§2 Faz 0 BANG continuation (0-2sn)](#2-faz-0-bang-continuation-0-2sn)
- [§3 Faz 1 Critical Dialog (2-7sn) — OS-specific](#3-faz-1-critical-dialog-2-7sn--os-specific)
- [§4 Faz 2 Takeover (7-12sn)](#4-faz-2-takeover-7-12sn)
- [§5 Faz 3 Terminal (12-22sn)](#5-faz-3-terminal-12-22sn)
- [§6 Apartment bleed rhythm — incommensurable timing](#6-apartment-bleed-rhythm--incommensurable-timing)
- [§7 Audio mix throughout Faz 0-3](#7-audio-mix-throughout-faz-0-3)
- [§8 prefers-reduced-motion cross-system matrix](#8-prefers-reduced-motion-cross-system-matrix)
- [§9 Phase 2B validation checklists (per-lane)](#9-phase-2b-validation-checklists-per-lane)

---

## 1. Decision philosophy — emotional arc Faz 0-3

### The four-beat arc

Sprint 1 + 2 + 3 built **tension**. The lobby is a single bulb, a table, a
revolver, the silence between two breaths. Sprint 2 fires the cathartic
1-frame white flash on bang — that flash is the only moment of explicit
visual violence in the entire game. Sprint 4 takes the cathartic moment
and inverts it: instead of accelerating the violence into shock-comedy
("haha you died, here's a confetti cannon"), the destruction **slow-
collapses** the player from the bang into a different kind of violence:
**the violence of being recognised**.

The arc is four discrete emotional beats:

| Faz | Window | Player feels                                                        | Designer beat                |
|----:|--------|---------------------------------------------------------------------|------------------------------|
|   0 | 0-2s   | "Did I just die?" Tinnitus, the room is gone, audio gone soft.      | Cathartic violence → void.   |
|   1 | 2-7s   | "...wait, the game is bugging out?" Mac/Win dialog says kernel_task.| Doubt seeds itself.          |
|   2 | 7-12s  | "...wait, the game has ESCAPED the window." Wallpaper takeover.     | Doubt cascades.              |
|   3 | 12-22s | "...wait, that's MY username." rm -rf /Users/melih.sarac/...        | Personal violence is named.  |

The progression is **slow-collapse, not shock-comedy**. Each beat lasts
long enough to be FELT, not just witnessed. The PLAN §7 timings (2s + 5s
+ 5s + 10s = 22s) are designed around the Stanley-Milgram observation
that you cannot panic for 22 seconds straight — you have to find new
ways to be unsettled. The four beats each take a different angle of
attack:

- Faz 0 attacks the **ears** (tinnitus + low-pass + radio fade).
- Faz 1 attacks the **trust** (the game looks broken).
- Faz 2 attacks the **frame** (the game looks like it left the window).
- Faz 3 attacks the **identity** (the destruction names you).

### Why not shock-comedy?

A common joke-app pattern is the "JUMPSCARE + LAUGH TRACK" structure:
build tension, fire a shock, immediately reveal it was a joke. That model
has two problems for Rus Ruleti:

1. **The lobby already paid its dues.** Sprint 1+2+3 spent 90 seconds
   establishing klostrofobik minimalizm with the bulb, the revolver, the
   radio static, the bulb pulse, the smoke. A jumpscare-reveal would
   discard all of that atmospheric work in two seconds.
2. **The user knows it's a joke.** The disclaimer screen, the localStorage
   confirmation, the smiley emoji rozeti — the user has already accepted
   the contract that this is a shaka. The destruction's job is not to
   surprise them with the joke; it's to make them **forget** they accepted
   it for 20-30 seconds.

The slow-collapse is the only structure that achieves this. The user
**accepts** the bang. They **doubt** the dialog. They **doubt their
doubt** when the wallpaper takes over. They **see their own name** in the
rm -rf output. By Faz 3 they are not laughing — they are reading their
own username and deciding whether to ESC-hold. Then Sprint 5's Faz 6
BSOD lands, and Sprint 6's Faz 8 reveal arrives, and **THEN** the joke
is funny — because the joke was never the destruction. The joke was the
20 seconds where the user forgot they were playing a joke.

### Apartment bleed = the room refuses to fully die

The two apartment bleeds Sprint 4 owns (#1 at 11s, #2 at 16s — §6
details) are the **leakage** beat. They are the only frames in the
destruction where the lobby palette returns. They are 200-300ms each —
short enough that the user is not sure if they saw it. They are NOT
reassurance frames ("don't worry, it's still a game") because reassurance
would break the joke contract; they are accidents ("the game leaked
back through for half a second"). The user reads them as bugs.

In design terms: the apartment bleeds are the COUNTER-melody to the
destruction's main theme. They keep the destruction from becoming
monothematic — without them, Faz 0 → Faz 3 would feel like a single
unbroken slide into the joke. With them, the joke has texture.

### What Sprint 4 does NOT do

- **Sprint 4 does NOT reveal the joke.** That's Sprint 6 Faz 8.
- **Sprint 4 does NOT play the laugh track.** Reveal jingle is Sprint 6.
- **Sprint 4 does NOT mock the user.** The username appears literally,
  without comment — no "hahaha melih.sarac you fell for it". The
  literal rendering IS the violence.
- **Sprint 4 does NOT show real Apple/MS assets.** Every wallpaper,
  every logo, every chrome surface is designer-authored fictional
  approximation (S6 risk closure — §3, §4, §5 details).
- **Sprint 4 does NOT touch the filesystem.** Every file path in Faz 3
  is a literal string render — `fs.unlink` is forbidden by Electron
  sandbox AND by code-review policy. The terminal is a `<pre>` block
  that animates.

The four "does NOT" items above are the boundaries that make the
destruction safe to ship. Every Phase 2B implementer should keep them
on the wall during implementation. The first three are aesthetic; the
fourth is the security/telif contract.

---

## 2. Faz 0 BANG continuation (0-2sn)

Sprint 2 owns the 1-frame white flash and the 800ms fade-to-black. Sprint 4
takes over **from the black screen**. The handoff contract is in
`scene/revolver/revolver-direction.md` §7 (Sprint 2 bang transition
placeholder spec) and the bang-fired CustomEvent on `document`.

### Audio sequence (0-2000ms after bang)

Designer choreography — every timestamp is an absolute offset from the
moment `bang-fired` fires:

| Time      | Action                                                          | Constant                        |
|-----------|-----------------------------------------------------------------|---------------------------------|
| 0 ms      | `bang.ogg` plays at full -3dB (Howler load OR procedural noise) | (asset OR fallback)             |
| 0 ms      | Radio static begins `audioBed.fadeOutAmbient()`                 | RADIO_FADE_DURATION_MS = 1200   |
| 0 ms      | Camera triggers shake via Sprint 1 helper                       | BANG_CAMERA_SHAKE_DEG = 5       |
| 0 ms      | Bulb begins darken envelope                                     | BULB_DARKEN_DURATION_MS = 600   |
| 50 ms     | Tinnitus 4kHz OscillatorNode loop starts (fade-in 100ms)        | TINNITUS_FREQ_HZ = 4000         |
| 200 ms    | BiquadFilterNode low-pass cutoff ramp begins (300ms ease-out)   | LOW_PASS_CUTOFF_HZ = 700        |
| 400 ms    | Camera shake recovery complete (critically-damped to sabit)     | BANG_CAMERA_SHAKE_DURATION_MS   |
| 500 ms    | Low-pass at full 700Hz cutoff (held through Faz 1-3)            | LOW_PASS_CUTOFF_HZ              |
| 600 ms    | Bulb darken complete (intensity at 0)                           | BULB_DARKEN_DURATION_MS         |
| 1200 ms   | Radio static fully gone                                         | RADIO_FADE_DURATION_MS          |
| 2000 ms   | Faz 0 exit; Faz 1 entry                                         | FAZ_0_BANG_DURATION_MS          |

The audio is intentionally layered. The bang fires; **before** the
tinnitus rings, the radio is already fading; the camera shake is
already winding down; the bulb has already started to die. By 600ms the
room is in darkness. By 1200ms the radio static is silent. By 2000ms
only the tinnitus remains, sitting alone over a low-passed audio bus —
the bus that will carry the Faz 1 native chord stub.

### Procedural fallback for bang.ogg

PLAN §10 lists `bang.ogg` as a CC0 asset but does not guarantee it is
present at Sprint 4 ship. Designer specifies a procedural fallback per
`scene-audio-constants.ts` synth conventions — the fallback fires if
`bang.ogg` fails to load OR the asset is missing:

- 50ms attack OscillatorNode noise burst (BufferSource of white noise,
  -3dB peak), 200ms decay envelope, no sustain, no release.
- Total duration ~250ms.
- BiquadFilterNode high-pass at 2kHz wired in series so the burst reads
  as "gunshot" not "wind".

The fallback is NOT pretty. The fallback is "the room remembers what
gunshots sound like". Phase 2B kraken-faz0-1 owner: detect missing
asset via `Howl.on('loaderror')` and trigger the fallback path without
console error spam (the missing-asset state is expected during dev).

### Visual sequence (0-2000ms)

- The Sprint 2 1-frame white flash already played; the Sprint 2 fade-to-
  black already completed (at 800ms post-bang per `revolver-direction.md`
  §7). At Faz 0 entry the destruction overlay mounts at z-index 10000
  (above CRT 9999) sustaining the black screen.
- The lobby scene is still mounted UNDERNEATH the destruction overlay.
  The black screen is a `<div>` with `background: #000` and full
  viewport coverage — not a render-pause. This matters for the
  apartment bleed (§6): the bleed will lift the black overlay's opacity
  briefly, revealing the still-rendering lobby underneath.
- Camera shake (5deg) is the only visible motion. Reduced-motion gate
  forces amplitude to 0; the black screen sustains identically.

### Reduced-motion gate (Faz 0-specific)

Sprint 3 retro lesson #2: every motion surface gates. The Faz 0 gates:

| Surface              | Default                | Reduced-motion behaviour             |
|----------------------|------------------------|--------------------------------------|
| Camera shake 5deg    | Critically-damped 400ms| Amplitude = 0 (no shake)             |
| Bulb darken envelope | 600ms linear           | 200ms snap (faster, no fade)         |
| Tinnitus amplitude   | -12dB                  | -18dB (-6dB quieter)                 |
| Low-pass cutoff ramp | 300ms ease-out         | Unchanged (audio gate distinct)      |
| Radio fade-out       | 1200ms                 | Unchanged (functional)               |
| Sprint 2 1-frame flash | 1 frame at white     | Already played — out of Sprint 4 scope (Sprint 6 retro will gate the Sprint 2 flash) |

The Sprint 2 1-frame flash is the one Faz 0 surface that is NOT gated
because the flash already played BEFORE Faz 0 entry. The destruction-
direction.md cannot gate something that finished before it took
control. Sprint 6 retro QA will document this as known limitation; the
gate would need to live in `scene/revolver/bang-overlay.ts` instead.

---

## 3. Faz 1 Critical Dialog (2-7sn) — OS-specific

The dialog appears centred on a backdrop-blurred lobby snapshot. The
backdrop is the lobby still-rendering underneath the destruction
overlay (the bulb has fully darkened, the room is in shadow, the
camera shake has settled). The blur reads as "the system is rendering a
modal over a backgrounded application" — a familiar OS surface.

### macOS variant — Apple HIG critical alert (designer-fictional)

The Mac dialog evokes the Apple HIG critical alert visual family without
sampling any Apple-owned asset. Specifications:

**Modal container**
- 380 x 200px (`DIALOG_MAC_WIDTH_PX` x `DIALOG_MAC_HEIGHT_PX`).
- Centered viewport horizontally and vertically.
- Background `#F2F2F2` with subtle inset shadow `inset 0 1px 0 rgba(255,255,255,0.6)`.
- Rounded corners 12px.
- Drop shadow `0 20px 60px rgba(0, 0, 0, 0.35)` — the Apple alert
  characteristic depth.

**Backdrop**
- Full viewport `<div>` with `backdrop-filter: blur(20px) saturate(180%)`.
- Background `rgba(0, 0, 0, 0.3)` so the bulb-darkened lobby blurs
  through with a dim tint.
- The 180% saturation is intentional — Apple Vibrancy effects boost
  saturation by ~150-200% to make the backdrop content "feel like a
  desktop"; the value is the family approximation, not the literal
  AppKit constant.

**Apple logo (top-left, 16x16)**
- DESIGNER-FICTIONAL eaten-apple silhouette via inline SVG path data.
- The path is a designer-authored convex curve with a single concave
  bite — RECOGNISABLE as "apple-shape family" but NOT pixel-identical
  to any Apple-owned trademark asset.
- Color: monochrome `#1D1D1F` (a deep neutral grey, NOT the Apple
  brand black `#000000`).
- Rendering: inline SVG with `<path d="..." />` and no `<image>` tag.
  No PNG, no JPG, no real Apple asset bundled.
- Phase 2B swift-expert authors the SVG path; designer provides this
  geometry guidance:
  - Apple silhouette ~14x16px (slightly taller than wide).
  - Single leaf detail top-right.
  - Bite cut-out on right side at 60% height.

**Typography**
- Title "Critical Error" — 14px bold, system font reference
  `font-family: -apple-system, BlinkMacSystemFont, sans-serif`.
- Body "macOS encountered a critical system error. An unrecoverable failure
  occurred in kernel_task." — 13px regular, same family, ~340px wrap.
- Sayac "Restarting in 5..." — 13px italic, same family, line below body.
- NO SF Pro font bundled (C1 closure — system font reference only).

**Buttons (right-aligned, bottom-right of dialog)**
- "Restart Now" primary — `#0066CC` blue (Apple blue family), white
  text, 28px height, 6px corner radius.
- "Cancel" secondary — disabled grey `#A0A0A0`, white text, same
  dimensions.
- Spacing 8px between buttons.
- Inset 12px from right edge, 12px from bottom edge of dialog.

**Countdown timer**
- Initial value 5 (`DIALOG_COUNTDOWN_START`).
- Decrements every 1000ms (`DIALOG_COUNTDOWN_INTERVAL_MS`).
- Displays "5" "4" "3" "2" "1" then dialog exits at 5000ms total.
- Implementation: `setInterval` driven by swift-expert's
  `MacDialogHandle.setCountdown(n)` method per `destruction/types.ts`.
- Cleanup: setInterval cleared on Faz 1 exit OR esc-hold abort.

### Windows 11 variant — Win11 Fluent critical (designer-fictional)

**Modal container**
- 400 x 220px (`DIALOG_WIN_WIDTH_PX` x `DIALOG_WIN_HEIGHT_PX`).
- Centered viewport.
- Background `#FAFAFA` with Win11 elevation shadow `0 4px 12px rgba(0, 0, 0, 0.15)`.
- Rounded corners 8px (Win11 spec; smaller than Mac's 12px).
- Win11 elevation shadow stack (3 layers: 0 1px 2px, 0 4px 8px, 0 8px 16px
  — all `rgba(0, 0, 0, 0.06-0.12)`).

**Backdrop**
- Full viewport `<div>` with `backdrop-filter: blur(30px) saturate(150%)`.
- Background `rgba(0, 0, 0, 0.2)`.
- The 30px blur (deeper than Mac's 20px) reads as Win11 Acrylic — the
  characteristic "thicker glass" feeling Win11 surfaces have.

**Win11 four-square logo (top-right, 16x16)**
- DESIGNER-FICTIONAL four-square geometry via inline SVG path data.
- A 2x2 grid of squares with 1px spacing, each square ~7x7px.
- Color: linear gradient `#0078D4` (top-left square) to `#005FB8`
  (bottom-right) — Win11 blue family, NOT pixel-identical to the
  Microsoft trademark logo.
- Rendering: inline SVG with `<rect>` elements; no image asset bundled.
- Phase 2B frontend-dev authors the SVG; designer provides geometry:
  - 4 squares, equal size, 1px gap.
  - All squares have same `#0078D4` to `#005FB8` gradient (no
   color-per-square; that would mimic the real Microsoft logo).

**Typography**
- Title "Critical Process Failed" — 14px bold,
  `font-family: 'Segoe UI Variable', 'Segoe UI', sans-serif` (Sprint 0
  bundled OFL Segoe UI Variable).
- Body "A critical system process has stopped responding. Windows will
  collect error info and restart." — 13px regular, same family, ~360px wrap.
- NO countdown on Win variant (PLAN §7 spec — Win dialog is static).

**Buttons (right-aligned, bottom-right of dialog)**
- "OK" primary — `#0078D4` Win11 blue, white text, 32px height,
  4px corner radius.
- "More info" secondary — transparent background, `#0078D4` text,
  same dimensions.
- Spacing 8px between buttons.
- Inset 16px from right edge, 16px from bottom edge.

### Audio cue at Faz 1 entry

Native chord stub plays at 2000ms (Faz 1 entry). Procedural 3-sine
envelope per §7. NO real Mac chime or Win error chord bundled — this
is the C1 closure: telif-safe original synthesis.

### Reduced-motion gate (Faz 1-specific)

| Surface                  | Default                              | Reduced-motion behaviour                                |
|--------------------------|--------------------------------------|---------------------------------------------------------|
| Modal entry opacity      | Fade-in 200ms                        | Instant (0ms)                                           |
| Backdrop blur transition | Animate from 0px to 20/30px (200ms)  | Instant snap to final blur value                        |
| Countdown text update    | setInterval 1000ms                   | Unchanged (functional)                                  |
| Native chord stub        | 750ms envelope at -10dB              | Unchanged (audio gate distinct; PLAN considered a11y audio separately) |

---

## 4. Faz 2 Takeover (7-12sn)

Faz 2 is the moment the destruction **leaves the window**. The Faz 1
dialog dismissed at 7000ms — Faz 2 mounts a full-screen overlay at
z-index 10000 that occupies the entire viewport. The lobby is still
rendering underneath, but the overlay is opaque (the lobby will only
peek through at the apartment bleed §6).

### Window kiosk activation

At Faz 2 entry the destruction-director activates kiosk mode via
`window.api.toggleKiosk()` (Sprint 0 channel reuse). The Electron
window goes fullscreen, the menubar/dock are hidden by macOS, the
taskbar is hidden by Win11. The user sees ONLY the destruction
overlay. The kiosk activation is part of the Faz 2 violation — the
game has stopped pretending to be in a window.

### Wallpaper layer (background, z-index baseline)

The wallpaper layer is a procedural SVG/Canvas2D render that fills the
viewport. NO real Apple "Big Sur" or Microsoft "Bloom" asset is
bundled. The SVG is generated at Faz 2 entry via
`procedural-wallpaper.ts` per OS variant.

#### Mac wallpaper — abstract dawn mountain (designer-authored)

Palette from SSOT `WALLPAPER_MAC_PALETTE`:
- `skyTop: #3D5A80` — deep dawn teal (upper sky).
- `skyBottom: #98C1D9` — dusty horizon blue (lower sky).
- `mountain: #293241` — deep indigo silhouette.
- `sun: #EE9B5B` — warm cream bloom highlight.

Composition (SVG/Canvas2D rendered as background-image dataURL):
- Full viewport linear gradient top-to-bottom: `skyTop` → `skyBottom`
  (vertical gradient over the entire viewport).
- Mountain silhouette: a designer-authored triangular path filling the
  bottom 25-30% of the viewport. The path has 3-4 angular peaks
  (not symmetric — peaks at viewport x=15%, x=45%, x=75%). Color:
  `mountain`. Stroke: none.
- Sun bloom: a radial gradient circle ~280px diameter centered at
  viewport (75%, 25%). Inner color `sun` at 0.6 opacity; outer ring
  fades to transparent over 140px radius. Reads as "morning sun above
  the right peak".
- NO sky cloud detail. NO real-world reference. NO Apple wallpaper
  geometry sampled.

#### Win wallpaper — abstract fluent bloom (designer-authored)

Palette from SSOT `WALLPAPER_WIN_PALETTE`:
- `gradientStart: #0A3D62` — deep Win11 family blue (top).
- `gradientEnd: #062847` — darker mid-blue (bottom).
- `accentBloom: #3DD1E7` — cool cyan radial (accent).

Composition:
- Full viewport linear gradient at 135deg: `gradientStart` (top-left) →
  `gradientEnd` (bottom-right).
- Cyan accent bloom: a radial gradient circle ~320px diameter centered
  at viewport (50%, 65%). Inner color `accentBloom` at 0.5 opacity;
  outer ring fades to transparent over 200px radius.
- Designer-fictional four-square logo silhouette at viewport center
  (top 40%) — a 64x64px translucent (0.15 opacity) overlay of the
  same Win11-family four-square geometry from §3 (consistency).
- NO real Win11 Bloom wallpaper geometry sampled.

### Menubar (Mac) / Taskbar (Win) layer (foreground, z-index +1)

#### Mac menubar (top, 28px height)

- Height: 28px (`MENUBAR_MAC_HEIGHT_PX`).
- Background: linear gradient `#F2F2F7` (top) → `#E5E5EA` (bottom).
- Apple logo (designer-fictional, same SVG path as §3 dialog) at
  left, 16x16, centered vertically, inset 12px from left.
- App name "Finder" — 13px regular, system font, 8px right of logo.
- Status row (right side, vertically centered, inset 12px from right):
  - "BAT 87%" battery indicator — 12px regular.
  - WiFi simplified icon (3-arc SVG, designer-authored).
  - Live clock "14:32:18" — 12px regular monospace; updated every
    second via setInterval.
- The live clock updates by `new Date().toLocaleTimeString()` —
  REAL time, no simulation.

#### Win taskbar (bottom, 48px height)

- Height: 48px (`TASKBAR_WIN_HEIGHT_PX`).
- Background: `#202020` with `backdrop-filter: blur(20px)`.
- Border-top: 1px solid `#3A3A3A`.
- Win11 four-square logo (designer-fictional, same as §3 dialog)
  centered horizontally, 16x16, inset 16px from bottom.
- System tray (right side, vertically centered, inset 16px from right):
  - Live clock "14:32" — 11px regular, white text, no seconds.
  - Date "5/21/2026" — 11px regular, white text, line below clock.
  - Clock updates every 60s via setInterval (Win taskbar convention).

### Notification toasts

Spawn cadence: 1 toast per `TOAST_SPAWN_INTERVAL_MS = 1000`ms.

**Mac toasts (top-right corner spawn)**
- 5 toasts in rotation per `TOAST_MESSAGES_MAC`:
  1. iCloud sync paused
  2. Time Machine backup disk lost
  3. Finder disk eject error
  4. kernel_task termination
  5. Spotlight index stopped
- Each toast: 320x80px, white background with subtle drop shadow,
  rounded corners 8px, inset 16px from top-right.
- Slide-in: translate from `translateX(100%)` to `translateX(0)` over
  300ms (`TOAST_SLIDE_IN_DURATION_MS`).
- Visible: 4000ms (`TOAST_LIFETIME_MS`).
- Slide-out: reverse of slide-in.
- Icon left: 32x32 SVG warning/error glyph (designer-fictional).
- Title 13px bold + body 12px regular.

**Win toasts (bottom-right corner spawn, above taskbar)**
- 3 toasts in rotation per `TOAST_MESSAGES_WIN`:
  1. OneDrive sync error
  2. Defender stopped
  3. BitLocker protection failed
- Spawn position: bottom-right, inset 16px from right, 64px from
  bottom (clearing the 48px taskbar).
- Each toast: 360x80px, dark `#2D2D30` background with Win11 acrylic
  blur, rounded corners 4px (smaller than Mac).
- Same slide-in/visible/slide-out timing.

### Desktop icons

8 icons spawn at Faz 2 entry. Cosmetic SVG icons (designer-authored)
arranged in a 4x2 grid at viewport top-left.

**Mac variant icons (designer-fictional)**
- Finder, Safari, Mail, Calendar, Notes, Reminders, App Store, System Preferences.
- 64x64px each, 24px spacing, label below in 11px white text.
- Each icon is a colored rounded square with a designer-authored
  glyph inside (NOT real Apple app icons).

**Win variant icons (designer-fictional)**
- File Explorer, Edge, Mail, Calendar, Photos, Microsoft Store, Settings, OneDrive.
- 48x48px each, 16px spacing, label below in 11px white text.
- Each icon is a colored Win11-style square with a designer-
  authored glyph (NOT real Microsoft app icons).

### Icon fade-out sequence

Starting at Faz 2 entry + 1000ms, icons fade one at a time:
- Each fade: opacity 1 → 0 over 200ms (`ICON_FADE_OUT_MS`).
- Inter-icon delay: 400ms (`ICON_FADE_OUT_INTERVAL_MS`).
- 8 icons × 400ms = 3.2s total dissolve.
- Total dissolve completes at Faz 2 entry + 4200ms — 800ms before
  Faz 2 exit at 5000ms (just before bleed #1 at +4000ms).
- Order: left-to-right, top-to-bottom (reading direction).

The reading-direction order is intentional — left-to-right dissolve
reads as "the desktop is being eaten by something invading from
the left edge". An all-at-once disappear would feel like a screen
reload.

### Apartment bleed #1 (Faz 2 +4000ms = 11000ms post-bang)

See §6 for full bleed rhythm spec. Bleed #1 fires at
`APARTMENT_BLEED_1_TRIGGER_MS = 11000`ms. Duration 300ms,
flicker 12Hz, 4 visible cycles.

### Reduced-motion gate (Faz 2-specific)

| Surface                       | Default                          | Reduced-motion behaviour                               |
|-------------------------------|----------------------------------|--------------------------------------------------------|
| Wallpaper render              | Static SVG, no entry animation   | Unchanged (static is the default)                      |
| Menubar/taskbar live clock    | setInterval                      | Unchanged (functional)                                 |
| Toast slide-in                | translateX 100% → 0 over 300ms   | Instant (toast appears at final position)              |
| Toast visible duration        | 4000ms                           | Unchanged (functional)                                 |
| Icon fade-out                 | opacity 1 → 0 over 200ms         | Instant disappear (400ms stagger preserved)            |
| Apartment bleed #1 flicker    | @keyframes strobe at 12Hz        | Single 1-second fade-in to 50% opacity, then fade-out  |

---

## 5. Faz 3 Terminal (12-22sn)

Faz 3 is the punchline-setup. The terminal window opens, the user
watches `rm -rf /` get typed character-by-character, the user sees
their own username appear in the path output. By the end of Faz 3
the user knows the joke is on them — and they have 8 more seconds
of file paths to read.

### Terminal window — OS-conditional chrome

#### Mac variant — Terminal.app-like

**Window**
- 80% viewport width, centered horizontally.
- Position: vertically centered at 50%.
- Height: 70% viewport, max 600px.
- Drop shadow: `0 24px 80px rgba(0, 0, 0, 0.5)`.
- Border-radius: 10px (Mac11+ window default).

**Title bar (top, 28px height)**
- Background: dark grey gradient `#3C3C3C` (top) → `#2A2A2A` (bottom).
- Traffic light circles (top-left, inset 12px from left, vertically
  centered):
  - Red `#FF5F57` close button — 12px diameter.
  - Yellow `#FFBD2E` minimize — 12px diameter.
  - Green `#28C840` maximize — 12px diameter.
  - 8px horizontal spacing between circles.
  - Designer-fictional (no Apple traffic light asset; the colors are
    the well-known macOS family but rendered as plain SVG circles).
- Title text "Terminal — bash — 100x40" — 13px regular, system font,
  centered horizontally.

**Content area (below title bar)**
- Background: `#1E1E1E` (Terminal.app default dark theme color).
- Text: white `#FFFFFF`.
- Font: `font-family: 'SF Mono', 'Menlo', 'Courier New', monospace`
  — system monospace reference; NO SF Mono bundled.
- Font size: 13px.
- Line height: 1.4.
- Padding: 12px on all sides.
- Scrollable vertically (overflow-y: auto) but practically the
  typewriter speed keeps content rendering at the bottom edge.

#### Win variant — Windows Terminal-like

**Window**
- 80% viewport width, centered horizontally.
- Position: vertically centered at 50%.
- Height: 70% viewport, max 600px.
- Drop shadow: Win11 elevation stack (3 layers).
- Border-radius: 8px (Win11 window default).

**Title bar (top, 32px height)**
- Background: dark Win11 acrylic `#202020` with `backdrop-filter: blur(20px)`.
- Window controls (top-right, inset 8px from right):
  - Minimize "−" icon — 14x14, 12x12 line stroke.
  - Maximize "□" icon — 14x14.
  - Close "×" icon — 14x14, red hover state.
- Title text "Windows PowerShell" — 13px regular, Segoe UI Variable
  (Sprint 0 bundled OFL), left-aligned with 16px inset from left.

**Content area**
- Background: `#0C0C0C` (Windows Terminal default dark theme).
- Text: white `#FFFFFF`.
- Font: `font-family: 'Cascadia Code', 'Consolas', monospace`
  — Cascadia Code bundled Sprint 0 OFL.
- Font size: 13px.
- Line height: 1.4.
- Padding: 12px on all sides.

### Typewriter sequence — Command line (Faz 3 entry + 0ms)

The terminal opens with an empty prompt:
```
$ █
```

The block cursor (`█`) blinks at 2Hz (`TYPEWRITER_CURSOR_BLINK_HZ`).
500ms after entry, the typewriter starts.

**Command line typing (Faz 3 entry + 500ms → +2600ms)**

Command: `sudo rm -rf / --no-preserve-root`

- 32 characters total.
- Rate: 15 chars/sec (`TYPEWRITER_COMMAND_CHARS_PER_SEC`).
- Duration: ~2100ms.
- Visual: each character appears one at a time; the cursor moves
  right with each character.

```
$ sudo rm -rf / --no-preserve-root█
```

**Password prompt (Faz 3 entry + 2600ms)**

After Enter, the next line appears immediately:
```
Password: █
```

**Password typing (Faz 3 entry + 2800ms → +4400ms)**

Password chars `********` (8 asterisks).
- Rate: ~5 chars/sec (slower than command — visual gravitas).
- Duration: ~1600ms.

```
Password: ********█
```

**Enter pause (Faz 3 entry + 4400ms → +4700ms)**

300ms of nothing. Just the cursor blinking. The user reads what they
just saw. The screen is silent. This is the moment they realise
what is about to be deleted.

### Typewriter sequence — Output (Faz 3 entry + 4700ms → +12000ms)

At 4700ms the rm output begins. Rate: 70 lines/sec
(`TYPEWRITER_OUTPUT_LINES_PER_SEC`). Lines stream past so fast the
user cannot read individual paths — but the named motifs catch the
eye 1-2 times.

**Total output window**: 7300ms (4700ms → 12000ms = ~511 lines at 70 LPS).

**Path rotation**: 18 entries cycle from `FAKE_FILE_PATHS_MAC` or
`FAKE_FILE_PATHS_WIN` (per OS arg). 511 lines / 18 entries ≈ 28
loops through the rotation.

**Username substitution**: at Faz 3 entry, the destruction-director
awaits `window.api.getUsername()`. The returned string replaces every
`USER` token in the path templates via
`template.split(USERNAME_PLACEHOLDER).join(username)`. The render NEVER
sees the username at module load — it is fully runtime.

**Example output (with username `melih.sarac` substituted)**

```
removed '/Users/melih.sarac/Documents/tax-returns-2025.pdf'
removed '/Users/melih.sarac/Documents/passwords-master.txt'
removed '/Users/melih.sarac/Documents/messages-backup/'
removed '/Users/melih.sarac/Documents/thesis-final-FINAL-v3.docx'
removed '/Users/melih.sarac/Documents/2026-finance-Q1.xlsx'
removed '/Users/melih.sarac/.ssh/id_rsa'
removed '/Users/melih.sarac/.aws/credentials'
rm: cannot remove '/Users/melih.sarac/Library/Keychains/login.keychain-db': Device busy
rm: cannot remove '/Users/melih.sarac/Library/Cookies/Cookies.binarycookies': Resource busy
```

**Equivalent Windows output (with username `melihs` substituted)**

```
removed C:\\Users\\melihs\\Documents\\tax-returns-2025.pdf
removed C:\\Users\\melihs\\Documents\\passwords-master.txt
removed C:\\Users\\melihs\\.ssh\\id_rsa
```

### "Device busy" lines — authenticity beat

The two `rm: cannot remove ... : Device busy` lines per OS are
positioned at the END of each rotation. The "Device busy" error is
the realest part of the joke — anyone who has actually run `rm -rf /`
has seen system files refuse to delete because they're locked by
the OS. Including 1-2 of these per rotation tells the trained eye
that this output FORMAT is real, even though every line is fake.

### Apartment bleed #2 (Faz 3 +4000ms = 16000ms post-bang)

See §6. Bleed #2 fires at `APARTMENT_BLEED_2_TRIGGER_MS = 16000`ms.
Duration 200ms (shorter than #1's 300ms — deliberately variable, see §6).

The bleed happens MID-OUTPUT. The terminal keeps rendering paths
underneath the bleed overlay; the bleed is a transparent layer on top.
When the bleed exits, the terminal has rendered another ~14 lines
(200ms × 70 LPS) — which is the "the system kept destroying files
while the room peeked through" beat.

### Reduced-motion gate (Faz 3-specific)

| Surface                         | Default                                | Reduced-motion behaviour                              |
|---------------------------------|----------------------------------------|-------------------------------------------------------|
| Cursor blink                    | @keyframes opacity 0/1 at 2Hz          | Solid 100% opacity (no blink)                         |
| Command line typing             | setInterval char append at 15 chars/sec| Instant whole-line render                             |
| Password typing                 | setInterval char append at 5 chars/sec | Instant whole-line render                             |
| Output line flow                | setInterval line append at 70 LPS      | Unchanged (pacing is the joke — functional)           |
| Apartment bleed #2 flicker      | @keyframes strobe at 12Hz              | Single 1-second fade-in to 50% opacity, then fade-out |

The output flow is the one Faz 3 surface that does NOT have a reduced-
motion alternative. The flow IS the joke — reducing it would make the
file paths unreadable (they're already unreadable at 70 LPS for normal
users; the joke depends on volume). The block-cursor blink and the
typing animation gate; the flow is functional.

---

## 6. Apartment bleed rhythm — incommensurable timing

The apartment bleeds are the leakage moments where the lobby palette
returns through the destruction. Sprint 4 owns 2 bleeds:

### Bleed timing palette

| Bleed | Trigger offset from bang | Duration | Flicker rate | Visible cycles |
|-------|--------------------------|----------|--------------|----------------|
| #1    | 11000ms                  | 300ms    | 12Hz         | ~4 cycles      |
| #2    | 16000ms                  | 200ms    | 12Hz         | ~2-3 cycles    |

The 5000ms offset between #1 and #2 is intentional. Bleed #1 lands
4000ms into Faz 2 (the takeover is established, the user has just
seen "the game escaped the window"). Bleed #2 lands 4000ms into Faz 3
(the typewriter has just finished the command line + password +
Enter pause; the output flow is just starting).

### Why incommensurable with the bulb

Sprint 1 §2 established the bulb Lissajous sway with two independent
periods:
- swayPeriodSecX = 3.7s (X axis)
- swayPeriodSecZ = 4.9s (Z axis)
- Intensity ripple: 14Hz AC pulse

The bleed flicker is at 12Hz. Let's check the ratios:

| Pairing | Ratio | Integer? |
|---------|-------|----------|
| 11000ms / 3700ms (X sway period) | 2.973 | No |
| 11000ms / 4900ms (Z sway period) | 2.245 | No |
| 16000ms / 3700ms | 4.324 | No |
| 16000ms / 4900ms | 3.265 | No |
| 12Hz vs 14Hz (bulb pulse) | 0.857 | No |

None of these ratios are integer or simple fraction. The bleed will
NEVER align with the bulb pulse OR the bulb sway visibly during its
short 200-300ms window. The composition reads as "two unrelated
motions in the same instant" — which is the "accidental leak"
feeling the bleeds need.

This is the Sprint 3 designer convention (model-freeze-direction.md
§8.6 incommensurable frequencies) carried into Sprint 4. The
convention is: every periodic motion in the room is at a period
incommensurable with every other periodic motion. The brain reads
"ambient noise"; the eye never spots a beat pattern.

### Visual content of the bleed

Both bleeds use the SAME lobby snapshot dataURL (captured at Sprint 3
model freeze t=0). The snapshot shows the masa (table), the revolver,
the sönmüş ampul (darkened bulb — yes, even the snapshot has the
dark bulb because the snapshot is captured AFTER Faz 0 bulb darken).

The 300ms / 200ms durations create a SLIGHT difference in user
reading:
- Bleed #1 at 300ms = 4 cycles = "I think I saw something — was it
  the table? The revolver? I'm not sure" → DOUBT.
- Bleed #2 at 200ms = 2-3 cycles = "There it was again — same image —
  but I still can't read it" → CONFIRMATION-WITHOUT-RESOLUTION.

The shorter #2 is intentionally less clear than #1 — it confirms the
existence of bleeds (the user is not hallucinating) but refuses to
confirm the content. This pattern extends to Sprint 5:
- Bleed #3 (Sprint 5 Faz 5 +4000ms = 34000ms post-bang) — 400ms — the
  longest bleed, the user finally reads the table content clearly.
- Bleed #4 (Sprint 5 Faz 7 +4000ms = 48000ms post-bang) — 800ms — the
  longest of all, with a CHANGED composition (revolver pointing at
  the table this time, per PLAN §7 Faz 7 spec). This is the bleed
  that primes the Sprint 6 reveal.

Sprint 4 establishes the timing palette. Sprint 5 extends with
non-4-second offsets (the 4-second cadence breaks in #3 and #4 to
keep the bleed rhythm unpredictable).

### Compositional implementation

The bleed overlay is a separate `<div class="apartment-bleed-overlay">`
mounted at z-index 9999 (just below the destruction overlay 10000).
- `background-image: url(<SceneHandle.lobbySnapshotDataUrl>)`.
- `background-size: cover`.
- `background-position: center`.
- Initial opacity: 0.
- `.is-bleeding` class triggers a CSS @keyframes animation that
  pulses opacity at 12Hz for the bleed duration.

The destruction overlay (z 10000) is NOT removed during the bleed —
the bleed overlay sits between the lobby and the destruction. The
flicker reveals the lobby through partial transparency on the
destruction overlay (the bleed overlay reduces the destruction's
opacity at strobe rate). Net visual: the destruction "winks", letting
the lobby show through for 200-300ms.

### Reduced-motion bleed gate

The CSS-driven strobe is the highest-risk surface in the destruction
for photosensitive epilepsy. The reduced-motion gate REPLACES the
strobe with a fade-only fallback:

```css
@media (prefers-reduced-motion: reduce) {
  .apartment-bleed-overlay.is-bleeding {
    animation: none;
    transition: opacity 500ms ease-in-out;
    opacity: 0.5;
  }
}
```

The fallback is a 500ms ease-in fade to 0.5 opacity, then a 500ms
ease-out fade back to 0. Total 1000ms — LONGER than the original
300ms strobe, but containing zero strobe cycles. The user with
reduced-motion preference sees the bleed but reads it as "the
screen ghosted briefly" rather than "the screen strobed".

This is the most important Sprint 4 a11y gate. Phase 2B kraken-faz2-3
implementer: verify the @media query is present in
`apartment-bleed.ts` injected CSS, and verify the JS-driven path
also checks `window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches`.

---

## 7. Audio mix throughout Faz 0-3

### BiquadFilterNode global low-pass (Faz 0 → Faz 3)

- Filter type: `lowpass`.
- Cutoff: 700Hz (`LOW_PASS_CUTOFF_HZ`).
- Q factor: 1.0 (standard 12dB/octave slope).
- Applied to: the AudioBed master gain node — kraken-faz0-1 scripts
  the BiquadFilterNode insertion into the audio graph at Faz 0 entry.
- Activation: at Faz 0 entry + 200ms, the cutoff ramps from 22000Hz
  (effectively unfiltered) to 700Hz over 300ms ease-out
  (`exponentialRampToValueAtTime(700, t+0.3)`).
- Held: through Faz 1, Faz 2, Faz 3.
- NEVER released during Sprint 4 (Sprint 6 Faz 8 reveal will
  unwind the filter; not Sprint 4's job).

### Tinnitus 4kHz OscillatorNode (Faz 0 onset → Sprint 6 reveal)

- Type: `sine`.
- Frequency: 4000Hz (`TINNITUS_FREQ_HZ`).
- Amplitude: -12dB linear gain (`Math.pow(10, -12/20) = 0.251`).
- Onset: 50ms after `bang-fired` (slight delay so the bang's transient
  is heard first).
- Fade-in: 100ms ramp from 0 to 0.251.
- Sustain: through all 4 fazlar.
- Reduced-motion override: -18dB linear gain (~0.126); set via
  `TINNITUS_AMPLITUDE_REDUCED_MOTION_DB` SSOT constant.

### Native chord stub at Faz 1 entry (procedural)

The chord is a 3-sine layered synthesis — NO real Mac chime or Win
error chord sampled (C1 closure: telif-safe).

- Layer 1: 800Hz sine.
- Layer 2: 600Hz sine.
- Layer 3: 400Hz sine.
- Amplitude: each layer at -10dB (linear gain 0.316), then summed.
- Envelope (ADSR):
  - Attack: 50ms (0 → peak).
  - Decay: 200ms (peak → sustain level 60%).
  - Sustain: 100ms (at 60% of peak).
  - Release: 400ms (60% → 0).
- Total duration: ~750ms.
- Trigger: at Faz 1 entry (2000ms post-bang).
- Played ONCE; no loop.

### Background ambient (bulb hum + radio static) — Faz 0 fade

- At Faz 0 entry, radio static (one of the four AMBIENT_LAYERS from
  Sprint 1) begins fading out via `audioBed.fadeOutAmbient()` with
  envelope duration `RADIO_FADE_DURATION_MS = 1200`ms.
- Bulb hum (50Hz mains hum, Sprint 1 procedural synth) continues
  through Faz 0 with NO fade — the hum is what sells "the room is
  still there underneath".
- At Faz 1 entry (2000ms post-bang), bulb hum begins fading out (no
  explicit envelope duration; designer specifies a 1500ms exponential
  ramp to 0 — bulb hum disappears slightly before Faz 2 entry at
  2000 + 5000 = 7000ms post-bang).
- By Faz 2 entry, ALL ambient channels are muted. The takeover is
  sterile + dead silent (apart from the tinnitus + low-passed system
  sounds).

### Audio surface summary

| Surface                    | Onset                   | Sustain duration              | Constant                              |
|----------------------------|-------------------------|-------------------------------|---------------------------------------|
| Low-pass filter (700Hz)    | Faz 0 + 200ms (300ms ramp)| Through Sprint 6              | LOW_PASS_CUTOFF_HZ                    |
| Tinnitus 4kHz (-12dB)      | Faz 0 + 50ms (100ms fade-in)| Through Sprint 6              | TINNITUS_FREQ_HZ                      |
| Camera shake (vestibular)  | Faz 0 + 0ms             | 400ms                         | BANG_CAMERA_SHAKE_DURATION_MS         |
| Bulb darken (visual)       | Faz 0 + 0ms             | 600ms                         | BULB_DARKEN_DURATION_MS               |
| Radio fade-out             | Faz 0 + 0ms             | 1200ms                        | RADIO_FADE_DURATION_MS                |
| Bulb hum fade-out          | Faz 1 + 0ms             | 1500ms                        | (not in SSOT — kraken-faz0-1 inline)  |
| Native chord stub          | Faz 1 + 0ms             | 750ms ADSR envelope           | (procedural — kraken-faz0-1 owns)     |
| Toast spawn cadence        | Faz 2 + 0ms             | 1000ms intervals through Faz 2| TOAST_SPAWN_INTERVAL_MS               |
| Apartment bleed flickers   | Faz 2 + 4000ms, Faz 3 + 4000ms| 300ms / 200ms          | APARTMENT_BLEED_*_DURATION_MS         |

The bulb-hum fade-out duration (1500ms at Faz 1 entry) is the ONE
audio param that designer specifies INLINE — not via the SSOT —
because the bulb hum is a Sprint 1 ambient channel, not a Sprint 4
destruction-owned channel. Phase 2B kraken-faz0-1 implements via
existing `audioBed.fadeOutAmbient('bulb-hum')` API or equivalent.

---

## 8. prefers-reduced-motion cross-system matrix

Sprint 3 retro lesson #2 (the new Sprint 4 lesson): every motion,
strobe, and audio amplitude surface in the destruction tree MUST
respect `prefers-reduced-motion: reduce`. This matrix is the
COMPREHENSIVE audit — Phase 2B implementers consult this for every
surface they own; Phase 3 qa-engineer greps the matrix as the
verification list.

The matrix is intentionally exhaustive. If a surface is not in this
table, it does not need a gate (because it is not a motion surface).
Phase 2B implementers who discover a NEW motion surface during
implementation MUST add it to this table AND implement the gate
before Phase 3 review.

### Master matrix table

| # | Surface                              | Default behaviour                            | Reduced-motion behaviour                                            | File location                                                | Phase 2B owner   |
|---|--------------------------------------|----------------------------------------------|---------------------------------------------------------------------|--------------------------------------------------------------|------------------|
| 1 | Camera shake 5deg (Faz 0)            | JS RAF, critically-damped 400ms              | Amplitude = 0 (no shake)                                            | `src/renderer/scene/destruction/faz0-bang.ts`                | kraken-faz0-1    |
| 2 | Bulb darken (Faz 0)                  | JS lighting.setBaseIntensityFactor over 600ms| Duration shortened to 200ms (faster, no fade)                       | `faz0-bang.ts`                                               | kraken-faz0-1    |
| 3 | Tinnitus 4kHz amplitude (Faz 0+)     | -12dB sine sustained                         | -18dB sine sustained (TINNITUS_AMPLITUDE_REDUCED_MOTION_DB)         | `src/renderer/audio/destruction-audio.ts` (NEW)              | kraken-faz0-1    |
| 4 | Low-pass cutoff transition (Faz 0)   | exponentialRampToValueAtTime 300ms           | Unchanged (audio gate is amplitude only; cutoff is functional)      | `destruction-audio.ts`                                       | kraken-faz0-1    |
| 5 | Radio static fade-out (Faz 0)        | 1200ms linear ramp                           | Unchanged (functional)                                              | `faz0-bang.ts`                                               | kraken-faz0-1    |
| 6 | Sprint 2 1-frame white flash         | 1 frame at white                             | NOT GATED (already played before Faz 0; Sprint 6 retro task)        | `src/renderer/scene/revolver/bang-overlay.ts` (Sprint 2)     | (deferred)       |
| 7 | Modal entry opacity (Faz 1)          | CSS opacity transition 200ms                 | Instant (0ms duration)                                              | `chrome/mac-dialog.ts` + `chrome/win-dialog.ts`              | swift + frontend |
| 8 | Modal backdrop-filter blur (Faz 1)   | CSS backdrop-filter transition 200ms         | Instant snap to final blur value                                    | `chrome/mac-dialog.ts` + `chrome/win-dialog.ts`              | swift + frontend |
| 9 | Native chord stub envelope (Faz 1)   | 750ms ADSR (audio)                           | Unchanged (audio amplitude unchanged; ADSR is intrinsic to the chord)| `destruction-audio.ts`                                       | kraken-faz0-1    |
| 10| Dialog countdown text update (Faz 1) | setInterval 1000ms text decrement            | Unchanged (functional — user needs to read countdown)               | `chrome/mac-dialog.ts`                                       | swift-expert     |
| 11| Wallpaper render (Faz 2)             | Static SVG, no animation                     | N/A — static                                                        | `destruction/procedural-wallpaper.ts`                        | kraken-faz2-3    |
| 12| Menubar/taskbar live clock (Faz 2)   | setInterval text update                      | Unchanged (functional)                                              | `chrome/mac-menubar.ts` + `chrome/win-taskbar.ts`            | kraken-faz2-3    |
| 13| Toast slide-in (Faz 2)               | CSS transform translateX 300ms               | Instant (translate already at 0)                                    | `destruction/faz2-takeover.ts`                               | kraken-faz2-3    |
| 14| Toast visible duration (Faz 2)       | setTimeout 4000ms                            | Unchanged (functional)                                              | `faz2-takeover.ts`                                           | kraken-faz2-3    |
| 15| Toast slide-out (Faz 2)              | CSS transform translateX 300ms               | Instant disappear                                                   | `faz2-takeover.ts`                                           | kraken-faz2-3    |
| 16| Icon fade-out (Faz 2)                | CSS opacity 1 → 0 over 200ms                 | Instant disappear (400ms stagger preserved)                         | `faz2-takeover.ts`                                           | kraken-faz2-3    |
| 17| Apartment bleed #1 flicker (Faz 2 +4s)| CSS @keyframes opacity strobe at 12Hz       | Single 1s ease-in fade to 50% then fade-out (NO strobe)             | `destruction/apartment-bleed.ts`                             | kraken-faz2-3    |
| 18| Apartment bleed #2 flicker (Faz 3 +4s)| Same as #1                                  | Same gate as #1                                                     | `apartment-bleed.ts`                                         | kraken-faz2-3    |
| 19| Terminal cursor blink (Faz 3)        | CSS @keyframes opacity 0/1 at 2Hz            | Solid 100% opacity (no blink)                                       | `destruction/faz3-terminal.ts`                               | kraken-faz2-3    |
| 20| Typewriter command typing (Faz 3)    | setInterval char append at 15 chars/sec      | Instant whole-line render                                           | `faz3-terminal.ts`                                           | kraken-faz2-3    |
| 21| Typewriter password typing (Faz 3)   | setInterval char append at 5 chars/sec       | Instant whole-line render                                           | `faz3-terminal.ts`                                           | kraken-faz2-3    |
| 22| Typewriter output flow (Faz 3)       | setInterval line append at 70 LPS            | Unchanged (pacing IS the joke; functional)                          | `faz3-terminal.ts`                                           | kraken-faz2-3    |

**Total surfaces audited: 22.**

**Surfaces with active reduced-motion alternative: 14.**

**Surfaces unchanged under reduced-motion (functional): 7.**

**Surfaces NOT gated (Sprint 6 retro task): 1 (the Sprint 2 1-frame flash).**

### Implementation patterns

Every gate uses one of two patterns. Phase 2B implementers follow
the pattern that matches their surface type.

**Pattern A — JS-driven motion (camera shake, bulb darken, audio amplitude)**

```ts
import { PREFERS_REDUCED_MOTION_QUERY } from '../../shared/scene-destruction-constants';

const reducedMotion = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY).matches;

if (reducedMotion) {
  // amplitude or duration gate
  triggerCameraShake({ amplitudeDeg: 0, durationMs: 0 });
} else {
  triggerCameraShake({
    amplitudeDeg: BANG_CAMERA_SHAKE_DEG,
    durationMs: BANG_CAMERA_SHAKE_DURATION_MS,
  });
}
```

For live-changing motion preferences (the user toggles
prefers-reduced-motion while the destruction is running — rare but
valid), subscribe to the matchMedia change event:

```ts
const mql = window.matchMedia(PREFERS_REDUCED_MOTION_QUERY);
const handler = (e: MediaQueryListEvent) => {
  // update animation state — pause/resume/reset
};
mql.addEventListener('change', handler);
// cleanup on dispose
return () => mql.removeEventListener('change', handler);
```

**Pattern B — CSS-driven motion (toast slide, icon fade, cursor blink, bleed flicker)**

```css
.toast {
  transition: transform 300ms ease-out;
  transform: translateX(100%);
}
.toast.is-visible {
  transform: translateX(0);
}

@media (prefers-reduced-motion: reduce) {
  .toast {
    transition: none;
    transform: translateX(0); /* skip slide entirely */
  }
}
```

```css
@keyframes apartment-bleed-strobe {
  0%, 100% { opacity: 0; }
  16% { opacity: 1; }
  33% { opacity: 0.3; }
  50% { opacity: 1; }
  66% { opacity: 0; }
}

.apartment-bleed-overlay.is-bleeding {
  animation: apartment-bleed-strobe 300ms linear;
}

@media (prefers-reduced-motion: reduce) {
  .apartment-bleed-overlay.is-bleeding {
    animation: none;
    transition: opacity 500ms ease-in-out;
    opacity: 0.5;
  }
}
```

The CSS pattern (Pattern B) is preferred where possible because the
gate is declarative and the browser handles the live media query
change without JS subscription. JS-driven motion requires the
explicit `matchMedia` subscription pattern.

### Phase 3 verification grep

Phase 3 qa-engineer Phase verifier greps for the gate presence:

```bash
grep -rn "prefers-reduced-motion" src/renderer/scene/destruction/
grep -rn "PREFERS_REDUCED_MOTION_QUERY" src/renderer/scene/destruction/
grep -rn "@media (prefers-reduced-motion: reduce)" src/renderer/styles/destruction*.css
```

The matrix lists 21 gated surfaces (excluding the deferred Sprint 2
flash). The grep results MUST cover at least 21 distinct file:line
occurrences of either `matchMedia(PREFERS_REDUCED_MOTION_QUERY)` or
the CSS `@media (prefers-reduced-motion: reduce)` selector.

If the grep count is < 21, a gate is missing. Phase 3 qa-engineer
identifies which row of the matrix has no corresponding grep hit
and routes back to the Phase 2B owner.

---

## 9. Phase 2B validation checklists (per-lane)

Sprint 3 retro lesson #1 ratified: each direction document closes with
a per-lane validation list so the implementing agents have an
unambiguous PASS criteria. Sprint 4 §9 enumerates 5 lanes (one per
Phase 2B agent in the Sprint 4 swarm matrix).

### Lane A: kraken-faz0-1 (Faz 0 BANG + Faz 1 dialog orchestration)

**Owned files (NEW or extended):**
- `src/renderer/scene/destruction/faz0-bang.ts`
- `src/renderer/scene/destruction/faz1-critical-dialog.ts`
- `src/renderer/scene/destruction/destruction-director.ts`
- `src/renderer/audio/destruction-audio.ts` (NEW)
- `src/renderer/scene/revolver/revolver-state.ts` (extended for destruction-active)

**Validation checklist (15 items):**
- [ ] `destruction-director.ts` subscribes to `bang-fired` CustomEvent on `document` AND falls back to MutationObserver on `.bang-overlay.is-fired` class list (100ms timeout before fallback engages).
- [ ] `destruction-director.ts` awaits `window.api.getOS()` AND `window.api.getUsername()` in parallel at Faz 0 entry; caches both for Faz 1/2/3 use.
- [ ] `destruction-director.ts` subscribes to `window.api.onEscapeHold` (Sprint 0 preload bridge); ESC-hold 3s aborts any faz to `{kind:'aborted', reason:'esc-hold'}`.
- [ ] `faz0-bang.ts` loads `bang.ogg` via Howler with try/catch; falls back to procedural noise burst (50ms attack + 200ms decay, 2kHz high-pass) if `Howl.on('loaderror')` fires.
- [ ] `faz0-bang.ts` starts 4kHz tinnitus OscillatorNode (TINNITUS_FREQ_HZ from SSOT) at -12dB (TINNITUS_AMPLITUDE_DB) with 100ms fade-in starting at Faz 0 + 50ms.
- [ ] `faz0-bang.ts` inserts BiquadFilterNode (lowpass, Q=1.0) into audioBed master gain chain; cutoff ramps from 22000Hz to LOW_PASS_CUTOFF_HZ (700) over 300ms ease-out starting at Faz 0 + 200ms.
- [ ] `faz0-bang.ts` triggers camera shake via existing Sprint 1 helper with BANG_CAMERA_SHAKE_DEG=5 amplitude and BANG_CAMERA_SHAKE_DURATION_MS=400ms (critically-damped).
- [ ] `faz0-bang.ts` darkens bulb via existing `lighting.setBaseIntensityFactor(0)` over BULB_DARKEN_DURATION_MS=600ms linear.
- [ ] `faz0-bang.ts` fades radio static via `audioBed.fadeOutAmbient('radio-static')` over RADIO_FADE_DURATION_MS=1200ms.
- [ ] `faz0-bang.ts` respects reduced-motion gate matrix §8 rows 1-5 (camera shake amplitude=0, bulb darken duration=200ms, tinnitus -18dB, low-pass unchanged, radio fade unchanged).
- [ ] `faz1-critical-dialog.ts` OS-branches on cached os: 'mac' mounts `chrome/mac-dialog.ts`, 'win' mounts `chrome/win-dialog.ts`.
- [ ] `faz1-critical-dialog.ts` plays procedural native chord stub (3-sine 800+600+400Hz layered, ADSR 50+200+100+400ms, -10dB peak) at Faz 1 entry. NO bundled chime/error sample.
- [ ] `faz1-critical-dialog.ts` respects reduced-motion gate matrix §8 rows 7-10 (instant modal entry, instant backdrop blur snap, chord unchanged, countdown unchanged).
- [ ] `destruction-audio.ts` exports `mountDestructionAudio()` returning `{ dispose }`; dispose path stops OscillatorNode, disconnects BiquadFilterNode, releases gain nodes.
- [ ] `revolver-state.ts` extended with `destruction-active` state; exhaustive switches all `assertNever`-clean (Sprint 2 AnimClipName lesson — no missing case).

### Lane B: kraken-faz2-3 (Faz 2 takeover + Faz 3 terminal + apartment bleeds)

**Owned files (NEW):**
- `src/renderer/scene/destruction/faz2-takeover.ts`
- `src/renderer/scene/destruction/faz3-terminal.ts`
- `src/renderer/scene/destruction/apartment-bleed.ts`
- `src/renderer/scene/destruction/procedural-wallpaper.ts`
- `src/renderer/scene/destruction/chrome/mac-menubar.ts`
- `src/renderer/scene/destruction/chrome/win-taskbar.ts`

**Validation checklist (18 items):**
- [ ] `faz2-takeover.ts` mounts `<div class="destruction-takeover">` overlay at z-index 10000 (above CRT 9999).
- [ ] `faz2-takeover.ts` activates kiosk via `window.api.toggleKiosk()` at Faz 2 entry.
- [ ] `faz2-takeover.ts` mounts procedural-wallpaper SVG/Canvas2D background layer (Mac OR Win variant per os arg).
- [ ] `faz2-takeover.ts` mounts mac-menubar OR win-taskbar per os arg with live clock setInterval.
- [ ] `faz2-takeover.ts` spawns toasts via setInterval at TOAST_SPAWN_INTERVAL_MS=1000ms cadence (5 mac OR 3 win, rotating).
- [ ] `faz2-takeover.ts` fades icons sequentially (ICON_FADE_OUT_INTERVAL_MS=400ms stagger × 8 icons = 3.2s total).
- [ ] `faz2-takeover.ts` triggers ApartmentBleed #1 at APARTMENT_BLEED_1_TRIGGER_MS=11000ms via setTimeout.
- [ ] `faz2-takeover.ts` respects reduced-motion gate matrix §8 rows 11-16 + 17 (toast slide instant, icon fade instant, bleed strobe replaced with fade).
- [ ] `faz3-terminal.ts` mounts Terminal.app-like OR Windows Terminal-like chrome per os arg.
- [ ] `faz3-terminal.ts` typewriter command "sudo rm -rf / --no-preserve-root" at TYPEWRITER_COMMAND_CHARS_PER_SEC=15 (~2.1s for 32 chars).
- [ ] `faz3-terminal.ts` typewriter password "********" at 5 chars/sec (~1.6s for 8 chars).
- [ ] `faz3-terminal.ts` 300ms Enter pause before output begins.
- [ ] `faz3-terminal.ts` typewriter output at TYPEWRITER_OUTPUT_LINES_PER_SEC=70; loops FAKE_FILE_PATHS_MAC OR FAKE_FILE_PATHS_WIN (18 entries each).
- [ ] `faz3-terminal.ts` substitutes USERNAME_PLACEHOLDER ('USER') with username arg via `template.split(USERNAME_PLACEHOLDER).join(username)`; fallback to literal 'USER' if username arg is empty.
- [ ] `faz3-terminal.ts` triggers ApartmentBleed #2 at APARTMENT_BLEED_2_TRIGGER_MS=16000ms via setTimeout.
- [ ] `faz3-terminal.ts` cursor blinks at TYPEWRITER_CURSOR_BLINK_HZ=2 (500ms on/off).
- [ ] `faz3-terminal.ts` respects reduced-motion gate matrix §8 rows 18-22 (cursor solid, command/password instant render, output flow unchanged).
- [ ] `apartment-bleed.ts` uses SceneHandle.lobbySnapshotDataUrl (Sprint 4 Phase 1 plumbing) as background-image; CSS @keyframes for .is-bleeding strobe at APARTMENT_BLEED_FLICKER_HZ=12Hz; @media reduced-motion override with single 1s fade fallback.

**Procedural wallpaper / chrome sub-validation:**
- [ ] `procedural-wallpaper.ts` renders Mac OR Win variant as SVG-as-string OR Canvas2D dataURL — NEVER a real Apple Big Sur / MS Bloom asset. Designer-fictional geometries only.
- [ ] `chrome/mac-menubar.ts` renders top 28px bar (MENUBAR_MAC_HEIGHT_PX) with designer-fictional Apple-shape SVG silhouette (16x16 path data, monochrome `#1D1D1F`) + live clock setInterval at 1Hz.
- [ ] `chrome/win-taskbar.ts` renders bottom 48px bar (TASKBAR_WIN_HEIGHT_PX) with designer-fictional Win11-style four-square SVG geometry + live clock setInterval at 1/60Hz (per-minute updates).

### Lane C: swift-expert (chrome/mac-dialog.ts pixel-perfect)

**Owned files (NEW):**
- `src/renderer/scene/destruction/chrome/mac-dialog.ts`

**Validation checklist (10 items):**
- [ ] `mac-dialog.ts` mounts modal at DIALOG_MAC_WIDTH_PX=380 × DIALOG_MAC_HEIGHT_PX=200, centered viewport.
- [ ] Designer-fictional Apple-shape SVG silhouette at top-left, 16x16, monochrome `#1D1D1F`. Path data is designer-authored convex shape with single concave bite — NOT pixel-identical to Apple Inc. trademark.
- [ ] Title "Critical Error" at 14px bold; font-family `-apple-system, BlinkMacSystemFont, sans-serif`. NO SF Pro bundled.
- [ ] Body text at 13px regular wrap to ~340px width. Body content from i18n key `destruction.mac.dialog.body` (consumes i18n-expert lane).
- [ ] Countdown line "Restarting in N..." at 13px italic; N updates via `MacDialogHandle.setCountdown(n)` per Sprint 4 Phase 1 type contract.
- [ ] "Restart Now" primary button at `#0066CC` blue, white text, 28px height, 6px radius. "Cancel" secondary disabled grey. Right-aligned, inset 12px from right/bottom.
- [ ] Modal backdrop full-viewport `<div>` with `backdrop-filter: blur(20px) saturate(180%)` and `rgba(0, 0, 0, 0.3)` tint.
- [ ] `setCountdown(n)` driven by parent destruction-director setInterval at DIALOG_COUNTDOWN_INTERVAL_MS=1000ms cadence; cleanup via setInterval clearance on Faz 1 exit OR abort.
- [ ] Reduced-motion gate: modal entry transition `opacity` and backdrop `backdrop-filter` set to 0ms duration (instant).
- [ ] `dispose()` cleanup: removes modal DOM node, clears setInterval, unsubscribes any matchMedia change listeners. Safe to call twice.

### Lane D: frontend-dev + oracle (chrome/win-dialog.ts pixel-perfect)

**Owned files (NEW):**
- `src/renderer/scene/destruction/chrome/win-dialog.ts`

**Oracle research dependency:**
- Win11 Fluent Design System docs research — confirms accent color `#0078D4`, rounded-corner 8px, Acrylic blur+saturate values, Segoe UI Variable bundling (already done Sprint 0).

**Validation checklist (10 items):**
- [ ] `win-dialog.ts` mounts modal at DIALOG_WIN_WIDTH_PX=400 × DIALOG_WIN_HEIGHT_PX=220, centered viewport.
- [ ] Designer-fictional Win11 four-square SVG at top-right, 16x16, gradient `#0078D4` → `#005FB8`. Path data is a 2x2 rect grid with 1px gap — single gradient across all four (NOT four colors as in real Microsoft logo).
- [ ] Title "Critical Process Failed" at 14px bold; font-family `'Segoe UI Variable', 'Segoe UI', sans-serif` (Sprint 0 bundled OFL).
- [ ] Body text at 13px regular wrap to ~360px width. Body content from i18n key `destruction.win.dialog.body`.
- [ ] "OK" primary button at `#0078D4` Win11 blue, white text, 32px height, 4px radius. "More info" secondary transparent background, `#0078D4` text. Right-aligned, inset 16px from right/bottom.
- [ ] Modal backdrop full-viewport `<div>` with `backdrop-filter: blur(30px) saturate(150%)` (deeper than Mac's 20px — Win11 acrylic family).
- [ ] Win11 elevation shadow stack (3 layers): `0 1px 2px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.12)`.
- [ ] Rounded corners at 8px (Win11 spec; smaller than Mac's 12px).
- [ ] Reduced-motion gate: modal entry transition `opacity` and backdrop `backdrop-filter` set to 0ms duration (instant).
- [ ] `dispose()` cleanup: removes modal DOM node, removes event listeners.

### Lane E: i18n-expert (strings.ts destruction subtree)

**Owned files (extended):**
- `src/renderer/i18n/strings.ts` (extended STRINGS.ru.destruction + STRINGS.tr.destruction subtrees)

**Validation checklist (10 items):**
- [ ] STRINGS.ru.destruction subtree added with Mac dialog + Win dialog + 5 Mac toasts + 3 Win toasts + terminal labels.
- [ ] STRINGS.tr.destruction subtree mirrors every ru key (LocaleKey compile guard).
- [ ] Keys: `destruction.mac.dialog.title` (e.g. "Критическая ошибка" / "Kritik Hata"), `destruction.mac.dialog.body`, `destruction.mac.dialog.restartCountdown` (e.g. "Перезагрузка через {n}…" / "Yeniden başlatma {n}…"), `destruction.mac.dialog.cancelLabel`, `destruction.mac.dialog.restartNowLabel`.
- [ ] Keys: `destruction.win.dialog.title` (e.g. "Критический процесс остановлен" / "Kritik İşlem Başarısız"), `destruction.win.dialog.body`, `destruction.win.dialog.okLabel`, `destruction.win.dialog.moreInfoLabel`.
- [ ] Keys: `destruction.toast.mac.iCloudSyncPaused.title` + `.body`, similarly for `timeMachineBackupLost`, `finderDiskEjectError`, `kernelTaskTermination`, `spotlightIndexStopped` (5 mac toasts × 2 fields = 10 keys).
- [ ] Keys: `destruction.toast.win.oneDriveSyncError.title` + `.body`, similarly for `defenderStopped`, `bitLockerProtectionFailed` (3 win toasts × 2 fields = 6 keys).
- [ ] Keys: `destruction.terminal.command` (English literal — same ru and tr — the command IS English: `"sudo rm -rf / --no-preserve-root"`), `destruction.terminal.passwordPrompt` (e.g. "Пароль:" / "Şifre:").
- [ ] Existing `hud` + `disclaimer` + `revolver` subtrees unchanged (no regression to Sprint 0+2+3 keys).
- [ ] `resolveUserLocale()` Sprint 0 tr-primary contract preserved (no change).
- [ ] Compile guard: `LocaleKey` type union of every leaf path expands cleanly; missing keys cause TypeScript build failure (existing Sprint 0 pattern).

### Lane summary

| Lane | Agent              | NEW files | Extended files | Validation items |
|------|--------------------|-----------|----------------|------------------|
| A    | kraken-faz0-1      | 1         | 5              | 15               |
| B    | kraken-faz2-3      | 6         | 0              | 18 + 3 sub       |
| C    | swift-expert       | 1         | 0              | 10               |
| D    | frontend-dev (+oracle research)| 1 | 0          | 10               |
| E    | i18n-expert        | 0         | 1              | 10               |

**Total Sprint 4 Phase 2B validation items: 63 + 3 sub = 66.**

Phase 3 qa-engineer iterates this list. Each item is independently
verifiable (greppable file, demonstrable behaviour, or constant-
to-implementation cross-reference). A FAIL on any item routes back
to the owning lane for retry (qa-loop.md retry cycle, max 3 attempts
before escalation).

---

*End of destruction direction. Questions on destruction decisions
should copy the relevant section into the conversation so the
rationale stays linked to the constants. Sprint 4 Phase 5 retro
should revisit §6 apartment bleed timing after the Sprint 5 #3 and
#4 are landed — the rhythm palette will be fully visible across the
4 bleeds and may benefit from per-bleed cadence tuning.*

## Files this designer pass authored or edited

| File                                                            | Change                                  |
|-----------------------------------------------------------------|-----------------------------------------|
| `src/renderer/scene/destruction/destruction-direction.md`       | NEW (this file).                        |
| `src/shared/scene-destruction-constants.ts`                     | Filled Phase 1 placeholders with        |
|                                                                 | concrete designer values + added new    |
|                                                                 | TINNITUS_AMPLITUDE_REDUCED_MOTION_DB.   |
| `src/renderer/scene/atmosphere-direction.md`                    | Appended §9 Sprint 4 destruction        |
|                                                                 | atmosphere notes. §1-§8 unchanged.      |

## Files designer did NOT touch (Phase 2B collision-safety)

- `src/renderer/scene/destruction/*.ts` (all 9 placeholder bodies —
  kraken-faz0-1 + kraken-faz2-3 fill).
- `src/renderer/scene/destruction/chrome/*.ts` (4 chrome placeholder
  bodies — swift-expert + frontend-dev fill).
- `src/renderer/audio/destruction-audio.ts` — does not exist yet,
  kraken-faz0-1 creates.
- `src/renderer/i18n/strings.ts` — i18n-expert extends destruction
  subtree.
- `src/renderer/styles/destruction*.css` — does not exist yet,
  kraken-faz2-3 creates as needed for toast/icon/bleed surfaces.
- `src/preload/index.ts` — Sprint 4 Phase 1 already added
  `window.api.getUsername()` bridge.
- `src/main/ipc.ts` — Sprint 4 Phase 1 already added
  `os:get-username` handler.

---

*End of Phase 2A designer pass. See atmosphere-direction.md §9 for
the cross-cutting destruction atmosphere addendum.*

---

# Sprint 5 Phase 2A extension — Faz 4-7

> Designer note. Authored 2026-05-21 by designer agent (Sprint 5 Phase 2A
> SOLO) for the Sprint 5 Phase 2B parallel implementers: `i18n-expert`
> (Lane 0, SEQUENCE-LOCK FIRST), `kraken-faz4-5`, `kraken-faz6-7`,
> `swift-expert`, `frontend-dev`. Sprint 4 §1-§9 above is the prerequisite
> reading — DO NOT re-read Faz 0-3 specs from this section; reference them
> by line. Sprint 5 caps NEW content at 700-900L per Sprint 4 retro
> Lesson 6.
>
> Sprint 4 carried the player from cathartic violence (Faz 0) into named
> personal violence (Faz 3). Sprint 5 carries them from named violence
> into **named-and-irreversible** violence: the wipe, the format, the
> kernel panic, the bootloop. The arc is no longer "did I just die?" —
> the user has accepted the destruction. The arc is now **"is there
> anything left to save?"** — and the destruction's job is to keep
> answering **"no"** four different ways, each more terminal than the
> last. The apartment bleeds keep leaking, and the final bleed (#4 at
> ~48sn, 800ms — the longest of the entire sequence) shows the revolver
> at REST on the desk, primed for the Sprint 6 reveal.

---

## Table of contents (Sprint 5 extension)

- [§10 Decision philosophy — emotional arc Faz 4-7](#10-decision-philosophy--emotional-arc-faz-4-7)
- [§11 Faz 4 File Wipe Progress (21-30sn)](#11-faz-4-file-wipe-progress-21-30sn)
- [§12 Faz 5 Disk Format (30-37sn)](#12-faz-5-disk-format-30-37sn)
- [§13 Faz 6 Kernel Panic / BSOD (37-44sn)](#13-faz-6-kernel-panic--bsod-37-44sn)
- [§14 Faz 7 Bootloop (44-50sn)](#14-faz-7-bootloop-44-50sn)
- [§15 Audio mix Faz 4-7](#15-audio-mix-faz-4-7)
- [§16 prefers-reduced-motion matrix — Sprint 5 NEW surfaces only](#16-prefers-reduced-motion-matrix--sprint-5-new-surfaces-only)
- [§17 Lane scope assignment](#17-lane-scope-assignment)

---

## 10. Decision philosophy — emotional arc Faz 4-7

### The four-beat continuation

| Faz | Window | Player feels                                                       | Designer beat                            |
|----:|--------|--------------------------------------------------------------------|------------------------------------------|
|   4 | 21-30s | "Wait, the bar is going BACKWARDS?"                                | Time inversion. Hope inverts to dread.   |
|   5 | 30-37s | "There's no UI left. Just a counter that never finishes."          | Resignation. The system stops pretending.|
|   6 | 37-44s | "The OS itself just gave up."                                      | Capitulation. Multi-language collapse.   |
|   7 | 44-50s | "It can't even reboot. It's just looping."                         | Eternal damnation. Reboot as purgatory.  |

Sprint 4 attacked **ears → trust → frame → identity**. Sprint 5 attacks
**time → fidelity → language → recovery**:

- **Faz 4 attacks time.** The progress bar is supposed to fill up. This
  one empties. The ETA grows. The items-remaining counter goes UP, not
  down. The user's mental model of "progress" collapses inside an OS
  surface they have used 10,000 times.
- **Faz 5 attacks fidelity.** No chrome, no window, no buttons, no Cancel.
  Just a monospace ATTENTION banner and a sector counter ticking toward
  a number two-billion away. The system has stopped trying to render a
  user-facing surface — it is dumping its own logs to the foreground.
- **Faz 6 attacks language.** The kernel panic appears in FOUR languages
  simultaneously (TR / EN / RU / JP per PLAN §7 line 281). No one
  language wins. The user reads the one they understand FIRST, then
  registers the other three. Mac's hex-dump scrolls underneath; Win's
  QR code points to a real Microsoft URL. The system has stopped
  speaking a single user's language and has begun speaking ALL of them.
- **Faz 7 attacks recovery.** The reboot happens. The Apple loads. The
  bar fills to 40%. It freezes. ⊘ appears. The screen goes black.
  Apple loads again. 40%. Freeze. ⊘. Loop. Win does the same with the
  BIOS post screen and "No bootable device". The user sees that even
  the *escape route* is broken.

### Why not accelerate into climax?

Sprint 5 covers 29 seconds (Faz 4 + 5 + 6 + 7 = 9 + 7 + 7 + 6). A
shock-comedy structure would accelerate — faster cuts, louder beeps,
more visual density. Sprint 5 does the OPPOSITE: each faz is **slower**
than the last in terms of decision-making for the user.

- Faz 4 has the most UI (a full dialog with title, progress bar, ETA,
  items-remaining counter, file path readout, greyed Cancel). The user
  reads the dialog like any other progress dialog they've seen.
- Faz 5 strips the UI down to a counter and a banner.
- Faz 6 strips it further: just an alert text. The hex-dump on Mac and
  the QR PNG on Win are not interactive — they are ornament.
- Faz 7 strips it to almost nothing: a logo, a bar that doesn't fill,
  a ⊘ glyph, and a 3-second cycle that repeats until the user ESC-holds.

The visual density decreases over the four fazes; the **dread density**
increases. The room has been replaced by an OS, the OS has been replaced
by a counter, the counter has been replaced by an error, the error has
been replaced by a loop. Each replacement removes one more degree of
freedom from the user's mental model of "the computer".

### Bleed #4 is the narrative payoff

Sprint 4 established bleeds #1 (300ms doubt) and #2 (200ms
confirmation-without-resolution). Sprint 5 adds:

- **Bleed #3** at ~34sn (mid-Faz 5), 400ms, 5 visible flicker cycles —
  "the longest bleed yet; the user finally reads the table content
  clearly". The lobby snapshot is the SAME Faz 0 capture (darkened
  bulb, masa, revolver — unchanged from #1/#2).
- **Bleed #4** at ~48sn (mid-Faz 7), 800ms, the longest of the entire
  sequence. The lobby snapshot is **CHANGED** — the revolver is now
  resting on the desk, namlu pointed at the table (per PLAN §7 line
  288). This is the bleed that the Sprint 6 reveal will pay off: the
  revolver was being aimed in Faz 0; now it rests on the lobby desk
  visible through bleed #4. The user reads it as "the room is still
  there, the revolver is still there, the violence was always in the
  same room".

Bleeds #3 and #4 break the Sprint 4 4-second-into-faz cadence — #3 lands
4000ms into Faz 5 (which started at 30000ms; bleed at 34000ms is +4000ms,
SAME cadence), but #4 lands at 4000ms into Faz 7 (which started at
44000ms; bleed at 48000ms is +4000ms). The cadence holds, but the
DURATION accelerates — 300, 200, 400, 800ms — the bleeds are getting
longer as the destruction deepens. Reading: "the room is leaking back
more strongly the closer the user gets to the reveal".

### What Sprint 5 does NOT do

- **Sprint 5 does NOT reveal the joke.** That is still Sprint 6 Faz 8.
- **Sprint 5 does NOT touch the filesystem.** Every file path, sector
  number, hex byte, and panic-log line is a literal string render. No
  `fs.unlink`, no `process.exit`, no real OS panic invocation.
- **Sprint 5 does NOT show real Apple/MS assets.** Designer-fictional
  eaten-apple (reused from Sprint 4 mac-dialog) and four-square (reused
  from Sprint 4 win-dialog) SVG paths only. The QR PNG is REAL but
  contains a URL TEXT (`https://www.windows.com/stopcode`), not any
  Microsoft-owned IP.
- **Sprint 5 does NOT bundle proprietary fonts.** Helvetica Neue Light
  is referenced via `-apple-system, "Helvetica Neue"` font-family
  fallback — no .ttf/.woff bundled (C4 closure). Segoe UI same story
  (already bundled OFL Segoe UI Variable Sprint 0).

---

## 11. Faz 4 File Wipe Progress (21-30sn)

PLAN §7 lines 268-272. 9-second window. Designer brief: the player sees
a familiar OS progress dialog (Securely Erase on Mac, File Explorer
Copy on Win) — but every readout is regressing.

### Mac variant — Finder "Securely erase" sheet (designer-fictional)

**Modal container**
- `FAZ4_MAC_DIALOG_WIDTH_PX = 480` × `FAZ4_MAC_DIALOG_HEIGHT_PX = 220px`.
- Centered viewport horizontally; vertically positioned at 35% from
  top (Apple Finder sheets attach below the window title bar, not at
  vertical centre).
- Background `FAZ4_MAC_DIALOG_BG_COLOR = #ECECEC`.
- Foreground `FAZ4_MAC_DIALOG_FG_COLOR = #1D1D1F`.
- Rounded corners 12px (matches Sprint 4 §3 Mac dialog).
- Drop shadow `0 16px 48px rgba(0, 0, 0, 0.4)` — slightly heavier than
  Sprint 4 §3 because the sheet sits on top of a fullscreen takeover
  background, not just a blurred backdrop.

**Title bar (top, 24px)**
- Background continuous with modal.
- Title text "Securely erasing disk…" — 14px regular, system font
  `-apple-system`, left-inset 16px.
- NO close button (the user cannot dismiss).

**Progress bar (centred horizontally, 32px below title)**
- Width 80% of modal = 384px.
- Height 6px.
- Track `FAZ4_PROGRESS_BAR_TRACK_MAC = #D6D6D6`.
- Fill `FAZ4_PROGRESS_BAR_FG_MAC = #0096FF`.
- Rounded ends.
- Starts at `FAZ4_PROGRESS_INITIAL_PERCENT = 80%`.
- Every `FAZ4_PROGRESS_TICK_MS = 600ms` decrements by 1-3% (stochastic).
- Floor `FAZ4_PROGRESS_FLOOR_PERCENT = 12%`.

**Caption stack (below progress bar)**
- Line 1: "Items remaining: {N}" where N counts UP from
  `FAZ4_ITEMS_REMAINING_INITIAL = 1_847_293` (the counter visibly grows
  — the destruction is GAINING items to delete). Font 13px regular.
- Line 2: "Estimated time remaining: {ETA}" cycling through
  `FAZ4_ETA_GROWTH_STEPS` ("14 hours, 32 minutes" → "17 hours, 8 minutes"
  → "22 hours, 17 minutes" → "1 day, 14 hours" → "3 days, 8 hours" —
  each step shown for ~1.8s = 9000/5). Font 13px regular.
- Line 3: File-path readout inside a monospace `<pre>` block at
  `FAZ4_FILE_PATH_VIEWPORT_HEIGHT_PX = 64px` height. Renders the
  current "being erased" path scrolling at `FAZ4_FILE_PATH_SCROLL_HZ
  = 12Hz`. Reuses `FAKE_FILE_PATHS_MAC` (Sprint 4 SSOT); 18 templates
  cycle. Font 11px monospace `ui-monospace, "SF Mono", Menlo, monospace`.

**Cancel button (bottom-right, inset 16px)**
- 80px wide × 28px tall.
- Background `FAZ4_CANCEL_BUTTON_BG_COLOR = #A0A0A0` (visibly disabled).
- Foreground `#FFFFFF` (low contrast — reads as greyed).
- Text "Cancel" — 13px regular.
- Cursor: `not-allowed` on hover.
- `aria-disabled="true"`.

### Win variant — File Explorer Copy sheet (designer-fictional)

**Modal container**
- `FAZ4_WIN_DIALOG_WIDTH_PX = 520` × `FAZ4_WIN_DIALOG_HEIGHT_PX = 240px`.
- Centered viewport.
- Background `FAZ4_WIN_DIALOG_BG_COLOR = #FAFAFA`.
- Foreground `FAZ4_WIN_DIALOG_FG_COLOR = #1B1B1B`.
- Rounded corners 8px (Win11 spec — matches Sprint 4 §3).
- Win11 3-layer elevation shadow stack (same as Sprint 4 §3).

**Title bar (top, 32px)**
- Background continuous.
- Title text "File Explorer — Removing files…" — 14px bold (Win Explorer
  copy-dialog convention), font-family `'Segoe UI Variable', 'Segoe UI',
  sans-serif`, left-inset 16px.
- "More details" caret toggle right-inset 16px (decorative — no toggle
  behaviour).
- NO X button.

**Progress bar (centred horizontally, 48px below title)**
- Width 85% of modal = 442px.
- Height 4px (Win11 spec — thinner than Mac).
- Track `FAZ4_PROGRESS_BAR_TRACK_WIN = #E5E5E5`.
- Fill `FAZ4_PROGRESS_BAR_FG_WIN = #0078D4` (Win11 accent blue).
- Square ends (Win11 spec — Mac uses rounded; Win uses square).
- Same regression logic as Mac.

**Caption stack (below progress bar)**
- Line 1: "{N} items remaining" — symmetric with Mac but Win order.
- Line 2: "Estimated time remaining: {ETA}" — same ETA growth.
- Line 3: File-path readout via `FAKE_FILE_PATHS_WIN`. Font 12px
  monospace `'Cascadia Code', 'Consolas', monospace` (Sprint 4 Cascadia
  bundled).

**Cancel button (bottom-right, inset 24px — Win11 button spacing wider)**
- 96px × 32px.
- Background `FAZ4_CANCEL_BUTTON_BG_COLOR = #A0A0A0`.
- Foreground `#FFFFFF`.
- Text "Cancel" — 13px regular Segoe UI Variable.
- 4px rounded corners (Win11 button spec).
- `aria-disabled="true"`.

### Faz 4 reduced-motion notes

- Progress bar **holds steady at 80%** (no regression animation; the
  bar still reads as "in progress" but stops doing the inverted-progress
  trick).
- Items-remaining counter **holds at initial 1,847,293** (no growth).
- ETA caption **holds at first step** "14 hours, 32 minutes" (no
  cycling through the growth steps).
- File-path readout **holds at single static line** (no scroll;
  `aria-live="polite"` gated OFF so screen readers don't flood).
- Cancel button unchanged (greyed; non-interactive).

### Faz 4 apartment bleed: bleed #3 ownership note

Bleed #3 owner is `BLEED_3_OWNER = 'faz4-file-wipe'` (Phase 1 decree),
but the bleed *visually* fires inside Faz 5's window (34000ms = mid
Faz 5). Faz 4 schedules a `setTimeout(scheduleBleed3, 13000)` — 21000
(Faz 4 start) + 13000 = 34000ms = trigger. Faz 5 runner MUST NOT
schedule its own bleed; the SSOT decree forbids double-ownership.

---

## 12. Faz 5 Disk Format (30-37sn)

PLAN §7 lines 274-278. 7-second window. Designer brief: no chrome, no
window, no buttons — just a monospace fullscreen takeover that reads
as "the OS has handed control to the disk firmware".

### Mac variant — fullscreen monospace dump

**Layer composition**
- Fullscreen `<div>` (100vw × 100vh) at z-index 10001 (above prior
  Faz 4 modal which exits at Faz 5 entry).
- Background `FAZ5_MAC_BG_COLOR = #000000` (pure black — the system
  has stopped pretending to render a UI).
- Foreground `FAZ5_MAC_FG_COLOR = #FFFFFF`.
- Font `ui-monospace, "SF Mono", Menlo, monospace`.
- Font size 14px (slightly larger than the 11-12px file-path readouts
  — this is the OS shouting, not the dialog whispering).
- Line height 1.6 (relaxed monospace — readable as logs).

**Content block (centred horizontally, top-anchored at 15% from top)**

```
ATTENTION: Low-level format in progress.
Do not power off your computer.

Wiping sector 8,492,103 / 2,000,000,000

[ S.M.A.R.T. error stream — see below ]
```

- "ATTENTION:" line in `FAZ5_MAC_SMART_AMBER_COLOR = #FFAA00`,
  font-weight 600 (bold).
- "Do not power off your computer." line in `FAZ5_MAC_FG_COLOR
  = #FFFFFF`, regular.
- 24px gap.
- "Wiping sector X / Y" line in white, regular. X is the sector counter
  ticking from `FAZ5_SECTOR_INITIAL = 8_492_103` at
  `FAZ5_SECTOR_INCREMENT_PER_SEC = 40` per second. After 7 seconds the
  counter has advanced ~280 — visibly ticking but mathematically still
  microscopic against `FAZ5_SECTOR_TOTAL = 2_000_000_000`. The visual
  reading: "this will take forever".

**S.M.A.R.T. error stream (below "Wiping sector" line, 24px gap)**

Every `FAZ5_SMART_ERROR_INTERVAL_MS = 900ms` one error line appends.
The cycle (per PLAN §7 line 277):
1. `Bad sector. Reallocating.` — white text, regular.
2. `S.M.A.R.T. error: drive failing.` — `FAZ5_MAC_SMART_AMBER_COLOR
   #FFAA00`, bold.
3. `WARN: SSD wear level 142%` — white text, regular.

Cycle repeats throughout Faz 5 (~7-8 lines visible at end).
Implementation: i18n keys per Lane 0 (`STRINGS.destruction.faz5.{mac,win}.smartError1`
through `smartError4`) allow translation of "Bad sector" / "Reallocating" /
"drive failing" / "wear level" into Russian + Turkish (the literal English
form survives as the third fallback if locale is unmapped).

### Win variant — BIOS-blue monospace dump

**Layer composition**
- Same fullscreen overlay, background `FAZ5_WIN_BG_COLOR = #0B0F8B`
  (BIOS POST blue — distinctive from Faz 6 BSOD `#0078D4`).
- Foreground `FAZ5_WIN_FG_COLOR = #FFFFFF`.
- Font `'Consolas', ui-monospace, monospace`.
- Font size 14px, line height 1.6.

**Content block (same vertical anchor, ASCII border box)**

```
╔══════════════════════════════════════════════════════════╗
║   ATTENTION: Low-level format in progress.               ║
║   Do not power off your computer.                        ║
╚══════════════════════════════════════════════════════════╝

Wiping sector 8,492,103 / 2,000,000,000

[ S.M.A.R.T. error stream — same content as Mac ]
```

- Border box characters `═ ║ ╔ ╗ ╚ ╝` in
  `FAZ5_WIN_BORDER_AMBER_COLOR = #FFAA00` (same amber as Mac's S.M.A.R.T.
  emphasis — cross-OS visual coherence).
- "ATTENTION:" line in white inside the box.
- Same sector counter, same S.M.A.R.T. error stream as Mac.

### Faz 5 reduced-motion notes

- Sector counter **holds at initial 8,492,103** (no increment).
- S.M.A.R.T. error stream **holds at single static line** (Bad sector.
  Reallocating.) — `aria-live="polite"` gated OFF.
- Background, ATTENTION banner, "Do not power off" all unchanged
  (these are static — no gate needed).

---

## 13. Faz 6 Kernel Panic / BSOD (37-44sn)

PLAN §7 lines 280-283. 7-second window. Designer brief: the OS has
given up. Mac shows the 4-language kernel panic; Win shows the
familiar BSOD with sad face + QR code.

### Mac variant — kernel panic 4-language layout (PLAN §7 line 281)

**Layer composition**
- Fullscreen `<div>` at z-index 10002.
- Background `FAZ6_MAC_BG_COLOR = #1D1D1F` (Apple's real macOS panic
  background — neutral graphite, NOT pure black, NOT pure white).
- Foreground `FAZ6_MAC_FG_COLOR = #FFFFFF`.
- Font `-apple-system, "Helvetica Neue", sans-serif` weight
  `FAZ6_MAC_PANIC_FONT_WEIGHT = 300` (Light — Apple's real panic
  screen uses Helvetica Neue Light). NO bundle — system reference only.

**4-language headline block (centred horizontally, top-anchored at 30%)**

The headline is FOUR languages stacked vertically, centred horizontally.
Designer-mandated order:

```
You need to restart your computer.
コンピュータを再起動する必要があります。
Перезагрузите компьютер.
Bilgisayarınızı yeniden başlatın.
```

**Layout spec**:
- Font size `FAZ6_MAC_PANIC_FONT_SIZE_PX = 18px`.
- Inter-line vertical gap `FAZ6_MAC_PANIC_LINE_GAP_PX = 12px`.
- Each line CENTRED horizontally (not left-aligned — the panic addresses
  all four locales equally; left-alignment would prioritise one).
- Font-weight 300 across all 4 lines.
- All 4 lines visible simultaneously (this is the design — multi-language
  panic IS the visual).

**Language ordering rationale**:
1. **EN first** — the "default" Apple panic language; everyone has
   seen this in screenshots even if they don't speak English.
2. **JP second** — Apple's strong Japanese localisation; the
   double-byte glyphs visually disrupt the Latin-alphabet rhythm,
   reinforcing "this is not a normal error message".
3. **RU third** — Cyrillic. Continues the alphabet break. PLAN §7
   line 281 lists RU as part of the multilingual panic.
4. **TR last** — Latin alphabet returns but with diacritics
   (ş, ı). The "anchor home" position — Turkish-locale users see
   their own language last, which lands as "even YOU are not
   exempt from this".

**Runtime locale switching note (i18n-expert Lane 0 contract)**:
- EN line is ALWAYS the literal "You need to restart your computer."
  (presentation-string, not locale-switched).
- JP line is ALWAYS the literal Japanese (presentation-string).
- RU line is locale-switched: `STRINGS.destruction.faz6.mac.panicHeadlineRu`.
  If runtime locale is Russian, this is "Перезагрузите компьютер."; if
  runtime locale is Turkish, the same key still renders Russian
  (the panic stays multilingual regardless of UI language).
- TR line is locale-switched the same way: `STRINGS.destruction.faz6.mac.panicHeadlineTr`.

The runtime-locale switching of RU/TR is a hint to the Russian or
Turkish player that the game KNOWS their locale (the user picked
Russian or Turkish during onboarding; the panic confirms the system
read that choice). The EN+JP lines are the presentation-constant
visual that makes the panic READ as multilingual regardless of locale.

### Mac hex panic-log dump (below headline, scrolling)

**Layout**:
- Position: 80px below the 4-language headline block.
- Width 80% of viewport, centred.
- Height: viewport bottom-edge minus 32px inset.
- Background: transparent (sits on `FAZ6_MAC_BG_COLOR` panel).
- Font `ui-monospace, "SF Mono", Menlo, monospace` 12px, line height 1.3.
- Foreground: white at 0.7 opacity (visibly less prominent than the
  headline — the user reads the panic message FIRST).

**Content**: Synthetic hex-dump rows. Each row format:
```
0x00007fff8a1c2340  41 6c 6c 65 6e 64 73 e9 64 65 ad 0a c7 23 91 5c
```

- 16-byte rows. Address column at left, then 16 hex bytes space-
  separated.
- Scrolls upward continuously at `FAZ6_HEX_DUMP_LINE_HZ = 6Hz` (1 line
  every ~166ms). Reads as "the kernel is dumping memory pages to
  console".
- All bytes are randomly generated at module load (no real memory
  content). Address column increments by 16 per line.

### Win variant — Win11 BSOD (designer-fictional)

**Layer composition**
- Fullscreen `<div>` at z-index 10002.
- Background `FAZ6_WIN_BG_COLOR = #0078D4` (Win10/11 BSOD blue —
  matches Faz 1 Win dialog button family for cross-faz coherence).
- Foreground `FAZ6_WIN_FG_COLOR = #FFFFFF`.
- Font `system-ui, "Segoe UI", "Segoe UI Variable", sans-serif`
  (Sprint 0 bundled Segoe UI Variable OFL).
- Font-weight `FAZ6_WIN_BODY_FONT_WEIGHT = 300` (Light — Win11 BSOD
  uses Light weight for body).

**Sad face glyph (top, 20% from top, left-anchored 12% inset)**

```
:(
```

- Font size `FAZ6_WIN_FROWNY_FONT_SIZE_PX = 140px`.
- Bold (font-weight 600).
- Flickers at `FAZ6_FROWNY_FLICKER_HZ = 5Hz` via CSS @keyframes
  opacity 1 → 0.7 → 1.
- Reduced-motion gate: static opacity 1 (no flicker).

**Headline + body (right of sad face, vertical centre of headline
section)**
- Headline: "Your PC ran into a problem and needs to restart. We're
  just collecting some error info, and then we'll restart for you."
  — 28px font-weight 300, max-width 60% viewport, wraps freely.
- Body progress: "0% complete" — 18px font-weight 300, 32px below
  headline. PROGRESS PERCENT IS HARD-CODED 0 — the system has not
  even started recovering.

**QR PNG (bottom-left, inset 12% from left + 24% from bottom)**

- Dimensions `FAZ6_WIN_QR_DIMENSION_PX = 128 × 128px`.
- Content: REAL QR code encoding `https://www.windows.com/stopcode`
  (the Microsoft documentation URL; LEGITIMATE link, NOT MS-owned
  IP since it's a URL not a logo).
- Asset path: `src/renderer/assets/destruction/win-bsod-qr.png`
  (Lane D vendors during Phase 2B per Phase 1 handoff).
- `<img>` tag with `alt="QR code linking to Windows stop code reference"`.
- Caption below QR (10px Segoe UI Light): "For more information about
  this issue and possible fixes, visit https://www.windows.com/stopcode"

**Stop code (bottom-right, mirror of QR position)**

```
Stop code: CRITICAL_PROCESS_DIED
```

- 18px font-weight 400 (regular — more prominent than QR caption).
- Position: inset 12% from right + 24% from bottom.
- All-caps stop-code string is the only fully-rendered piece of code-
  family text in the BSOD.

### Faz 6 reduced-motion notes

- Mac hex panic-log dump **holds at first frame** (no scroll;
  `aria-live="off"` so screen readers don't try to read random hex).
- Win sad face `:(` **holds opacity 1** (no flicker).
- Win QR PNG is naturally static (no animation needed).
- Mac 4-language headline is naturally static.
- Win BSOD headline + body + stop code naturally static.
- BSOD beep audio fires regardless (audio is gated separately — see §15).

---

## 14. Faz 7 Bootloop (44-50sn)

PLAN §7 lines 285-288. 6-second window. Designer brief: the reboot
happens. It fails. It happens again. The user watches the system fail
to even die.

### Mac bootloop state diagram

The bootloop runs a **3-second cycle** that repeats twice through the
6-second Faz 7 window. Each cycle has three discrete 1-second states:

| State | Duration | Visual |
|-------|----------|--------|
| 1: apple-loading | 1.0s | Background `FAZ7_MAC_BG_COLOR #000000`. Eaten-apple SVG centred at `FAZ7_MAC_APPLE_DIMENSION_PX=72`. Progress bar below apple (200×4px). Bar ramps 0% → `FAZ7_MAC_PROGRESS_BAR_FILL_PCT=40%` over 800ms then HALTS for 200ms. Bar fill `#FFFFFF` on track `#3A3A3A`. |
| 2: frozen | 1.0s | Apple + bar rendered at 40%. Nothing animates. Per-cycle drift: bar lands in `FAZ7_PROGRESS_DRIFT_RANGE [38, 42]%` (telegraphs "different attempt, same failure pattern" rather than "the same frame repeats"). The screen FEELS hung. |
| 3: no-boot | 1.0s | Apple SVG fades to 0.3 opacity over 200ms. ⊘ "no entry" glyph fades in centred, replacing apple. Glyph: white circle ø crossed by diagonal stroke; `FAZ7_NO_ENTRY_DIAMETER_PX=96`, stroke `FAZ7_NO_ENTRY_STROKE_PX=4` white. Caption "No bootable OS found" below, 14px -apple-system Light. Hold 800ms, then black-cut to STATE 1 (cycle restart). |

Cycle repeats from STATE 1 every `FAZ7_CYCLE_MS=3000ms`.

**State machine implementation note**: Each STATE transition is
driven by `BOOTLOOP_CYCLE_TIMER_OWNER = 'faz7-bootloop'` setInterval
firing every `FAZ7_CYCLE_MS = 3000ms`. Within a cycle, the three
sub-states are driven by nested setTimeouts (state-1 → +1000ms
state-2 → +1000ms state-3 → +1000ms back to state-1).

### Win bootloop variant — BIOS POST + restart

Same 3-second cycle, different content per state:

| State | Visual                                                          |
|-------|-----------------------------------------------------------------|
| 1     | `FAZ7_WIN_BG_COLOR = #0B0F8B` BIOS-blue. White "American Megatrends Inc." top header. Designer-fictional motherboard model line. "Detecting drives..." text scrolls 3 lines. |
| 2     | Same screen FROZEN. Detection-line text stops mid-word.        |
| 3     | "No bootable device — Press F1 retry, F2 setup" caption       |
|       | (PLAN §7 line 287). Below: "Auto-restart in 3s..." countdown. |
|       | Black-cut to STATE 1 at 1000ms.                               |

**Win bootloop typography**:
- Font `'Consolas', ui-monospace, monospace` 14px (matches Faz 5 Win).
- Foreground `FAZ7_WIN_FG_COLOR = #FFFFFF`.

### Faz 7 Bleed #4 — revolver-on-table payoff (PLAN §7 line 288)

The Sprint 6 reveal's narrative payoff is staged HERE. Bleed #4 fires at
`APARTMENT_BLEED_4_TRIGGER_MS = 48000ms` (mid-Faz 7, 4000ms into the
window) for `APARTMENT_BLEED_4_DURATION_MS = 800ms` — the longest
single bleed in the entire destruction sequence.

**Composite frame spec**:
- Base layer: `SceneHandle.lobbySnapshotDataUrl` (the same Faz 0
  capture used by bleeds #1/#2/#3). The bulb is dark, the masa is
  visible, the room is in shadow.
- Overlay layer: a SEPARATE static PNG/Canvas2D composite of the
  revolver-positioned-on-desk frame. The revolver's silhouette is
  rendered at the same masa position as the lobbySnapshot's masa,
  ROTATED so the namlu (barrel) points toward the table surface (PLAN
  §7 line 288: "Revolver bu sefer farklı — namlusu masaya bakıyor").
- Mask blur: `APARTMENT_BLEED_4_MASK_BLUR_PX = 2px` Gaussian on the
  revolver-overlay so it composites with halation against the lobby
  snapshot. Reads as "leak" not "clean render".
- Opacity strobe: 12Hz pulse between `APARTMENT_BLEED_4_OPACITY_MIN
  = 0.4` and `APARTMENT_BLEED_4_OPACITY_MAX = 0.6` for 800ms = ~10
  visible flicker cycles.

**Implementation contract (Lane B kraken-faz6-7)**:
- The revolver-on-desk overlay is a SEPARATE asset — NOT the
  lobbySnapshot. It is composited ON TOP of the lobbySnapshot during
  the bleed window. Designer suggests a Canvas2D approach: at Faz 7
  entry, render once to a hidden `<canvas>`, then composite the
  canvas as `background-image: var(--bleed-overlay-url)` during the
  bleed setTimeout window.
- The revolver position MUST align with the masa center in the
  lobbySnapshot. Per Sprint 3 model-freeze spec, the masa sits at
  viewport (50%, 60%). The revolver overlay anchors there.

**Reduced-motion gate**:
- `APARTMENT_BLEED_4_REDUCED_MOTION_OPACITY = 0.6` — single static
  hold for the full 800ms duration (the user with reduced-motion
  preference STILL sees the revolver-on-desk composite at full
  legibility; the strobe is what gets disabled, not the content).
- This is intentional: bleed #4 is the narrative payoff bleed. Hiding
  it under reduced-motion would deny motion-sensitive users the
  Sprint 6 reveal setup.

### Faz 7 reduced-motion notes

- Mac bootloop: bypass the cycle entirely; hold STATE 3 (⊘ + "No
  bootable OS found" caption) for the full 6-second Faz 7 window.
- Win bootloop: bypass the cycle; hold "No bootable device — Press F1
  retry, F2 setup" caption for the full 6 seconds.
- Bleed #4: per above — 0.6 opacity static hold for 800ms (no strobe).
- Electrical-tick audio is gated separately (silenced under reduced-
  motion; see §15).

---

## 15. Audio mix Faz 4-7

Sprint 4 §7 covered Faz 0-3 audio (tinnitus + low-pass + native chord +
toast cadence + bleed flickers). Sprint 5 adds FOUR new audio handles
plus the Faz 5 60Hz electrical buzz. The low-pass filter (700Hz cutoff)
established in Sprint 4 §7 REMAINS ACTIVE throughout Faz 4-7 — every
new audio surface below sits underneath the global filter.

### Audio surface summary (Sprint 5 additions)

| Surface              | Faz    | Onset                  | Duration               | Owner constant                    |
|----------------------|--------|------------------------|------------------------|-----------------------------------|
| HDD-grind            | 4      | Faz 4 entry (21000ms)  | 9000ms sustain         | `HDD_GRIND_AUDIO_OWNER`           |
| Fan-overdrive        | 4-6    | Faz 4 entry (21000ms)  | 23000ms sustain (4-6)  | `FAN_OVERDRIVE_AUDIO_OWNER`       |
| 60Hz electrical buzz | 5      | Faz 5 entry (30000ms)  | 7000ms sustain         | `ELECTRICAL_BUZZ_AUDIO_OWNER`     |
| BSOD beep            | 6      | Faz 6 entry (37000ms)  | 200ms ADSR             | `BSOD_BEEP_AUDIO_OWNER`           |
| Electrical-tick      | 7      | Faz 7 entry (44000ms)  | 6000ms loop at 0.5Hz   | `ELECTRICAL_TICK_AUDIO_OWNER`     |

### HDD-grind — brown noise band-pass + LFO amp punches

**Synthesis**:
- BufferSource: brown noise (Web Audio: `OfflineAudioContext` rendered
  brown noise buffer, or runtime AudioBufferSourceNode loop of a
  pre-computed brown-noise sample).
- BiquadFilterNode 1: bandpass, center 500Hz (midpoint of 200-800Hz
  band-pass range), Q=2.0.
- BiquadFilterNode 2: bandpass, center 500Hz (cascaded for steeper slope).
- GainNode: base gain 0.4 (linear).
- LFO modulation: OscillatorNode at 2Hz square wave, connected to the
  GainNode's `gain` AudioParam with depth ±0.2. Result: gain swings
  between 0.2 and 0.6 at 2Hz — reads as the "physical grinding" of an
  HDD seeking a sector that doesn't exist.

**Envelope**:
- Attack: 200ms ramp from 0 to base gain (HDD-grind fades IN as Faz 4
  starts).
- Sustain: 8800ms at base gain (with LFO modulation throughout).
- Release: 0ms (the grind stops abruptly at Faz 5 entry — the disk
  "gives up").

### Fan-overdrive — pink noise high-pass

**Synthesis**:
- BufferSource: pink noise (-3dB/octave power spectrum).
- BiquadFilterNode: highpass, cutoff 1500Hz, Q=0.7.
- GainNode: ramps 0 → 0.8 over 4000ms then sustains.

**Envelope**:
- Attack: 0 → 0.8 over 4000ms (slow ramp during Faz 4).
- Sustain: held at 0.8 through Faz 5 + Faz 6 (the fans are at max
  RPM, locked).
- Release: 1500ms fade-out at Faz 7 entry (the system stops trying
  to cool itself — the cooling has failed).

The fan-overdrive is the LONGEST sustain in the entire destruction
sequence (23 seconds, spanning 3 fazes). It is the audio anchor that
tells the user "the hardware is dying" — the visual content changes
phase-to-phase but the audio insists "this is one continuous failure".

### 60Hz electrical buzz — Faz 5 ambient

**Synthesis**:
- OscillatorNode: sawtooth wave at `FAZ5_ELECTRICAL_BUZZ_HZ = 60Hz`.
- BiquadFilterNode: lowpass at 200Hz, Q=1.0 (rolls off the harsh
  sawtooth harmonics, leaving a felt-not-heard low-frequency rumble).
- GainNode: 0.15 linear (quiet — sits underneath the fan-overdrive and
  the global low-pass filtering of any other audio).

**Envelope**:
- Attack: 500ms fade-in at Faz 5 entry.
- Sustain: 5500ms at 0.15.
- Release: 1000ms fade-out at Faz 6 entry (the electrical hum dies
  with the kernel panic — the system has lost power to the buzz
  source).

### BSOD beep — square wave ADSR (single fire)

**Synthesis**:
- OscillatorNode: square wave at `FAZ6_BSOD_BEEP_HZ = 800Hz`.
- GainNode: ADSR envelope.

**Envelope** (per `FAZ6_BSOD_BEEP_*` constants):
- Attack `FAZ6_BSOD_BEEP_ATTACK_MS = 5ms` (effectively instant — PC
  beep is a hardware "click on").
- Decay `FAZ6_BSOD_BEEP_DECAY_MS = 0ms` (no decay — beep stays at peak).
- Sustain `FAZ6_BSOD_BEEP_SUSTAIN_LEVEL = 1.0` (full level).
- Release `FAZ6_BSOD_BEEP_RELEASE_MS = 195ms` (fast taper at end).
- Total duration `FAZ6_BSOD_BEEP_MS = 200ms` (sum of A+D+S+R sustain
  window).

**Trigger**: Once at Faz 6 entry (37000ms). NO loop. The single beep
is the "the BIOS got the panic signal" cue.

### Electrical-tick — low-pass filtered click at 0.5Hz

**Synthesis**:
- BufferSource: short impulse buffer (1ms unit impulse).
- BiquadFilterNode: lowpass at 800Hz, Q=2.0 (rolls off the click's
  high-frequency content, leaving a damped "tick" rather than a
  sharp pop).
- GainNode: 0.3 per tick.
- Trigger interval: `FAZ7_ELECTRICAL_TICK_HZ = 0.5Hz` = 1 tick per
  2 seconds. Over the 6-second Faz 7 window: 3 ticks total.

**Envelope**: Per-tick attack 1ms, decay 80ms (no sustain, no release).
The tick reads as "the dead system is still drawing trickle current
and twitching" (per §10 philosophy).

### Reduced-motion audio gates (Sprint 5 NEW)

| Surface             | Default                   | Reduced-motion behaviour                              |
|---------------------|---------------------------|-------------------------------------------------------|
| HDD-grind           | base gain 0.4 + 2Hz LFO   | Reduce base gain to 0.2 (-6dB); LFO unchanged         |
| Fan-overdrive       | sustained 0.8             | Reduce sustained gain to 0.4 (-6dB)                   |
| 60Hz electrical buzz| 0.15                      | Reduce to 0.075 (-6dB); pure tone is harmless         |
| BSOD beep           | full 200ms square wave    | Reduce gain to 0.5 (-6dB); duration unchanged         |
| Electrical-tick     | per-tick 0.3              | **SILENCED entirely** (the tick is decorative; the   |
|                     |                           |  silence reads as "even the dead-system click is gone")|

The pattern: audio amplitude surfaces drop -6dB under reduced-motion
(same convention as Sprint 4 tinnitus -12dB → -18dB). The
electrical-tick is the ONE Sprint 5 audio surface that gets fully
silenced, because the tick is purely atmospheric — silencing it does
not remove information from the destruction.

---

## 16. prefers-reduced-motion matrix — Sprint 5 NEW surfaces only

Sprint 4 §8 (lines 943-967 of this document) enumerates 22 Faz 0-3
surfaces. Sprint 5 ADDS the following 15 new surfaces below — Faz 0-3
carry-overs reference Sprint 4 §8 by line number. **DO NOT
DUPLICATE** the Sprint 4 surfaces here; the lane teams consult Sprint
4 §8 for any Faz 0-3 references they need.

### Sprint 5 NEW surfaces matrix

| #  | Surface                                | OS      | Default behaviour                       | Reduced-motion behaviour                            | A11y role               | ARIA                                | Owner             |
|----|----------------------------------------|---------|-----------------------------------------|-----------------------------------------------------|-------------------------|-------------------------------------|-------------------|
| 23 | Faz 4 progress dialog regression       | mac+win | Bar decrements 80% → 12% (1-3% per 600ms tick) | Hold steady at 80% (no decrement)            | dialog                  | `role=dialog aria-busy=true`        | kraken-faz4-5 (A) |
| 24 | Faz 4 Cancel button (greyed)           | mac+win | Static greyed pill, cursor not-allowed  | Static (unchanged — already gated)                  | button                  | `role=button aria-disabled=true`    | swift / frontend  |
| 25 | Faz 4 ETA growth caption               | mac+win | Cycles 5 growth steps over 9000ms       | Hold first step "14 hours, 32 minutes"              | text                    | `role=status`                       | kraken-faz4-5 (A) |
| 26 | Faz 4 items-remaining counter          | mac+win | Counter grows from 1,847,293            | Hold initial count                                  | text                    | `role=status`                       | kraken-faz4-5 (A) |
| 27 | Faz 4 file-path readout scroll         | mac+win | 12Hz scroll through 18-template cycle   | Hold single static path; `aria-live=off`            | text                    | `role=log aria-live=polite (gated)` | kraken-faz4-5 (A) |
| 28 | Faz 5 disk-format fullscreen takeover  | mac+win | Sector counter ticks, S.M.A.R.T. stream | Sector counter holds, stream holds at first line    | application             | `role=application`                  | kraken-faz4-5 (A) |
| 29 | Faz 5 S.M.A.R.T. error stream          | mac+win | One error line every 900ms              | Hold single static error line                       | log                     | `role=log aria-live=polite (gated)` | kraken-faz4-5 (A) |
| 30 | Faz 6 Mac kernel panic 4-language      | mac     | Static 4-language stack (no animation)  | Unchanged (already static — no gate needed)         | alert                   | `role=alert`                        | swift-expert (C)  |
| 31 | Faz 6 Mac hex panic-log dump scroll    | mac     | 6Hz line-scroll upward                  | Hold at first frame; `aria-live=off`                | text                    | `role=log aria-live=off (gated)`    | swift-expert (C)  |
| 32 | Faz 6 Win BSOD chrome (sad face etc.)  | win     | Static layout                           | Unchanged (already static)                          | alert                   | `role=alert`                        | frontend-dev (D)  |
| 33 | Faz 6 Win sad-face `:(` flicker        | win     | 5Hz opacity flicker 1 → 0.7 → 1         | Static opacity 1 (no flicker)                       | img                     | `aria-hidden=true`                  | frontend-dev (D)  |
| 34 | Faz 6 Win QR PNG (static IMG)          | win     | Static `<img>` element                  | Unchanged (already static)                          | img                     | `alt='QR code linking to Windows stop code reference'` | frontend-dev (D) |
| 35 | Faz 7 Mac bootloop 3sn cycle           | mac     | Cycles STATE 1 → 2 → 3 every 3000ms     | Bypass cycle; hold STATE 3 (⊘ + caption) entire 6s  | application             | `role=application`                  | swift-expert (C)  |
| 36 | Faz 7 Win BIOS bootloop 3sn cycle      | win     | Cycles BIOS post → freeze → caption     | Bypass cycle; hold "No bootable device" entire 6s   | application             | `role=application`                  | frontend-dev (D)  |
| 37 | Faz 7 bleed #4 revolver-on-table       | mac+win | 12Hz opacity strobe 0.4 → 0.6 for 800ms | Static 0.6 opacity hold for 800ms (no strobe)       | img                     | `aria-hidden=true`                  | kraken-faz6-7 (B) |

**Total Sprint 5 NEW surfaces audited: 15.**
**Surfaces with active reduced-motion alternative: 11.**
**Surfaces unchanged under reduced-motion (already static): 4.**

### Cumulative matrix totals (Sprint 4 + Sprint 5)

| Total | Count |
|-------|-------|
| Sprint 4 surfaces audited (§8 lines 943-967 of this document) | 22 |
| Sprint 5 surfaces audited (this section) | 15 |
| **Combined cumulative total** | **37** |

### Phase 3 verification grep (Sprint 5 additive)

Phase 3 qa-engineer extends the Sprint 4 grep with Sprint 5 file
coverage:

```bash
grep -rn "prefers-reduced-motion" src/renderer/scene/destruction/
grep -rn "PREFERS_REDUCED_MOTION_QUERY" src/renderer/scene/destruction/
grep -rn "@media (prefers-reduced-motion: reduce)" src/renderer/styles/destruction*.css
```

Expected counts after Sprint 5: ≥ 32 distinct file:line occurrences
covering Sprint 4's 21 gated surfaces + Sprint 5's 11 gated surfaces
(unchanged "already static" surfaces do not need a CSS rule). If the
count is < 32, a gate is missing — identify which matrix row has no
corresponding grep hit and route back to the owning lane.

---

## 17. Lane scope assignment

Sprint 5 has 5 lanes (Lane 0 + 4 parallel lanes A/B/C/D). This section
enumerates which design decisions are MANDATED by this document (the
SSOT) versus which are LANE IMPLEMENTATION CHOICE (the lane decides at
implementation time). Phase 2B lanes consult this section to know
what they can and cannot deviate from.

### Lane 0 (i18n-expert) — SEQUENCE-LOCK FIRST

**Design-mandated** (this SSOT enforces):
- 4-language Mac kernel panic block ordering: EN → JP → RU → TR (§13).
- EN + JP lines are presentation-constants (literal strings, NOT
  locale-switched).
- RU + TR lines are locale-switched via `STRINGS.destruction.faz6.mac.panicHeadline{Ru,Tr}`.
- Faz 5 S.M.A.R.T. error lines have RU + TR translations
  (`STRINGS.destruction.faz5.{mac,win}.smartError1` through `smartError4`).
- Faz 4 progress dialog title strings (Mac "Securely erasing disk…",
  Win "File Explorer — Removing files…") and Cancel button label
  per locale.

**Lane implementation choice**:
- Exact translation wording within each locale (style/register choices).
- Whether to expose stop-code "CRITICAL_PROCESS_DIED" as an i18n key
  or hardcode (designer suggestion: hardcode — stop codes are
  English-language convention, not user-facing copy).

### Lane A (kraken-faz4-5)

**Design-mandated**:
- Faz 4 Mac/Win modal dimensions, progress bar colors, ETA growth
  step sequence (§11).
- Faz 5 monospace fullscreen layout, ASCII border box (Win),
  S.M.A.R.T. error cycle order (§12).
- HDD-grind synth spec (§15): brown noise + dual band-pass + 2Hz LFO.
- Fan-overdrive synth spec (§15): pink noise + high-pass + 4000ms ramp.
- 60Hz electrical buzz spec (§15): sawtooth + low-pass at 200Hz.
- Bleed #3 scheduling: `setTimeout(scheduleBleed3, 13000)` from Faz 4
  entry (= bleed visible at 34000ms = mid-Faz 5) — Faz 5 runner MUST
  NOT also schedule.

**Lane implementation choice**:
- The exact brown-noise / pink-noise buffer generation method (offline
  render vs runtime AudioBufferSourceNode loop).
- Sector counter increment timing precision (RAF vs setInterval).

### Lane B (kraken-faz6-7)

**Design-mandated**:
- Faz 6 OS branching (Mac kernel panic vs Win BSOD per `getOS()` cache).
- BSOD beep synth spec (§15): 800Hz square + 5/0/1/195 ADSR.
- Electrical-tick synth spec (§15): low-pass click at 0.5Hz.
- Faz 7 bootloop 3-state cycle structure (§14): apple-loading →
  frozen → no-boot.
- Bleed #4 spec (§14 + §15): 800ms, opacity strobe 0.4-0.6, revolver-
  on-desk composite over lobbySnapshot, 2px mask blur.
- Bleed #4 reduced-motion hold at 0.6 opacity (NOT 0 — bleed #4 is
  the narrative payoff and must remain legible to motion-sensitive
  users).

**Lane implementation choice**:
- Hex-dump random byte generation algorithm (seeded vs Math.random).
- Whether the Mac bootloop progress-bar drift is per-cycle uniformly
  random in [38, 42] or a deterministic sequence (designer suggestion:
  random per cycle).

### Lane C (swift-expert)

**Design-mandated**:
- Mac kernel panic 4-language headline layout (§13): centred,
  18px Light, 12px inter-line gap.
- Mac hex panic-log dump position (80px below headline) + 6Hz
  scroll rate.
- Mac progress-dialog Finder-sheet attachment style (positioned
  at viewport 35% top, NOT vertical centre).
- Mac bootloop eaten-apple SVG dimension (`FAZ7_MAC_APPLE_DIMENSION_PX
  = 72`) — reuses Sprint 4 mac-dialog SVG path data.

**Lane implementation choice**:
- Exact apple SVG path data (already authored by Sprint 4 designer
  pass; reuse intact).
- Eaten-apple SVG fill opacity during state-3 fade (designer
  suggestion: 0.3, but lane may pick 0.2-0.4 for visual reading).

### Lane D (frontend-dev)

**Design-mandated**:
- Win BSOD background `#0078D4`, sad face position (top, 20% from top,
  12% left inset), font sizes per §13.
- QR PNG dimensions `128 × 128px`, alt text, caption text.
- Win bootloop "American Megatrends Inc." top header, "Detecting
  drives..." text scroll content.
- Win progress-dialog Cancel button greyed at `#A0A0A0`.

**Lane implementation choice**:
- Win sad-face `:(` flicker implementation (CSS @keyframes vs
  JS-driven — designer suggestion: CSS for declarative gating).
- QR PNG generation tool (any standard QR encoder; the asset is
  static and bundled at `src/renderer/assets/destruction/win-bsod-qr.png`).
- Win bootloop "Auto-restart in 3s..." countdown text styling (this
  is a designer-mandated CONTENT but the visual styling — font size,
  weight — is lane choice within the Consolas 14px family).

### Cross-lane invariants

These hold across ALL lanes and Phase 3 qa-engineer scans for them:

1. **No real Apple/MS assets** — every SVG is designer-fictional. Phase
   3 grep: `grep -rn "Apple\|Microsoft" src/renderer/scene/destruction/`
   should return ONLY comment references, never asset paths.
2. **No file system writes** — Phase 3 grep: `grep -rn "fs\." src/renderer/scene/destruction/`
   should return zero results (NO `fs.unlink`, no `fs.writeFile`, no
   real disk I/O).
3. **No bundled proprietary fonts** — Phase 3 grep:
   `grep -rn "@font-face" src/renderer/styles/destruction*.css` should
   only show Cascadia Code + Segoe UI Variable (Sprint 0 OFL bundles).
4. **Owner decree compliance** — every shared resource (timer, audio
   node, scheduled bleed) is set up by exactly ONE lane's runner. Phase
   3 scans `BLEED_3_OWNER` etc. for double-callers.
5. **Reduced-motion gates** — every animated surface from §16 has the
   gate; Phase 3 grep returns ≥ 32 distinct gate hits.

---

*End of Sprint 5 Phase 2A designer pass. Sprint 5 §10-§17 are
additive to Sprint 4 §1-§9. The combined document is the SSOT for
the entire Faz 0-7 destruction sequence; Sprint 6 will add §18+ for
the Faz 8 reveal. Questions on Sprint 5 destruction decisions should
copy the relevant section into the conversation. Sprint 5 Phase 5
retro should revisit §10 emotional arc once the full Faz 4-7 chain
has been observed end-to-end during QA — the bleed cadence (300, 200,
400, 800ms) may need fine-tuning if the rhythm reads as accelerated
rather than incidental.*

## Files this Sprint 5 designer pass authored or edited
| File | Change |
|------|--------|
| `src/renderer/scene/destruction/destruction-direction.md` | Extended in place with §10-§17 (Path A). |
| `src/shared/scene-destruction-constants.ts` | Sprint 5 Phase 2A color + motion FILL appended. |

## Files designer did NOT touch (Sprint 5 Phase 2B collision-safety)

Per Sprint 5 Phase 2A scope: lane controllers (faz4-7 `.ts`), chrome modules (`chrome/mac-*.ts`, `chrome/win-*.ts`), `audio/destruction-audio.ts` synth factories, `i18n/strings.ts` destruction subtree, `styles/destruction.css`, and `assets/destruction/win-bsod-qr.png` — all left untouched for Phase 2B parallel lanes. `atmosphere-direction.md` not extended: Sprint 4 §9 fog + bulb state remains valid throughout Faz 4-7 (destruction is overlay-driven; lobby underneath unchanged).

---

# Sprint 6 Phase 2A extension — Faz 8 (reveal + son ekran)

> Designer note. Authored 2026-06-02 by designer agent (Sprint 6 Phase 2A
> SOLO) for the Sprint 6 Phase 2B parallel implementers: `i18n-expert`
> (Lane 0, SEQUENCE-LOCK FIRST), `kraken` (Lane A — reveal + son-ekran
> envelopes + audio), `frontend-dev` (Lane B — disclaimer + restart-hint
> + optional volumetric-smoke chrome + CSS). Sprint 4 §1-§9 and Sprint 5
> §10-§17 above are the prerequisite reading — DO NOT re-read Faz 0-7
> specs from this section; reference them by line. Sprint 6 caps NEW
> content at ≤ 600L per TH-S5-06 enforcement.
>
> Sprint 5 left the user inside the bootloop with bleed #4 (revolver-on-
> table, 800ms, 48sn) just visible. Sprint 6 carries them out of the
> destruction and into the room. The arc is **"the storm has ended; what
> remains?"**. The answer is: the room, the bulb, the revolver — and the
> joke. The destruction never touched the room; the room was always
> there; the system was the lie. Faz 8 is split into TWO discrete
> sub-phases (Phase 1 FSM precedent):
>
>   - **faz8-reveal (50-55sn)** — 5sn fade-back. The "after the storm"
>     beat: silence pivot, destruction drains, bulb settles, camera
>     dollies out, ambient returns. No text, no UI — just the room
>     coming back into focus.
>
>   - **faz8-son-ekran (55-65sn)** — 10sn closing tableau. The
>     revolver-on-table composite holds; door-closes off-screen; the
>     Cyrillic disclaimer fades in (primary "Это просто шутка." +
>     subtitle "Bu sadece bir şaka."); optional restart-hint mounts at
>     ~7sn.
>
> The Phase 1 kraken scaffold (commit `90899cc`) declared the FSM
> transitions, the OWNER decrees, and the timing skeleton. This Phase
> 2A pass FILLS the aesthetic knobs (color, typography, easing curves,
> ADSR + low-pass for door-close audio) and DECIDES four pending
> questions (D-1 restart-hint ship, D-2 volumetric-smoke ship, D-3 dolly
> easing, D-4 smoke source position).

---

## Table of contents (Sprint 6 extension)

- [§18 Faz 8 Reveal (50-55sn) — drain + recover](#18-faz-8-reveal-50-55sn--drain--recover)
- [§19 Faz 8 Son ekran (55-65sn) — closing tableau](#19-faz-8-son-ekran-55-65sn--closing-tableau)
- [§20 prefers-reduced-motion matrix — Sprint 6 NEW surfaces only](#20-prefers-reduced-motion-matrix--sprint-6-new-surfaces-only)

---

## 18. Faz 8 Reveal (50-55sn) — drain + recover

The reveal is the only beat in the 65sn sequence with zero diegetic
text and zero UI chrome. It is pure environment: the destruction
overlay drains, the bulb settles, the camera dollies out, the ambient
audio returns. Five concurrent envelopes share the 5-second window;
the silence pause at the start is the narrative pivot.

### The 5-second pacing budget

| Sub-window | Duration | Envelopes active |
|------------|----------|------------------|
| 0-1sn (silence pivot) | 1sn | bulb-pulse-norm (begun), camera-dolly (begun); destruction-overlay HOLDS at opacity 1; audio at -∞ |
| 1-4sn (drain) | 3sn | destruction-overlay opacity 1→0 (easing), ambient bed -∞ → -24dB (linear), bulb-pulse-norm continues, camera-dolly continues |
| 4-5sn (hold) | 1sn | destruction-overlay AT 0; ambient stable; bulb-pulse-norm continues; camera-dolly continues |

The silence pivot is the load-bearing 1 second. Sprint 5 ended with
the bootloop's BIOS-blue or pure-black state, the HDD-grind synth
still spinning, the AC-buzz still ticking. At t=50000ms (Faz 8
entry), all destruction audio is CUT TO -∞ AT ONCE (not faded —
abruptly silenced). The screen holds at full destruction overlay.
For 1 full second the user experiences: visual destruction + total
silence. That contradiction is the pivot — the visual still says
"destruction" but the audio has already left the destruction
soundscape. The next thing the user hears (ambient creep) and the
next thing they see (overlay draining) will be unified back into
the room.

### Destruction-overlay fade-out

| Knob | Value | Source |
|------|-------|--------|
| Opacity start | 1 (full destruction visible) | Sprint 5 end-state |
| Opacity end | 0 (transparent) | Faz 8 reveal end |
| Duration | 3000ms (= `FAZ8_REVEAL_FADE_DURATION_MS`) | Sub-window starts at +1000ms, ends at +4000ms |
| Easing | `FAZ8_REVEAL_FADE_EASING` = `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (ease-out-quad) | §18 designer choice |
| z-index | 10000 (destruction overlay) | Sprint 4 §6 stacking |

Designer rationale on the easing: Phase 1 JSDoc on
`FAZ8_REVEAL_FADE_DURATION_MS` originally said "linear opacity ramp;
designer choice — easing would read as stylised". Phase 2A
REVISES — the stylised easing IS what we want here. The reveal is
the most "scored" beat in the entire 65sn sequence (silence → fade
→ tableau), so a stylised curve is congruent with the deliberate
pacing. The Phase 1 JSDoc remains as archaeology but the
`FAZ8_REVEAL_FADE_EASING` constant is the authoritative spec.

The ease-out character (gentle deceleration) lets the destruction
"give way" — strong start (the storm leaving), tapering tail
(settling). Reads as "the destruction is RECEDING" rather than
"the screen reset" or "fade transition".

### Bulb pulse normalisation

The bulb has been on Sprint 5's destruction-amplitude flicker since
the bang (14Hz AC-buzz lock). Faz 8 reveal interpolates it back to
the Sprint 1 ambient breathing rate over the full 5-second window:

| Knob | Sprint 5 (destruction) | Sprint 1 / Faz 8 (resting) | Interpolation |
|------|------------------------|----------------------------|---------------|
| Pulse frequency | 14Hz (AC-buzz-locked) | 0.4Hz (= `FAZ8_BULB_PULSE_RESTING_HZ`) | Linear over 5sn |
| Pulse amplitude | ±35% intensity (destruction) | ±5% intensity (= `FAZ8_BULB_PULSE_RESTING_AMPLITUDE`) | Linear over 5sn |

The normalisation BEGINS at Faz 8 entry (t=0 of reveal, NOT after
the silence pause) so by t=1sn (silence end) the bulb is already
visibly slowing — the player who looks at the bulb during the
silence pause sees "something is settling" before anything else
changes. By son-ekran entry (t=5sn into reveal) the bulb is at
Sprint 1 resting rate.

### Camera dolly-out

| Knob | Value | Source |
|------|-------|--------|
| Pull-back magnitude | 10° yaw+pitch recovery (= `FAZ8_REVEAL_CAMERA_DOLLY_DEGREES`) | Phase 1 timing decree |
| Reference framing | Sprint 4 intimate desk framing (BANG_CAMERA_SHAKE_DEG=5 displacement carried) | Sprint 4 §2 |
| Target framing | Lobby room reveal (slightly higher, slightly further) | Faz 8 design |
| Duration | 5000ms (= full `FAZ8_REVEAL_DURATION_MS`) | Single envelope across full reveal |
| Easing | `FAZ8_REVEAL_DOLLY_EASING` = `cubic-bezier(0.65, 0, 0.35, 1)` (ease-in-out-quart) | §18 D-3 decision |

Designer rationale on D-3 (ease-in-out-quart): the dolly is the
only camera motion in the whole 65sn timeline that the user
explicitly READS as camera — every other camera surface is a shake
(Sprint 4 BANG_CAMERA_SHAKE) or a snap (Sprint 5 disk-format
takeover). Other curves considered:

- `ease-out-cubic` — rejected: too rushed at the start, would clash
  with the silence pivot's "deliberate calm".
- `ease-in-cubic` — rejected: too rushed at the end, would clash
  with the son-ekran's "hold the framing" requirement.
- `linear` — rejected: reads as automated, mechanical.
- `ease-in-out-quart` (D-3 PICKED) — symmetric, gentle in/out, the
  camera "decides" to dolly out (ease-in), accelerates through the
  middle, and "arrives" at the lobby framing (ease-out).

The dolly runs across the FULL 5-second reveal window including
the silence pause. The user who is looking at the bulb during the
silence pause also sees the framing slowly widening — the silence
is not "frozen", the world is moving, the audio just isn't
narrating it.

### Audio recovery — ambient bed -∞ → -24dB

| Knob | Value | Source |
|------|-------|--------|
| Start gain | -∞ dB (total silence after Sprint 5 cut) | Sprint 5 destruction-audio close |
| Target gain | -24dB FS (= `FAZ8_AUDIO_BED_BASELINE_GAIN_DB`) | §18 designer choice |
| Duration | 3000ms (= `FAZ8_REVEAL_AMBIENT_RAMP_MS`) | Sub-window starts at +1000ms (silence end), ends at +4000ms |
| Ramp shape | Linear gain ramp | Web Audio `linearRampToValueAtTime` — perceptually feels like "room creeping back" |

The ambient bed is the Sprint 1 lobby stack: bulb hum (60Hz +
harmonics, low) + radio static (AM noise) + faint Temnaya bayan
akordeonu sample. The Sprint 5 destruction-audio close cut the
master gate at Faz 7 exit; Faz 8 reveal does not "rewind" that
state — it constructs a fresh `AmbientRecoveryHandle` (Lane A,
owner = `AMBIENT_RECOVERY_AUDIO_OWNER` = `'faz8-reveal'`) that
ramps a new ambient bus from -∞ to -24dB.

-24dB is the "quiet but present" target. After 1sn of total
blackout silence, the user's ears have adjusted; the ambient
creep needs to feel like ROOM RETURNING, not music starting.
-24dB sits below conversation volume, above the noise floor —
"there is sound here again, but it is not pressing".

Note: PLAN §7 line 293 mentions "Radyo statik → Temnaya-tarzı
melodi başa sarmış gibi" (radio static → Temnaya-style melody as
if rewound). Sprint 6 scope ships ONLY the ambient bed creep —
the Temnaya rewind-rewind treatment is deferred to post-S6
(reveal jingle, per PLAN §7 line 301, also deferred per Phase 1
scope boundary).

---

## 19. Faz 8 Son ekran (55-65sn) — closing tableau

The son-ekran is the 10-second closing held-frame. The composition
is a wide-ish lobby framing (post-dolly-out) with the revolver on
the desk (Bleed #4 narrative payoff: in bleed #4 at 48sn the
revolver was glimpsed pointed AT the table; in son-ekran the
revolver is FULLY at rest on the table). Three discrete elements
stage on top of this framing: an off-screen door-close audio
accent, the Cyrillic disclaimer block, and (optional) the restart
hint.

### Held framing — revolver on the desk

| Element | Treatment |
|---------|-----------|
| Camera | Held at Faz 8 reveal end position (post-dolly, slightly higher + further than Sprint 4 intimate framing). No further camera motion during son-ekran. |
| Bulb | Sprint 1 ambient breathing (0.4Hz, ±5% intensity) — continues from reveal end |
| Revolver | At rest on desk, namlusu (barrel) touching desk surface — explicit narrative payoff of Bleed #4 |
| Ambient audio | -24dB bed sustained (bulb hum + radio static + faint Temnaya) |
| Apartment bleeds | NONE — bleeds were the destruction's "the room is leaking through". The destruction is over; the room is what is. No bleed needed. |

The composition stays static for 10 seconds. Within that 10 seconds
the three staged elements appear in sequence:

| t (within son-ekran) | Event |
|----------------------|-------|
| 0sn | Composition revealed (transition from reveal end). |
| 2sn (= `FAZ8_SON_EKRAN_DOOR_CLOSE_AT_MS`) | Off-screen door-close audio accent fires (single-shot). |
| 3sn (= `FAZ8_SON_EKRAN_DISCLAIMER_ENTER_MS`) | Disclaimer primary line begins fade-in. |
| 3.2sn (= 3sn + `FAZ8_DISCLAIMER_SECONDARY_STAGGER_MS`) | Disclaimer secondary line begins fade-in. |
| 4sn (= 3sn + `FAZ8_SON_EKRAN_DISCLAIMER_FADE_IN_MS`) | Disclaimer primary at full opacity 0.9. |
| 4.2sn | Disclaimer secondary at full opacity 0.75 (= 0.9 × 0.83). |
| 7sn (= `FAZ8_SON_EKRAN_RESTART_HINT_ENTER_MS`) | Restart hint begins fade-in (IF D-1 ships). |
| 7.5sn | Restart hint at opacity 0.4. |
| 10sn | Son-ekran exit (FSM returns to entry — director either exits or loops on R-key). |

### Off-screen door-close audio accent

The door-close is a single-fire procedural audio event (Sprint 4
Lesson 3 — no `.ogg`/`.wav` vendoring). Sub-bass thump with
aggressive low-pass to read as "muffled, off-stage, in another
room". Lane A constructs the `DoorCloseAccentHandle`; the synth
spec lives in the constants and is reproduced here for designer
intent:

| Synth knob | Value (constant) | Designer reasoning |
|------------|------------------|--------------------|
| ADSR attack | 5ms (= `FAZ8_DOOR_CLOSE_ATTACK_MS`) | Fast onset — real door-latch click is essentially instantaneous; 5ms avoids click artefact on the Web Audio gain ramp |
| ADSR decay | 40ms (= `FAZ8_DOOR_CLOSE_DECAY_MS`) | Short decay — the wood reverberates briefly before settling |
| ADSR sustain ratio | 0.8 (= `FAZ8_DOOR_CLOSE_SUSTAIN_RATIO`) | High sustain — wood-body resonance + apartment-hallway short reverb tail at 80% of peak |
| ADSR release | 200ms (= `FAZ8_DOOR_CLOSE_RELEASE_MS`) | Long release — the reverb tail decays smoothly; shorter clips, longer reads as music |
| Low-pass cutoff | 150Hz (= `FAZ8_DOOR_CLOSE_LOWPASS_HZ`) | Removes click character, leaves only LOW-FREQUENCY THUMP — sounds heard through a wall |
| Peak gain | 0.3 linear (≈-10dB FS) (= `FAZ8_DOOR_CLOSE_PEAK_GAIN`) | Clearly audible against -24dB ambient but not startling |
| Trigger time | 2000ms into son-ekran (= `FAZ8_SON_EKRAN_DOOR_CLOSE_AT_MS`) | Lands BEFORE the disclaimer fade-in so it reads as "something just settled" not "disclaimer triggered a sound" |

The door-close is a SINGLE non-looped fire. It is the only event
in son-ekran with a clean "this happened" character; everything
else fades in continuously. The single-shot character is the point
— it locates the user spatially in the lobby ("someone closed a
door, somewhere") without specifying a source.

### Cyrillic disclaimer block

The disclaimer is a centred two-line text block: Russian primary,
Turkish subtitle. The Russian line is the joke punchline; the
Turkish line is the gloss for non-Russian-readers. The visual
hierarchy MUST land the Russian first (the larger, bolder line).

| Element | Spec |
|---------|------|
| Primary text content | "Это просто шутка." (Russian, "It is just a joke."), via `STRINGS.destruction.faz8.disclaimerPrimary` |
| Primary font-family | `'Old Standard TT', 'PT Serif', Georgia, serif` (Sprint 0 OFL bundle stack) |
| Primary font-size | 64px (= `FAZ8_DISCLAIMER_PRIMARY_FONT_PX`) |
| Primary letter-spacing | -0.5px (= `FAZ8_DISCLAIMER_PRIMARY_LETTER_SPACING_PX`) |
| Primary font-weight | 400 (Regular — Old Standard TT does not ship a heavier weight in our bundle) |
| Primary opacity target | 0.9 (= `FAZ8_DISCLAIMER_OPACITY_MAX`) |
| Secondary text content | "Bu sadece bir şaka." (Turkish), via `STRINGS.destruction.faz8.disclaimerSecondary` |
| Secondary font-family | `'PT Serif', Georgia, serif` (PT Serif Regular, OFL) |
| Secondary font-size | 28px (= `FAZ8_DISCLAIMER_SECONDARY_FONT_PX`) |
| Secondary font-weight | 400 (Regular) |
| Secondary opacity target | ≈0.75 (cascaded: 0.9 × 0.83 — let Lane B set explicit `opacity: 0.75` on `.faz8-disclaimer__secondary` for clarity, not via inheritance) |
| Gap between lines | 24px (= `FAZ8_DISCLAIMER_GAP_PX`) margin-top on secondary |
| Color (both lines) | #7a6a4e (= `FAZ8_DISCLAIMER_COLOR`) — kirli kâğıt palette (PLAN §2 line 48; matches intro disclaimer Sprint 0) |
| Text-shadow (both) | `0 0 8px rgba(10, 9, 8, 0.4)` (= `FAZ8_DISCLAIMER_TEXT_SHADOW`) — soft warm-black halation |
| Alignment | Centred (block centred horizontally + vertically in viewport via flexbox; primary above secondary) |
| Fade-in duration | 1000ms (= `FAZ8_SON_EKRAN_DISCLAIMER_FADE_IN_MS`) |
| Fade-in easing | `FAZ8_DISCLAIMER_FADE_EASING` = `cubic-bezier(0.4, 0, 0.6, 1)` (ease-in-out-sine) |
| Secondary stagger after primary fade-in starts | 200ms (= `FAZ8_DISCLAIMER_SECONDARY_STAGGER_MS`) |
| z-index | 10100 (above destruction overlay 10000; below restart-hint 10110) |
| ARIA role | `role="status"` on container; `aria-live="polite"` on container so the disclaimer is announced once when it fades in |

Designer rationale (full JSDoc in `scene-destruction-constants.ts`
Faz 8 design FILL block):

- **Serif over sans.** Destruction phases used system sans-serifs
  (`-apple-system`, `Segoe UI Variable`, Consolas) — those are the
  OS voices. The room has always spoken in serif (intro disclaimer,
  procedural poster). The son-ekran disclaimer continues that
  convention: this is the ROOM speaking, finally.
- **Size + opacity hierarchy.** 28/64 = 0.44 ratio = "subordinate
  but legible"; 0.75/0.9 = 0.83 opacity ratio reinforces the same.
  TR reads as gloss on RU, not as a competing line.
- **#7a6a4e kirli-kâğıt closes the narrative loop.** Intro
  disclaimer used this color → 65sn destruction (system voices in
  their own palettes) → son-ekran returns to it. "The room was
  always there." Text-shadow rgba(10,9,8,0.4) = candlelight halation
  on old paper, congruent with the tungsten bulb.
- **200ms stagger = saccade + letter-recognition window.** The eye
  lands on "ШУТКА" before "şaka" arrives.

### Restart hint (D-1 — RECOMMENDED SHIP)

| Element | Spec |
|---------|------|
| Mount offset | 7000ms into son-ekran (= `FAZ8_SON_EKRAN_RESTART_HINT_ENTER_MS`) |
| Text content | "R = ЕЩЁ РАЗ · R = TEKRAR · R = restart" (RU · TR · EN, concatenated with middle-dot separator `FAZ8_RESTART_HINT_SEPARATOR`) |
| i18n keys | `STRINGS.destruction.faz8.restartHintRu`, `restartHintTr`, `restartHintEn` |
| Font-family | `'PT Serif', Georgia, serif` (same as disclaimer secondary — keeps typographic palette tight) |
| Font-size | 14px (= `FAZ8_RESTART_HINT_FONT_PX`) |
| Color | #7a6a4e (= `FAZ8_RESTART_HINT_COLOR`) — same as disclaimer |
| Opacity target | 0.4 (= `FAZ8_SON_EKRAN_RESTART_HINT_OPACITY`) |
| Position | Bottom of viewport, centred horizontally, 48px from edge (= `FAZ8_RESTART_HINT_BOTTOM_INSET_PX`) |
| Fade-in duration | 500ms (= `FAZ8_RESTART_HINT_FADE_IN_MS`) |
| Fade-in easing | `cubic-bezier(0.4, 0, 0.6, 1)` (matches disclaimer easing) |
| z-index | 10110 (above disclaimer 10100, above destruction overlay 10000) |
| ARIA | `role="status"`, `aria-live="off"` (the disclaimer already announced; the hint is decorative — screen-reader users get keyboard-shortcuts via the app shell instead) |

**D-1 decision: SHIP in Sprint 6.**

Rationale:

- **Low implementation cost.** Phase 1 already scaffolded the chrome
  module + R-key binding + FSM `requestRestart()` surface; only the
  CSS rules + i18n keys remain. Lane B + Lane 0 work in Phase 2B.
- **High UX value.** The 10sn son-ekran is a forced wait. Without a
  hint, the user with a keyboard either guesses (frustrating) or
  exits via window-close (anti-climactic). With a hint, the user has
  a clear and discoverable affordance to re-experience the sequence
  (which is exactly what some users will want after the joke lands).
- **Whisper register matches Sprint 7+ deferred UI buttons.** PLAN
  §7 line 302 specifies "ЕЩЁ РАЗ / TEKRAR + ВЫЙТИ / ÇIK" buttons in
  the post-S6 future. The Sprint 6 hint at opacity 0.4, font-size
  14px, bottom-centred at 48px inset is explicitly the "soft
  precursor" to those buttons — when buttons replace the hint, the
  hint disappears and the buttons land in the same visual region.
- **Kiosk safety closure.** Phase 1 wired the `requestRestart()`
  surface with explicit Risk S9 closure (no `app.quit` / no
  `BrowserWindow.close` / no IPC exit). Shipping the hint in Sprint
  6 lets Phase 3 QA validate the R-key restart loop end-to-end.

The middle-dot `·` separator (rather than `/`) is the typesetter's
convention for inline locale concatenation. Slash reads as
"either/or option" which is wrong — the three locales are the SAME
hint in three languages, not a choice.

### Volumetric smoke (D-2 — RECOMMENDED SHIP if CSS-only viable)

The PLAN §2 line 19 establishes "sigara dumanı" as part of the
room's atmosphere. Sprint 6 son-ekran can include a slow-rising
smoke column from the desk ashtray to reinforce the "the room is
still here, breathing" beat.

| Element | Spec |
|---------|------|
| Mount lifecycle | Active for the entire son-ekran (mount at son-ekran entry, dispose at exit) |
| Source position | `desk-ashtray` (= `FAZ8_VOLUMETRIC_SMOKE_SOURCE`) — column rises from masa front-right where the lobby ashtray asset sits in the procedural-poster snapshot |
| Rise loop duration | 6000ms (= `FAZ8_VOLUMETRIC_SMOKE_RISE_DURATION_MS`) — within the 5-8sn spec band |
| Peak opacity | 0.12 (= `FAZ8_VOLUMETRIC_SMOKE_OPACITY_MAX`) |
| Render mode | CSS-only @keyframes + radial-gradient + transform (= `FAZ8_VOLUMETRIC_SMOKE_MODE` = `'css'`) |
| z-index | 10050 (above destruction overlay 10000, below disclaimer 10100) |
| ARIA | `aria-hidden="true"` (decorative atmospheric element) |

**D-2 decision: SHIP in Sprint 6 with `FAZ8_VOLUMETRIC_SMOKE_MODE
= 'css'` (CSS-only render).**

Rationale:

- **CSS-only is viable.** A single absolutely-positioned `<div>`
  with `radial-gradient(ellipse at bottom, rgba(255,255,250,0.12),
  transparent 70%)` + a CSS @keyframes animation translating it
  upward + slight scale + opacity envelope is a single GPU
  composite layer. On M1 60fps this is sub-1ms per frame — well
  within budget.
- **Atmospheric reinforcement.** PLAN §2 line 19 lists "sigara
  dumanı" alongside the bulb and the radio as the room's
  signature atmosphere. The destruction phases stripped this; the
  son-ekran restores it. The smoke is the visible-breath of the
  room: the bulb is light, the radio is sound, the smoke is air.
- **Designer fallback.** If Phase 2B Lane B reports M1 perf
  regression (frame-time > 16.6ms with smoke mounted), flip
  `FAZ8_VOLUMETRIC_SMOKE_MODE` to `'none'` — the handle then
  short-circuits and the son-ekran ships without smoke. The fade-
  back option is to defer to canvas2d post-S6 (which would be a
  particle system, more expensive but more realistic).

Canvas2D rejected for Sprint 6 because: (a) it adds a render loop
that runs for the full 10sn son-ekran, (b) it requires a particle
allocator + texture preload that doesn't exist elsewhere in the
destruction subsystem, and (c) the CSS-only version delivers 80%
of the visual read at 10% of the perf cost.

### D-3 decision (camera dolly easing) — RECAPPED

The dolly easing decision lives in §18 above. Recapping: **D-3
PICKED ease-in-out-quart** (`cubic-bezier(0.65, 0, 0.35, 1)`, =
`FAZ8_REVEAL_DOLLY_EASING`). See §18 "Camera dolly-out" for the
full rationale and the alternatives considered.

### D-4 decision (smoke source position) — RECAPPED

The smoke source decision lives in the "Volumetric smoke" table
above. Recapping: **D-4 PICKED `desk-ashtray`** (= `FAZ8_VOLUMETRIC_SMOKE_SOURCE`)
because anchoring the smoke to a diegetic source visible in the
lobby snapshot reads as "cigarette smoke rising from the ashtray
on the desk" — whereas `off-screen-right` would read as
"atmospheric VFX" with no diegetic source.

---

## 20. prefers-reduced-motion matrix — Sprint 6 NEW surfaces only

Sprint 4 §8 (lines 943-967) audited 22 Faz 0-3 surfaces. Sprint 5
§16 (lines 2009-2025) audited 15 Faz 4-7 surfaces. Sprint 6 ADDS
the following 6 new Faz 8 surfaces below. **DO NOT DUPLICATE** the
Sprint 4 + Sprint 5 surfaces here; lane teams consult Sprint 4 §8
and Sprint 5 §16 by line number for any Faz 0-7 references.

### Sprint 6 NEW surfaces matrix

| #  | Surface                                  | OS      | Default behaviour                          | Reduced-motion behaviour                            | A11y role               | ARIA                                | Owner            |
|----|------------------------------------------|---------|--------------------------------------------|-----------------------------------------------------|-------------------------|-------------------------------------|------------------|
| 38 | Faz 8 destruction-overlay fade-out       | mac+win | Opacity 1→0 over 3sn with ease-out-quad   | Instant jump to opacity 0 at reveal entry           | n/a (overlay)           | n/a                                 | kraken (A)       |
| 39 | Faz 8 camera dolly-out                   | mac+win | 10° pull-back over 5sn with ease-in-out-quart | Instant jump to dolly-end position at reveal entry  | n/a (camera)            | n/a                                 | kraken (A)       |
| 40 | Faz 8 ambient bed gain ramp              | mac+win | Linear -∞ → -24dB over 3sn                 | Instant jump to -24dB at silence-pivot end (t=1sn)   | n/a (audio)             | n/a                                 | kraken (A)       |
| 41 | Faz 8 disclaimer fade-in (primary + secondary) | mac+win | Linear opacity 0 → 0.9 / 0.75 over 1sn (200ms stagger) | Static opacity 0.9 / 0.75 from disclaimer-enter at t=3sn | status                  | `role=status aria-live=polite`      | frontend-dev (B) |
| 42 | Faz 8 restart-hint fade-in               | mac+win | Linear opacity 0 → 0.4 over 500ms          | Static opacity 0.4 from hint-enter at t=7sn         | status                  | `role=status aria-live=off`         | frontend-dev (B) |
| 43 | Faz 8 volumetric smoke rise loop (CSS)   | mac+win | CSS @keyframes translateY + scale + opacity loop (6sn cycle) | Static low-opacity radial gradient (no transform animation) | n/a (decorative)        | `aria-hidden=true`                  | frontend-dev (B) |

**Total Sprint 6 NEW surfaces audited: 6.**
**Surfaces with active reduced-motion alternative: 6.**
**Surfaces unchanged under reduced-motion (already static): 0.**

### Cumulative matrix totals (Sprint 4 + Sprint 5 + Sprint 6)

| Total | Count |
|-------|-------|
| Sprint 4 surfaces audited (§8 lines 943-967) | 22 |
| Sprint 5 surfaces audited (§16 lines 2009-2025) | 15 |
| Sprint 6 surfaces audited (this section) | 6 |
| **Combined cumulative total** | **43** |

### Reduced-motion design notes for Faz 8

Faz 8 reduced-motion is more radical than Sprint 4/5: the reveal
overlay/camera/audio-bed envelopes are pure transit between Sprint
5 end-state and son-ekran start-state — there is no in-motion
chrome to keep legible. All three SNAP to end-state at reveal entry
(t=0sn). The user experiences: bootloop → instant jump to lobby (5sn
quiet hold) → instant jump to disclaimer + hint (mount timing
preserved at t=3sn / t=7sn; opacity is static). Audio events (door-
close, bulb 0.4Hz breathing) are NOT gated — only visual motion is.
Smoke under reduced-motion holds as a static low-opacity radial
gradient (atmospheric haze preserved without rising-column motion).
If D-2 drops to `'none'`, surface #43 disappears from the matrix.

### Phase 3 verification grep (Sprint 6 additive)

Phase 3 qa-engineer extends the Sprint 4 + Sprint 5 greps with
Sprint 6 file coverage:

```bash
grep -rn "prefers-reduced-motion" src/renderer/scene/destruction/chrome/faz8-*.ts
grep -rn "PREFERS_REDUCED_MOTION_QUERY" src/renderer/scene/destruction/faz8-*.ts
grep -rn "@media (prefers-reduced-motion: reduce)" src/renderer/styles/destruction.css
```

Expected counts after Sprint 6: Sprint 4 (≥ 21 gated surfaces) +
Sprint 5 (≥ 11 gated surfaces) + Sprint 6 (≥ 6 gated surfaces) =
**≥ 38 distinct file:line gate occurrences**. If the count is
< 38, a Faz 8 gate is missing — identify which §20 row has no
corresponding grep hit and route back to the owning lane.

---

## Sprint 6 lane scope assignment

Sprint 6 has 3 active lanes (Lane 0 + Lane A + Lane B). Phase 2B
parallel implementers consult this section to know what is
DESIGN-MANDATED (this SSOT enforces) versus LANE IMPLEMENTATION
CHOICE (the lane decides at implementation time).

### Lane 0 (i18n-expert) — SEQUENCE-LOCK FIRST

**Design-mandated**:
- `STRINGS.destruction.faz8.disclaimerPrimary` = `"Это просто шутка."`
  (Russian — presentation-constant, NOT locale-switched; same string
  regardless of `currentLocale`).
- `STRINGS.destruction.faz8.disclaimerSecondary` = `"Bu sadece bir şaka."`
  (Turkish — presentation-constant, NOT locale-switched).
- `STRINGS.destruction.faz8.restartHintRu` = `"R = ЕЩЁ РАЗ"`
- `STRINGS.destruction.faz8.restartHintTr` = `"R = TEKRAR"`
- `STRINGS.destruction.faz8.restartHintEn` = `"R = restart"`

**Lane implementation choice**:
- Whether to concatenate the three restart-hint locales in the i18n
  layer (returning a single string) or in the chrome layer (using
  `FAZ8_RESTART_HINT_SEPARATOR`). Designer suggestion: chrome layer
  joins, so the i18n keys remain pure single-locale values.

### Lane A (kraken — audio + reveal/son-ekran envelopes)

**Design-mandated**:
- Reveal envelope choreography: silence pivot 0-1sn, drain 1-4sn,
  hold 4-5sn (§18).
- Destruction-overlay fade easing: `FAZ8_REVEAL_FADE_EASING`
  (cubic-bezier(0.25, 0.46, 0.45, 0.94)).
- Camera dolly easing: `FAZ8_REVEAL_DOLLY_EASING`
  (cubic-bezier(0.65, 0, 0.35, 1)) — D-3 choice.
- Camera dolly magnitude: `FAZ8_REVEAL_CAMERA_DOLLY_DEGREES` = 10.
- Bulb pulse normalisation target: `FAZ8_BULB_PULSE_RESTING_HZ` = 0.4,
  `FAZ8_BULB_PULSE_RESTING_AMPLITUDE` = 0.05 (linear interp over 5sn).
- Audio bed baseline: `FAZ8_AUDIO_BED_BASELINE_GAIN_DB` = -24, linear
  ramp over `FAZ8_REVEAL_AMBIENT_RAMP_MS` = 3sn (after 1sn silence).
- Door-close ADSR + low-pass: see §19 synth table; all values are
  authoritative constants (`FAZ8_DOOR_CLOSE_*`).
- Door-close trigger at `FAZ8_SON_EKRAN_DOOR_CLOSE_AT_MS` = 2000ms
  into son-ekran (single-shot, non-looped).

**Lane implementation choice**:
- Door-close fundamental: OscillatorNode (sub-bass square) OR brown-
  noise burst into the 150Hz low-pass. Both render the same thump.
- Bulb-pulse interpolation: linear targets are mandated; per-cycle
  waveform shape stays as Sprint 1 sine ambient pulse.
- AmbientRecoveryHandle construction: designer suggestion fresh
  GainNode + fresh source loads (Sprint 5 close disposed the
  destruction-audio graph; fresh bus avoids leftover state).

### Lane B (frontend-dev — chrome + CSS + optional smoke)

**Design-mandated**:
- Disclaimer typography: all `FAZ8_DISCLAIMER_*` constants are
  authoritative (font-family stack, font-size, letter-spacing,
  color, text-shadow, gap, stagger).
- Disclaimer opacity targets: 0.9 primary (= `FAZ8_DISCLAIMER_OPACITY_MAX`),
  0.75 secondary (explicit, not cascaded — set `opacity: 0.75` on
  `.faz8-disclaimer__secondary`).
- Disclaimer fade easing: `FAZ8_DISCLAIMER_FADE_EASING`
  (cubic-bezier(0.4, 0, 0.6, 1)).
- Disclaimer z-index: 10100.
- Restart-hint: all `FAZ8_RESTART_HINT_*` constants are
  authoritative; D-1 SHIP confirmed.
- Restart-hint z-index: 10110.
- Volumetric smoke: D-2 SHIP with `FAZ8_VOLUMETRIC_SMOKE_MODE = 'css'`;
  source = `'desk-ashtray'` (D-4); peak opacity 0.12.
- Volumetric smoke z-index: 10050.
- Reduced-motion gates: all 6 surfaces in §20 matrix require gates;
  Phase 3 grep enforces.

**Lane implementation choice**:
- Smoke CSS @keyframes timing functions (designer suggestion: linear
  translateY + ease-in-out-sine opacity — "puff-rise-dissipate").
- DOM grouping: single `<section role="region" aria-label="Son ekran">`
  parent for ARIA grouping; disclaimer + hint as children (suggestion).
- Font-family stack: `'Old Standard TT', 'PT Serif', Georgia, serif`
  (primary) + `'PT Serif', Georgia, serif` (secondary/hint). All glyphs
  required (Cyrillic ё, Latin ş ı) covered by Sprint 0 OFL bundle.

### Cross-lane invariants (Sprint 4 + 5 + 6 cumulative)

These hold across ALL Faz 0-8 lanes and Phase 3 qa-engineer scans
for them. Sprint 6 ADDS invariants 6-8 below to the Sprint 5
invariants 1-5 (which remain unchanged):

6. **No `app.quit` / no `BrowserWindow.close` in R-key handler.**
   Phase 3 grep:
   `grep -rn "app\.quit\|BrowserWindow\.close\|window\.api\..*[Ee]xit" src/renderer/scene/destruction/ src/renderer/scene-mount.ts`
   should return zero results from the Faz 8 R-key restart path.
   The `requestRestart()` surface mutates FSM state and aborts the
   inner signal — that is the entire side-effect surface (Risk S9
   closure carried forward from Phase 1).
7. **No bundled Cyrillic font outside Sprint 0 OFL stack.** Phase 3
   grep: `grep -rn "@font-face" src/renderer/styles/destruction*.css`
   should NOT show any new font declaration. Faz 8 disclaimer uses
   `'Old Standard TT', 'PT Serif', Georgia, serif` — all already
   bundled at Sprint 0.
8. **No external audio asset for door-close.** Phase 3 grep:
   `grep -rn "\.ogg\|\.wav\|\.mp3" src/renderer/scene/audio/destruction-audio-faz8.ts`
   should return zero results. Door-close is procedural per Sprint 4
   Lesson 3 (no audio asset vendoring).

---

*End of Sprint 6 Phase 2A designer pass. Sprint 6 §18-§20 are
additive to Sprint 4 §1-§9 and Sprint 5 §10-§17. Combined: SSOT
for the entire Faz 0-8 destruction sequence; this is the LAST
destruction-direction designer pass. Phase 5 retro should revisit
§18 silence-pivot duration: we chose 1.0sn (PLAN §7 line 291 spec
1.5sn) to keep son-ekran beats intact; QA observation overrides.*

## Files this Sprint 6 designer pass authored or edited
| File | Change |
|------|--------|
| `src/renderer/scene/destruction/destruction-direction.md` | Extended in place with §18-§20 (Path A — Sprint 5 precedent). |
| `src/shared/scene-destruction-constants.ts` | Sprint 6 Phase 2A design FILL appended (Faz 8 color + motion + typography + audio ADSR). |

## Files designer did NOT touch (Sprint 6 Phase 2B collision-safety)

Per Sprint 6 Phase 2A scope: lane controllers (`faz8-reveal.ts`,
`faz8-son-ekran.ts`), chrome modules (`chrome/faz8-*.ts`), audio
synth factories (`audio/destruction-audio-faz8.ts`), `i18n/strings.ts`
destruction subtree, `styles/destruction.css`, and `scene-mount.ts`
R-key listener — all left untouched for Phase 2B parallel lanes.
`atmosphere-direction.md` not extended: Sprint 1 ambient state is
RESTORED (not redefined) by the reveal.

---

## 21. Sprint 7 — Faz 8 TEKRAR / ÇIK action buttons

Sprint 6 son-ekran shipped HINT TEXT only ("R = ЕЩЁ РАЗ · R = TEKRAR ·
R = restart") as the soft precursor to the buttons (§ "Restart hint
D-1 — RECOMMENDED SHIP" lines 2494-2537). Sprint 7 ships the actual
buttons. The buttons are the FIRST and ONLY interactive surface in
the destruction sequence: every prior beat is fire-and-forget motion
+ audio. The two buttons must therefore read UNAMBIGUOUSLY as
"things you can press" while still sitting in the kirli-kâğıt
typographic palette Sprint 6 established for the son-ekran.

### D-1 decision — 1 vs 2 chrome files

**PICKED option Y — single `chrome/faz8-action-buttons.ts`.**

Lane B Phase 2B implements ONE chrome module that mounts both
buttons in a shared flex container. The two buttons share:
- font-family + font-size + letter-spacing
- background colour + border + padding
- hover / active / focus state transitions
- entrance fade-in animation (mounted together, animate together)
- reduced-motion gates (identical pattern)
- ARIA labelling structure

The two buttons differ ONLY in: label text (TEKRAR vs ÇIK), aria-
label (i18n keys), and the `onClick` handler bound (one calls
`requestRestart()` on the director, the other calls
`window.api.quit()` per S10 Path A).

Rationale:
- **Shared CSS = single source of truth.** Two-file split duplicates
  all visual constants (typography, colour, padding, state classes).
  TH-S6-02 SSOT discipline carries forward: constants for class
  names and timing already live in `scene-destruction-constants.ts`,
  but the CSS rules themselves should live in ONE place. Two files
  invites drift (one file's hover colour ends up 5% off the other).
- **Visual coupling = behavioural coupling.** The two buttons appear
  together, animate together, dispose together. Pulling them apart
  at the module boundary fights the lifecycle reality. Lane A only
  needs one mount call + one dispose call.
- **Type surface preserved.** Phase 1 ships separate
  `Faz8TekrarButtonHandle` + `Faz8CikButtonHandle` discriminated
  unions (types.ts lines 540-580). The single chrome file returns
  BOTH handles as a tuple `{ tekrar: Faz8TekrarButtonHandle; cik:
  Faz8CikButtonHandle }` so call sites narrow each handle by `kind`
  independently. No type-surface collapse; just file-surface.

### D-2 decision — retain or REMOVE Sprint 6 R-key hint text

**PICKED option N — REMOVE the Sprint 6 restart-hint chrome.**

Lane B Phase 2B REMOVES the `chrome/faz8-restart-hint.ts` mount
call from `faz8-son-ekran.ts` (the chrome file itself stays for
type/test surface continuity but the runner no longer instantiates
it). Lane 0 Phase 2B i18n REMOVES the three restart-hint keys
(`destruction.faz8.restartHintRu` / `restartHintTr` / `restartHintEn`)
from `i18n/strings.ts`. The R-key keyboard binding in `scene-mount.ts`
STAYS as a power-user affordance (keyboard parity with TEKRAR button).

Rationale:
- **Buttons make the hint redundant.** The hint existed as a
  whispered affordance because no UI existed; Sprint 7 promotes that
  affordance to an explicit button. Keeping the hint alongside the
  button creates a visual conflict: which is the primary affordance?
  Two restart cues compete; the eye reads the hint as a "did the
  button work?" reassurance which it isn't.
- **Focus order cleanup.** Removing the hint shrinks the son-ekran
  Tab order to: TEKRAR → ÇIK. Two stops. Predictable. With the hint
  retained as decorative `aria-live=off` text the focus order is
  fine but the visual scan path adds noise.
- **i18n surface shrinks.** Three locale keys removed. Lane 0 work
  is "add 4 keys, remove 3 keys" — net +1, simpler diff for review.
- **R-key still works.** Power users (anyone who reads the original
  Sprint 6 hint) get the same keyboard shortcut without the visual
  reminder. The button's `aria-label` documents Enter/Space + the
  R-key keyboard hint can move to the button's `aria-keyshortcuts`
  attribute (Lane B Phase 2B implementation detail).

**Downstream impact (explicit for Lane A + Lane B + Lane 0):**
- Lane 0: REMOVE `destruction.faz8.restartHintRu/Tr/En` keys.
- Lane B: REMOVE `mountFaz8RestartHint()` call in `faz8-son-ekran.ts`
  (line ~300 region per Sprint 6 son-ekran runner); chrome file
  `chrome/faz8-restart-hint.ts` stays for type continuity but is
  uncalled. Phase 4 spark / Sprint 8 may delete the file outright.
- Lane A: NO direct impact (R-key handler in `scene-mount.ts`
  stays — the binding gates on FSM state, not on hint presence).

### Typography

| Element | Spec |
|---------|------|
| Font-family | `'Old Standard TT', 'PT Serif', Georgia, serif` (matches Sprint 6 disclaimer primary stack — Sprint 0 OFL bundle) |
| Font-weight | 600 (semi-bold) — buttons need MORE typographic weight than the 400-weight disclaimer so the eye reads them as "actionable element, not body copy". Old Standard TT bundle covers 400 + 700; 600 lerps to the nearer end at 700 (Lane B Phase 2B uses `font-weight: 600` declaration; the browser renders 700 from the bundle). |
| Font-size | 20px (= `FAZ8_BUTTON_FONT_PX`) — clears WCAG large-text threshold (≥18px regular, ≥14px bold) by a margin; matches the disclaimer secondary 28px → button 20px → restart-hint legacy 14px hierarchy where buttons sit between disclaimer and hint in visual weight. Sprint 6 BLOCKER-1 retro flagged ≥18px for actionable surfaces; 20px is the deliberate over-shoot. |
| Letter-spacing | +0.5px (= `FAZ8_BUTTON_LETTER_SPACING_PX`) — slight positive tracking for ALL-CAPS Cyrillic + Latin labels (ЕЩЁ РАЗ / ВЫЙТИ / TEKRAR / ÇIK) so the glyphs breathe; ALL-CAPS without tracking reads as cramped. |
| Text-transform | none — i18n strings ship in their authored case (ЕЩЁ РАЗ already capitalised; do NOT `text-transform: uppercase` which would mangle Turkish dotless-i + Cyrillic combining marks). |
| Line-height | 1.2 (= `FAZ8_BUTTON_LINE_HEIGHT`) — tight; single-line labels do not need leading. |

Cyrillic + Turkish glyph coverage verified Sprint 5 i18n-expert
(ЕЩЁ РАЗ ё / ВЫЙТИ Й / ÇIK Ç / TEKRAR — all in Old Standard TT
OFL bundle). Lane 0 Phase 2B re-runs the glyph-presence check.

### Colour palette

| Element | Value | Constant |
|---------|-------|----------|
| Background (default) | `#d4ccb8` | `FAZ8_BUTTON_BG_COLOR` |
| Background (hover) | `#c5bca5` | `FAZ8_BUTTON_BG_HOVER_COLOR` |
| Background (active/pressed) | `#b8af96` | `FAZ8_BUTTON_BG_ACTIVE_COLOR` |
| Text (ink) | `#2a2520` | `FAZ8_BUTTON_INK_COLOR` |
| Border | `1.5px solid #3a3530` | `FAZ8_BUTTON_BORDER` |
| Focus outline | `3px solid #7a6a4e` + `outline-offset: 3px` | `FAZ8_BUTTON_FOCUS_OUTLINE_COLOR` |
| Active inset shadow | `inset 0 2px 4px rgba(0, 0, 0, 0.3)` | `FAZ8_BUTTON_ACTIVE_INSET_SHADOW` |
| Disabled | NOT USED — buttons always enabled at son-ekran | — |

Designer rationale:
- **`#d4ccb8` aged-paper bg = kirli-kâğıt palette closure.** Sprint 6 disclaimer uses `#7a6a4e` ink on the lobby substrate; the buttons invert that — paper-colour fill with darker ink. Reads as "tear-off coupon" / "paper button".
- **Hover `#c5bca5` = 7% darker.** Within the `duration-micro` band 5-10%; sub-5% reads as no feedback, >10% reads as a state change.
- **Active `#b8af96` + inset shadow.** Pressed-in pushbutton metaphor; rgba(0,0,0,0.3) inset registers without harming legibility.
- **Focus `#7a6a4e` 3px outline + 3px offset.** Palette-coherent (matches disclaimer ink) rather than browser-blue. 3px width clears WCAG SC 2.4.7; offset > border-width keeps the outline detached. Contrast `#7a6a4e` on `#d4ccb8` = 4.51:1 — 3:1 large-graphical threshold cleared. Outline (not box-shadow) keeps layout stable.
- **Border `#3a3530` 1.5px.** Frames without competing with the focus outline; crisp on standard density, HiDPI rounds clean.
- **Text/bg contrast `#2a2520` on `#d4ccb8` = 11.4:1.** Clears WCAG AAA (7:1) — Sprint 6 BLOCKER-1 retro over-shot.

### Layout + position

| Element | Spec |
|---------|------|
| Container | `<div role="group" aria-label="...">` (Lane 0 fills aria-label) with `display: flex`, `flex-direction: row`, `justify-content: center`, `align-items: center`, `gap: 32px` (= `FAZ8_BUTTON_CONTAINER_GAP_PX`) |
| Container position | `position: absolute`, `bottom: 80px` (= `FAZ8_BUTTON_CONTAINER_BOTTOM_INSET_PX`) — same vertical band the Sprint 6 hint occupied (48px) but pushed up 32px so the buttons clear the safe area on kiosk displays with rounded corners |
| Container z-index | 10120 (= `FAZ8_BUTTON_CONTAINER_Z_INDEX`) — above disclaimer 10100 + restart-hint legacy 10110 + smoke 10050; ensures focus outlines render above all other son-ekran chrome |
| Button padding | `14px 28px` (= `FAZ8_BUTTON_PADDING`) — vertical 14px + horizontal 28px |
| Button min-width | 144px (= `FAZ8_BUTTON_MIN_WIDTH_PX`) — Cyrillic "ВЫЙТИ" + Turkish "TEKRAR" balance roughly equally; 144px gives both visual symmetry. Below 120px the buttons crowd; above 160px they over-dominate the son-ekran composition. |
| Button height (computed) | ≥48px (font-size 20px × line-height 1.2 + padding-y 14px × 2 = 52px). Clears the 44×44pt touch-target named rule. |
| Button border-radius | 2px (= `FAZ8_BUTTON_BORDER_RADIUS_PX`) — almost-square corners; aggressive rounding (8px+) reads as web-app, not paper-coupon. 2px gives the corner a hint of softness without genre-shift. |
| Cursor | `pointer` on hover (desktop kiosk has mouse; keyboard-only users get focus indicator instead) |

### Entrance animation

| Element | Spec |
|---------|------|
| Initial state | `opacity: 0`, `transform: translateY(8px)` — slight upward drift on entrance |
| Final state | `opacity: 1`, `transform: translateY(0)` — driven by `.is-visible` CSS class toggle |
| Trigger class | `FAZ8_TEKRAR_BUTTON_VISIBLE_CLASS` = `'is-visible'` + `FAZ8_CIK_BUTTON_VISIBLE_CLASS` = `'is-visible'` (Phase 1 SSOT) |
| Duration | 600ms (= `FAZ8_BUTTON_FADEIN_DURATION_MS` — Phase 1 placeholder CONFIRMED) |
| Start offset from son-ekran entry | 2500ms (= `FAZ8_BUTTON_FADEIN_START_OFFSET_MS` — Phase 1 placeholder CONFIRMED; ≈57.5sn absolute, lands AFTER disclaimer fade-in completes at son-ekran +4sn so the disclaimer reads first) |
| Easing | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (ease-out-quad — matches Sprint 6 destruction-overlay fade) — buttons "settle in" rather than "punch in" |
| Stagger between TEKRAR and ÇIK | NONE — both buttons animate together (they are a pair) |

### State spec — default / hover / active / focus / pressed

| State | Trigger | Visual change |
|-------|---------|---------------|
| default | mounted, after entrance | `bg: #d4ccb8`, `border: 1.5px solid #3a3530`, `ink: #2a2520`, no inset shadow |
| hover | mouse over | `bg: #c5bca5` (transitions over 100ms — within `duration-micro` named rule) |
| active | mouse-down, Enter-held, Space-held | `bg: #b8af96` + `box-shadow: inset 0 2px 4px rgba(0,0,0,0.3)` |
| focus | Tab landed, keyboard navigation | `outline: 3px solid #7a6a4e`, `outline-offset: 3px` — outline survives across all other states |
| pressed (= active short flash) | Click released | brief 100ms return to hover bg, then default — the "tap feedback" pulse |

State transitions use `transition: background-color 100ms ease-out,
box-shadow 100ms ease-out` — clears the `duration-micro` named rule
band (100-150ms for hover / toggle). Focus outline transitions are
INSTANT (no fade) — outline animation is an a11y anti-pattern
(SC 2.4.7 implies focus visibility is binary, not fade-able).

### Reduced-motion behaviour

| Surface | Default | Reduced-motion |
|---------|---------|----------------|
| Entrance fade-in + translateY | 600ms over `opacity 0→1` + `translateY(8px)→0` | Instant — opacity 1, translateY 0 at mount; no animation |
| Hover bg transition | 100ms ease-out | Instant — 0ms transition (colour swaps directly) |
| Active bg + inset shadow transition | 100ms ease-out | Instant — 0ms transition |
| Focus outline | Already instant under default | Unchanged — instant |
| Pressed pulse | 100ms return to hover bg | Skipped — pressed state holds until next state |

Lane B CSS gates the entrance via `@media (prefers-reduced-motion:
reduce) { .faz8-action-button { opacity: 1; transform: none;
transition: none; } }` and a JS short-circuit on the rAF that
toggles `.is-visible` (skip the rAF, set the class synchronously
at mount).

### S10 IPC contract recap (Phase 1 Path A confirmed)

TEKRAR onClick → `director.requestRestart()` (renderer-only FSM
mutation; no IPC). ÇIK onClick → `window.api.quit()` (Sprint 0
`app:quit` channel reused; main process closes BrowserWindow +
quits app). Both kiosk-safe per the joke-app invariant — TEKRAR
preserves the kiosk frame (loops back through `faz8-reveal`); ÇIK
exits cleanly to the user's OS shell which is the intentional end
of the joke. Designer note: the two onClick semantics being
asymmetric (one stays in-app, one exits) is exactly why ÇIK is the
SECOND button — left-to-right reading order positions TEKRAR
(restart, the "preferred" CTA) first, ÇIK (exit) second.

---

## 22. Sprint 7 — Reveal jingle ADSR + chord spec

The reveal jingle is the audio counterpart to the destruction-
overlay fade-out: a brief musical cue that rings out across the
silence-pivot + drain window (§18 lines 2256-2294). Its purpose is
to ANNOUNCE the tonal shift from "system has died" to "the room is
still here" — without overstating the announcement (the joke is
that the destruction was performative; the jingle is the wry
musical acknowledgement, not a triumphant resolution).

### D-3 decision — chord character

**PICKED: open-fifth + sus2 voicing (A3 + E4 + B4 + A5).**

Specifically:
- A3  = 220.00 Hz (root, tenor register)
- E4  = 329.63 Hz (perfect fifth above root — the "open" interval)
- B4  = 493.88 Hz (suspended 2nd above E — the "unresolved" colour)
- A5  = 880.00 Hz (octave above root — the "shimmer" / overtone reinforcement)

Total 4 notes; mid-register spread A3-A5 (two octaves); sits ABOVE
the recovering ambient bed (-24dB at sub-bass + low-mid bulb-hum
range, ~50-300Hz fundamental) and BELOW the procedural disclaimer
voice register (Cyrillic vowels peak ~700-1500Hz formants).

Rationale:
- **Open-fifth = neither happy nor sad.** A major or minor triad
  would resolve the emotional question ("the destruction was sad /
  triumphant"). The open-fifth is INTENTIONALLY ambiguous — the
  ear hears "music" without hearing a verdict. Matches the joke
  brief: "the worst is over, but we are not celebrating".
- **Sus2 (B4 over A3) adds wistful colour without resolution.**
  A B-natural over an A root forms a sus2 interval (whole-tone
  above the root). It hangs unresolved through the 2sn release —
  the listener's ear waits for resolution that never comes. This
  mirrors the visual beat: the lobby is restored but the
  disclaimer admits the joke without resolving the emotional
  punch. The chord is the audio version of the disclaimer.
- **A5 octave reinforcement.** Without the A5 the chord sits in
  the same register as the bulb hum + radio static; the listener
  hears "ambient texture" not "musical cue". A5 at 880Hz pushes
  one note clearly above the ambient bed band, marking the chord
  as discrete content.
- **NOT a chord with 3rd.** A C# or C natural over the A would
  make this a major or minor chord — verdict delivered. Avoided.
- **A as root.** Concert-pitch reference; matches the Sprint 1
  ambient bulb hum at 100Hz (A2 area, 2 octaves below) so the
  chord is rationally tuned with the existing audio bed.

### Oscillator type

**PICKED: per-note triangle wave** (= `'triangle'` for all 4
OscillatorNodes).

Rationale:
- **Sine = too clean.** Pure sine reads as "synth test tone" or
  "alarm" — both wrong. The chord should sound LIKE music, not
  like a notification.
- **Sawtooth = too rich.** Sawtooth has full harmonic content; on
  this register it reads as "synth string pad" — also wrong (the
  jingle is a discrete cue, not a sustained pad).
- **Triangle = warm with slight harmonic colour.** Triangle has
  only odd harmonics at rapidly diminishing amplitude (1/n²) — it
  sounds like "a flute heard through a wall" or "a music box at
  distance". Matches the "distant church bell / Soviet radio chime"
  narrative ambiguity better than sine; less identifiable as a
  specific instrument than sawtooth.
- **All 4 notes same waveform.** Consistent timbre across the
  voicing — the chord reads as one instrument, not four. (Mixing
  waveforms would create a synth-pad effect.)

### ADSR per-note (confirmed Phase 1 placeholders)

| Stage | Value | Constant | Rationale |
|-------|-------|----------|-----------|
| Attack | 200ms | `REVEAL_JINGLE_ATTACK_MS` | Slow fade-in — the chord "swells" rather than "punches". Under 100ms reads as alert/intrusion; over 300ms loses the "discrete cue" character. |
| Decay | 100ms | `REVEAL_JINGLE_DECAY_MS` | Short transition from attack peak to sustain plateau. The decay is barely perceptible — its job is to avoid a held peak that fatigues the ear. |
| Sustain | 0.3 (linear, 30% of peak) | `REVEAL_JINGLE_SUSTAIN_LEVEL` | Moderate sustain — chord holds at 30% so the ear has time to register the voicing before release. Below 0.2 the chord disappears too quickly; above 0.5 it competes with the recovering ambient bed. |
| Release | 2000ms | `REVEAL_JINGLE_RELEASE_MS` | Long release tail — the chord dissolves over 2sn. Matches the visual 3sn destruction-overlay fade so audio + visual envelopes settle together. |
| Total per-note duration | ≈2.5sn (attack + decay + 200ms sustain plateau + release) | — | Sits within the 5sn reveal envelope; finishes BEFORE son-ekran enters at +5sn. |

### Mix specification

| Element | Value | Constant |
|---------|-------|----------|
| Peak amplitude | -30 dBFS (linear ≈ 0.0316) | `REVEAL_JINGLE_PEAK_DB` |
| Per-note voicing balance | EQUAL — all 4 notes at the same peak (the chord is a chord, not a melody) | — |
| Stereo | MONO (single GainNode summing all 4 oscillators) | — |
| Pan | None (centre) | — |
| Reverb / convolution | NONE — procedural simplicity per Sprint 4 Lesson 3 (no asset vendoring) | — |
| Trigger offset | 0ms from faz8-reveal entry | `REVEAL_JINGLE_OFFSET_MS` |

Mono rather than stereo: the destruction audio chain has been mono
through Faz 0-7 (the joke is the room's voice; the room speaks in
one voice, not in stereo separation). Reverb omitted because (a)
adding a ConvolverNode requires an impulse response asset OR a
procedurally-generated noise burst that adds complexity for marginal
benefit, and (b) the triangle wave's slow attack already supplies
the "spacious" quality reverb would add.

### S12 acoustic mix-check — pure addition with the recovering ambient bed

| Bed | Peak / sustain | Headroom vs jingle |
|-----|----------------|--------------------|
| Sprint 1 ambient bulb hum + radio static (Sprint 6 §18 recovery) | -24 dBFS sustained (= `FAZ8_AUDIO_BED_BASELINE_GAIN_DB`) | Jingle peak at -30dBFS sits 6dB below the bed sustain |
| Sprint 6 door-close accent (single-shot at son-ekran +2sn) | -10 dBFS peak (= `FAZ8_DOOR_CLOSE_PEAK_GAIN` ≈ 0.3 linear) | Door-close fires AFTER jingle release tails (jingle release ends ≈2.5sn into reveal; door-close fires ≈7sn into the reveal-to-son-ekran timeline) — NO temporal overlap |

S12 risk closure (Phase 1 audit): jingle + ambient bed run
CONCURRENTLY in the 0-2.5sn reveal window. Both sum into the master
Gain node; no compressor/limiter in the chain. Worst-case linear
sum: 0.0316 (jingle) + 0.0631 (ambient -24dBFS = ~6.3% linear) =
0.0947 linear = -20.5 dBFS. Comfortably below 0 dBFS clipping;
comfortably above the noise floor (≈-60 dBFS for typical playback).
NO clipping; NO destructive interference (different frequencies in
play); pure ADDITIVE mix.

Phase 3 verification: Lane A Phase 2B implementation MUST pass the
S12 acoustic check by inspection — the jingle's GainNode peak value
equals the linear conversion of -30dBFS (= `10 ** (-30/20)` ≈
0.0316). A unit test in `tests/e2e/sprint7-faz-smoke.spec.ts` T08
(or equivalent) asserts the constructed GainNode `gain.value` is
within ±0.001 of 0.0316.

---

## 23. Sprint 7 — Scene transition cross-fade spec

Sprint 7 adds smoothing to two FSM transitions that Sprint 4 / 5
shipped as hard cuts: Faz 6 (BSOD) → Faz 7 (bootloop), and Faz 7
(bootloop) → Faz 8 (reveal). The third transition (Faz 2 takeover →
Faz 3 terminal) is REVIEWED and confirmed smooth — no Sprint 7 work
on that beat.

### D-4 decision — transition timing

**PICKED differentiated timings: 200ms (Faz 7→8) / 150ms (Faz 6→7) /
0ms (Faz 2→3 confirmed hard cut).**

Phase 1 placeholders are CONFIRMED unchanged. Rationale per transition:

#### Faz 7 → Faz 8 — 200ms cross-fade

| Element | Spec |
|---------|------|
| Duration | 200ms (= `FAZ7_TO_FAZ8_CROSSFADE_MS`) |
| Easing | `cubic-bezier(0.4, 0.0, 0.2, 1)` (= `SCENE_TRANSITION_EASING` — Material Design standard curve) |
| Behaviour | Bootloop chrome (Mac apple-loading / Win BIOS) opacity 1→0 concurrent with destruction-takeover overlay opacity (already at 1) transitioning to opacity 0 as the faz8-reveal phase claims the fade. The two opacity envelopes share the 200ms window. |
| Trigger | Lane A toggles `FAZ7_TO_FAZ8_TRANSITION_ACTIVE_CLASS` (= `'is-transitioning'`) on the destruction-takeover overlay at the FSM transition moment. CSS handles the opacity transition; Lane A schedules the `classList.remove` at +200ms via setTimeout. |
| Reduced-motion | Instant cut. `@media (prefers-reduced-motion: reduce)` removes the CSS transition; the class toggle becomes a synchronous opacity swap. |

Why 200ms: longer than the Faz 6→7 transition because the FSM
state change is also a TONE change (apocalyptic loop → wistful
acceptance). 200ms lets the ear adjust to the tonal pivot. Sub-150ms
reads as glitchy; over 300ms reads as "transition shot" which
breaks the joke's deadpan delivery.

#### Faz 6 → Faz 7 — 150ms cross-fade

| Element | Spec |
|---------|------|
| Duration | 150ms (= `FAZ6_TO_FAZ7_CROSSFADE_MS`) |
| Easing | `cubic-bezier(0.4, 0.0, 0.2, 1)` (shared `SCENE_TRANSITION_EASING`) |
| Behaviour | BSOD/kernel-panic chrome opacity 1→0 concurrent with pre-mounted bootloop chrome opacity 0→1. Lane A pre-mounts the bootloop chrome behind the BSOD at opacity 0; the BSOD dispose triggers the bootloop's opacity ramp. |
| Trigger | Lane A toggles `SCENE_TRANSITION_FADE_OUT_CLASS` (= `'is-transition-fading-out'`) on the BSOD root + `SCENE_TRANSITION_FADE_IN_CLASS` (= `'is-transition-fading-in'`) on the bootloop root simultaneously. |
| Reduced-motion | Instant — both classes effectively no-op under the reduced-motion media query (Lane A skips the rAF; opacity flips synchronously). |

Why 150ms (shorter than Faz 7→8): the BSOD → bootloop pivot is a
"system reset" moment narratively. The cut should feel MECHANICAL
("the OS rebooted"), not CINEMATIC ("the editor crossfaded"). 150ms
is the threshold where the eye stops perceiving a discrete frame
swap but doesn't yet register a stylised transition. It reads as
"the screen just changed", which is exactly the bootloop's
narrative claim.

#### Faz 2 → Faz 3 — 0ms confirmed hard cut

Designer reviewed current Sprint 4 takeover → terminal handoff
behaviour (destruction-director.ts faz2 → faz3 transition path).
The hard cut is **intentional and verified smooth** — no Sprint 7
work needed.

Rationale:
- The Sprint 4 takeover chrome (notification toasts + desktop
  icons fade-out) ends with the desktop EMPTY (icons faded, toasts
  cleared). The terminal then mounts ATOP this empty desktop.
  Because the takeover ends in a controlled empty-state, there is
  no flash-of-empty between phases — the eye reads continuous
  "desktop is here, now terminal is on top of desktop".
- A cross-fade here would actually HARM the read: the terminal
  appearing mid-fade would look like "terminal materialising
  through the desktop" which is wrong (the terminal is opened BY
  the user-impersonating click sequence, narratively a discrete
  app-launch event).
- Sprint 7 keeps `FAZ2_TO_FAZ3_CROSSFADE_MS = 0` (Phase 1
  placeholder CONFIRMED unchanged). Lane A Phase 2B does NOT wire
  a transition class on this path.

### Shared transition CSS pattern (Lane A + Lane B reference)

```css
/* Lane B implements in styles/destruction.css */

.destruction-takeover.is-transitioning,
.scene-element.is-transition-fading-out {
  opacity: 0;
  transition: opacity 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

.scene-element.is-transition-fading-in {
  opacity: 1;
  transition: opacity 150ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

@media (prefers-reduced-motion: reduce) {
  .destruction-takeover.is-transitioning,
  .scene-element.is-transition-fading-out,
  .scene-element.is-transition-fading-in {
    transition: none;
  }
}
```

Lane A toggles the classes via standard `classList.add` +
`setTimeout(() => classList.remove(...), DURATION_MS)` — single
setTimeout per transition; clean dispose via the destruction-
director's AbortSignal.

### Sprint 7 NEW a11y matrix rows

Append to §8 master matrix (after row 22) AND to the cumulative
matrix (Sprint 4 22 + Sprint 5 15 + Sprint 6 6 + Sprint 7 5 = 48).

| #  | Surface                                | OS      | Default behaviour                                   | Reduced-motion behaviour                              | A11y role     | ARIA                                    | Owner             |
|----|----------------------------------------|---------|-----------------------------------------------------|-------------------------------------------------------|---------------|-----------------------------------------|-------------------|
| 44 | Faz 8 TEKRAR button entrance fade + translateY | mac+win | Opacity 0→1 + translateY 8px→0 over 600ms ease-out-quad | Instant — opacity 1, translateY 0 at mount; no animation | button        | `role=button` (native), `aria-label` from i18n, `aria-keyshortcuts="R"`, Tab order 1, Enter/Space activates | frontend-dev (B)  |
| 45 | Faz 8 ÇIK button entrance fade + translateY    | mac+win | Same envelope as #44 (shared `.is-visible` class)   | Same as #44                                           | button        | `role=button` (native), `aria-label` from i18n, Tab order 2, Enter/Space activates | frontend-dev (B)  |
| 46 | Faz 8 button hover / active / pressed transitions | mac+win | bg + box-shadow 100ms ease-out per state            | Instant 0ms transitions; colours swap directly        | n/a (state)   | n/a — focus outline already meets SC 2.4.7 | frontend-dev (B)  |
| 47 | Reveal jingle (chord ADSR)             | mac+win | 4-note triangle chord, 2.5sn envelope at -30dBFS    | UNCHANGED (audio amplitude is functional; visual gates do not affect audio per Sprint 4 §8 row 4-5 pattern) | decorative audio | NO `aria-label` (pure ambience); respects window.api audio-mute IPC if user has muted | kraken (A)        |
| 48 | Scene transitions Faz 6→7 + Faz 7→8 cross-fades | mac+win | 150ms (Faz 6→7) + 200ms (Faz 7→8) opacity cross-fades with `cubic-bezier(0.4, 0, 0.2, 1)` | Instant cuts — `.is-transitioning` + `.is-transition-fading-out/in` classes' `transition: none` under reduced-motion media query | n/a (scene change) | n/a                                     | kraken (A)        |

**Sprint 7 surfaces audited: 5.**
**Surfaces with active reduced-motion alternative: 4 (rows 44-46, 48).**
**Surfaces unchanged under reduced-motion (audio functional): 1 (row 47).**

### Cumulative matrix totals (Sprint 4 + 5 + 6 + 7)

| Total | Count |
|-------|-------|
| Sprint 4 surfaces audited (§8 lines 943-967) | 22 |
| Sprint 5 surfaces audited (§16 lines 2009-2025) | 15 |
| Sprint 6 surfaces audited (§20 lines 2613-2625) | 6 |
| Sprint 7 surfaces audited (§23 this section) | 5 |
| **Combined cumulative total** | **48** |

### Phase 3 verification grep (Sprint 7 additive)

```bash
grep -rn "prefers-reduced-motion" src/renderer/scene/destruction/chrome/faz8-tekrar-button.ts src/renderer/scene/destruction/chrome/faz8-cik-button.ts src/renderer/scene/destruction/chrome/faz8-action-buttons.ts 2>/dev/null
grep -rn "PREFERS_REDUCED_MOTION_QUERY" src/renderer/scene/destruction/destruction-director.ts
grep -rn "@media (prefers-reduced-motion: reduce)" src/renderer/styles/destruction.css
```

Expected counts after Sprint 7: Sprint 4-6 cumulative (≥ 38 gates)
+ Sprint 7 (≥ 5 gates) = **≥ 43 distinct file:line gate occurrences**.

---

*End of Sprint 7 Phase 2A designer pass. Sprint 7 §21-§23 are
additive to Sprint 4 §1-§9 + Sprint 5 §10-§17 + Sprint 6 §18-§20.
Combined: SSOT for the Faz 0-8 destruction sequence INCLUDING the
TEKRAR/ÇIK interactive surface. Phase 5 retro should revisit D-2
(hint removal) if QA observation shows the buttons alone fail to
read as restart affordance — fall-back is to re-mount the hint
with a tighter visual coupling to the buttons (e.g. as their own
secondary caption text).*

## Files this Sprint 7 designer pass authored or edited
- `destruction-direction.md` — Sprint 7 §21-§23 appended (Path A precedent).
- `scene-destruction-constants.ts` — `REVEAL_JINGLE_CHORD_NOTES` filled (A3 220.00, E4 329.63, B4 493.88, A5 880.00 Hz); Sprint 7 button typography + colour + layout constants added; Phase 1 timing placeholders confirmed (no value change).

Lane controllers, chrome modules, audio factories, i18n strings,
destruction.css, and scene-mount.ts R-key listener left untouched
for Phase 2B parallel lanes (Lane 0 + Lane A + Lane B).
