# DSEG7-Classic — 7-Segment LCD Display Font

> Bundled by **babel** (Sprint 2 Phase 2B) for the HUD empty-click counter
> (`ШАНС / ŞANS` — "N/6" display). Reproduces the look of a vintage
> 7-segment LED on the disclaimer screen and during gameplay.

## Source

- **Project:** [DSEG Font Family](https://github.com/keshikan/DSEG) by keshikan
- **Homepage:** https://www.keshikan.net/fonts-e.html
- **Release downloaded:** [v0.46](https://github.com/keshikan/DSEG/releases/tag/v0.46) (2020-03-15)
- **Original asset:** `fonts-DSEG_v046.zip` → `DSEG7-Classic/DSEG7Classic-Regular.{woff2,woff,ttf}`
- **Vendored on:** 2026-05-20 (Sprint 2 Phase 2B)

Only the **`DSEG7-Classic` `Regular`** style is bundled. The upstream zip also
ships Bold, Italic, BoldItalic, Light, LightItalic variants, plus DSEG7-Classic-MINI
and DSEG14-* families. We intentionally vendor only what we use to keep the
installer small.

## License

**SIL Open Font License 1.1.** Full text in [`LICENSE.txt`](./LICENSE.txt)
(copied verbatim from the upstream `DSEG-LICENSE.txt`).

Copyright (c) 2017, keshikan (http://www.keshikan.net), with Reserved Font
Name "DSEG".

Per OFL §2, the copyright notice and license travel with the font files in
this directory. Attribution is also recorded in the project-wide asset audit
in `PLAN.md` §10 ("Fontlar").

## File rename

We rename the bundled files for consistency with sibling bundles
(`old-standard-tt/`, `pt-serif/`) and for the @font-face URL stability:

| Upstream filename             | Local filename                    |
|-------------------------------|-----------------------------------|
| `DSEG7Classic-Regular.woff2`  | `DSEG7-Classic-Regular.woff2`     |
| `DSEG7Classic-Regular.woff`   | `DSEG7-Classic-Regular.woff`      |
| `DSEG7Classic-Regular.ttf`    | `DSEG7-Classic-Regular.ttf`       |

The hyphen between `DSEG7` and `Classic` matches the `font-family` declaration
(`'DSEG7-Classic'` — see `src/shared/scene-revolver-constants.ts`
`HUD_COUNTER_FONT_FAMILY`) and `src/renderer/styles/fonts.css`.

**Rename is byte-preserving** (`cp` then `mv`-equivalent — no transcoding).
OFL §3 forbids renaming the *Reserved Font Name* in derivative works, but
the filename on disk is metadata about the storage layer, not the font name
as presented to the user (`name` table inside the TTF still says "DSEG7
Classic"). This is consistent with how Google Fonts and `fonts-dseg` on
Debian package the same fonts.

## File sizes

| File                              | Bytes  | Notes                                  |
|-----------------------------------|--------|----------------------------------------|
| `DSEG7-Classic-Regular.woff2`     | 5 188  | Primary, modern Chromium               |
| `DSEG7-Classic-Regular.woff`      | 7 128  | Fallback for very old WebKit           |
| `DSEG7-Classic-Regular.ttf`       | 23 272 | Last-resort fallback (older Electron)  |
| `LICENSE.txt`                     | 4 487  | OFL 1.1 + copyright                    |
| `README.md`                       | (this) | This document                          |

**Total bundle delta:** ~40 KB on disk (~5 KB over the wire — only woff2
is fetched by modern Electron). Sprint 1 baseline was 1.276 MB; this is
+0.4 % installer size. Negligible.

## Glyph coverage (verified 2026-05-20)

DSEG is a **digit-first** display font, not a text font. Coverage was
verified by parsing the `cmap` table in `DSEG7Classic-Regular.ttf`:

### Present (69 glyphs in the 0x20–0xFF range)

```
SPACE !  -  .  0 1 2 3 4 5 6 7 8 9 :
A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
_  a b c d e f g h i j k l m n o p q r s t u v w x y z  °
```

That includes:
- **Digits** `0–9` (the primary use case — counter display)
- **Period** `.` (zero-width in DSEG — decorative for decimal alignment)
- **Colon** `:` (used in clock-style displays)
- **Hyphen** `-` (segment-style minus)
- **Latin alphabet** `A–Z`, `a–z` (DSEG renders these as best-effort 7-seg
  approximations; usable for "HI", "RUS RU1ETI", etc., but stylized)
- **Degree** `°` (added in v0.46)
- **Underscore** `_` (added in v0.46)
- **Exclamation** `!` (all-segments-off — DSEG convention)
- **Space** (same width as colon — DSEG convention)

### NOT present

- **Slash** `/` (U+002F) — **CRITICAL for our use case**, see workaround below
- **Comma** `,`
- **Parentheses** `()`
- **Cyrillic** (Кириллица) — none; falls through to next font in stack
- **Turkish** specials (`ç ı ğ ş`, etc.) — none; falls through

### Workaround for "N/6" counter

The HUD counter format is `N/6`. Since `/` is missing from DSEG, the
browser's font fallback chain takes over **per glyph**. With the @font-face
stack defined in `fonts.css`:

```css
font-family: 'DSEG7-Classic', monospace;
```

Chromium will:
1. Try DSEG for each glyph.
2. For `/`, DSEG returns "no glyph"; Chromium falls through to `monospace`
   (the system monospaced font: Menlo on macOS, Consolas on Windows).
3. Digits remain DSEG.

This means the slash will visually **break** the 7-segment line. If that
is acceptable (it's stylistically defensible — "the display has no slash
segment, so the OS shows a plain slash"), no extra work is required.

If a fully 7-segment look is required, `@frontend-dev`'s counter.ts
construction should split the digits and the separator into separate DOM
nodes:

```html
<span class="hud-counter">
  <span class="hud-counter__digit">1</span>
  <span class="hud-counter__sep">/</span>
  <span class="hud-counter__digit">6</span>
</span>
```

and the CSS can either:
- Style the separator with a small horizontal segment-styled SVG, or
- Use a CSS `::before` pseudo-element drawing a 7-seg-style slash with
  `linear-gradient`, or
- Use the DSEG `-` (hyphen) and rely on the dash to read "N − 6"
  (visually consistent, semantically wrong, **not recommended**).

The simplest acceptable solution is the first: leave the slash to monospace
fallback. The counter still reads `1/6` correctly. The 7-seg digits carry
the atmosphere.

## DSEG quirks documented by upstream README

- **`:` (colon) and ` ` (space)** have the same width (clock-style).
- **`.` (period)** has **zero width** — it overlays on top of the previous
  digit's decimal-point segment. To draw a "freestanding" period, follow
  it with a space.
- **`!` (exclamation)** = all segments OFF (the "blank glyph").
- **`~` (tilde)** = all segments ON (the "8" / test pattern).

These quirks **do not affect** our use case (digits + `/`), but they are
documented here so the frontend-dev (and anyone debugging glyph rendering
later) is not surprised.

## How it loads at runtime

1. `index.html` includes `./styles/fonts.css` (already in place — Sprint 0
   wiring).
2. `fonts.css` declares `@font-face` for `'DSEG7-Classic'` with `src` URLs
   relative to itself (`../fonts/dseg/...`).
3. Vite, during `npm run build`, follows the CSS `url()` references and
   copies the woff2/woff/ttf into `out/renderer/fonts/dseg/`.
4. Electron, with CSP `font-src 'self'`, accepts the local font URLs (they
   resolve to the app://-style packaged file scheme, which is 'self').
5. `font-display: swap` ensures the counter renders immediately in
   `monospace` while DSEG is loading (~5 KB; in practice loads in the same
   tick as the HTML on a local fetch), then swaps in.

## Build-time integration sanity-check (manual)

```bash
npm run build
ls -la out/renderer/fonts/dseg/
# expect: DSEG7-Classic-Regular.woff2 (and .woff, .ttf)
```

DevTools (when `npm run dev` is running):
- **Network → Fonts:** `DSEG7-Classic-Regular.woff2` → 200 OK from local
  filesystem (no remote fetch attempted — CSP would block remote anyway).
- **Application → Fonts:** `DSEG7-Classic` listed as a loaded face.

## Why this font and not Google "Share Tech Mono" or similar?

DSEG is the de facto OFL-licensed 7-segment font on GitHub (1 700+ stars,
shipped in Debian as `fonts-dseg`, npm-published as `dseg`). It explicitly
imitates "Seven Segment Display" rather than "monospaced typewriter", which
matches the analog/dim/decaying atmosphere of the disclaimer + HUD. Share
Tech Mono is monospaced but **not** segmented. A bespoke 7-segment font
would require licensing or commissioning — DSEG is free, well-known, and
already proven in JS dashboards and microcontroller LCD simulators.

## Version pinning

We vendor a specific binary (v0.46, released 2020-03-15). Upstream has been
quiet since 2020 — no breaking changes expected, but if/when DSEG ships
v0.47+, treat this folder as the **canonical pinned snapshot** for our
build. To upgrade:

1. Download new release zip from https://github.com/keshikan/DSEG/releases
2. Replace `DSEG7-Classic-Regular.{woff2,woff,ttf}` (preserve the local
   filename rename).
3. If the upstream `DSEG-LICENSE.txt` changed, refresh `LICENSE.txt`.
4. Update this README's "Source" and "File sizes" sections.
5. Re-run the cmap glyph audit (see this README's "Glyph coverage" section)
   and update the present/missing lists if changed.
6. Run `npm run typecheck && npm run lint` (font swap should be type-safe).
7. Visual diff the HUD counter in `npm run dev` — DSEG line-weights may
   shift slightly between versions; if so, designer should re-tune
   `--hud-counter-glow-alpha` in CSS to compensate.

## Why are the files renamed?

`DSEG7Classic-Regular.woff2` (upstream) → `DSEG7-Classic-Regular.woff2`
(local). The hyphen between the family and the variant matches the way
we write the `font-family` string in the `@font-face` rule and the SSOT
constant `HUD_COUNTER_FONT_FAMILY = "'DSEG7-Classic', monospace"`. Pure
ergonomics — easier to grep "DSEG7-Classic" across the project and find
both the font face name and the on-disk file. The TTF's internal `name`
table is untouched, so the OFL Reserved Font Name "DSEG" is preserved.
