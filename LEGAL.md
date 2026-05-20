# LEGAL — Rus Ruleti

> Sprint 3 Model Freeze Checkpoint skeleton. Final fill at Sprint 9 release
> prep (`shipper` + `compliance-expert` agents — see PLAN.md §11 Sprint 9).

This file is the central audit trail for every third-party asset bundled
with the application. Every CC-BY / SIL-OFL / similar attribution clause
is satisfied here so the redistributable build (`dist/Rus Ruleti-*.dmg` /
`.exe`) is license-compliant without requiring the user to chase any
external attribution.

---

## 3D Model Assets (Sprint 3 vendored)

Vendored under `src/renderer/assets/models/` per PLAN.md §10 line 498-520
(Sprint 3 B3 hybrid plan: Poly Pizza CC0 + CC-BY). Source-of-truth
inventory + author URLs live in
`src/renderer/assets/models/README.md`.

### CC0 (no attribution required — credited as good practice)

| File           | Source URL                                  | Author     |
|----------------|---------------------------------------------|------------|
| `revolver.glb` | https://poly.pizza/m/E7IaG9TptR             | Quaternius |
| `chair.glb`    | https://poly.pizza/m/iMNqRzPwwe             | Quaternius |
| `radio.glb`    | https://poly.pizza/m/TPqvwkyWdV             | Quaternius |
| `bottle.glb`   | https://poly.pizza/m/FAHsHFXfTf             | Quaternius |

### CC-BY 4.0 (attribution required)

| File             | Source URL                          | Author     |
|------------------|-------------------------------------|------------|
| `table.glb`      | https://poly.pizza/m/7qAyGZnerYt    | dook       |
| `ashtray.glb`    | https://poly.pizza/m/aHmJIWIr1vI    | dook       |
| `lightbulb.glb`  | https://poly.pizza/m/4TkYCZMlbS6    | Jason Toff |

Required attribution text:

```text
3D Models:
- "Table" by dook — Licensed under CC BY 4.0 — https://poly.pizza/m/7qAyGZnerYt
- "Ashtray" by dook — Licensed under CC BY 4.0 — https://poly.pizza/m/aHmJIWIr1vI
- "Light bulb" by Jason Toff — Licensed under CC BY 4.0 — https://poly.pizza/m/4TkYCZMlbS6
```

### User-vendored Sketchfab assets (`incoming/`)

If the user drops Sketchfab CC-BY GLBs into
`src/renderer/assets/models/incoming/` and the orchestrator vendors them
(see `src/renderer/assets/models/incoming/README.md`), this section
**MUST** be appended with the same author + URL + license rows BEFORE
the vendored files leave the `incoming/` staging directory.

Sprint 3 Phase 1 scaffold: no Sketchfab files are currently vendored.

---

## Fonts

All fonts are SIL Open Font License 1.1 — verbatim license copies live
beside the woff2 files under `src/renderer/fonts/`. Detailed attribution
log is duplicated in PLAN.md §10 lines 473-496.

| Family              | Vendor / Author        | License        | Bundled at                                  |
|---------------------|------------------------|----------------|---------------------------------------------|
| DSEG7-Classic       | keshikan (2017–)       | SIL OFL 1.1    | `src/renderer/fonts/dseg/`                  |
| Old Standard TT     | Alexei Kryukov         | SIL OFL 1.1    | `src/renderer/fonts/old-standard-tt/`       |
| PT Serif            | ParaType               | SIL OFL 1.1    | `src/renderer/fonts/pt-serif/`              |

Microsoft Cascadia Code / Segoe UI Variable will be added during Sprint 5
(Faz 6 BSOD work) — both are SIL OFL 1.1 from Microsoft's GitHub releases.

Apple system fonts (SF Pro Display, SF Mono) are **referenced via CSS**
during the macOS destruction phase but **NOT bundled** — they fall through
to the host OS font registry. This is intentional per PLAN §10 line 467
(C1 risk mitigation) and the LEGAL implication is that no Apple font
binary ships with the build.

---

## SHA-256 Manifest (Model Freeze Checkpoint, Sprint 3)

> **FROZEN 2026-05-21** at Sprint 3 sign-off. Sprint 4+ may NOT modify
> these GLB files without explicit model-revision sprint (PLAN.md §11
> follow-up) + new audit pass.

The model freeze checkpoint (PLAN.md §11 Sprint 3 last task, §12 S4 risk
"Model gecikmesi") locks the byte-for-byte contents of every GLB so a
later Sprint 4 kick/recoil test cannot diverge silently.

Source of truth: `src/renderer/assets/models/SHA256-MANIFEST.txt`

```
baf3129379324bf0ef323cb2d325459ec5bd603818a1129877d76c8c4391c5e7  ashtray.glb
7245e26241cac72d63aa6ad9efb02b32c1d13ff2dd8648401ab14494b5d181f6  bottle.glb
bdc6aeeb64524bbdccba2f079e6485e2a372aed1c428d976d5da67aadcf18b7a  chair.glb
6992c610325bb10e91c3d5ff8abb77b473ab0b38167ed8bad8bb98905cea3e11  lightbulb.glb
9e5c7934f44ee538446e6f54cbe9c09d4e49a7e78ee2e7f16d4cc7483c43e710  radio.glb
d1260ba6e241d589f7a48d88b0350d4c3bb7000b0d81b8b3dadc45d790b7b141  revolver.glb
c2c626948581e2bff027488e020815e57a4380837a1a1a3731e71fce49e6c203  table.glb
```

**Verification command** (Sprint 4+ pre-commit hook recommended):
```bash
shasum -a 256 -c src/renderer/assets/models/SHA256-MANIFEST.txt
```

**Revision protocol:** If a future sprint needs to swap a GLB (e.g., Sprint 6
Sketchfab Nagant override per `revolver-direction.md` §9), the protocol is:
1. Vendor the new GLB into `incoming/`
2. Update `src/renderer/assets/models/README.md` attribution table
3. Regenerate `SHA256-MANIFEST.txt`
4. Update this LEGAL.md section with new hash
5. Commit as `chore(model-revision): swap <asset>.glb (justification)`
6. New audit pass by security-reviewer.

---

## License boilerplate URLs

- **CC0 1.0 Universal** — https://creativecommons.org/publicdomain/zero/1.0/
- **CC-BY 4.0**         — https://creativecommons.org/licenses/by/4.0/
- **SIL OFL 1.1**       — https://scripts.sil.org/OFL_web

---

## Attribution requirement satisfaction (CC-BY)

The CC-BY 4.0 assets (`table.glb`, `ashtray.glb`, `lightbulb.glb`)
require attribution in:

1. **This file (LEGAL.md)** — DONE above.
2. **App About screen** — STUBBED. Sprint 6 (reveal & polish, see PLAN.md
   §11 Sprint 6) wires the attribution panel into the reveal-lite UI. The
   panel reads the rows from `src/renderer/assets/models/README.md`
   programmatically so the LEGAL/About duplication stays in sync.
3. **`src/renderer/assets/models/README.md`** — DONE (Sprint 3 vendor pass).

The CC0 assets (revolver, chair, radio, bottle by Quaternius) do **not**
require attribution but are credited above as good practice.

---

## Audio assets

Placeholder block — Sprint 3 finalises the audio layer (per PLAN.md §11
Sprint 3 task list) and the resulting `.ogg` / `.wav` files get rows
added here with their license + author. Sprint 0 → 2 audio is all
synthesised in-renderer (no asset files), so this section is currently
empty.

---

## Disclaimer (joke-app legal status)

The application simulates an OS destruction event for purposes of a
"şaka" (joke / prank). PLAN.md §9 enumerates every safety mechanism
(no `fs` / `child_process` / network in renderer or preload; the
disclaimer screen disclaims the simulated destruction; ESC-hold escape
hatch; `sandbox: true` electron). The `security-reviewer` audit chain
(PLAN.md §11 Sprint 0 + §17 retro logs) verifies the simulation cannot
touch real system state.

The compliance-expert agent runs the final audit during Sprint 9
release prep — see PLAN.md §11 Sprint 9 line 762.
