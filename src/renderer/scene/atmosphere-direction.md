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

## 7. Sprint 2 — Revolver scene polish notes

> Appended 2026-05-20 by designer agent (Sprint 2 Phase 2A). These are
> Sprint 2 deltas on top of the Sprint 1 atmosphere direction in §1–§6.
> Revolver-specific tuning lives in
> `src/renderer/scene/revolver/revolver-direction.md`; this section
> documents the cross-cutting **atmosphere** decisions for the revolver
> scene that touch existing §2 lighting and §3 camera reading.

### 7.1 Cylinder spin: motion blur OFF (PLAN §6 literal)

PLAN §6: "spin (4 tur, ease-out, motion blur YOK — CRT trail)". The
spin's apparent motion smear must come from the CRT post-fx layer's
scanline persistence, **not** from a Three.js motion-blur pass or a
multi-sample render. Phase 2B kraken-revolver: do not add a
`MotionBlurPass` or `taa` accumulation buffer for the cylinder spin.

The CRT trail is already doing the right thing for free — adding
explicit motion blur on top would render the spin double-blurred and
read as "modern game with motion blur on" instead of "old CRT
displaying a moving object". The latter is the desired reading.

### 7.2 Camera shake on kick: +2° transient, sabit recovery

PLAN §6: "+2° kamera shake" on bang. SSOT
`KICK_CAMERA_SHAKE_DEG = 2` and `KICK_FLASH_FRAMES = 1` together
specify the shake shape. Designer ratifies the shape as a **single-
frame snap to +2°** followed by a **200ms recovery curve back to the
sabit camera transform**. The recovery uses a critically-damped spring
(no overshoot — overshoot reads as "stylised", we want "physical jolt
that the camera mount resists").

The Sprint 1 fixed-camera contract from §3 holds: there is no idle
camera breathing or parallax. The kick shake is the **only** camera
motion in the entire revolver scene and it is a one-shot tied to the
bang outcome. It must return exactly to the sabit transform — any
drift after the kick will accumulate over repeated bangs and break
the diegetic frame.

### 7.3 Bulb pulse on hold-state final 100ms: 4Hz micro-flicker

When the FSM is in `cocking` and `(nowMs - holdStartMs) >=
HOLD_ZOOM_DURATION_MS` (i.e. the last 100ms before commit), the bulb
gains a **4Hz micro-flicker at ±2% intensity** on top of its existing
14Hz AC ripple (§2 Lissajous + ripple).

This is the "tension threshold" cue from revolver-direction.md §3. The
two frequencies (4Hz tension pulse + 14Hz ambient pulse) are
deliberately independent — beating between them produces a brief
unpredictable brightness wobble that reads as "the bulb knows what's
about to happen". It's a small effect — Phase 2B implementers may
wonder if it's worth the wiring. It is. The wobble is the cue that
sells the hold's last beat.

Phase 2B note: implement the tension pulse as an **additive offset**
on the lighting.ts intensity calculation. Do not replace the 14Hz
ripple while the tension pulse is active — they sum.

### 7.4 Cock animation: 250ms snap (no easing — PLAN §6 literal)

PLAN §6: "cock (30° geri, snap)". The cock animation is a linear
30° hammer rotation over 250ms (`COCK_DURATION_MS = 250` and
`COCK_ANGLE_DEG = 30` in the SSOT). **No easing.** The animation should
feel mechanical — a real revolver's hammer has a spring with a defined
travel and break point; a linear interpolation reads as that
mechanism. An ease-out curve would read as "soft" and break the
snap.

The fall animation (`FALL_FRAMES = 1`) is also linear by definition (a
single-frame transition cannot have a curve). The kick animation's
recoil curve is the spring-damper from §7.2 above.

### 7.5 Atmosphere reading at click 6 (reveal-lite handoff)

At empty-click 6 the bulb intensity drops to `0.22 ×
BULB_LIGHT.intensity = 0.22 × 3.4 ≈ 0.75`. This is dim enough that
the AmbientLight floor (`AMBIENT_LIGHT.intensity = 0.05` from §2.5)
becomes a meaningful contributor to scene illumination for the first
time in the lobby. Designer ratifies the lit-by-ambient-floor reading
as the intended visual for reveal-lite: the room is "lit by the
darkness itself" — barely visible, but its shape is preserved.

Phase 2B lighting.ts implementers should NOT compensate the
AmbientLight upward to "rescue" the scene at click 6. The barely-
visible reading is the point.

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

---

## 8. Sprint 3 — Model freeze composition notes

> Appended 2026-05-20 by designer agent (Sprint 3 Phase 2A SOLO). These
> are Sprint 3 deltas on top of the Sprint 1 atmosphere direction in
> §1–§6 and the Sprint 2 revolver scene polish in §7. The model-freeze
> details live in `src/renderer/scene/model-freeze-direction.md`; this
> §8 documents the **cross-cutting atmosphere** decisions for the GLB
> swap that touch existing lighting / camera / composition reading.

### 8.1 Composition with real GLBs (the triangle reaffirmed)

Sprint 1 §3 set the camera at `(0, 1.6, 3.2)` looking at `(0, 0.75, 0)`.
Sprint 3 honours those values exactly — the camera transform is LOCKED.
What changes is what fills the frame:

- The Sprint 1 placeholder cubes are replaced by the seven GLBs per
  `model-freeze-direction.md` §2. The compositional intent is a
  **vertical triangle**: bulb (top apex) → table (base) → revolver
  (focal subject at base center). Off-table objects (chair, radio,
  bottle, ashtray) exist as silhouette context bracketing the focal
  surface.
- Sprint 1 §3.1 recommendations for Sprint 3 (pull back to posZ=3.5,
  drop to posY=1.45, 4° dolly toward chair) are **NOT applied**.
  Sprint 3 reasoning: the Sprint 2 revolver mechanic is already
  validated against the Sprint 1 framing; changing the camera now
  would require re-tuning the HOLD_ZOOM_FACTOR (which is calibrated
  against the existing fov 50). The framing stays Sprint 1's; if
  Sprint 5 QA reports the GLBs look cramped, revisit at Sprint 6.

### 8.2 Lightbulb GLB as visual anchor (Sprint 1 §2.6 compromise resolved)

Sprint 1 §2.6 documented the "bulb mesh ≠ bulb light position"
compromise: the placeholder sphere stayed fixed at the bulb origin
while the PointLight swayed in the Lissajous curve. The cast shadows
moved; the visible glass did not. Sprint 3 resolves this.

**Resolution (per model-freeze-direction.md §3.1):** `lightbulb.glb`
becomes a CHILD of the PointLight via `pointLight.add(lightbulbScene)`.
Three.js scene-graph inheritance means the GLB's world position
follows the PointLight's swayed position automatically. The Sprint 1
placeholder sphere stays in the codebase as the `useGlbs=false`
fallback but is hidden when the GLB mounts.

This resolution lands cheaply (one `.add()` call, no per-frame sync
code) and finally honours PLAN §2 "Tavan: Çıplak ampul, beyaz porselen
duy. Hafif sallanır." — the visible bulb now physically sways with
the light it casts.

### 8.3 BULB_LIGHT.intensity = 3.4 reconciliation (Sprint 1 §2.1 holds)

The Sprint 1 designer tuned `BULB_LIGHT.intensity = 3.4` against flat
oak `BoxGeometry` placeholders. The GLB swap introduces:

- A revolver with a darker albedo (`#1a1816` override per
  model-freeze §2.1) — slightly less light returned to camera.
- A table with PS1 affine-UV warp at 'high' tier — the warp doesn't
  change brightness, just UV coordinate stability.
- A bottle with green-tan glass tint catching less light than flat
  oak.

Net change: **the table-top region reads slightly darker overall** but
the contrast ratio between revolver-lit and table-shadow is
preserved. Sprint 1's intensity 3.4 still works — no tweak Sprint 3.

If Sprint 5 QA reports the room feels "underlit" with the GLBs in
place, the right channel to widen is the `BULB_LIGHT.intensity` value
in `scene-palette.ts` — not a per-material multiplier on the GLBs.
Keep the lighting math one-knob.

### 8.4 AmbientLight floor (Sprint 1 §2.5 holds)

`AMBIENT_LIGHT.intensity = 0.05` was tuned against flat-cube
silhouettes. The GLBs have more form — more curved surfaces, more
edge planes — than the cubes. The ambient floor's job (revealing
form in unlit regions) becomes MORE important with the GLBs, not
less.

The intensity stays at 0.05 because **the goal is form-revealing,
not form-flattening**. A higher ambient would soften the chiaroscuro
the bulb cone creates on the table top. Phase 2B kraken-loader MUST
NOT raise this value to compensate for "dark corners with the GLBs in
place" — dark corners are the point.

### 8.5 PS1 affine-UV shader activation (TH-S1-05 close)

Sprint 1 Phase 2 (kraken-shader) created the `ps1-affine-uv.glsl`
fragment shader but couldn't ship it because the placeholder cubes
were `MeshStandardMaterial` with no UV-mapped textures. Sprint 3
activates the shader on 5 GLB meshes + 3 procedural texture surfaces.

**Activated surfaces** (model-freeze §6.1 table — copied here for
atmosphere reading):

| Tier   | Where the warp lands                                                |
|--------|---------------------------------------------------------------------|
| low    | nowhere — MeshStandardMaterial direct, no shader pass               |
| medium | 8 surfaces with reduced amplitude (× 0.5)                           |
| high   | 8 surfaces with full amplitude — table, chair, radio, bottle,       |
|        | ashtray, cyrillic-envelope, faded-portrait, soviet-poster           |

**What the warp adds to the atmosphere:** the PS1-era graphics
reading PLAN §2 line 42 promised ("PS1 low-poly estetik. Vertex snap
shader, affine UV warp..."). Sprint 1 shipped the vertex snap; Sprint
3 ships the UV warp. Together they give the room the "bozuk kayıt"
(broken recording) feel from BUCKSHOT_ROULETTE_THEME.md line 19 — the
surfaces look slightly off-register, like a corrupted save state.

The revolver is intentionally exempted from the warp (model-freeze
§6.1 — the revolver is the focal subject; UV distortion on the barrel
would break the chiaroscuro reading). The lightbulb GLB is also
exempted (its mesh is bulb-light-position-anchor; warping would make
the glass visually drift from the PointLight).

### 8.6 Smoke particle compositional integration

The cigarette smoke column above the ashtray (model-freeze §5) is
**atmospheric texture, not a focal element**. It serves the
composition triangle by adding slow upward motion in the right-third
of the table — reinforcing the bulb-table-revolver vertical axis
without competing for the eye.

**Frequency design (incommensurable with bulb sway):**
- Bulb Lissajous: 3.7s and 4.9s (Sprint 1 §2.2)
- Smoke drift: 3.33s (`SMOKE_PARTICLE_DRIFT_FREQUENCY_HZ = 0.3` ⇒
  period ≈ 3.33s)

The three periods are pairwise incommensurable — the bulb and the
smoke never visually sync, the column drift never aligns with the
bulb's pendulum. The brain reads "two unrelated motions in the same
still room" as ambient noise (correct), not as choreographed motion
(wrong).

**Particle render mode:** THREE.Points + PointsMaterial, no texture.
Single colour `#d8d0c0` (PALETTE.paper × 1.7 clamped). This is the
right call for the PS1 aesthetic — sprite particles with proper
textures would read as "modern atmospheric effect"; flat-colour
Points read as "low-end engine ambient fog".

### 8.7 Procedural texture compositional integration (§4 cross-ref)

The three procedural textures from model-freeze §4 land on the back
wall (portrait, poster) and table top (envelope, Sprint 4 placement
target). Atmosphere reading:

- **Back wall density:** TWO textures (portrait at right, poster at
  left). The wall stays at PALETTE.oak fill colour between them.
  More textures (calendar, second portrait, paper note) push the
  wall into diorama territory — Sprint 3 ships at the lower density
  per model-freeze §7.4.
- **Table top density:** the envelope (Sprint 4 placement) plus the
  procedural 5 kopek coin (model-freeze §7.6, Sprint 4 default) plus
  the revolver, bottle, ashtray. Sprint 3 ships the GLBs +
  generated-but-not-placed envelope. Sprint 4 places the envelope on
  the table top during destruction-director scene prep.
- **Wall plane → camera distance:** the back wall is at z=-3,
  ~6.2m from camera. The portrait and poster procedural textures are
  rendered at 512×512 and read as low-resolution wall hangings at
  that distance — exactly the PS1-era "wall hanging texture" feel.
- **Cyrillic anonymity (model-freeze §1 + §4):** all designer-
  authored Cyrillic content (envelope addressing, poster text,
  portrait nameplate if added Sprint 4) is **fictional and
  glyphic**. No real person's name, no real address, no real slogan,
  no recognisable Soviet historical reference. This is both an
  atmospheric decision (the room is anonymous, leaks story, doesn't
  name names) and a telif-safety decision (security-reviewer Phase 5
  passes without rights-clearance investigation).

### 8.8 Sprint 4 destruction-director hand-off contract

The destruction-director (PLAN §7, Sprint 4) cuts apartment-bleed
flicker frames during the destruction sequence. The bleeds are
0.2–0.8s flashes of the bodrum oda back into the OS-mimicry
destruction. The composition the bleed reveals must be the **frozen
Sprint 3 model arrangement** — the same revolver position, same bulb
sway, same chair angle, same smoke column.

This is what model-freeze §9 sign-off locks: post-Sprint 3, no GLB
position changes, no material overrides, no DARKEN_CURVE retuning.
The bleed frames are baked against this composition; changing it
would require re-recording the destruction-director's timing against
the new composition.

### 8.9 What atmosphere-direction.md does NOT touch Sprint 3

For Phase 2B implementer collision-safety, designer Phase 2A
explicitly does NOT touch:
- `BULB_LIGHT.intensity` or any field in `scene-palette.ts` — Sprint 1
  Phase 2 tuning is locked.
- `AMBIENT_LIGHT.intensity` — Sprint 1 Phase 2 tuning is locked.
- `CAMERA.*` — sabit camera contract holds (PLAN §2).
- `FOG_*` — Sprint 1 Phase 2 tuning is locked.
- `BulbLightHandle` interface in `lighting.ts` — Phase 2B kraken-loader
  extends with `attachLightbulbGlb(handle)` per model-freeze §8.3;
  designer does not pre-write that function.
- `Ps1MaterialFactory` — Sprint 1 shader contract is locked; Phase 2B
  kraken-loader reuses the existing factory pattern for the GLB swap.

The Sprint 3 atmosphere additions are entirely in the **new** territory:
model-freeze-direction.md (this file's sibling), the MODEL_*
constants in scene-model-constants.ts, and the §8 you are reading. No
existing Sprint 1 / Sprint 2 atmosphere file gets edited beyond this
append.

---

*End of Sprint 3 atmosphere addendum. The model-freeze-direction.md
companion file is the load-bearing artifact for Phase 2B GLB
integration; §8 here is the atmosphere cross-reference for
implementers who need the Sprint 1 / Sprint 2 context next to the
Sprint 3 changes.*
