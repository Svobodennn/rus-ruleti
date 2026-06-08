/**
 * Faz 8 — Son ekran (55-65sn).
 *
 * Sprint 6 Phase 2B Lane A fill. PLAN §7 lines 290-303 narrative spec
 * (closing tableau portion — reveal lives in faz8-reveal.ts).
 *
 * WHO CALLS THIS: destruction-director.ts (Sprint 6 extends the FSM
 *   with a `faz8-reveal → faz8-son-ekran` transition; the director
 *   invokes `startFaz8SonEkran` once the reveal envelope resolves).
 *   Single caller — no other module mounts the son-ekran.
 *
 * SHARED RESOURCES OWNED (per scene-destruction-constants.ts owner
 * decrees):
 *   - DOOR_CLOSE_AUDIO_OWNER (DoorCloseAccentHandle, single-fire at
 *     FAZ8_SON_EKRAN_DOOR_CLOSE_AT_MS = 2sn into son-ekran)
 *   - FAZ8_TEKRAR_BUTTON_CHROME_OWNER (Sprint 7 — Faz8TekrarButton
 *     mount, fade-in at FAZ8_BUTTON_FADEIN_START_OFFSET_MS = 2.5sn;
 *     click/Enter/Space → opts.requestRestart() = director.requestRestart)
 *   - FAZ8_CIK_BUTTON_CHROME_OWNER (Sprint 7 — Faz8CikButton mount,
 *     fade-in at same offset; click/Enter/Space → opts.quit() =
 *     window.api.quit())
 *   - FAZ8_BUTTON_KEYDOWN_LISTENER_OWNER (Sprint 7 — Enter/Space
 *     activation gated on activeElement === tekrar/cik button)
 *   - FAZ8_VOLUMETRIC_SMOKE_OWNER (Faz8VolumetricSmokeHandle — Phase
 *     2A may DROP; only mounted when handle constructed)
 *
 * Sprint 9.1 — FAZ8_DISCLAIMER_OWNER decree DROPPED. The Cyrillic /
 * Turkish "Это просто шутка. / Bu sadece bir şaka." text overlay has
 * been removed from the in-app surface per the post-ship user
 * directive. The closing tableau is now purely visual + atmospheric
 * (revolver-on-table + door-close audio + sigara dumanı + TEKRAR /
 * ÇIK buttons). The bilingual joke framing now lives in the visual
 * tableau and the button affordances themselves, not in overt text.
 *
 * Sprint 7 D-2 — restart-hint REMOVED. The Sprint 6 .faz8-restart-hint
 * chrome (R-key hint text) is no longer mounted; the TEKRAR button is
 * its visual + functional successor (button label communicates the
 * action affordance directly — hint text becomes redundant). The
 * restart-hint chrome file + CSS stay for type continuity until a
 * future spark / Sprint 8 cleanup; this runner no longer references
 * mountFaz8RestartHint.
 *
 * Body sequence:
 *   1. Construct + register DoorCloseAccentHandle (audio).
 *   2. Schedule door-close trigger at 2sn via setTimeout (abort-aware).
 *   3. Schedule TEKRAR + ÇIK button mount at 2.5sn (Sprint 7).
 *   4. Hold for total 10sn or abort.
 *
 * Sprint 9.1 — step 4 of the original Sprint 6 sequence (disclaimer
 * mount at 3sn) is REMOVED. The 3sn beat now passes silently: the
 * door-close has fired, the buttons have begun their fade-in, and
 * the tableau holds visually without a text overlay until natural
 * completion at FAZ8_SON_EKRAN_DURATION_MS.
 *
 * R key handling: scoped to son-ekran via the existing scene-mount.ts
 * keydown listener which gates on `getState().kind === 'faz8-son-ekran'`.
 * This runner does NOT install/remove a new R-key listener — the
 * binding is window-level and FSM-gated by the director. The Sprint 7
 * Enter/Space keydown listener is button-scoped (gates on
 * `document.activeElement === tekrar/cik button.element`) and lives
 * here (FAZ8_BUTTON_KEYDOWN_LISTENER_OWNER).
 *
 * Reduced-motion gate (designer Phase 2A §16):
 *   - Button fade-in: Lane B CSS @media (prefers-reduced-motion: reduce)
 *     drops the transition; .is-visible class snap-jumps to opacity 1.
 *   - Door-close audio amplitude -6dB: gated inside
 *     createDoorCloseAccentHandle (Lane A audio factory).
 *   - Volumetric smoke OPTIONAL drop (Phase 2A); if shipped, the smoke
 *     column's reduced-motion gate skips spawn at the mount fn.
 *   - (Sprint 9.1 — the prior disclaimer fade-in reduced-motion gate
 *     is no longer applicable; the disclaimer surface was removed.)
 */

import log from 'electron-log/renderer';
import type {
  DestructionAudioHandle,
  DoorCloseAccentHandle,
} from '../audio/destruction-audio.js';
import { createDoorCloseAccentHandle } from '../audio/destruction-audio-faz8.js';
import {
  DOOR_CLOSE_AUDIO_OWNER,
  FAZ8_BUTTON_FADEIN_START_OFFSET_MS,
  FAZ8_CIK_BUTTON_CHROME_OWNER,
  FAZ8_CIK_BUTTON_FOCUSED_CLASS,
  FAZ8_CIK_BUTTON_VISIBLE_CLASS,
  FAZ8_TEKRAR_BUTTON_CHROME_OWNER,
  FAZ8_TEKRAR_BUTTON_FOCUSED_CLASS,
  FAZ8_TEKRAR_BUTTON_VISIBLE_CLASS,
  FAZ8_VOLUMETRIC_SMOKE_OWNER,
  FAZ8_VOLUMETRIC_SMOKE_MODE,
  FAZ8_SON_EKRAN_DOOR_CLOSE_AT_MS,
  FAZ8_SON_EKRAN_DURATION_MS,
} from '../../../shared/scene-destruction-constants.js';
import {
  mountFaz8CikButton,
  mountFaz8TekrarButton,
} from './chrome/faz8-action-buttons.js';
// Sprint 9.1 — mountFaz8Disclaimer + Faz8DisclaimerHandle imports removed
// alongside the deleted chrome/faz8-disclaimer.ts file.
import { mountFaz8VolumetricSmoke } from './chrome/faz8-volumetric-smoke.js';
import { t, resolveUserLocale } from '../../i18n/strings.js';
import type {
  Faz8CikButtonHandle,
  Faz8TekrarButtonHandle,
  Faz8VolumetricSmokeHandle,
  OsVariant,
} from './types.js';

/**
 * Runner arg bag — destruction-director threads the dependencies
 * son-ekran needs.
 *
 * `container` is the destruction-takeover overlay element (the one
 * reveal faded out) — kept for reference but NOT the chrome host.
 *
 * `chromeHost` is the element into which the son-ekran chrome
 * (volumetric-smoke) is mounted. MUST be a sibling of the
 * destruction-takeover (or document.body) so its opacity is independent
 * of the takeover's CSS transition (takeover fades to opacity:0 during
 * reveal; children of an opacity:0 parent are invisible by compositor
 * multiply regardless of their own opacity). Sprint 9.1 — the disclaimer
 * surface that previously also lived under this host is removed; the
 * volumetric-smoke is the only remaining son-ekran chrome attached here.
 */
export interface Faz8SonEkranRunArgs {
  readonly os: OsVariant;
  readonly signal: AbortSignal;
  readonly container: HTMLElement;
  /**
   * Host element for Faz 8 son-ekran chrome (volumetric-smoke). Must
   * NOT be the destruction-takeover overlay or a descendant of it —
   * that overlay is at opacity:0 by son-ekran entry and would hide all
   * child chrome. Typically document.body.
   */
  readonly chromeHost: HTMLElement;
  readonly destructionAudio: DestructionAudioHandle;
  /**
   * Sprint 7 Phase 1 — TH-S6-03 REQUIRED hostElement for the TEKRAR
   * button mount. Lane A Phase 2B threads the resolved DOM element
   * (typically document.body per Sprint 6 BLOCKER-3 retro — the
   * destruction-takeover overlay is at opacity:0 by son-ekran entry
   * and would hide all child chrome). The type surface forces the
   * caller to be EXPLICIT so the choice is auditable at the mount
   * call site; never default the host element inside the mount fn.
   */
  readonly tekrarButtonHost: HTMLElement;
  /**
   * Sprint 7 Phase 1 — TH-S6-03 REQUIRED hostElement for the ÇIK
   * button mount. Mirror of `tekrarButtonHost`.
   */
  readonly cikButtonHost: HTMLElement;
  /**
   * Sprint 7 — TEKRAR button click / Enter / Space handler. Wired by
   * the destruction-director to `requestRestart()` (the Sprint 6 R-key
   * canonical path; renderer-only FSM re-entry, KIOSK-SAFE).
   */
  readonly requestRestart: () => void;
  /**
   * Sprint 7 — ÇIK button click / Enter / Space handler. Wired by the
   * destruction-director to `window.api.quit()` (S10 Path A — reuses
   * the Sprint 0 `app:quit` IPC channel via the preload bridge).
   */
  readonly quit: () => void;
}

/**
 * Run the Faz 8 son-ekran closing tableau. Resolves at
 * FAZ8_SON_EKRAN_DURATION_MS (10sn), earlier on ESC-hold abort, or
 * earlier on R-key restart (the director's requestRestart() aborts
 * the inner signal so this runner resolves and the FSM transitions
 * back to faz8-reveal).
 *
 * Door-close audio + disclaimer + restart-hint mounts are scheduled
 * via setTimeout against the shared timer set; the abort handler
 * wipes them in O(n) so a late ESC-hold cancels every pending mount
 * cleanly.
 */
export async function startFaz8SonEkran(
  opts: Faz8SonEkranRunArgs,
): Promise<void> {
  if (opts.signal.aborted) return;
  log.info('faz8-son-ekran: start', { os: opts.os });

  const timers = new Set<ReturnType<typeof setTimeout>>();
  const handles: Faz8SonEkranHandles = {
    tekrarButton: null,
    cikButton: null,
    volumetricSmoke: null,
    detachKeydown: null,
  };
  const onAbort = (): void => {
    for (const id of timers) clearTimeout(id);
    timers.clear();
  };
  opts.signal.addEventListener('abort', onAbort, { once: true });

  const doorClose = constructAndRegisterDoorClose(opts);
  scheduleSonEkranCues(opts, doorClose, handles, timers);
  await waitForSonEkranEnd(opts.signal, timers);
  opts.signal.removeEventListener('abort', onAbort);
  // Explicit chrome dispose on natural exit — abort-path dispose is
  // wired via the chrome mount fns' AbortSignal listeners, but on the
  // 10sn natural completion the signal never fires, so we walk the bag
  // here. The Sprint 7 buttons also detach their owned keydown listener
  // before element removal so handlers do not target a stale element.
  handles.detachKeydown?.();
  handles.tekrarButton?.dispose();
  handles.cikButton?.dispose();
  handles.volumetricSmoke?.dispose();
}

/**
 * Mutable handle bag — populated as Lane B mount fns are invoked.
 * Sprint 7 — restartHint REMOVED (D-2: TEKRAR button replaces the hint
 * text); tekrarButton + cikButton + detachKeydown added.
 * Sprint 9.1 — disclaimer REMOVED (post-ship: the in-app joke disclaimer
 * surface was removed; the closing tableau holds visually without a
 * text overlay).
 */
interface Faz8SonEkranHandles {
  tekrarButton: Faz8TekrarButtonHandle | null;
  cikButton: Faz8CikButtonHandle | null;
  volumetricSmoke: Faz8VolumetricSmokeHandle | null;
  /** Document-level Enter/Space listener disposer (button-scoped activation). */
  detachKeydown: (() => void) | null;
}

/**
 * Construct DoorCloseAccentHandle via caller-typed factory + register
 * into destructionAudio owner pool so the director's
 * disposeSequenceArtifacts walks it down at teardown.
 *
 * TH-S5-03 enforcement: the factory's `caller: typeof
 * DOOR_CLOSE_AUDIO_OWNER` parameter rejects cross-lane misuse at the
 * compiler — only this site can pass the matching owner constant.
 */
function constructAndRegisterDoorClose(
  opts: Faz8SonEkranRunArgs,
): DoorCloseAccentHandle {
  const handle = createDoorCloseAccentHandle({
    caller: DOOR_CLOSE_AUDIO_OWNER,
    signal: opts.signal,
    audioContext: opts.destructionAudio.context,
    destination: opts.destructionAudio.destination,
  });
  opts.destructionAudio.registerOwnedAudio(DOOR_CLOSE_AUDIO_OWNER, handle);
  return handle;
}

/**
 * Schedule every son-ekran cue at its designer offset. Each cue
 * registers its setTimeout id with the shared abort-tracking Set so
 * a late ESC-hold wipes them in O(n). Pattern mirrors
 * faz0-bang.scheduleFaz0Cues.
 *
 * Volumetric smoke (BLOCKER-002 fix): mounted immediately at son-ekran
 * entry (not deferred) so the CSS @keyframes animation starts from t=0.
 * FAZ8_VOLUMETRIC_SMOKE_MODE='none' short-circuits the mount call —
 * the kill-switch lives in scene-destruction-constants.ts.
 */
function scheduleSonEkranCues(
  opts: Faz8SonEkranRunArgs,
  doorClose: DoorCloseAccentHandle,
  handles: Faz8SonEkranHandles,
  timers: Set<ReturnType<typeof setTimeout>>,
): void {
  // Mount volumetric smoke immediately at son-ekran entry.
  if (!opts.signal.aborted && FAZ8_VOLUMETRIC_SMOKE_MODE === 'css') {
    handles.volumetricSmoke = mountFaz8VolumetricSmoke({
      caller: FAZ8_VOLUMETRIC_SMOKE_OWNER,
      signal: opts.signal,
      hostElement: opts.chromeHost,
    });
  }
  timers.add(
    setTimeout((): void => {
      if (!opts.signal.aborted) doorClose.trigger();
    }, FAZ8_SON_EKRAN_DOOR_CLOSE_AT_MS),
  );
  // Sprint 9.1 — disclaimer mount at FAZ8_SON_EKRAN_DISCLAIMER_ENTER_MS
  // REMOVED. The 3sn beat passes silently; the closing tableau is now
  // purely visual + atmospheric (revolver-on-table + sigara dumanı +
  // door-close at 2sn + TEKRAR/ÇIK buttons at 2.5sn).
  // Sprint 7 — TEKRAR + ÇIK buttons fade in at 2.5sn (after door-close
  // has fired; before son-ekran natural-completes at 10sn). The
  // Sprint 6 restart-hint mount is REMOVED (D-2).
  timers.add(
    setTimeout(
      (): void => mountActionButtonsIfActive(opts, handles),
      FAZ8_BUTTON_FADEIN_START_OFFSET_MS,
    ),
  );
}

/**
 * Sprint 7 — Mount the Faz 8 TEKRAR + ÇIK action buttons at the 2.5sn
 * mark via Lane B chrome mount fns. The two buttons replace the
 * Sprint 6 restart-hint text (D-2: TEKRAR's label communicates the
 * affordance directly; ÇIK adds the deliberate quit path).
 *
 * Mount sequence:
 *   1. Mount TEKRAR button (FAZ8_TEKRAR_BUTTON_CHROME_OWNER) into
 *      opts.tekrarButtonHost (typically document.body — sibling of
 *      the destruction-takeover overlay which is at opacity:0).
 *      Click/Enter/Space → opts.requestRestart() = director's
 *      requestRestart() (Sprint 6 R-key canonical path; KIOSK-SAFE).
 *   2. Mount ÇIK button (FAZ8_CIK_BUTTON_CHROME_OWNER) into
 *      opts.cikButtonHost. Click/Enter/Space → opts.quit() =
 *      window.api.quit() (S10 Path A — reuses Sprint 0 app:quit IPC).
 *   3. Set tabIndex=0 on both buttons; initial focus = TEKRAR (the
 *      primary affordance — restart over quit).
 *   4. Install document-level keydown listener (FAZ8_BUTTON_KEYDOWN_
 *      LISTENER_OWNER): Enter/Space triggers the focused button's
 *      onClick (gated on activeElement). The native <button>
 *      already activates on Enter/Space when focused; this listener
 *      is the explicit owner-decreed binding so the activation
 *      surface is unambiguous + survives any future focus-management
 *      refactor.
 *   5. Double-rAF visibility toggle (Sprint 6 BLOCKER-1 retro): the
 *      mount fns return elements at opacity:0 (CSS base); one rAF
 *      lets the browser paint the opacity:0 frame, the second rAF
 *      adds the .is-visible class so the CSS transition has a
 *      definite starting point.
 *
 * Dispose: handle on natural completion via startFaz8SonEkran's
 * explicit walk; on abort, the chrome's own signal listeners dispose.
 * The keydown listener disposer is stored on handles.detachKeydown
 * and called on both paths.
 */
function mountActionButtonsIfActive(
  opts: Faz8SonEkranRunArgs,
  handles: Faz8SonEkranHandles,
): void {
  if (opts.signal.aborted) return;
  const locale = resolveUserLocale();
  const tekrarLabel = t('destruction.faz8.button.tekrar.label', locale);
  const tekrarAria = t('destruction.faz8.button.tekrar.aria-label', locale);
  const cikLabel = t('destruction.faz8.button.cik.label', locale);
  const cikAria = t('destruction.faz8.button.cik.aria-label', locale);
  const tekrarButton = mountFaz8TekrarButton({
    caller: FAZ8_TEKRAR_BUTTON_CHROME_OWNER,
    hostElement: opts.tekrarButtonHost,
    hostKind: 'document.body',
    onClick: opts.requestRestart,
    ariaLabel: tekrarAria,
    labelText: tekrarLabel,
    signal: opts.signal,
  });
  const cikButton = mountFaz8CikButton({
    caller: FAZ8_CIK_BUTTON_CHROME_OWNER,
    hostElement: opts.cikButtonHost,
    hostKind: 'document.body',
    onClick: opts.quit,
    ariaLabel: cikAria,
    labelText: cikLabel,
    signal: opts.signal,
  });
  handles.tekrarButton = tekrarButton;
  handles.cikButton = cikButton;
  configureButtonTabOrderAndFocus(tekrarButton, cikButton);
  handles.detachKeydown = installButtonKeydownListener(opts, tekrarButton, cikButton);
  triggerButtonVisibility(opts, tekrarButton, cikButton);
}

/**
 * Set tabIndex=0 + focus styling class hooks on both buttons. Initial
 * focus lands on TEKRAR (primary affordance). The activeElement set
 * here drives the keydown listener gate so the Enter/Space owner
 * binding is deterministic from the first frame.
 */
function configureButtonTabOrderAndFocus(
  tekrarButton: Faz8TekrarButtonHandle,
  cikButton: Faz8CikButtonHandle,
): void {
  tekrarButton.element.tabIndex = 0;
  cikButton.element.tabIndex = 0;
  // Defensive focus call — Lane B mount fn may already focus, but the
  // explicit call here documents the owner intent and idempotently
  // settles the initial activeElement before the keydown listener
  // installs. Wrapped in a try/catch since focus() on a not-yet-paint
  // element in jsdom test envs throws.
  try {
    tekrarButton.element.focus();
  } catch {
    // Test env or not-yet-painted — focus settles on first paint.
  }
}

/**
 * Install the document-level Enter/Space keydown listener owned by
 * FAZ8_BUTTON_KEYDOWN_LISTENER_OWNER. The listener gates on
 * `document.activeElement === tekrar/cik button.element` so it ONLY
 * fires when one of the buttons has keyboard focus. Returns a
 * disposer the caller invokes on dispose / abort.
 *
 * The native <button> element already activates on Enter/Space when
 * focused; this listener is the explicit owner-decreed binding so
 * the activation path is unambiguous + auditable. It also drives
 * focus-class toggles (FAZ8_TEKRAR_BUTTON_FOCUSED_CLASS /
 * FAZ8_CIK_BUTTON_FOCUSED_CLASS) so the keyboard-focus ring is
 * symmetric with mouse-focus.
 */
function installButtonKeydownListener(
  opts: Faz8SonEkranRunArgs,
  tekrarButton: Faz8TekrarButtonHandle,
  cikButton: Faz8CikButtonHandle,
): () => void {
  const onKey = (ev: KeyboardEvent): void => {
    if (opts.signal.aborted) return;
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    const active = document.activeElement;
    if (active === tekrarButton.element) {
      ev.preventDefault();
      opts.requestRestart();
    } else if (active === cikButton.element) {
      ev.preventDefault();
      opts.quit();
    }
  };
  const onFocusIn = (): void => {
    const active = document.activeElement;
    tekrarButton.element.classList.toggle(
      FAZ8_TEKRAR_BUTTON_FOCUSED_CLASS,
      active === tekrarButton.element,
    );
    cikButton.element.classList.toggle(
      FAZ8_CIK_BUTTON_FOCUSED_CLASS,
      active === cikButton.element,
    );
  };
  document.addEventListener('keydown', onKey);
  document.addEventListener('focusin', onFocusIn);
  // Sync initial focus state class (TEKRAR has initial focus).
  onFocusIn();
  return (): void => {
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('focusin', onFocusIn);
  };
}

/**
 * Double-rAF visibility toggle (Sprint 6 BLOCKER-1 retro). The chrome
 * mount fns return elements at opacity:0 (CSS base state). The first
 * rAF lets the browser commit the opacity:0 frame so the CSS
 * transition has a definite starting point; the second rAF adds the
 * .is-visible class which drives the CSS transition 0 → 1.
 */
function triggerButtonVisibility(
  opts: Faz8SonEkranRunArgs,
  tekrarButton: Faz8TekrarButtonHandle,
  cikButton: Faz8CikButtonHandle,
): void {
  requestAnimationFrame((): void => {
    if (opts.signal.aborted) return;
    requestAnimationFrame((): void => {
      if (opts.signal.aborted) return;
      tekrarButton.element.classList.add(FAZ8_TEKRAR_BUTTON_VISIBLE_CLASS);
      cikButton.element.classList.add(FAZ8_CIK_BUTTON_VISIBLE_CLASS);
    });
  });
}

/**
 * Wait for FAZ8_SON_EKRAN_DURATION_MS to elapse OR `signal` to abort,
 * whichever comes first. Resolves either way — the abort tracking
 * already cleared any in-flight cue timers. Pattern matches
 * faz0-bang.waitForFaz0End.
 */
function waitForSonEkranEnd(
  signal: AbortSignal,
  timers: Set<ReturnType<typeof setTimeout>>,
): Promise<void> {
  return new Promise<void>((resolve): void => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const id = setTimeout((): void => {
      timers.delete(id);
      resolve();
    }, FAZ8_SON_EKRAN_DURATION_MS);
    timers.add(id);
    signal.addEventListener('abort', (): void => resolve(), { once: true });
  });
}
