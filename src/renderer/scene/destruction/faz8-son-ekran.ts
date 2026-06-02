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
 *   - FAZ8_DISCLAIMER_OWNER (Faz8DisclaimerHandle — Cyrillic primary +
 *     Turkish subtitle; fades in at FAZ8_SON_EKRAN_DISCLAIMER_ENTER_MS
 *     = 3sn)
 *   - FAZ8_RESTART_HINT_OWNER (Faz8RestartHintHandle — R-key hint
 *     text; fades in at FAZ8_SON_EKRAN_RESTART_HINT_ENTER_MS = 7sn;
 *     Sprint 6 scope: HINT TEXT only — Sprint 7+ adds buttons)
 *   - FAZ8_VOLUMETRIC_SMOKE_OWNER (Faz8VolumetricSmokeHandle — Phase
 *     2A may DROP; only mounted when handle constructed)
 *
 * Body sequence:
 *   1. Construct + register DoorCloseAccentHandle (audio).
 *   2. Schedule door-close trigger at 2sn via setTimeout (abort-aware).
 *   3. Schedule disclaimer fade-in at 3sn (mount via Lane B fn,
 *      override text via i18n-resolved STRINGS values).
 *   4. Schedule restart-hint fade-in at 7sn (mount via Lane B fn).
 *   5. Hold for total 10sn or abort.
 *
 * R key handling: scoped to son-ekran via the existing scene-mount.ts
 * keydown listener which gates on `getState().kind === 'faz8-son-ekran'`.
 * This runner does NOT install/remove a new listener — the binding is
 * window-level and FSM-gated by the director.
 *
 * Reduced-motion gate (designer Phase 2A §16):
 *   - Disclaimer fade-in: Lane B chrome handles via prefers-reduced-
 *     motion @media @keyframes; this runner only toggles the class.
 *   - Restart-hint fade-in: Lane B chrome handles via the same gate.
 *   - Door-close audio amplitude -6dB: gated inside
 *     createDoorCloseAccentHandle (Lane A audio factory).
 *   - Volumetric smoke OPTIONAL drop (Phase 2A); if shipped, the smoke
 *     column's reduced-motion gate skips spawn at the mount fn.
 */

import log from 'electron-log/renderer';
import type {
  DestructionAudioHandle,
  DoorCloseAccentHandle,
} from '../audio/destruction-audio.js';
import { createDoorCloseAccentHandle } from '../audio/destruction-audio-faz8.js';
import {
  DOOR_CLOSE_AUDIO_OWNER,
  FAZ8_DISCLAIMER_OWNER,
  FAZ8_RESTART_HINT_OWNER,
  FAZ8_VOLUMETRIC_SMOKE_OWNER,
  FAZ8_VOLUMETRIC_SMOKE_MODE,
  FAZ8_SON_EKRAN_DISCLAIMER_ENTER_MS,
  FAZ8_SON_EKRAN_DOOR_CLOSE_AT_MS,
  FAZ8_SON_EKRAN_DURATION_MS,
  FAZ8_SON_EKRAN_RESTART_HINT_ENTER_MS,
} from '../../../shared/scene-destruction-constants.js';
import { mountFaz8Disclaimer } from './chrome/faz8-disclaimer.js';
import { mountFaz8RestartHint } from './chrome/faz8-restart-hint.js';
import { mountFaz8VolumetricSmoke } from './chrome/faz8-volumetric-smoke.js';
import { t, resolveUserLocale } from '../../i18n/strings.js';
import type {
  Faz8DisclaimerHandle,
  Faz8RestartHintHandle,
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
 * `chromeHost` is the element into which the disclaimer / restart-hint
 * / volumetric-smoke chrome are mounted. MUST be a sibling of the
 * destruction-takeover (or document.body) so its opacity is independent
 * of the takeover's CSS transition (takeover fades to opacity:0 during
 * reveal; children of an opacity:0 parent are invisible by compositor
 * multiply regardless of their own opacity). Per chrome JSDoc
 * (faz8-disclaimer.ts:23-25): "Lane A passes the apartment scene root
 * (NOT the destruction-takeover overlay)".
 */
export interface Faz8SonEkranRunArgs {
  readonly os: OsVariant;
  readonly signal: AbortSignal;
  readonly container: HTMLElement;
  /**
   * Host element for Faz 8 son-ekran chrome (disclaimer, restart-hint,
   * volumetric smoke). Must NOT be the destruction-takeover overlay or
   * a descendant of it — that overlay is at opacity:0 by son-ekran
   * entry and would hide all child chrome. Typically document.body.
   */
  readonly chromeHost: HTMLElement;
  readonly destructionAudio: DestructionAudioHandle;
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
    disclaimer: null,
    restartHint: null,
    volumetricSmoke: null,
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
  // Explicit chrome dispose on natural exit — abort-path dispose is wired
  // via the chrome mount fns' AbortSignal listeners, but on the 10sn
  // natural completion the signal never fires, so we walk the bag here.
  handles.disclaimer?.dispose();
  handles.restartHint?.dispose();
  handles.volumetricSmoke?.dispose();
}

/** Mutable handle bag — populated as Lane B mount fns are invoked. */
interface Faz8SonEkranHandles {
  disclaimer: Faz8DisclaimerHandle | null;
  restartHint: Faz8RestartHintHandle | null;
  volumetricSmoke: Faz8VolumetricSmokeHandle | null;
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
  timers.add(
    setTimeout(
      (): void => mountDisclaimerIfActive(opts, handles),
      FAZ8_SON_EKRAN_DISCLAIMER_ENTER_MS,
    ),
  );
  timers.add(
    setTimeout(
      (): void => mountRestartHintIfActive(opts, handles),
      FAZ8_SON_EKRAN_RESTART_HINT_ENTER_MS,
    ),
  );
}

/**
 * Mount the Faz 8 disclaimer chrome at the 3sn mark and override the
 * text via i18n-resolved STRINGS. Lane B's mount fn already accepts
 * the strings via opts.primaryRu/secondaryTr — we also call
 * setPrimaryText/setSecondaryText explicitly so the bilingual contract
 * (RU literal under .primary, TR literal under .secondary across BOTH
 * locale trees) is honoured at the call site.
 *
 * BLOCKER-001 fix: after mount, a rAF callback removes the (now
 * absent) inline opacity anchor and toggles `.is-visible` on the
 * returned element. The rAF deferral lets the browser paint one frame
 * with `opacity:0` (from the CSS class) so the CSS transition has a
 * definite starting point before the end-state class is added.
 *
 * BLOCKER-003 fix: opts.chromeHost (document.body or scene root) is
 * used as hostElement, NOT opts.container (the destruction-takeover
 * overlay which is at opacity:0 by son-ekran entry).
 */
function mountDisclaimerIfActive(
  opts: Faz8SonEkranRunArgs,
  handles: Faz8SonEkranHandles,
): void {
  if (opts.signal.aborted) return;
  const locale = resolveUserLocale();
  const primary = t('destruction.faz8.disclaimer.primary', locale);
  const secondary = t('destruction.faz8.disclaimer.secondary', locale);
  const ariaLabel = t('destruction.faz8.disclaimer.aria-label', locale);
  const handle = mountFaz8Disclaimer({
    caller: FAZ8_DISCLAIMER_OWNER,
    primaryRu: primary,
    secondaryTr: secondary,
    ariaLabel,
    signal: opts.signal,
    hostElement: opts.chromeHost,
  });
  handle.setPrimaryText(primary);
  handle.setSecondaryText(secondary);
  handles.disclaimer = handle;
  // Trigger CSS fade-in: one rAF so the browser paints opacity:0
  // (CSS base state) first, then the is-visible class drives 0→0.9.
  requestAnimationFrame((): void => {
    if (!opts.signal.aborted) {
      handle.element.classList.add('is-visible');
    }
  });
}

/**
 * Mount the Faz 8 restart-hint chrome at the 7sn mark with i18n-
 * resolved hint text. The TR variant is the user's primary locale
 * gloss; the RU variant is the diegetic immersion line. Lane B
 * stacks both via the FAZ8_RESTART_HINT_SEPARATOR (middle-dot).
 *
 * BLOCKER-001 fix: rAF toggles `.is-visible` after mount.
 * BLOCKER-003 fix: uses opts.chromeHost, not opts.container.
 */
function mountRestartHintIfActive(
  opts: Faz8SonEkranRunArgs,
  handles: Faz8SonEkranHandles,
): void {
  if (opts.signal.aborted) return;
  const hintRu = t('destruction.faz8.restart.hint', 'ru');
  const hintTr = t('destruction.faz8.restart.hint', 'tr');
  const locale = resolveUserLocale();
  const ariaLabel = t('destruction.faz8.restart.hint', locale);
  const handle = mountFaz8RestartHint({
    caller: FAZ8_RESTART_HINT_OWNER,
    hintRu,
    hintTr,
    ariaLabel,
    signal: opts.signal,
    hostElement: opts.chromeHost,
  });
  handle.setHintText(hintRu, hintTr);
  handles.restartHint = handle;
  // Trigger CSS fade-in: one rAF so the browser paints opacity:0
  // (CSS base state) first, then the is-visible class drives 0→0.4.
  requestAnimationFrame((): void => {
    if (!opts.signal.aborted) {
      handle.element.classList.add('is-visible');
    }
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
