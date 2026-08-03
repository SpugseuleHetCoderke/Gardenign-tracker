/**
 * Generates the PWA app icons from a single SVG source, so "add to home
 * screen" gets a real icon instead of a browser default. Re-run this after
 * changing the design below — the PNGs in public/ are build output, not
 * something to hand-edit.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const OUT_DIR = resolve(import.meta.dirname, "../public");

/** A simple rounded leaf mark on the app's accent green. */
function svgIcon(size: number, { maskable }: { maskable?: boolean } = {}) {
  // Maskable icons need their content inside a smaller "safe zone" circle,
  // since Android may crop the outer edges into a circle/squircle.
  const pad = maskable ? size * 0.2 : size * 0.12;
  const inner = size - pad * 2;

  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${maskable ? 0 : size * 0.22}" fill="#3f7d3a"/>
  <g transform="translate(${pad}, ${pad})">
    <path d="M ${inner * 0.5} ${inner * 0.06}
             C ${inner * 0.92} ${inner * 0.1}, ${inner * 0.92} ${inner * 0.62}, ${inner * 0.5} ${inner * 0.94}
             C ${inner * 0.08} ${inner * 0.62}, ${inner * 0.08} ${inner * 0.1}, ${inner * 0.5} ${inner * 0.06} Z"
          fill="#f6f7f2"/>
    <path d="M ${inner * 0.5} ${inner * 0.2} L ${inner * 0.5} ${inner * 0.86}"
          stroke="#3f7d3a" stroke-width="${inner * 0.035}" stroke-linecap="round"/>
  </g>
</svg>`;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const targets: { file: string; size: number; maskable?: boolean }[] = [
    { file: "icon-192.png", size: 192 },
    { file: "icon-512.png", size: 512 },
    { file: "icon-maskable-512.png", size: 512, maskable: true },
    { file: "apple-touch-icon.png", size: 180 },
  ];

  for (const t of targets) {
    const svg = svgIcon(t.size, { maskable: t.maskable });
    await sharp(Buffer.from(svg)).png().toFile(resolve(OUT_DIR, t.file));
    console.log(`  wrote ${t.file}`);
  }

  // Also drop a plain SVG favicon — crisp at any size, and what most
  // browsers other than Safari prefer for the tab icon.
  writeFileSync(resolve(OUT_DIR, "icon.svg"), svgIcon(64).trim());
  console.log("  wrote icon.svg");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
