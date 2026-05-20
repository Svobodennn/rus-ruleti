/**
 * Scene module public API.
 *
 * The renderer entry-point (src/renderer/main.ts) calls mountScene(container)
 * after the disclaimer Continue button is clicked. mountScene returns a
 * SceneHandle whose dispose() tears the whole subsystem down (renderer, audio
 * context, resize listener, render loop, frame logger).
 *
 * Phase 2 (kraken-shader) updates vs Phase 1:
 *   - createScene() now takes the active QualityLevel so it picks the
 *     correct FogExp2 density (designer atmosphere-direction.md §6.1).
 *   - createPlaceholderRoom() takes a Ps1MaterialFactory so the `high` tier
 *     receives the PS1 vertex-snap ShaderMaterial; `low`/`medium` get the
 *     plain MeshStandardMaterial.
 *   - createPostFxPipeline() takes initialQuality so it constructs the
 *     correct effect chain (scanline+grain / +chromatic / +dither) up-front.
 *   - The quality controller's onQualityChange fires `postFx.rebuild(next)`
 *     so runtime promote/demote swaps the post-fx chain. The fog density
 *     and the room materials also rebuild — geometry stays cheap so the
 *     cost is acceptable on tier transitions (a few times per session).
 *
 * Phase 2 collision boundaries:
 *   - This file owns the composition. Phase 2 agents extend the imported
 *     modules (lighting.ts, audio-bed.ts, post-fx/pipeline.ts, shaders/)
 *     and SHOULD NOT touch this file unless they need to add a new mount
 *     stage. Designer's palette tuning lives in scene-constants.ts.
 */

import type { Group, WebGLRenderer, PerspectiveCamera, Scene } from 'three';
import type { FrameStats } from './frame-logger';
import { createFrameLogger } from './frame-logger';
import type { FrameLoggerHandle } from './frame-logger';
import { createQualityController } from './quality';
import type { QualityControllerHandle } from './quality';
import type { QualityLevel } from '../../shared/scene-constants';
import {
  applyFogDensityForQuality,
  createRenderer,
  createScene,
  installResizeListener,
  startRenderLoop,
} from './scene';
import { createCamera, updateCameraAspect } from './camera';
import { createBulbLight } from './lighting';
import type { BulbLightHandle } from './lighting';
import { createPlaceholderRoom } from './placeholder-room';
import { createPostFxPipeline } from './post-fx/pipeline';
import type { PostFxHandle } from './post-fx/pipeline';
import {
  createPs1MaterialFactory,
  updatePs1MaterialAspect,
} from './shaders/ps1-material';
import { mountAudioBed } from './audio/audio-bed';
import type { AudioBedHandle } from './audio/audio-bed';
import { mountRevolver, type RevolverHandle } from './revolver';
import { resolveUserLocale } from '../i18n/strings';

/** Public handle returned from mountScene. */
export interface SceneHandle {
  /** Tear down everything created by mountScene. */
  dispose: () => Promise<void>;
  /** Current quality tier (build-time, possibly bumped at runtime). */
  getQualityLevel: () => QualityLevel;
  /** Latest frame-time stats, undefined if no flush yet. */
  getFrameStats: () => FrameStats | undefined;
  /**
   * Audio bed handle — exposed so Sprint 2+ can swap the Temnaya music slot
   * (`audio.setMusicTrack(howl)`) and react to phase transitions
   * (`audio.fadeOutAmbient(...)` on the trigger moment, etc.) without
   * needing to reach back through scene internals.
   */
  audio: AudioBedHandle;
  /**
   * Revolver subsystem handle — Sprint 2 Phase 1 wires this in as a stub.
   * Phase 2 kraken-revolver fleshes out FSM + animations + HUD updates.
   */
  revolver: RevolverHandle;
}

/** Internal bag of resources mountScene needs to track for disposal. */
interface InternalResources {
  readonly renderer: WebGLRenderer;
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly postFx: PostFxHandle;
  room: Group;
  readonly bulb: BulbLightHandle;
  readonly frameLogger: FrameLoggerHandle;
  readonly quality: QualityControllerHandle;
  readonly audioBed: AudioBedHandle;
  readonly revolver: RevolverHandle;
  stopLoop: () => void;
  disposeResize: () => void;
  disposeQualitySub: () => void;
}

/**
 * Mount the scene into a DOM container.
 *
 * Returns a handle whose dispose() releases all GPU + audio resources.
 * Must be awaited because audio context creation needs a user gesture
 * and AudioContext.resume() is async on Chromium.
 *
 * Sprint 2 Phase 1: the `hudContainer` and `bangOverlay` arguments are
 * created by scene-mount.ts as siblings of the scene container. They are
 * forwarded to mountRevolver (which mounts the HUD into hudContainer);
 * bangOverlay is stashed via dataset for Phase 2 frontend-dev to wire up.
 */
export async function mountScene(
  container: HTMLElement,
  hudContainer: HTMLElement,
  bangOverlay: HTMLElement,
): Promise<SceneHandle> {
  const resources = await buildResources(container, hudContainer);
  attachToContainer(container, resources.renderer);
  // Bang overlay is forwarded to Phase 2 frontend-dev via a dataset hook so
  // the scene composition root doesn't need to grow another resource slot
  // before Phase 2 actually uses it.
  bangOverlay.dataset['sceneMounted'] = 'true';

  return {
    dispose: async (): Promise<void> => disposeAll(container, resources),
    getQualityLevel: (): QualityLevel => resources.quality.getQualityLevel(),
    getFrameStats: (): FrameStats | undefined =>
      resources.frameLogger.getFrameStats(),
    audio: resources.audioBed,
    revolver: resources.revolver,
  };
}

/**
 * Allocate every scene resource. Extracted from mountScene to keep the
 * function bodies under the 50-line ceiling.
 */
async function buildResources(
  container: HTMLElement,
  hudContainer: HTMLElement,
): Promise<InternalResources> {
  const renderer = createRenderer(container);
  const camera = createCamera(container);
  const audioBed = await mountAudioBed();
  // 4s fade-in for the drone bed (PLAN §2 slow-burn intro).
  audioBed.fadeInAmbient();

  const { frameLogger, quality } = buildTelemetry();
  const initialQuality = quality.getQualityLevel();
  const { scene, room, bulb } = buildSceneGraph(container, initialQuality);
  const postFx = createPostFxPipeline(renderer, scene, camera, initialQuality);
  const revolver = mountRevolver(
    scene, room, hudContainer, resolveUserLocale(), audioBed, bulb,
  );

  const resources: InternalResources = {
    renderer, scene, camera, postFx, room, bulb,
    frameLogger, quality, audioBed, revolver,
    stopLoop: (): void => undefined,
    disposeResize: (): void => undefined,
    disposeQualitySub: (): void => undefined,
  };

  installRuntimeHooks(container, resources);
  return resources;
}

/**
 * Build the frame logger + quality controller pair. They reference each
 * other (logger reads quality at flush time, quality reads stats from
 * logger), so we instantiate them as a pair and return both.
 */
function buildTelemetry(): {
  frameLogger: FrameLoggerHandle;
  quality: QualityControllerHandle;
} {
  // eslint-disable-next-line prefer-const -- logger captures `quality` lazily.
  let quality: QualityControllerHandle;
  const frameLogger = createFrameLogger(
    () => quality.getQualityLevel(),
    (payload) => window.api.sendFrameStats(payload),
  );
  quality = createQualityController(frameLogger, {
    info: (message: string): void => {
      // DOM dataset is the only telemetry surface for tier-change log lines;
      // eslint no-console blocks console.* and the IPC channel is reserved
      // for frame:stats payloads.
      document.body.dataset['quality'] = message;
    },
  });
  return { frameLogger, quality };
}

/**
 * Build the Three.js scene graph: scene + placeholder room (PS1 material
 * factory baked in) + bulb light + ambient. Pure construction; no I/O,
 * no listeners. Caller wires the result into the post-fx composer.
 */
function buildSceneGraph(
  container: HTMLElement,
  quality: QualityLevel,
): { scene: Scene; room: Group; bulb: BulbLightHandle } {
  const aspect = container.clientWidth / Math.max(container.clientHeight, 1);
  const scene = createScene(quality);
  const factory = createPs1MaterialFactory(quality, aspect);
  const room = createPlaceholderRoom(factory);
  scene.add(room);
  const bulb = createBulbLight();
  scene.add(bulb.light);
  scene.add(bulb.bulbMesh);
  return { scene, room, bulb };
}

/**
 * Install resize listener, render loop, and quality-tier subscription.
 *
 * Mutates the resources bag to set the loop/resize/quality-sub disposers.
 * Extracted so buildResources stays under the 50-line ceiling.
 */
function installRuntimeHooks(
  container: HTMLElement,
  resources: InternalResources,
): void {
  resources.disposeResize = installResizeListener(
    container,
    resources.renderer,
    resources.postFx,
    (width, height) => {
      updateCameraAspect(resources.camera, width, height);
      updatePs1MaterialAspect(resources.room, width / Math.max(height, 1));
    },
  );

  resources.disposeQualitySub = resources.quality.onQualityChange(
    (next): void => onQualityChange(resources, next),
  );

  resources.stopLoop = startRenderLoop(
    resources.postFx,
    (elapsedSec, deltaMs) => {
      resources.bulb.update(elapsedSec);
      resources.frameLogger.markFrame(deltaMs);
      resources.quality.tick();
    },
  );
}

/**
 * Handle a runtime promote/demote.
 *
 * Three things change:
 *   1. The post-fx chain rebuilds (drops chromatic on demote-to-low, adds
 *      dither on promote-to-high, etc.).
 *   2. The fog density swaps to the new tier's value.
 *   3. The placeholder-room materials rebuild — on `high` we replace
 *      MeshStandardMaterial with the PS1 ShaderMaterial.
 */
function onQualityChange(
  resources: InternalResources,
  next: QualityLevel,
): void {
  resources.postFx.rebuild(next);
  applyFogDensityForQuality(resources.scene, next);
  rebuildRoomMaterials(resources, next);
}

/**
 * Recreate the placeholder-room with materials matching the new quality.
 *
 * The old group's geometries + materials are released via dispose() on each
 * mesh in the subtree, then a fresh group is added. Geometry recreation is
 * cheap (BoxGeometry / PlaneGeometry are sub-ms to construct) and runs only
 * on tier transitions — at most a handful per session.
 */
function rebuildRoomMaterials(
  resources: InternalResources,
  next: QualityLevel,
): void {
  const container = resources.renderer.domElement;
  disposeRoomGroup(resources.room);
  resources.scene.remove(resources.room);
  const aspect = container.clientWidth / Math.max(container.clientHeight, 1);
  const factory = createPs1MaterialFactory(next, aspect);
  const fresh = createPlaceholderRoom(factory);
  resources.scene.add(fresh);
  resources.room = fresh;
}

/**
 * Walk the room subtree and dispose every mesh's geometry + material. The
 * three.js scene-graph traversal keeps the Group reference alive but its
 * GPU buffers go back to the pool.
 */
function disposeRoomGroup(root: Group): void {
  root.traverse((obj): void => {
    if (!('geometry' in obj) || !('material' in obj)) {
      return;
    }
    const meshish = obj as {
      geometry?: { dispose?: () => void };
      material?: unknown;
    };
    meshish.geometry?.dispose?.();
    const mat = meshish.material;
    if (Array.isArray(mat)) {
      for (const m of mat) {
        (m as { dispose?: () => void }).dispose?.();
      }
    } else if (mat !== undefined && mat !== null) {
      (mat as { dispose?: () => void }).dispose?.();
    }
  });
}

/** Drop the renderer canvas into the container as the only child. */
function attachToContainer(
  container: HTMLElement,
  renderer: WebGLRenderer,
): void {
  container.appendChild(renderer.domElement);
}

/** Tear down all resources in reverse-allocation order. */
async function disposeAll(
  container: HTMLElement,
  resources: InternalResources,
): Promise<void> {
  resources.stopLoop();
  resources.disposeResize();
  resources.disposeQualitySub();
  resources.frameLogger.dispose();
  resources.quality.dispose();
  // Revolver disposal (input listeners + HUD DOM + mesh group removal) runs
  // BEFORE audio so empty-click cue handlers can no longer reach into the
  // audio context after it closes.
  resources.revolver.dispose();
  resources.bulb.dispose();
  disposeRoomGroup(resources.room);
  resources.postFx.dispose();
  await resources.audioBed.dispose();
  resources.renderer.dispose();
  if (resources.renderer.domElement.parentNode === container) {
    container.removeChild(resources.renderer.domElement);
  }
}
