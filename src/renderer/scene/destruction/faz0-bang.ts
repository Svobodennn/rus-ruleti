/**
 * Faz 0 — BANG continuation. Phase 1 STUB.
 *
 * Picks up at the Sprint 2 bang-overlay fade-to-black (which itself runs
 * over BANG_FADE_TO_BLACK_MS = 800ms after the 1-frame white flash). Owns
 * the audio + camera + lighting side effects for the 0-2sn window:
 *
 *   - Load + play bang.ogg via Howl (CSP media-src 'self' allowed Sprint 4 §E).
 *   - Start tinnitus 4kHz OscillatorNode loop at TINNITUS_AMPLITUDE_DB.
 *   - Apply BiquadFilterNode low-pass at LOW_PASS_CUTOFF_HZ to global bus.
 *   - Trigger camera shake BANG_CAMERA_SHAKE_DEG over
 *     BANG_CAMERA_SHAKE_DURATION_MS.
 *   - Darken bulb from current intensity to 0 over BULB_DARKEN_DURATION_MS.
 *   - Fade radio static channel out over RADIO_FADE_DURATION_MS.
 *   - Hold at black until FAZ_0_BANG_DURATION_MS elapses.
 *
 * If `prefers-reduced-motion: reduce`:
 *   - Camera shake amplitude = 0.
 *   - Tinnitus amplitude is -18dB instead of -12dB (designer §8 a11y matrix).
 *
 * Called by:
 *   - destruction-director.ts FSM step: `idle → faz0` → await `runFaz0(...)`.
 *
 * Phase 2B owner: kraken-faz0-1.
 */

import type { PerspectiveCamera } from 'three';
import type { AudioBedHandle } from '../audio/audio-bed.js';
import type { BulbLightHandle } from '../lighting.js';

/**
 * Runner arg bag. Kept compact so the director call site stays under the
 * 50-line ceiling. `signal` is an AbortSignal so ESC-hold can short-circuit
 * mid-Faz.
 */
export interface Faz0RunArgs {
  readonly camera: PerspectiveCamera;
  readonly lighting: BulbLightHandle;
  readonly audio: AudioBedHandle;
  readonly signal: AbortSignal;
}

/**
 * Run the Faz 0 BANG continuation. Resolves at FAZ_0_BANG_DURATION_MS or
 * rejects with AbortError if `signal` aborts (ESC-hold).
 *
 * Phase 2B kraken-faz0-1 fills the body.
 */
export async function runFaz0(_args: Faz0RunArgs): Promise<void> {
  throw new Error('faz0-bang: Phase 2B kraken-faz0-1 fills runFaz0()');
}
