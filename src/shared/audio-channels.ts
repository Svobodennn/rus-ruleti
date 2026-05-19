/**
 * Audio channels + mixer SSOT.
 *
 * The drone-bed ambient layers and the future Temnaya music placeholder.
 * kraken-audio (Phase 2) reads default volumes from here. Designer may
 * tune amplitudes per the BUCKSHOT_ROULETTE_THEME.md "sessizlik silahtır"
 * brief without touching audio/ source.
 *
 * NOTE on scope:
 *   Sprint 1 has NO real .ogg assets. ambient-synth.ts generates the four
 *   drone layers procedurally via WebAudio. The Temnaya placeholder is a
 *   silent Howler slot reserved for Sprint 3 swap.
 */

import type { AMBIENT_LAYERS } from './scene-constants';

/** Discriminated union of the four ambient layer IDs. */
export type AmbientLayerId = (typeof AMBIENT_LAYERS)[number];

/** Identifier for the (silent in Sprint 1) Temnaya music slot. */
export const MUSIC_CHANNEL = 'music' as const;

/** Combined audio channel namespace. */
export type AudioChannelId = AmbientLayerId | typeof MUSIC_CHANNEL;

/**
 * Default ambient gain per layer (0..1). Subtle by design — the drone bed
 * should sit at the bottom of the mix and let silence carry the tension.
 *
 * PLAN §2 ses dünyası: "Sessizlik bir araçtır." 5-10sn silence amplifies
 * trigger more than any sound. Layers are kept under -18dBFS (~0.13 amp).
 */
export const AMBIENT_DEFAULT_VOLUME: Readonly<Record<AmbientLayerId, number>> =
  Object.freeze({
    'bulb-hum': 0.12,
    wind: 0.08,
    'radio-static': 0.05,
    'water-drip': 0,
  });

/** Default volume for the music placeholder (silent in Sprint 1). */
export const MUSIC_DEFAULT_VOLUME = 0;

/** Default fade duration when starting/stopping an ambient layer. */
export const AMBIENT_FADE_MS = 1200;

/**
 * Trigger-fade ducking (PLAN §2): tetik anında radio fade -18dB.
 * Phase 4+ uses this. Defined here so the mix table is in one file.
 */
export const TRIGGER_DUCK_DB = -18;

/** Master gain ceiling. Hard cap so the synth can't blow speakers. */
export const MASTER_GAIN_CEILING = 0.65;
