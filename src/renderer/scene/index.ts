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
import { createPostFxPipeline } from './post-fx/pipeline';
import type { PostFxHandle } from './post-fx/pipeline';
import { updatePs1MaterialAspect } from './shaders/ps1-material';
import { mountAudioBed } from './audio/audio-bed';
import type { AudioBedHandle } from './audio/audio-bed';
import { mountRevolver, type RevolverHandle } from './revolver';
import { resolveUserLocale } from '../i18n/strings';
import {
  createLoaderHandle,
  type LoaderHandle,
  type LoadedModelHandle,
  type ModelKey,
} from '../loader';
import {
  attachLightbulbIfLoaded,
  buildFactoryForQuality,
  composeRoom,
  mountProceduralTextureSurfaces,
  mountSmokeIfReady,
  preloadGlbs,
  type ProceduralTextureSurfacesHandle,
} from './scene-glb-bridge';
import type { SmokeHandle } from './particles/smoke';
import { disposeAllProceduralTextures } from '../loader/procedural-textures';
import {
  mountDestructionDirector,
  type DestructionDirectorHandle,
} from './destruction';

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
  /**
   * Loader subsystem handle — Sprint 3 Phase 1 scaffolds the field.
   * Phase 2B kraken-loader wires `mountLoader()` (TBD) into buildResources
   * and assigns the result here so callers can `await sceneHandle.loader?.preload()`
   * during the disclaimer→scene boot. Optional so Phase 1 builds (where the
   * loader is not yet allocated) typecheck without forcing a non-null at
   * every call site.
   */
  loader?: LoaderHandle;
  /**
   * Sprint 4 Phase 1: data URL snapshot of the lobby canvas captured at
   * scene-mount complete (after the first rAF). ApartmentBleed consumes
   * this string as the backing image for its flicker overlay so the bleed
   * "leaks" the real lobby through the destruction takeover.
   *
   * Optional because the rAF-deferred capture races mount returning the
   * handle — callers that need a guaranteed snapshot should resolve via a
   * Phase 2B-added Promise. For ApartmentBleed (mounted lazily ~11s after
   * bang) the rAF has long resolved and the field is populated.
   *
   * Explicit `| undefined` because tsconfig has exactOptionalPropertyTypes
   * (Sprint 0 strict-mode posture) — the `?` modifier on its own is
   * insufficient when the implementation may legitimately set the field
   * to `undefined` (toDataURL throw path).
   */
  lobbySnapshotDataUrl?: string | undefined;
  /**
   * Sprint 4 Phase 1: destruction-director handle. Mounted eagerly in
   * buildResources so its bang-fired CustomEvent listener is attached
   * before the user can pull the trigger. Phase 1 stub bodies; Phase 2B
   * kraken-faz0-1 fills.
   *
   * Explicit `| null` so SceneHandle.dispose() can walk the field
   * defensively (the union encodes "may not yet be ready" intent at the
   * type level; Phase 1 always populates it so today's runtime value is
   * never null, but Sprint 5 may add a "wait until first bang" lazy
   * variant without a type churn).
   */
  destructionDirector?: DestructionDirectorHandle | null;
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
  readonly loader: LoaderHandle;
  /** Preloaded GLB map keyed by ModelKey (Sprint 3 Phase 2B). */
  readonly glbHandles: ReadonlyMap<ModelKey, LoadedModelHandle>;
  /** Smoke particle column above the ashtray (Sprint 3 Phase 2B §8.7). */
  readonly smoke: SmokeHandle;
  /** Procedural-texture surface planes (Sprint 3 Phase 2B §8.5). */
  readonly proceduralTextures: ProceduralTextureSurfacesHandle;
  /** Sprint 4 Phase 1: destruction-director, mounted eagerly so its
   *  bang-fired listener is attached before user can pull the trigger. */
  readonly destructionDirector: DestructionDirectorHandle;
  /** Sprint 4 Phase 1: lobby canvas snapshot for ApartmentBleed. Mutable
   *  because it's captured via rAF AFTER buildResources returns. Explicit
   *  `| undefined` per the exactOptionalPropertyTypes tsconfig posture. */
  lobbySnapshotDataUrl?: string | undefined;
  /**
   * Sprint 4 Phase 2B kraken-faz0-1: mutable holder shared with the
   * destruction-director's lobbySnapshotGetter closure. The director
   * subscribes BEFORE the snapshot rAF resolves; the post-mount rAF
   * writes BOTH `lobbySnapshotDataUrl` (for SceneHandle consumers) AND
   * `snapshotHolder.current` (for the director's lazy read).
   */
  readonly snapshotHolder: { current: string | undefined };
  stopLoop: () => void;
  disposeResize: () => void;
  disposeQualitySub: () => void;
  disposeQualitySmokeSub: () => void;
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
  const resources = await buildResources(container, hudContainer, bangOverlay);
  attachToContainer(container, resources.renderer);
  bangOverlay.dataset['sceneMounted'] = 'true';
  // Sprint 4 Phase 1: capture lobby snapshot AFTER first frame renders.
  // ApartmentBleed (Phase 2B kraken-faz2-3) consumes the data URL to
  // flicker the lobby back during Faz 2 / Faz 3. Try/catch because
  // toDataURL can throw on WebGL contexts where preserveDrawingBuffer
  // was not set; we fall back to an empty handle field (ApartmentBleed
  // designer-§8 a11y matrix has a no-snapshot fallback path).
  requestAnimationFrame((): void => {
    try {
      const dataUrl = resources.renderer.domElement.toDataURL('image/png');
      resources.lobbySnapshotDataUrl = dataUrl;
      resources.snapshotHolder.current = dataUrl;
    } catch {
      resources.lobbySnapshotDataUrl = undefined;
      resources.snapshotHolder.current = undefined;
    }
  });

  return {
    dispose: async (): Promise<void> => disposeAll(container, resources),
    getQualityLevel: (): QualityLevel => resources.quality.getQualityLevel(),
    getFrameStats: (): FrameStats | undefined =>
      resources.frameLogger.getFrameStats(),
    audio: resources.audioBed,
    revolver: resources.revolver,
    loader: resources.loader,
    get lobbySnapshotDataUrl(): string | undefined {
      return resources.lobbySnapshotDataUrl;
    },
    destructionDirector: resources.destructionDirector,
  };
}

/**
 * Allocate every scene resource. Extracted from mountScene to keep the
 * function bodies under the 50-line ceiling.
 */
async function buildResources(
  container: HTMLElement,
  hudContainer: HTMLElement,
  bangOverlay: HTMLElement,
): Promise<InternalResources> {
  const renderer = createRenderer(container);
  const camera = createCamera(container);
  const audioBed = await mountAudioBed();
  audioBed.fadeInAmbient();

  const { frameLogger, quality } = buildTelemetry();
  const initialQuality = quality.getQualityLevel();
  // Sprint 3 Phase 2B: parallel preload of all 7 GLBs before scene graph
  // composition. Promise.allSettled — one failed GLB renders placeholder
  // for that key, scene stays whole (designer §8.1).
  const glbHandles = await preloadGlbs();
  const loader = createLoaderHandle();
  const { scene, room, bulb } = buildSceneGraph(
    container, initialQuality, glbHandles,
  );
  const postFx = createPostFxPipeline(renderer, scene, camera, initialQuality);
  const revolver = mountRevolver(
    scene, room, hudContainer, resolveUserLocale(),
    audioBed, bulb, camera, bangOverlay,
    glbHandles.get('revolver') ?? null,
  );
  // Sprint 3 Phase 2B FIX 1: mount smoke column above ashtray (§8.7).
  const smoke = mountSmokeIfReady(scene, initialQuality);
  // Sprint 3 Phase 2B FIX 2: mount procedural texture surfaces (§8.5).
  const proceduralTextures = await mountProceduralTextureSurfaces(scene);
  // Sprint 4 Phase 2B kraken-faz0-1: destruction-director mounted eagerly
  // so its bang-fired CustomEvent listener is attached before the user can
  // pull the trigger. The director needs access to camera (Faz 0 shake),
  // bulb lighting (Faz 0 darken), audio bed (Faz 0 radio fade + master tap
  // for tinnitus/lowpass) and the lobby snapshot (Faz 2/3 apartment bleed).
  // Snapshot is read via getter because the rAF capture lands AFTER this
  // mount returns; the getter resolves at Faz 2 entry by which time the
  // snapshot exists. We use a mutable holder so the closure can read the
  // value AFTER the resources object is built (TDZ — `resources` is not
  // yet initialised at director-mount time).
  const snapshotHolder: { current: string | undefined } = { current: undefined };
  const destructionDirector = mountDestructionDirector({
    scene,
    camera,
    audio: audioBed,
    lighting: bulb,
    lobbySnapshotGetter: (): string | undefined => snapshotHolder.current,
  });

  const resources: InternalResources = {
    renderer, scene, camera, postFx, room, bulb,
    frameLogger, quality, audioBed, revolver, loader, glbHandles,
    smoke, proceduralTextures, destructionDirector, snapshotHolder,
    stopLoop: (): void => undefined,
    disposeResize: (): void => undefined,
    disposeQualitySub: (): void => undefined,
    disposeQualitySmokeSub: (): void => undefined,
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
 * Build the Three.js scene graph: scene + room + bulb light + ambient. Pure
 * construction; no I/O, no listeners. Caller wires the result into the
 * post-fx composer.
 *
 * Sprint 3 Phase 2B: the room is built from preloaded GLB handles when
 * available (designer model-freeze §8 production path). If no room GLBs
 * loaded successfully, falls back to the Sprint 1 primitive cube path.
 * The 'high' quality tier additionally swaps GLB materials for PS1
 * ShaderMaterial (affine-UV vertex snap) per designer §6.
 */
function buildSceneGraph(
  container: HTMLElement,
  quality: QualityLevel,
  glbHandles: ReadonlyMap<ModelKey, LoadedModelHandle>,
): { scene: Scene; room: Group; bulb: BulbLightHandle } {
  const scene = createScene(quality);
  const factory = buildFactoryForQuality(quality, container);
  const room = composeRoom(glbHandles, factory, quality);
  scene.add(room);
  const bulb = createBulbLight();
  attachLightbulbIfLoaded(bulb, glbHandles);
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

  // Subscribe smoke to quality tier changes so particle ceiling + size update.
  resources.disposeQualitySmokeSub = resources.quality.onQualityChange(
    (next): void => { resources.smoke.setQualityLevel(next); },
  );

  resources.stopLoop = startRenderLoop(
    resources.postFx,
    (elapsedSec, deltaMs) => {
      resources.bulb.update(elapsedSec);
      resources.smoke.update(deltaMs / 1000);
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
  disposeRoomGroup(resources.room);
  resources.scene.remove(resources.room);
  const factory = buildFactoryForQuality(next, resources.renderer.domElement);
  // Sprint 3 Phase 2B: re-compose from GLB handles on tier change so the
  // PS1 ShaderMaterial swap (high tier) on the 5 textured GLB meshes
  // applies; falls back to cubes if no GLBs are loaded.
  const fresh = composeRoom(resources.glbHandles, factory, next);
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

/**
 * Tear down all resources in reverse-allocation order.
 *
 * Order: stopLoop → resize → qualitySubs → logger → quality →
 * destructionDirector → revolver → smoke → proceduralTextures → bulb →
 * room → postFx → loader → audio → renderer → DOM.
 *
 * Deviation from §8.10 spec: cloned GLB subtrees own independent GPU
 * buffers so revolver/smoke/textures relative ordering is safe. The hard
 * constraint — loader source scenes disposed last — is preserved.
 *
 * Sprint 4: destruction-director disposes BEFORE revolver so its
 * bang-fired CustomEvent listener / MutationObserver on the bang-overlay
 * is detached before the overlay element itself is reset by
 * revolver.dispose() (avoids a stale-DOM observer fire during teardown).
 */
async function disposeAll(
  container: HTMLElement,
  resources: InternalResources,
): Promise<void> {
  resources.stopLoop();
  resources.disposeResize();
  resources.disposeQualitySub();
  resources.disposeQualitySmokeSub();
  resources.frameLogger.dispose();
  resources.quality.dispose();
  // Sprint 4 Phase 1: destruction-director dispose first among DOM-touching
  // subsystems so its listener detach precedes any DOM mutation downstream.
  resources.destructionDirector.dispose();
  // Revolver disposal (input listeners + HUD DOM + mesh group removal) runs
  // BEFORE audio so empty-click cue handlers can no longer reach into the
  // audio context after it closes.
  resources.revolver.dispose();
  // Smoke + procedural-texture planes disposed after revolver, before bulb.
  resources.smoke.dispose();
  resources.proceduralTextures.dispose();
  disposeAllProceduralTextures();
  resources.bulb.dispose();
  disposeRoomGroup(resources.room);
  resources.postFx.dispose();
  // Sprint 3 Phase 2B: release every cached GLB scene's geometry + materials
  // + textures via the loader handle. Runs AFTER room/revolver/bulb dispose
  // because those subsystems hold cloned subtrees; the loader's source
  // scenes are disposed last so any cloned children's geometry references
  // are still valid during their own dispose pass.
  resources.loader.dispose();
  await resources.audioBed.dispose();
  resources.renderer.dispose();
  if (resources.renderer.domElement.parentNode === container) {
    container.removeChild(resources.renderer.domElement);
  }
}
