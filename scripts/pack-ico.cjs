/**
 * Minimal pure-Node ICO packer used by Sprint 9 Phase 2B Lane A to produce
 * `build/icon.ico` when ImageMagick / rsvg-convert / electron-icon-builder
 * are unavailable on the build host. Wraps a set of PNG files into a single
 * Windows .ico container per the Win32 ICONDIR / ICONDIRENTRY format
 * (https://learn.microsoft.com/en-us/previous-versions/ms997538(v=msdn.10)).
 *
 * Usage (Sprint 9 Lane A flow on macOS):
 *
 *   # 1. Rasterize SVG → 1024 PNG via macOS sips:
 *   sips -s format png resources/design/icon-master.svg --out /tmp/icon.png
 *
 *   # 2. Down-scale to 7 ICO sizes:
 *   mkdir -p /tmp/ico-build
 *   for s in 16 24 32 48 64 128 256; do
 *     sips -z $s $s /tmp/icon.png --out /tmp/ico-build/${s}.png
 *   done
 *
 *   # 3. Pack:
 *   node scripts/pack-ico.cjs build/icon.ico
 *
 * Output: a valid Windows .ico containing 7 size variants (16, 24, 32,
 * 48, 64, 128, 256), each stored as a PNG-format ICO image (32-bit RGBA).
 * Verified via `file build/icon.ico` → "MS Windows icon resource - 7 icons".
 *
 * Pure stdlib — NO npm dependency, NO build step. Runnable on any Node 14+.
 */
const fs = require('fs');
const path = require('path');

const SRC_DIR = '/tmp/ico-build';
const SIZES = [16, 24, 32, 48, 64, 128, 256];
const OUT = process.argv[2];
if (!OUT) {
  console.error('usage: node pack-ico.cjs <out.ico>');
  process.exit(2);
}

// Read all PNGs as buffers
const entries = SIZES.map((size) => {
  const buf = fs.readFileSync(path.join(SRC_DIR, `${size}.png`));
  // ICONDIRENTRY width/height: 0 means 256 (per spec — a 256×256 icon stores
  // width/height bytes as 0 because the field is 8-bit unsigned and 256 doesn't fit).
  const widthByte = size === 256 ? 0 : size;
  const heightByte = size === 256 ? 0 : size;
  return { size, widthByte, heightByte, buf };
});

const headerSize = 6;             // ICONDIR
const dirEntrySize = 16;          // ICONDIRENTRY
const dirSize = headerSize + entries.length * dirEntrySize;

// Build dir + data
let offset = dirSize;
const dirEntries = [];
for (const e of entries) {
  const entry = Buffer.alloc(dirEntrySize);
  entry.writeUInt8(e.widthByte, 0);            // bWidth
  entry.writeUInt8(e.heightByte, 1);           // bHeight
  entry.writeUInt8(0, 2);                      // bColorCount (0 = 256+ colors)
  entry.writeUInt8(0, 3);                      // bReserved
  entry.writeUInt16LE(1, 4);                   // wPlanes
  entry.writeUInt16LE(32, 6);                  // wBitCount (32 = RGBA)
  entry.writeUInt32LE(e.buf.length, 8);        // dwBytesInRes
  entry.writeUInt32LE(offset, 12);             // dwImageOffset
  dirEntries.push(entry);
  offset += e.buf.length;
}

// Build ICONDIR header
const header = Buffer.alloc(headerSize);
header.writeUInt16LE(0, 0);                    // idReserved
header.writeUInt16LE(1, 2);                    // idType (1 = ICO)
header.writeUInt16LE(entries.length, 4);       // idCount

// Concatenate header + dir entries + image data
const parts = [header, ...dirEntries, ...entries.map((e) => e.buf)];
const out = Buffer.concat(parts);
fs.writeFileSync(OUT, out);
console.log(
  `ICO packed: ${OUT} (${out.length} bytes, ${entries.length} sizes: ${SIZES.join(', ')})`,
);
