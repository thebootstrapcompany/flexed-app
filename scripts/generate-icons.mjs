/**
 * Zero-dependency PWA icon generator for Flexed.
 * Rasterizes an "F" monogram into raw pixel buffers and PNG-encodes
 * them using node:zlib (no canvas / sharp / image libs needed).
 *
 * Usage: node scripts/generate-icons.mjs
 * Output: public/icons/*.png + public/icons/icon.svg
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "icons");
mkdirSync(outDir, { recursive: true });

// Brand colors (from app/globals.css, converted from oklch to hex)
const BG = [9, 9, 11]; // --background dark (#09090b)
const FG = [250, 250, 250]; // --foreground dark (#fafafa)

// ---------------------------------------------------------------- PNG encoder
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePNG(pixels, size) {
  // pixels: Uint8Array of RGBA, size x size
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    for (let x = 0; x < stride; x++) raw[y * (stride + 1) + 1 + x] = pixels[y * stride + x];
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------- Monogram
/**
 * Renders the Flexed "F" monogram at `size` px.
 * `maskable` keeps the mark inside the 80% safe zone on a full-bleed bg.
 */
function renderIcon(size, { maskable = false } = {}) {
  const px = new Uint8Array(size * size * 4);
  const set = (x, y, r, g, b, a = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    px[i] = r;
    px[i + 1] = g;
    px[i + 2] = b;
    px[i + 3] = a;
  };

  // Slightly rounded square background
  const radius = Math.round(size * (maskable ? 0 : 0.18));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inside = (() => {
        if (radius === 0) return true;
        const rx = x < radius ? radius - x : x >= size - radius ? x - (size - radius - 1) : 0;
        const ry = y < radius ? radius - y : y >= size - radius ? y - (size - radius - 1) : 0;
        return rx * rx + ry * ry <= radius * radius;
      })();
      if (inside) set(x, y, BG[0], BG[1], BG[2]);
    }
  }

  // "F" built from three bars (stem, top arm, middle arm)
  const s = maskable ? 0.42 : 0.52; // F height as fraction of canvas
  const h = Math.round(size * s);
  const w = Math.round(h * 0.62); // F width
  const bar = Math.max(2, Math.round(h * 0.16)); // stroke thickness
  const x0 = Math.round((size - w) / 2);
  const y0 = Math.round((size - h) / 2);

  const fill = (x, y, w2, h2) => {
    for (let yy = y; yy < y + h2; yy++) for (let xx = x; xx < x + w2; xx++) set(xx, yy, ...FG);
  };

  fill(x0, y0, bar, h); // stem
  fill(x0, y0, w, bar); // top arm
  fill(x0, y0 + Math.round((h - bar) * 0.45), Math.round(w * 0.78), bar); // middle arm

  return px;
}

const icons = [
  ["icon-192.png", 192, {}],
  ["icon-512.png", 512, {}],
  ["apple-touch-icon.png", 180, {}],
  ["icon-maskable-512.png", 512, { maskable: true }],
];

for (const [name, size, opts] of icons) {
  writeFileSync(join(outDir, name), encodePNG(renderIcon(size, opts), size));
  console.log("✓", name);
}

// ---------------------------------------------------------------- SVG source
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="92" fill="#09090b"/>
  <g fill="#fafafa">
    <rect x="196" y="123" width="53" height="266"/>
    <rect x="196" y="123" width="176" height="53"/>
    <rect x="196" y="257" width="138" height="53"/>
  </g>
</svg>
`;
writeFileSync(join(outDir, "icon.svg"), svg);
console.log("✓ icon.svg");
console.log("\nDone. Icons written to public/icons/");
