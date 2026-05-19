/*
 * PS1 vertex-snap — the canonical "wobbly vertex" PSX artefact.
 *
 * Why this looks like a PS1: the original PlayStation's Geometry Transform
 * Engine (GTE) used 16-bit fixed-point math after the perspective divide,
 * which forced every projected vertex onto a coarse pixel grid. When two
 * vertices of a triangle fell into the same grid cell, the triangle would
 * visibly "snap" between frames. This is the look PS1 fans recognise:
 * geometry shivers when the camera moves; long thin triangles seem to lurch.
 *
 * How we reproduce it in a modern shader:
 *   1. Run the normal view×projection on `position`.
 *   2. Perform the perspective divide manually (xyz /= w).
 *   3. Snap the resulting NDC xy to a grid of `snapResolution` cells.
 *   4. Multiply back by w so the GPU's automatic perspective divide
 *      yields the snapped value.
 *
 * Constants:
 *   - `snapResolution` is the horizontal resolution of the snap grid; the
 *     vertical resolution is derived from the viewport aspect inside the
 *     shader call site to keep the artefact isotropic.
 *
 * Quality gate: this shader is wired into the vertex stage of the PS1
 * ShaderMaterial only when QualityLevel === 'high'. Lower tiers use a
 * plain MeshStandardMaterial without this snap.
 */

uniform float snapResolution;
uniform float aspect;

varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main() {
  // Standard view-space transform.
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vec4 viewPos = viewMatrix * worldPos;
  vec4 clipPos = projectionMatrix * viewPos;

  // Manual perspective divide so we can snap NDC xy.
  vec3 ndc = clipPos.xyz / clipPos.w;

  // Snap xy onto the integer-resolution grid. Vertical resolution is
  // snapResolution / aspect so pixels stay roughly square at any aspect.
  float resX = snapResolution;
  float resY = snapResolution / max(aspect, 0.001);
  ndc.x = floor(ndc.x * resX) / resX;
  ndc.y = floor(ndc.y * resY) / resY;

  // Multiply back by w so gl_Position's automatic divide reproduces ndc.
  gl_Position = vec4(ndc * clipPos.w, clipPos.w);

  // Pass world-space normal + position for the Lambert lighting in the
  // fragment shader. Sprint 1 placeholder cubes have no UVs (no textures),
  // so we skip the affine-UV trick here — it lives in ps1-affine-uv.glsl
  // and only activates once the GLB swap brings textured meshes.
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vWorldPosition = worldPos.xyz;
}
