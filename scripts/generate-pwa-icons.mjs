import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const srcPath = join(root, "public", "logo-black.png");
const outDir = join(root, "public", "icons");

if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

/**
 * Square PWA icon: white canvas, logo scaled to fit with padding.
 */
async function makeSquarePng(size, paddingRatio = 0.12) {
  const padding = Math.round(size * paddingRatio);
  const inner = size - padding * 2;

  const resized = await sharp(srcPath)
    .resize(inner, inner, { fit: "inside", withoutEnlargement: false })
    .ensureAlpha()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: resized, gravity: "center" }])
    .png()
    .toBuffer();
}

const p192 = await makeSquarePng(192);
const p512 = await makeSquarePng(512);
const apple = await makeSquarePng(180, 0.1);

writeFileSync(join(outDir, "pwa-192.png"), p192);
writeFileSync(join(outDir, "pwa-512.png"), p512);
writeFileSync(join(outDir, "apple-touch-icon.png"), apple);

console.log("Wrote public/icons/pwa-192.png, pwa-512.png, apple-touch-icon.png");
