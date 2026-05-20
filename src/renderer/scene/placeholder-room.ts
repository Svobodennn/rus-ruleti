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
 * Sprint 3 Phase 2B (kraken-loader) adds `createRoomFromGlbs`:
 *   - Takes a Map of preloaded `LoadedModelHandle` (from model-registry).
 *   - Instances each GLB (clone, scale, position, rotation per model-freeze).
 *   - Applies material color override per MATERIAL_COLOR_OVERRIDE_BY_KEY.
 *   - Optionally rewraps materials in the PS1 ShaderMaterial at 'high' tier
 *     for the 5 textured meshes (chair/radio/bottle/table/ashtray) — the
 *     revolver and lightbulb are exempted (revolver is the focal point,
 *     lightbulb is the light anchor).
 *   - Returns a Group that the scene composes alongside the floor/walls
 *     (those stay as primitive planes — the GLB pack doesn't cover them).
 *
 * The legacy `createPlaceholderRoom(factory, useGlbs=false)` path stays
 * intact as the diagnostic fallback per model-freeze §8.4.
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
import {
  MATERIAL_COLOR_OVERRIDE_BY_KEY,
  MODEL_POSITION_ASHTRAY,
  MODEL_POSITION_BOTTLE,
  MODEL_POSITION_CHAIR,
  MODEL_POSITION_RADIO,
  MODEL_POSITION_TABLE,
  MODEL_ROTATION_ASHTRAY,
  MODEL_ROTATION_BOTTLE,
  MODEL_ROTATION_CHAIR,
  MODEL_ROTATION_RADIO,
  MODEL_ROTATION_TABLE,
  MODEL_SCALE_ASHTRAY,
  MODEL_SCALE_BOTTLE,
  MODEL_SCALE_CHAIR,
  MODEL_SCALE_RADIO,
  MODEL_SCALE_TABLE,
} from '../../shared/scene-model-constants';
import type { Ps1MaterialFactory } from './shaders/ps1-material';
import type { LoadedModelHandle, ModelKey } from '../loader';

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

/** Default material factory — fallback when no factory is supplied. */
const defaultFactory: Ps1MaterialFactory = (baseColor: string): Material =>
  new MeshStandardMaterial({ color: baseColor });

/**
 * Build the placeholder room group (Sprint 1 cube fallback path).
 *
 * Kept intact as the diagnostic mode (`useGlbs=false`) per model-freeze §8.4.
 * The Phase 2B production path is `createRoomFromGlbs` below — scene/index.ts
 * picks which to mount based on whether the loader handed back GLBs.
 */
export function createPlaceholderRoom(
  factory: Ps1MaterialFactory = defaultFactory,
  useGlbs: boolean = false,
): Group {
  // The Phase 2B production path lives in createRoomFromGlbs. The cube path
  // remains as Sprint 1 + diagnostic fallback.
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

/* ------------------------------------------------------------------------ */
/* Sprint 1 cube primitives — diagnostic fallback                            */
/* ------------------------------------------------------------------------ */

function createTable(factory: Ps1MaterialFactory): Mesh {
  const geo = new BoxGeometry(1.4, 0.08, 0.9);
  const mesh = new Mesh(geo, factory(PALETTE.oak));
  mesh.name = PLACEHOLDER_MESH_NAMES.TABLE;
  mesh.position.set(0, 0.75, 0);
  return mesh;
}

function createChair(factory: Ps1MaterialFactory): Mesh {
  const geo = new BoxGeometry(0.5, 0.9, 0.45);
  const mesh = new Mesh(geo, factory(PALETTE.oak));
  mesh.name = PLACEHOLDER_MESH_NAMES.CHAIR;
  mesh.position.set(0, 0.45, -0.9);
  return mesh;
}

function createRadiator(factory: Ps1MaterialFactory): Mesh {
  const geo = new BoxGeometry(0.15, 1.1, 0.35);
  const mesh = new Mesh(geo, factory(PALETTE.rust));
  mesh.name = PLACEHOLDER_MESH_NAMES.RADIATOR;
  mesh.position.set(-1.9, 0.55, -0.3);
  return mesh;
}

function createRadio(factory: Ps1MaterialFactory): Mesh {
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

/* ------------------------------------------------------------------------ */
/* Sprint 3 Phase 2B — GLB instance branch                                  */
/* ------------------------------------------------------------------------ */

/**
 * Per-key placement record. Looked up via a small const map so the GLB
 * placement loop has zero branching on the per-model constants.
 */
interface GlbPlacement {
  readonly scale: number;
  readonly position: readonly [number, number, number];
  readonly rotation: readonly [number, number, number];
}

/** Placements for the 5 GLBs that live inside the room (revolver mounted separately). */
const ROOM_GLB_PLACEMENTS: Readonly<Record<RoomGlbKey, GlbPlacement>> = {
  table: { scale: MODEL_SCALE_TABLE, position: MODEL_POSITION_TABLE, rotation: MODEL_ROTATION_TABLE },
  chair: { scale: MODEL_SCALE_CHAIR, position: MODEL_POSITION_CHAIR, rotation: MODEL_ROTATION_CHAIR },
  radio: { scale: MODEL_SCALE_RADIO, position: MODEL_POSITION_RADIO, rotation: MODEL_ROTATION_RADIO },
  bottle: { scale: MODEL_SCALE_BOTTLE, position: MODEL_POSITION_BOTTLE, rotation: MODEL_ROTATION_BOTTLE },
  ashtray: { scale: MODEL_SCALE_ASHTRAY, position: MODEL_POSITION_ASHTRAY, rotation: MODEL_ROTATION_ASHTRAY },
} as const;

/** Subset of ModelKey that lives in the room (excludes revolver + lightbulb). */
export type RoomGlbKey = 'table' | 'chair' | 'radio' | 'bottle' | 'ashtray';

/** Iteration order for the GLB room — kept stable so dispose runs in reverse. */
const ROOM_GLB_KEYS: readonly RoomGlbKey[] = [
  'table', 'chair', 'radio', 'bottle', 'ashtray',
];

/**
 * Build the room from preloaded GLB handles.
 *
 * The `handles` map MUST contain every key the room expects (table, chair,
 * radio, bottle, ashtray) — call sites resolve this via `model-registry`
 * before calling. Missing keys cause that mesh to be skipped (graceful
 * degradation per model-freeze §8.1: one bad GLB doesn't blank the scene).
 *
 * Floor + walls + radiator stay as primitive planes/cubes (no GLB) — the
 * vendored pack doesn't cover them. Composing them as siblings keeps the
 * scene whole.
 */
export function createRoomFromGlbs(
  handles: ReadonlyMap<ModelKey, LoadedModelHandle>,
  factory: Ps1MaterialFactory = defaultFactory,
  activatePs1: boolean = false,
): Group {
  const room = new Group();
  room.name = 'placeholder-room';
  for (const key of ROOM_GLB_KEYS) {
    const handle = handles.get(key);
    if (handle === undefined) continue;
    const instance = instantiateRoomGlb(handle, key, factory, activatePs1);
    room.add(instance);
  }
  // Floor + walls + radiator stay as primitives (no GLB available).
  room.add(createRadiator(factory));
  room.add(createFloor(factory));
  room.add(createWalls(factory));
  return room;
}

/**
 * Clone a loaded GLB, apply placement transforms, override material color,
 * optionally replace materials with the PS1 ShaderMaterial at 'high' tier
 * (designer model-freeze §6 affine-UV activation list), and tag the instance
 * with the room mesh name so existing lookups (e.g. revolver-mount's "find
 * the table top") continue to work.
 */
function instantiateRoomGlb(
  handle: LoadedModelHandle,
  key: RoomGlbKey,
  factory: Ps1MaterialFactory,
  activatePs1: boolean,
): Group {
  const placement = ROOM_GLB_PLACEMENTS[key];
  const instance = handle.scene.clone(true);
  instance.scale.setScalar(placement.scale);
  instance.position.set(...placement.position);
  instance.rotation.set(...placement.rotation);
  instance.name = roomMeshNameFor(key);
  applyMaterialColorOverride(instance, key);
  if (activatePs1) {
    replaceGlbMaterialsWithPs1(instance, key, factory);
  }
  return instance;
}

/**
 * Replace every Mesh material on the cloned GLB with a fresh material from
 * the PS1 factory (high tier: ShaderMaterial w/ vertex snap; low/medium:
 * plain MeshStandardMaterial). Original materials are disposed before the
 * swap — leaving them in place would leak the GPU buffers.
 *
 * Designer model-freeze §6 activates PS1 affine-UV on these 5 GLB surfaces
 * at 'high' tier; revolver + lightbulb are exempted (focal point + light
 * anchor respectively, per designer §6 exemption list).
 */
function replaceGlbMaterialsWithPs1(
  instance: Group,
  key: ModelKey,
  factory: Ps1MaterialFactory,
): void {
  const hex = MATERIAL_COLOR_OVERRIDE_BY_KEY[key];
  instance.traverse((obj): void => {
    if (!(obj instanceof Mesh)) return;
    disposeMeshMaterial(obj);
    obj.material = factory(hex);
  });
}

/** Dispose the existing material (single or array) before replacing it. */
function disposeMeshMaterial(mesh: Mesh): void {
  const mat = mesh.material;
  if (Array.isArray(mat)) {
    for (const m of mat) m.dispose();
  } else {
    mat.dispose();
  }
}

/** Lookup the placeholder mesh name for a GLB key — preserves legacy lookups. */
function roomMeshNameFor(key: RoomGlbKey): string {
  switch (key) {
    case 'table':   return PLACEHOLDER_MESH_NAMES.TABLE;
    case 'chair':   return PLACEHOLDER_MESH_NAMES.CHAIR;
    case 'radio':   return PLACEHOLDER_MESH_NAMES.RADIO;
    case 'bottle':  return 'placeholder-bottle';
    case 'ashtray': return 'placeholder-ashtray';
  }
}

/**
 * Walk the cloned GLB and override every MeshStandardMaterial's `.color`
 * with the per-model hex from MATERIAL_COLOR_OVERRIDE_BY_KEY. Model-freeze
 * §2.1: the Poly Pizza CC0 albedos are too bright/colourful for the
 * brutalist cellar — the override darkens them to the curated palette.
 */
function applyMaterialColorOverride(instance: Group, key: ModelKey): void {
  const colorHex = MATERIAL_COLOR_OVERRIDE_BY_KEY[key];
  instance.traverse((obj): void => {
    if (!(obj instanceof Mesh)) return;
    const mat = obj.material;
    if (Array.isArray(mat)) {
      mat.forEach((m): void => overrideColorOnMaterial(m, colorHex));
    } else {
      overrideColorOnMaterial(mat, colorHex);
    }
  });
}

/** Override the `.color` on a single material if it carries one. */
function overrideColorOnMaterial(mat: unknown, hex: string): void {
  if (!(mat instanceof MeshStandardMaterial)) return;
  mat.color.set(hex);
}
