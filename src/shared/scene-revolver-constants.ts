/**
 * Revolver SSOT — Sprint 2.
 *
 * Phase 1 PRE-POPULATES the names; Phase 2 implementers FILL the values.
 * Inline magic numbers in revolver code are forbidden (Sprint 1 retro lesson:
 * every literal needs a name, and `max-lines-per-function` makes inline
 * constants tactically expensive too).
 *
 * Phase 1 OWNED constants (never tuned past this sprint): RNG_BANG_MODULUS,
 * RNG_BANG_REMAINDER. Everything else has a default that Phase 2 owners may
 * override — but the **NAMES** are fixed Phase 1 so the worktrees can run
 * in parallel without pre-coordination on identifiers.
 *
 * Ownership map (Phase 2):
 *   - kraken-revolver:   FSM timing, animation timings, hold-state feedback
 *   - designer (2A):     DARKEN_CURVE_PER_CLICK, empty-click cue thresholds
 *   - frontend-dev:      HUD glow/typography, BANG flash/fade
 *   - i18n-expert:       (none here — i18n keys live in strings.ts)
 *   - babel:             (none here — fonts loaded via fonts.css)
 *
 * NB: All units are spelled into the name (`_MS`, `_DEG`, `_DB`, `_REM`).
 * If you introduce a new constant whose unit is ambiguous, suffix it.
 */

/* ------------------------------------------------------------------------ */
/* FSM timing — Phase 2 kraken-revolver fills                               */
/* ------------------------------------------------------------------------ */

/** Mouse hold duration before the cylinder spin commits (PLAN §6). */
export const HOLD_DURATION_MS: number = 1000;

/**
 * Hold-released-before-this-threshold counts as "early release" — surface the
 * "Karar veremedin." message and return revolver to idle. (PLAN §6.)
 */
export const EARLY_RELEASE_MS: number = 300;

/** Cock spring-back animation duration when the user lets go before commit. */
export const SPRING_BACK_MS: number = 200;

/* ------------------------------------------------------------------------ */
/* Animation timings — Phase 2 kraken-revolver                              */
/* ------------------------------------------------------------------------ */

/** Hammer rotation (degrees) during the cock animation. PLAN §6: "30° geri". */
export const COCK_ANGLE_DEG: number = 30;

/** Cock animation duration (ms). Snap-feel: quick, mechanical. */
export const COCK_DURATION_MS: number = 250;

/** Cylinder spin revolutions before settling. PLAN §6: "4 tur, ease-out". */
export const SPIN_TURNS: number = 4;

/** Total cylinder spin animation duration (ms). */
export const SPIN_DURATION_MS: number = 1400;

/** Hammer-fall frames. PLAN §6: "1 frame snap" — single-frame transition. */
export const FALL_FRAMES: number = 1;

/** Revolver recoil rotation (degrees) on bang. */
export const KICK_RECOIL_DEG: number = 5;

/** Camera shake rotation (degrees) on bang. PLAN §6: "+2° kamera shake". */
export const KICK_CAMERA_SHAKE_DEG: number = 2;

/** Frames of full-white flash on bang. PLAN §6: "1 frame white flash". */
export const KICK_FLASH_FRAMES: number = 1;

/**
 * Kick animation total duration (ms). Recoil-out + snap-back combined.
 * 140ms reads as "weapon recoiled" without crossing into "ceremony" territory
 * — the entire kick clip is meant to feel like a single mechanical event,
 * not a beat with a sustain.
 */
export const KICK_DURATION_MS: number = 140;

/**
 * Camera shake duration (ms) on bang. PLAN §6 "+2° kamera shake" is the
 * angle; this constant sets how long it lasts. Tied to the kick clip's
 * total length so they finish together.
 */
export const KICK_CAMERA_SHAKE_DURATION_MS: number = 140;

/* ------------------------------------------------------------------------ */
/* Hold-state feedback — Phase 2 kraken-revolver                            */
/* ------------------------------------------------------------------------ */

/** Camera zoom multiplier while the trigger is held. PLAN §6: "5% zoom-in". */
export const HOLD_ZOOM_FACTOR: number = 1.05;

/** Breath audio gain bump while held (dB above baseline). */
export const HOLD_BREATH_GAIN_DB: number = 6;

/** Bulb hum gain bump while held (dB above baseline). PLAN §6. */
export const HOLD_BULB_HUM_GAIN_DB: number = 3;

/** Camera zoom ramp duration during hold (ms). */
export const HOLD_ZOOM_DURATION_MS: number = 900;

/**
 * Duration the "Karar veremedin." / "Не смог решиться." message sits on
 * screen after an early release. Designer §3 calls for "long enough to read
 * both lines comfortably, short enough that the user does not feel berated".
 */
export const EARLY_RELEASE_MESSAGE_DURATION_MS: number = 1800;

/**
 * Bulb-flicker multiplier on empty click — the bulb intensity dips to this
 * fraction of its current baseline, then snaps back. 0.3 reads as "the bulb
 * was briefly starved of current". Designer directive D.3 specified 0.3.
 */
export const LIGHTING_FLICKER_DEPTH: number = 0.3;

/* ------------------------------------------------------------------------ */
/* Lobby progressive darkening curve — Phase 2A designer TUNED              */
/* ------------------------------------------------------------------------ */

/**
 * Bulb intensity scalar per empty-click count. Index 0 = pre-first-click
 * baseline (full intensity); index N = state AFTER N empty clicks.
 *
 * PLAN §5 progression: 2nd click "ışık bir tık daha karanlık", 6th click is
 * "reveal-lite" so the room is near-pitch. Designer-tuned in Phase 2A
 * (revolver-direction.md §4) — index 1 lifted from 0.95 → 0.92 so the first
 * flicker is above the Weber threshold (~5% in low light), and index 6
 * lowered from 0.28 → 0.22 so reveal-lite reads "abandoned" not "lit but
 * worried". Middle of the curve (indices 2–5) holds steady ~0.10–0.15
 * decrements so each empty click feels like the same weight of loss.
 *
 * Phase 2B lighting.ts MUST multiply this scalar by the Phase 1 baseline
 * `BULB_LIGHT.intensity = 3.4`, NOT replace the baseline. The curve is a
 * scalar; the baseline is the unit. See atmosphere-direction.md §2.
 */
export const DARKEN_CURVE_PER_CLICK: ReadonlyArray<number> = [
  1.0, 0.92, 0.82, 0.68, 0.52, 0.38, 0.22,
];

/* ------------------------------------------------------------------------ */
/* Empty-click audio cues — Phase 2A designer VERIFIED                      */
/* ------------------------------------------------------------------------ */

/**
 * Bulb flicker duration on empty click (ms). PLAN §5: "Ampul bir flicker".
 * 120ms sits in the perceptual-flicker band (long enough to register as a
 * flicker, short enough to read as a glitch rather than a state change).
 * See revolver-direction.md §4 note on absolute vs contrast modulation.
 */
export const EMPTY_CLICK_FLICKER_MS: number = 120;

/**
 * Empty-click count at which the heartbeat audio cue begins (PLAN §5 #3).
 * Verified Phase 2A — this is also the HUD-glow / DARKEN crossover point
 * (revolver-direction.md §5), which intentionally aligns the first new
 * audio cue with the visual focus shift to the HUD.
 */
export const EMPTY_CLICK_HEARTBEAT_THRESHOLD: number = 3;

/** Empty-click count at which the sweat-drip cue plays (PLAN §5 #4). */
export const EMPTY_CLICK_SWEAT_THRESHOLD: number = 4;

/** Empty-click count at which the chair creak cue plays (PLAN §5 #5). */
export const EMPTY_CLICK_CHAIR_CREAK_THRESHOLD: number = 5;

/* ------------------------------------------------------------------------ */
/* HUD glow tier curve — Phase 2A designer VERIFIED, frontend-dev applies   */
/* ------------------------------------------------------------------------ */

/**
 * Sayaç glow alpha per empty-click count. Mirrors DARKEN_CURVE_PER_CLICK
 * indexing: index 0 = pre-first-click baseline.
 *
 * The curve trends UP because the darker the room gets, the more the HUD
 * is the user's only visual anchor — and the more "the system is leaning
 * toward you" reading we want. Designer atmosphere-direction.md §5 endorses
 * a low-alpha symmetric glow over a directional drop-shadow.
 *
 * Phase 2A verified the curve against the tuned DARKEN_CURVE_PER_CLICK —
 * index 3 (0.70 alpha vs 0.68 bulb scalar) is the visual-anchor crossover,
 * matching the first new audio cue (heartbeat at click 3). See
 * revolver-direction.md §5.
 */
export const HUD_GLOW_ALPHA_BY_CLICK: ReadonlyArray<number> = [
  0.50, 0.55, 0.62, 0.70, 0.78, 0.88, 1.00,
];

/* ------------------------------------------------------------------------ */
/* HUD typography — Phase 2 frontend-dev                                    */
/* ------------------------------------------------------------------------ */

/**
 * Sayaç font family. babel ships the DSEG7-Classic OFL bundle in Phase 2;
 * Phase 1 declares the family name so HUD code can reference it. The
 * fallback `monospace` is the system default if DSEG never loads.
 */
export const HUD_COUNTER_FONT_FAMILY: string = "'DSEG7-Classic', monospace";

/** Sayaç (1/6 counter) font-size in rem. Designer §5 type-scale `hud-display`. */
export const HUD_COUNTER_FONT_SIZE_REM: number = 3.0;

/** Dual-script primary labels font-size (rem). Designer §5 `hud-primary`. */
export const HUD_PRIMARY_FONT_SIZE_REM: number = 1.5;

/** Bilingual caption font-size (rem). Designer §5 `hud-secondary`. */
export const HUD_SECONDARY_FONT_SIZE_REM: number = 1.0;

/* ------------------------------------------------------------------------ */
/* RNG — Phase 1 owns, NEVER tuned                                          */
/* ------------------------------------------------------------------------ */

/**
 * Chamber count. 1-in-6 trigger probability is the **game definition** —
 * tuning this would break the PLAN §5 "1/6" promise and the test-checklist
 * "Tetik 100x → 1/6 (±10%)" assertion.
 */
export const RNG_BANG_MODULUS: number = 6;

/** Remainder treated as "bang". `0` is conventional. Do not change. */
export const RNG_BANG_REMAINDER: number = 0;

/* ------------------------------------------------------------------------ */
/* Bang-blackout overlay — Phase 2 frontend-dev                             */
/* ------------------------------------------------------------------------ */

/** White-flash duration on bang (ms). PLAN §7: "1 frame full white". */
export const BANG_FLASH_DURATION_MS: number = 16;

/** Fade-to-black duration after the flash (ms). Sprint 4 Faz 0 placeholder. */
export const BANG_FADE_TO_BLACK_MS: number = 800;
