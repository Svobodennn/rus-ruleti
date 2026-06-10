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
| `chair.glb`    | https://poly.pizza/m/iMNqRzPwwe             | Quaternius |
| `radio.glb`    | https://poly.pizza/m/TPqvwkyWdV             | Quaternius |
| `bottle.glb`   | https://poly.pizza/m/FAHsHFXfTf             | Quaternius |

### CC-BY 4.0 (attribution required)

| File             | Source URL                          | Author     |
|------------------|-------------------------------------|------------|
| `table.glb`      | https://poly.pizza/m/7qAyGZnerYt    | dook       |
| `ashtray.glb`    | https://poly.pizza/m/aHmJIWIr1vI    | dook       |
| `lightbulb.glb`  | https://poly.pizza/m/4TkYCZMlbS6    | Jason Toff  |
| `revolver.glb`   | https://poly.pizza/m/AnsEmKwuu7     | austincford |

Required attribution text:

```text
3D Models:
- "Table" by dook — Licensed under CC BY 4.0 — https://poly.pizza/m/7qAyGZnerYt
- "Ashtray" by dook — Licensed under CC BY 4.0 — https://poly.pizza/m/aHmJIWIr1vI
- "Light bulb" by Jason Toff — Licensed under CC BY 4.0 — https://poly.pizza/m/4TkYCZMlbS6
- "Revolver" by austincford — Licensed under CC BY 4.0 — https://poly.pizza/m/AnsEmKwuu7
```

> Post-ship model swap: the original CC0 Quaternius revolver was monolithic
> (single fused mesh), so the spin animation rotated the whole gun. Replaced
> with austincford's rigged Magnum (CC-BY) — a separate `Revolving_Cylinder`
> node (bullets are its children) lets the spin rotate ONLY the cylinder.

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
fe750e2d1102cf3a677fd1111528500345e94e16d70a334bfb819d787e3c54e0  revolver.glb
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

## QR code asset (Sprint 5 Phase 2B Lane D)

| File | Path | Generated by | Encoded content |
|------|------|--------------|-----------------|
| `win-bsod-qr.png` | `src/renderer/assets/destruction/win-bsod-qr.png` | One-shot script using the `qrcode` (Python `qrcode` 8.2 / PyPI) library, 256×256, monochrome, error-correction level M, margin 2 cells. Disposable script (not committed). | Literal URL text: `https://www.windows.com/stopcode` |

### Generation method (Option B — one-shot PNG vendored)

Lane D chose **Option B (one-shot generation + commit)** over Option A
(build-time generation via `qrcode` npm dev-dependency). Reasoning:

1. The encoded URL is a stable, well-known Microsoft documentation URL
   that is unlikely to change at build time per environment.
2. Build-time generation would add `qrcode` (and transitively `dijkstrajs`,
   `pngjs`) as a permanent dev-dependency for a one-time-ish asset.
3. Committing the PNG keeps the build deterministic (`shasum` of the
   asset is stable; no per-build entropy).
4. Sprint 4 Lesson #4 (no proprietary asset bundle) is upheld — the QR
   is a procedural encoding of textual URL data, NOT Microsoft IP.

Reproduction command (for a Sprint 6+ regeneration if the URL is ever
swapped):

```bash
python3 -c "
import qrcode
from qrcode.constants import ERROR_CORRECT_M

qr = qrcode.QRCode(version=None, error_correction=ERROR_CORRECT_M,
                   box_size=10, border=2)
qr.add_data('https://www.windows.com/stopcode')
qr.make(fit=True)
img = qr.make_image(fill_color='black', back_color='white').resize((256, 256))
img.save('src/renderer/assets/destruction/win-bsod-qr.png')
"
```

Decode verification (Sprint 5 sign-off):

```bash
python3 -c "
import cv2
img = cv2.imread('src/renderer/assets/destruction/win-bsod-qr.png')
data, _, _ = cv2.QRCodeDetector().detectAndDecode(img)
assert data == 'https://www.windows.com/stopcode', f'mismatch: {data}'
print('OK', data)
"
```

### Trademark / IP analysis

| Risk | Status | Notes |
|------|--------|-------|
| S7 — URL becomes stale if Microsoft retires `/stopcode` path | OPEN — Sprint 9 compliance-expert re-check | Asset can be regenerated with new URL via the reproduction command above. The QR PNG ships with the build for offline determinism; staleness only manifests if a user scans the code and Microsoft has 404'd the URL, which is graceful in-joke degradation. |
| S8 — Real QR could be argued to be Microsoft IP | **MITIGATED** | The QR encodes a URL text string only. The QR rendering algorithm is the open ISO/IEC 18004 standard. The destination URL is public Microsoft documentation. Per directive §3 S8 closure: "real QR is acceptable because it's textual URL data, not MS logo/IP." No Microsoft wordmark appears on-screen alongside the QR (the BSOD chrome uses "Stop code: CRITICAL_PROCESS_DIED" and a designer-fictional four-square header, never the word "Windows" as a wordmark). |

### Visual containment

The QR PNG is rendered ONLY inside the Faz 6 BSOD chrome
(`src/renderer/scene/destruction/chrome/win-bsod.ts`). It does NOT
appear in the lobby, the disclaimer, the Faz 1 dialog, or the Sprint 6
reveal. The bundled image is the SOLE branded-adjacent asset in the
build per directive Risk note "No bundled proprietary assets."

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

---

## Sprint 9 distributable verification — release artifact audit

**Auditor:** `kraken` Sprint 9 Lane A (2026-06-06)
**Scope:** Final pre-distribution attribution review covering all bundled
assets shipped via electron-builder DMG / ZIP / NSIS / MSI / AppImage / .deb.
**Method:** Direct filesystem inventory + SHA-256 byte-for-byte cross-check
against the Sprint 3 frozen manifest for binary stability; live `grep` for
audio binary references; provenance trace for each asset class through
`PLAN.md` + Sprint 3-8 retros + Phase 2A designer commit.

### Asset class verification

| # | Class | Files | Provenance | License | SHA-256 status | Audit verdict |
|---|---|---|---|---|---|---|
| 1 | Fonts (OFL bundle) | 14 files in `src/renderer/fonts/{old-standard-tt,pt-serif,dseg}/` (woff2 × 12 + ttf × 1 + woff × 1) + OFL.txt × 2 + LICENSE.txt × 1 + dseg/README.md | Sprint 0 vendor pass; PT Serif (ParaType), Old Standard TT (Alexei Kryukov), DSEG7-Classic (keshikan) | SIL OFL 1.1 (verbatim LICENSE shipped beside each woff2) | UNCHANGED since Sprint 0 baseline; 14 SHA-256s captured this audit (see §6 below) | VERIFIED — attribution complete; LICENSE binaries shipped with asar |
| 2 | 3D Models (Poly Pizza CC0) | `revolver.glb`, `chair.glb`, `radio.glb`, `bottle.glb` | Quaternius via poly.pizza (Sprint 3 vendor pass per PLAN §10) | CC0 1.0 Universal | UNCHANGED since Sprint 3 freeze 2026-05-21 — all 4 SHA-256s match `SHA256-MANIFEST.txt` byte-for-byte | VERIFIED — attribution credited (not required), shipped in src/renderer/assets/models/ |
| 3 | 3D Models (Poly Pizza CC-BY 4.0) | `table.glb`, `ashtray.glb`, `lightbulb.glb` | dook (table + ashtray), Jason Toff (lightbulb) via poly.pizza | CC-BY 4.0 (attribution required) | UNCHANGED since Sprint 3 freeze — all 3 SHA-256s match `SHA256-MANIFEST.txt` byte-for-byte | VERIFIED — attribution clauses satisfied in LEGAL §3D Model Assets + Sprint 6 About-screen panel + assets/models/README.md |
| 4 | Audio (procedural only) | NONE bundled | 100% procedural synthesis via Web Audio + Howler.js silent placeholders (PLAN §7, Sprint 4 Lesson 3 TH-S4-03 canonical) | N/A (no third-party) | `find src resources -type f \( -name "*.ogg" -o -name "*.wav" -o -name "*.mp3" -o -name "*.m4a" -o -name "*.flac" \)` → ZERO matches | VERIFIED — TH-S4-03 procedural canonical contract upheld through Sprint 8 |
| 5 | QR code asset (Faz 6 BSOD) | `src/renderer/assets/destruction/win-bsod-qr.png` (256×256, 1-bit grayscale PNG) | Sprint 5 Phase 2B Lane D one-shot Python `qrcode` library generation; encodes literal URL text `https://www.windows.com/stopcode` | N/A (procedural QR encoding of public URL string; ISO/IEC 18004 standard) | UNCHANGED since Sprint 5 Lane D commit; SHA-256 `2c2bc1252ca3ca2f104f2bd7469abf684259c9c697bb739839e35a2bc84eeb64` | VERIFIED — Sprint 5 §3 S8 closure ratified: textual URL data, not MS logo/wordmark; visual containment to Faz 6 BSOD chrome only |
| 6 | Disclaimer copy (bilingual) | Cyrillic + Turkish strings in `src/renderer/i18n/strings.ts` — `disclaimer.bodyLine1: 'Это игра.'` + Faz 8 reveal `disclaimer.primary: 'Это просто шутка.'` + `disclaimer.secondary: 'Bu sadece bir şaka.'` | Designer-authored bilingual original (Sprint 1 Faz 0 + Sprint 6 Faz 8); no third-party copy | N/A (original creative content) | UNCHANGED since Sprint 6 Faz 8 (`grep -rn "şaka\|disclaimer\|Это" src/renderer/i18n/` confirms both Cyrillic literals + Turkish literal verbatim) | VERIFIED — original creative content; no third-party text |
| 7 | Designer SVGs (Phase 2A sources) | `resources/design/icon-master.svg` (1024×1024) + `dmg-bg.svg` (600×400) + `nsis-banner.svg` (497×312) | Sprint 9 Phase 2A designer commit `c700797` — original work; Cyrillic РР glyph composition redrawn as closed silhouette path using Old Standard TT Regular as reference (per §26 LEGAL row) — NO font binary embedded | Original (no third-party); reference font is OFL-licensed Sprint 0 bundle but only used as glyph shape inspiration, not embedded | NEW Sprint 9 — SHAs: icon-master `213d6f471bb058f690dea3e8c49d1c9eecfee35878885b4960c2db4c0e4e1adc`; dmg-bg `02cdd60318a75ce745fd87c233de5ab90b779c0ee82b980cb4fb8a552386ceae`; nsis-banner `d59c792835019cd9b845bc16081a8059675c86913135e7eb97412c789dccca90` | VERIFIED — designer's original Sprint 9 work |
| 8 | Sprint 9 raster artifacts (Lane A M2) | `build/icon.icns` + `build/icon.ico` + `build/icon.png` + `build/dmg-bg.png` + `build/nsis-banner.bmp` | Mechanical derivatives of Phase 2A SVGs; rasterized via macOS `sips` + `iconutil` + repo-local `scripts/pack-ico.cjs` Node helper (Sprint 9 Lane A M2 commit `0fa6b5b`) — see CODE-SIGNING.md §6 for reproduction | Inherits from SVG source (original Sprint 9 designer work); no new third-party content introduced by rasterization step | NEW Sprint 9 — SHAs: icon.icns `926ade35e552b02dd1d6124c6a176b237fdf203d9a28961e3cdd01e529b2724d`; icon.ico `869f8e63c9bbeaec6af811e809e48416431587644b2b303695b3ee077574cf1f`; icon.png `8110a53d5703ded4869a57bdd23db185c8c0f20e1d3b55ffa0f9ce34a5a252cf`; dmg-bg.png `0bfe52f1eaecf6406631d355ab8e1daf025c39217ad66a3f5a1ba6c8fbdc979d`; nsis-banner.bmp `8b0b696b53b9ee0648d27aab14e273dbb30ee27ef1cb407961e917237c6df616` | VERIFIED — mechanical derivative; provenance traces to §7 designer SVGs |
| 9 | App-bundled boilerplate (electron-vite scaffold) | `out/main`, `out/preload`, `out/renderer` bundles emitted at build time; `package.json` shipped in asar root | electron-vite build pipeline from `src/main/`, `src/preload/`, `src/renderer/` sources | Original Sprint 0-8 work (CC0-equivalent first-party); MIT-licensed runtime deps pruned to production-only by electron-builder asar packer | Generated at build time — not vendored; per-build SHA varies | VERIFIED — first-party only; no third-party binary in `out/` |
| 10 | Microsoft Cascadia / Segoe UI Variable (planned Sprint 5) | NOT BUNDLED | Sprint 5 Faz 6 BSOD work shipped without these fonts (alternative approach chosen — host-OS Segoe UI fallback via CSS, per PLAN §10 Apple-fonts precedent) | N/A (deliberately not bundled) | UNCHANGED — never added (Sprint 5 outcome) | VERIFIED — `find src -iname "*cascadia*" -o -iname "*segoe*"` returns ZERO; no Microsoft font binary in build |
| 11 | Apple system fonts (SF Pro Display, SF Mono) | NOT BUNDLED (CSS reference only — falls through to host OS) | macOS destruction-phase CSS @font-face declarations reference SF Pro Display / SF Mono by name but the binaries are NEVER bundled (PLAN §10 line 467 C1 mitigation) | N/A (deliberately not bundled — host OS registry) | UNCHANGED — never added | VERIFIED — no Apple font binary in build; host-OS fallback only |
| 12 | electron-builder cert/notarize stubs | `electron-builder.yml` references env vars (APPLE_TEAM_ID, CSC_LINK, etc.) — NO cert files in repo | Maintainer-managed secret manager (out-of-band per build/CODE-SIGNING.md §1-§2) | N/A (env-var contract; certs proprietary to maintainer) | UNCHANGED — never in repo | VERIFIED — no secrets / no cert binaries committed to git |

### Distributable closure statement

All bundled assets verified original or properly licensed (CC0 / OFL / N/A
procedural). NO Apple/Microsoft proprietary IP bundled (Sprint 4-7 designer-
fictional SVG strategy confirmed; Sprint 9 Phase 2A continued precedent —
icon-master.svg is original Cyrillic monogram, not Apple/Microsoft icon-
language). NO third-party audio bundled (Sprint 4-8 procedural synthesis
canonical per TH-S4-03; Sprint 9 audit `find` confirms ZERO `.ogg`/`.wav`/
`.mp3`/`.m4a`/`.flac` binary files in src/ or resources/). Sprint 9 ship-
ready from attribution perspective.

**Sprint 3 SHA-256 manifest stability:** ALL 7 GLB hashes match Sprint 3
freeze byte-for-byte (verified via `shasum -a 256` against
`src/renderer/assets/models/SHA256-MANIFEST.txt`). ZERO drift detected. The
Sprint 3 model-revision protocol was never invoked (no Sprint 4-8 GLB swap),
so the Sprint 9 audit confirms the freeze contract upheld.

**Sprint 9 NEW asset classes:** 2 (item 7 Phase 2A SVGs + item 8 Lane A M2
rasters). Both fully attributed to designer's original work for Sprint 9
release; no third-party content introduced.

### Font SHA-256 reference (Sprint 9 audit snapshot)

Captured during this audit to enable a future Sprint 9.x or Sprint 10 re-
verification without re-derivation:

```
035b7c25a72ff663c5feaab8602dfe18689803bbe73103f2fbc09c77e2f6840f  old-standard-tt/cyrillic-italic-400.woff2
050aee25e3462f72c4d357ee964b8df1801e701bae8af275b697581a87c04a48  pt-serif/cyrillic-regular-400.woff2
189ea179284724aff1d453cb7c85eb0058627200f67ef7c44dd4e2abc644c9d2  old-standard-tt/latin-italic-400.woff2
4271064a37f3ffc0aac5f3806db8a72acc23e19447d1804e4e80d8796cbf6330  pt-serif/latin-regular-400.woff2
46b2eddd9d4344e4c3221fe26f766595c02734362a4915a2c1bf3fbd9f4a5e22  old-standard-tt/cyrillic-bold-700.woff2
49d5afd6386bf3f22660a6a7633c70505c5011dc8a1ab7ff5da1515604028a36  old-standard-tt/cyrillic-regular-400.woff2
52d24e5960257c67b198c2e9098fc9663dbced0e0e2fc3f305987cdfa350caaf  old-standard-tt/latin-regular-400.woff2
8a61b7dbc89367dbc0face2541ed69a2bf0cc05b23d1064f670284ab61044481  dseg/DSEG7-Classic-Regular.woff2
9d1c80c9a947548f5da15b917f693b2b1df148e807c212cce877793d326149c4  pt-serif/cyrillic-italic-400.woff2
bec4e724c49bde6d6b3f15038c8015f5dc7c810bdaadd3aee537ab72afc50e4a  pt-serif/cyrillic-bold-700.woff2
bf23a7a4eebedbb87d4084a69496b29815914a18e339a00f5dc73a03c9c9328f  pt-serif/latin-bold-700.woff2
c2f2e80290b457a7e8039303255528d17e0ef58760f986070cd832b55b00b946  old-standard-tt/latin-bold-700.woff2
cb373bde18855c82a0ebf2946ea661ebd0be58a7fbabdf20f7744ecd9c0a9cfd  pt-serif/latin-italic-400.woff2
e3270928ced68082f32d3b62877a6741426116335ac0832919326341a8b5cfaf  dseg/DSEG7-Classic-Regular.ttf
fcff68b91834e83453dddf65cd9d840124bdfc322a3f72f03c6bc46be4bc0827  dseg/DSEG7-Classic-Regular.woff
```

### Audit invariants confirmed

1. NO `.ogg`/`.wav`/`.mp3`/`.m4a`/`.flac` binary files in `src/` or
   `resources/` — TH-S4-03 procedural-canonical contract upheld
   (Sprint 4-8 + Sprint 9 audit pass).
2. NO Apple/Microsoft font binary in `src/renderer/fonts/` — host-OS CSS
   fallback only (PLAN §10 line 467 C1 mitigation upheld).
3. NO Sprint 4-7 designer SVGs in `src/` (designer chose CSS / HTML
   inline approach; only Sprint 9 Phase 2A SVGs exist as separate `.svg`
   files in `resources/design/`).
4. NO cert / `.p12` / `.pfx` / `.p8` / Apple API key files in repo —
   electron-builder env-var contract via maintainer's secret manager only.
5. ALL 7 Sprint 3 GLB SHA-256s match `SHA256-MANIFEST.txt` byte-for-byte
   — Sprint 3 model-freeze contract upheld through Sprint 9.

### Verdict

**ATTRIBUTION SHIP-READY.** Zero MAJOR drift; zero new BLOCKER conditions
introduced Sprint 4-9; all attribution clauses satisfied; bundle composed
exclusively of original first-party content + permissively-licensed third-
party assets with full attribution chain documented.
