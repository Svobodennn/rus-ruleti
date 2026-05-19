/**
 * Placeholder room — cubes only.
 *
 * Sprint 1 scope: the basement geometry is roughed in with axis-aligned
 * BoxGeometry stand-ins so the lighting, post-FX and shader work in Phase 2
 * has something to react against. Sprint 3 replaces every mesh here with a
 * GLB loaded asset (revolver, table, radio, …).
 *
 * Every mesh is .name'd with a stable identifier so the Sprint 3 GLB swap
 * can target meshes by name without rewriting this file's structure.
 */

import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
} from 'three';
import { PALETTE } from '../../shared/scene-constants';

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
 * Build the placeholder room group.
 *
 * Geometry is centered at origin; lighting in lighting.ts hangs above. The
 * floor is at y=0 and the camera (CAMERA.posY=1.6) sits at standing height.
 */
export function createPlaceholderRoom(): Group {
  const room = new Group();
  room.name = 'placeholder-room';
  room.add(createTable());
  room.add(createChair());
  room.add(createRadiator());
  room.add(createRadio());
  room.add(createFloor());
  room.add(createWalls());
  return room;
}

function createTable(): Mesh {
  // Oak table — center of the room, low and wide. Revolver lives on top.
  const geo = new BoxGeometry(1.4, 0.08, 0.9);
  const mat = new MeshStandardMaterial({ color: PALETTE.oak });
  const mesh = new Mesh(geo, mat);
  mesh.name = PLACEHOLDER_MESH_NAMES.TABLE;
  mesh.position.set(0, 0.75, 0);
  return mesh;
}

function createChair(): Mesh {
  // Single chair, just behind the table — folded shinel cloak hint.
  const geo = new BoxGeometry(0.5, 0.9, 0.45);
  const mat = new MeshStandardMaterial({ color: PALETTE.oak });
  const mesh = new Mesh(geo, mat);
  mesh.name = PLACEHOLDER_MESH_NAMES.CHAIR;
  mesh.position.set(0, 0.45, -0.9);
  return mesh;
}

function createRadiator(): Mesh {
  // Rust radiator against the left wall, vertical.
  const geo = new BoxGeometry(0.15, 1.1, 0.35);
  const mat = new MeshStandardMaterial({ color: PALETTE.rust });
  const mesh = new Mesh(geo, mat);
  mesh.name = PLACEHOLDER_MESH_NAMES.RADIATOR;
  mesh.position.set(-1.9, 0.55, -0.3);
  return mesh;
}

function createRadio(): Mesh {
  // Lampovaya radio — corner cube. Sprint 3 replaces with VEF/Rekord GLB.
  const geo = new BoxGeometry(0.35, 0.2, 0.2);
  const mat = new MeshStandardMaterial({ color: PALETTE.rust });
  const mesh = new Mesh(geo, mat);
  mesh.name = PLACEHOLDER_MESH_NAMES.RADIO;
  mesh.position.set(1.6, 0.1, -1.2);
  return mesh;
}

function createFloor(): Mesh {
  const geo = new PlaneGeometry(6, 6);
  const mat = new MeshStandardMaterial({ color: PALETTE.shadow });
  const mesh = new Mesh(geo, mat);
  mesh.name = PLACEHOLDER_MESH_NAMES.FLOOR;
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0;
  return mesh;
}

/** Three walls as a single group so room creation stays simple. */
function createWalls(): Group {
  const wallsGroup = new Group();
  wallsGroup.name = 'placeholder-walls';
  wallsGroup.add(createBackWall());
  wallsGroup.add(createSideWall(-3, PLACEHOLDER_MESH_NAMES.WALL_LEFT, true));
  wallsGroup.add(createSideWall(3, PLACEHOLDER_MESH_NAMES.WALL_RIGHT, false));
  return wallsGroup;
}

function createBackWall(): Mesh {
  const geo = new PlaneGeometry(6, 3);
  const mat = new MeshStandardMaterial({ color: PALETTE.oak });
  const mesh = new Mesh(geo, mat);
  mesh.name = PLACEHOLDER_MESH_NAMES.WALL_BACK;
  mesh.position.set(0, 1.5, -3);
  return mesh;
}

function createSideWall(x: number, name: string, isLeft: boolean): Mesh {
  const geo = new PlaneGeometry(6, 3);
  const mat = new MeshStandardMaterial({ color: PALETTE.oak });
  const mesh = new Mesh(geo, mat);
  mesh.name = name;
  mesh.position.set(x, 1.5, 0);
  mesh.rotation.y = isLeft ? Math.PI / 2 : -Math.PI / 2;
  return mesh;
}
