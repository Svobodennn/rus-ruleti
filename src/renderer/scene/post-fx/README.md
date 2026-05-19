# Phase 1 stub — Phase 2 (kraken-shader) fills

This directory holds the EffectComposer pipeline + pmndrs postprocessing
passes. Sprint 1 Phase 1 provides only `pipeline.ts` with an empty composer
(just a RenderPass). Phase 2 adds:

- CRT scanline pass — pmndrs `ScanlineEffect`.
- Film grain pass — pmndrs `NoiseEffect`.
- Chromatic aberration — pmndrs `ChromaticAberrationEffect`.
- PS1 dither/affine-UV/vertex-snap passes (custom, see ../shaders/).

## Quality-tier subscription

`pipeline.ts` subscribes to the quality controller's `onQualityChange`
callback and toggles `pass.enabled` on the relevant passes (see matrix in
../shaders/README.md). DO NOT recompile shaders on each change — that
stalls the render thread; toggle `enabled` instead.

## Ordering

The pmndrs library wants effects grouped into `EffectPass` rather than
individual passes. Vertex snap + affine UV are *vertex-stage* PS1 effects
and apply at scene-render time (RenderPass replacement) rather than as
post-process — they need a custom override material or shader chunk
injection. See `../shaders/README.md` for the breakdown.
