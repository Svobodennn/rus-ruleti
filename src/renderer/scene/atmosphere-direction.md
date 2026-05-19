# Atmosphere Direction — Sprint 1 Phase 2

> Designer note. Authored 2026-05-19 by designer agent (Phase 2 batch A) for
> the parallel Phase 2 batch B (kraken-shader, frontend-dev, kraken-audio)
> and for the Sprint-3 modelling/texturing pass. Read this before tuning
> anything that derives from `src/shared/scene-constants.ts`.

The bodrum oda is **a single bulb, a table, a revolver, and the silence
between two breaths**. Every visual decision in this document optimises for
the PLAN §2 brief: klostrofobik minimalizm, tekinsiz ritüel, bozuk gerçeklik.
If a tweak makes the room "look nicer" but loses the suffocation, reject it.

---

## 1. Color decisions

### Palette adherence

The seven-colour palette in `PALETTE` was verified byte-for-byte against
PLAN.md §2 lines 44-51. Every value matches; nothing drifted in Phase 1.

| Key      | Hex       | PLAN role                                  |
|----------|-----------|--------------------------------------------|
| `shadow` | `#0a0908` | Kömür siyahı — fog, ceiling, deep corners. |
| `oak`    | `#1c1814` | Table, chair, walls (placeholder).         |
| `rust`   | `#3d2817` | Radiator, pipes, radio cabinet.            |
| `paper`  | `#7a6a4e` | Kirli kâğıt — wallpaper hint, calendar.    |
| `sodium` | `#c89b3c` | The bulb. **Only** this hue casts light.   |
| `blood`  | `#8b1a1a` | Cartridge brass tint, future BSOD accent.  |
| `neon`   | `#4a5d3a` | Radio dial glow, terminal CRT phosphor.    |

### Why not extend the palette?

Sprint-3 reviewers will be tempted to add "lighter wood", "warmer rust",
"a slightly different sodium for the lampshade". **Do not.** Seven swatches
is the budget. The PS1 ditherer + the CRT scanline post-fx already produce
implied intermediate tones; widening the palette dilutes the brutalist
"hard surfaces, no decoration" feeling and pushes the room toward "lit
diorama" instead of "abandoned cellar".

### Fog colour seam

`FOG_COLOR === PALETTE.shadow` is intentional and must stay locked. If
kraken-shader introduces a different clear-colour or a different
FogExp2 colour, the corners and the back wall will develop a visible
charcoal-to-near-black seam. Bind both to `PALETTE.shadow` (or `FOG_COLOR`,
which equals it).

---

## 2. Lighting decisions

### The bulb (PointLight)

| Param        | Phase 1   | Phase 2   | Rationale                                |
|--------------|-----------|-----------|------------------------------------------|
| `intensity`  | 6.0       | **3.4**   | Phase 1 over-lit the chair back and far  |
|              |           |           | wall, flattening chiaroscuro. PLAN §2    |
|              |           |           | demands "yüzler yarı gölgede" — half-    |
|              |           |           | shadow only happens with steep falloff.  |
| `posY`       | 2.4       | 2.4       | Unchanged. Drop = 1.65m to table top.    |
| `decay`      | 2         | 2         | Physically correct inverse-square.       |
| `distance`   | 10        | 10        | Unchanged.                               |
| `color`      | `sodium`  | `sodium`  | Unchanged.                               |

### Sway model: Lissajous, not circle

Phase 1 used `sin(t)` on x and `cos(0.83·t)` on z — close to but not quite
a Lissajous (the cosine is the same period as the sine, just phase-shifted).
Phase 2 separates the X and Z **periods**:

```
x(t) = swayAmpX · sin(2π·t / swayPeriodSecX + swayPhaseX)
z(t) = swayAmpZ · sin(2π·t / swayPeriodSecZ + swayPhaseZ)
```

With `swayPeriodSecX = 3.7s` and `swayPeriodSecZ = 4.9s`, the ratio is
irrational, so the curve traced out in the xy-plane (looking down at the
bulb) is an open, slowly-drifting figure that never closes back on itself.
Visually: the bulb appears to swing in a slight cross-draught, settle, drift
sideways, swing again. Never mechanical.

Amplitudes (`0.06` / `0.05` world units = 6 cm / 5 cm) sit in the
"hafifçe sallanır" band PLAN §2 specifies. Below 2 cm the motion is
invisible; above 10 cm the room reads "alarmed" instead of "still".

### Intensity pulse: 14Hz AC ripple metaphor

The bulb modulates intensity by **±1% at ~14Hz**. This is *not* the real 50Hz
mains frequency — that's too fast for the human visual system to register
as flicker; it would just read as constant brightness. 10-20Hz is the
"perceptible flicker" band that *evokes* a tungsten filament under a
sketchy transformer. Set to 14Hz to land between "obvious strobing" and
"DC-clean" so the bulb feels alive but not theatrical.

If kraken-shader later adds a CRT scanline at a similar rate, watch for
beating with the intensity pulse — visible Moiré will be ugly. Recommend
keeping scanline frequency well above 30Hz (or modulating it differently).

### Ambient floor: 5% lift, sodium-biased

Sprint 1 Phase 1 had no ambient light. That made every face the bulb
couldn't reach pure black — including the underside of the chair, the
back of the radiator, and the wall pockets at the room corners. PLAN §2
asks for "yüzler yarı gölgede" (faces in half-shadow), not void.

`AMBIENT_LIGHT.intensity = 0.05` is the minimum that resolves form
without softening the bulb's high-contrast directionality. The color is
biased very slightly toward the bulb's sodium tint (`#080706` ≈ near-black
warm grey) so the cool/warm contrast Sprint 0 mood-board established
remains intact.

If you raise this above 0.1, the chiaroscuro flattens; if you drop it to
0, the room reads "lost in space" rather than "lost in basement".

### Bulb mesh: still fixed (Sprint 1 compromise)

The placeholder bulb sphere (`placeholder-bulb`) sits at the bulb origin
and **does not move** in Sprint 1, even though the PointLight does. That
means in the scene you see a stationary glowing ball while the cast shadows
sway — slightly artificial but acceptable for placeholder geometry. Sprint
3 (GLB swap) will tie the porcelain duy mesh to the light's transform so
the visible bulb sways physically (cable from ceiling, glass on bottom).

---

## 3. Camera framing (recommendations only)

> The directive forbids me from editing `camera.ts` directly. These are
> recommendations for kraken-Phase-2 or Sprint 3 to ratify.

### FOV ~50 is correct. Keep it.

`CAMERA.fovDeg = 50` is a sensible "natural eye" focal-length analogue
(roughly 47mm full-frame equivalent). Tighter (40°) would feel
voyeuristic-cinematic but cramp the table; wider (60°+) would distort the
revolver in a way that breaks the "this is just a room you're in" stillness.

### Position: `(0, 1.6, 3.2)` looking at `(0, 0.75, 0)`

This puts the viewer at standing-eye height looking down at the table.
Computing the tilt: `atan2(1.6 - 0.75, 3.2) ≈ 15°` downward — gentle, in
the "I am about to sit down at this table" reading.

I'd accept this as Sprint 1 final. **Recommendations** for Sprint 3:

1. **Pull back to `posZ = 3.5`.** When the placeholder cubes are replaced
   with full GLB props (votka bottle, podstakannik glass, ashtray, papers),
   the table will look more visually busy. An extra 30 cm of breathing
   room keeps the revolver as the anchor without making the props feel
   cramped.
2. **Drop to `posY = 1.45`.** A subtle "you're slumping at the table"
   pose. Combined with the existing look-at, the tilt drops to ~11° —
   you feel less like an observer, more like a participant.
3. **Consider a 4° dolly toward the chair** (so `posX` shifts to ~0.05).
   Pure-axis symmetry reads "deliberate composition". A few millimetres
   off-axis reads "this is a real seat someone walked away from".

None of these are Sprint 1 blockers. The current framing is good. These
are notes for the Sprint 3 review.

### What I would NOT change

* The look-at target stays on the table top. The revolver lives there;
  the eye should rest there.
* The fixed-camera contract is non-negotiable per PLAN §2 ("kamera sabit").
  Do not add a tilt-shift, do not add idle camera breathing, do not add
  a parallax response to mouse position.

---

## 4. Sprint 1 known compromises

### Placeholder cubes carry no surface story

The room is currently axis-aligned boxes with `MeshStandardMaterial`. There
is no:

* Wood grain on the table (`oak` is flat).
* Pas dökümü on the radiator (`rust` is flat).
* Wallpaper pattern, mould stain, scratched paint on the walls.
* Cracks in the concrete floor.
* Glass tint on the bulb.

This is **intentional and acceptable for Sprint 1**. Phase 2's shader and
post-fx pass (CRT scanline, film grain, chromatic aberration, PS1 vertex
snap) layer enough "broken signal" over the flat materials that the room
still reads as oppressive. Sprint 3 swaps every placeholder for a GLB with
proper textures.

What Sprint 1 cannot deliver, and the team should not try to fake:

* **Texture brutalism** (the gritty, blemished concrete-and-paint surface).
  Faking it with MeshStandardMaterial parameter tweaks will look worse
  than the honest flat colour.
* **Decals** (Soviet propaganda poster, calendar, faceless portrait). These
  need an alpha-mapped plane with a hand-authored texture; that lands in
  Sprint 3.
* **Volumetric god-rays from the bulb**. Tempting but expensive on low-
  end GPUs. Sprint 5 candidate only if perf budget allows.

### Bulb mesh ≠ bulb light position

As called out in §2, the visible glass sphere does not track the swayed
light. If a Phase-2 reviewer flags this as a bug: it's not. Sprint 3 fix.

### Single colour temperature

PLAN §2 wants "sodium-yellow only" so we have no cool-temperature accent
light. The radio dial (PALETTE.neon green) will need to glow on its own
later — that's a Sprint 3 emissive material job, not a Sprint 1 light.

---

## 5. Sprint 2 setup recommendations (HUD)

The HUD lands in Sprint 2. Designer recommendations for the dual-script
overlay PLAN §2 specifies ("ВЫСТРЕЛ / ATEŞ", "ШАНС / ŞANS: 1/6"):

### Type scale

Use a single scale anchored on the dual-script primary label. All
measurements are **rem-equivalent at 16px root**.

| Token             | px / rem    | Tailwind     | Use                            |
|-------------------|-------------|--------------|--------------------------------|
| `hud-display`     | 48 / 3.0    | `text-5xl`   | The 1/6 sayaç. Single use.     |
| `hud-primary`     | 24 / 1.5    | `text-2xl`   | Dual-script primary labels.    |
| `hud-secondary`   | 16 / 1.0    | `text-base`  | Cyrillic-then-Latin captions.  |
| `hud-meta`        | 12 / 0.75   | `text-xs`    | Microcopy, signature line.     |

Body minimum stays at 16px (PLAN §3 accessibility note). The 12px meta
size is only for the corner signature / version stamp and is not
interaction-bearing.

### Colour & glow

* Sayaç digits: `PALETTE.neon` (`#4a5d3a`) with a `2px` `text-shadow`
  glow of `PALETTE.neon` at 50% alpha. This pulls in the "vacuum-tube
  display" reading from PLAN §2's "lampovaya radyo gösterge" hint.
* Dual-script labels: `PALETTE.paper` (`#7a6a4e`) — kirli kâğıt, not
  pure white. Pure white on the cellar background would punch a hole
  in the dark and break the diegetic feeling.
* Warning glyphs (OSTOROZHNO / DİKKAT): `PALETTE.blood` (`#8b1a1a`), no
  glow. The colour is loud enough on its own.

### Glow direction

A subtle `0 0 2px` symmetric glow is the right reading for "old phosphor
display". A directional `0 2px 4px` drop-shadow would read "modern UI".
Resist the modern reading.

### Sayaç position

PLAN §2 mentions "mekanik flap-display estetiği" for the counter. Recommend
positioning the sayaç in the **lower-right corner** of the viewport at
`bottom-8 right-8` (32px inset). This sits inside the camera's reading-eye
zone (the table) but not over the revolver. The dual-script labels go
**top-center** at `top-6 left-1/2 -translate-x-1/2`.

### Touch targets (irrelevant for Sprint 2, document anyway)

There is no touch interaction in this app — the only inputs are
keyboard-driven (the trigger pull). If a hint hotkey label gains a click
target later, observe the 44×44pt minimum.

---

## 6. Designer review feedback to kraken

These are items I could not fix from `lighting.ts` + `scene-constants.ts`
alone, flagged for kraken to address before Sprint 1 Phase 3:

### 6.1 Fog density needs quality-tier wiring (HIGH)

Phase 1's `scene.ts:64` computes a single density from the linear-fog
`near`/`far` hint:

```ts
const density = 1 / Math.max(FOG.far - FOG.near, 1);  // ≈ 0.18
```

That hard-codes one density across all quality levels. Phase 2 added
`FOG_DENSITY_LOW`, `FOG_DENSITY_MEDIUM`, `FOG_DENSITY_HIGH` to
`scene-constants.ts`. **kraken-shader (Phase 2 batch B) or kraken (Phase 3)
should rewire `buildFog()` to read the density that matches the active
quality tier.** Suggested shape:

```ts
import { FOG_COLOR, FOG_DENSITY_LOW, FOG_DENSITY_MEDIUM, FOG_DENSITY_HIGH }
  from '../../shared/scene-constants';

function buildFog(quality: QualityLevel): FogExp2 {
  const density =
    quality === 'low' ? FOG_DENSITY_LOW :
    quality === 'high' ? FOG_DENSITY_HIGH :
    FOG_DENSITY_MEDIUM;
  return new FogExp2(new Color(FOG_COLOR), density);
}
```

`createScene()` then takes the active `QualityLevel` so the right fog gets
chosen at scene build time. (Switching density at runtime is possible too —
just assign `scene.fog.density` — but Sprint 1 doesn't need that yet.)

### 6.2 Bulb mesh sway (LOW, Sprint 3 ticket)

Tie `bulbMesh.position` to the light's swayed `(x, z)` so the visible glass
moves with the cast shadow. Or, better, ship a real GLB porcelain-duy
prop and a sway pivot in Sprint 3.

### 6.3 Renderer clear-colour vs fog colour (LOW, info only)

`scene.ts:45` calls `renderer.setClearColor(new Color(FOG.color))`. After
the FOG/FOG_COLOR split, this should read `FOG_COLOR` directly. Functional
equivalent; the rename is just for clarity. Non-blocking.

### 6.4 CSS custom properties (frontend-dev, not kraken)

For the CRT post-fx CSS layer that frontend-dev creates in Phase 2 batch B
(`src/renderer/styles/crt.css`), the recommended tuning surface is three
CSS custom properties. **Do not apply these from this file — they're
documented here for the frontend-dev review.**

```css
:root {
  /* Scanline alpha: 0 = invisible, 1 = pure black bars.
   * 0.18 hits the "broken signal" feeling without obscuring the room. */
  --crt-scanline-alpha: 0.18;
  /* Film grain opacity over the rendered scene. 0.08 is "old film stock". */
  --crt-grain-opacity: 0.08;
  /* Vignette strength at the corners. 0.5 is "viewfinder". */
  --crt-vignette-strength: 0.5;
}
```

These three values are the designer's tuning surface for the CRT
intensity. If the lobby reads "too clean" or "too thrashed" at final
review, adjusting these three values in `:root` should get it to the
right place without code changes elsewhere.

### 6.5 No Sprint 1 GLB props yet (info only)

Sprint 1 doesn't have the revolver, ashtray, votka bottle, podstakannik,
or radio GLBs. That means the table and shelves read as flat oak cubes.
The CRT + grain post-fx is doing 80% of the atmospheric heavy-lifting for
Sprint 1 — when the GLB swap lands in Sprint 3, the CRT intensity may
need to be reduced (the GLB textures will carry their own grime).

---

## Files touched by designer in Sprint 1 Phase 2

| File                                              | Change                                |
|---------------------------------------------------|---------------------------------------|
| `src/shared/scene-constants.ts`                   | Palette verify, BULB_LIGHT Lissajous, |
|                                                   | AMBIENT_LIGHT, FOG_COLOR + 3 density. |
| `src/renderer/scene/lighting.ts`                  | Lissajous sway, intensity pulse,      |
|                                                   | AmbientLight, refactor to small fns.  |
| `src/renderer/scene/atmosphere-direction.md`      | This file (NEW).                      |

## Files designer did NOT touch (collision-safety)

`scene.ts`, `camera.ts`, `shaders/*`, `post-fx/*`, `audio/*`,
`renderer/styles/*`, `renderer/index.html`, `src/main/*`, `src/preload/*`,
`scene/index.ts`. The ambient light was wired into the existing
`createBulbLight()` call chain via `light.add(ambient)` so no edit of
`scene/index.ts` was needed.

---

*End of designer atmosphere direction. Questions on visual decisions should
copy this file into the conversation so the rationale stays linked to the
constants.*
