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
