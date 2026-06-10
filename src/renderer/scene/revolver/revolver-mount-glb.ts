/**
 * GLB-based revolver mount — Sprint 3 Phase 2B kraken-loader.
 *
 * Sibling of `revolver-mount.ts` (which still owns the Sprint 2 primitive
 * cube/cylinder path). Split out per 400-line file ceiling.
 *
 * Two activation paths per designer `revolver-direction.md` §9:
 *   1. **Named-children path**: if the GLB exposes Hammer / Cylinder / Body
 *      Object3Ds (Blender-rigged or hand-named, lookup keys live in
 *      `scene-model-constants.ts`), use them directly as AnimationMixer
 *      rotation targets. Best case — the rigged animation reads
 *      anatomically correct.
 *   2. **Whole-revolver fallback** (§9.3/§9.4): the GLB is monolithic. We
 *      wrap the loaded mesh in three nested Object3D pivots
 *      (Body > Cylinder > Hammer > mesh) named to match REVOLVER_PART_NAMES.
 *      The Sprint 2 `revolver-anim.ts` clips look up by name via
 *      `getObjectByName`, so the existing clip property paths
 *      (`Hammer.rotation[z]`, `Cylinder.rotation[x]`, root `.rotation[z]`)
 *      bind to these new pivots without touching the anim layer.
 *      - Rotating Hammer rotates the visible mesh (cock visual).
 *      - Rotating Cylinder rotates Hammer + mesh (spin = whole revolver
 *        spinning on the table — designer §9.3 cinematic alt, RNG
 *        visibility contract preserved because spin ends at original angle).
 *      - Rotating root .z absorbs the kick recoil.
 *
 * The chosen path is recorded on `document.body.dataset['revolverMount']`
 * for QA visibility (console banned per lint).
 */

import {
  Box3,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  Vector3,
} from 'three';
import {
  MATERIAL_COLOR_OVERRIDE_BY_KEY,
  MODEL_REVOLVER_AZIMUTH_RAD,
  MODEL_REVOLVER_BODY_PIVOT_KEY,
  MODEL_REVOLVER_CYLINDER_PIVOT_KEY,
  MODEL_REVOLVER_HAMMER_PIVOT_KEY,
  MODEL_ROTATION_REVOLVER,
  MODEL_SCALE_REVOLVER,
} from '../../../shared/scene-model-constants';
import type { LoadedModelHandle } from '../../loader';
import { mountAnimation } from './revolver-anim';
import type { RevolverMeshHandle } from './revolver-mount';
import {
  REVOLVER_MESH_NAME,
  REVOLVER_PART_NAMES,
  positionOnTable,
} from './revolver-mount';

/**
 * Build the revolver mesh handle from a preloaded GLB. Same public shape as
 * `mountRevolverMesh(room)` so `revolver/index.ts:allocateResources` can
 * call either depending on whether the GLB loaded.
 */
export function mountRevolverMeshFromGlb(
  room: Group,
  handle: LoadedModelHandle,
): RevolverMeshHandle {
  const instance = handle.scene.clone(true);
  applyRevolverGlbMaterial(instance);
  const group = wrapGlbForAnimation(instance);
  recenterCylinderForSpin(group);
  positionOnTable(group, room);
  restOnTableSurface(group);
  const animation = mountAnimation(group);

  const dispose = (): void => {
    animation.dispose();
    disposeGlbHierarchy(group);
  };

  return { group, animation, dispose };
}

/**
 * Discover named pivots (Blender-rigged path) OR wrap the monolithic mesh.
 *
 * Returns a wrapper Group with:
 *   - `rotation.y = REVOLVER_TILT_Y_RAD + MODEL_ROTATION_REVOLVER[1]` so the
 *     visibility tilt and the designer's barrel orientation compose.
 *   - `scale.setScalar(MODEL_SCALE_REVOLVER)` — Quaternius asset is ~28cm,
 *     designer's 0.9 brings it to ~25cm Nagant feel.
 *
 * The named-children path renames the discovered Object3Ds to the Sprint 2
 * REVOLVER_PART_NAMES constants so `revolver-anim.ts:getObjectByName`
 * lookups bind without modification.
 */
function wrapGlbForAnimation(instance: Group): Group {
  const group = new Group();
  group.name = REVOLVER_MESH_NAME;
  applyRevolverGroupTransform(group);

  const hammer = instance.getObjectByName(MODEL_REVOLVER_HAMMER_PIVOT_KEY);
  const cylinder = instance.getObjectByName(MODEL_REVOLVER_CYLINDER_PIVOT_KEY);
  const body = instance.getObjectByName(MODEL_REVOLVER_BODY_PIVOT_KEY);

  if (hammer !== undefined && cylinder !== undefined && body !== undefined) {
    aliasNamedPivots(hammer, cylinder, body);
    group.add(instance);
    document.body.dataset['revolverMount'] = 'named-pivots';
    return group;
  }
  wrapMonolithicMesh(group, instance);
  document.body.dataset['revolverMount'] = 'whole-revolver-fallback';
  return group;
}

/**
 * Orient + scale the wrapper group for the austincford Magnum's table pose.
 *
 * MODEL_ROTATION_REVOLVER is the FINAL Euler (no extra tilt added) — matched
 * 1:1 against the original Quaternius revolver's pose via an offscreen render
 * (gun flat on its side, barrel right + slightly toward camera, grip lower-left).
 * Scale per MODEL_SCALE_REVOLVER (6.14, effective-bbox matched to the prior
 * on-table footprint).
 */
function applyRevolverGroupTransform(group: Group): void {
  group.rotation.set(
    MODEL_ROTATION_REVOLVER[0],
    MODEL_ROTATION_REVOLVER[1],
    MODEL_ROTATION_REVOLVER[2],
  );
  // Clean turntable spin (world vertical axis) applied AFTER the flat-lay Euler
  // above, so the muzzle can be aimed without tipping the gun upright. 0 = no
  // change (current pose). See MODEL_REVOLVER_AZIMUTH_RAD JSDoc.
  group.rotateOnWorldAxis(new Vector3(0, 1, 0), MODEL_REVOLVER_AZIMUTH_RAD);
  group.scale.setScalar(MODEL_SCALE_REVOLVER);
}

/**
 * Re-pivot the cylinder so the spin clip rotates it IN PLACE and ABOUT THE
 * DRUM'S TRUE AXIS (parallel to the barrel — not a flat "lazy-susan" tumble).
 *
 * The Magnum's Revolving_Cylinder node origin sits off the drum centre AND its
 * local axes don't line up with the gun's final table pose, so a naive
 * `.rotation[z]` spin reads as the drum turning on a tray. Two nested pivots
 * decouple ORIENTATION from SPIN:
 *
 *   - **outerPivot** — placed at the drum's world centre and oriented so its
 *     local +Z points along the drum's real cylindrical axis (derived from the
 *     6 chamber centres, which lie on a plane ⟂ to that axis). NOT animated, so
 *     the orientation it bakes in is never clobbered.
 *   - **innerPivot** (named REVOLVER_PART_NAMES.CYLINDER, the spin clip's
 *     target) — zero initial rotation, so the clip's absolute `.rotation[z]`
 *     keyframes are a CLEAN spin about outerPivot's +Z = the drum axis (no
 *     Euler coupling from a tilted x/y).
 *
 * The original cylinder node is `attach()`-ed into innerPivot (attach preserves
 * its world transform, so the drum + bullets + extractor stay put at rest) and
 * renamed so getObjectByName resolves the SPIN pivot.
 */
function recenterCylinderForSpin(group: Group): void {
  group.updateMatrixWorld(true);
  const cyl = group.getObjectByName(REVOLVER_PART_NAMES.CYLINDER);
  if (cyl === undefined || cyl.parent === null) {
    return;
  }
  const parent = cyl.parent;
  const drum = computeDrumGeometryWorld(cyl);
  const center = drum?.center ?? new Box3().setFromObject(cyl).getCenter(new Vector3());
  const drumAxis = drum?.axis ?? null;

  const outerPivot = new Group();
  parent.add(outerPivot);
  outerPivot.position.copy(parent.worldToLocal(center.clone()));
  if (drumAxis !== null) {
    parent.updateMatrixWorld(true);
    const parentWorldQuat = parent.getWorldQuaternion(new Quaternion());
    const worldQuat = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), drumAxis);
    outerPivot.quaternion.copy(parentWorldQuat.invert().multiply(worldQuat));
  }

  cyl.name = `${REVOLVER_PART_NAMES.CYLINDER}-inner`;
  const innerPivot = new Group();
  innerPivot.name = REVOLVER_PART_NAMES.CYLINDER;
  outerPivot.add(innerPivot);
  innerPivot.attach(cyl);
}

/**
 * Derive the drum's spin axis AND its radial rotation centre (both world space)
 * from the 6 chamber centres:
 *   - **center**: the centroid of the symmetric chamber ring lies ON the drum
 *     axis, so it is the radially-centred pivot point — the drum spins in place
 *     instead of orbiting (the world-aligned AABB centre is skewed off-axis by
 *     the tilted cylinder + the extractor rod, which made it wobble).
 *   - **axis**: the chambers ring a plane ⟂ to the cylindrical axis, so the
 *     plane normal (from three well-spread chamber centres) IS that axis.
 * Falls back to null if the bullet nodes are absent (caller keeps the AABB
 * centre + parent frame).
 */
function computeDrumGeometryWorld(cyl: Object3D): { axis: Vector3; center: Vector3 } | null {
  const centers: Vector3[] = [];
  for (let i = 1; i <= 6; i += 1) {
    const bullet = cyl.getObjectByName(`Bullet${i}`);
    if (bullet !== undefined) {
      centers.push(new Box3().setFromObject(bullet).getCenter(new Vector3()));
    }
  }
  if (centers.length < 3) {
    return null;
  }
  const center = centers
    .reduce((acc, c): Vector3 => acc.add(c), new Vector3())
    .divideScalar(centers.length);
  const step = Math.floor(centers.length / 3);
  const origin = centers[0] as Vector3;
  const spanA = (centers[step] as Vector3).clone().sub(origin);
  const spanB = (centers[step * 2] as Vector3).clone().sub(origin);
  const normal = spanA.cross(spanB);
  return normal.lengthSq() === 0 ? null : { axis: normal.normalize(), center };
}

/**
 * Lift the group so the gun's lowest point rests ON the table surface instead
 * of sinking through it (positionOnTable anchors the group ORIGIN at the table
 * top, but the gun geometry extends below the origin).
 */
function restOnTableSurface(group: Group): void {
  const anchorY = group.position.y;
  group.updateMatrixWorld(true);
  const minY = new Box3().setFromObject(group).min.y;
  group.position.y = anchorY + (anchorY - minY);
}

/**
 * Rename discovered GLB children to the Sprint 2 part-name convention. The
 * AnimationMixer's NumberKeyframeTrack property-path strings are baked at
 * clip-build time as `${name}.rotation[z]` — renaming the Object3D makes the
 * existing clips bind correctly without touching revolver-anim.ts.
 */
function aliasNamedPivots(hammer: Object3D, cylinder: Object3D, body: Object3D): void {
  hammer.name = REVOLVER_PART_NAMES.HAMMER;
  cylinder.name = REVOLVER_PART_NAMES.CYLINDER;
  body.name = REVOLVER_PART_NAMES.BODY;
}

/**
 * Monolithic fallback: nest Body > Cylinder > Hammer > mesh. Each pivot is
 * named to match REVOLVER_PART_NAMES so the Sprint 2 clip property paths bind.
 *
 * - Hammer rotation → rotates the visible mesh only (cock visual).
 * - Cylinder rotation → rotates Hammer + mesh (whole-revolver spin per §9.3).
 * - Body is currently an unused passthrough; reserved for Sprint 4+ extensions.
 */
function wrapMonolithicMesh(group: Group, instance: Group): void {
  const bodyPivot = new Object3D();
  bodyPivot.name = REVOLVER_PART_NAMES.BODY;
  const cylinderPivot = new Object3D();
  cylinderPivot.name = REVOLVER_PART_NAMES.CYLINDER;
  const hammerPivot = new Object3D();
  hammerPivot.name = REVOLVER_PART_NAMES.HAMMER;
  hammerPivot.add(instance);
  cylinderPivot.add(hammerPivot);
  bodyPivot.add(cylinderPivot);
  group.add(bodyPivot);
}

/**
 * Walk the cloned revolver GLB and apply the revolver's material color
 * override. Sprint 3 runtime calibration lifted the gunmetal hex from the
 * original near-shadow value to a mid-tone gunmetal that actually
 * reflects bulb-cone light back to camera (see
 * scene-model-constants.ts MATERIAL_COLOR_OVERRIDE_BY_KEY JSDoc for the
 * full per-key luminance band table). The constant export is the source
 * of truth — we read from MATERIAL_COLOR_OVERRIDE_BY_KEY['revolver']
 * rather than hardcoding the hex here. Mirrors placeholder-room.ts's
 * override on the room GLBs.
 */
function applyRevolverGlbMaterial(instance: Group): void {
  const hex = MATERIAL_COLOR_OVERRIDE_BY_KEY['revolver'];
  instance.traverse((obj): void => {
    if (!(obj instanceof Mesh)) return;
    const mat = obj.material;
    if (Array.isArray(mat)) {
      mat.forEach((m): void => overrideRevolverColor(m, hex));
    } else {
      overrideRevolverColor(mat, hex);
    }
  });
}

function overrideRevolverColor(mat: unknown, hex: string): void {
  if (!(mat instanceof MeshStandardMaterial)) return;
  mat.color.set(hex);
}

/**
 * Recursive dispose for the GLB-wrapped revolver tree. Walks the whole
 * subtree calling geometry + material .dispose() on every Mesh — handles the
 * named-pivot path (real meshes through the pivot tree) and the monolithic
 * wrap path (single mesh at the leaf) uniformly.
 */
function disposeGlbHierarchy(group: Group): void {
  group.traverse((obj): void => {
    if (!(obj instanceof Mesh)) return;
    obj.geometry.dispose();
    const mat = obj.material;
    if (Array.isArray(mat)) {
      for (const m of mat) m.dispose();
    } else {
      mat.dispose();
    }
  });
  while (group.children.length > 0) {
    const child = group.children[group.children.length - 1];
    if (child === undefined) break;
    group.remove(child);
  }
}

