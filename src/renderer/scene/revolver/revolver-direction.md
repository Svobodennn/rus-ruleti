# Revolver Direction — Sprint 2 Phase 2A

> Designer note. Authored 2026-05-20 by designer agent (Phase 2A SOLO) for
> the parallel Phase 2B batch (kraken-revolver, frontend-dev, i18n-expert,
> babel) and for the Sprint 4 destruction-director that consumes the bang
> exit state. Read this **with** `atmosphere-direction.md` open — the two
> documents share constants and language. If a tweak makes the revolver
> "feel better" but breaks the diegetic ritual described in §1, reject it.

The revolver is **a decision instrument disguised as a toy**. Every visual
and audio cue in this sprint reinforces that the player has agency over
the hold and zero agency over the outcome. PLAN §6 is the literal contract
for timings; PLAN §5 is the literal contract for the lobby progression.
Tuning beyond those literals is the designer's job, scoped here.

---

## Table of contents

- [§1 Decision philosophy](#1-decision-philosophy)
- [§2 Timing curve](#2-timing-curve)
- [§3 Hold-state progressive feedback ramp](#3-hold-state-progressive-feedback-ramp)
- [§4 Empty-click 1–6 progression detail](#4-empty-click-16-progression-detail)
- [§5 HUD glow tier curve](#5-hud-glow-tier-curve)
- [§6 RNG visibility contract](#6-rng-visibility-contract)
- [§7 Bang transition Sprint 2 placeholder spec](#7-bang-transition-sprint-2-placeholder-spec)
- [§8 Phase 2B kraken-revolver validation list](#8-phase-2b-kraken-revolver-validation-list)

---

## 1. Decision philosophy

The hold-to-fire interaction is a **decision mechanic, not a reflex test**.
A 1-second hold is long enough that the player cannot pull the trigger on
autopilot — they have to consciously hold through the fov shrink, the
breath ramp, the bulb hum. That second is the entire point of the game.

### Why <200ms triggers would break the feel

A common reflex-game pattern is "tap to fire". That model has two
implicit promises:

1. The user is fast → they get rewarded.
2. The mechanism is fair → reflex defeats randomness.

Both promises are antithetical to PLAN §1 ("oyunsu hız yok, ritüel var").
At <200ms the user is *reacting* to a stimulus; at 1000ms they are
*deciding* in the presence of stimulus. The difference is the difference
between *I had to* and *I chose to*. A real revolver doesn't care how
fast you pull; the diegetic UX honours that.

### "Karar veremedin." is a feature, not a bug

The `EARLY_RELEASE_MS = 300` threshold (PLAN §6 literal "0.3sn") surfaces
the bilingual message "Karar veremedin. / Не смог решиться." when the
user lets go too quickly. From a conventional usability standpoint this
is a **failure to commit** — the system penalising the user for
hesitation. From this game's standpoint it is the **first emotional
surface of the title** — naming the player's mid-action panic out loud,
in both languages, in the user's face.

The cocking-then-release flow is short enough (a beat under half a
second) that the player will perceive it as their own action, not as a
glitch. Reviewers in Phase 2B should resist any temptation to soften this
copy. The strings live in `src/renderer/i18n/strings.ts` under
`hud.earlyReleaseMessage` and are Phase 2 frozen.

### Sprint 2 = foundation; later sprints build on this

Sprint 2 ships the mechanical scaffold: hold, ramp, spin, bang/empty.
**Sprint 9** ships C3 panik tespiti — the mouse-delta-based reveal
forcing (PLAN §9 #4). The 1-second hold creates the *behavioural baseline*
the panic detector watches against; if the hold were instant we would
have nothing to compare panic against. Phase 2B owners should not
shortcut the ramp "to make Sprint 9 easier" — the ramp IS the baseline.


---

## 2. Timing curve

### Locked literals (PLAN §6 — DO NOT change)

| Constant            | Value     | PLAN reference                          |
|---------------------|-----------|-----------------------------------------|
| `HOLD_DURATION_MS`  | **1000**  | PLAN §6 "Mouse-down 1sn (basılı tut)".  |
| `EARLY_RELEASE_MS`  | **300**   | PLAN §6 "Erken bırakma (<0.3sn)".       |

These are game-design literals. Tuning them in Phase 2 would silently
re-author the gameplay contract; treat them as immutable in this sprint.
If a future sprint wants to A/B test (e.g. 900ms vs 1000ms hold), that's a
sprint-scoped task with its own designer review, not a Phase 2B tweak.

### Tunable timings (designer-owned, set Phase 2A)

| Constant            | Value     | Rationale                               |
|---------------------|-----------|-----------------------------------------|
| `SPRING_BACK_MS`    | **200**   | Visible-but-not-jarring snap. <150ms    |
|                     |           | reads as a glitch ("did it even        |
|                     |           | move?"); >300ms reads as ceremony      |
|                     |           | (the rejected hold should feel like    |
|                     |           | a non-event, not a second beat).       |
| `HOLD_ZOOM_DURATION_MS` | **900** | Ramp completes 100ms *before*         |
|                     |           | HOLD_DURATION_MS so the final 100ms   |
|                     |           | sits at "tension threshold" — bulb    |
|                     |           | micro-pulse engages here. See §3.     |
| `COCK_DURATION_MS`  | **250**   | PLAN §6 "snap" — fast enough that the |
|                     |           | hammer reads as mechanical, slow      |
|                     |           | enough that the user perceives the    |
|                     |           | beginning of their hold action.       |

### Hold-to-fire sequence (ASCII art)

```
  t=0ms ─────── t=300ms ─────── t=900ms ─── t=1000ms ─── t=1000+ms
   │             │                │            │            │
   │ mousedown   │ EARLY_RELEASE  │ HOLD_ZOOM  │ HOLD_DUR   │ commit:
   │ → cock      │ threshold:     │ ramp end:  │ threshold: │ spin
   │   anim      │ release <here  │ fov fully  │ bulb       │ starts
   │   (250ms)   │ shows           │ shrunk,    │ micro-     │
   │             │ "Karar         │ breath+6dB │ pulse 4Hz  │
   │             │ veremedin."     │ bulb+3dB   │ engages    │
   │             │                │            │            │
   │ FSM: idle   │ FSM: cocking   │ FSM:       │ FSM:       │ FSM:
   │ → cocking   │ → idle if rel  │ cocking    │ cocking    │ spinning
   │             │ (early)        │            │ → spinning │
```

Release branches:

```
  Release at t < 300ms (EARLY_RELEASE_MS):
    ─── spring-back 200ms (2× speed reverse ramp) ───
    ─── surface "Karar veremedin." for 1800ms ─────
    ─── return to FSM: idle ───────────────────────

  Release at 300ms ≤ t < 1000ms:
    ─── spring-back 200ms (2× speed reverse ramp) ───
    ─── silent (no message, no audio cue) ──────────
    ─── return to FSM: idle ───────────────────────

  Hold reaches t ≥ 1000ms (HOLD_DURATION_MS):
    ─── commit: FSM cocking → spinning ─────────────
    ─── cylinder spin animation begins (1400ms) ────
    ─── no more release branch from here ───────────
```

The 2× reverse-ramp speed during spring-back is intentional: the forward
ramp builds tension over 900ms; the spring-back must dissipate that
tension fast enough that the user does not perceive a "slow loss of
nerve" — that would read as melancholy when it should read as relief.


---

## 3. Hold-state progressive feedback ramp

The hold is **three concurrent ramps** layered on top of an animation
clip. Each ramp targets a different sense:

- **Visual:** camera fov shrinks (a slow "leaning in").
- **Audio (low-frequency):** bulb hum gains 3dB.
- **Audio (high-frequency / body):** breath audio gains 6dB.

The ramps are linear from t=0 to t=900ms (`HOLD_ZOOM_DURATION_MS`), then
they hold the peak value while the **tension threshold** engages for the
last 100ms before commit.

### Ramp profile (linear 0 → HOLD_ZOOM_DURATION_MS)

| Channel             | t=0 (mousedown)      | t=900ms (ramp end)              |
|---------------------|----------------------|---------------------------------|
| Camera fov          | no change            | shrunk by `HOLD_ZOOM_FACTOR`    |
|                     |                      | (5%, `1.05` multiplier in the   |
|                     |                      | SSOT — "5% zoom-in" per PLAN §6)|
| Breath audio gain   | baseline `-18dB`     | `+6dB` from baseline (the      |
|                     |                      | full `HOLD_BREATH_GAIN_DB`)    |
| Bulb hum gain       | baseline `0dB`       | `+3dB` from baseline           |
|                     |                      | (`HOLD_BULB_HUM_GAIN_DB`)      |

Linear is the right curve here. An ease-in-out would create a "leaning"
or "pulling back" feel that competes with the constant pressure the user
holds on the mouse. The mouse press is mechanically linear (the spring
under the button is approximately Hookean over the few millimetres of
travel); the visual/audio ramp matching that linearity gives the player
the perception that *they* are doing the pressing — not the system.

### Tension threshold (t=900ms → t=1000ms, last 100ms)

The last 100ms holds the ramped values flat but **layers a micro-pulse**:

- **Bulb micro-flicker:** 4Hz, ±2% intensity. This is fast enough to
  read as "the bulb is being asked to draw more current" but slow enough
  that it does not blend into the existing 14Hz AC ripple
  (atmosphere-direction.md §2.3). The two frequencies are deliberately
  out of phase — beating between them creates a brief unpredictable
  brightness wobble that registers as nervousness.
- **Breath rate doubled:** the breath loop playback rate (NOT pitch —
  rate, via the audio source's `playbackRate` knob, so the pitch shifts
  upward with rate, but the artefact is acceptable and even welcome
  here — a real person hyperventilating raises both rate and pitch).
- **Camera fov stays at the ramped peak.** No additional shrink. The
  "zoom" channel has done its job.

These three changes start at exactly t=HOLD_ZOOM_DURATION_MS (900ms) and
hold until either commit (t=1000ms → spinning state takes over) or
release.

### Release < EARLY_RELEASE_MS (early release)

When the user lets go before t=300ms:

1. **Spring-back animation begins.** All three ramps reverse at 2× speed
   (so they fully reset over ~100ms even if they hadn't fully built up).
   The cock animation also reverses via `SPRING_BACK_MS = 200`.
2. **Bilingual message surfaces:** "Karar veremedin. / Не смог решиться."
   for **1800ms** (long enough to read both lines comfortably, short
   enough that the user does not feel berated). i18n keys
   `hud.earlyReleaseMessage.{tr,ru}` already shipped Phase 1.
3. **No audio sting.** The message lands silent — the *absence* of the
   ramp audio is the audio cue. Adding a "buzzer" or "fail sting" would
   moralise the moment; it should read as a private observation, not a
   verdict.

### Release ≥ EARLY_RELEASE_MS but < HOLD_DURATION_MS

When the user lets go in the 300–1000ms window:

1. **Same 2× reverse ramp.**
2. **No message.** The user committed enough to clear the "afraid to
   commit" threshold but not enough to fire. This is the *most common*
   release in the human-trial expectation: people who are deciding,
   reconsidering, deciding again. Silence honours that ambiguity.
3. **No audio sting.**

### Notes for Phase 2B kraken-revolver

- The ramp's "linear" instruction is non-negotiable. Do not use a
  `Math.pow(t, 2)` or `Math.sqrt(t)` "for taste".
- The 4Hz micro-pulse during tension threshold is **independent** of
  the 14Hz ambient bulb AC ripple in `lighting.ts`. They sum. Phase 2B
  should add the micro-pulse as an *additive* offset on top of the
  ambient pulse, not replace it.
- The breath rate doubling is implemented on the audio source, not via
  loading a second clip. Sprint 2 audio is synth-placeholder; Sprint 3
  swaps to real loops. The `playbackRate` interface survives the swap.


---

## 4. Empty-click 1–6 progression detail

PLAN §5 specifies the lobby progression. The table below is the
designer-authored detail per click, with the constants in
`scene-revolver-constants.ts` populated to match.

### Per-click feedback matrix

| Click | DARKEN (bulb intensity scalar) | New audio cue                                            | New visual cue                                                                  |
|-------|--------------------------------|----------------------------------------------------------|---------------------------------------------------------------------------------|
| 0     | `1.00` (baseline)              | ambient only (room loop, 14Hz hum)                       | idle revolver bob, baseline bulb sway                                           |
| 1     | `0.92`                         | counter tick sfx (single short percussive transient)     | bulb flicker `EMPTY_CLICK_FLICKER_MS = 120ms`                                   |
| 2     | `0.82`                         | counter tick sfx (same as click 1)                       | bulb flicker + the new lower baseline darkens the corners visibly               |
| 3     | `0.68`                         | + heartbeat (synth low-freq pulse, 60Hz fundamental, 75bpm) | bulb flicker + heartbeat-synchronised soft fov "thump" at every pulse           |
| 4     | `0.52`                         | + sweat drip (single short noise burst, ~120ms, band-pass ~3kHz, plus a single low "plip" 120Hz transient) | bulb flicker + a single tear-shaped highlight smear on the revolver barrel (Sprint 3 prop work; Sprint 2 stub renders the audio only) |
| 5     | `0.38`                         | + chair creak (synth band-pass white-noise envelope, ~200ms attack, ~400ms sustain, ~3kHz centre, slight bend down to ~2kHz) | bulb flicker + 1-frame chair micromovement (Sprint 3; Sprint 2 audio only)      |
| 6     | `0.22`                         | reveal-lite: 800ms silence, then "Bunu yapmamalıydın. / Не следовало этого делать." spoken at very low-pass (synth TTS placeholder Sprint 2 → real recording Sprint 3) | reveal-lite overlay fades in. The bulb does **not** flicker on click 6 — the room just goes dim and stays dim, an audible absence |

### Why the curve accelerates

The original Phase 1 placeholder curve was
`[1.0, 0.95, 0.85, 0.72, 0.58, 0.42, 0.28]`. After looking at it next to
PLAN §5 and the HUD glow curve in §5 of this document, the designer
tuned to `[1.0, 0.92, 0.82, 0.68, 0.52, 0.38, 0.22]` for three reasons:

1. **Click 1 needs to be perceptible.** A 5% drop (1.0 → 0.95) is at the
   Weber threshold for brightness perception in a low-light scene; a
   subset of users will not consciously register it. 8% (1.0 → 0.92) is
   safely above threshold while still leaving room for the later steps
   to feel like distinct events.
2. **Click 6 should feel near-pitch.** The "reveal-lite" moment is
   meant to read as **the room giving up on itself** — when the user
   "wins" the 1-in-6 game by accumulating six empty clicks, the room's
   reward is to dim out around them. `0.22` puts the bulb intensity at
   ~22% of baseline (which Phase 1 designer set to 3.4 — so ~0.75
   effective intensity at click 6). That is dim enough that the HUD's
   ramped-up glow becomes the visual anchor (§5), but bright enough
   that the revolver itself is still legible. `0.28` from the Phase 1
   placeholder left the room "lit but worried"; `0.22` reads as
   "abandoned".
3. **The middle of the curve (clicks 2–4) needs to feel like steady
   loss.** Even decrements of ~0.10–0.15 per click in this middle zone
   give the user the perception that "every click costs the same" — the
   linearity is the menace. The acceleration past click 4 (0.52 → 0.38
   → 0.22) is the room running out of headroom.

The curve is not a smooth mathematical function. It is hand-tuned. Phase
2B should treat the array as the authoritative source — do not regress
to a `Math.pow` or geometric series "to clean it up".

### Audio cue stacking

Cues are **additive**. After click 4, all of the following are running
concurrently when the player holds again: ambient room loop + flicker
sfx (from prior clicks' bulb-flicker events fading out) + heartbeat
loop + sweat drip (one-shot, played once at click 4 onset). The audio
mix needs to keep each cue independently audible — Phase 2B audio
implementer should pan/EQ to avoid a "wall of sound" feel:

- **Heartbeat:** centred low-frequency (LFE seat).
- **Sweat drip:** centred, briefly above the room loop EQ-wise.
- **Chair creak:** offset slightly to one side (the chair is to the
  player's right per the scene blocking — pan right ~30%).

Sprint 2 ships synth placeholders for all of these. Sprint 3 (model
freeze) swaps to .ogg files; the mixing notes apply to both versions.

### Note on bulb flicker duration

`EMPTY_CLICK_FLICKER_MS = 120ms` is held constant across clicks 1–5.
The *intensity* of the flicker (how dark the bulb goes during the
flicker) is implicit in the underlying `DARKEN_CURVE` — a flicker at
click 4 starts from a darker baseline, so the absolute brightness
modulation is smaller, but the *contrast ratio* of the flicker is
preserved. Phase 2B should implement flicker as a brief multiplier on
top of the current scaled intensity, not as an absolute dip.


---

## 5. HUD glow tier curve

The HUD glow alpha rises as the darken curve falls. This is the central
visual idea of the lobby: **as the room gives up its light, the HUD
takes over as the only legible surface**. The sayaç becomes the visual
anchor — and because the sayaç is showing the player how many empty
clicks they've spent, the visual focus *is* the running cost.

### Final curve (verified, Phase 1 placeholder retained)

| Click | DARKEN_CURVE_PER_CLICK | HUD_GLOW_ALPHA_BY_CLICK |
|-------|------------------------|-------------------------|
| 0     | `1.00`                 | `0.50`                  |
| 1     | `0.92`                 | `0.55`                  |
| 2     | `0.82`                 | `0.62`                  |
| 3     | `0.68`                 | `0.70`                  |
| 4     | `0.52`                 | `0.78`                  |
| 5     | `0.38`                 | `0.88`                  |
| 6     | `0.22`                 | `1.00`                  |

### Why these specific HUD values

The Phase 1 placeholder `[0.50, 0.55, 0.62, 0.70, 0.78, 0.88, 1.00]` was
designed before the darken curve was finalised. Now that DARKEN is
tuned, the curves are verified inversely-paired:

- **Click 0:** room at 100% bulb, HUD glow at 50% alpha. The HUD is
  legible but recessive — the room is the focal point.
- **Click 3:** room at 68%, HUD at 70%. **Crossover point.** This is
  the click where the HUD starts to outweigh the bulb as the primary
  visual element. PLAN §5 places the first emotional cue (heartbeat) at
  click 3 — the crossover here is intentional. The user's attention is
  pulled to the HUD precisely when the audio cue arrives.
- **Click 6:** room at 22%, HUD at 100%. The reveal-lite moment lands
  with the HUD as the only ramped surface. The bilingual reveal-lite
  message ("Bunu yapmamalıydın.") can render against a near-black
  background, the sayaç showing "6/6" at full glow above it.

### Aesthetic intent: "vacuum tube indicator"

`atmosphere-direction.md` §5 documents the HUD as a "lampovaya radyo
gösterge" — a vacuum-tube display. The rising alpha gives the impression
that the indicator is **warming up**: an old tube radio that needs a
minute to come to full brightness. The reading is deliberate; PLAN §2's
"lampovaya radyo gösterge" cue is the basis. PALETTE.neon
(`#4a5d3a`, the CRT phosphor green) is already locked Phase 1.

### Phase 2B frontend-dev contract

`HUD_GLOW_ALPHA_BY_CLICK[emptyClicks]` drives the `text-shadow` alpha on
the sayaç digits. Specifically:

```css
text-shadow: 0 0 2px rgba(74, 93, 58, var(--hud-glow-alpha));
```

The `--hud-glow-alpha` CSS custom property is set from the array index
in the FSM observer. Use the **clamped** index — if some future code
path leaks a 7th empty click before reveal-lite forces the state, the
JS should clamp to `array.length - 1` rather than throw.

The 2px radius is symmetric (no offset). Per atmosphere-direction.md
§5, do not switch to a directional drop-shadow — modern UI reading
breaks the diegetic frame.


---

## 6. RNG visibility contract

PLAN §6 (line 232 literal): "Spin durduğunda chamber namluya bakar —
kullanıcı *göremez* hangisi durdu."

This is the **anti-cause-and-effect** contract. It is the single most
important visual decision in the revolver mechanic. Phase 2B
implementers must read this section before touching `revolver-anim.ts`
or `revolver-rng.ts`.

### The contract, in three rules

1. **The spin animation ends at a fixed visual cylinder rotation.** Pick
   one angle (designer recommends a multiple of 60° to align with the
   six chambers, e.g. 360° × 4 = 1440° as the visible end rotation —
   the SSOT `SPIN_TURNS = 4` says four full revolutions, so end at
   the start rotation). Every spin ends at the **same** visual angle.
   No randomisation of the visual stopping point.
2. **The bang/empty outcome is independent of the visual cylinder
   angle.** `revolver-rng.ts` already implements this — it pulls a
   `crypto.getRandomValues` modulus-6 and emits `'bang' | 'empty'`
   without ever computing or storing a "chamber index". Do not
   retrofit a chamber index. Do not "show which chamber was next" in
   debugging UI that ships.
3. **The player never sees which chamber was painted.** The "kan
   kırmızısı boyalı kovan" (PLAN §6) is a *fictional* prop — it exists
   in the diegetic universe but the texture should not place a visible
   red mark anywhere the camera can see it. Sprint 3's GLB swap must
   honour this: the painted chamber may exist in the geometry but its
   rotation around the cylinder axis is undefined per-spin.

### Why this matters

Russian roulette is the genre's most famous example of **denied
causation**. The player presses the trigger; the bullet may or may not
fire. If the user can see which chamber stopped at the barrel, they can
reason backwards from a sequence of outcomes ("the painted one was at
position 3 last spin; if I count forward by N…") and the game becomes a
counting exercise. The diegetic ritual collapses into mechanics.

Denying the player visual access to the chamber state forces them back
into the only experience the game wants to deliver: **uncertainty as a
felt thing**. Every spin must land on the same visual end-state. The
outcome must be revealed only through the bang/empty *event*, not the
cylinder *geometry*.

### Phase 2B kraken-revolver checks

- Verify `revolver-anim.ts`'s spin animation lerps cylinder rotation
  from `currentAngle` to `currentAngle + 360° × SPIN_TURNS` (i.e. ends
  at the start angle modulo 360°). **Do not** add a random
  end-rotation offset.
- Verify `revolver-rng.ts`'s `pullTrigger()` does not return a chamber
  index. The current signature is `() => 'empty' | 'bang'` and must
  stay that way.
- If a dev-only debug log prints the RNG seed or the outcome, gate it
  behind `process.env.NODE_ENV === 'development'` AND remove it before
  any QA build. Sprint 9 acceptance tests will look for this.

### Acceptable: the outcome reveal

The bang/empty is revealed via the cock-fall-(kick or silence)
sequence after the spin. That is the legitimate channel for the
outcome — through the *animation event*, not the *cylinder geometry*.
Phase 2B is free to make the fall/kick animations as expressive as
they want (within `KICK_RECOIL_DEG`, `KICK_CAMERA_SHAKE_DEG`, and the
one-frame white flash budget).


---

## 7. Bang transition Sprint 2 placeholder spec

Sprint 2 stops at the bang exit state. The destruction-director that
PLAN §7 specifies lives in Sprint 4. This section locks the exact
hand-off shape so Sprint 4 can pick up cleanly.

### Sprint 2 bang sequence

When `pullTrigger()` returns `'bang'` and the FSM transitions through
`firing(outcome: 'bang') → (animation: fall, kick)`:

1. **Frame 1: full-white flash.** Single-frame, full-viewport, opacity
   1.0 white overlay. The frame duration is hardware-dependent (~16ms
   at 60Hz, ~33ms at 30Hz); the contract is **exactly one rendered
   frame**, not a duration. `KICK_FLASH_FRAMES = 1` and
   `BANG_FLASH_DURATION_MS = 16` are both in the SSOT — Phase 2B
   frontend-dev should drive the flash from the frame counter, not
   the millisecond timer, so it does not blur on low-end GPUs.
2. **Fade to black: 800ms.** From the moment the flash ends, the
   viewport transitions to opacity-1 black over `BANG_FADE_TO_BLACK_MS =
   800ms`. The fade curve is linear (a simple `opacity` interpolation in
   CSS or in a WebGL clear-pass; either is acceptable). No easing.
3. **End state: black screen.** That is where Sprint 2 stops. No
   subsequent animation. The renderer should be paused or rendering
   a constant black quad; the audio should be a low-pass-filtered
   tinnitus tone (Sprint 2 synth placeholder; Sprint 3 ships the
   real recording).

### What Sprint 2 explicitly does NOT do

- **No phase progression.** The destruction-director's Faz 0–8 (PLAN §7)
  are Sprint 4 territory. The bang screen sits at "black + tinnitus"
  indefinitely in Sprint 2.
- **No reveal animation.** Faz 8's reveal (ШУТКА / Ş A K A) is Sprint 6.
  Sprint 2 has no "press any key to continue" affordance after the
  bang.
- **No ESC-hold reveal.** PLAN §9's failsafe ESC-3sn-hold remains wired
  globally (Sprint 0 finding), but in Sprint 2 the bang screen does
  not surface a hint. If the user wants out, ESC-hold or Cmd+Q work.

### Sprint 4 hand-off contract

When Sprint 4 destruction-director picks up:

- It consumes the **bang exit state** from the FSM — the moment after
  `firing → idle` transition would normally fire for a 'bang' outcome.
  Look at `revolver-state.ts:onAnimationComplete` — the
  `state.outcome === 'bang'` branch currently returns `state` (a
  terminal hold). Sprint 4 swaps that branch to dispatch to the
  destruction-director.
- The renderer state at Sprint 4's hand-off point is **already
  black** (per Sprint 2's spec above). Sprint 4 should treat the black
  screen as its t=0 — Faz 0 of the destruction sequence starts here.

### Note: white-flash accessibility consideration

A single-frame full-viewport white flash can trigger photosensitive
seizures in vulnerable users. PLAN's `prefers-reduced-motion` support is
a Sprint 9 item, but Phase 2B frontend-dev should at minimum **wrap
the flash render in a check** for `window.matchMedia('(prefers-reduced-
motion: reduce)').matches`. If reduced motion is on, render the
fade-to-black directly without the white flash. The contract is "user
opted out of motion" not "user opted out of bang"; the bang still
happens, the visual sting just softens.

This is in scope for Sprint 2 because the hook is cheap (one
boolean check) and the alternative (waiting until Sprint 9 to add
accessibility) ships a known photosensitivity hazard.


---

## 8. Phase 2B kraken-revolver validation list

These are the **post-implementation checks** kraken-revolver should run
before declaring Phase 2B done. They are not full vitest suites (those
land Sprint 9); they are smoke-level assertions designed to catch
regressions that are easy to write but hard to spot visually.

### 8.1 RNG distribution: 100× pullTrigger() → bang in [12, 22]

The bang rate is 1/6 by `RNG_BANG_MODULUS = 6` and the modulus-0
remainder. For N=100 trials, the expected bang count is 16.67. A
±10% tolerance gives a comfortable acceptance band of [12, 22].

**Implementation (Sprint 2 manual log assertion is fine):**

```ts
// In a dev-only test harness, e.g. revolver-rng.dev-test.ts
import { pullTrigger } from './revolver-rng';
const results = Array.from({ length: 100 }, () => pullTrigger());
const bangs = results.filter(r => r === 'bang').length;
console.log(`bang count: ${bangs} / 100`);  // expect 12..22
if (bangs < 12 || bangs > 22) {
  console.warn(`RNG distribution outside ±10% tolerance`);
}
```

Sprint 9 promotes this to a vitest with `expect(bangs).toBeGreaterThanOrEqual(12)` etc. Sprint 2 manual log is acceptable; the goal is to catch off-by-one regressions on `RNG_BANG_MODULUS` or `RNG_BANG_REMAINDER` quickly.

### 8.2 Hold timing on slow framerates

The FSM uses `performance.now()` deltas (see `revolver-state.ts`
`onMouseUp`). That is the right choice — frame counts would drift on
30fps systems. Validation:

- Force the renderer to a 30fps cap (DevTools → Performance → CPU
  throttle 6×, or set a manual rAF interval limiter).
- Hold the trigger for what feels like 1 second.
- The `heldMs = nowMs - holdStartMs` math in `onMouseUp` should still
  cross `HOLD_DURATION_MS = 1000` based on wall-clock time, not the
  number of rAF callbacks that fired.

This sounds trivial; the regression to watch for is a Phase 2B author
"optimising" by switching to a frame-counter timer ("I already have a
delta from the animation loop, may as well reuse it…"). That would
break the contract. Keep `performance.now()`.

### 8.3 Early-release vs spring-back vs commit boundaries

The three release branches (§2) are easy to mis-author into a bug.
Concretely test:

| Hold duration | Expected outcome                                 |
|---------------|--------------------------------------------------|
| 0–299ms       | spring-back, surface "Karar veremedin." message  |
| 300–999ms     | spring-back, silent (no message)                 |
| ≥1000ms       | commit to spinning, no release branch            |

The FSM in `revolver-state.ts` already encodes the first two correctly
(both return `{ kind: 'idle' }` for heldMs < HOLD_DURATION_MS). The
**mount layer** is where the message-or-no-message decision is made.
Phase 2B should ensure the mount layer reads back the `holdStartMs`
delta on release to decide whether to fire the "Karar veremedin."
message; do not duplicate the threshold in two places.

### 8.4 Empty-click counter persistence across spins

PLAN §5 specifies the lobby progression is **per-session**, not per-
spin. That is: the counter increments on each empty outcome and resets
**only** at a bang outcome (which leads to destruction, where the
counter is moot) or at the 6th empty (reveal-lite). It does **not**
reset on the user releasing too early — that's not a "click" in PLAN
§5's language, it's a non-event.

Phase 2B validate:
- Click 1 (empty) → counter = 1, lighting = DARKEN[1].
- User early-releases mid-second-hold → counter stays at 1.
- Click 2 (empty) → counter = 2, lighting = DARKEN[2].

The counter advance happens at the FSM transition `firing(empty) →
idle`, not at any earlier point. The mount layer owns the counter
(per `revolver-state.ts` doc).

### 8.5 Reduce-motion accessibility (Sprint 2 partial)

Wrap the bang flash render in a `prefers-reduced-motion` check
(§7). The hold-state ramps (fov shrink, camera shake on kick) are
NOT in scope for reduce-motion handling Sprint 2 — that's a Sprint 9
accessibility pass. Only the photosensitivity-relevant flash needs
the check now.


---

## Files this designer pass authored or edited

| File                                                                       | Change                          |
|----------------------------------------------------------------------------|---------------------------------|
| `src/renderer/scene/revolver/revolver-direction.md`                         | NEW (this file).                |
| `src/shared/scene-revolver-constants.ts`                                    | Tuned DARKEN_CURVE_PER_CLICK,   |
|                                                                            | verified EMPTY_CLICK thresholds |
|                                                                            | + flicker duration, verified    |
|                                                                            | HUD_GLOW_ALPHA_BY_CLICK.        |
| `src/renderer/scene/atmosphere-direction.md`                                | Appended §7 Sprint 2 polish     |
|                                                                            | notes. §1–§6 unchanged.         |

## Files designer did NOT touch (Phase 2B collision-safety)

`src/renderer/scene/revolver/*.ts` (kraken-revolver), `revolver/hud/*.ts`
(frontend-dev), `lighting.ts` (kraken-revolver Phase 2B), the
non-tuned sections of `scene-revolver-constants.ts` (FSM timing,
animation timings, hold-state feedback, HUD typography, RNG, bang
overlay), `src/renderer/i18n/strings.ts` (i18n-expert), `styles/*`
(frontend-dev), `audio/*` (audio-expert later sprint).

---

*End of revolver direction. Questions on visual or timing decisions
should copy the relevant section into the conversation so the rationale
stays linked to the constants. Sprint 2 retro should revisit clicks 1–6
audio mix levels once the synth placeholders are auditioned in the
mount.*

---

## 9. Sprint 3 — GLB swap notes

> Appended 2026-05-20 by designer agent (Sprint 3 Phase 2A SOLO). These
> are Sprint 3 deltas on top of the Sprint 1 atmosphere direction and
> the Sprint 2 §1–§8 revolver direction. The model-freeze composition
> details live in `src/renderer/scene/model-freeze-direction.md`; this
> §9 documents the **revolver-specific** decisions for the GLB swap
> that affect the §6 RNG visibility contract and the Sprint 2
> AnimationMixer rebind.

### 9.1 Why §9 is here (not deferred)

The directive offered §9 as optional **IF** the GLB swap is clean
(named hammer / cylinder / body, scale fits, no surprises). The
Quaternius Poly Pizza CC0 revolver (PolyPizza E7IaG9TptR) is a generic
low-poly model — author intent is "looks like a revolver from across a
table", NOT "rigged for animation". Designer expectation is that the
GLB is **monolithic** (single combined mesh, no named hammer /
cylinder / body children).

That expectation makes §9 non-optional: Phase 2B kraken-loader needs
explicit designer guidance on the monolithic-fallback path so the
Sprint 2 AnimationMixer's 5 clips (cock, spin, fall, kick, idle)
continue to play correctly. The §6 RNG visibility contract amplifies
the stakes — if the cylinder spin clip can't rotate just the cylinder
because the mesh is monolithic, the visible animation might
accidentally reveal the spin end angle that the contract forbids.

### 9.2 Discovery protocol (Phase 2B kraken-loader)

The pivot lookup uses the existing SSOT names from
`scene-model-constants.ts`:

```ts
import {
  MODEL_REVOLVER_HAMMER_PIVOT_KEY,    // 'Hammer'
  MODEL_REVOLVER_CYLINDER_PIVOT_KEY,  // 'Cylinder'
  MODEL_REVOLVER_BODY_PIVOT_KEY,      // 'Body'
} from '../../shared/scene-model-constants';

// After GLB load:
const hammer = glbScene.getObjectByName(MODEL_REVOLVER_HAMMER_PIVOT_KEY);
const cylinder = glbScene.getObjectByName(MODEL_REVOLVER_CYLINDER_PIVOT_KEY);
const body = glbScene.getObjectByName(MODEL_REVOLVER_BODY_PIVOT_KEY);
```

**Three outcomes:**

1. **All three found (Blender-rigged GLB):** use directly as
   AnimationMixer targets. Sprint 2 clips bind one-to-one to the
   named children. Best case.
2. **Some named, others not:** mixed case. Phase 2B kraken-loader
   reports the missing names via `document.body.dataset['revolver-
   pivots']` and falls back to the monolithic path (§9.3) for the
   missing pivots. Designer accepts this gracefully — partial-rigged
   GLBs are real-world outputs.
3. **None found (monolithic mesh):** the GLB is a single combined
   Mesh. Phase 2B falls back to programmatic Object3D wrapping per
   §9.3.

### 9.3 Monolithic fallback — programmatic Object3D wrapping

If the GLB ships as a single mesh, Phase 2B kraken-loader wraps the
mesh in three Object3D pivots at the **anatomical positions** of a
real revolver's hammer / cylinder / body:

```text
revolver-root (Group, MODEL_POSITION_REVOLVER / SCALE / ROTATION)
  ├─ body-pivot (Object3D at body anatomical origin)
  │   └─ MeshClone-A (the monolithic mesh, no rotation applied)
  ├─ cylinder-pivot (Object3D at cylinder axis origin)
  │   └─ MeshClone-B (the same monolithic mesh, masked to cylinder area)
  └─ hammer-pivot (Object3D at hammer hinge origin)
      └─ MeshClone-C (the same monolithic mesh, masked to hammer area)
```

**Designer's visual ratification (the load-bearing question):**

Wait — the monolithic fallback as described above is wrong. You cannot
clone the entire mesh three times because the Sprint 2 AnimationMixer
rotates each pivot independently — if all three pivots contain the same
full mesh, rotating the cylinder pivot would rotate the entire visible
revolver, not just the cylinder.

**The correct fallback is simpler and more honest: rotate the
WHOLE revolver as the body-pivot for `cock` / `fall` / `idle` / `kick`,
and animate the WHOLE revolver as the cylinder-pivot for `spin`**.

The §6 RNG visibility contract is preserved because:
- The spin animation ends at the same visual angle (`SPIN_TURNS = 4`,
  end at start angle). Rotating the whole monolithic mesh 4 times
  still ends at the same visible state.
- The chamber is invisible from the static camera angle anyway (the
  cylinder face is partly occluded by the body); the player cannot
  count chamber positions even on the rigged GLB.

**Visual cost of the fallback:**
- The `cock` animation (30° hammer rotation) becomes a 30° rotation
  of the entire revolver. This reads as "the gun tilts back when
  cocked" — subtly different from the rigged "the hammer pulls back"
  but still mechanically legible. **Acceptable Sprint 3 visually.**
- The `spin` animation (4 cylinder turns) becomes 4 rotations of the
  entire revolver around the cylinder axis. This reads as "the gun
  spins on the table" — exactly the cinematic spin from many
  Russian-roulette films. **Acceptable, possibly preferable.**
- The `fall` (1-frame snap) and `kick` (5° body tilt + camera shake)
  animations are body-only already; no degradation.
- The `idle` (subtle bob) animation moves the whole revolver up/down
  in sync with the bulb sway; the rigged version would only move the
  body and leave the hammer/cylinder stable. Visually similar at the
  Sprint 1 amplitudes — the bob is sub-millimetre.

### 9.4 Sprint 3 designer ratification of the fallback

**Designer's position: ship the monolithic fallback if §9.2 discovery
finds no named children.** Reasoning:

1. The Sprint 2 mechanic (hold / spin / bang / empty) is fully
   functional and well-tuned. Replacing the primitive revolver mesh
   with the GLB is an art upgrade, not a mechanical change.
2. Deferring the GLB swap to Sprint 4 (the alternative if the
   monolithic mesh is "not good enough") would slip the model freeze
   checkpoint (PLAN §11 line 595-616, Sprint 3 sonu freeze) and
   downstream-impact Sprint 4 destruction-director's frozen-frame
   contract.
3. The visual cost (§9.3) is acceptable — the "whole-gun-tilts-when-
   cocking" reading is slightly less anatomically correct but more
   cinematically familiar. Players will not notice the difference
   without a side-by-side comparison.
4. The §6 RNG visibility contract is preserved either way.

**Phase 2B kraken-loader: ship the monolithic fallback. Sprint 3 done.
Sprint 4 destruction-director can pick up the bang exit state from
§7 unchanged.**

If Sprint 5 QA reports the cock animation reads as "gun tilts
weirdly" with the monolithic fallback, Sprint 6 can:
- Manually rig the GLB in Blender (15-30 minutes of work — split the
  hammer + cylinder + body into named children, re-export).
- Vendor a Sketchfab Nagant M1895 alternative
  (`src/renderer/assets/models/incoming/README.md` lists one).

That's a Sprint 6 fix path, not a Sprint 3 blocker.

### 9.5 Chamber visibility contract reaffirmation (RNG safety)

PLAN §6 line 232: "Spin durduğunda chamber namluya bakar — kullanıcı
*göremez* hangisi durdu." Sprint 2 §6 (this document) is the literal
contract: every spin ends at the same visual cylinder angle, no
randomisation of the visual stopping point, the outcome is revealed
only through the bang/empty animation event.

**Sprint 3 GLB swap impact:** the chamber visibility contract HOLDS.
The Sprint 2 implementation in `revolver-anim.ts` was authored against
the §6 contract (kraken-revolver Phase 2B Sprint 2). The GLB swap is
geometry-only — the animation logic is unchanged. Phase 2B
kraken-loader's rebind of the AnimationMixer (model-freeze §8.8)
preserves the existing clip definitions.

Phase 2B kraken-loader verify:
- After GLB swap, run 10 consecutive spin animations (dev-only test
  harness, NOT in production code path).
- The visible cylinder angle at the end of each spin is the same
  ±1° (rounding noise from the rebind).
- If the angle drifts per-spin, the rebind is wrong — the spin clip
  is being applied to an Object3D that includes a baked rotation
  offset from the GLB's authored pose. Fix: zero the pivot's
  initial rotation before binding.

### 9.6 Material override (model-freeze §2.1 cross-ref)

The revolver's material color override is `#1a1816` (just above
PALETTE.oak `#1c1814`). Per model-freeze §3.3, the revolver is the
brightest single object in the table-top region — but only because
of the bulb cone landing on its specular highlights. The base albedo
is intentionally darker than the table so the bulb cone reads as a
**highlight**, not as a flat fill.

Phase 2B kraken-loader applies this override at GLB load time via the
`MATERIAL_COLOR_OVERRIDE_BY_KEY` constant (newly added to
`scene-model-constants.ts` per model-freeze §7.1). No revolver-specific
code changes needed in revolver-mount.ts; the override is data, not
behaviour.

### 9.7 What §9 explicitly does NOT change

- The Sprint 2 FSM (revolver-state.ts) is unchanged.
- The Sprint 2 animation timings (COCK_DURATION_MS=250,
  SPIN_TURNS=4, KICK_FLASH_FRAMES=1, etc.) are unchanged.
- The Sprint 2 RNG (revolver-rng.ts) is unchanged.
- The Sprint 2 HUD glow curve (HUD_GLOW_ALPHA_BY_CLICK) is unchanged.
- The Sprint 2 DARKEN_CURVE_PER_CLICK is unchanged.
- The Sprint 2 RNG visibility contract (§6) is unchanged.
- The Sprint 2 bang transition placeholder (§7) is unchanged — Sprint
  4 destruction-director consumes the same bang exit state.

§9 is **art swap only**. Mechanics are locked Sprint 2.

