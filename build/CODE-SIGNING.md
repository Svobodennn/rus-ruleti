# Code Signing — rus-ruleti (Sprint 9 release prep)

> **Status:** Sprint 9 Phase 1 SCAFFOLD. Actual certs provisioned OUT-OF-BAND by
> the maintainer (Apple Developer enrollment + Windows EV cert vendor + DigiCert
> timestamping account). This document captures the env-var contract that
> `electron-builder.yml` reads at build time, plus the human-facing enrollment
> steps that produce those env values.
>
> See `electron-builder.yml` (mac / win / linux blocks) and
> `build/entitlements.mac.plist` for the wired stubs.
>
> **Icon files RESOLVED Sprint 9 Phase 2B Lane A M2:**
>   - `build/icon.icns` (multi-size 16-1024, packed via macOS native
>     `sips` + `iconutil` from `resources/design/icon-master.svg`)
>   - `build/icon.ico` (7 sizes: 16/24/32/48/64/128/256, packed via
>     `scripts/pack-ico.cjs` Node helper from sips-generated PNGs)
>   - `build/icon.png` (512×512, sips-rasterized from icon-master.svg)
>   - `build/dmg-bg.png` (600×400, sips from dmg-bg.svg)
>   - `build/nsis-banner.bmp` (497×312 32-bit BMP, sips from nsis-banner.svg)
>
> All raster artifacts generated reproducibly from Phase 2A designer SVGs
> using only macOS built-in tooling (`sips`, `iconutil`) plus a pure-stdlib
> Node helper (`scripts/pack-ico.cjs`). No ImageMagick, no rsvg-convert,
> no npm dep added. Re-run procedure documented in §6 below.

---

## 1. macOS — Apple Developer ID + Notarization

### 1.1 Apple Developer enrollment (one-time)

1. Visit https://developer.apple.com/programs/ and enroll as an **Individual** or
   **Organization** ($99 USD / year). Organization enrollment requires a D-U-N-S
   number (free, ~1 week to issue via Dun & Bradstreet).
2. Once enrolled, log in to https://developer.apple.com/account/ and note the
   **Team ID** (10-character alphanumeric string) under Membership Details.

### 1.2 Generate Developer ID Application certificate

1. In **Certificates, Identifiers & Profiles** → **Certificates** → **+**
   → choose **Developer ID Application**.
2. Follow the on-screen prompts to upload a CSR (generated from Keychain Access
   → Certificate Assistant → Request a Certificate from a Certificate Authority).
3. Download the `.cer` file; double-click to import into login keychain.
4. Export from Keychain as `.p12` with a strong password (this becomes `CSC_LINK`
   + `CSC_KEY_PASSWORD` if you prefer file-based signing) OR leave in Keychain
   and reference by name via `CSC_NAME` (e.g., `"Developer ID Application: Famelink LLC (TEAMID12)"`).

### 1.3 App-specific password for notarization (legacy)

1. Go to https://appleid.apple.com → **Sign-In and Security** → **App-Specific Passwords**.
2. Generate a new password labeled `electron-builder notarize`.
3. Save it; you'll set it as `APPLE_APP_SPECIFIC_PASSWORD` at build time.

### 1.4 Notary API key (RECOMMENDED — newer, more reliable)

1. Visit https://appstoreconnect.apple.com → **Users and Access** → **Keys** tab
   → **App Store Connect API** subtab → **+** to generate a new key with
   **Developer** access.
2. Download the `.p8` file (you can only download it ONCE — store it securely;
   electron-builder reads its path from `APPLE_API_KEY`).
3. Note the **Key ID** (10 chars) and **Issuer ID** (UUID at top of page).

### 1.5 Required env vars (macOS build)

| Env var | Required | Source | Purpose |
|---|---|---|---|
| `APPLE_TEAM_ID` | YES | developer.apple.com membership page | Team ID for notarization |
| `CSC_LINK` | one of CSC_LINK / CSC_NAME | path or HTTPS to `.p12` | Signing cert |
| `CSC_KEY_PASSWORD` | if CSC_LINK | secret | Decrypt `.p12` |
| `CSC_NAME` | one of CSC_LINK / CSC_NAME | exact cert subject string | Reference cert in Keychain |
| `APPLE_API_KEY` | if Notary API key flow | path to `.p8` file | Recommended notary auth |
| `APPLE_API_KEY_ID` | if Notary API key flow | Key ID (10 chars) | Notary auth |
| `APPLE_API_ISSUER` | if Notary API key flow | Issuer UUID | Notary auth |
| `APPLE_ID` | if legacy app-specific password flow | Apple ID email | Legacy notary auth |
| `APPLE_APP_SPECIFIC_PASSWORD` | if legacy flow | app-specific password | Legacy notary auth |

Choose ONE notary auth flow: Notary API key (preferred) OR legacy app-specific
password — not both.

### 1.6 Entitlements

See `build/entitlements.mac.plist`. The plist requests ONLY the minimal
Hardened-Runtime entitlements Electron requires (JIT, unsigned executable
memory, DYLD env vars, disable library validation). NO camera, microphone,
network, files, or any other privacy-sensitive entitlement is requested
(joke app — zero real system access per PLAN §6 + LEGAL.md disclaimer).

---

## 2. Windows — EV / OV code signing certificate

### 2.1 Vendor options (purchase out-of-band)

| Vendor | Type | Cost (annual approx.) | Notes |
|---|---|---|---|
| DigiCert | EV / OV | $700 / $400 | Industry standard, fastest SmartScreen reputation |
| Sectigo (Comodo) | EV / OV | $500 / $200 | Cheaper; slower reputation build |
| SSL.com | EV / OV | $400 / $200 | HSM-based EV available; good for cloud-only signing |

**EV (Extended Validation)** certs immediately build Windows SmartScreen
reputation; **OV (Organization Validation)** certs require gradual reputation
accumulation (many downloads before SmartScreen stops warning users). For a
joke app shipped occasionally, OV is usually acceptable. EV is recommended if
the project ever wants quiet first-run on Windows 10/11.

### 2.2 Receive cert + export to .pfx

1. Complete vendor identity verification (passport/EIN/D-U-N-S/etc).
2. Receive the cert via vendor's process: typically as an HSM token (EV) or
   as a downloadable `.crt` + private key (OV).
3. For OV `.crt` + key: combine into `.pfx` via
   `openssl pkcs12 -export -out rus-ruleti-signing.pfx -inkey key.pem -in cert.crt`
   with a strong password.
4. For EV HSM-based: install the vendor's signing tool (e.g., DigiCert's
   `signtool` wrapper or SSL.com's eSigner) and follow vendor instructions
   for `CSC_LINK` or `certificateSubjectName` configuration.

### 2.3 Required env vars (Windows build)

| Env var | Required | Source | Purpose |
|---|---|---|---|
| `CSC_LINK` | YES (if .pfx flow) | path or HTTPS to `.pfx` file | Signing cert |
| `CSC_KEY_PASSWORD` | YES (if .pfx flow) | secret | Decrypt `.pfx` |
| `WIN_CSC_LINK` | alternative to CSC_LINK | path or HTTPS to `.pfx` file | Windows-specific cert override |
| `WIN_CSC_KEY_PASSWORD` | alternative to CSC_KEY_PASSWORD | secret | Windows-specific cert password override |
| `CSC_NAME` | optional | cert subject string | Reference cert in Windows cert store |

### 2.4 Timestamping (REQUIRED)

`electron-builder.yml` wires `rfc3161TimeStampServer: http://timestamp.digicert.com`.
RFC 3161 timestamps ensure signed binaries remain trusted even after the signing
cert expires — without timestamping, signatures stop validating once the cert
expires (typically 1-3 years from issuance). Alternative timestamp servers:

- `http://timestamp.sectigo.com`
- `http://timestamp.globalsign.com/scripts/timstamp.dll`
- `http://timestamp.comodoca.com/?td=sha256`

DigiCert is the default; swap if rate-limited.

### 2.5 SHA-256 only

`signingHashAlgorithms: ['sha256']` is set in `electron-builder.yml`. SHA-1 is
deprecated for code signing as of Windows 7+ era — never reintroduce it.

---

## 3. Linux — AppImage (optional GPG signing)

Linux distributions do not require code signing in the macOS/Windows sense.
Most users run AppImages directly; package managers (.deb, .rpm) use their own
signing infrastructure (apt-key, rpm-sign) handled at repo level, not by
electron-builder.

**Optional GPG signing for AppImage** (not wired in `electron-builder.yml` —
out of scope for joke app):

1. Generate a GPG key: `gpg --full-generate-key`
2. Export the public key for distribution: `gpg --armor --export rus-ruleti@famelink.ai > rus-ruleti.gpg`
3. Sign the built AppImage:
   `appimagetool --sign --sign-key rus-ruleti@famelink.ai dist/Rus_Ruleti.AppImage`
4. Users verify with:
   `gpg --import rus-ruleti.gpg && gpg --verify dist/Rus_Ruleti.AppImage.zsync.gpg dist/Rus_Ruleti.AppImage`

For Sprint 9 ship, AppImage is shipped unsigned. Users see the standard
"This file has not been signed" dialog when first launching — acceptable for
a joke app.

---

## 4. CI/CD env var checklist (all platforms)

| Env var | macOS | Windows | Linux | Source |
|---|---|---|---|---|
| `APPLE_TEAM_ID` | YES | — | — | developer.apple.com |
| `CSC_LINK` | one of | YES | — | cert vendor |
| `CSC_KEY_PASSWORD` | one of | YES | — | secret manager |
| `CSC_NAME` | one of | optional | — | cert subject |
| `APPLE_API_KEY` | one of | — | — | App Store Connect |
| `APPLE_API_KEY_ID` | with APPLE_API_KEY | — | — | App Store Connect |
| `APPLE_API_ISSUER` | with APPLE_API_KEY | — | — | App Store Connect |
| `APPLE_ID` | legacy alt | — | — | Apple ID email |
| `APPLE_APP_SPECIFIC_PASSWORD` | legacy alt | — | — | appleid.apple.com |
| `WIN_CSC_LINK` | — | alt | — | cert vendor |
| `WIN_CSC_KEY_PASSWORD` | — | alt | — | secret manager |
| `GPG_KEY_ID` | — | — | optional | local GPG keyring |
| `GH_TOKEN` | optional | optional | optional | GitHub Releases manual upload (per PLAN §14: NO auto-publish — token only used if maintainer chooses to drive upload via `gh release upload`) |

Recommended secret managers: GitHub Actions Secrets, 1Password, AWS Secrets
Manager, or HashiCorp Vault. Never commit any of the above to git.

---

## 5. Local dev fallback (unsigned builds)

For local-only development builds without certificates:

1. Leave `identity: null` in `electron-builder.yml` `mac:` block (Sprint 0
   baseline; already correct).
2. Run `npm run build:dryrun` for an unpacked `dist/mac/` directory — no
   signing required.
3. macOS Gatekeeper will block the unsigned `.app` on first launch. Bypass
   per-user via:
   `xattr -dr com.apple.quarantine /Applications/Rus\ Ruleti.app`
   This removes the quarantine flag so Gatekeeper stops blocking. The user
   accepts trust manually — same UX as `right-click → Open → Open Anyway`.
4. Windows: unsigned `.exe` triggers SmartScreen "Windows protected your PC"
   dialog. User clicks **More info → Run anyway** to bypass.
5. Linux: AppImage runs without prompts; `.deb` requires `dpkg -i` (no
   signature check by default).

These fallbacks are for developer convenience ONLY — release builds MUST be
signed per the env var contract above. See `scripts/release-checklist.md`
pre-ship section for the gate.

---

## 6. Icon raster reproduction (Sprint 9 Phase 2B Lane A — RESOLVED)

The 5 raster artifacts shipped Sprint 9 (`build/icon.icns`, `build/icon.ico`,
`build/icon.png`, `build/dmg-bg.png`, `build/nsis-banner.bmp`) were generated
on macOS using ONLY built-in `sips` + `iconutil` plus the repo-local Node
helper `scripts/pack-ico.cjs`. No ImageMagick, no librsvg, no npm dependency
added. The full reproduction procedure is documented here so any maintainer
on any macOS host can regenerate the rasters from the Phase 2A SVG sources.

### 6.1 Prerequisites (all macOS native)

```sh
which sips      # /usr/bin/sips
which iconutil  # /usr/bin/iconutil
which node      # any Node 14+
```

If `sips` or `iconutil` is missing (e.g., on Linux build host), install
ImageMagick (`brew install imagemagick`) and adapt the commands below to
`convert -background none input.svg -resize NxN out.png` instead. The
`scripts/pack-ico.cjs` packer step remains identical on any platform.

### 6.2 Reproduction sequence

```sh
# Step 1 — Rasterize the 1024×1024 master SVG to PNG, then downscale to 512×512.
sips -s format png resources/design/icon-master.svg --out /tmp/icon-1024.png
sips -z 512 512 /tmp/icon-1024.png --out build/icon.png

# Step 2 — Build the macOS .icns via iconset directory.
ICONSET=/tmp/icon-build.iconset
rm -rf $ICONSET && mkdir -p $ICONSET
SRC=/tmp/icon-1024.png
sips -z 16 16     $SRC --out $ICONSET/icon_16x16.png
sips -z 32 32     $SRC --out $ICONSET/icon_16x16@2x.png
sips -z 32 32     $SRC --out $ICONSET/icon_32x32.png
sips -z 64 64     $SRC --out $ICONSET/icon_32x32@2x.png
sips -z 128 128   $SRC --out $ICONSET/icon_128x128.png
sips -z 256 256   $SRC --out $ICONSET/icon_128x128@2x.png
sips -z 256 256   $SRC --out $ICONSET/icon_256x256.png
sips -z 512 512   $SRC --out $ICONSET/icon_256x256@2x.png
sips -z 512 512   $SRC --out $ICONSET/icon_512x512.png
sips -z 1024 1024 $SRC --out $ICONSET/icon_512x512@2x.png
iconutil -c icns $ICONSET -o build/icon.icns

# Step 3 — Build the Windows .ico via the Node packer.
ICOTMP=/tmp/ico-build
rm -rf $ICOTMP && mkdir -p $ICOTMP
for s in 16 24 32 48 64 128 256; do
  sips -z $s $s /tmp/icon-1024.png --out $ICOTMP/${s}.png
done
node scripts/pack-ico.cjs build/icon.ico

# Step 4 — DMG background + NSIS banner.
sips -s format png resources/design/dmg-bg.svg --out build/dmg-bg.png
sips -s format bmp resources/design/nsis-banner.svg --out build/nsis-banner.bmp
```

### 6.3 Verification

```sh
file build/icon.icns       # Mac OS X icon (multiple sizes)
file build/icon.ico        # MS Windows icon resource — 7 icons
file build/icon.png        # PNG image data, 512 x 512
file build/dmg-bg.png      # PNG image data, 600 x 400
file build/nsis-banner.bmp # PC bitmap, Windows ... 497 x -312 x 32

ls -la build/icon.{icns,ico,png} build/dmg-bg.png build/nsis-banner.bmp
```

Expected file sizes (within ±10%):

| Asset | Bytes (approx.) |
|---|---|
| `build/icon.icns` | ~58000 |
| `build/icon.ico`  | ~13000 |
| `build/icon.png`  | ~10000 |
| `build/dmg-bg.png` | ~11000 |
| `build/nsis-banner.bmp` | ~620000 (uncompressed BMP) |

### 6.4 If SVG source ever changes

The Phase 2A SVGs (`resources/design/*.svg`) are the canonical source of
truth. If a maintainer edits any SVG, re-run §6.2 in full to regenerate
the rasters — do NOT hand-edit the binary outputs. The Sprint 9 LEGAL.md
attribution row is keyed off the SVGs as designer's original work; rasters
are mechanical derivatives.
