/**
 * Faz 8 volumetric smoke chrome — Sprint 6 Phase 2B Lane B FILL.
 *
 * OPTIONAL second smoke column over the revolver-on-table composite
 * during the Faz 8 son-ekran closing tableau. Phase 2A D-2 picked
 * `FAZ8_VOLUMETRIC_SMOKE_MODE = 'css'` (CSS-only render) — see
 * destruction-direction.md §19 "Volumetric smoke" and §20 row 43.
 *
 * The lobby cigarette smoke column already exists (Sprint 3
 * SmokeHandle); this second column adds atmosphere over the
 * revolver framing — designer rationale: "the smoke is the visible-
 * breath of the room: the bulb is light, the radio is sound, the
 * smoke is air" (destruction-direction.md §19 line 2571).
 *
 * WHO CALLS THIS: faz8-son-ekran.ts (single caller).
 *
 * SHARED RESOURCES OWNED: FAZ8_VOLUMETRIC_SMOKE_OWNER decree —
 * faz8-son-ekran.ts owns the lifecycle (mount + dispose).
 *
 * Lane B fill (this body):
 *   1. CONSTRUCT a two-element CSS-only structure anchored at the
 *      designer-defined D-4 source ('desk-ashtray' = masa front-right
 *      in the procedural-poster snapshot):
 *        - <div class="faz8-smoke-source"> — anchor point (positioned
 *          absolute via CSS); pairs with the trail child.
 *        - <div class="faz8-smoke-trail">  — rising column; the
 *          CSS @keyframes faz8-smoke-rise drives the 6sn loop
 *          (translateY + scale + opacity envelope).
 *   2. ATTACH to opts.hostElement (apartment scene root). NO inline
 *      style — the CSS owns all positioning + animation.
 *   3. ARIA: aria-hidden="true" — purely decorative atmospheric
 *      element per Phase 2A §20 matrix row 43.
 *   4. Reduced-motion: the CSS @media block sets `animation: none`
 *      on `.faz8-smoke-trail` so the column holds as a static low-
 *      opacity radial gradient (atmospheric haze preserved without
 *      the rising motion — see destruction-direction.md §20 line 2645).
 *   5. DISPOSE: idempotent. Removes the source element (the trail is
 *      a child so it goes with it).
 *
 * Perf note (destruction-direction.md §19 line 2565):
 *   CSS-only is a single GPU composite layer. On M1 60fps this is
 *   sub-1ms per frame — well within budget. If Lane B reports a
 *   frame-time regression > 16.6ms with smoke mounted, the kill-
 *   switch is FAZ8_VOLUMETRIC_SMOKE_MODE='none' in
 *   scene-destruction-constants.ts (not handled here — the runner
 *   short-circuits the mount call if mode is 'none').
 *
 * PHASE 2B LANE B — frontend-dev FILLED (D-2 mode='css', D-4 source='desk-ashtray')
 */

import type { FAZ8_VOLUMETRIC_SMOKE_OWNER } from '../../../../shared/scene-destruction-constants.js';
import type { Faz8VolumetricSmokeHandle } from '../types.js';

/**
 * Mount option bag — son-ekran threads the AbortSignal + hostElement.
 * No content strings; the smoke is purely a visual atmosphere layer.
 *
 * TH-S5-03 enforcement: `caller` must be the FAZ8_VOLUMETRIC_SMOKE_OWNER
 * constant — only faz8-son-ekran.ts holds that constant so only it
 * can mount the volumetric smoke chrome.
 */
export interface MountFaz8VolumetricSmokeOptions {
  /** TH-S5-03 owner enforcement — must be FAZ8_VOLUMETRIC_SMOKE_OWNER. */
  readonly caller: typeof FAZ8_VOLUMETRIC_SMOKE_OWNER;
  /** Abort signal — dispose triggers when the signal fires. */
  readonly signal: AbortSignal;
  /** Parent DOM element the smoke layer attaches into. */
  readonly hostElement: HTMLElement;
}

/**
 * Mount the Faz 8 volumetric smoke chrome (CSS-only path).
 *
 * Returns a Faz8VolumetricSmokeHandle whose `dispose()` removes the
 * smoke source + trail elements.
 *
 * CSS class hooks consumed (see destruction.css §"Faz 8 Son ekran"):
 *   - `.faz8-smoke-source` — anchor at desk-ashtray (CSS positions)
 *   - `.faz8-smoke-trail`  — rising column, 6sn @keyframes loop
 */
export function mountFaz8VolumetricSmoke(
  opts: MountFaz8VolumetricSmokeOptions,
): Faz8VolumetricSmokeHandle {
  const source = document.createElement('div');
  source.className = 'faz8-smoke-source';
  // ARIA: decorative atmospheric element. Hidden from assistive tech.
  source.setAttribute('aria-hidden', 'true');

  const trail = document.createElement('div');
  trail.className = 'faz8-smoke-trail';
  trail.setAttribute('aria-hidden', 'true');
  source.appendChild(trail);

  opts.hostElement.appendChild(source);

  let disposed = false;
  const handle: Faz8VolumetricSmokeHandle = {
    kind: 'faz8-volumetric-smoke',
    element: source,
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      if (source.parentNode !== null) {
        source.parentNode.removeChild(source);
      }
    },
  };

  // Honor opts.signal — dispose when the parent runner aborts.
  if (opts.signal.aborted) {
    handle.dispose();
  } else {
    opts.signal.addEventListener('abort', (): void => handle.dispose(), { once: true });
  }

  return handle;
}
