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
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
} from 'three';
import {
  MATERIAL_COLOR_OVERRIDE_BY_KEY,
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
  REVOLVER_TILT_Y_RAD,
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
  positionOnTable(group, room);
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

/** Apply tilt + designer-authored revolver scale/rotation to the wrapper group. */
function applyRevolverGroupTransform(group: Group): void {
  group.rotation.y = REVOLVER_TILT_Y_RAD + MODEL_ROTATION_REVOLVER[1];
  group.rotation.x = MODEL_ROTATION_REVOLVER[0];
  group.rotation.z = MODEL_ROTATION_REVOLVER[2];
  group.scale.setScalar(MODEL_SCALE_REVOLVER);
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
 * override (MATERIAL_COLOR_OVERRIDE_BY_KEY['revolver'] = '#1a1816' — gunmetal
 * just above oak). Mirrors placeholder-room.ts's override on the room GLBs.
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

