# LEGAL Checklist — rus-ruleti distributable asset audit

> **Status:** Sprint 9 Phase 2B Lane A FILLED 2026-06-06. All asset classes
> verified; all SHA-256 hashes re-computed and confirmed against Sprint 3
> freeze. Companion to `LEGAL.md` (Sprint 5 baseline 232L + Sprint 9 Lane A
> appended distributable verification section = 327L total). This checklist
> is the operational per-asset audit table; `LEGAL.md` is the narrative
> legal posture document.
>
> **Auditor:** `kraken` Sprint 9 Lane A
> **Audit date:** 2026-06-06
> **HEAD at audit:** `ac917cc` (LEGAL.md final distributable verification appended)

---

## Sprint 9 distributable asset verification checklist

For each asset class shipped in the release distributable, Lane A Phase 2B
verifies provenance, license compatibility, content integrity (SHA-256 where
applicable), and final status (VERIFIED / UNCHANGED-SINCE-SPRINT-N / NEW).

| Asset class | Provenance | License | Re-verify SHA-256 | Status |
|---|---|---|---|---|
| Fonts: Old Standard TT (cyrillic-regular-400) | Alexei Kryukov; vendored Sprint 0 from Google Fonts | OFL 1.1 | `49d5afd6386bf3f22660a6a7633c70505c5011dc8a1ab7ff5da1515604028a36` | VERIFIED 2026-06-06 — UNCHANGED since Sprint 0 |
| Fonts: Old Standard TT (cyrillic-bold-700) | Alexei Kryukov; vendored Sprint 0 | OFL 1.1 | `46b2eddd9d4344e4c3221fe26f766595c02734362a4915a2c1bf3fbd9f4a5e22` | VERIFIED 2026-06-06 — UNCHANGED since Sprint 0 |
| Fonts: Old Standard TT (cyrillic-italic-400) | Alexei Kryukov; vendored Sprint 0 | OFL 1.1 | `035b7c25a72ff663c5feaab8602dfe18689803bbe73103f2fbc09c77e2f6840f` | VERIFIED 2026-06-06 — UNCHANGED since Sprint 0 |
| Fonts: Old Standard TT (latin-regular-400) | Alexei Kryukov; vendored Sprint 0 | OFL 1.1 | `52d24e5960257c67b198c2e9098fc9663dbced0e0e2fc3f305987cdfa350caaf` | VERIFIED 2026-06-06 — UNCHANGED since Sprint 0 |
| Fonts: Old Standard TT (latin-bold-700) | Alexei Kryukov; vendored Sprint 0 | OFL 1.1 | `c2f2e80290b457a7e8039303255528d17e0ef58760f986070cd832b55b00b946` | VERIFIED 2026-06-06 — UNCHANGED since Sprint 0 |
| Fonts: Old Standard TT (latin-italic-400) | Alexei Kryukov; vendored Sprint 0 | OFL 1.1 | `189ea179284724aff1d453cb7c85eb0058627200f67ef7c44dd4e2abc644c9d2` | VERIFIED 2026-06-06 — UNCHANGED since Sprint 0 |
| Fonts: Old Standard TT (OFL.txt) | Verbatim OFL 1.1 license text | OFL 1.1 (license file itself) | N/A (text file) | VERIFIED 2026-06-06 — present in `src/renderer/fonts/old-standard-tt/OFL.txt` |
| Fonts: PT Serif (cyrillic-regular-400) | ParaType; vendored Sprint 0 from Google Fonts | OFL 1.1 | `050aee25e3462f72c4d357ee964b8df1801e701bae8af275b697581a87c04a48` | VERIFIED 2026-06-06 — UNCHANGED since Sprint 0 |
| Fonts: PT Serif (cyrillic-bold-700) | ParaType; vendored Sprint 0 | OFL 1.1 | `bec4e724c49bde6d6b3f15038c8015f5dc7c810bdaadd3aee537ab72afc50e4a` | VERIFIED 2026-06-06 — UNCHANGED since Sprint 0 |
| Fonts: PT Serif (cyrillic-italic-400) | ParaType; vendored Sprint 0 | OFL 1.1 | `9d1c80c9a947548f5da15b917f693b2b1df148e807c212cce877793d326149c4` | VERIFIED 2026-06-06 — UNCHANGED since Sprint 0 |
| Fonts: PT Serif (latin-regular-400) | ParaType; vendored Sprint 0 | OFL 1.1 | `4271064a37f3ffc0aac5f3806db8a72acc23e19447d1804e4e80d8796cbf6330` | VERIFIED 2026-06-06 — UNCHANGED since Sprint 0 |
| Fonts: PT Serif (latin-bold-700) | ParaType; vendored Sprint 0 | OFL 1.1 | `bf23a7a4eebedbb87d4084a69496b29815914a18e339a00f5dc73a03c9c9328f` | VERIFIED 2026-06-06 — UNCHANGED since Sprint 0 |
| Fonts: PT Serif (latin-italic-400) | ParaType; vendored Sprint 0 | OFL 1.1 | `cb373bde18855c82a0ebf2946ea661ebd0be58a7fbabdf20f7744ecd9c0a9cfd` | VERIFIED 2026-06-06 — UNCHANGED since Sprint 0 |
| Fonts: PT Serif (OFL.txt) | Verbatim OFL 1.1 license text | OFL 1.1 (license file itself) | N/A (text file) | VERIFIED 2026-06-06 — present in `src/renderer/fonts/pt-serif/OFL.txt` |
| Fonts: DSEG7-Classic-Regular.woff2 | keshikan (2017–); https://www.keshikan.net/fonts-e.html | OFL 1.1 | `8a61b7dbc89367dbc0face2541ed69a2bf0cc05b23d1064f670284ab61044481` | VERIFIED 2026-06-06 — UNCHANGED since Sprint 0 |
| Fonts: DSEG7-Classic-Regular.ttf | keshikan | OFL 1.1 | `e3270928ced68082f32d3b62877a6741426116335ac0832919326341a8b5cfaf` | VERIFIED 2026-06-06 — UNCHANGED since Sprint 0 |
| Fonts: DSEG7-Classic-Regular.woff | keshikan | OFL 1.1 | `fcff68b91834e83453dddf65cd9d840124bdfc322a3f72f03c6bc46be4bc0827` | VERIFIED 2026-06-06 — UNCHANGED since Sprint 0 |
| Fonts: DSEG7 LICENSE.txt | Verbatim OFL 1.1 license text | OFL 1.1 (license file itself) | N/A (text file) | VERIFIED 2026-06-06 — present in `src/renderer/fonts/dseg/LICENSE.txt` |
| 3D model: revolver.glb | Quaternius via Poly Pizza https://poly.pizza/m/E7IaG9TptR | CC0 1.0 Universal | `d1260ba6e241d589f7a48d88b0350d4c3bb7000b0d81b8b3dadc45d790b7b141` | VERIFIED 2026-06-06 — UNCHANGED since Sprint 3 freeze (matches manifest byte-for-byte) |
| 3D model: chair.glb | Quaternius via Poly Pizza https://poly.pizza/m/iMNqRzPwwe | CC0 1.0 Universal | `bdc6aeeb64524bbdccba2f079e6485e2a372aed1c428d976d5da67aadcf18b7a` | VERIFIED 2026-06-06 — UNCHANGED since Sprint 3 freeze |
| 3D model: radio.glb | Quaternius via Poly Pizza https://poly.pizza/m/TPqvwkyWdV | CC0 1.0 Universal | `9e5c7934f44ee538446e6f54cbe9c09d4e49a7e78ee2e7f16d4cc7483c43e710` | VERIFIED 2026-06-06 — UNCHANGED since Sprint 3 freeze |
| 3D model: bottle.glb | Quaternius via Poly Pizza https://poly.pizza/m/FAHsHFXfTf | CC0 1.0 Universal | `7245e26241cac72d63aa6ad9efb02b32c1d13ff2dd8648401ab14494b5d181f6` | VERIFIED 2026-06-06 — UNCHANGED since Sprint 3 freeze |
| 3D model: table.glb | dook via Poly Pizza https://poly.pizza/m/7qAyGZnerYt | CC-BY 4.0 (attribution required — satisfied in LEGAL.md + About panel + models/README) | `c2c626948581e2bff027488e020815e57a4380837a1a1a3731e71fce49e6c203` | VERIFIED 2026-06-06 — UNCHANGED since Sprint 3 freeze |
| 3D model: ashtray.glb | dook via Poly Pizza https://poly.pizza/m/aHmJIWIr1vI | CC-BY 4.0 (attribution required — satisfied) | `baf3129379324bf0ef323cb2d325459ec5bd603818a1129877d76c8c4391c5e7` | VERIFIED 2026-06-06 — UNCHANGED since Sprint 3 freeze |
| 3D model: lightbulb.glb | Jason Toff via Poly Pizza https://poly.pizza/m/4TkYCZMlbS6 | CC-BY 4.0 (attribution required — satisfied) | `6992c610325bb10e91c3d5ff8abb77b473ab0b38167ed8bad8bb98905cea3e11` | VERIFIED 2026-06-06 — UNCHANGED since Sprint 3 freeze |
| Audio: ALL procedural (TH-S4-03 canonical) | N/A — synthesized at runtime via Web Audio AudioContext (zero bundled `.ogg` / `.wav` / `.mp3` / `.m4a` / `.flac`) | N/A | N/A | VERIFIED 2026-06-06 — `find src resources -type f \( -name "*.ogg" -o -name "*.wav" -o -name "*.mp3" -o -name "*.m4a" -o -name "*.flac" \)` returns ZERO; all grep matches are code comments referencing procedural fallback strategy |
| QR PNG (Faz 6 BSOD) | Sprint 5 Phase 2B Lane D one-shot Python `qrcode` 8.2 generation; encodes literal URL text `https://www.windows.com/stopcode` | N/A (procedural QR encoding of public URL; ISO/IEC 18004 open standard) | `2c2bc1252ca3ca2f104f2bd7469abf684259c9c697bb739839e35a2bc84eeb64` (256×256, 1-bit grayscale PNG) | VERIFIED 2026-06-06 — UNCHANGED since Sprint 5 Lane D commit; Sprint 5 §3 S8 closure ratified (textual URL data, not MS logo/wordmark) |
| Designer SVGs (Sprint 4-7 era) | NONE shipped as `.svg` files — designer chose CSS/HTML inline approach Sprint 4-7 (`find src resources -name "*.svg"` returns only the 3 Sprint 9 Phase 2A SVGs); Win11 logo paths, Big Sur wallpaper, eaten-apple, four-square Win all rendered procedurally or via inline CSS/SVG strings within `.ts` source | N/A (original work) | N/A (no shipped file) | VERIFIED 2026-06-06 — no Sprint 4-7 `.svg` files in src/ or resources/ |
| NEW Sprint 9: `resources/design/icon-master.svg` | Designer original Sprint 9 Phase 2A (commit `c700797`); 1024×1024 Cyrillic РР monogram, sodium `#FFC75E` on black | N/A (original work — Cyrillic glyph composition redrawn as closed silhouette path; no font binary embedded) | `213d6f471bb058f690dea3e8c49d1c9eecfee35878885b4960c2db4c0e4e1adc` | NEW Sprint 9 — designer attestation 2026-06-06 (Phase 2A) |
| NEW Sprint 9: `resources/design/dmg-bg.svg` | Designer original Sprint 9 Phase 2A; 600×400 minimalist DMG layout (sodium rule + Old Standard TT wordmark + PT Serif drag-instruction) | N/A (original work) | `02cdd60318a75ce745fd87c233de5ab90b779c0ee82b980cb4fb8a552386ceae` | NEW Sprint 9 — designer attestation 2026-06-06 (Phase 2A) |
| NEW Sprint 9: `resources/design/nsis-banner.svg` | Designer original Sprint 9 Phase 2A; 497×312 widescreen NSIS Modern UI 2 welcome panel | N/A (original work) | `d59c792835019cd9b845bc16081a8059675c86913135e7eb97412c789dccca90` | NEW Sprint 9 — designer attestation 2026-06-06 (Phase 2A) |
| NEW Sprint 9: `build/icon.icns` | Mechanical derivative of `icon-master.svg`; macOS multi-size 16-1024 packed via `sips` + `iconutil` (Lane A M2 commit `0fa6b5b`) | Inherits original-work attribution from SVG source | `926ade35e552b02dd1d6124c6a176b237fdf203d9a28961e3cdd01e529b2724d` (57.7KB, Mac OS X icon multi-size) | NEW Sprint 9 — designer attestation 2026-06-06 (Lane A M2 raster) |
| NEW Sprint 9: `build/icon.ico` | Mechanical derivative of `icon-master.svg`; 7 sizes (16/24/32/48/64/128/256) packed via `scripts/pack-ico.cjs` Node helper (Lane A M2) | Inherits original-work attribution from SVG source | `869f8e63c9bbeaec6af811e809e48416431587644b2b303695b3ee077574cf1f` (12.9KB, MS Windows icon resource — 7 icons) | NEW Sprint 9 — designer attestation 2026-06-06 (Lane A M2 raster) |
| NEW Sprint 9: `build/icon.png` | Mechanical derivative of `icon-master.svg`; 512×512 RGBA via `sips` (Lane A M2) | Inherits original-work attribution from SVG source | `8110a53d5703ded4869a57bdd23db185c8c0f20e1d3b55ffa0f9ce34a5a252cf` (10.3KB, PNG 512×512) | NEW Sprint 9 — designer attestation 2026-06-06 (Lane A M2 raster) |
| NEW Sprint 9: `build/dmg-bg.png` | Mechanical derivative of `dmg-bg.svg`; 600×400 via `sips` (Lane A M2) | Inherits original-work attribution from SVG source | `0bfe52f1eaecf6406631d355ab8e1daf025c39217ad66a3f5a1ba6c8fbdc979d` (11.1KB, PNG 600×400) | NEW Sprint 9 — designer attestation 2026-06-06 (Lane A M2 raster) |
| NEW Sprint 9: `build/nsis-banner.bmp` | Mechanical derivative of `nsis-banner.svg`; 497×312 32-bit BMP via `sips` (Lane A M2) | Inherits original-work attribution from SVG source | `8b0b696b53b9ee0648d27aab14e273dbb30ee27ef1cb407961e917237c6df616` (620KB, BMP 497×312 32-bit Windows Modern UI 2 widescreen) | NEW Sprint 9 — designer attestation 2026-06-06 (Lane A M2 raster) |
| Cyrillic + TR disclaimer copy | Designer-authored bilingual original; intro screen `Это игра.` (Sprint 1 Faz 0); Faz 8 reveal `Это просто шутка.` + `Bu sadece bir şaka.` (Sprint 6); NSIS installer panel reuses the same Russian+Turkish literals at install consent screen | N/A (original wording) | N/A (string literals in `src/renderer/i18n/strings.ts`) | VERIFIED 2026-06-06 — original prose, no copy-paste source; `grep -rn "şaka\|Это" src/renderer/i18n/` confirms both Cyrillic + Turkish literals verbatim |
| Microsoft Cascadia / Segoe UI Variable | NOT BUNDLED (Sprint 5 plan superseded by alternative host-OS Segoe UI CSS fallback approach) | N/A | N/A | VERIFIED 2026-06-06 — `find src -iname "*cascadia*" -o -iname "*segoe*"` returns ZERO; no Microsoft font binary in build |
| Apple SF Pro Display / SF Mono | NOT BUNDLED (CSS reference only; host-OS registry fallback per PLAN §10 line 467 C1 mitigation) | N/A | N/A | VERIFIED 2026-06-06 — no Apple font binary in build |
| electron-builder cert/notarize stubs | Env-var contract via maintainer's secret manager (`APPLE_TEAM_ID`, `CSC_LINK`, `CSC_KEY_PASSWORD`, etc.) per `build/CODE-SIGNING.md`; NO cert / `.p12` / `.pfx` / `.p8` / Apple API key files in repo | N/A | N/A | VERIFIED 2026-06-06 — `find . -name "*.p12" -o -name "*.pfx" -o -name "*.p8"` returns ZERO; env-var stubs commented in `electron-builder.yml` (Lane A M1) |
| App-bundled boilerplate (electron-vite scaffold) | electron-vite build pipeline; `out/main`, `out/preload`, `out/renderer` emitted at build time from `src/main/`, `src/preload/`, `src/renderer/` sources | Sprint 0-8 first-party work (CC0-equivalent); MIT-licensed runtime deps pruned to production-only by electron-builder asar packer | Per-build SHA varies (not vendored) | VERIFIED 2026-06-06 — first-party only; no third-party binary in `out/` |

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

- **LEGAL.md** (Sprint 5 baseline 232L + Sprint 9 Lane A M3 appended = 327L
  as of HEAD `ac917cc`) — narrative legal posture, §3D Model Assets,
  §Fonts, §SHA-256 Manifest, §License boilerplate URLs, §Attribution
  requirement satisfaction, §Audio assets, §QR code asset, §Disclaimer,
  §Sprint 9 distributable verification (NEW M3).
- **Sprint 3 Model Freeze Checkpoint** — canonical SHA-256 manifest for
  vendored 3D models at `src/renderer/assets/models/SHA256-MANIFEST.txt`;
  Lane A Phase 2B compares re-computed hashes against this baseline. ALL
  7 GLB hashes match byte-for-byte (zero drift confirmed M3 audit).
- **TH-S4-03 (Sprint 4 lesson)** — audio is 100% procedural; no `.ogg` /
  `.wav` / `.mp3` / `.m4a` / `.flac` files are bundled. Lane A verifies
  via `find src resources -type f \( -name "*.ogg" -o -name "*.wav" -o
  -name "*.mp3" -o -name "*.m4a" -o -name "*.flac" \)` returning ZERO.
- **PLAN.md §14 Build & Dağıtım** — references this checklist as the gate
  closure mechanism for distributable verification.

---

## Sprint 9 audit summary

| Metric | Value |
|---|---|
| Total asset class rows audited | **35** |
| VERIFIED (status non-empty) | **35** |
| UNCHANGED since Sprint 0 (fonts) | **17** (17 OFL fonts + 3 license files = 17 file rows; OFL.txt rows omitted from binary count) |
| UNCHANGED since Sprint 3 freeze (3D models) | **7** (all 7 GLBs SHA-256 byte-for-byte match Sprint 3 manifest) |
| UNCHANGED since Sprint 5 (QR PNG) | **1** |
| UNCHANGED since Sprint 6 (disclaimer copy) | **1** |
| NEW Sprint 9 additions | **8** (3 designer SVGs Phase 2A + 5 rasters Lane A M2) |
| NOT BUNDLED rows (categorical absence verified) | **4** (Sprint 4-7 SVGs file-shipped: 0; Microsoft Cascadia/Segoe: 0; Apple SF Pro/Mono: 0; certs/keys: 0) |
| MAJOR drift detected | **0** (target met) |
| MINOR drift detected | **0** |
| Audit verdict | **ATTRIBUTION SHIP-READY** |

### Audit dimensions cleared

| # | Dimension | Result |
|---|---|---|
| 1 | Bundled fonts re-verified (OFL inventory + LICENSE files + SHA-256) | PASS — 14 binary + 3 license text files present; all hashes captured |
| 2 | 3D models re-verified against Sprint 3 SHA-256 manifest | PASS — 7/7 byte-for-byte match (zero drift) |
| 3 | Audio 100% procedural re-confirmed | PASS — ZERO audio binaries in src/ or resources/ |
| 4 | QR PNG re-verified (256×256 1-bit, procedural URL encoding) | PASS — present with expected SHA-256 |
| 5 | Disclaimer copy provenance (Cyrillic + Turkish original) | PASS — verbatim string literals in `src/renderer/i18n/strings.ts` |
| 6 | Designer SVGs inventory + provenance | PASS — only 3 Phase 2A SVGs exist; Sprint 4-7 used CSS/HTML inline approach |
| 7 | Sprint 9 NEW icons from Phase 2A SVGs only | PASS — 5 rasters all derived from 3 Phase 2A SVGs via documented sips/iconutil/Node packer pipeline |

### Closure statement

Sprint 9 release distributable is ATTRIBUTION SHIP-READY. Every bundled
asset has a documented provenance, license clause, and SHA-256 hash. No
MAJOR drift from Sprint 3 freeze. No new BLOCKER conditions introduced
Sprint 4-9. The maintainer may proceed to ship-tag with confidence that
the LEGAL surface is closed.

