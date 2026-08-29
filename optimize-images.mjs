/**
 * Mengecilkan dan mengonversi screenshot ke WebP, lalu memperbarui referensi
 * <img> di seluruh HTML beserta atribut width/height-nya.
 *
 * Cara pakai:
 *   npm install sharp
 *   node optimize-images.mjs
 *
 * Catatan penting:
 * - File PNG/JPG asli TIDAK dihapus. Itu disengaja: tag Open Graph tetap
 *   menunjuk ke file asli, karena beberapa scraper (WhatsApp, LinkedIn) masih
 *   tidak konsisten menangani WebP. Browser memuat .webp, scraper memuat .png.
 * - Skrip ini idempoten: menjalankannya dua kali tidak merusak apa pun.
 */
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import sharp from 'sharp';

const MAX_WIDTH = 1600;   // cukup untuk layar 2x pada lebar konten ~820px
const QUALITY = 82;

// Jangan disentuh: favicon butuh PNG, og-image dibaca scraper media sosial.
const SKIP = new Set([
  'Assets/favicon-512.png',
  'Assets/og-image.png',
]);

const walk = async (dir) => {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name).replaceAll('\\', '/');
    if (entry.isDirectory()) out.push(...await walk(p));
    else if (/\.(png|jpe?g)$/i.test(entry.name)) out.push(p);
  }
  return out;
};

const htmlFiles = ['index.html', 'id.html',
  ...(await readdir('Project')).filter(f => f.endsWith('.html')).map(f => `Project/${f}`)];

const images = (await walk('Assets')).filter(p => !SKIP.has(p));
const newDims = new Map();
let savedBytes = 0;

for (const src of images) {
  const dest = src.replace(/\.(png|jpe?g)$/i, '.webp');
  const before = (await stat(src)).size;

  const info = await sharp(src)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(dest);

  newDims.set(src, [info.width, info.height]);
  savedBytes += before - info.size;
  console.log(
    `${src.padEnd(52)} ${(before / 1048576).toFixed(2)} MB -> ${(info.size / 1048576).toFixed(2)} MB`
  );
}

// Perbarui HTML: hanya atribut src pada <img>, bukan meta Open Graph.
for (const file of htmlFiles) {
  let doc = await readFile(file, 'utf8');
  const original = doc;

  doc = doc.replace(/<img\b[^>]*>/gi, (tag) => {
    const m = tag.match(/src="([^"]+)"/);
    if (!m) return tag;
    const key = m[1].replace(/^\.\.\//, '');
    if (!newDims.has(key)) return tag;

    const [w, h] = newDims.get(key);
    return tag
      .replace(m[1], m[1].replace(/\.(png|jpe?g)$/i, '.webp'))
      .replace(/width="\d+"/, `width="${w}"`)
      .replace(/height="\d+"/, `height="${h}"`);
  });

  if (doc !== original) {
    await writeFile(file, doc);
    console.log(`diperbarui: ${file}`);
  }
}

console.log(`\nTotal hemat: ${(savedBytes / 1048576).toFixed(2)} MB`);
