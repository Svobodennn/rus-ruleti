/**
 * Faz 8 volumetric smoke chrome — Sprint 6 Phase 1 SCAFFOLD.
 *
 * PHASE 2A DESIGNER DECISION REQUIRED — may be dropped.
 *
 * OPTIONAL second smoke column over the revolver-on-table composite
 * during the Faz 8 son-ekran closing tableau. The lobby cigarette
 * smoke column already exists (Sprint 3 SmokeHandle); this second
 * column would add atmosphere over the revolver framing but at a
 * non-trivial perf cost (designer Phase 2A weighs against the
 * atmosphere read).
 *
 * Phase 2A designer may DROP this file entirely. The scaffold ships
 * in Sprint 6 Phase 1 so the type surface and FAZ8_VOLUMETRIC_SMOKE_OWNER
 * decree are in place; if Phase 2A drops, faz8-son-ekran.ts skips the
 * mount call and the FSM proceeds without the second column.
 *
 * WHO CALLS THIS: faz8-son-ekran.ts (single caller, conditional on
 *   Phase 2A retention).
 *
 * SHARED RESOURCES OWNED: FAZ8_VOLUMETRIC_SMOKE_OWNER decree —
 * faz8-son-ekran.ts owns the lifecycle (mount + dispose).
 *
 * Lane B Phase 2B implementation outline (the body this stub
 * replaces, IF retained):
 *
 *   1. CONSTRUCT a fixed-position canvas or CSS-only mist element
 *      sized to overlay the revolver-on-table composite. Designer
 *      Phase 2A picks the technique (CSS gradients + mask vs.
 *      Canvas2D animated mist vs. SVG filter blob).
 *
 *   2. ATTACH to opts.hostElement (destruction overlay container).
 *
 *   3. ANIMATE: a slow drift envelope (rAF or CSS keyframes) so the
 *      smoke reads as MOTION not static. Designer §6 establishes
 *      drift speed; Phase 2A locks the constant.
 *
 *   4. DISPOSE: detach signal-aborted listener (if any) + remove
 *      element from parent. Idempotent.
 *
 * Reduced-motion gate (designer Phase 2A §16 — Sprint 6 extends):
 *   - Skip the animation entirely; either render a static frame at
 *     a tasteful opacity or skip the mount (designer Phase 2A
 *     locks the call).
 *
 * Target line count: ~80-140L when Lane B fills (or 0 if dropped).
 *
 * PHASE 2A DESIGNER DECISION REQUIRED — may be dropped
 */

import type { Faz8VolumetricSmokeHandle } from '../types.js';

/**
 * Mount option bag — son-ekran threads the AbortSignal + hostElement.
 * No content strings; the smoke is purely a visual atmosphere layer.
 */
export interface MountFaz8VolumetricSmokeOptions {
  /** Abort signal — dispose triggers when the signal fires. */
  readonly signal: AbortSignal;
  /** Parent DOM element the smoke layer attaches into. */
  readonly hostElement: HTMLElement;
}

/**
 * Mount the Faz 8 volumetric smoke chrome.
 *
 * Sprint 6 Phase 1 stub: returns a no-op handle with an empty
 * placeholder element. Lane B Phase 2B fills the body IF Phase 2A
 * designer retains the second smoke column.
 */
export function mountFaz8VolumetricSmoke(
  opts: MountFaz8VolumetricSmokeOptions,
): Faz8VolumetricSmokeHandle {
  // Phase 1 scaffold: minimal placeholder element so callers can
  // wire the handle into the DOM tree before Lane B fills.
  const element = document.createElement('div');
  element.className = 'faz8-volumetric-smoke';
  element.dataset['scaffold'] = 'phase-1';

  let disposed = false;
  const handle: Faz8VolumetricSmokeHandle = {
    kind: 'faz8-volumetric-smoke',
    element,
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      if (element.parentNode !== null) {
        element.parentNode.removeChild(element);
      }
    },
  };

  // Wire the abort signal so the parent runner's signal aborts the
  // chrome alongside it.
  if (opts.signal.aborted) {
    handle.dispose();
  } else {
    opts.signal.addEventListener('abort', (): void => handle.dispose(), { once: true });
  }

  return handle;
}
