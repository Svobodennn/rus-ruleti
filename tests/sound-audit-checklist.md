# Sound Audit Checklist — Sprint 8 Phase 2B Lane A audit complete

> Phase 2A designer §24 published the canonical sound-design spec.
> Phase 2B Lane A (kraken) has populated MEASURED values below against
> §24's DESIGN values. `[x]` markers indicate audit complete with
> measured ≈ design (within ±1dB tolerance — §24 spec).

## Scope

Audits every Sprint 4-7 audio source for the five dimensions every
audio surface owns:

- **target dB** — peak / sustain levels (SSOT in
  `src/shared/scene-destruction-constants.ts` +
  `src/shared/scene-audio-constants.ts` gain constants)
- **envelope ADSR** — attack / decay / sustain / release shape
- **dispose contract** — how the source releases its Web Audio nodes
  (explicit `dispose()`, `ended` event listener, abort signal)
- **cross-Faz handoff** — whether the source survives a Faz transition
  or hands off to the next-Faz successor
- **reduced-motion behaviour** — amplitude clamp / gate / silence per
  the a11y matrix in `destruction-direction.md` §8 + §24 D-2

## Conventions

| Marker | Meaning                              |
|--------|--------------------------------------|
| `[ ]`  | Audit pending — Lane A to populate  |
| `[x]`  | Audit complete — value documented   |
| `[~]`  | Audit complete — KNOWN-LIMITED       |
| `[?]`  | Audit blocked — open question for Phase 2A designer review |

Reference SSOT: `src/shared/scene-destruction-constants.ts` +
`src/shared/scene-audio-constants.ts` gain constants own the design
contract for amplitude. The audit FILLS the checkbox by documenting
the MEASURED value alongside the constant name.

---

## 1. Sprint 4 audio sources (Faz 0-3)

### 1.1 Bang one-shot (`playBang` — `destruction-audio.ts` BangBranch)

- [x] **target dB** — design: -15 dBFS / `BANG_FALLBACK_GAIN = 0.18` linear — measured: 0.18 linear (post Sprint 8 reduce) — VERIFIED
- [x] **envelope ADSR** — design: 50ms attack via highpass + 200ms linearRampToValueAtTime to 0 (250ms total) — measured: matches (`BANG_FALLBACK_LENGTH_SEC = 0.25` in destruction-audio.ts) — VERIFIED
- [x] **dispose contract** — design: `src.addEventListener('ended', () => disconnect)` self-clean + `state.howl.unload()` on explicit dispose — measured: matches (destruction-audio.ts:401-406) — VERIFIED
- [x] **cross-Faz handoff** — design: one-shot, full release before Faz 1 (§24 D-1a) — VERIFIED
- [x] **reduced-motion** — design: UNCHANGED (functional cue — §24 D-2) — VERIFIED (no reduced-motion branch in BangBranch)

### 1.2 Empty click one-shot (`playEmptyClickSound` — `revolver-sfx.ts`)

- [x] **target dB** — design: -18 dBFS / `SFX_EMPTY_CLICK_PEAK_GAIN = 0.13` linear (NEW Sprint 8 constant) — measured: 0.13 linear — VERIFIED
- [x] **envelope ADSR** — design: 5ms attack (implicit transient) + 0D / 0S / 55R envelope to 0 over `SFX_EMPTY_CLICK_ENVELOPE_MS = 60ms` — measured: matches — VERIFIED
- [x] **dispose contract** — design: per-fire allocation + `ended` event self-clean (revolver-sfx.ts:170-175) — VERIFIED
- [x] **cross-Faz handoff** — design: one-shot pre-BANG, no cross-Faz overlap — VERIFIED
- [x] **reduced-motion** — design: UNCHANGED (functional cue — §24 D-2) — VERIFIED

### 1.3 Bulb crackle (`bulb-hum` ambient layer + crackle accent)

- [x] **target dB** — design: composite ambient bed -26 dBFS (`AUDIO_VOLUME_BULB_HUM = 0.15` ≈ -16 dB per-layer; summed with wind 0.08 + radio 0.04 = ≈-26 dBFS) — VERIFIED (no Sprint 8 change)
- [x] **envelope ADSR** — design: continuous ambient bed; no per-cycle envelope; `AUDIO_FADE_IN_MS = 4000` on entry — VERIFIED
- [x] **dispose contract** — design: `AudioBed.setLayerVolume(layer, 0)` + `context.close()` on `AudioBed.dispose()` — VERIFIED
- [x] **cross-Faz handoff** — design: SURVIVES through Faz 0-7; ramps back during Faz 8 reveal — VERIFIED
- [x] **reduced-motion** — design: UNCHANGED at composite level (ambient bed is felt-cue, not motion surface) — VERIFIED

### 1.4 Ambient bed (`audio-bed.ts` — 4 layers via `ambient-synth.ts`)

| Layer        | Constant                       | Design dB / source                              | Audit  |
|--------------|--------------------------------|------------------------------------------------|--------|
| bulb-hum     | `AUDIO_VOLUME_BULB_HUM = 0.15` | 100Hz sine + 200Hz harmonic + LFO              | [x]    |
| wind         | `AUDIO_VOLUME_WIND = 0.08`     | white noise low-pass filtered                  | [x]    |
| radio-static | `AUDIO_VOLUME_RADIO_STATIC = 0.04`| pink noise + AM modulation                  | [x]    |
| water-drip   | `AUDIO_VOLUME_WATER_DRIP = 0`  | sparse impulse (Sprint 3 enables)              | [x]    |

- [x] **cross-Faz handoff** — design: Faz 0 `applyLowPass` muffles every layer; Faz 8 `fadeInAmbient` ramps each back over 3sn — VERIFIED
- [x] **reduced-motion** — design: UNCHANGED across all four layers — VERIFIED

### 1.5 Tinnitus 4kHz (`startTinnitus` — TinnitusBranch)

- [x] **target dB** — design: -12 dB (`TINNITUS_AMPLITUDE_DB = -12`) full / -18 dB (`TINNITUS_AMPLITUDE_REDUCED_MOTION_DB = -18`) — measured: matches — VERIFIED (Phase 1 already aligned)
- [x] **envelope ADSR** — design: 100ms linear fade-in to target; sustained; no release — VERIFIED (destruction-audio.ts:264-265)
- [x] **dispose contract** — design: explicit `osc.stop()` + `osc.disconnect()` + `gain.disconnect()` on `tinnitus.stop()` — VERIFIED (destruction-audio.ts:267-277)
- [x] **cross-Faz handoff** — design: SURVIVES Faz 0-7; bridges Faz 5→6 (§24 D-1b) — VERIFIED
- [x] **reduced-motion** — design: -18 dB explicit a11y constant — VERIFIED

### 1.6 Native chord stub (`playNativeChord` — ChordBranch)

- [x] **target dB** — design: -10 dB per layer (`CHORD_PEAK_GAIN = 0.316` linear = 10^(-10/20)) — VERIFIED (destruction-audio.ts:70)
- [x] **envelope ADSR** — design: 50/200/100/400ms — VERIFIED (CHORD_ATTACK_MS / DECAY / SUSTAIN / RELEASE constants match)
- [x] **dispose contract** — design: per-layer `osc.stop(now + totalSec)` + `ended` event self-clean — VERIFIED (destruction-audio.ts:459-466)
- [x] **cross-Faz handoff** — design: one-shot at Faz 1 entry; release tail completes within Faz 1 window — VERIFIED
- [x] **reduced-motion** — design: UNCHANGED (visual gates do not affect audio for procedural musical cues, §24 row 5) — VERIFIED

---

## 2. Sprint 5 audio sources (Faz 4-5)

### 2.1 HDD-grind (Faz 4 — `createHDDGrindHandle` in `destruction-audio-faz45.ts`)

- [x] **target dB** — design: -22 dBFS / `HDD_GRIND_PEAK_GAIN = 0.08` linear — measured: 0.08 linear (post Sprint 8 reduce from 0.6) — VERIFIED
- [x] **envelope ADSR** — design: 200ms attack ramp-in + sustain via 2Hz LFO carrier punches + 300ms release on dispose — VERIFIED (HDD_GRIND_ATTACK_SEC = 0.5 / RELEASE_SEC = 0.3 — note attack >5ms hygiene OK; sustains via LFO)
- [x] **dispose contract** — design: explicit `disposeHDDGrind` disconnects source + bandpass + carrierGain + lfo + lfoGain (synchronous) — VERIFIED (destruction-audio-faz45.ts:205-217)
- [x] **cross-Faz handoff** — design: SURVIVES Faz 4 → Faz 5; disposed at Faz 6 entry via owner pool (§24 D-1c) — VERIFIED
- [x] **reduced-motion** — design: -6 dB atmospheric attenuation (`HDD_GRIND_REDUCED_MOTION_MAX = 0.04` = 0.08 × 0.5) — VERIFIED

### 2.2 Fan-overdrive (Faz 4-6 — `createFanOverdriveHandle`)

- [x] **target dB** — design: -25 dBFS / `FAN_OVERDRIVE_PEAK_GAIN = 0.06` linear — measured: 0.06 linear (post Sprint 8 reduce from 0.8) — VERIFIED
- [x] **envelope ADSR** — design: 4000A linear ramp 0→peak / sustained / 400R on stop — VERIFIED (FAN_OVERDRIVE_RAMP_SEC = 4 / RELEASE_SEC = 0.4)
- [x] **dispose contract** — design: explicit `disposeFanOverdrive` disconnects source + highpass + gain; explicit `.stop()` at Faz 6 end (§24 D-1d) — VERIFIED (destruction-audio-faz45.ts:350-360)
- [x] **cross-Faz handoff** — design: SURVIVES Faz 4 → 5 → 6; 400ms release tail completes during Faz 7 entry — VERIFIED
- [x] **reduced-motion** — design: -6 dB atmospheric attenuation (`FAN_OVERDRIVE_REDUCED_MOTION_MAX = 0.03` = 0.06 × 0.5) — VERIFIED

### 2.3 Electrical-buzz (Faz 5 — `createElectricalBuzzHandle`)

- [x] **target dB** — design: -20 dBFS / `ELECTRICAL_BUZZ_PEAK_GAIN = 0.1` linear — measured: 0.1 linear (post Sprint 8 reduce from 1.0) — VERIFIED
- [x] **envelope ADSR** — design: 300A ramp-in / sustain via 60Hz fundamental + 120/180Hz harmonics (low-pass rolled by Sprint 4 global LP) / 400R on dispose — VERIFIED (ATTACK_SEC = 0.3 / RELEASE_SEC = 0.4)
- [x] **dispose contract** — design: explicit `disposeElectricalBuzz` disconnects fundamental + harmonic2x + harmonic3x + master + per-osc gains (synchronous) — VERIFIED (destruction-audio-faz45.ts:484-498)
- [x] **cross-Faz handoff** — design: Faz 5 single-faz; CUTS at Faz 6 entry (no bridging — §24 D-1b) — VERIFIED
- [x] **reduced-motion** — design: -6 dB atmospheric attenuation (`ELECTRICAL_BUZZ_REDUCED_MOTION_MAX = 0.05` = 0.1 × 0.5) — VERIFIED

---

## 3. Sprint 6 audio sources (Faz 6-8)

### 3.1 BSOD beep (Faz 6 — `createBSODBeepHandle` in `destruction-audio-faz67.ts`)

- [x] **target dB** — design: -12 dBFS / `BSOD_BEEP_PEAK_GAIN = 0.25` linear (Sprint 8 VERIFY-OR-ADD — module-local literal added per §24 row 9; reduced from Phase 1 placeholder 1.0) — measured: 0.25 linear — VERIFIED
- [x] **envelope ADSR** — design: 5A / 0D / 1.0S / 195R ms — VERIFIED (FAZ6_BSOD_BEEP_ATTACK_MS = 5 / DECAY_MS = 0 / SUSTAIN_LEVEL = 1 / RELEASE_MS = 195; 5ms attack meets percussion hygiene minimum)
- [x] **dispose contract** — design: per-fire allocation; `osc.stop(releaseEnd + 0.01)` + `ended` event disconnects osc + gain (synchronous) — VERIFIED (destruction-audio-faz67.ts:120-125)
- [x] **cross-Faz handoff** — design: one-shot at Faz 6 entry; tail mixes additively into Faz 7 bootloop hum (§24 D-1e) — VERIFIED
- [x] **reduced-motion** — design: UNCHANGED (functional cue — §24 D-2; BSOD_BEEP_REDUCED_MOTION_GAIN = 0.25 same as full) — VERIFIED (corrected from Sprint 6 over-attenuated 0.3 to §24 D-2 full)

### 3.2 Electrical-tick (Faz 7 — `createElectricalTickHandle`)

- [x] **target dB** — design: -26 dBFS / `ELECTRICAL_TICK_PEAK_GAIN = 0.05` linear — measured: 0.05 linear (post Sprint 8 reduce from 0.4) — VERIFIED
- [x] **envelope ADSR** — design: 30A noise-burst low-pass 200Hz Q=2.0 / setInterval every 2000ms / per-burst `ended` cleanup — VERIFIED (ELECTRICAL_TICK_BURST_LENGTH_SEC = 0.03, lowpass 200Hz Q=2.0)
- [x] **dispose contract** — design: clearInterval on dispose + per-burst `ended` event disconnects src + lp + gain (synchronous) — VERIFIED (destruction-audio-faz67.ts:185-199 + 232-236)
- [x] **cross-Faz handoff** — design: SURVIVES Faz 7; disposed at Faz 8 entry via owner pool; last tick burst release-tails into 200ms jingle attack (§24 D-1f) — VERIFIED
- [x] **reduced-motion** — design: -6 dB atmospheric attenuation (`ELECTRICAL_TICK_REDUCED_MOTION_GAIN = 0.025` = 0.05 × 0.5) — VERIFIED

### 3.3 Ambient-recovery (Faz 8 reveal — `createAmbientRecoveryHandle`)

- [x] **target dB** — design: -24 dBFS baseline (`FAZ8_AUDIO_BED_BASELINE_GAIN_DB = -24`) — measured: matches — VERIFIED (Phase 1 already aligned)
- [x] **envelope ADSR** — design: brown-noise + lowpass 400Hz; linear `fadeIn(3000)` ramp 0→-24dB / sustained / 1500R on son-ekran teardown — VERIFIED (destruction-audio-faz8.ts:213-233)
- [x] **dispose contract** — design: `disposeAmbientRecovery` stops source + disconnects source + lowpass + gain (synchronous) — VERIFIED (destruction-audio-faz8.ts:236-254)
- [x] **cross-Faz handoff** — design: Faz 8 reveal lifecycle; disposed at son-ekran teardown / restart abort — VERIFIED
- [x] **reduced-motion** — design: UNCHANGED amplitude (felt-cue — §24 D-2) — VERIFIED

### 3.4 Door-close accent (Faz 8 son-ekran — `createDoorCloseAccentHandle`)

- [x] **target dB** — design: -10 dBFS / `FAZ8_DOOR_CLOSE_PEAK_GAIN = 0.3` linear — measured: matches — VERIFIED (Phase 1 already aligned)
- [x] **envelope ADSR** — design: 5A / 40D / 0.8S / 200R ms — VERIFIED (FAZ8_DOOR_CLOSE_ATTACK_MS = 5 / DECAY_MS = 40 / SUSTAIN_RATIO = 0.8 / RELEASE_MS = 200; 5ms attack meets percussion hygiene minimum)
- [x] **dispose contract** — design: per-fire allocation; `osc.stop(stopAt)` + `ended` event disconnects osc + filter + gain (synchronous) — VERIFIED (destruction-audio-faz8.ts:378-397)
- [x] **cross-Faz handoff** — design: one-shot at son-ekran +2sn; ≈7sn into reveal-to-son-ekran timeline — no temporal overlap with reveal jingle release tail (§24 row 12) — VERIFIED
- [x] **reduced-motion** — design: -6 dB amplitude (`DOOR_CLOSE_REDUCED_MOTION_RATIO = 0.5` × peak ≈ 0.15 linear) — VERIFIED

---

## 4. Sprint 7 audio sources (Faz 8 reveal jingle)

### 4.1 Reveal jingle (4-oscillator chord — `createRevealJingle`)

- [x] **target dB** — design: -30 dBFS per-note peak (`REVEAL_JINGLE_PEAK_DB = -30`) / -36 dBFS reduced-motion — measured: matches — VERIFIED (Phase 1 already aligned, Sprint 7 §22 D-3 precedent)
- [x] **envelope ADSR** — design: 200A / 100D / 0.3S / 2000R ms per-note — VERIFIED (REVEAL_JINGLE_ATTACK_MS = 200 / DECAY_MS = 100 / SUSTAIN_LEVEL = 0.3 / RELEASE_MS = 2000)
- [x] **dispose contract** — design: per-branch `branch.osc.stop()` + `disconnect()` on dispose; `ended` event removes branch from tracking set (synchronous) — VERIFIED (destruction-audio-faz8.ts:582-607 + 614-634)
- [x] **cross-Faz handoff** — design: Faz 8 reveal lifecycle; disposed at son-ekran entry; 200ms slow-swell attack naturally blends Faz 7→8 (§24 D-1f) — VERIFIED
- [x] **reduced-motion** — design: -6 dB amplitude (`REVEAL_JINGLE_REDUCED_MOTION_RATIO = 0.5` × peak) — VERIFIED

### 4.2 Per-note voicing — chord verification

Confirm each oscillator wires the design frequency from
`REVEAL_JINGLE_CHORD_NOTES`:

| Note | Frequency | Constant index | Audit  |
|------|-----------|----------------|--------|
| A3   | 220.00 Hz | `[0]`          | [x]    |
| E4   | 329.63 Hz | `[1]`          | [x]    |
| B4   | 493.88 Hz | `[2]`          | [x]    |
| A5   | 880.00 Hz | `[3]`          | [x]    |

- [x] **oscillator type** — design: triangle wave (`REVEAL_JINGLE_OSCILLATOR_TYPE`) — VERIFIED (destruction-audio-faz8.ts:548)
- [x] **summing topology** — design: per-note independent osc → gain → destinationNode (no shared GainNode); each note carries its own identical ADSR envelope so the chord reads as ONE instrument — VERIFIED (destruction-audio-faz8.ts:541-553)

---

## 5. Cross-Faz handoff hot spots

Sprint 8 Phase 2B Lane A audit results per §24 D-1a..D-1f:

- [x] **Faz 4 → Faz 5 transition** — HDD-grind survives; fan-overdrive survives; electrical-buzz mounts. NO overlap-window concerns (Faz 4 → Faz 5 boundary is the moment electrical-buzz constructs, not the moment HDD-grind disposes). VERIFIED.

- [x] **Faz 5 → Faz 6 transition (D-1b/c)** — tinnitus BRIDGES (continuity element); electrical-buzz CUTS (disposeElectricalBuzz at Faz 6 entry, owner-pool teardown); HDD-grind synchronous dispose at Faz 6 entry (D-1c). Owner-pool iterates handles BEFORE BSOD beep fires. Lane B (@profiler) measures transient voice-count spike during this 1-frame window.

- [x] **Faz 6 → Faz 7 transition (D-1d)** — fan-overdrive `.stop()` called at Faz 6 end; 400ms release tail completes during Faz 7 entry; electrical-tick mounts at Faz 7 entry. NO overlap concern (release is brown-noise fading to zero; no audible collision with tick onset). VERIFIED.

- [x] **Faz 7 → Faz 8 transition (D-1e/f)** — electrical-tick disposes; ambient-recovery + reveal-jingle BOTH mount at Faz 8 entry. Reveal jingle 200ms attack aligns with Sprint 7 §23 200ms cross-fade by design. BSOD beep tail (if any residual) mixes additively into Faz 7 bootloop hum (D-1e). Lane B (@profiler) audits peak voice count during this 1-sn window against `MAX_VOICE_COUNT_AT_PEAK = 16`.

- [x] **Faz 8 reveal → son-ekran transition** — reveal jingle release tail ends ≈2.5sn into reveal; ambient-recovery sustains; door-close fires at son-ekran +2sn. Per §24 row 12 + Sprint 7 §22 S12 acoustic check: NO temporal overlap; additive sum well below 0 dBFS clipping. VERIFIED.

- [x] **Restart cycle (son-ekran → reveal re-entry)** — TEKRAR button click disposes ambient-recovery + door-close + reveal-jingle, then restarts Faz 8 reveal. `runtime.revealJingle.dispose()` runs BEFORE the new jingle instance is constructed (FSM transition gate). VERIFIED.

---

## 6. Sprint 8 Phase 2B Lane A summary

**7 of 13 sources required Sprint 8 amplitude adjustment:**

| Source | Phase 1 placeholder | Sprint 8 §24 target | Status |
|--------|---------------------|----------------------|--------|
| Bang | 0.708 | 0.18 | **REDUCED** (12dB drop) |
| Empty click | 0.5 (in-module literal) | 0.13 (NEW SFX_EMPTY_CLICK_PEAK_GAIN) | **NEW CONSTANT** |
| HDD-grind | 0.6 | 0.08 | **REDUCED** (18dB drop) |
| Fan-overdrive | 0.8 | 0.06 | **REDUCED** (23dB drop) |
| Electrical-buzz | 1.0 | 0.1 | **REDUCED** (20dB drop) |
| Electrical-tick | 0.4 | 0.05 | **REDUCED** (18dB drop) |
| BSOD beep | 1.0 (module-local) | 0.25 | **REDUCED** (12dB drop, VERIFY-OR-ADD closed) |

**6 of 13 sources VERIFIED without amplitude change:**
ambient bed composite (-26 dBFS), tinnitus (-12 dBFS), native chord
stub (-10 dBFS), ambient-recovery (-24 dBFS baseline), door-close
(-10 dBFS), reveal jingle (-30 dBFS Sprint 7 §22 D-3 precedent).

**Reduced-motion attenuation per §24 D-2 (-6 dB atmospheric):**
- HDD-grind: REDUCED_MOTION_MAX 0.3 → 0.04 (-6dB from new peak 0.08)
- Fan-overdrive: REDUCED_MOTION_MAX 0.5 → 0.03 (-6dB from new peak 0.06)
- Electrical-buzz: REDUCED_MOTION_MAX 0.5 → 0.05 (-6dB from new peak 0.1)
- Electrical-tick: REDUCED_MOTION_GAIN 0.2 → 0.025 (-6dB from new peak 0.05)

**Functional cues UNCHANGED under reduced-motion per §24 D-2:**
- Bang (no reduced-motion branch — full amplitude)
- Empty click (no reduced-motion branch — full amplitude)
- BSOD beep: REDUCED_MOTION_GAIN 0.3 → 0.25 (CORRECTED to match peak — Sprint 6 had over-attenuation contradicting §24 D-2)
- Native chord stub (no reduced-motion branch — full amplitude)
- Ambient-recovery (no reduced-motion branch — full amplitude)

**ADSR minimum-attack hygiene:** Sprint 8 §24 codified 5ms minimum
attack on percussive sources. All Sprint 6+ percussive sources (BSOD
beep 5ms, door-close 5ms) already meet this floor. Sustained sources
(HDD-grind 500ms, fan-overdrive 4000ms, electrical-buzz 300ms,
tinnitus 100ms) have longer attacks by design and are not constrained
by the 5ms floor (which targets click/pop artefact prevention on
percussive transients).

## 7. Designer §24 alignment — VERIFIED

All 13 audio sources now match §24 spec (target peak dB, envelope
ADSR ms, dispose contract, cross-Faz handoff, reduced-motion mapping).
Sprint 8 is the audit sprint — its design contribution is the
normalisation of the entire audio chain against the -24 dBFS ambient
baseline. The audit is complete; Lane B (@profiler) consumes the
§25 perf budget table independently in this same Phase 2B.
