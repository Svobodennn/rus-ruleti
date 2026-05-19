# Phase 1 stub — Phase 2 (kraken-shader) fills

This directory is reserved for the PS1 shader stack (PLAN §3):

- `ps1-vertex-snap.glsl` — quantises gl_Position to a low-res grid; the
  hallmark "jittery vertex" PS1 look. Activates at quality tier `high`.
- `ps1-affine-uv.glsl` — disables perspective-correct UV interpolation per
  PS1 PSX gte limitations. Activates at quality tier `high`.
- `ps1-dither.glsl` — bayer-matrix dithering down to ~256-color output.
  Activates at quality tier `high`.

Phase 2 also exposes corresponding postprocessing-library Effects in
`../post-fx/pipeline.ts` so the EffectComposer can enable/disable per the
runtime quality tier (see `../quality.ts`).

## Quality tier matrix

| Tier   | Vertex snap | Affine UV | Dither | Scanline | Chromatic | Grain |
| ------ | ----------- | --------- | ------ | -------- | --------- | ----- |
| low    | off         | off       | off    | on       | off       | on    |
| medium | off         | off       | off    | on       | on        | on    |
| high   | on          | on        | on     | on       | on        | on    |

## Constraints (Phase 2 kraken-shader)

- Inline short GLSL passes as TypeScript template literals (auto-OK per
  directive preamble). Keep individual shaders < 80 lines.
- Long shaders or those needing #include directives go in their own .glsl
  file with a Vite plugin or fetch+compile helper.
- No magic numbers — quantisation grid sizes, dither matrix dimensions, and
  chromatic offset all live in `../../shared/scene-constants.ts`.
- WebGL `vec3 / vec4` literals are fine; uniforms read from constants.
