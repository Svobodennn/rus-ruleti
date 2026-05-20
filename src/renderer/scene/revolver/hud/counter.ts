/**
 * ШАНС / ŞANS counter — Sprint 2 Phase 2B (frontend-dev).
 *
 * PLAN §5 + atmosphere-direction.md §5: a vacuum-tube indicator anchored to
 * the lower-right corner of the viewport. The counter shows
 * `N / 6` where N is the number of empty clicks that have happened so far,
 * 6 is the chamber total (PLAN §5 "1/6").
 *
 * COUNTER FORMAT DECISION: `N/6` (cumulative empty-click count).
 *
 *   PLAN §2 line 77 reads "ШАНС / ŞANS: 1/6". This could plausibly mean
 *   "the bullet's chance is 1 out of 6" (a static label of the chamber
 *   probability) OR "you have spent 1 of 6 empty clicks" (a dynamic
 *   running count). PLAN §5 describes the lobby progression as 1→6
 *   sequential empty clicks each adding a feedback layer, with the 6th
 *   triggering reveal-lite. That progression is the *running* count
 *   interpretation. We render the dynamic version: the digit on the left
 *   updates as the player accumulates empty clicks, the "6" stays
 *   constant. At click 0 the counter reads "0 / 6" — designer endorses
 *   this as a sturdier visual anchor than blank.
 *
 *   The label "ШАНС / ŞANS" stays bilingual stacked-above the digits as
 *   atmosphere §5 specifies (RU primary, TR caption).
 *
 * The DOM shape mirrors the directive structure block:
 *
 *   <div class="hud-counter" data-locale="bilingual" style="--hud-glow-alpha: X">
 *     <div class="hud-counter__labels">
 *       <span class="hud-counter__label hud-counter__label--ru">ШАНС</span>
 *       <span class="hud-counter__label hud-counter__label--tr">ŞANS</span>
 *     </div>
 *     <div class="hud-counter__display">
 *       <span class="hud-counter__digit-current">0</span>
 *       <span class="hud-counter__separator">/</span>
 *       <span class="hud-counter__digit-total">6</span>
 *     </div>
 *   </div>
 *
 * Phase 2 frontend-dev fills this stub. The mount layer (revolver/index.ts)
 * calls `counter.update(n)` each time the FSM transitions through a
 * `firing(empty) → idle` event with the new count.
 */

import {
  HUD_GLOW_ALPHA_BY_CLICK,
  RNG_BANG_MODULUS,
} from '../../../../shared/scene-revolver-constants';
import { STRINGS, type Locale } from '../../../i18n/strings';

/** Handle returned from mountCounter. */
export interface CounterHandle {
  /**
   * Update the empty-click count. Re-renders the digit AND updates the glow
   * alpha from `HUD_GLOW_ALPHA_BY_CLICK[emptyClicks]` (clamped to the array
   * length). Triggers a brief flap-display flip animation.
   */
  update: (emptyClicks: number) => void;
  /** Tear down: remove DOM nodes + clear any pending animation timers. */
  dispose: () => void;
}

/** CSS class the keyframes animation keys off. */
const FLIPPING_CLASS = 'is-flipping';

/**
 * Mid-animation tick (ms). The flap-display flip is 0.5s total — at 250ms
 * the card is edge-on to the viewer, so swapping the text content there
 * hides the change inside the geometry. Keep in sync with hud.css's
 * `@keyframes hud-counter-flip` total duration (0.5s).
 */
const FLIP_HALF_MS = 250;

/** Resolve the counter label strings for both locales. Used in mount only. */
function resolveLabels(): { ru: string; tr: string } {
  return {
    ru: STRINGS.ru.hud.counterLabel,
    tr: STRINGS.tr.hud.counterLabel,
  };
}

/** Clamp the empty-click count to a valid index into the glow curve. */
function clampClicks(emptyClicks: number): number {
  const maxIndex = HUD_GLOW_ALPHA_BY_CLICK.length - 1;
  if (emptyClicks < 0) {
    return 0;
  }
  if (emptyClicks > maxIndex) {
    return maxIndex;
  }
  return emptyClicks;
}

/**
 * Build the counter DOM subtree. Returns the root element ready to insert
 * into the HUD overlay. Labels are stacked above the digit row per
 * atmosphere §5 (RU first, TR caption beneath).
 */
function buildCounterDom(): HTMLDivElement {
  const root = document.createElement('div');
  root.className = 'hud-counter';
  root.setAttribute('data-locale', 'bilingual');

  const labels = document.createElement('div');
  labels.className = 'hud-counter__labels';
  const labelsText = resolveLabels();
  const ruLabel = document.createElement('span');
  ruLabel.className = 'hud-counter__label hud-counter__label--ru';
  ruLabel.textContent = labelsText.ru;
  const trLabel = document.createElement('span');
  trLabel.className = 'hud-counter__label hud-counter__label--tr';
  trLabel.textContent = labelsText.tr;
  labels.append(ruLabel, trLabel);

  root.append(labels, buildDisplay());
  return root;
}

/** Build the digit row (current / total). Extracted for the 50-line ceiling. */
function buildDisplay(): HTMLDivElement {
  const display = document.createElement('div');
  display.className = 'hud-counter__display';

  const current = document.createElement('span');
  current.className = 'hud-counter__digit-current';
  current.textContent = '0';

  const separator = document.createElement('span');
  separator.className = 'hud-counter__separator';
  separator.textContent = '/';

  const total = document.createElement('span');
  total.className = 'hud-counter__digit-total';
  total.textContent = String(RNG_BANG_MODULUS);

  display.append(current, separator, total);
  return display;
}

/**
 * Mount the counter into a DOM root. `_locale` is accepted so the signature
 * matches the Phase 1 contract — both RU and TR labels render simultaneously
 * regardless of operator locale (PLAN §2's bilingual diegetic frame).
 */
export function mountCounter(
  root: HTMLElement,
  _locale: Locale,
): CounterHandle {
  const counter = buildCounterDom();
  root.appendChild(counter);
  const state = {
    flipTimeoutId: null as ReturnType<typeof setTimeout> | null,
    flipResetId: null as ReturnType<typeof setTimeout> | null,
  };
  return {
    update: (emptyClicks: number): void =>
      updateCounter(counter, emptyClicks, state),
    dispose: (): void => disposeCounter(counter, state),
  };
}

/** Internal: state bag for tracking active flip animations. */
interface CounterAnimState {
  flipTimeoutId: ReturnType<typeof setTimeout> | null;
  flipResetId: ReturnType<typeof setTimeout> | null;
}

/**
 * Re-render the counter after an empty-click increment. Sets the glow alpha
 * from the SSOT curve, then triggers the flap-display flip animation — the
 * digit textContent swap happens at the animation midpoint (FLIP_HALF_MS).
 */
function updateCounter(
  counter: HTMLDivElement,
  emptyClicks: number,
  state: CounterAnimState,
): void {
  const clamped = clampClicks(emptyClicks);
  const glowAlpha = HUD_GLOW_ALPHA_BY_CLICK[clamped] ?? 0.5;
  counter.style.setProperty('--hud-glow-alpha', String(glowAlpha));

  const currentDigit = counter.querySelector<HTMLSpanElement>(
    '.hud-counter__digit-current',
  );
  if (currentDigit === null) {
    return;
  }
  scheduleFlip(currentDigit, String(clamped), state);
}

/**
 * Trigger the flap-display flip. Cancels any in-flight flip first so rapid
 * updates do not stack animations. The text swap is scheduled at the
 * midpoint of the animation (FLIP_HALF_MS) where the card is edge-on.
 */
function scheduleFlip(
  digit: HTMLSpanElement,
  nextValue: string,
  state: CounterAnimState,
): void {
  if (state.flipTimeoutId !== null) {
    clearTimeout(state.flipTimeoutId);
  }
  if (state.flipResetId !== null) {
    clearTimeout(state.flipResetId);
  }
  // Force-restart the keyframe animation by toggling the class. Without the
  // off-frame reflow trick, re-adding the class while the animation is still
  // running would not restart it.
  digit.classList.remove(FLIPPING_CLASS);
  void digit.offsetWidth;
  digit.classList.add(FLIPPING_CLASS);
  state.flipTimeoutId = setTimeout(() => {
    digit.textContent = nextValue;
    state.flipTimeoutId = null;
  }, FLIP_HALF_MS);
  state.flipResetId = setTimeout(() => {
    digit.classList.remove(FLIPPING_CLASS);
    state.flipResetId = null;
  }, FLIP_HALF_MS * 2);
}

/** Tear down: clear any pending flip + remove the counter from the DOM. */
function disposeCounter(
  counter: HTMLDivElement,
  state: CounterAnimState,
): void {
  if (state.flipTimeoutId !== null) {
    clearTimeout(state.flipTimeoutId);
    state.flipTimeoutId = null;
  }
  if (state.flipResetId !== null) {
    clearTimeout(state.flipResetId);
    state.flipResetId = null;
  }
  counter.remove();
}
