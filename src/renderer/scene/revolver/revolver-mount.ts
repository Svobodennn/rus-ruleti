/**
 * Revolver placeholder mesh + animation rig.
 *
 * Sprint 3 model freeze: replace with `revolver.glb` (low-poly 3-5k tris,
 * Sketchfab CC0 base) + Blender bone rig. The Sprint 2 primitive is
 * **anim-compatible**: hammer rotates around its own origin, cylinder
 * rotates around the body's long axis, the body itself is a child of the
 * placeholder Group so kick recoil applies to the whole prop. The named-
 * child contract (`revolver-body`, `-grip`, `-cylinder`, `-hammer`) survives
 * the GLB swap; Sprint 3 just changes the geometry providers.
 *
 * PLAN §6 calls for a low-poly (3-5k tris) GLB with hammer/cylinder/trigger
 * as separate meshes. Sprint 1 shipped an empty Group; Sprint 2 fills it
 * with primitive cylinder/box stand-ins so the AnimationMixer + FSM have
 * something visible to animate. Sprint 3 swaps in the real model.
 *
 * Layout (model-space, origin at revolver's centre of mass):
 *   - body: x-aligned cylinder, the bulk of the prop.
 *   - grip: box at -x (handle end).
 *   - cylinder (chamber): smaller cylinder, axis aligned with body's x.
 *     Rotates around body x for the spin animation.
 *   - hammer: small box at +y +z (back-top), rotates around its own z to
 *     simulate the cock motion.
 *
 * Group is tilted ~15° around y so the cylinder rotation is camera-visible
 * (otherwise spin would be edge-on and invisible).
 */

import {
  Box3,
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from 'three';
import { PALETTE } from '../../../shared/scene-constants';
import { mountAnimation, type AnimHandle } from './revolver-anim';

/** Mesh + group name used by Sprint 3 GLB loader to swap in the real model. */
export const REVOLVER_MESH_NAME = 'revolver-placeholder';

/** Stable child names — anim layer looks them up via group.getObjectByName. */
export const REVOLVER_PART_NAMES = {
  BODY: 'revolver-body',
  GRIP: 'revolver-grip',
  CYLINDER: 'revolver-cylinder',
  HAMMER: 'revolver-hammer',
} as const;

/** Y-axis tilt so the cylinder rotation is visible from the static camera. */
const REVOLVER_TILT_Y_RAD = (15 * Math.PI) / 180;

/** Dark-steel material colour — slightly cooler than oak so it reads as metal. */
const REVOLVER_STEEL = '#2a2622';

/** Geometry dimensions — tuned to sit on the placeholder table. */
const BODY_LENGTH = 0.18;
const BODY_RADIUS = 0.02;
const GRIP_WIDTH = 0.06;
const GRIP_HEIGHT = 0.05;
const GRIP_DEPTH = 0.03;
const CYL_LENGTH = 0.06;
const CYL_RADIUS = 0.035;
const HAMMER_SIZE = 0.02;

/** Public handle returned from mountRevolverMesh. */
export interface RevolverMeshHandle {
  /** The placeholder Group. Sprint 3 GLB loader swaps the children. */
  readonly group: Group;
  /** AnimationMixer wrapper. */
  readonly animation: AnimHandle;
  /** Tear down: clear group children + dispose animation rig. */
  dispose: () => void;
}

/**
 * Build the placeholder revolver mesh + animation rig.
 *
 * Reads the table mesh's world position via the supplied room Group so the
 * revolver lands on the table top. Falls back to a sensible default (table
 * at y=0.79) when the table mesh is missing — useful for unit-test fixtures
 * that pass an empty Group.
 *
 * TODO Sprint 3 Phase 2B GLB swap (kraken-revolver):
 *   1. Load revolver.glb via `modelRegistry.load('revolver')` from
 *      `../../loader`. The handle's Group becomes the new mesh root.
 *   2. Discover named pivots:
 *      `group.getObjectByName(MODEL_REVOLVER_HAMMER_PIVOT_KEY)`,
 *      `... _CYLINDER_PIVOT_KEY`,
 *      `... _BODY_PIVOT_KEY`
 *      (constants in `scene-model-constants.ts`).
 *      - If found: use directly as rotation pivots for AnimationMixer
 *        clip targets (cock, spin, fall, kick).
 *      - If NOT FOUND (monolithic mesh — Poly Pizza Quaternius revolver
 *        is suspected monolithic; verify by inspecting `group.children`
 *        after load): wrap the loaded mesh in three Object3D pivots
 *        programmatically. Sketch:
 *
 *           const hammerPivot = new Object3D();
 *           hammerPivot.name = MODEL_REVOLVER_HAMMER_PIVOT_KEY;
 *           hammerPivot.position.copy(approxHammerLocalOrigin);
 *           hammerPivot.add(hammerMeshExtract);
 *           group.add(hammerPivot);
 *
 *        The five procedural AnimationClips currently target
 *        `${REVOLVER_PART_NAMES.HAMMER}.rotation[z]` etc.; the named-child
 *        contract carries through — `revolver-anim.ts:buildClipMap()`
 *        finds the pivots via `getObjectByName` regardless of whether
 *        they were authored as separate meshes or wrapped programmatically.
 *   3. Rebind the 5 procedural clips (idle / cock / spin / fall / kick) to
 *      the new Object3Ds; verify clips animate correctly with the new GLB
 *      structure (designer revolver-direction.md §6 anti-cause-and-effect
 *      spin remains: cylinder ends at SPIN_TURNS · 2π modulo 2π).
 *   4. Apply MODEL_SCALE_REVOLVER, MODEL_POSITION_REVOLVER (over the table
 *      anchor — these placements may compose, designer Phase 2A decides),
 *      MODEL_ROTATION_REVOLVER.
 *
 * Fallback path: if step 2 cannot establish the three rotation pivots
 * (mesh is truly monolithic AND programmatic pivot extraction fails because
 * the model's geometry is fused), keep the Sprint 2 primitive Group and
 * file a PLAN.md §18 ticket (TH-S3-NN) for Sprint 4 — kick/recoil tests
 * can run against the primitive rig until the GLB swap unblocks.
 *
 * Phase 1 (scaffold) preserves the Sprint 2 primitive implementation
 * unchanged below this comment block.
 */
export function mountRevolverMesh(room: Group): RevolverMeshHandle {
  const group = buildRevolverGroup();
  positionOnTable(group, room);
  const animation = mountAnimation(group);

  const dispose = (): void => {
    animation.dispose();
    disposeChildren(group);
  };

  return { group, animation, dispose };
}

/** Build the Group with all four named child meshes. */
function buildRevolverGroup(): Group {
  const group = new Group();
  group.name = REVOLVER_MESH_NAME;
  group.rotation.y = REVOLVER_TILT_Y_RAD;
  group.add(buildBody());
  group.add(buildGrip());
  group.add(buildCylinder());
  group.add(buildHammer());
  return group;
}

/** Body — long thin cylinder, x-axis. */
function buildBody(): Mesh {
  const geo = new CylinderGeometry(BODY_RADIUS, BODY_RADIUS, BODY_LENGTH, 16);
  // CylinderGeometry's default axis is y; rotate 90° so its long axis is x.
  geo.rotateZ(Math.PI / 2);
  const mat = new MeshStandardMaterial({ color: REVOLVER_STEEL });
  const mesh = new Mesh(geo, mat);
  mesh.name = REVOLVER_PART_NAMES.BODY;
  return mesh;
}

/** Grip — box at one end of the body. */
function buildGrip(): Mesh {
  const geo = new BoxGeometry(GRIP_WIDTH, GRIP_HEIGHT, GRIP_DEPTH);
  const mat = new MeshStandardMaterial({ color: PALETTE.rust });
  const mesh = new Mesh(geo, mat);
  mesh.name = REVOLVER_PART_NAMES.GRIP;
  // Sit at the back end of the body, dropping slightly below for the curve.
  mesh.position.set(-BODY_LENGTH / 2, -GRIP_HEIGHT / 2, 0);
  return mesh;
}

/** Cylinder (chamber) — smaller cylinder perpendicular to body. */
function buildCylinder(): Mesh {
  const geo = new CylinderGeometry(CYL_RADIUS, CYL_RADIUS, CYL_LENGTH, 12);
  // The cylinder's local y is its rotation axis. The anim layer rotates
  // local.x so the visible y-axis cylinder face spins — visually matches a
  // real revolver chamber. Rotate so its long axis is x like the body.
  geo.rotateZ(Math.PI / 2);
  const mat = new MeshStandardMaterial({ color: REVOLVER_STEEL });
  const mesh = new Mesh(geo, mat);
  mesh.name = REVOLVER_PART_NAMES.CYLINDER;
  // Mid-body position, slightly above the body axis so it's visible.
  mesh.position.set(0, BODY_RADIUS + CYL_RADIUS * 0.5, 0);
  return mesh;
}

/** Hammer — small box at the back-top, rotates -30° on cock. */
function buildHammer(): Mesh {
  const geo = new BoxGeometry(HAMMER_SIZE, HAMMER_SIZE, HAMMER_SIZE);
  const mat = new MeshStandardMaterial({ color: REVOLVER_STEEL });
  const mesh = new Mesh(geo, mat);
  mesh.name = REVOLVER_PART_NAMES.HAMMER;
  mesh.position.set(-BODY_LENGTH / 2 + HAMMER_SIZE, BODY_RADIUS * 2, 0);
  return mesh;
}

/**
 * Place the revolver on the placeholder table's top surface.
 *
 * Reads the table mesh's bounding box to find its top-y, then anchors the
 * revolver group there with a small +z offset toward the camera so the user
 * reads "in reach" rather than "behind the table".
 */
function positionOnTable(group: Group, room: Group): void {
  const table = room.getObjectByName('placeholder-table');
  const anchor = computeTableTopAnchor(table);
  group.position.copy(anchor);
}

/** Compute the world position of the table top centre. */
function computeTableTopAnchor(
  table: ReturnType<Group['getObjectByName']>,
): Vector3 {
  // Defaults match the Sprint 1 placeholder-room table layout. Used when
  // the table mesh hasn't been added yet (e.g. test harness builds a bare
  // Group and calls mountRevolverMesh).
  const defaults = new Vector3(0, 0.79, 0.1);
  if (table === undefined) {
    return defaults;
  }
  const box = new Box3().setFromObject(table);
  return new Vector3(
    (box.min.x + box.max.x) / 2,
    box.max.y + 0.02,
    (box.min.z + box.max.z) / 2 + 0.1,
  );
}

/** Walk the group's children, disposing geometry + material on each Mesh. */
function disposeChildren(group: Group): void {
  while (group.children.length > 0) {
    const child = group.children[group.children.length - 1];
    if (child === undefined) break;
    if (child instanceof Mesh) {
      child.geometry.dispose();
      const mat = child.material;
      if (Array.isArray(mat)) {
        for (const m of mat) m.dispose();
      } else {
        mat.dispose();
      }
    }
    group.remove(child);
  }
}

/* ------------------------------------------------------------------------ */
/* Sprint 3 Phase 2B — GLB mount path shared helpers                        */
/* ------------------------------------------------------------------------ */

/**
 * Expose `positionOnTable` so the sibling `revolver-mount-glb.ts` can reuse
 * the table-top anchor logic without duplicating Box3 math.
 */
export { positionOnTable };

/**
 * Tilt constant — exported so the GLB mount module can match the Sprint 2
 * visibility tilt without re-deriving the 15° rotation.
 */
export { REVOLVER_TILT_Y_RAD };
