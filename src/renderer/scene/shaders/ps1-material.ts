/**
 * PS1 vertex-snap material factory.
 *
 * Builds the THREE.Material a placeholder mesh should use given the active
 * quality tier:
 *
 *   - `low`    → plain MeshStandardMaterial (no shader cost).
 *   - `medium` → plain MeshStandardMaterial (still no shader cost — the
 *                medium tier adds post-fx but doesn't touch geometry).
 *   - `high`   → custom ShaderMaterial that snaps projected vertices to
 *                a coarse pixel grid (PS1 wobble) + applies a Lambert-style
 *                diffuse term in the fragment for the single bulb light.
 *
 * Why Lambert-by-hand on `high`: the snap shader replaces the entire
 * vertex stage of MeshStandardMaterial, which means we lose three.js'
 * automatic light injection. Sprint 1 has exactly one PointLight (the
 * bulb) plus a very-dim AmbientLight, so rolling our own Lambert pass
 * is cheap and gives us full control over the look. Sprint 3 will need
 * a shader-chunk-injection rewrite (or a custom material that participates
 * in three.js' WebGLLights uniform block) when GLB meshes with normal
 * maps arrive; flagged here so future-me has the breadcrumb.
 *
 * Resource ownership: every material returned from this factory MUST be
 * disposed via `material.dispose()` when its mesh is torn down. The
 * factory does not track instances; the caller (placeholder-room.ts) does.
 */

import {
  Color,
  Mesh,
  MeshStandardMaterial,
  ShaderMaterial,
  Uniform,
} from 'three';
import type { Material } from 'three';
import {
  BULB_LIGHT,
  PS1_MATERIAL_EMISSIVE_FACTOR,
  PS1_SNAP_RESOLUTION,
  type QualityLevel,
} from '../../../shared/scene-constants';
import ps1VertexSnap from './ps1-vertex-snap.glsl?raw';

/** Factory signature consumed by placeholder-room.ts. */
export type Ps1MaterialFactory = (baseColor: string) => Material;

/**
 * Build a material factory bound to the given quality tier + aspect ratio.
 *
 * Captures aspect in the closure so the vertex shader can keep its snap
 * grid isotropic (otherwise wide viewports stretch the wobble). The
 * factory does NOT subscribe to resize — call sites are expected to
 * rebuild materials on quality change rather than per-resize because
 * resizing during gameplay is uncommon and the snap grid drift is small
 * enough at typical aspect deltas to be unnoticeable.
 */
export function createPs1MaterialFactory(
  quality: QualityLevel,
  aspect: number,
): Ps1MaterialFactory {
  if (quality !== 'high') {
    return (baseColor: string): Material =>
      new MeshStandardMaterial({ color: baseColor });
  }
  return (baseColor: string): Material =>
    buildHighTierMaterial(baseColor, aspect);
}

/**
 * Construct the high-tier ShaderMaterial. Extracted so the factory stays
 * inside the 50-line ceiling and the assembly is easier to read.
 */
function buildHighTierMaterial(
  baseColor: string,
  aspect: number,
): ShaderMaterial {
  const fragmentShader = ps1FragmentShader();
  return new ShaderMaterial({
    vertexShader: ps1VertexSnap,
    fragmentShader,
    uniforms: {
      snapResolution: new Uniform(PS1_SNAP_RESOLUTION),
      aspect: new Uniform(aspect),
      uBaseColor: new Uniform(new Color(baseColor)),
      uLightPosition: new Uniform([0, BULB_LIGHT.posY, 0]),
      uLightColor: new Uniform(new Color(BULB_LIGHT.color)),
      uLightIntensity: new Uniform(BULB_LIGHT.intensity),
      uEmissiveFactor: new Uniform(PS1_MATERIAL_EMISSIVE_FACTOR),
    },
  });
}

/**
 * Inline fragment shader — single-bulb Lambert + ambient emissive.
 *
 * Kept inline because it's under 30 lines (per coding-style.md guidance:
 * <30-line GLSL is OK as a TS string literal; longer goes to .glsl?raw).
 */
function ps1FragmentShader(): string {
  return `
precision mediump float;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;
uniform vec3 uBaseColor;
uniform vec3 uLightPosition;
uniform vec3 uLightColor;
uniform float uLightIntensity;
uniform float uEmissiveFactor;

void main() {
  vec3 toLight = uLightPosition - vWorldPosition;
  float distance = length(toLight);
  vec3 lightDir = toLight / max(distance, 0.0001);
  float lambert = max(dot(normalize(vWorldNormal), lightDir), 0.0);
  // 1/r^2 falloff (decay=2) matches the three.js PointLight default.
  float falloff = 1.0 / (1.0 + distance * distance);
  vec3 diffuse = uBaseColor * uLightColor * lambert * uLightIntensity * falloff;
  vec3 emissive = uBaseColor * uEmissiveFactor;
  gl_FragColor = vec4(diffuse + emissive, 1.0);
}
`;
}

/**
 * Update the aspect uniform on every material in a scene-graph subtree.
 *
 * Called on resize. Only ShaderMaterial instances have the `aspect`
 * uniform; plain MeshStandardMaterial materials (low/medium tiers) are
 * skipped silently. Recursive traversal is bounded — the placeholder room
 * has ~10 meshes, negligible cost.
 */
export function updatePs1MaterialAspect(
  root: { traverse: (cb: (obj: unknown) => void) => void },
  aspect: number,
): void {
  root.traverse((obj: unknown): void => {
    const mesh = obj as Mesh | undefined;
    if (mesh === undefined || !(mesh instanceof Mesh)) {
      return;
    }
    const mat = mesh.material;
    if (mat instanceof ShaderMaterial && 'aspect' in mat.uniforms) {
      const uniform = mat.uniforms['aspect'];
      if (uniform !== undefined) {
        uniform.value = aspect;
      }
    }
  });
}
