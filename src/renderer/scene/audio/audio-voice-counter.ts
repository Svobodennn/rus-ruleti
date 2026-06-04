/**
 * Web Audio active-voice counter (Sprint 8 Phase 1 scaffold).
 *
 * S11 closure prep — the Sprint 8 perf-instrumentation hooks need a way to
 * sample the live count of Web Audio "voices" (OscillatorNode + AudioBuffer
 * SourceNode actively scheduled between `start()` and `stop()`/`ended`)
 * without patching every call site across the audio modules.
 *
 * Design:
 *   - Module-level counter (a number — not a Set, not a Map). Cheap to
 *     increment / decrement / read. The counter is process-local
 *     (renderer-only); no IPC, no main-process surface.
 *   - PUBLIC API: `incrementVoiceCount()` / `decrementVoiceCount()` /
 *     `getActiveVoiceCount()` / `resetVoiceCount()`.
 *   - Defensive: the counter NEVER goes below zero. A decrement-from-zero
 *     logs a warning (electron-log) and clamps at 0. Symmetric drift
 *     (increment without decrement) is observable via the count climbing
 *     across flushes — Sprint 8 Lane B (@profiler) audit candidate.
 *   - PHASE 1 SCAFFOLD ONLY: this module does NOT (yet) wrap AudioContext
 *     factory methods. Phase 2B Lane A may either:
 *       (a) wire individual createOscillator() / createBufferSource() call
 *           sites in audio modules to bracket each voice with manual
 *           increment/decrement (lowest-risk, most explicit), OR
 *       (b) introduce an AudioContext factory wrapper that auto-tracks
 *           voices at the boundary (higher coverage, requires touching
 *           every existing audio module that constructs AudioContext).
 *     Phase 1 SHIPS the counter API; Phase 2B decides the integration
 *     pattern after profiling reveals which lanes peak voice counts most.
 *
 * Consumer:
 *   `src/renderer/scene/frame-logger.ts` calls `getActiveVoiceCount()` once
 *   per frame inside markFrame() and tracks the max across the rolling
 *   60-frame window. Reported as `maxAudioVoiceCount` in the FrameStatsPayload
 *   IPC payload (Sprint 8 ADDITIVE field).
 *
 * Budget contract:
 *   `MAX_VOICE_COUNT_AT_PEAK` (= 16) in scene-destruction-constants.ts is
 *   the Sprint 8 design budget. Sprint 9+ may auto-warn when the flushed
 *   `maxAudioVoiceCount` exceeds the budget for three consecutive flushes
 *   (cross-faz dispose-then-mount race signal — destruction-audio.ts
 *   dispose contract notes call out Faz 5→6, 6→7, 7→8 transitions as the
 *   hot spots).
 *
 * Lint compliance:
 *   - Module-level mutable state is wrapped in a single object so the
 *     `prefer-const` rule does not require destructuring at every call
 *     site. The wrapper keeps the count + a "negative-drift logged once
 *     per session" flag (so a single buggy decrement doesn't spam logs).
 *   - No console.* — `electron-log/renderer` is the renderer-side logger
 *     (matches Sprint 5+ destruction-audio convention).
 *   - File is single-purpose + well under the 400-line file cap; every
 *     exported function is well under the 50-line function cap.
 */

import log from 'electron-log/renderer';

/**
 * Module-private state. Wrapped in a single object so the counter +
 * negative-drift-logged flag stay together and the module-level
 * mutability has one source.
 */
interface VoiceCounterState {
  /** Current count of active voices. Never below zero (clamped on dec). */
  count: number;
  /**
   * Whether a decrement-from-zero has been logged this session. Logged
   * ONCE per renderer session to avoid log spam — a single buggy
   * dispose path would otherwise emit thousands of warnings per minute.
   */
  negativeDriftLogged: boolean;
}

const state: VoiceCounterState = {
  count: 0,
  negativeDriftLogged: false,
};

/**
 * Increment the active voice count by one.
 *
 * Call sites: Phase 2B Lane A wires this immediately AFTER an
 * `osc.start()` or `bufferSource.start()` call inside each audio-faz
 * module. Idempotency is the CALLER's responsibility — pairing one
 * increment with exactly one decrement is the contract.
 *
 * Phase 1 SCAFFOLD: no call sites exist yet. The API is exposed so
 * Phase 2B can wire individual sources without touching this module.
 */
export function incrementVoiceCount(): void {
  state.count += 1;
}

/**
 * Decrement the active voice count by one.
 *
 * Defensive: the counter never goes below zero. A decrement-from-zero
 * logs a warning ONCE per renderer session and clamps at 0. This
 * preserves the perf-stats payload integrity even if a buggy dispose
 * path over-decrements.
 *
 * Call sites: Phase 2B Lane A wires this immediately INSIDE the
 * `osc.addEventListener('ended', () => { ... })` callback OR at the
 * top of an explicit dispose function — whichever happens first.
 *
 * Phase 1 SCAFFOLD: no call sites exist yet.
 */
export function decrementVoiceCount(): void {
  if (state.count <= 0) {
    if (!state.negativeDriftLogged) {
      state.negativeDriftLogged = true;
      log.warn(
        'audio-voice-counter: decrementVoiceCount called with count<=0 — ' +
          'clamping at 0. Investigate dispose path for double-decrement.',
      );
    }
    state.count = 0;
    return;
  }
  state.count -= 1;
}

/**
 * Read the current active voice count.
 *
 * Cheap (single property read). Called by frame-logger.ts inside
 * markFrame() — must remain O(1) so the render loop budget is not
 * affected by per-frame counter sampling.
 *
 * Returns 0 if no voices have been registered yet (Phase 1 SCAFFOLD
 * default — no call sites wire increment/decrement).
 */
export function getActiveVoiceCount(): number {
  return state.count;
}

/**
 * Reset the counter back to zero. Intended for test harnesses + the
 * Sprint 8 destruction-director ESC-abort path (when the entire
 * destruction sequence tears down mid-flight, the audio pool is
 * cleared but lingering `ended` events may not have fired yet — the
 * reset gives Lane B a clean perf-stats baseline post-abort).
 *
 * Also clears the negativeDriftLogged flag so a fresh session can log
 * a fresh warning if drift surfaces again.
 */
export function resetVoiceCount(): void {
  state.count = 0;
  state.negativeDriftLogged = false;
}
