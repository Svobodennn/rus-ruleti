/**
 * Scene module public API.
 *
 * The renderer entry-point (src/renderer/main.ts) calls mountScene(container)
 * after the disclaimer Continue button is clicked. mountScene returns a
 * SceneHandle whose dispose() tears the whole subsystem down (renderer, audio
 * context, resize listener, render loop, frame logger).
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
import { mountAudioBed } from './audio/audio-bed';
import type { AudioBedHandle } from './audio/audio-bed';

/** Public handle returned from mountScene. */
export interface SceneHandle {
  /** Tear down everything created by mountScene. */
  dispose: () => Promise<void>;
  /** Current quality tier (build-time, possibly bumped at runtime). */
  getQualityLevel: () => QualityLevel;
  /** Latest frame-time stats, undefined if no flush yet. */
  getFrameStats: () => FrameStats | undefined;
}

/** Internal bag of resources mountScene needs to track for disposal. */
interface InternalResources {
  readonly renderer: WebGLRenderer;
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly postFx: PostFxHandle;
  readonly room: Group;
  readonly bulb: BulbLightHandle;
  readonly frameLogger: FrameLoggerHandle;
  readonly quality: QualityControllerHandle;
  readonly audioBed: AudioBedHandle;
  readonly stopLoop: () => void;
  readonly disposeResize: () => void;
}

/**
 * Mount the scene into a DOM container.
 *
 * Returns a handle whose dispose() releases all GPU + audio resources.
 * Must be awaited because audio context creation needs a user gesture
 * and AudioContext.resume() is async on Chromium.
 */
export async function mountScene(container: HTMLElement): Promise<SceneHandle> {
  const resources = await buildResources(container);
  attachToContainer(container, resources.renderer);

  return {
    dispose: async (): Promise<void> => disposeAll(container, resources),
    getQualityLevel: (): QualityLevel => resources.quality.getQualityLevel(),
    getFrameStats: (): FrameStats | undefined =>
      resources.frameLogger.getFrameStats(),
  };
}

/**
 * Allocate every scene resource. Extracted from mountScene to keep the
 * function bodies under the 50-line ceiling.
 */
async function buildResources(
  container: HTMLElement,
): Promise<InternalResources> {
  const renderer = createRenderer(container);
  const scene = createScene();
  const camera = createCamera(container);
  const postFx = createPostFxPipeline(renderer, scene, camera);

  const room = createPlaceholderRoom();
  scene.add(room);

  const bulb = createBulbLight();
  scene.add(bulb.light);
  scene.add(bulb.bulbMesh);

  const audioBed = await mountAudioBed();

  const frameLogger = createFrameLogger(
    () => quality.getQualityLevel(),
    (payload) => window.api.sendFrameStats(payload),
  );
  const quality = createQualityController(frameLogger, {
    info: (message: string): void => {
      // Renderer's only telemetry surface to main is the IPC frame:stats
      // channel; transition log lines are best-effort and go to a DOM
      // dataset marker that the main-process electron-log preload spy
      // could pick up later if needed. eslint no-console is enforced.
      document.body.dataset['quality'] = message;
    },
  });

  const disposeResize = installResizeListener(
    container,
    renderer,
    postFx,
    (width, height) => updateCameraAspect(camera, width, height),
  );

  const stopLoop = startRenderLoop(postFx, (elapsedSec, deltaMs) => {
    bulb.update(elapsedSec);
    frameLogger.markFrame(deltaMs);
    quality.tick();
  });

  return {
    renderer,
    scene,
    camera,
    postFx,
    room,
    bulb,
    frameLogger,
    quality,
    audioBed,
    stopLoop,
    disposeResize,
  };
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
  resources.frameLogger.dispose();
  resources.quality.dispose();
  resources.bulb.dispose();
  resources.postFx.dispose();
  await resources.audioBed.dispose();
  resources.renderer.dispose();
  if (resources.renderer.domElement.parentNode === container) {
    container.removeChild(resources.renderer.domElement);
  }
}
