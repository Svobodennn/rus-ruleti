# incoming/ — User-vendored Sketchfab downloads

> Drop Soviet-authentic GLB files here after downloading from Sketchfab.

## Where to put what

After Sketchfab download (each file should be named `*.glb`):

| Drop file | Will replace | Source URL |
|-----------|--------------|------------|
| `radio-ussr.glb` | `../radio.glb` (Quaternius generic) | https://sketchfab.com/3d-models/radio-ussr-34f8d2cba64d4604beefa17ed4fa6b61 |
| `samovar.glb` | NEW (not in vendored set) | https://sketchfab.com/3d-models/samovar-f428aa1644724b61895f1287b5a8db93 |
| `podstakannik.glb` | NEW (not in vendored set) | https://sketchfab.com/3d-models/glass-holder-edb75017488e49cd8191098b8830e4f3 |
| `nagant-revolver.glb` | `../revolver.glb` (Quaternius generic) | https://sketchfab.com/3d-models/nagant-m1895-type-revolver-a43cda5dc44944fdb9acd5b9fb7f8a8b |
| `soviet-table.glb` | `../table.glb` (dook generic) | https://sketchfab.com/3d-models/60s-soviet-furniture-set-a562313373604b4c8e5040417cf62cef |

## Sketchfab download steps

1. Visit URL, click "Sign in to download" (need free account)
2. Click "Download 3D Model" button on the model page
3. Select **glTF (.glb)** format from the format dropdown
4. Save to this directory (`src/renderer/assets/models/incoming/`)
5. Rename to match the column above

## What happens after you drop files

Tell the orchestrator "vendored Sketchfab models" and I will:
1. Verify GLB integrity (magic bytes)
2. Move from `incoming/` to parent `models/` (renaming as listed)
3. Update `../README.md` attribution log with author + URL
4. Add to scene integration (`mountScene` GLB swap)
5. Run typecheck + lint + build to confirm
6. Commit with proper attribution

## If a download has wrong format

Sketchfab sometimes ships `.zip` containing GLTF + textures (not GLB). If you get a zip:
1. Extract it locally
2. The folder will have a `scene.gltf` + `scene.bin` + textures
3. Drop the **entire folder** (or just the `.gltf` file with same-folder textures) here
4. Orchestrator will convert to .glb via [gltf-pipeline](https://github.com/CesiumGS/gltf-pipeline) if needed

## License reminders

Every Sketchfab CC-BY download requires attribution in:
- `../README.md`
- `LEGAL.md` (Sprint 9 release prep)

Stash author name + Sketchfab URL + license per file in your message when you notify orchestrator.

## Telif risk flag

If any file you download has a "Standard" or "Editorial" license (NOT CC-BY / CC0), do NOT vendor. Sketchfab "Standard" prohibits redistribution → would break the open-source posture. Re-search for CC0 or CC-BY alternative.
