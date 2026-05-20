# 3D Model Assets — Sprint 3 vendor

> Rus Ruleti — Sovyet brutalist bodrum oda 3D assets. Sprint 3 model freeze checkpoint.

## File inventory

| File | Source | Author | License | Tris | Notes |
|------|--------|--------|---------|------|-------|
| `revolver.glb` | [Poly Pizza](https://poly.pizza/m/E7IaG9TptR) | Quaternius | **CC0** | ~500 | Generic low-poly revolver; chamber opaque (RNG visibility safe per designer §6) |
| `chair.glb` | [Poly Pizza](https://poly.pizza/m/iMNqRzPwwe) | Quaternius | **CC0** | ~400 | Generic wooden chair |
| `radio.glb` | [Poly Pizza](https://poly.pizza/m/TPqvwkyWdV) | Quaternius | **CC0** | ~300 | Generic vintage radio (NOT Soviet-branded — see `incoming/` for VEF/Rekord upgrade) |
| `bottle.glb` | [Poly Pizza](https://poly.pizza/m/FAHsHFXfTf) | Quaternius | **CC0** | ~200 | Generic spirit bottle (label can be texture-painted in renderer) |
| `table.glb` | [Poly Pizza](https://poly.pizza/m/7qAyGZnerYt) | dook | **CC-BY 4.0** | ~500 | Generic table — attribution required |
| `ashtray.glb` | [Poly Pizza](https://poly.pizza/m/aHmJIWIr1vI) | dook | **CC-BY 4.0** | ~300 | Generic ashtray — attribution required |
| `lightbulb.glb` | [Poly Pizza](https://poly.pizza/m/4TkYCZMlbS6) | Jason Toff | **CC-BY 4.0** | ~600 | Hanging incandescent bulb form — attribution required |

**Total payload**: 244KB (compressed). All within Sprint 3 budget.

## Attribution requirements (CC-BY)

For the 3 CC-BY models, the following attribution must appear in:
1. App About screen (Sprint 6 reveal-lite)
2. `LEGAL.md` / `LICENSES.md` (Sprint 9 release prep)
3. README.md (this file)

```text
3D Models:
- "Table" by dook — Licensed under CC BY 4.0 — https://poly.pizza/m/7qAyGZnerYt
- "Ashtray" by dook — Licensed under CC BY 4.0 — https://poly.pizza/m/aHmJIWIr1vI
- "Light bulb" by Jason Toff — Licensed under CC BY 4.0 — https://poly.pizza/m/4TkYCZMlbS6
```

CC0 models (revolver, chair, radio, bottle by Quaternius) do not require attribution but are credited above as good practice.

## Sketchfab Soviet-authentic upgrades (user-vendored)

Per Sprint 3 B3 hybrid plan, the user may download and drop into `incoming/` the following Soviet-authentic alternatives:

| Asset | Sketchfab URL | License | Notes |
|-------|---------------|---------|-------|
| Radio USSR (Soviet authentic, ~8.2k tris) | https://sketchfab.com/3d-models/radio-ussr-34f8d2cba64d4604beefa17ed4fa6b61 | CC-BY 4.0 | Override `radio.glb` (Quaternius generic) |
| Samovar (Tula-style, ~7.4k tris) | https://sketchfab.com/3d-models/samovar-f428aa1644724b61895f1287b5a8db93 | CC-BY 4.0 | NEW asset (no CC0 samovar found) |
| Podstakannik (Russian railroad tea-glass holder, ~5.7k tris) | https://sketchfab.com/3d-models/glass-holder-edb75017488e49cd8191098b8830e4f3 | CC-BY 4.0 | NEW asset (no CC0 podstakannik found) |
| Nagant M1895 revolver (Soviet authentic, ~8.9k tris) | https://sketchfab.com/3d-models/nagant-m1895-type-revolver-a43cda5dc44944fdb9acd5b9fb7f8a8b | CC-BY 4.0 | Optional override of `revolver.glb` (Quaternius generic) |
| 60s Soviet Furniture Set (table01 ~332 tris) | https://sketchfab.com/3d-models/60s-soviet-furniture-set-a562313373604b4c8e5040417cf62cef | CC-BY | Optional override of `table.glb` |

**User flow:**
1. Visit Sketchfab URL, log in
2. Click "Download 3D Model" → GLB format
3. Drop the file into `src/renderer/assets/models/incoming/`
4. Add attribution to this README
5. Notify orchestrator to vendor (rename + integrate)

## Procedural fallbacks

Generated at runtime via Three.js primitives (no model file needed):
- **5 kopek coin** — CylinderGeometry r=0.012m h=0.0015m, 16 segments, brass material
- **Wall geometry** — PlaneGeometry with texture (already in placeholder-room.ts)
- **Cigarette stub** — small CylinderGeometry on top of ashtray.glb

## Sprint 3 integration plan

1. **Phase 1 (kraken)**: GLB loader (`useGLTF` from three.js GLTFLoader), wire to scene-mount, swap placeholder-room cubes for GLB meshes
2. **Phase 2**: Animation rig validation (revolver's hammer/cylinder separate meshes?), procedural texture painting (Cyrillic labels on bottle, dial gauge on radio)
3. **Phase 3 QA**: Telif audit (security-reviewer), asset size budget, draco compress decision

## Telif audit log (security-reviewer Sprint 3 task)

All 7 models verified CC0 or CC-BY 4.0 compatible. No "Royalty Free" (CGTrader proprietary) models included. No paid models. Re-distribution safe for open-source.

`OFL.txt` / `LICENSE-CC0.txt` / `LICENSE-CC-BY.txt` to be added Sprint 9 release prep.
