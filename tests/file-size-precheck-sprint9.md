# File-size precheck — Sprint 9 (TH-S8-04 carry-forward)

**Generated:** 2026-06-06 (Sprint 9 Phase 1 M7 — kraken solo scaffold)
**Source baseline:** HEAD commit at Sprint 9 Phase 1 start (post-M6 = `9f638ef`)
**Carry-forward from:** Sprint 8 lesson TH-S8-04 (Sprint 8 hit the 400L cap on
`destruction-audio-faz45.ts` mid-Lane A; had to split mid-stream → ElectricalBuzz
helper extracted to `destruction-audio-faz45-buzz.ts`). Sprint 9 ships this
enumeration at Phase 1 so Lane A reads it at Phase 2B start and pre-emptively
considers splits if extending any flagged file.

---

## Enumeration command (verbatim)

```bash
find src -name "*.ts" -not -path "*/node_modules/*" \
  | xargs wc -l \
  | awk '$1 > 350 && $2 != "total" {print $0}' \
  | sort -nr
```

## Raw line counts >350L (run at HEAD `9f638ef`)

```
    2158 src/shared/scene-destruction-constants.ts
     831 src/renderer/scene/audio/destruction-audio.ts
     722 src/renderer/scene/destruction/destruction-director.ts
     721 src/renderer/i18n/strings.ts
     694 src/renderer/scene/destruction/types.ts
     663 src/renderer/scene/audio/destruction-audio-faz8.ts
     572 src/renderer/scene/audio/destruction-audio-faz45.ts
     530 src/renderer/scene/index.ts
     530 src/renderer/scene/destruction/faz8-son-ekran.ts
     524 src/renderer/scene/destruction/chrome/win-progress-dialog.ts
     512 src/renderer/scene/destruction/destruction-state.ts
     501 src/renderer/scene/audio/revolver-sfx.ts
     482 src/renderer/scene/particles/smoke.ts
     481 src/renderer/scene/destruction/apartment-bleed.ts
     459 src/renderer/scene/destruction/chrome/win-bsod.ts
     437 src/renderer/scene/audio/audio-bed.ts
     421 src/renderer/scene/destruction/chrome/mac-progress-dialog.ts
     385 src/renderer/scene/destruction/faz3-terminal.ts
     379 src/renderer/scene/frame-logger.ts
     373 src/renderer/scene/lighting.ts
     369 src/renderer/scene/destruction/faz5-disk-format.ts
     364 src/renderer/scene/audio/ambient-synth.ts
     359 src/renderer/scene/destruction/chrome/mac-bootloop.ts
```

## Important — counting convention vs. lint cap

`.eslintrc.cjs` rule:

```js
'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }]
```

The lint cap counts **non-blank, non-comment** lines (400 max). The raw `wc -l`
counts above include blank lines AND comment lines, so a file at raw 500-700L
may still pass the 400L lint cap because much of its body is whitespace +
JSDoc/inline comments.

**Evidence:** `npm run lint` exits 0 at HEAD `9f638ef` for ALL files above
(verified Phase 1 M1..M6). Therefore EVERY file in the table above currently
has ≤400 effective (non-blank, non-comment) lines.

The raw-line table is still useful as an early-warning indicator: files at raw
≥600L are most likely to have ≥350 effective lines and approach the cap during
extension. Files at raw 350-450L are well-padded by comments and rarely hit
the cap during normal edits.

## WARNING flags for Lane A Phase 2B

Lane A is **release config + LEGAL + entitlements** — it should not need to
extend any `src/*.ts` file. Sprint 9's source-touch surface is documented as
**ZERO** (Phase 1 = config/docs only; Phase 2A = designer art only; Phase 2B
Lane A = LEGAL.md append + electron-builder dryrun verification only; Lane B
= Playwright e2e closure attempt only — touches `tests/e2e/` not `src/`).

If Lane A discovers that ANY of the following files MUST be extended (e.g.,
to wire a new entitlement-related setting into the runtime or to flip a feature
flag for release builds), proceed with caution:

| File | Raw L | Risk | Split strategy if needed |
|---|---|---|---|
| `src/shared/scene-destruction-constants.ts` | 2158 | Constants file — comment-heavy; raw count misleading. Likely safe. | If close to cap: split per faz (faz3-constants.ts, faz5-constants.ts, etc) |
| `src/renderer/scene/audio/destruction-audio.ts` | 831 | Audio entry point — extension risk if new faz added. Sprint 9 ships NO new audio per directive. | Already split: faz45 + faz8 helpers exist; faz3/faz6 could split similarly |
| `src/renderer/scene/destruction/destruction-director.ts` | 722 | Director orchestrates faz sequence. Sprint 9 ships NO faz changes. | Per-faz dispatch helpers |
| `src/renderer/i18n/strings.ts` | 721 | i18n catalog — Sprint 9 ships ZERO new strings. | Per-locale split if needed |
| `src/renderer/scene/destruction/types.ts` | 694 | Type definitions — comment-heavy DTOs. | Per-faz type module if needed |
| `src/renderer/scene/audio/destruction-audio-faz8.ts` | 663 | Sprint 8 deliverable; recently extended. | Per-sub-effect helper extraction |
| `src/renderer/scene/audio/destruction-audio-faz45.ts` | 572 | Sprint 8 already split ElectricalBuzz helper out (`destruction-audio-faz45-buzz.ts`). | Further per-effect split if Lane A extends |

## Acceptance gate for Phase 1 M7

- [x] Enumeration command run at HEAD `9f638ef`
- [x] Raw line count table captured verbatim
- [x] Counting convention vs lint-cap divergence documented (raw ≠ effective)
- [x] Lane A pre-cautions tabulated for top-7 risk files
- [x] Sprint 9 source-touch surface = ZERO documented (no `src/*.ts` edits expected)

Lane A reads this file at Phase 2B start. If Lane A's audit work scope expands
to include any `src/*.ts` extension, this table tells them which files need
pre-split planning vs which have comment headroom.
