/**
 * Placeholder room — cubes (Sprint 1) → GLB swap (Sprint 3 Phase 2B).
 *
 * Sprint 1 scope: the basement geometry is roughed in with axis-aligned
 * BoxGeometry stand-ins so the lighting, post-FX and shader work in Phase 2
 * has something to react against. Sprint 3 replaces every mesh here with a
 * GLB loaded asset (revolver, table, radio, …).
 *
 * Every mesh is .name'd with a stable identifier so the Sprint 3 GLB swap
 * can target meshes by name without rewriting this file's structure.
 *
 * Phase 2 (kraken-shader): each mesh material is now produced by a factory
 * passed in by the caller. On the `high` quality tier the factory returns
 * the PS1 vertex-snap ShaderMaterial; on `low`/`medium` it returns plain
 * MeshStandardMaterial. The room itself stays material-agnostic — it only
 * specifies "make me an oak-coloured material", not "use a PBR shader".
 *
 * Sprint 3 Phase 1 (scaffold) adds the `useGlbs` flag — the call site in
 * `scene/index.ts` opts in (defaults true). When `useGlbs === false`, the
 * Sprint 1 primitive-cube fallback fires; this is the diagnostic mode for
 * the case where a GLB load fails (e.g. CI without the asset present) or
 * a designer wants to A/B the placement against the GLBs.
 *
 * Sprint 3 Phase 2B (kraken-loader) will: read MODEL_POSITION_*,
 * MODEL_SCALE_*, MODEL_ROTATION_* from `scene-model-constants.ts`; call
 * `modelRegistry.load(key)` for each of `table | chair | radio | bottle |
 * ashtray | lightbulb` (revolver lives in revolver-mount.ts); set each
 * Group's transform; add to the room. The revolver is NOT placed here —
 * `revolver-mount.ts` owns that subtree.
 */

import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
} from 'three';
import type { Material } from 'three';
import { PALETTE } from '../../shared/scene-constants';
import type { Ps1MaterialFactory } from './shaders/ps1-material';

/** Stable names. Sprint 3 GLB swap looks up by these. */
export const PLACEHOLDER_MESH_NAMES = {
  TABLE: 'placeholder-table',
  CHAIR: 'placeholder-chair',
  RADIATOR: 'placeholder-radiator',
  RADIO: 'placeholder-radio',
  FLOOR: 'placeholder-floor',
  WALL_BACK: 'placeholder-wall-back',
  WALL_LEFT: 'placeholder-wall-left',
  WALL_RIGHT: 'placeholder-wall-right',
} as const;

/**
 * Default material factory — used when no factory is supplied. Mirrors
 * Phase 1's behaviour so the function stays back-compatible with any
 * test fixture or harness that calls createPlaceholderRoom() without args.
 */
const defaultFactory: Ps1MaterialFactory = (baseColor: string): Material =>
  new MeshStandardMaterial({ color: baseColor });

/**
 * Build the placeholder room group.
 *
 * Geometry is centered at origin; lighting in lighting.ts hangs above. The
 * floor is at y=0 and the camera (CAMERA.posY=1.6) sits at standing height.
 *
 * The `factory` parameter is optional for back-compat. When supplied (the
 * normal case in scene/index.ts) it controls which material class every
 * mesh receives, enabling the per-quality PS1 ShaderMaterial swap.
 *
 * Sprint 3 Phase 1 (scaffold): the `useGlbs` flag defaults to `true` for
 * forward-compat with Phase 2B. Phase 1 itself ignores the flag because
 * the GLB swap is not yet implemented; the cubes always render. Phase 2B
 * kraken-loader replaces the body of this function (or extracts a
 * `createPlaceholderRoomFromGlbs(factory)` sibling) so that:
 *
 *   useGlbs === true  → load + place table, chair, radio, bottle, ashtray,
 *                       lightbulb GLBs at MODEL_POSITION_* / MODEL_SCALE_* /
 *                       MODEL_ROTATION_*. Revolver NOT here (revolver-mount.ts).
 *   useGlbs === false → Sprint 1 primitive-cube fallback (current code path).
 *                       Diagnostic mode for "GLB failed to load" or A/B
 *                       placement debugging.
 *
 * TODO Sprint 3 Phase 2B (kraken-loader): replace primitive cubes with GLB
 * instances via model-registry.
 *   - table.glb at MODEL_POSITION_TABLE / MODEL_SCALE_TABLE / MODEL_ROTATION_TABLE
 *   - chair.glb at MODEL_POSITION_CHAIR / MODEL_SCALE_CHAIR / MODEL_ROTATION_CHAIR
 *   - radio.glb at MODEL_POSITION_RADIO / MODEL_SCALE_RADIO / MODEL_ROTATION_RADIO
 *   - bottle.glb at MODEL_POSITION_BOTTLE / MODEL_SCALE_BOTTLE / MODEL_ROTATION_BOTTLE
 *   - ashtray.glb at MODEL_POSITION_ASHTRAY / MODEL_SCALE_ASHTRAY / MODEL_ROTATION_ASHTRAY
 *   - lightbulb.glb at MODEL_POSITION_LIGHTBULB (replaces the primitive
 *     PointLight visual anchor — coordinate with lighting.ts BulbLightHandle
 *     attachment so the swaying bulb mesh follows the sodium PointLight pivot)
 *   - revolver NOT here (revolver-mount.ts owns it)
 *
 * Existing cube logic stays Phase 1; Phase 2B kraken-loader replaces.
 */
export function createPlaceholderRoom(
  factory: Ps1MaterialFactory = defaultFactory,
  useGlbs: boolean = true,
): Group {
  // Phase 1: GLB swap not yet implemented — always render primitive cubes.
  // Phase 2B will branch on `useGlbs` and load GLBs from model-registry
  // when true. We touch the flag here so eslint's no-unused-vars passes
  // and the parameter shape is locked at scaffold time.
  void useGlbs;
  const room = new Group();
  room.name = 'placeholder-room';
  room.add(createTable(factory));
  room.add(createChair(factory));
  room.add(createRadiator(factory));
  room.add(createRadio(factory));
  room.add(createFloor(factory));
  room.add(createWalls(factory));
  return room;
}

function createTable(factory: Ps1MaterialFactory): Mesh {
  // Oak table — center of the room, low and wide. Revolver lives on top.
  const geo = new BoxGeometry(1.4, 0.08, 0.9);
  const mesh = new Mesh(geo, factory(PALETTE.oak));
  mesh.name = PLACEHOLDER_MESH_NAMES.TABLE;
  mesh.position.set(0, 0.75, 0);
  return mesh;
}

function createChair(factory: Ps1MaterialFactory): Mesh {
  // Single chair, just behind the table — folded shinel cloak hint.
  const geo = new BoxGeometry(0.5, 0.9, 0.45);
  const mesh = new Mesh(geo, factory(PALETTE.oak));
  mesh.name = PLACEHOLDER_MESH_NAMES.CHAIR;
  mesh.position.set(0, 0.45, -0.9);
  return mesh;
}

function createRadiator(factory: Ps1MaterialFactory): Mesh {
  // Rust radiator against the left wall, vertical.
  const geo = new BoxGeometry(0.15, 1.1, 0.35);
  const mesh = new Mesh(geo, factory(PALETTE.rust));
  mesh.name = PLACEHOLDER_MESH_NAMES.RADIATOR;
  mesh.position.set(-1.9, 0.55, -0.3);
  return mesh;
}

function createRadio(factory: Ps1MaterialFactory): Mesh {
  // Lampovaya radio — corner cube. Sprint 3 replaces with VEF/Rekord GLB.
  const geo = new BoxGeometry(0.35, 0.2, 0.2);
  const mesh = new Mesh(geo, factory(PALETTE.rust));
  mesh.name = PLACEHOLDER_MESH_NAMES.RADIO;
  mesh.position.set(1.6, 0.1, -1.2);
  return mesh;
}

function createFloor(factory: Ps1MaterialFactory): Mesh {
  const geo = new PlaneGeometry(6, 6);
  const mesh = new Mesh(geo, factory(PALETTE.shadow));
  mesh.name = PLACEHOLDER_MESH_NAMES.FLOOR;
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0;
  return mesh;
}

/** Three walls as a single group so room creation stays simple. */
function createWalls(factory: Ps1MaterialFactory): Group {
  const wallsGroup = new Group();
  wallsGroup.name = 'placeholder-walls';
  wallsGroup.add(createBackWall(factory));
  wallsGroup.add(
    createSideWall(-3, PLACEHOLDER_MESH_NAMES.WALL_LEFT, true, factory),
  );
  wallsGroup.add(
    createSideWall(3, PLACEHOLDER_MESH_NAMES.WALL_RIGHT, false, factory),
  );
  return wallsGroup;
}

function createBackWall(factory: Ps1MaterialFactory): Mesh {
  const geo = new PlaneGeometry(6, 3);
  const mesh = new Mesh(geo, factory(PALETTE.oak));
  mesh.name = PLACEHOLDER_MESH_NAMES.WALL_BACK;
  mesh.position.set(0, 1.5, -3);
  return mesh;
}

function createSideWall(
  x: number,
  name: string,
  isLeft: boolean,
  factory: Ps1MaterialFactory,
): Mesh {
  const geo = new PlaneGeometry(6, 3);
  const mesh = new Mesh(geo, factory(PALETTE.oak));
  mesh.name = name;
  mesh.position.set(x, 1.5, 0);
  mesh.rotation.y = isLeft ? Math.PI / 2 : -Math.PI / 2;
  return mesh;
}
