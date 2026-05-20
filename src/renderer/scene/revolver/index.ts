/**
 * Revolver subsystem — public mount API.
 *
 * Phase 1 STUB orchestrator. Composes the FSM, RNG, input listener, mesh +
 * animation, and HUD into a single `RevolverHandle` consumed by `scene/
 * index.ts`. Phase 2 kraken-revolver wires the FSM transitions into all
 * the side-effect surfaces (lights dim, audio cues, animations play); Phase
 * 1 only locks the shape so other Phase 2 work (frontend-dev HUD,
 * i18n-expert copy) can land independently.
 *
 * Public contract for Phase 2:
 *   - `mountRevolver(scene, room, hudContainer, locale, audioBed, lighting)`
 *     returns a `RevolverHandle`.
 *   - The handle's `dispose()` releases input listeners, animation mixer,
 *     HUD DOM, and removes the revolver Group from the scene graph.
 *   - `getEmptyClickCount()` exposes the lobby progression counter so the
 *     scene's lighting hook can dim per `DARKEN_CURVE_PER_CLICK[N]`.
 *   - `getState()` returns the current FSM state for diagnostic/debug use
 *     (not for tight coupling — Phase 2 should observe via events, not poll).
 *
 * Phase 1 visible behaviour: the revolver Group is added to the room and
 * the HUD overlay is mounted with `.is-visible` applied. No animations
 * play, no input is connected to the FSM, no audio cues fire.
 */

import type { Group, Scene } from 'three';
import type { AudioBedHandle } from '../audio/audio-bed';
import type { BulbLightHandle } from '../lighting';
import type { Locale } from '../../i18n/strings';
import { mountHud, type HudHandle } from './hud/hud';
import { attachInput, type InputHandle } from './revolver-input';
import { mountRevolverMesh, type RevolverMeshHandle } from './revolver-mount';
import type { RevolverState } from './revolver-state';

/** Public handle returned from mountRevolver. */
export interface RevolverHandle {
  /** Tear down: remove from scene, dispose HUD, abort input listeners. */
  dispose: () => void;
  /** Empty-click counter — drives the progressive darkening curve. */
  getEmptyClickCount: () => number;
  /** Current FSM state. Phase 1 always returns `{ kind: 'idle' }`. */
  getState: () => RevolverState;
}

/** Internal bag of allocated resources, scoped to disposeAll. */
interface RevolverResources {
  readonly scene: Scene;
  readonly mesh: RevolverMeshHandle;
  readonly hud: HudHandle;
  readonly input: InputHandle;
  readonly state: { value: RevolverState; emptyClicks: number };
}

/**
 * Mount the revolver subsystem.
 *
 * @param scene - Three.js scene root. The revolver Group is added here.
 * @param room - The placeholder-room Group. Phase 1 unused; Phase 2 may
 *   reparent the revolver to the room for transform-relative positioning.
 * @param hudContainer - The `#hud-overlay` DIV (see scene-mount.ts).
 * @param locale - User locale, forwarded to HUD children for copy.
 * @param audioBed - AudioBed handle; Phase 2 fires empty-click cues here.
 * @param lighting - BulbLightHandle; Phase 2 darkens per `DARKEN_CURVE_PER_CLICK`.
 *
 * Underscored parameters match eslint `argsIgnorePattern: '^_'` — they are
 * required by the Phase 2 contract but unused by the Phase 1 stub.
 */
export function mountRevolver(
  scene: Scene,
  _room: Group,
  hudContainer: HTMLElement,
  locale: Locale,
  _audioBed: AudioBedHandle,
  _lighting: BulbLightHandle,
): RevolverHandle {
  const resources = allocateResources(scene, hudContainer, locale);
  resources.hud.setVisible(true);

  return {
    dispose: (): void => disposeRevolver(resources),
    getEmptyClickCount: (): number => resources.state.emptyClicks,
    getState: (): RevolverState => resources.state.value,
  };
}

/**
 * Allocate every revolver-subsystem resource. Extracted from mountRevolver
 * so the function body stays under the 50-line ceiling.
 */
function allocateResources(
  scene: Scene,
  hudContainer: HTMLElement,
  locale: Locale,
): RevolverResources {
  const mesh = mountRevolverMesh();
  scene.add(mesh.group);
  const hud = mountHud(hudContainer, locale);

  // Phase 1 stub: input is wired to no-ops. Phase 2 kraken-revolver replaces
  // the callbacks with FSM transitions. The body shell uses `document.body`
  // as the listener target because the scene canvas is inside an overlay
  // that may not be hit-testable; Phase 2 may switch to the canvas.
  const target = document.body;
  const input = attachInput(target, (): void => undefined, (): void => undefined);

  const state = {
    value: { kind: 'idle' } as RevolverState,
    emptyClicks: 0,
  };
  return { scene, mesh, hud, input, state };
}

/** Reverse-allocation disposal of revolver resources. */
function disposeRevolver(resources: RevolverResources): void {
  resources.input.dispose();
  resources.hud.dispose();
  resources.scene.remove(resources.mesh.group);
  resources.mesh.dispose();
}
