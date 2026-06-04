# Sound Audit Checklist — Sprint 8 Phase 1 scaffold

> Lane A populates the measured values in Phase 2B. Phase 2A designer
> §24 produces the canonical spec; this checklist is the AUDIT
> instrument (one row per audio source × one column per audit
> dimension; empty checkboxes are filled after Lane A inspection).

## Scope

Audits every Sprint 4-7 audio source for the five dimensions every
audio surface owns:

- **target dB** — peak / sustain levels (SSOT in
  `src/shared/scene-destruction-constants.ts` gain constants)
- **envelope ADSR** — attack / decay / sustain / release shape
- **dispose contract** — how the source releases its Web Audio nodes
  (explicit `dispose()`, `ended` event listener, abort signal)
- **cross-Faz handoff** — whether the source survives a Faz transition
  or hands off to the next-Faz successor
- **reduced-motion behaviour** — amplitude clamp / gate / silence per
  the a11y matrix in `destruction-direction.md` §8

## Conventions

| Marker | Meaning                              |
|--------|--------------------------------------|
| `[ ]`  | Audit pending — Lane A to populate  |
| `[x]`  | Audit complete — value documented   |
| `[~]`  | Audit complete — KNOWN-LIMITED       |
| `[?]`  | Audit blocked — open question for Phase 2A designer review |

Reference SSOT: `src/shared/scene-destruction-constants.ts` gain
constants own the design contract for amplitude. The audit FILLS the
checkbox by documenting the MEASURED value alongside the constant
name. A `MEASURED ≠ DESIGN` mismatch is a Sprint 8 Lane B (@profiler)
escalation candidate.

---

## 1. Sprint 4 audio sources (Faz 0-3)

### 1.1 Bang one-shot (`playBang` — `destruction-audio.ts` BangBranch)

- [ ] **target dB** — design: -3dB peak (`BANG_FALLBACK_GAIN` ≈ 0.708 linear) — measured: ____
- [ ] **envelope ADSR** — design: 50ms attack + 200ms exponential decay (250ms total) — measured: ____
- [ ] **dispose contract** — design: `src.addEventListener('ended', () => disconnect)` self-clean + `state.howl.unload()` on explicit dispose — measured: ____
- [ ] **cross-Faz handoff** — design: one-shot, no handoff (fires once at Faz 0 entry)
- [ ] **reduced-motion** — design: UNCHANGED (functional audio — single bang punctuates revolver trigger; silencing breaks narrative cue)

### 1.2 Empty click one-shot (`playEmptyClickSound` — `revolver-sfx.ts`)

- [ ] **target dB** — design: ____ — measured: ____
- [ ] **envelope ADSR** — design: ____ — measured: ____
- [ ] **dispose contract** — design: per-fire allocation + `ended` event self-clean — measured: ____
- [ ] **cross-Faz handoff** — design: one-shot pre-BANG (Sprint 2 SFX, fires on idle→firing(empty) transition)
- [ ] **reduced-motion** — design: UNCHANGED (functional audio)

### 1.3 Bulb crackle (`bulb-hum` ambient layer + crackle accent)

- [ ] **target dB** — design: ____ (SSOT: `AMBIENT_DEFAULT_VOLUME` for hum) — measured: ____
- [ ] **envelope ADSR** — design: ambient sustain (no envelope per-cycle); flicker accents per Sprint 4 §3 — measured: ____
- [ ] **dispose contract** — design: AudioBed `setLayerVolume(layer, 0)` + close on `AudioBed.dispose()` — measured: ____
- [ ] **cross-Faz handoff** — design: SURVIVES through Faz 0-7; ramps back to baseline during Faz 8 reveal (`fadeInAmbient`)
- [ ] **reduced-motion** — design: UNCHANGED (ambient bed is felt-cue, not motion surface)

### 1.4 Ambient bed (`audio-bed.ts` — 4 layers via `ambient-synth.ts`)

| Layer        | Constant                   | Design dB / source                              | Audit  |
|--------------|----------------------------|------------------------------------------------|--------|
| bulb-hum     | `AMBIENT_DEFAULT_VOLUME`   | 100Hz sine + 200Hz harmonic + LFO (designer §1)| [ ]    |
| wind         | `AMBIENT_DEFAULT_VOLUME`   | white noise low-pass filtered (designer §1)    | [ ]    |
| radio-static | `AMBIENT_DEFAULT_VOLUME`   | pink noise + AM modulation (designer §1)       | [ ]    |
| water-drip   | `AMBIENT_DEFAULT_VOLUME`   | sparse impulse (designer §1)                    | [ ]    |

- [ ] **cross-Faz handoff** — design: Faz 0 `applyLowPass` muffles every layer; Faz 8 `fadeInAmbient` ramps each back over 3sn
- [ ] **reduced-motion** — design: UNCHANGED across all four layers

### 1.5 Tinnitus 4kHz (`startTinnitus` — TinnitusBranch)

- [ ] **target dB** — design: -12dB (`TINNITUS_AMPLITUDE_DB`) full / -18dB (`TINNITUS_AMPLITUDE_REDUCED_MOTION_DB`) — measured: ____
- [ ] **envelope ADSR** — design: 100ms linear fade-in to target; sustained; no release — measured: ____
- [ ] **dispose contract** — design: explicit `osc.stop()` + `osc.disconnect()` + `gain.disconnect()` on `tinnitus.stop()` — measured: ____
- [ ] **cross-Faz handoff** — design: SURVIVES Faz 0-7; released only on sequence dispose OR ESC abort
- [ ] **reduced-motion** — design: amplitude clamp to -18dB (`TINNITUS_AMPLITUDE_REDUCED_MOTION_DB`)

### 1.6 Native chord stub (`playNativeChord` — ChordBranch)

- [ ] **target dB** — design: -10dB peak (`CHORD_PEAK_GAIN` ≈ 0.316 linear) per layer — measured: ____
- [ ] **envelope ADSR** — design: 50/200/100/400ms (`CHORD_ATTACK_MS` / `CHORD_DECAY_MS` / `CHORD_SUSTAIN_MS` / `CHORD_RELEASE_MS`) — measured: ____
- [ ] **dispose contract** — design: per-layer `osc.stop(now + totalSec)` + `ended` event self-clean — measured: ____
- [ ] **cross-Faz handoff** — design: one-shot at Faz 1 entry; release tail completes within Faz 1 window
- [ ] **reduced-motion** — design: UNCHANGED (audio amplitude unchanged; visual gates do not affect audio per §8 row 4-5)

---

## 2. Sprint 5 audio sources (Faz 4-5)

### 2.1 HDD-grind (Faz 4 — `createHDDGrindHandle` in `destruction-audio-faz45.ts`)

- [ ] **target dB** — design: ____ (designer §15) — measured: ____
- [ ] **envelope ADSR** — design: ramp-up + band-pass 200-800Hz + 2Hz LFO punches — measured: ____
- [ ] **dispose contract** — design: explicit `disposeHDDGrind` disconnects source + bandpass + carrierGain + lfo + lfoGain — measured: ____
- [ ] **cross-Faz handoff** — design: SURVIVES Faz 4 → Faz 5; disposed at Faz 6 entry via owner pool teardown
- [ ] **reduced-motion** — design: -6dB amplitude clamp at start

### 2.2 Fan-overdrive (Faz 4-6 — `createFanOverdriveHandle`)

- [ ] **target dB** — design: 0.8 linear peak after 4sn ramp — measured: ____
- [ ] **envelope ADSR** — design: 4sn linear ramp 0→0.8, sustained — measured: ____
- [ ] **dispose contract** — design: explicit `disposeFanOverdrive` disconnects source + highpass + gain — measured: ____
- [ ] **cross-Faz handoff** — design: SURVIVES Faz 4 → Faz 5 → Faz 6; Faz 6 calls `stop()` before Faz 7 entry
- [ ] **reduced-motion** — design: -6dB peak gain

### 2.3 Electrical-buzz (Faz 5 — `createElectricalBuzzHandle`)

- [ ] **target dB** — design: -12dB harmonics — measured: ____
- [ ] **envelope ADSR** — design: 60Hz fundamental + 120Hz + 180Hz harmonics, low-pass-rolled, ramp 0→peak — measured: ____
- [ ] **dispose contract** — design: explicit `disposeElectricalBuzz` disconnects fundamental + harmonic2x + harmonic3x — measured: ____
- [ ] **cross-Faz handoff** — design: Faz 5 single-faz; disposed at Faz 6 entry via owner pool
- [ ] **reduced-motion** — design: -6dB amplitude clamp

---

## 3. Sprint 6 audio sources (Faz 6-8)

### 3.1 BSOD beep (Faz 6 — `createBSODBeepHandle` in `destruction-audio-faz67.ts`)

- [ ] **target dB** — design: ____ (designer §15 — `FAZ6_BSOD_BEEP_*` constants) — measured: ____
- [ ] **envelope ADSR** — design: 5/0/1/195ms — short attack, all sustain, brief release — measured: ____
- [ ] **dispose contract** — design: per-fire allocation; `osc.stop(releaseEnd + 0.01)` + `ended` event disconnects osc + gain — measured: ____
- [ ] **cross-Faz handoff** — design: one-shot at Faz 6 entry; envelope completes within Faz 6 window
- [ ] **reduced-motion** — design: -6dB amplitude

### 3.2 Electrical-tick (Faz 7 — `createElectricalTickHandle`)

- [ ] **target dB** — design: 0.4 linear peak (`ELECTRICAL_TICK_PEAK_GAIN`) / 0.2 reduced-motion — measured: ____
- [ ] **envelope ADSR** — design: 30ms white-noise burst low-pass-filtered at 200Hz Q=2.0; fires every 2sn via setInterval — measured: ____
- [ ] **dispose contract** — design: clearInterval + per-burst `ended` event disconnects src + lp + gain — measured: ____
- [ ] **cross-Faz handoff** — design: SURVIVES Faz 7; disposed at Faz 8 entry via owner pool
- [ ] **reduced-motion** — design: 0.2 peak (`ELECTRICAL_TICK_REDUCED_MOTION_GAIN`)

### 3.3 Ambient-recovery (Faz 8 reveal — `createAmbientRecoveryHandle`)

- [ ] **target dB** — design: -24dB baseline (`FAZ8_AUDIO_BED_BASELINE_GAIN_DB`) — measured: ____
- [ ] **envelope ADSR** — design: brown-noise + lowpass 400Hz; linear `fadeIn(3000)` ramp 0→-24dB — measured: ____
- [ ] **dispose contract** — design: `disposeAmbientRecovery` stops source + disconnects source + lowpass + gain — measured: ____
- [ ] **cross-Faz handoff** — design: Faz 8 reveal lifecycle; disposed at son-ekran teardown / restart abort
- [ ] **reduced-motion** — design: UNCHANGED amplitude (felt-cue, not motion surface)

### 3.4 Door-close accent (Faz 8 son-ekran — `createDoorCloseAccentHandle`)

- [ ] **target dB** — design: ~0.3 linear peak (`FAZ8_DOOR_CLOSE_PEAK_GAIN`) / 0.15 reduced-motion — measured: ____
- [ ] **envelope ADSR** — design: 5/40/(sustain)/200ms (`FAZ8_DOOR_CLOSE_ATTACK_MS` / `_DECAY_MS` / `_SUSTAIN_RATIO` / `_RELEASE_MS`) — measured: ____
- [ ] **dispose contract** — design: per-fire allocation; `osc.stop(stopAt)` + `ended` event disconnects osc + filter + gain — measured: ____
- [ ] **cross-Faz handoff** — design: one-shot at son-ekran +2sn; envelope completes within son-ekran window
- [ ] **reduced-motion** — design: -6dB amplitude (`DOOR_CLOSE_REDUCED_MOTION_RATIO` = 0.5)

---

## 4. Sprint 7 audio sources (Faz 8 reveal jingle)

### 4.1 Reveal jingle (4-oscillator chord — `createRevealJingle`)

- [ ] **target dB** — design: -30dBFS peak (`REVEAL_JINGLE_PEAK_DB` ≈ 0.0316 linear) / -36dBFS reduced-motion — measured: ____
- [ ] **envelope ADSR** — design: 200/100/0.3-of-peak/2000ms per `destruction-direction.md` §22 — measured: ____
- [ ] **dispose contract** — design: per-branch `branch.osc.stop()` + `disconnect()` on dispose; `ended` event removes branch from tracking set — measured: ____
- [ ] **cross-Faz handoff** — design: Faz 8 reveal lifecycle; disposed at son-ekran entry via `runtime.revealJingle.dispose()` in destruction-director
- [ ] **reduced-motion** — design: -6dB amplitude (`REVEAL_JINGLE_REDUCED_MOTION_RATIO` = 0.5)

### 4.2 Per-note voicing — chord verification

Confirm each oscillator wires the design frequency from
`REVEAL_JINGLE_CHORD_NOTES` (destruction-direction.md §22):

| Note | Frequency | Constant index | Audit  |
|------|-----------|----------------|--------|
| A3   | 220.00 Hz | `[0]`          | [ ]    |
| E4   | 329.63 Hz | `[1]`          | [ ]    |
| B4   | 493.88 Hz | `[2]`          | [ ]    |
| A5   | 880.00 Hz | `[3]`          | [ ]    |

- [ ] **oscillator type** — design: triangle wave (`REVEAL_JINGLE_OSCILLATOR_TYPE`) — measured: ____
- [ ] **summing topology** — design: per-note independent osc → gain → destinationNode (no shared GainNode); each note carries its own ADSR envelope but the envelopes are IDENTICAL so the chord reads as ONE instrument — measured: ____

---

## 5. Cross-Faz handoff hot spots

Sprint 8 Phase 2B Lane A audits cross-Faz transitions for dispose-
then-mount races. The hot spots (per `destruction-direction.md` §23
scene transition spec + Sprint 5/6 audio pool teardown ownership):

- [ ] **Faz 4 → Faz 5 transition** — HDD-grind survives; fan-overdrive survives; electrical-buzz mounts. NO overlap-window concerns (Faz 4 → Faz 5 boundary is the moment electrical-buzz constructs, not the moment HDD-grind disposes).

- [ ] **Faz 5 → Faz 6 transition** — electrical-buzz disposes (owner-pool teardown); BSOD-beep fires at Faz 6 entry. HOT SPOT: if Faz 6 entry runs BEFORE Faz 5's owner-pool teardown completes, the buzz overlaps the beep for ~1 frame. Sprint 8 Lane B (@profiler) measure the gap.

- [ ] **Faz 6 → Faz 7 transition** — fan-overdrive `.stop()` called at Faz 6 end; electrical-tick mounts at Faz 7 entry. NO overlap-window concern (fan-overdrive's release tail completes during Faz 7 entry; no audio collision because the release is brown-noise fading to zero).

- [ ] **Faz 7 → Faz 8 transition** — electrical-tick disposes (owner-pool teardown); ambient-recovery mounts at Faz 8 reveal entry. HOT SPOT: the reveal jingle ALSO fires at Faz 8 entry (0ms offset per `REVEAL_JINGLE_OFFSET_MS`). Sprint 8 Lane B audits peak voice count during this 1-sn window — design budget `MAX_VOICE_COUNT_AT_PEAK` = 16 in `scene-destruction-constants.ts`.

- [ ] **Faz 8 reveal → son-ekran transition** — reveal jingle release tail ends ~2.5sn into reveal; ambient-recovery sustains; door-close fires at son-ekran +2sn. Per `destruction-direction.md` §22 S12 acoustic check: NO temporal overlap between jingle + door-close, and the additive sum is comfortably below 0dBFS clipping.

- [ ] **Restart cycle (son-ekran → reveal re-entry)** — TEKRAR button click disposes ambient-recovery + door-close + reveal-jingle, then restarts Faz 8 reveal. Audit confirms `runtime.revealJingle.dispose()` runs BEFORE the new jingle instance is constructed (FSM transition gate enforced by `runtime.revealJingle = null` clear in destruction-director:655).

---

## 6. Designer §24 spec reference

Phase 2A designer §24 will publish the canonical sound-design spec
(per-source target dB / envelope intent / cross-Faz narrative role).
This audit checklist is the AUDIT instrument — when designer §24
ships, the "design:" fields above are confirmed against §24 (mismatches
are designer↔kraken handoff items).

Until §24 ships, the "design:" fields cite the gain SSOT
`src/shared/scene-destruction-constants.ts` constants by name. The
constants ARE the design contract at the type level — designer §24 is
the prose explanation of WHY each constant has its value.
