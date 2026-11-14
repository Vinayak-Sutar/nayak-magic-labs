/**
 * Draws the raster brand images from the mark's vector paths:
 *   public/og-default.png        1200 × 630 share image
 *   public/logo.png              512 × 512 logo for structured data
 *   public/apple-touch-icon.png  180 × 180 home-screen icon
 *   public/favicon.ico           32 × 32 fallback tab icon
 *
 * Run with:  dev.cmd run images
 * Only needed again if the mark or the colours change.
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { MARK, MARK_VIEWBOX } from '../src/lib/mark.ts';

const INK = '#0b0b0c';
const PAPER = '#f2f2ee';
const COBALT = '#2b4bf2';
const GLOW = '#7f95ff';

const out = (name) => fileURLToPath(new URL(`../public/${name}`, import.meta.url));

/** The › nml_ mark, `width` pixels wide, centred on a `w` × `h` canvas. */
function mark({ w, h, width, letters, hot }) {
  const scale = width / MARK_VIEWBOX.width;
  const x = (w - width) / 2;
  const y = (h - MARK_VIEWBOX.height * scale) / 2;
  const c = MARK.cursor;
  const letter = (d) => `<path d="${d}" fill="${letters}" stroke="${letters}"/>`;
  return `
    <g transform="translate(${x} ${y}) scale(${scale})" stroke-width="18" stroke-linejoin="round">
      <path d="${MARK.chevron}" fill="${hot}" stroke="${hot}"/>
      ${letter(MARK.n)}${letter(MARK.m)}${letter(MARK.l)}
      <rect x="${c.x}" y="${c.y}" width="${c.width}" height="${c.height}" fill="${hot}"/>
    </g>`;
}

const svg = (w, h, body) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);

await sharp(
  svg(1200, 630, `<rect width="1200" height="630" fill="${PAPER}"/>${mark({ w: 1200, h: 630, width: 700, letters: INK, hot: COBALT })}`),
)
  .png()
  .toFile(out('og-default.png'));

await sharp(
  svg(512, 512, `<rect width="512" height="512" rx="112" fill="${INK}"/>${mark({ w: 512, h: 512, width: 384, letters: PAPER, hot: GLOW })}`),
)
  .png()
  .toFile(out('logo.png'));

await sharp(
  svg(180, 180, `<rect width="180" height="180" fill="${INK}"/>${mark({ w: 180, h: 180, width: 132, letters: PAPER, hot: GLOW })}`),
)
  .png()
  .toFile(out('apple-touch-icon.png'));

// favicon.ico for clients that ignore the SVG icon: one 32 px PNG inside an ICO wrapper.
const icon = await sharp(
  svg(64, 64, `<rect width="64" height="64" rx="14" fill="${INK}"/>${mark({ w: 64, h: 64, width: 50, letters: PAPER, hot: GLOW })}`),
)
  .resize(32, 32)
  .png()
  .toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // one image
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt16LE(1, 10); // colour planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(icon.length, 14); // size of the PNG
header.writeUInt32LE(22, 18); // where the PNG starts
await writeFile(out('favicon.ico'), Buffer.concat([header, icon]));

console.log('Wrote og-default.png, logo.png, apple-touch-icon.png and favicon.ico to public/');
