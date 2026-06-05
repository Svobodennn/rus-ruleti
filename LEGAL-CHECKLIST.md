# LEGAL Checklist — rus-ruleti distributable asset audit

> **Status:** Sprint 9 Phase 1 TEMPLATE. Sprint 9 Lane A Phase 2B fills in
> `Re-verify SHA-256` and `Status` columns with verified hashes and
> `VERIFIED 2026-06-06` (or whichever ship date) markers.
>
> Companion to `LEGAL.md` (Sprint 5 baseline 232L + Sprint 9 Lane A appended
> distributable verification section). This checklist is the operational
> per-asset audit table; `LEGAL.md` is the narrative legal posture document.

---

## Sprint 9 distributable asset verification checklist

For each asset class shipped in the release distributable, Lane A Phase 2B
verifies provenance, license compatibility, content integrity (SHA-256 where
applicable), and final status (VERIFIED / UNCHANGED-SINCE-SPRINT-N / NEW).

| Asset class | Provenance | License | Re-verify SHA-256 | Status |
|---|---|---|---|---|
| Fonts: Old Standard TT | https://fonts.google.com/specimen/Old+Standard+TT (Alexey Kryukov) | OFL 1.1 | (Lane A fills) | (Lane A fills VERIFIED YYYY-MM-DD) |
| Fonts: PT Serif | https://fonts.google.com/specimen/PT+Serif (ParaType) | OFL 1.1 | (Lane A fills) | (Lane A fills) |
| Fonts: DSEG7-Classic | https://www.keshikan.net/fonts-e.html (Keshikan) | OFL 1.1 | (Lane A fills) | (Lane A fills) |
| 3D model: revolver.glb | Sketchfab CC0 (link Lane A re-confirms from LEGAL.md §Sprint 3) | CC0 | (Lane A fills) | (Lane A fills) |
| 3D model: lightbulb.glb | Sketchfab CC0 (Lane A re-confirms from LEGAL.md §Sprint 3) | CC0 | (Lane A fills) | (Lane A fills) |
| 3D model: table.glb | Sketchfab CC0 (Lane A re-confirms from LEGAL.md §Sprint 3) | CC0 | (Lane A fills) | (Lane A fills) |
| 3D model: chair.glb | Sketchfab CC0 (Lane A re-confirms from LEGAL.md §Sprint 3) | CC0 | (Lane A fills) | (Lane A fills) |
| 3D model: radio.glb | Sketchfab CC0 (Lane A re-confirms from LEGAL.md §Sprint 3) | CC0 | (Lane A fills) | (Lane A fills) |
| 3D model: bottle.glb | Sketchfab CC0 (Lane A re-confirms from LEGAL.md §Sprint 3) | CC0 | (Lane A fills) | (Lane A fills) |
| 3D model: ashtray.glb | Sketchfab CC0 (Lane A re-confirms from LEGAL.md §Sprint 3) | CC0 | (Lane A fills) | (Lane A fills) |
| Audio: ALL procedural (TH-S4-03 canonical) | N/A — synthesized at runtime via Web Audio AudioContext (zero bundled `.ogg` / `.wav` / `.mp3`) | N/A | N/A | (Lane A fills VERIFIED — grep `src/` confirms 0 audio file imports) |
| QR PNG (Faz 6 BSOD) | Procedurally generated at runtime (qrcode-generator JS or canvas draw); the encoded URL is hardcoded string in source — image is NOT bundled | N/A | N/A (procedural) | (Lane A fills) |
| Designer SVGs (Win11 logo paths, Big Sur wallpaper, eaten-apple, four-square Win) | Designer original (Sprint 4-7 — drawn to avoid Apple/MS IP per LEGAL.md disclaimer) | N/A (original work) | (Lane A fills if any are file-shipped) | (Lane A fills) |
| NEW Sprint 9: build/icon.icns | Designer original (Sprint 9 Phase 2A Sovyet brutalist mark) | N/A (original work) | (Lane A fills) | (Lane A fills) |
| NEW Sprint 9: build/icon.ico | Designer original (Sprint 9 Phase 2A; derived from same 1024×1024 master) | N/A (original work) | (Lane A fills) | (Lane A fills) |
| NEW Sprint 9: build/icon.png | Designer original (Sprint 9 Phase 2A; 512×512 from same master) | N/A (original work) | (Lane A fills) | (Lane A fills) |
| Cyrillic + TR disclaimer copy | Original wording (intro screen + reveal screen + NSIS installer license panel) | N/A (original wording) | N/A | (Lane A fills VERIFIED — original prose, no copy-paste source) |

---

## Audit dimensions (Lane A Phase 2B procedure)

For each row above:

1. **Provenance re-confirm.** Open LEGAL.md and cross-reference the link/source
   noted in the Sprint 3 / Sprint 5 baseline sections. If no link present
   (designer originals), flag as `Original work — designer attestation` in
   the Status column.
2. **License re-confirm.** Verify the license string is still accurate (OFL
   1.1 / CC0 / Original / N/A). If the upstream source has changed license
   since Sprint 3 (rare but possible for Sketchfab models), flag as MAJOR
   in Lane A Phase 2B output and escalate to orchestrator.
3. **SHA-256 re-compute.** For bundled binary assets (fonts in `resources/fonts/`,
   3D models in `resources/models/` or wherever Sprint 3 vendored them):
   - Run `shasum -a 256 <file>` on each.
   - Compare against the SHA-256 manifest in LEGAL.md §Sprint 3 Model Freeze
     Checkpoint.
   - If hash drift: FLAG MAJOR — file changed without LEGAL.md update.
4. **Status update.** Fill `VERIFIED YYYY-MM-DD` (where YYYY-MM-DD is the
   ship date — typically 2026-06-06 or later per Sprint 9 Phase 2B execution
   day) for each VERIFIED row. For NEW Sprint 9 icons, mark `NEW Sprint 9 —
   designer attestation YYYY-MM-DD`.

---

## Acceptance gate

Sprint 9 Lane A Phase 2B reports PASS to orchestrator when ALL rows above
have a non-`(Lane A fills)` value in the Re-verify SHA-256 + Status columns
(or N/A as appropriate for procedural assets).

If ANY row has hash drift OR provenance change OR license change since the
Sprint 3 / 5 baselines: FLAG MAJOR in Lane A output → orchestrator routes
to Phase 4 spark consolidation OR escalates to manual maintainer review.

See `scripts/release-checklist.md` Pre-ship section — LEGAL.md + this
checklist completion is a required gate before ship tag.

---

## Reference baselines

- **LEGAL.md** (Sprint 5 baseline, 232 lines as of HEAD `8ef4a3c`) — narrative
  legal posture, §3D Model Assets, §Fonts, §SHA-256 Manifest, §License
  boilerplate URLs, §Attribution requirement satisfaction, §Audio assets,
  §QR code asset, §Disclaimer.
- **Sprint 3 Model Freeze Checkpoint** — canonical SHA-256 manifest for
  vendored 3D models; Lane A Phase 2B compares re-computed hashes against
  this baseline.
- **TH-S4-03 (Sprint 4 lesson)** — audio is 100% procedural; no `.ogg` /
  `.wav` / `.mp3` files are bundled. Lane A verifies via `grep -r '\.ogg\|\.wav\|\.mp3' src/`
  returning zero matches.
- **PLAN.md §14 Build & Dağıtım** — references this checklist as the gate
  closure mechanism for distributable verification.

