/**
 * Audio bed volume and fade constants, plus WebAudio synth tuning.
 *
 * kraken-audio-owned block split from scene-constants.ts in Sprint 1 Phase 4
 * to keep each domain file within the 400-line ceiling.
 *
 * Touch policy:
 *   - kraken-audio (Phase 2+): owns this file.
 *   - Do not inline audio literals in scene code — import from here.
 */

/* ------------------------------------------------------------------------ */
/* Audio bed volumes                                                        */
/* ------------------------------------------------------------------------ */

/**
 * Drone-bed layer default gain values (linear amplitude, 0..1).
 *
 * Sprint 1 mix philosophy (PLAN §2 "Sessizlik silahtır"):
 *   - The drone bed must sit BELOW -18dBFS (~0.13 linear) at all times.
 *   - Water-drip and music are silent (0) — they wake up in Sprint 3+.
 *   - 5-10 second silences need to feel naked; if the bed competes with
 *     silence the tension breaks.
 *
 * Why these specific values:
 *   - bulb-hum 0.15: dominant ambient layer (the room's electric breath).
 *     Below 0.10 the 50Hz fundamental disappears under cheap laptop speakers.
 *   - wind 0.08: subordinate howl. Should feel like it's behind the wall,
 *     not in the room.
 *   - radio-static 0.04: barely perceptible vacuum-tube crackle — the
 *     radio in the corner is mostly silent, hinting at presence.
 *   - water-drip 0: Sprint 3 enables it.
 *   - music 0: Sprint 3 loads Temnaya placeholder; until then silent.
 */
export const AUDIO_VOLUME_BULB_HUM = 0.15;

/** Distant blizzard howl. Subordinate to bulb hum. */
export const AUDIO_VOLUME_WIND = 0.08;

/** Vacuum-tube AM static crackle. Barely audible. */
export const AUDIO_VOLUME_RADIO_STATIC = 0.04;

/** Radiator drip into concrete. Sprint 3 enables. */
export const AUDIO_VOLUME_WATER_DRIP = 0;

/** Temnaya-tarzı music slot volume. Sprint 3 enables. */
export const AUDIO_VOLUME_MUSIC = 0;

/**
 * Default fade-in duration (ms) when entering the scene after Continue click.
 *
 * 4 seconds is long enough that the user perceives the room "coming alive"
 * rather than abruptly switching on — supports PLAN §2's slow-burn intro.
 */
export const AUDIO_FADE_IN_MS = 4000;

/**
 * Default fade-out duration (ms) on dispose / scene teardown.
 *
 * Faster than fade-in so HMR reloads and shutdown don't drag.
 */
export const AUDIO_FADE_OUT_MS = 1500;

/* ------------------------------------------------------------------------ */
/* Bulb hum synth tuning                                                    */
/* ------------------------------------------------------------------------ */

/** Lowpass filter cutoff frequency (Hz) for the bulb-hum layer. */
export const BULB_HUM_LOWPASS_HZ = 200;

/** Lowpass filter Q factor for the bulb-hum layer. */
export const BULB_HUM_LOWPASS_Q = 0.7;

/** Gain of the 2nd harmonic oscillator relative to the fundamental. */
export const BULB_HUM_HARMONIC_GAIN = 0.35;

/** LFO frequency (Hz) for the bulb-hum breathing modulation. */
export const BULB_HUM_LFO_HZ = 0.3;

/** LFO depth as a fraction of master gain — ±20% breathing. */
export const BULB_HUM_LFO_DEPTH_FRACTION = 0.2;

/* ------------------------------------------------------------------------ */
/* Wind synth tuning                                                         */
/* ------------------------------------------------------------------------ */

/** Lowpass filter cutoff frequency (Hz) for the wind layer. */
export const WIND_LOWPASS_HZ = 600;

/** Lowpass filter Q factor for the wind layer. */
export const WIND_LOWPASS_Q = 0.4;

/** LFO frequency (Hz) that drifts the wind cutoff. */
export const WIND_LFO_HZ = 0.12;

/** LFO depth (Hz) — modulates cutoff ±200Hz around the base frequency. */
export const WIND_LFO_CUTOFF_DEPTH_HZ = 200;

/* ------------------------------------------------------------------------ */
/* Radio static synth tuning                                                 */
/* ------------------------------------------------------------------------ */

/** Bandpass filter center frequency (Hz) for the radio-static layer. */
export const RADIO_BANDPASS_HZ = 1500;

/** Bandpass filter Q factor for the radio-static layer. */
export const RADIO_BANDPASS_Q = 2;

/** LFO frequency (Hz) for the radio crackle modulation. */
export const RADIO_LFO_HZ = 0.45;

/** LFO depth as a fraction of master gain — ±50% crackle. */
export const RADIO_LFO_DEPTH_FRACTION = 0.5;

/* ------------------------------------------------------------------------ */
/* Revolver SFX envelope durations (ms)                                     */
/* ------------------------------------------------------------------------ */

/** Cock sound gain-to-zero envelope duration (ms). */
export const SFX_COCK_ENVELOPE_MS = 80;

/** Empty-click gain-to-zero envelope duration (ms). */
export const SFX_EMPTY_CLICK_ENVELOPE_MS = 60;

/**
 * Empty-click peak linear gain.
 *
 * Sprint 8 §24 NEW peak constant (Phase 1 only encoded the envelope
 * duration; peak amplitude was an in-module literal `EMPTY_CLICK_GAIN
 * = 0.5` in revolver-sfx.ts, which read ≈ -6 dBFS — over-hot against
 * the -24 dBFS ambient baseline). Target: -18 dBFS ≈ 0.126 linear.
 *
 * The click is FUNCTIONAL — it IS the empty-chamber affordance — so
 * the amplitude tune balances "audible affordance" vs "doesn't
 * dominate the room". -18 dBFS sits in the soft-cue floor (audible in
 * quiet listening, doesn't dominate ambient bed). Reduced-motion:
 * UNCHANGED (functional cue per §24 D-2).
 */
export const SFX_EMPTY_CLICK_PEAK_GAIN = 0.13;

/** Bang noise-burst gain-to-zero envelope duration (ms). */
export const SFX_BANG_ENVELOPE_MS = 200;

/** Heartbeat gain-to-zero envelope duration (ms). */
export const SFX_HEARTBEAT_ENVELOPE_MS = 150;

/** Sweat-drip gain-to-zero envelope duration (ms). */
export const SFX_SWEAT_DRIP_ENVELOPE_MS = 120;

/** Chair-creak gain-to-zero envelope duration (ms). */
export const SFX_CHAIR_CREAK_ENVELOPE_MS = 600;
