/*
 * PS1 affine UV — defeat perspective-correct UV interpolation.
 *
 * Why this looks like a PS1: the PSX's GTE could not afford a per-pixel
 * perspective divide on UVs. Instead, UVs were interpolated linearly across
 * triangles in *screen space*, regardless of depth. The result is the famous
 * "swimming texture" / "warbling" artefact: textures appear to slide and
 * stretch across triangle interiors as the camera moves, especially on
 * floors and walls oblique to the camera. Modern GPUs do perspective-correct
 * UV interpolation by default; we have to actively disable it.
 *
 * Mechanism (per the GLSL spec):
 *   The `noperspective` qualifier on varyings is the canonical way to opt
 *   into linear (affine) interpolation in screen space. WebGL2 supports
 *   `noperspective` directly; WebGL1 does not — for legacy contexts we fall
 *   back to multiplying by w before passing to the fragment and dividing
 *   back out in flat colour. Since three.js + postprocessing default to
 *   WebGL2 on modern Electron we can use `noperspective` here.
 *
 * Sprint 1 caveat: the placeholder cubes have no textures yet (Sprint 3 GLB
 * swap brings them in). This shader must therefore compile cleanly but
 * produce no visible effect until UVs are wired through. We expose the
 * machinery so the Sprint 3 textured-mesh pass can drop it in.
 *
 * Quality gate: only wired on QualityLevel === 'high'.
 */

#ifdef GL_ES
precision mediump float;
#endif

attribute vec2 uv;

// `noperspective` is GLSL ES 3.0 (WebGL2) syntax. The vertex output below
// becomes the fragment varying without perspective correction. If the
// context falls back to WebGL1 the qualifier is ignored — Sprint 1 has no
// textured meshes that depend on this yet, so the visual difference is nil.
noperspective varying vec2 vAffineUv;

void main() {
  // Standard transform — vertex snap happens in ps1-vertex-snap.glsl when
  // the two shaders are composed together. This file is a stand-alone
  // illustration of the affine-UV technique.
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Pass UV unchanged. The `noperspective` qualifier on the varying is
  // what defeats perspective correction; we don't need to manipulate the
  // value at the vertex stage.
  vAffineUv = uv;
}
