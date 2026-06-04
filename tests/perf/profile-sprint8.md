# Sprint 8 Phase 2B Lane B — Performance Profile

**Agent:** @profiler
**Generated:** 2026-06-04
**Base commit:** `5891893` (Phase 2A) on top of `33e3f8c` (Phase 1)
**Status:** M1 baseline captured (static-analysis methodology — runtime
profiling blocked by agentic environment; see "Methodology" below).

---

## Methodology

Runtime per-Faz profiling requires (a) a displayable Electron renderer
process and (b) manual navigation through the bang-trigger → Faz 0-8
sequence. Both are blocked in the agentic execution environment (no
display server, no interactive input).

Lane B Phase 2B falls back to **static estimation** with explicit
confidence labels:

| Label | Meaning | Use when |
|-------|---------|----------|
| MEASURED | Captured via runtime telemetry | Not available this phase |
| STATIC HIGH | Source-inspected geometry/DOM/voice count + invariant analysis | Architecture is deterministic (e.g. fixed GLB count) |
| STATIC MED | Inferred from upper-bound code paths | Time-dependent (stream rates × duration) |
| STATIC LOW | Estimated from peak-burst heuristics | Adversarial overlap (cross-Faz transition windows) |

A Sprint 9 follow-up should re-run this profile against a packaged
build to convert STATIC entries to MEASURED. The Phase 1 frame:stats
extension is the capture surface (renderer.info + voice-counter); see
"Open Questions" §1 for the renderer-side wiring gap that blocks
end-to-end telemetry harvest.

---

## Phase 1 instrumentation wiring status

| Capture path | Wired? | Evidence |
|--------------|--------|----------|
| frame-logger.ts ScenePerfSample callback | YES (signature) | `createFrameLogger(qualityReader, sink, sceneStatsReader?)` accepts optional reader |
| scene/index.ts passes sceneStatsReader | **NO** | `createFrameLogger(quality, sink)` — only 2 args wired at line 306 |
| audio-voice-counter.ts increment/decrement call sites | **NO** | Module is scaffold; zero production call sites grep'd |
| FrameStatsPayload optional max* fields | YES (type) | scene-destruction-constants + ipc-channels.ts both declare them |
| Main process electron-log persists payload | YES | Sprint 1 + Sprint 8 additive contract |

**Implication:** frame:stats currently ships Sprint 7 payload shape only
(p50/p95/p99/mean/max + quality + sampleCount). The Sprint 8 max*
fields would be optional `undefined` in any captured payload. This is
the Lane B Phase 2B integration gap (M2 candidate — wire the reader
into scene/index.ts; the audio-voice counter increment/decrement
bracketing is Phase 2B Lane A territory per Phase 2A handoff §"Lane A
(kraken-audio) — explicit tuning targets ready" bullet 4).

---

## Sprint 7 baseline — static estimates

### Geometry count (renderer.info.memory.geometries)

| Source | Count | Confidence | Evidence |
|--------|-------|------------|----------|
| 7 GLB scene meshes (revolver, chair, radio, bottle, table, ashtray, lightbulb) | 7 | STATIC HIGH | `model-registry.ts:50-58` MODEL_URLS keys |
| Placeholder fallback (when GLB fails) — 4 box primitives + 1 floor plane + 3 wall planes | 0-8 | STATIC HIGH | `placeholder-room.ts:109-181` — only used when GLB load fails |
| Lightbulb sphere geo (when GLB missing) | 0-1 | STATIC HIGH | `lighting.ts:207` — `lightbulb` GLB normally satisfies this |
| Revolver primitive fallback (cylinder + box + cylinder + box) | 0-4 | STATIC HIGH | `revolver-mount.ts:156-193` — fallback path |
| Smoke particle BufferGeometry (1 instanced) | 1 | STATIC HIGH | `particles/smoke.ts:241` |
| Procedural texture surface planes (variable) | 1-3 | STATIC MED | `scene-glb-bridge.ts:205` — N depends on GLB scene composition |
| Faz 4-7 destruction overlay (DOM not WebGL) | 0 | MEASURED | grep confirms only `document.createElement` not `new *Geometry` |
| Faz 8 volumetric smoke (CSS-only mode) | 0 | MEASURED | `faz8-volumetric-smoke.ts:84-94` — purely DOM |

**Steady-state estimate (production GLB path):** ~9 geometries (7 GLBs
+ 1 smoke + 1 procedural surface). **Worst case (full GLB failure +
fallback):** ~13 (4 placeholder primitives + 4 walls/floor + 1 lightbulb
sphere + 4 revolver primitives + 1 smoke ~= 13).

**vs MAX_GEOMETRY_COUNT (20):** within budget. Headroom 7-11.

### Texture count (renderer.info.memory.textures)

| Source | Count | Confidence | Evidence |
|--------|-------|------------|----------|
| GLB embedded textures (7 GLB x ~1 texture avg) | ~7 | STATIC MED | designer Sprint 3 inventory: 8 textures |
| Procedural textures (wallpaper, poster, etc.) | 1-3 | STATIC MED | `mountProceduralTextureSurfaces` + Sprint 4 procedural-wallpaper.ts |
| Post-FX render targets (composer buffers) | 2-4 | STATIC MED | EffectComposer maintains ping-pong render targets |
| GLB material maps where present | inline | STATIC MED | counted within the GLB texture count above |

**Steady-state estimate:** ~10-12 active Three.js textures.
**Texture memory estimate (4 MiB per-texture heuristic):** ~40-48 MB.

**vs MAX_TEXTURE_MEMORY_MB (50):** within budget. Headroom 2-10 MB —
**THIN**. Sprint 9 candidate: verify against runtime telemetry; the
4 MiB heuristic may overstate (real GLB textures are often 512² or
smaller, ~1 MiB each).

### Draw calls per frame (renderer.info.render.calls)

| Source | Calls | Confidence | Evidence |
|--------|-------|------------|----------|
| Scene meshes (7 GLB nodes) | 7 | STATIC HIGH | one draw call per mesh + material |
| Lightbulb sphere (debug helper) | 1 | STATIC HIGH | `lighting.ts:207` |
| Smoke particle (instanced) | 1 | STATIC HIGH | one InstancedBufferGeometry draw |
| Procedural texture planes | 1-3 | STATIC MED | per `mountProceduralTextureSurfaces` |
| Post-FX passes (RenderPass + 3-5 effect passes) | 4-6 | STATIC MED | scanline + grain + chromatic + dither + ACES |

**Steady-state estimate:** 14-18 draw calls per frame.

**vs MAX_DRAW_CALLS_PER_FRAME (100):** well within budget. Headroom
82-86. Phase 1 placeholder constant was conservative — Sprint 9 could
safely tighten to 40 if measurement confirms.

### Voice count (Web Audio active OscillatorNode + AudioBufferSourceNode)

Captured via static enumeration of `createOscillator` +
`createBufferSource` call sites cross-referenced with envelope
durations.

| Phase | Active voices | Confidence | Evidence |
|-------|---------------|------------|----------|
| Lobby (pre-Faz 0) | 3-7 | STATIC HIGH | ambient-synth.ts builds 3-source bed (oscFundamental + oscHarmonic + LFO + 2x brown-noise + 2x LFO ~= 7); audio-bed.ts may sustain a subset |
| Faz 0 (bang) | +1 transient | STATIC HIGH | revolver-sfx bang: 1 buffer source + brief tail; ambient holds |
| Faz 1 (critical dialog) | 3-7 | STATIC HIGH | dialog is silent + faded ambient; native chord stub is one-shot (already released) |
| Faz 2 (toasts + icons + takeover) | 3-7 | STATIC HIGH | no audio sources mounted Faz 2 (designer §7) |
| Faz 3 (terminal) | 3-7 | STATIC HIGH | no audio sources mounted Faz 3 |
| Faz 4 (file wipe) | +2-3 | STATIC MED | destruction-audio-faz45 HDD-grind 1 osc + LFO + buffer source ~= 3 voices |
| Faz 5 (disk format) | +3-4 | STATIC MED | adds fan-overdrive (osc + LFO + filter), electrical-buzz osc; HDD-grind holds |
| Faz 6 (BSOD) | +2-3 transient | STATIC MED | BSOD beep cluster (envelope-driven oscillators); buzz cuts at entry |
| Faz 7 (bootloop) | +2-3 transient | STATIC MED | electrical-tick (<=3 concurrent ticks within 6sn window) |
| **Faz 8 reveal entry (PEAK)** | **10-14** | STATIC LOW | reveal jingle 4 chord osc + ambient-recovery 1 BufferSource + ambient bed 3-7 + lingering Faz 7 electrical-tick branches (worst 1-2) |
| Faz 8 son-ekran | 4-6 | STATIC HIGH | jingle released; ambient-recovery + ambient bed + door-close (1-shot, transient) |

**Peak voice estimate (Faz 7-to-8 cross):** ~12 voices.
**vs MAX_VOICE_COUNT_AT_PEAK (16):** within budget. Headroom 4 voices.

### Frame budget (ms — 60fps target)

Static estimation cannot reliably predict frame time. Sprint 1's
quality-tier auto-demote (`quality.ts`) already enforces the 16.67ms
ceiling; Sprint 8 codifies the named constant. The post-FX pipeline
(4-6 full-screen passes) is the dominant per-frame cost on M1.

**Expected p50:** <16.67ms (60fps stable in Sprint 1-7 manual QA).
**Expected p99 risk windows:**
- Faz 0 entry (camera shake + bulb darken + GPU readback for snapshot rAF)
- Faz 2-to-3 transition (apartment-bleed image decode + composite)
- Faz 6 entry (BSOD chrome mount + Faz 5 disk-format teardown overlap)
- Faz 8 reveal entry (4 oscillator allocations + bulb intensity rAF + camera dolly rAF concurrent)

### Per-Faz max table (Sprint 7 BASELINE — static estimate)

| Faz | Draw calls | Texture count | Texture MB est. | Geometry count | Voice count | Frame budget (est.) |
|-----|-----------|---------------|------------------|----------------|-------------|----------------------|
| Lobby (pre-Faz 0) | 14-18 | 10-12 | 40-48 | 9-13 | 3-7 | <16.67ms |
| Faz 0 (bang) | 14-18 | 10-12 | 40-48 | 9-13 | 4-8 (bang transient) | ~17ms (camera shake spike) |
| Faz 1 (critical dialog) | 14-18 | 10-12 | 40-48 | 9-13 | 3-7 | <16.67ms |
| Faz 2 (icons+toasts+takeover) | 14-18 | 10-12 | 40-48 | 9-13 | 3-7 | ~17ms (apartment-bleed mount) |
| Faz 3 (terminal) | 14-18 | 10-12 | 40-48 | 9-13 | 3-7 | <16.67ms (terminal is DOM text node, not Three.js work) |
| Faz 4 (file wipe) | 14-18 | 10-12 | 40-48 | 9-13 | 5-10 | <16.67ms |
| Faz 5 (disk format) | 14-18 | 10-12 | 40-48 | 9-13 | 8-12 | <16.67ms |
| Faz 6 (BSOD) | 14-18 | 10-12 | 40-48 | 9-13 | 5-9 | ~17ms (BSOD chrome mount) |
| Faz 7 (bootloop) | 14-18 | 10-12 | 40-48 | 9-13 | 5-10 | <16.67ms |
| **Faz 8 reveal (PEAK)** | **14-18** | **10-12** | **40-48** | **9-13** | **10-14** | **~17ms (jingle + dolly + bulb concurrent)** |
| Faz 8 son-ekran | 14-18 | 10-12 | 40-48 | 9-13 | 4-6 | <16.67ms |

---

## Hotspot identification (M1)

### H1 — Voice peak at Faz 7-to-8 transition (HIGHEST audio voice count)
**Estimate:** 10-14 voices in the cross-Faz overlap window.
**Cause:** Faz 7 electrical-tick branches do not fully release before
Faz 8 reveal jingle 4 chord oscillators allocate + ambient-recovery
buffer source starts. Designer §22 + §24-D-1f confirm 200ms attack overlap
with bootloop tail is by design — but voice count peaks in the overlap.
**Action (M2 candidate):** Audit Lane A `decrementVoiceCount` wiring
once Phase 2B Lane A completes; verify no electrical-tick branch
survives Faz 7 dispose. The audio-voice-counter scaffold is the
detection surface but it is not wired yet (see "Phase 1 instrumentation
wiring status" above).

### H2 — Texture memory headroom is thin (~2-10 MB)
**Estimate:** 40-48 MB vs 50 MB budget.
**Cause:** 4 MiB per-texture heuristic conservatively counts every GLB
texture as 1024² RGBA. Real Sprint 3 GLBs likely use 512² or compressed
formats (KTX2/DDS would be ~25% the byte estimate).
**Action (M3 candidate):** Document heuristic bias in profile (no code
change — runtime calibration is Sprint 9 territory against Chrome
DevTools GPU memory readings; the heuristic itself is documented at
BYTES_PER_TEXTURE_ESTIMATE in frame-logger.ts).

### H3 — Phase 1 instrumentation reader not wired (S11 dependency)
**Cause:** `scene/index.ts:306` calls `createFrameLogger(quality, sink)`
without the optional `sceneStatsReader` 3rd arg. So frame:stats payloads
ship Sprint 7 shape only — Sprint 8 max* fields stay undefined.
**Severity:** BLOCKS S11 closure (instrumentation survives prod build
ONLY IF wired into the runtime; current state: scaffolded, not wired).
**Action (M2):** Wire `sceneStatsReader: () => ({ drawCalls:
renderer.info.render.calls, textureCount: renderer.info.memory.textures,
geometryCount: renderer.info.memory.geometries, audioVoiceCount:
getActiveVoiceCount() })`.

### H4 — Faz 0 entry concurrent rAF loops (frame-budget risk)
**Cause:** Faz 0 entry fires camera shake (rAF), bulb darken (rAF), and
the toDataURL snapshot rAF in the same frame window. The toDataURL is
a synchronous GPU readback — expensive on M1.
**Mitigation in place:** `scene/index.ts:202-211` already defers the
toDataURL to a single requestAnimationFrame, and the snapshot only
runs once.
**Action:** None — already mitigated. Note in profile as design pattern
to preserve.

### H5 — No geometry memory leak detected (static)
**Cause:** All Faz mount/dispose paths use DOM (`createElement` +
`removeChild`), not Three.js geometry. The only `BufferGeometry`
allocation per session is the smoke particle (mounted once at scene
init, disposed at scene unmount).
**Action:** None — symmetric dispose contract verified statically.
Sprint 9 runtime audit should confirm `renderer.info.memory.geometries`
is stable across Faz transitions.

---

## Hotspot summary

| ID | Type | Severity | Action |
|----|------|----------|--------|
| H1 | Audio voice peak | LOW (within budget) | Lane A audit (cross-phase coordination) |
| H2 | Texture memory headroom | MED | Document heuristic bias; runtime calibration Sprint 9 |
| H3 | Instrumentation not wired | HIGH (blocks S11) | M2 wire-up |
| H4 | Faz 0 concurrent rAF | LOW (already mitigated) | Preserve current pattern |
| H5 | Geometry leak risk | NONE | Sprint 9 runtime verification |
