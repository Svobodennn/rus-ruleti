# Model Freeze Direction — Sprint 3 Phase 2A

> Designer note. Authored 2026-05-20 by designer agent (Sprint 3 Phase 2A SOLO)
> for the parallel Phase 2B batch (kraken-loader + frontend-dev procedural
> textures + kraken-particles smoke) and for the Sprint 4 destruction
> director that will consume the room composition as its t=0 frame for
> ApartmentBleed flicker cuts. Read this **with**
> `atmosphere-direction.md` (Sprint 1+2) and `revolver-direction.md`
> (Sprint 2) open — the three documents share constants and language. If
> a tweak makes the room "look nicer" but breaks the composition rule in
> §1, reject it.

The bodrum oda is **a single bulb, a table, a revolver, and seven props
arranged so the only thing that ever competes for the eye is the
revolver**. Sprint 3 closes the gap between Sprint 1's flat oak cubes and
the PLAN §2 "Khrushchyovka bodrumu" promise: real geometry, real
materials, real procedural typography on the wall, real cigarette smoke
above the ashtray. The composition rule in §1 is the
non-negotiable contract — every other section is the means to that end.

---

## Table of contents

- [§1 Composition philosophy](#1-composition-philosophy)
- [§2 Per-object specifications](#2-per-object-specifications)
- [§3 Lighting per object](#3-lighting-per-object)
- [§4 Procedural textures (frontend-dev spec)](#4-procedural-textures-frontend-dev-spec)
- [§5 Smoke particle system (kraken-particles spec)](#5-smoke-particle-system-kraken-particles-spec)
- [§6 PS1 affine-UV shader activation (TH-S1-05 close)](#6-ps1-affine-uv-shader-activation-th-s1-05-close)
- [§7 Composition polish tuning items](#7-composition-polish-tuning-items)
- [§8 Phase 2B kraken-loader validation list](#8-phase-2b-kraken-loader-validation-list)
- [§9 Model freeze checklist (Phase 5 sign-off)](#9-model-freeze-checklist-phase-5-sign-off)

---

## 1. Composition philosophy

### The one rule

**Every object on the table is visible to the centered camera. Every
object off the table exists as silhouette context and never competes for
focus with the revolver.**

That is the contract. Phase 2B implementers and Sprint 4+ reviewers
should read it as a hard test: if a GLB lands such that its bright face
or unusual silhouette pulls the eye away from the revolver — *even
once*, even in motion — the placement is wrong. Move it, scale it, or
rotate it into shadow. The seven props are atmosphere. The revolver is
the subject.

### Why this rule, not "make it look full"

The Sprint 1 placeholder room was four flat oak cubes and a sphere. It
read brutally minimal — which is exactly the PLAN §2 promise. Sprint 3
adds seven actual GLBs to the scene, and the temptation to "fill out
the space" is the most likely way to break the brief. PLAN §2 line 18
("Atmosfer karakterdir. Soğuk beton, çıplak ampul, uzaktan akordeon")
specifies an environment that **leaks story** rather than presents it.
Every prop that draws the eye away from the table is a prop that breaks
that leak — it turns the room from "abandoned cellar" into "dressed
diorama".

The Buckshot Roulette reference (`BUCKSHOT_ROULETTE_THEME.md` line 17:
"klostrofobik minimalizm: az mekan, az karakter, az kelime — ama her
detay maksimum yoğunlukta") is the working aesthetic anchor. Buckshot's
camera frames a table, a dealer, a shotgun, and one or two pickup
objects per round. The room behind is geometry that decays into the
dark before the eye can read it. Rus Ruleti's bodrum oda must read the
same way: a table, a revolver, the bulb above, and silhouette geometry
around the edges.

### Triangle of focus: bulb → table → revolver

The composition is a vertical triangle:

- **Bulb (top apex)** at y=2.4, slightly swayed in the Lissajous curve
  from `atmosphere-direction.md` §2. The bulb is the source of light
  and the highest-y point in the scene; it draws the eye upward and
  the cast cone draws it back down to the table.
- **Table (bottom-wide base)** at y=0..0.79, centered at origin. The
  revolver sits on top, the bottle and ashtray bracket it on the left
  and right. The table top is the visual stage.
- **Revolver (bottom center)** at y≈0.79, world origin x,z. The cast
  bulb cone lands on the table here; the revolver is the object that
  cone is pointing at.

Every other prop must serve this triangle:

- **Chair** lives **behind** the table (z=-0.9). Its job is to suggest
  "someone was sitting here" without becoming a character. The chair
  silhouette is taller than the table from the camera angle, but it
  sits in shadow (the bulb cone doesn't reach z=-0.9 strongly), so the
  silhouette reads as cellar geometry, not as a focal element.
- **Radio** lives **behind and to the right** (x=1.6, z=-1.2). The
  green dial glow (Sprint 4 emissive material work — Sprint 3 freezes
  the model) gives the upper-right corner a cool spot that contrasts
  with the sodium bulb without competing brightness-wise. In Sprint 3
  the radio is dark; the glow lands later.
- **Bottle** lives **on the table, left of the revolver** (x=-0.6,
  z=-0.2). It is a silhouette object — a tall vertical mass that
  visually anchors the left side of the table top. It does NOT have a
  glowing label; the glass tint is faded green-tan, sub-bulb.
- **Ashtray** lives **on the table, right of the revolver** (x=0.4,
  z=0.1). The smoke column rises from it (§5) toward the bulb,
  reinforcing the vertical triangle. The ashtray itself is small and
  low — it does not compete with the revolver for horizontal mass.
- **Lightbulb mesh** lives **at the top apex** (x=0, y=2.4, z=0). The
  porcelain duy + glass envelope replace the Sprint 1 placeholder
  sphere as the visual anchor for the PointLight. The bulb sways with
  the light in Sprint 3 (Sprint 1 §2 compromise resolved here).

### Brutalist anonymity (PLAN §2 reaffirmation)

PLAN §2 line 67 specifies the back wall: "Yüzü silinmiş kara çerçeveli
portre. Sayfası yırtık takvim. Soluk Sovyet propaganda afişi (yazılar
okunmaz, kendi tasarımı)." Sprint 3 honours this literally:

- The **faded portrait** is silhouette ONLY. Head and shoulders of an
  anonymous figure in a greatcoat — no recognizable face, no real
  person, no historical figure. Heavy fade.
- The **propaganda poster** is OWN geometric design — not a real Soviet
  poster reproduction. Limited PALETTE.blood / .rust / .paper. Cyrillic
  letterforms are non-recognizable typography (PLAN §10 line 524: "
  yazılar okunmaz, kendi tasarımı"). Frontend-dev Phase 2B designs the
  shape; the text content is glyphic, not lexical.

This is both an aesthetic decision (the room is anonymous, the player
is alone with the revolver — putting an identifiable face on the wall
would graft a character into the void that PLAN §2 keeps deliberately
empty) and a telif-safety decision (no real person's likeness, no real
historical poster reproduction means the security-reviewer Phase 5
audit passes without rights-clearance investigation).


---

## 2. Per-object specifications

Every value below is a NAMED constant in `src/shared/scene-model-constants.ts`
(Sprint 3 structural rule: no "named OR justified inline" loophole; every
numeric value Phase 2B will reference exists as a NAMED export here).

Conventions:
- **Scale** is the uniform multiplier passed to `Group.scale.setScalar`.
  Poly Pizza models typically ship at ~1m world-unit scale; scale ≠ 1
  means the source GLB was authored at a different intended size.
- **Position** is `(x, y, z)` in metres. Floor is y=0; table top is at
  y≈0.79 in placeholder coordinates (BoxGeometry height 0.08 +
  center-y 0.75 = top at 0.79).
- **Rotation** is `(rotX, rotY, rotZ)` Euler radians. The Three.js
  default Euler order ('XYZ') applies.
- **Polycount expected** is the designer's pre-load estimate from the
  Poly Pizza listing or README; **polycount target** is the PLAN §6
  budget (≤ 3000 tris per asset, ≤ 5000 for the revolver). Phase 2B
  kraken-loader logs the **actual** count at load time and surfaces
  via `document.body.dataset['polycount-<key>']` if over target.

### 2.1 Revolver

| Field          | Value                          | Rationale                                            |
|----------------|--------------------------------|------------------------------------------------------|
| Constant       | `MODEL_SCALE_REVOLVER = 0.9`   | Poly Pizza Quaternius revolver ships at ~28cm long;  |
|                |                                | scale 0.9 brings barrel to ~25cm, real Nagant M1895  |
|                |                                | reading.                                             |
| Constant       | `MODEL_POSITION_REVOLVER`      | `[0, 0.79, 0.1]` — origin on table top, slightly     |
|                | `= [0, 0.79, 0.1]`             | forward of center so camera reads barrel clearly.    |
| Constant       | `MODEL_ROTATION_REVOLVER`      | `[0, -Math.PI/2, 0]` — barrel pointing left (player  |
|                | `= [0, -Math.PI/2, 0]`         | side); the grip faces the chair (z=-0.9). Reads     |
|                |                                | "someone set this down with the muzzle pointed away  |
|                |                                | from themselves" — narrative detail.                 |
| Expected tris  | ~500 (Poly Pizza listing)      |                                                      |
| Target tris    | ≤ 3000 (PLAN §6 ≤ 5000 ceiling)| Massive headroom; the model is small.                |
| Material note  | matte steel — override         | The Quaternius revolver may ship with a slightly     |
|                | `material.color` to `#1a1816`  | glossy gunmetal. Override to a darker, matter steel  |
|                | (just above PALETTE.oak)       | so the bulb cone reads as a *highlight* on the       |
|                |                                | barrel rather than the whole surface being lit.      |

### 2.2 Chair

| Field          | Value                          | Rationale                                            |
|----------------|--------------------------------|------------------------------------------------------|
| Constant       | `MODEL_SCALE_CHAIR = 1.0`      | Poly Pizza Quaternius chair ships at ~0.9m tall —    |
|                |                                | matches Sprint 1 placeholder cube height 0.9.        |
| Constant       | `MODEL_POSITION_CHAIR`         | `[0.05, 0, -0.9]` — 5cm off the centerline, behind   |
|                | `= [0.05, 0, -0.9]`            | the table. The 5cm dolly reads "this is a real       |
|                |                                | chair someone walked away from" (Sprint 1 §3        |
|                |                                | recommendation finally realized).                    |
| Constant       | `MODEL_ROTATION_CHAIR`         | `[0, Math.PI/12, 0]` — 15° rotated counterclockwise. |
|                | `= [0, Math.PI/12, 0]`         | The chair is not square to the table; whoever sat    |
|                |                                | there pushed back at an angle. Subtle but humanises. |
| Expected tris  | ~400                           |                                                      |
| Target tris    | ≤ 3000                         |                                                      |
| Material note  | dark oak — override            | Most Poly Pizza chairs ship a light wood tone.       |
|                | `material.color` to            | Override to PALETTE.oak (`#1c1814`) so the chair     |
|                | `PALETTE.oak`                  | reads brutally heavy. NO highlight detail; the       |
|                |                                | chair lives in shadow (the bulb cone barely reaches  |
|                |                                | z=-0.9).                                             |

### 2.3 Radio

| Field          | Value                          | Rationale                                            |
|----------------|--------------------------------|------------------------------------------------------|
| Constant       | `MODEL_SCALE_RADIO = 0.85`     | Poly Pizza radio ships at ~0.4m wide. Sprint 1       |
|                |                                | placeholder was 0.35m wide. Scale 0.85 brings it to  |
|                |                                | ~0.34m — matches the placeholder and reads as a      |
|                |                                | table-edge bench-top device.                         |
| Constant       | `MODEL_POSITION_RADIO`         | `[1.6, 0.1, -1.2]` — matches Sprint 1 placeholder    |
|                | `= [1.6, 0.1, -1.2]`           | exactly. The radio sits on a low shelf, far-right,   |
|                |                                | behind the table. Camera reads it as a corner mass.  |
| Constant       | `MODEL_ROTATION_RADIO`         | `[0, -Math.PI/8, 0]` — 22.5° turned toward the       |
|                | `= [0, -Math.PI/8, 0]`         | camera so the dial face (Sprint 4 emissive) is       |
|                |                                | visible. Without this rotation the face would point  |
|                |                                | into the corner and be invisible.                    |
| Expected tris  | ~300                           |                                                      |
| Target tris    | ≤ 3000                         |                                                      |
| Material note  | wood cabinet — override        | The Quaternius radio is "generic vintage" per        |
|                | `material.color` to            | README — likely ships in light brown. Override to    |
|                | `PALETTE.rust`                 | PALETTE.rust (`#3d2817`) so the radio cabinet reads  |
|                |                                | as the wooden lampovaya radyo PLAN §2 specifies.     |
|                |                                | The green dial glow is a Sprint 4 emissive add — NOT |
|                |                                | a Sprint 3 material override.                        |

### 2.4 Bottle

| Field          | Value                          | Rationale                                            |
|----------------|--------------------------------|------------------------------------------------------|
| Constant       | `MODEL_SCALE_BOTTLE = 0.75`    | Poly Pizza spirit bottle ships at ~0.4m tall. Real   |
|                |                                | 0.5L Stolichnaya is ~26cm. Scale 0.75 → ~0.3m,       |
|                |                                | matches the 0.5L vodka silhouette.                   |
| Constant       | `MODEL_POSITION_BOTTLE`        | `[-0.5, 0.79, -0.2]` — on the table top, left side,  |
|                | `= [-0.5, 0.79, -0.2]`         | slightly behind the revolver. The bottle silhouette  |
|                |                                | anchors the left edge of the table-top composition.  |
| Constant       | `MODEL_ROTATION_BOTTLE`        | `[0, Math.PI/6, 0]` — 30° rotated so the label face  |
|                | `= [0, Math.PI/6, 0]`          | (Sprint 4 texture-paint pass: "Stolichnaya" hint)    |
|                |                                | catches the bulb cone at a glancing angle. Reads as  |
|                |                                | "puslu etiket" per PLAN §2 line 66.                  |
| Expected tris  | ~200                           |                                                      |
| Target tris    | ≤ 3000                         |                                                      |
| Material note  | faded green glass — override   | Quaternius bottles often ship clear or amber.        |
|                | `material.color` to            | Override to a faded green-grey                       |
|                | `#4a5d3a` × 0.35               | (PALETTE.neon × 0.35, darker than the radio dial    |
|                |                                | glow). Opaque, not transparent — alpha-blended       |
|                |                                | glass would add a transparent-render pass that the   |
|                |                                | PS1 affine-UV shader doesn't expect.                 |

### 2.5 Table

| Field          | Value                          | Rationale                                            |
|----------------|--------------------------------|------------------------------------------------------|
| Constant       | `MODEL_SCALE_TABLE = 1.15`     | Poly Pizza dook table likely ships at ~1.2m long.    |
|                |                                | Scale 1.15 brings to ~1.4m, matching Sprint 1        |
|                |                                | placeholder (BoxGeometry width 1.4).                 |
| Constant       | `MODEL_POSITION_TABLE`         | `[0, 0, 0]` — table sits on the floor at world       |
|                | `= [0, 0, 0]`                  | origin. Sprint 1 placeholder centered the cube at    |
|                |                                | y=0.75 because BoxGeometry centers on its origin; a  |
|                |                                | GLB usually has its origin at the base, so y=0 puts  |
|                |                                | the table on the floor naturally. Phase 2B verify.   |
| Constant       | `MODEL_ROTATION_TABLE`         | `[0, 0, 0]` — square to the room. The chair (§2.2)   |
|                | `= [0, 0, 0]`                  | gets the 15° rotation; the table stays grid-aligned. |
| Expected tris  | ~500                           |                                                      |
| Target tris    | ≤ 3000                         |                                                      |
| Material note  | scuffed oak — override         | The dook table will likely ship in light pine.       |
|                | `material.color` to            | Override to PALETTE.oak (`#1c1814`). The table is    |
|                | `PALETTE.oak`                  | the largest single surface in view; if its albedo    |
|                |                                | is too bright the bulb cone over-illuminates and the |
|                |                                | revolver loses its chiaroscuro highlight.            |

### 2.6 Ashtray

| Field          | Value                          | Rationale                                            |
|----------------|--------------------------------|------------------------------------------------------|
| Constant       | `MODEL_SCALE_ASHTRAY = 0.6`    | Poly Pizza dook ashtray likely ships at ~0.25m       |
|                |                                | wide. Scale 0.6 brings to ~0.15m — coffee-table      |
|                |                                | ashtray size.                                        |
| Constant       | `MODEL_POSITION_ASHTRAY`       | `[0.4, 0.79, 0.1]` — on the table top, right of      |
|                | `= [0.4, 0.79, 0.1]`           | the revolver, same z as the revolver so the smoke    |
|                |                                | column (§5) rises in the same plane as the           |
|                |                                | revolver-bulb axis.                                  |
| Constant       | `MODEL_ROTATION_ASHTRAY`       | `[0, Math.PI/5, 0]` — 36° rotated. Ashtrays are      |
|                | `= [0, Math.PI/5, 0]`          | rarely square to the table; the rotation reads       |
|                |                                | "someone pushed this aside to put the gun down".     |
| Expected tris  | ~300                           |                                                      |
| Target tris    | ≤ 3000                         |                                                      |
| Material note  | dark ceramic — override        | The dook ashtray will likely ship in white or grey.  |
|                | `material.color` to            | Override to a near-shadow tone with a slight rust    |
|                | `#2a2520` (PALETTE.shadow      | bias — the ashtray has cigarette ash on it           |
|                | × 1.4)                         | (procedural cigarette stub on top per                |
|                |                                | README "Procedural fallbacks") which renders         |
|                |                                | brighter; the bowl itself stays dark.                |

### 2.7 Lightbulb

| Field          | Value                          | Rationale                                            |
|----------------|--------------------------------|------------------------------------------------------|
| Constant       | `MODEL_SCALE_LIGHTBULB = 0.7`  | Poly Pizza Jason Toff lightbulb likely ships at      |
|                |                                | ~0.2m total (porcelain duy + glass envelope). Scale  |
|                |                                | 0.7 → ~0.14m, matching a real incandescent bulb      |
|                |                                | from a porcelain socket on a hanging cable.          |
| Constant       | `MODEL_POSITION_LIGHTBULB`     | `[0, 2.4, 0]` — matches BULB_LIGHT.posY (Sprint 1    |
|                | `= [0, 2.4, 0]`                | designer-tuned). The lightbulb mesh replaces the     |
|                |                                | Sprint 1 placeholder sphere (lighting.ts             |
|                |                                | createBulbMesh) as the visual anchor for the         |
|                |                                | PointLight. See §3.1 for the parent-attach pattern.  |
| Constant       | `MODEL_ROTATION_LIGHTBULB`     | `[0, 0, 0]` — neutral; the bulb hangs straight       |
|                | `= [0, 0, 0]`                  | down. Sway is animated in the Lissajous curve, not   |
|                |                                | baked into rotation.                                 |
| Expected tris  | ~600                           |                                                      |
| Target tris    | ≤ 3000                         |                                                      |
| Material note  | porcelain duy + glass —        | Two-material model. The porcelain duy at the top     |
|                | duy keeps GLB material         | (`#e8e0d0`-ish ceramic) is fine; the glass envelope  |
|                | (likely ceramic-tinted);       | (likely emissive in the GLB to imply "this is a      |
|                | glass envelope: turn OFF       | bulb") MUST have its `material.emissive` set to      |
|                | emissive, use MeshStandardMat  | black/`#000000`. The Sprint 1 PointLight is what     |
|                | with `color = PALETTE.sodium`  | casts light; the bulb mesh just stands in for the    |
|                |                                | glass envelope visually. Two competing light sources |
|                |                                | (PointLight + emissive glass) would either           |
|                |                                | double-light the table or fight for the bloom        |
|                |                                | budget in post-fx. Kill the GLB emissive.            |

### 2.8 Coordinate cross-check (camera frame)

The camera at `(0, 1.6, 3.2)` looking at `(0, 0.75, 0)` with fov 50°
captures the table top horizontally to about x=±1.3 and the back wall
at z=-3 to about y=2.4. Cross-checking the positions above:

| Object     | (x, y, z)                       | In-frame? | Notes                                                                |
|------------|---------------------------------|-----------|----------------------------------------------------------------------|
| Revolver   | `(0, 0.79, 0.1)`                | YES       | Dead center of frame — the focal subject.                            |
| Bottle     | `(-0.5, 0.79, -0.2)`            | YES       | Left edge of table top, in frame, in light cone.                     |
| Ashtray    | `(0.4, 0.79, 0.1)`              | YES       | Right of revolver, in frame, in light cone.                          |
| Table      | `(0, 0, 0)`                     | YES       | Fills lower-half of frame.                                           |
| Chair      | `(0.05, 0, -0.9)`               | YES       | Silhouette behind table top, in lower light.                         |
| Radio      | `(1.6, 0.1, -1.2)`              | YES       | Far-right corner mass, in shadow.                                    |
| Lightbulb  | `(0, 2.4, 0)`                   | YES       | Top of frame, hangs down into upper-third.                           |
| Radiator   | `(-1.9, 0.55, -0.3)` (Sprint 1) | EDGE      | Stays a placeholder cube Sprint 3 — left edge,                       |
|            |                                 |           | partially clipped by camera left edge per Sprint 1                  |
|            |                                 |           | placeholder placement. NO GLB swap in Sprint 3.                      |

No GLB position is outside the camera frustum; the radiator stays a
placeholder cube and is acceptable as a left-edge silhouette mass.
Sprint 4 may swap it for a CC0 radiator GLB if a candidate appears in
`incoming/`.


---

## 3. Lighting per object

The Sprint 1 lighting subsystem (`lighting.ts` BulbLightHandle) already
implements: PointLight + AmbientLight, Lissajous sway, 14Hz AC ripple,
empty-click DARKEN_CURVE, tension micro-pulse. None of those touch in
Sprint 3 — the lighting math is locked. What Sprint 3 changes is **what
receives light** and **where the visible light anchor lives**.

### 3.1 Lightbulb mesh as the visible light anchor

The Sprint 1 placeholder sphere (`placeholder-bulb`, createBulbMesh in
lighting.ts) stays at the bulb origin and does NOT move while the
PointLight sways. Sprint 1 §2 marked this as an acceptable compromise
to be resolved in Sprint 3. Sprint 3 resolves it as follows.

**Parent-attach pattern (recommended for Phase 2B kraken-loader):**

```text
PointLight (the light source — sways in Lissajous curve)
  └─ AmbientLight (child — position-irrelevant)
  └─ lightbulb.glb scene (child — INHERITS the PointLight's swayed position)
```

The lightbulb GLB becomes a CHILD of the PointLight via
`pointLight.add(lightbulbGroup)`. Three.js scene-graph inheritance
means the GLB inherits the PointLight's per-frame x/z sway from
buildSwayUpdater (`lighting.ts:215-216`). Zero extra animation code:
the GLB sways physically because its parent does.

**Why this and not "sibling at same world position":**

A sibling approach (PointLight and GLB both children of the same
Group, with a separate update function syncing GLB.position to
PointLight.position every frame) duplicates the sway math and creates
a one-frame lag between the cast light and the visible bulb. Players
won't notice the lag at 60fps, but Phase 2B implementers will be
tempted to "fix" it with explicit position sync code that the
parent-attach pattern makes unnecessary. Skip the work — use the
scene graph.

**Sprint 1 placeholder-bulb removal:**

The Sprint 1 createBulbMesh's sphere stays in the codebase but Phase
2B kraken-loader hides it (`bulbMesh.visible = false`) once the GLB
is attached. Kept for the `useGlbs=false` diagnostic fallback path.
DO NOT delete the placeholder mesh — Sprint 4 destruction-director
may use it as a fallback if a runtime GLB load failure leaves the
scene with no visible bulb.

### 3.2 PointLight emissive contention

`lightbulb.glb` (Jason Toff, CC-BY 4.0) likely ships with the glass
envelope flagged emissive — the model maker wanted "this looks like a
bulb that's lit" even without a real light source. In our scene the
PointLight is the real light source; an emissive glass envelope adds
a second light contribution that:

1. Double-lights the table top (emissive contributes brightness to
   adjacent pixels via the bloom pass — though bloom is dormant in
   Sprint 3 post-fx).
2. Competes with the PointLight's intensity at low DARKEN_CURVE
   values. At click 6 the PointLight is at 22% of baseline; an
   emissive glass at 100% emissive would visually mask the dimming.

**Decision: turn the emissive OFF.** Phase 2B kraken-loader walks the
loaded lightbulb scene graph; on any material named "glass" / "bulb"
/ "envelope" (Phase 2B determines from the actual GLB tree), set
`material.emissive = new Color(0x000000)` and
`material.emissiveIntensity = 0`. The base color stays
PALETTE.sodium so the visible glass envelope is the right colour
under the cast light.

### 3.3 Per-object light reception

| Object     | Receives PointLight? | Self-emit? | Notes                                                                  |
|------------|----------------------|------------|------------------------------------------------------------------------|
| Revolver   | YES (strongly)       | NO         | Bulb cone lands directly on the table top; revolver is the brightest   |
|            |                      |            | object in frame after the bulb itself. Material override §2.1 darkens  |
|            |                      |            | the albedo so the highlight reads as specular, not diffuse over-light. |
| Bottle     | YES                  | NO         | Edge-of-cone illumination on the left. Faded green glass tint catches  |
|            |                      |            | the sodium light as a yellow-green mid-tone — the "puslu etiket"       |
|            |                      |            | reading per PLAN §2.                                                   |
| Ashtray    | YES                  | NO         | Edge-of-cone on the right. Cigarette stub on top (procedural)          |
|            |                      |            | catches more light than the bowl itself.                               |
| Table      | YES (largest face)   | NO         | The table top fills the lower-half of the camera frame. This surface   |
|            |                      |            | is where the chiaroscuro lives — the area directly under the bulb is   |
|            |                      |            | bright; the corners fall into shadow within ~0.7m of the centerline    |
|            |                      |            | because of the inverse-square decay.                                   |
| Chair      | weakly               | NO         | At z=-0.9 the chair is about 2.5m from the bulb (Pythagoras over the   |
|            |                      |            | table top + the y-offset). With decay=2 the inverse-square is ~16% of  |
|            |                      |            | the table-top intensity. AmbientLight at 0.05 contributes the rest —   |
|            |                      |            | the chair reads as a silhouette with form, not as a void.              |
| Radio      | weakly               | NO Sprint 3| Far-right corner mass at ~3.2m distance — ~10% of bulb intensity.      |
|            |                      | (Sprint 4) | Sprint 4 adds the green dial glow as an emissive material. Sprint 3    |
|            |                      |            | the radio is dark — it reads as a silhouette mass, which is fine for   |
|            |                      |            | the composition rule (§1 — off-table objects are silhouette context).  |
| Lightbulb  | self (the source)    | NO         | The GLB's glass envelope is base-colored PALETTE.sodium but its        |
|            |                      |            | emissive material is killed per §3.2. The PointLight does the          |
|            |                      |            | lighting.                                                              |

### 3.4 AmbientLight reconciliation (Sprint 1 §2.5 still holds)

`AMBIENT_LIGHT.intensity = 0.05` is still the right value with the GLB
swap. The Sprint 1 reasoning ("the minimum that resolves form without
softening the bulb's high-contrast directionality") survives the
geometry change — the GLBs have more form than the placeholder cubes,
so the ambient floor matters MORE for revealing their shape in the
unlit regions, not less.

**Phase 2B should NOT raise AMBIENT_LIGHT.intensity to compensate for
"the GLBs look dark in the corners". Dark corners are the point.**

### 3.5 BULB_LIGHT.intensity reconciliation (Sprint 1 §2.1)

The Sprint 1 designer tuned `BULB_LIGHT.intensity = 3.4` to keep the
revolver lit while letting the chair and back wall fall into shadow.
That value was tuned against flat oak BoxGeometry — six surfaces with
identical material properties. The GLB swap introduces:

- A real wooden table top with potential PS1 affine-UV warp (§6).
- A revolver with a darker albedo override (§2.1).
- A bottle with a green-tan glass tint that catches less light than
  flat oak.

These three changes net **slightly more visual contrast in the
table-top region**. The Sprint 1 intensity 3.4 still works — the
revolver is darker but the cone is unchanged, so the highlight is
still proportional. **No tweak Sprint 3.** Re-evaluate at Sprint 5
QA if the table-top region reads "underlit" against the
implemented GLBs.


---

## 4. Procedural textures (frontend-dev spec)

Three CanvasTextures are rendered at runtime via inline SVG → Image →
canvas drawImage → THREE.CanvasTexture. Each generation is budgeted
to `PROC_TEXTURE_BUDGET_MS = 200ms` (kraken Phase 1 SSOT). Phase 2B
frontend-dev fills the SVG content; the visual intent below is the
designer's brief.

**Canvas size: 512×512** per texture (PROC_TEXTURE_DIMENSIONS, kraken
Phase 1 SSOT). This is intentionally larger than the 256×256 Sprint 1
placeholder atlas because procedural textures are read at near-camera
distance (the envelope is on the table top, ~1m from camera) and the
PS1 affine-UV warp (§6) re-activates on them — the higher resolution
gives the warp something to bite into.

### 4.1 Cyrillic envelope

**Visual intent:** A folded paper envelope sitting on the table top,
left of the bottle. The envelope has Cyrillic addressing in faded
black ink, with the paper itself in a cream-sodium tone (PALETTE.paper
`#7a6a4e` mixed with a warm white at ~80% paper / 20% white). The
envelope is creased (vertical fold line at ~50% canvas width) and
slightly grease-stained (a brown smudge at one corner, ~20% opacity).

**Content (designer-authored text):**
- Top-left address block:
  ```
  от М. до Х.
  пр. Ленина 14-23
  Москва
  ```
- Bottom-right faint postmark stamp circle, partly worn.

The strings are **designer-fictional**: "от М. до Х." is "from M. to
H." — initials only, no recognizable name. "пр. Ленина 14-23 / Москва"
is a generic Soviet-era address that does not correspond to any real
address. This is the SAME anonymity rule from §1: no real person, no
real place that could be mistaken for a historical reference.

**Font:** Cyrillic-supporting serif (Old Standard TT is already in
the bundle from Sprint 0 — see PLAN §10 font table). Size: 24px for
the address block, 18px for the postmark. Slightly skewed (rotate
~2°) to read as handwritten ink rather than typed.

**Paper texture:** Use a procedural noise overlay at low opacity
(~15%) to give the cream paper a "fibrous" feel. Frontend-dev: see
the Sprint 1 placeholder-atlas pattern in `placeholder-room.ts` for
the noise approach. Alternative: a static SVG noise pattern is
acceptable if simpler.

**Placement (Sprint 4+ target — Sprint 3 generates the texture only):**
The envelope is intended for the table top, applied as a child Mesh
of the table GLB at world position `(-0.3, 0.795, 0.2)` (slightly
right of the bottle, behind the revolver). PlaneGeometry 0.16×0.10
(metres). Sprint 3 scope ends at texture generation; the actual
table-top mesh placement is Sprint 4 if time permits, otherwise
deferred to Sprint 5.

### 4.2 Faded portrait

**Visual intent:** A small framed photograph on the back wall, heavy
faded so only a silhouette is visible. Generic Soviet-era man's bust:
head, shoulders, greatcoat collar — NO recognizable face. Sepia/grey
tones, with the silhouette barely darker than the wall behind it.

**Content (designer-authored silhouette):**
- Black frame (1px stroke, PALETTE.shadow) around the canvas at ~5%
  inset.
- Inside the frame: a faded photo with a sepia background gradient
  (top: PALETTE.paper × 0.5; bottom: PALETTE.shadow × 1.2).
- A man's bust silhouette filling the central 60% of the canvas. The
  silhouette is a generic shape: rounded head, shoulders, the
  greatcoat collar suggested by triangular protrusions at the
  shoulder line. **NO face details** — no eyes, no nose, no mouth.
  The brain reads it as a person but cannot identify them.
- A heavy fade overlay (white noise + radial gradient from corner)
  at ~40% opacity to make the image look "burned by sunlight over
  decades".

**Why no face:** PLAN §2 line 67 specifies "yüzü silinmiş" (the face
has been erased). Two reasons: (a) any rendered face will, at the
PS1 affine-UV warp resolution, accidentally resemble somebody —
opening a telif/likeness can. (b) The diegetic reading "this used
to be a person, the room forgot who" lands harder than "this is
clearly Person X." The silhouette is the punctuation, not the
sentence.

**Font:** None — the portrait has no caption. If a future sprint
adds a brass nameplate under the frame, the text there should be
unreadable Cyrillic glyphs (same rule as §4.3 poster).

**Placement (Sprint 4+ target):** The portrait is intended for the
back wall as a PlaneGeometry 0.4×0.5 (metres) child of the wall
mesh, at world `(0.8, 1.8, -2.95)` (right side of the back wall,
slightly above eye-line so the camera reads it as a wall hanging).
Sprint 3 scope ends at texture generation.

### 4.3 Soviet propaganda poster

**Visual intent:** A weathered Soviet-style propaganda poster — but
**OWN geometric design**, NOT a reproduction of any real historical
poster. PLAN §10 line 524 is the literal contract: "(yazılar
okunmaz, kendi tasarımı)". Geometric shapes, big bold composition,
non-recognizable Cyrillic typography.

**Content (designer-authored — frontend-dev implements):**
- Background: large flat shape in PALETTE.blood (`#8b1a1a`) covering
  ~60% of the canvas. The shape is a tilted rectangle / parallelogram
  reading as a flag or banner.
- Foreground geometric shapes:
  - A bold black sans-serif Cyrillic "word" — but the letterforms
    are **glyphic, not lexical**. Pick 4-6 letters from the Cyrillic
    alphabet (К Р О Н И Е А — common letters) and arrange them so
    they LOOK like a word but spell nothing. Size: 96px bold, top
    third of the canvas.
  - Below the "word", a smaller line of "subtitle" in similar
    glyphic Cyrillic, 32px regular weight. Same rule: looks like a
    sentence, spells nothing.
  - A geometric icon at the bottom — a simple star, hammer-and-
    sickle alternative (e.g., a 5-pointed star), or a curved
    sweeping line. **DO NOT use the actual hammer-and-sickle** —
    that's a politically charged real symbol; we want the *aesthetic*,
    not the specific iconography.
- Texture overlay:
  - Vertical creases (2-3 vertical lines at ~20% opacity, PALETTE.
    shadow) suggesting a folded poster.
  - Edge wear (corners darken with PALETTE.shadow at ~40% opacity,
    fading to clear by 30% from each corner).
  - Yellowing (slight PALETTE.paper × 0.6 wash over the whole
    canvas at ~15% opacity, biased to the top edge).

**Colour rule (hard):** PALETTE.blood, PALETTE.rust, PALETTE.paper,
PALETTE.shadow ONLY. No other hues, no white that isn't a desaturated
paper tone. The poster lives on the same wall as the faded portrait
and must read as part of the same dim wall plane — bright reds against
near-black would punch a focal hole in the silhouette context.

**Font:** Cyrillic display weight (Old Standard TT bold is fine; if
frontend-dev wants more "poster bold" energy, a single weight of any
OFL-licensed Cyrillic sans is acceptable as a Sprint 3 add to the
font bundle).

**Placement (Sprint 4+ target):** Left side of the back wall as a
counterweight to the portrait on the right. PlaneGeometry 0.5×0.7
(metres) at world `(-1.0, 1.7, -2.95)`. Sprint 3 scope ends at
texture generation.

### 4.4 Caching contract

All three textures cache per-key (Phase 2B `procedural-textures.ts`
contract). The cache returns the same THREE.CanvasTexture identity on
subsequent gets — Three.js requires identity stability for the GPU to
NOT re-upload. Designer ratifies this contract from the kraken Phase 1
spec; no change.


---

## 5. Smoke particle system (kraken-particles spec)

The cigarette in the ashtray (procedural CylinderGeometry stub on the
ashtray top) emits a thin smoke column that rises toward the bulb.
This is **atmospheric texture, not focal element** — the smoke
reinforces the vertical bulb-table-revolver axis (§1) by adding a
slow upward motion in the right third of the table.

### 5.1 Particle parameters (kraken Phase 1 SSOT — designer ratifies)

The Phase 1 kraken scaffold pre-populated every smoke knob. Designer
review for Phase 2A is to ratify each value against the composition
intent. All values **ratified — no change**:

| Constant                                  | Value      | Ratified rationale                            |
|-------------------------------------------|------------|-----------------------------------------------|
| `SMOKE_PARTICLE_COUNT_BY_TIER.low`        | 4          | Bare minimum to read as "smoke" rather than   |
|                                           |            | "single dot drifting up". Low-tier targets    |
|                                           |            | old Intel integrated GPUs — keep it cheap.    |
| `SMOKE_PARTICLE_COUNT_BY_TIER.medium`     | 8          | Standard tier — readable smoke column without |
|                                           |            | dominating the right-third of the table.      |
| `SMOKE_PARTICLE_COUNT_BY_TIER.high`       | 16         | High tier — denser column; still atmospheric, |
|                                           |            | not theatrical. Above 20 the column starts to |
|                                           |            | read as "stage fog machine" — avoid.          |
| `SMOKE_SPAWN_RATE_HZ`                     | 2          | One particle every 500ms feeds the population |
|                                           |            | smoothly alongside the 3000ms lifetime — at   |
|                                           |            | steady-state, count ≈ rate × lifetime = 6     |
|                                           |            | active particles, which fits inside all tier  |
|                                           |            | budgets.                                      |
| `SMOKE_PARTICLE_LIFETIME_MS`              | 3000       | Cigarette smoke rises ~1m in 3s of real life. |
|                                           |            | The bulb is 1.6m above the ashtray top —      |
|                                           |            | particles fade before reaching the bulb,      |
|                                           |            | which is the right reading (smoke disperses   |
|                                           |            | in still air, doesn't reach the ceiling).     |
| `SMOKE_PARTICLE_INITIAL_OPACITY`          | 0.5        | Subtle — smoke is suggestion, not statement.  |
|                                           |            | At 1.0 the particles would punch white holes  |
|                                           |            | in the camera frame.                          |
| `SMOKE_PARTICLE_UPWARD_VELOCITY`          | 0.02       | 0.02 m/s — slow rise, matching still air.     |
| `SMOKE_PARTICLE_DRIFT_AMPLITUDE`          | 0.005      | 5mm horizontal sway — visible but not         |
|                                           |            | mechanical. Reads as the bulb cone creating a |
|                                           |            | very slight convection current.               |
| `SMOKE_PARTICLE_DRIFT_FREQUENCY_HZ`       | 0.3        | One drift cycle every ~3.3s — incommensurable |
|                                           |            | with the bulb's Lissajous periods (3.7s,      |
|                                           |            | 4.9s) so the column doesn't visually sync     |
|                                           |            | with the swaying light. Coincidental sync     |
|                                           |            | would read as choreographed; the drift must   |
|                                           |            | read as ambient noise.                        |
| `SMOKE_REDUCED_MOTION_VELOCITY_FACTOR`    | 0.5        | A11y per §5.3 below.                          |

### 5.2 Visual rendering

**Sprite type:** THREE.Points with `PointsMaterial`. Single colour, no
texture file. Per kraken Phase 1 spec ("small white/grey sprite, Points
size 4-8px"). Designer ratification:

- **Colour:** off-white with a slight warm tint — `#d8d0c0` (PALETTE.
  paper × 1.7, clamped to a near-white). Pure white would punch holes
  in the dark frame; a slightly warm grey-white reads as smoke under
  sodium light.
- **Size:** 6px at the medium tier (camera distance ~2.5m from ashtray;
  the cigarette stub is ~5mm diameter; 6px reads as a small
  unfocused smoke fleck). Low tier 4px (smaller column for lower
  particle density). High tier 8px (larger flecks with more density —
  more visible without being more abundant).
- **Opacity decay:** linear fade from `SMOKE_PARTICLE_INITIAL_OPACITY`
  (0.5) to 0 over the particle's lifetime. NO ease-out — linear keeps
  the column reading uniformly along its height.

### 5.3 Accessibility (prefers-reduced-motion)

Per Sprint 2 §7 (the bang-flash a11y pattern), Phase 2B kraken-
particles must wrap the smoke spawn in a `prefers-reduced-motion`
check:

```ts
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const upward = reduce
  ? SMOKE_PARTICLE_UPWARD_VELOCITY * SMOKE_REDUCED_MOTION_VELOCITY_FACTOR
  : SMOKE_PARTICLE_UPWARD_VELOCITY;
const drift = reduce
  ? SMOKE_PARTICLE_DRIFT_AMPLITUDE * SMOKE_REDUCED_MOTION_VELOCITY_FACTOR
  : SMOKE_PARTICLE_DRIFT_AMPLITUDE;
```

The contract is "user opted out of motion, not out of atmosphere".
The smoke still exists, it just rises slower (50% velocity). This
honours the vestibular accessibility need without removing the
visual cue entirely. A "full off" mode is NOT required for Sprint 3
— that's a Sprint 9 a11y pass if a user reports specific issues.

### 5.4 Spawn anchor (Phase 2B kraken-particles ownership)

Particles spawn from `MODEL_POSITION_ASHTRAY` (table top y=0.79) with
a small y offset to start the column above the cigarette stub:

```text
spawn_position.x = MODEL_POSITION_ASHTRAY[0] + (random in [-0.01, 0.01])
spawn_position.y = MODEL_POSITION_ASHTRAY[1] + 0.04   // 4cm above the bowl
spawn_position.z = MODEL_POSITION_ASHTRAY[2] + (random in [-0.01, 0.01])
```

The ±1cm random offset gives the column a slight visible width
(particles don't all rise from a single point). The 4cm y offset
clears the ashtray rim and the cigarette stub so the smoke starts at
the tip.

### 5.5 Atmospheric intent — what to push back on

Phase 2B kraken-particles may be tempted by stretch goals:
- "Make the smoke react to the bulb sway" — NO. The smoke is ambient,
  the bulb is focal. Coupling them would draw the eye away from the
  revolver.
- "Add a second smoke source from the radiator" (steam from a leak) —
  NO. Sprint 3 has one smoke column. A second column would compete.
- "Make the smoke darker as the empty-click count grows" — NO. The
  bulb darkening (DARKEN_CURVE) is the atmospheric channel for click
  progression; the smoke stays stable across the lobby.


---

## 6. PS1 affine-UV shader activation (TH-S1-05 close)

Sprint 1 Phase 2 (kraken-shader) created `ps1-affine-uv.glsl` as a
fragment-shader pass that warps UV coordinates per-frame to simulate
the PS1's lack of perspective-correct texture mapping. The shader was
**dormant** in Sprint 1 because the placeholder room used MeshStandard
Material with no UV-mapped textures — the warp had nothing to bite.
Sprint 3 finally activates it on the GLB meshes with real UV data.

### 6.1 Which meshes receive the affine-UV warp

| Mesh        | Receives warp? | Tier behaviour                                                                       |
|-------------|----------------|--------------------------------------------------------------------------------------|
| Revolver    | NO             | The revolver is the focal subject. PS1 UV warp would distort the barrel highlight    |
|             |                | and break the chiaroscuro reading. Keep MeshStandardMaterial.                        |
| Table       | YES            | The largest surface in the frame. The warp is most visible at the table's edges     |
|             |                | when the camera reads the wood grain texture at an oblique angle. This is the       |
|             |                | "intentional PS1 look" Sprint 1 promised but couldn't deliver.                       |
| Chair       | YES            | The chair is in shadow — the warp is subtle here, just enough to keep the chair     |
|             |                | visually consistent with the table without making it stand out.                     |
| Radio       | YES            | Sprint 4 will add the green dial glow texture; Sprint 3 the radio receives the warp |
|             |                | on its wood cabinet texture. Same reasoning as the chair.                           |
| Bottle      | YES            | The glass tint catches the warp at the rim, reading as "old PS1 alpha-test" style.  |
|             |                | Acceptable visually — bottles in PS1 games always looked like this.                 |
| Ashtray     | YES            | Ceramic surface; warp gives the rim a slight wobble. Atmospheric.                   |
| Lightbulb   | NO             | The bulb is a light source proxy; warping the glass envelope would make the bulb    |
|             |                | mesh visually drift from the PointLight position, breaking the bulb-as-anchor       |
|             |                | composition. Keep MeshStandardMaterial.                                             |
| Procedural  | YES (all 3)    | The envelope, portrait, and poster ALL receive the warp — the warp is the primary   |
| textures    |                | visual cue that "this is PS1-era graphics". Procedural textures rendered at 512×512 |
|             |                | give the warp clear pixel boundaries to wobble.                                     |

**Total: 5 GLB meshes + 3 procedural texture surfaces = 8 surfaces with affine-UV warp at 'high' tier.**

### 6.2 Tier-aware activation

Phase 2B kraken-loader reads the active QualityLevel and chooses the
material factory accordingly:

| Tier   | Affine-UV?  | Material                                            |
|--------|-------------|-----------------------------------------------------|
| low    | NO          | MeshStandardMaterial direct (no shader pass)        |
| medium | reduced     | ShaderMaterial with affine-UV amplitude × 0.5       |
| high   | YES (full)  | ShaderMaterial with affine-UV at full amplitude     |

The "amplitude" knob is whatever the Sprint 1 ps1-affine-uv.glsl
fragment expects (likely a uniform float). Phase 2B reads the existing
shader source to pick the uniform name; designer does not need to
pre-spec the uniform — the shader is locked Sprint 1.

### 6.3 Verification scenario (qa-engineer Phase 3)

At 'high' tier, panning the camera (which is sabit — there is no
runtime camera motion) is not the right validation surface. Instead:

- Force a 'high' build via `VITE_QUALITY_LEVEL=high npm run dev`.
- Visually inspect the table top: the UV warp should be visible as a
  subtle wobble on the wood grain along the table edges (where the
  texture coordinates compress most aggressively).
- Compare to a 'low' build: the table top should look perfectly
  rectilinear in 'low' (no warp).

Sprint 9 qa-engineer promotes this to a screenshot-diff regression
test (Sprint 3 manual visual inspection is acceptable).

### 6.4 What "activates" means in Phase 2B implementation terms

The Sprint 1 placeholder-room.ts already accepts a `Ps1MaterialFactory`
parameter (see `placeholder-room.ts:41`). Phase 2B kraken-loader uses
the same factory pattern for the GLB swap: when constructing each
mesh's material override (§2), the factory function decides whether
to wrap the result in the affine-UV ShaderMaterial or return the
MeshStandardMaterial directly based on the active tier.

This means **no new shader plumbing is needed Sprint 3**. The factory
pattern already exists; Phase 2B passes the same factory to the GLB
swap that placeholder-room.ts uses, and the materials acquire the
warp by virtue of the factory's tier-aware behavior.


---

## 7. Composition polish tuning items

These are the **post-load** designer adjustments that Phase 2B
kraken-loader applies once the GLBs are mounted and the scene is
visually rendering. None of them require new constants — they are
per-material overrides keyed off the values already in §2.

### 7.1 Contrast (per-material multiplier overrides)

Each GLB ships with whatever albedo the original author baked. Phase 2B
kraken-loader iterates each loaded scene's meshes and applies the
material override from §2:

```ts
// Phase 2B pattern — pseudocode, kraken-loader implements
for (const mesh of glbScene.traverse) {
  if (mesh.material instanceof MeshStandardMaterial) {
    const override = MATERIAL_COLOR_OVERRIDE_BY_KEY[modelKey];
    if (override !== undefined) {
      mesh.material.color.set(override);
    }
  }
}
```

`MATERIAL_COLOR_OVERRIDE_BY_KEY` is a new constant in
`scene-model-constants.ts` (Phase 2B kraken-loader OR designer Phase
2A — designer adds it here as a follow-up if Phase 2B requests). Keys
are ModelKey, values are hex strings.

**Sprint 3 the override map IS in §2 row by row. Phase 2B can either:**
- Read the §2 table directly via JSDoc-extracted comments (fragile), or
- Designer adds `MATERIAL_COLOR_OVERRIDE_BY_KEY` to scene-model-
  constants.ts as a frozen Record. **Recommendation: designer adds the
  constant Phase 2A — see scene-model-constants.ts addition.**

### 7.2 Silhouette read

The composition rule (§1) requires no off-table object compete with
the revolver for focus. Phase 2B visual smoke test:

1. Mount the scene with all 7 GLBs at the §2 positions.
2. Look at the rendered frame (no animations, idle bulb sway).
3. Identify the brightest single area outside the table top. If
   that area is brighter than the revolver, **a material override is
   too bright** — re-tune the relevant §2 material color toward
   PALETTE.shadow.

The most likely failure modes:
- The lightbulb GLB's porcelain duy is too bright. Mitigation: §3.2
  emissive override on the glass envelope; if still too bright after
  that, lower the porcelain duy material color toward PALETTE.paper ×
  0.6.
- The chair back catches the bulb cone from below. Mitigation: rotate
  the chair so the seat back faces away (current §2.2 has the 15°
  rotation already; if the chair back still picks up light, add a
  z-rotation tilt).

### 7.3 Bulb light coverage

With the lightbulb GLB as the visual anchor, the PointLight's
position is still at `BULB_LIGHT.posY = 2.4` (unchanged). The bulb
GLB sits at the same height, so the light cone is geometrically
identical to Sprint 1. **No tweak.**

If Phase 2B observes that the lightbulb GLB's porcelain duy casts a
visible shadow on the table top (the duy is opaque and blocks the
downward light path), the duy material should switch to
`material.depthWrite = false` so it draws but doesn't occlude. This
is a Phase 2B implementation choice; designer flags it for awareness
but does not pre-spec.

### 7.4 Background lockup ("old room" feel)

The back wall at z=-3 receives:
- The wall material (PALETTE.oak via placeholder-room.ts createWalls).
- The faded portrait procedural texture (§4.2) at world `(0.8, 1.8,
  -2.95)`.
- The propaganda poster procedural texture (§4.3) at world `(-1.0,
  1.7, -2.95)`.

Three flat-coloured planes plus two procedural textures on the back
wall is the right density for "old basement". MORE textures (a
calendar, a paper note, a second portrait) would push the wall into
diorama territory — the camera reading the back wall as "things to
look at" rather than "the room I am trapped in".

**Decision: TWO wall textures Sprint 3.** No calendar, no second
portrait. If Sprint 5 QA reports the back wall reads as "blank stage
backdrop", revisit; Sprint 3 ships at the lower density.

### 7.5 Cigarette stub on ashtray (procedural fallback)

Per `src/renderer/assets/models/README.md` line 58, a small
CylinderGeometry sits on top of the ashtray as the cigarette stub
(no GLB needed). Sprint 3 ships this as part of the smoke spawn
anchor (§5.4) — the stub is the visible smoke source.

**Geometry:** CylinderGeometry r=0.003m, h=0.06m, 6 segments.
Vertically oriented (rotated π/2 around z so the long axis stands up).
**Material:** `MeshStandardMaterial` with `color = PALETTE.paper` ×
0.7 (the paper of the cigarette) and a slight orange tip — the top
1cm of the cylinder is a separate small mesh in PALETTE.blood
(`#8b1a1a`) to read as the lit ember.

**Placement:** Centered on the ashtray top at `(MODEL_POSITION_
ASHTRAY[0], MODEL_POSITION_ASHTRAY[1] + 0.03, MODEL_POSITION_ASHTRAY[2])`
(3cm above the bowl).

Phase 2B kraken-loader implements the stub as part of the ashtray
mount, NOT as a separate scene addition — keeps the lifetime tied to
the ashtray.

### 7.6 The 5 kopek coin (procedural fallback)

Per the README and PLAN §2 line 66 ("5 kapikli madeni para"), a small
brass coin lives on the table top. Procedural via CylinderGeometry.

**Geometry:** CylinderGeometry r=0.012m, h=0.0015m, 16 segments.
Flat on the table (rotated π/2 around x so the disc face is horizontal).
**Material:** `MeshStandardMaterial` with `color = '#7a6a3a'` (a brass
tone between PALETTE.paper and PALETTE.sodium).
**Placement:** `(0.05, 0.795, -0.3)` — on the table, behind the
revolver, slightly off-center. Catches the bulb cone as a small bright
disc, reading as "someone left their change here".

Phase 2B can defer this to Sprint 4 if the seven GLBs + 3 procedural
textures are already pushing the implementation budget. Designer
flags the coin as **Sprint 3 stretch goal, Sprint 4 default**.


---

## 8. Phase 2B kraken-loader validation list

These are the **post-implementation checks** kraken-loader runs before
declaring Phase 2B done. They mirror the Sprint 2 §8 pattern from
`revolver-direction.md`: smoke-level assertions designed to catch
regressions cheap, not full vitest suites (those land Sprint 9).

### 8.1 GLB load budget

All 7 GLBs load via the registry within `MODEL_LOAD_BUDGET_MS = 4000`
(kraken Phase 1 SSOT).

**Implementation:**
```ts
const start = performance.now();
await modelRegistry.preload();
const elapsed = performance.now() - start;
if (elapsed > MODEL_LOAD_BUDGET_MS) {
  document.body.dataset['modelBudget'] = `${elapsed.toFixed(0)}ms`;
}
```

Temporal-correctness scenario: if any single GLB fails to load, the
preload Promise.all rejects — Phase 2B must decide whether one bad
GLB blocks the rest (Promise.all) or allows partial scene (Promise.
allSettled with per-key error in dataset). **Designer recommendation:
Promise.allSettled** — one missing GLB renders a placeholder cube and
the scene is still playable, which is preferable to a black screen.

### 8.2 Revolver mesh split

`revolver.glb` hammer + cylinder + body extracted via the
`MODEL_REVOLVER_*_PIVOT_KEY` lookups. Sprint 2 AnimationMixer's 5
clips (cock, spin, fall, kick, idle) still play correctly on the
extracted pivots.

**Decision tree (Phase 2B kraken-loader):**
1. Call `glbScene.getObjectByName(MODEL_REVOLVER_HAMMER_PIVOT_KEY)`.
2. If found, use as the AnimationMixer rotation target.
3. If not found, the GLB is monolithic — Phase 2B wraps the mesh in
   three Object3D pivots manually (programmatic extension):
   ```ts
   const wrappedHammer = new Object3D();
   wrappedHammer.add(monolithicMesh);
   wrappedHammer.position.set(/* hammer pivot point */);
   ```
4. Document the chosen path in `revolver-mount.ts` JSDoc.

If the monolithic fallback fires, see §9 (this document) for the
designer's visual ratification — TL;DR: monolithic with three
Object3D wraps is acceptable visually if the rotation axes are
sensibly placed; if they're wrong, defer to Sprint 4 GLB swap.

### 8.3 Lightbulb GLB attached to BulbLightHandle

Per §3.1, the lightbulb GLB becomes a child of the PointLight via
`pointLight.add(lightbulbScene)`. Phase 2B kraken-loader extends
BulbLightHandle's createBulbLight() to call:

```ts
async function attachLightbulbGlb(handle: BulbLightHandle): Promise<void> {
  const glb = await modelRegistry.load('lightbulb');
  glb.scene.scale.setScalar(MODEL_SCALE_LIGHTBULB);
  // Position is RELATIVE to the parent (PointLight), so [0,0,0]:
  glb.scene.position.set(0, 0, 0);
  handle.light.add(glb.scene);
  handle.bulbMesh.visible = false;  // Sprint 1 placeholder hidden
  // §3.2 emissive kill
  glb.scene.traverse((obj) => {
    if (obj instanceof Mesh && obj.material instanceof MeshStandardMaterial) {
      obj.material.emissive.set(0x000000);
      obj.material.emissiveIntensity = 0;
    }
  });
}
```

The empty-click DARKEN_CURVE flow still works because
`setBaseIntensityFactor` mutates `light.intensity` (the parent), not
the child's material — the GLB inherits the dimming via the
PointLight's intensity directly.

### 8.4 placeholder-room cube cleanup

When `useGlbs === true` (the production code path), the placeholder
cubes from `createPlaceholderRoom` must NOT render alongside the
GLBs. Phase 2B kraken-loader either:

- **Option A**: replaces the function body (kraken-loader rewrites
  createPlaceholderRoom to construct from GLBs instead of cubes), or
- **Option B**: kraken-loader's GLB mount calls
  `createPlaceholderRoomFromGlbs(factory)` (sibling function) and
  scene/index.ts chooses which to mount based on a config flag.

**Designer recommendation: Option B** — keep both code paths
operational. `useGlbs=false` diagnostic mode (kraken Phase 1 scaffold)
needs the cube path intact. Phase 2B does NOT delete the cube
constructors; they stay as the diagnostic fallback.

**No leftover cubes:** Phase 2B verify visually that no Sprint 1 cube
remains in the rendered frame. The radiator stays a placeholder cube
(no GLB) — that is acceptable; the cleanup applies to table, chair,
radio (those have GLB replacements).

### 8.5 Procedural textures applied to target meshes

The three procedural textures from §4 are applied to:
- `cyrillic-envelope` → PlaneGeometry mesh on table top (Sprint 4
  placement target — Sprint 3 generates the texture only).
- `faded-portrait` → PlaneGeometry mesh on back wall right.
- `soviet-poster` → PlaneGeometry mesh on back wall left.

Phase 2B kraken-loader (or frontend-dev — Phase 2B 3-parallel batch
splits ownership) creates the PlaneGeometry meshes and attaches the
textures. The mesh placement is per §4.1/§4.2/§4.3 placement notes.

**Sprint 3 minimum:** all 3 textures generated and applied to wall/
table meshes. **Sprint 3 stretch:** envelope on table top. **Sprint 4
fallback:** envelope deferred.

### 8.6 PS1 affine-UV at 'high' tier on 5 textured meshes

Per §6.1, table + chair + radio + bottle + ashtray receive the
affine-UV ShaderMaterial at 'high' tier. The 3 procedural texture
planes ALSO receive the warp (§6.1 final row).

**Phase 2B verify at 'high' tier:** start the dev server with
`VITE_QUALITY_LEVEL=high`, mount the scene, inspect the table top
visually for the wobble. If the wobble is invisible, the shader
material is not wired up; if the wobble is too strong, the amplitude
uniform needs reduction (Sprint 1 shader source-of-truth).

### 8.7 Smoke particles spawn above ashtray

Smoke particles spawn at `(MODEL_POSITION_ASHTRAY[0], MODEL_POSITION_
ASHTRAY[1] + 0.04, MODEL_POSITION_ASHTRAY[2])` per §5.4. Active
particle count matches `SMOKE_PARTICLE_COUNT_BY_TIER[activeQuality]`
within ±2 at steady-state (the rate × lifetime math has some jitter).

**Phase 2B verify:** mount the scene, count visible smoke particles
above the ashtray over ~5 seconds. Counts in the table-acceptance
band for each tier (4 ±2, 8 ±2, 16 ±2).

### 8.8 AnimationMixer rebind

Sprint 2's revolver-anim.ts owns 5 AnimationClips. After the GLB
swap, Phase 2B kraken-loader rebinds the mixer to the GLB scene's
extracted hammer/cylinder/body pivots (per §8.2). The 5 clips must
play correctly on the GLB revolver:

- `cock`: 30° hammer rotation over 250ms (linear).
- `spin`: 4-turn cylinder rotation over 1400ms, ends at original
  angle (RNG visibility contract, revolver-direction.md §6).
- `fall`: 1-frame hammer return.
- `kick`: revolver-body 5° tilt + camera shake.
- `idle`: subtle bob synced to bulb sway.

**Phase 2B verify:** wire each clip to the corresponding GLB pivot,
trigger the clip via the existing FSM, observe the animation plays
visibly. If a clip plays but doesn't visually move the right mesh
(e.g., `cock` rotates the wrong child), the pivot lookup is wrong.

### 8.9 Empty-click DARKEN_CURVE still applies

PLAN §5 lobby progression: empty clicks decrease `bulb.intensity` via
`setBaseIntensityFactor(DARKEN_CURVE_PER_CLICK[clicks])`. This calls
the PointLight intensity setter; the GLB lightbulb mesh inherits no
intensity (it's geometry, not a light). The dimming works without
change because the cone falls off proportionally.

**Phase 2B verify:** trigger 6 empty clicks, observe the room
darkens through the §4 DARKEN_CURVE values, click 6 lands at ~22%
of baseline. The GLBs at the click 6 dimming level are barely
visible but their silhouettes remain readable against the AmbientLight
floor (per Sprint 2 §7.5).

### 8.10 Dispose chain

On scene unmount (HMR or explicit dispose), every:
- Loaded GLB scene's geometry + material (`disposeModel` walks the
  graph).
- CanvasTexture from procedural-textures.ts (`disposeProceduralTexture`).
- Smoke Points geometry + PointsMaterial (Phase 2B kraken-particles
  owns this).
- Sprint 1 placeholder cube remnants (if useGlbs=false fallback).

is disposed. The SceneHandle's dispose() iterates registered handles
in reverse-allocation order — Phase 2B kraken-loader registers each
loaded GLB's handle with the SceneHandle so the existing dispose
machinery handles them uniformly.

**Phase 2B verify:** in dev mode with HMR, edit a non-scene file to
trigger HMR remount. Watch Chrome DevTools Memory tab — heap usage
should NOT grow per HMR cycle. If it does, a dispose path is missing.


---

## 9. Model freeze checklist (Phase 5 sign-off)

At Sprint 3 Phase 5 (the final QA gate), this checklist locks Sprint 4+
from model changes. Failing any one item blocks the model freeze; the
Sprint 4 destruction-director cannot start until all items pass.

### 9.1 All 7 GLBs present, no placeholder primitives in production code

- `revolver.glb` loaded, mesh-split per §8.2, attached via
  revolver-mount.ts.
- `chair.glb` loaded, placed per §2.2.
- `radio.glb` loaded, placed per §2.3.
- `bottle.glb` loaded, placed per §2.4.
- `table.glb` loaded, placed per §2.5.
- `ashtray.glb` loaded, placed per §2.6.
- `lightbulb.glb` loaded, attached to BulbLightHandle per §3.1.

The Sprint 1 placeholder cubes (createTable, createChair, createRadio
in placeholder-room.ts) stay in the codebase as the `useGlbs=false`
diagnostic fallback. They MUST NOT render when `useGlbs=true` (the
production path). Phase 5 verifier confirms via the rendered frame.

### 9.2 SHA-256 manifest committed

`src/renderer/assets/models/SHA256-MANIFEST.txt` lists each GLB by
relative path with its SHA-256 hash. Generated by a Phase 5 build
step (kraken Phase 1 LEGAL.md skeleton has a TODO for this — Phase 5
fills).

The manifest is the **provenance contract**: future contributors can
re-download any GLB from its Poly Pizza URL and verify the bytes
match. Drift (e.g., Poly Pizza re-uploads a different version under
the same URL) is detectable.

### 9.3 CC0 + CC-BY attribution complete

Three places must have the attribution log:
- `src/renderer/assets/models/README.md` (already complete in
  Sprint 3 Phase 1 vendoring).
- `LEGAL.md` (Phase 5 generates from the README.md tables).
- About screen in the renderer (Sprint 6 reveal-lite scene shows the
  attribution).

The 3 CC-BY models (table by dook, ashtray by dook, lightbulb by
Jason Toff) MUST be listed in all three locations.

### 9.4 Procedural textures generate within PROC_TEXTURE_BUDGET_MS

The qa-engineer Phase 5 verifier runs:
```ts
for (const key of PROCEDURAL_TEXTURE_KEYS) {
  const start = performance.now();
  getProceduralTexture(key);
  const elapsed = performance.now() - start;
  console.assert(elapsed < PROC_TEXTURE_BUDGET_MS,
    `Texture ${key} took ${elapsed}ms`);
}
```

If any texture exceeds 200ms, Phase 5 either:
- Optimises the texture generation (e.g., reduce SVG complexity), or
- Defers the texture (skips initial render, lazy-loads on first
  visibility — but this changes the boot sequence).

### 9.5 GLB loads within MODEL_LOAD_BUDGET_MS = 4000

Phase 5 verifier runs the boot sequence and measures
`performance.now()` from the disclaimer dismiss to the first frame
with all 7 GLBs rendered. Must be < 4000ms on the M1 baseline (PLAN
§13 budget).

### 9.6 Telif audit PASS

Security-reviewer Phase 5 cross-references:
- Every GLB's source URL against the README.md attribution.
- Every CC-BY model has attribution in 3 places (§9.3).
- No "Royalty Free" or paid models in the bundle.
- The procedural textures' designer-authored Cyrillic content is
  fictional (no real names, addresses, slogans).
- The faded portrait is silhouette-only (no recognizable face).
- The propaganda poster is OWN design (no historical reproduction).

If any item fails: model freeze blocked, fix before Sprint 4.

### 9.7 Visual sanity

Phase 5 visual reviewer (designer agent re-invoked for Phase 5)
inspects the rendered scene and ratifies:
- §1 composition philosophy holds (the revolver is the focal subject).
- §3 lighting per object reads correctly (chiaroscuro is preserved).
- §5 smoke particles spawn and rise per spec.
- The empty-click DARKEN_CURVE at click 6 reads as "abandoned"
  (per atmosphere-direction.md §7.5).

A "looks wrong" verdict at this stage blocks the freeze; designer
re-tunes via the §2 / §3 / §4 constants and re-runs the checklist.

### 9.8 What model freeze means for Sprint 4+

After Phase 5 PASSes:
- No new GLB additions to the bundle without a Sprint 9 release-prep
  re-audit.
- No material override changes without designer review.
- No `BULB_LIGHT.intensity` re-tuning without atmosphere-direction.md
  §2 revision.
- New procedural surfaces (calendar, paper note, etc.) are Sprint 5+
  territory — Sprint 4 destruction-director assumes the §1
  composition is locked.

Sprint 4 destruction-director consumes the frozen scene as the t=0
frame for the ApartmentBleed flicker cuts (Faz 2 / 3 / 5 / 7). The
revolver, table, ashtray, and bulb compositions are what the
flickers reveal during the destruction sequence — a model change
between Sprint 3 freeze and Sprint 5 ship would visibly change those
flicker frames and break the diegetic continuity.

---

## Files this designer pass authored or edited

| File                                                              | Change                                |
|-------------------------------------------------------------------|---------------------------------------|
| `src/renderer/scene/model-freeze-direction.md`                    | NEW (this file).                      |
| `src/shared/scene-model-constants.ts`                             | Filled MODEL_SCALE_* /                |
|                                                                   | MODEL_POSITION_* / MODEL_ROTATION_*   |
|                                                                   | with real values per §2.              |
| `src/renderer/scene/atmosphere-direction.md`                      | Appended §8 Sprint 3 GLB              |
|                                                                   | composition notes. §1–§7 unchanged.   |
| `src/renderer/scene/revolver/revolver-direction.md`               | Appended §9 GLB swap notes IF the     |
|                                                                   | swap is non-trivial (designer chose   |
|                                                                   | to write §9 — see top of §9).         |

## Files designer did NOT touch (Phase 2B collision-safety)

`src/renderer/loader/*.ts` (kraken-loader + frontend-dev),
`src/renderer/scene/particles/smoke.ts` (kraken-particles NEW),
`src/renderer/scene/lighting.ts` BulbLightHandle (kraken-loader
extends),
`src/renderer/scene/revolver/*.ts` (kraken-loader extends
revolver-mount.ts only),
`src/renderer/scene/placeholder-room.ts` (kraken-loader fills
loadRoom body),
`scene-model-constants.ts` SMOKE/BUDGET sections (kraken Phase 1
owned),
`LEGAL.md` (Phase 5 generates SHA-256 manifest).

---

*End of model freeze direction. Questions on visual or composition
decisions should copy the relevant section into the conversation so
the rationale stays linked to the constants. Sprint 3 Phase 5 retro
should revisit §7 polish items once the GLBs are auditioned in the
mount.*
