/**
 * Revolver placeholder mesh + animation rig — Phase 1 STUB.
 *
 * PLAN §6 calls for a low-poly (3-5k tris) GLB with hammer/cylinder/trigger
 * as separate meshes. Sprint 1 had nothing here; Sprint 3 will load the real
 * GLB. Phase 1 (this file) creates a primitive placeholder Group so the
 * existing scene composition root in `scene/index.ts` has something to add
 * to the room — specifically, a labelled `Group` named `placeholder-
 * revolver` positioned at the table's reading-eye spot.
 *
 * Phase 1 deliberately ships an EMPTY Group. The Sprint 1 placeholder-room
 * already has the table + bulb + chair; adding a primitive revolver shape
 * here risks visual collision with the Phase 2A designer's atmosphere
 * tuning. Better to ship an empty Group with the right name and position so
 * the scene graph has the slot wired without the visual artefact. Phase 2
 * kraken-revolver fills the Group with primitive geometry (sphere for the
 * cylinder, box for the body) and Sprint 3 swaps in the GLB.
 *
 * Phase 2 ownership:
 *   - kraken-revolver: replace empty Group with primitive hammer/cylinder
 *     placeholders; instantiate AnimationMixer for the five clips.
 *   - designer (2A): may suggest revolver origin if the camera framing
 *     recommendation in atmosphere-direction.md §3 is ratified.
 */

import { Group } from 'three';
import { mountAnimation, type AnimHandle } from './revolver-anim';

/** Mesh + group name used by Sprint 3 GLB loader to swap in the real model. */
export const REVOLVER_MESH_NAME = 'placeholder-revolver';

/**
 * World-space anchor for the revolver. The table top sits at y=0.75 with
 * a 0.08 height; the revolver lives just above its surface. Centered on
 * x=0 (PLAN §2: "revolver (orta, ışıkta)") with a small +z offset toward
 * the camera so the user reads it as "in reach" not "behind the table".
 *
 * Phase 2 / Sprint 3 may tune; the constants are declared here (not the
 * SSOT) because they describe geometry layout, not gameplay tuning, and
 * never appear in user-facing code.
 */
const REVOLVER_POS_X = 0;
const REVOLVER_POS_Y = 0.79;
const REVOLVER_POS_Z = 0.1;

/** Public handle returned from mountRevolverMesh. */
export interface RevolverMeshHandle {
  /** The placeholder Group. Sprint 3 GLB loader swaps the children. */
  readonly group: Group;
  /** AnimationMixer wrapper — stub in Phase 1, real in Phase 2. */
  readonly animation: AnimHandle;
  /** Tear down: clear group children + dispose animation rig. */
  dispose: () => void;
}

/**
 * Build the placeholder revolver mesh + animation rig.
 *
 * Returns a Group containing zero children (Phase 1) and a stub AnimHandle.
 * The caller (revolver/index.ts) adds the group to the scene's table /
 * room subtree.
 */
export function mountRevolverMesh(): RevolverMeshHandle {
  const group = new Group();
  group.name = REVOLVER_MESH_NAME;
  group.position.set(REVOLVER_POS_X, REVOLVER_POS_Y, REVOLVER_POS_Z);

  const animation = mountAnimation(group);

  const dispose = (): void => {
    animation.dispose();
    // The group itself is held by the scene graph — the scene composer
    // removes it via `scene.remove(group)` during disposeAll. We only clear
    // the children here so any future primitive meshes get released too.
    while (group.children.length > 0) {
      const child = group.children[group.children.length - 1];
      if (child !== undefined) {
        group.remove(child);
      }
    }
  };

  return { group, animation, dispose };
}
