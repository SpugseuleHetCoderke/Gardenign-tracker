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

/**
 * A long-red-haired woman kneeling to tend a potted plant.
 *
 * Drawn with gradients and organic curves rather than flat blocks, so it
 * reads as an illustration instead of a pictogram. The whole scene is laid
 * out in a 0..1 square and scaled up, which keeps the numbers below readable
 * as proportions.
 */
function svgIcon(size: number, { maskable }: { maskable?: boolean } = {}) {
  // Maskable icons need their content inside a smaller "safe zone", since
  // Android may crop the outer edges into a circle/squircle.
  const pad = maskable ? size * 0.2 : size * 0.11;
  const inner = size - pad * 2;

  /** Scale a 0..1 proportion into the drawing area. */
  const s = (v: number) => (v * inner).toFixed(2);

  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fdf6ec"/>
      <stop offset="1" stop-color="#f6e6d0"/>
    </linearGradient>
    <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9c6c46"/>
      <stop offset="1" stop-color="#69452a"/>
    </linearGradient>
    <linearGradient id="pot" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f0904f"/>
      <stop offset="1" stop-color="#b04c1a"/>
    </linearGradient>
    <linearGradient id="leaf" x1="0" y1="1" x2="0.5" y2="0">
      <stop offset="0" stop-color="#2f6b2c"/>
      <stop offset="1" stop-color="#67b357"/>
    </linearGradient>
    <linearGradient id="hair" x1="0.15" y1="0" x2="0.9" y2="1">
      <stop offset="0" stop-color="#ffa04a"/>
      <stop offset="0.4" stop-color="#f0701f"/>
      <stop offset="1" stop-color="#a83a0c"/>
    </linearGradient>
    <linearGradient id="hairShine" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffc182" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#ffc182" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f9d6b1"/>
      <stop offset="1" stop-color="#e0a476"/>
    </linearGradient>
    <linearGradient id="dress" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#93b6ca"/>
      <stop offset="1" stop-color="#4f7791"/>
    </linearGradient>
  </defs>

  <rect width="${size}" height="${size}" rx="${maskable ? 0 : size * 0.22}" fill="url(#bg)"/>

  <g transform="translate(${pad}, ${pad})">
    <!-- Ground -->
    <path d="M 0 ${s(0.83)} C ${s(0.3)} ${s(0.805)}, ${s(0.7)} ${s(0.805)}, ${s(1)} ${s(0.83)}
             L ${s(1)} ${s(1)} L 0 ${s(1)} Z" fill="url(#soil)"/>

    <!-- Potted plant -->
    <g>
      <path d="M ${s(0.24)} ${s(0.7)} C ${s(0.15)} ${s(0.62)}, ${s(0.13)} ${s(0.5)}, ${s(0.17)} ${s(0.44)}
               C ${s(0.22)} ${s(0.49)}, ${s(0.25)} ${s(0.6)}, ${s(0.25)} ${s(0.7)} Z" fill="url(#leaf)"/>
      <path d="M ${s(0.26)} ${s(0.7)} C ${s(0.35)} ${s(0.62)}, ${s(0.37)} ${s(0.5)}, ${s(0.33)} ${s(0.44)}
               C ${s(0.28)} ${s(0.49)}, ${s(0.25)} ${s(0.6)}, ${s(0.25)} ${s(0.7)} Z" fill="url(#leaf)"/>
      <path d="M ${s(0.25)} ${s(0.7)} C ${s(0.2)} ${s(0.58)}, ${s(0.21)} ${s(0.44)}, ${s(0.25)} ${s(0.37)}
               C ${s(0.29)} ${s(0.44)}, ${s(0.3)} ${s(0.58)}, ${s(0.25)} ${s(0.7)} Z" fill="url(#leaf)"/>
      <path d="M ${s(0.25)} ${s(0.4)} L ${s(0.25)} ${s(0.7)}"
            stroke="#255c22" stroke-width="${s(0.008)}" stroke-linecap="round" opacity="0.5"/>

      <path d="M ${s(0.155)} ${s(0.7)} L ${s(0.345)} ${s(0.7)}
               C ${s(0.335)} ${s(0.79)}, ${s(0.32)} ${s(0.845)}, ${s(0.3)} ${s(0.85)}
               L ${s(0.2)} ${s(0.85)}
               C ${s(0.18)} ${s(0.845)}, ${s(0.165)} ${s(0.79)}, ${s(0.155)} ${s(0.7)} Z" fill="url(#pot)"/>
      <rect x="${s(0.145)}" y="${s(0.675)}" width="${s(0.21)}" height="${s(0.045)}"
            rx="${s(0.02)}" fill="#c9581d"/>
      <path d="M ${s(0.2)} ${s(0.72)} C ${s(0.195)} ${s(0.78)}, ${s(0.2)} ${s(0.82)}, ${s(0.21)} ${s(0.845)}"
            stroke="#ffb583" stroke-width="${s(0.012)}" stroke-linecap="round" opacity="0.5" fill="none"/>
    </g>

    <!-- Long hair, drawn behind the body -->
    <path d="M ${s(0.60)} ${s(0.225)}
             C ${s(0.735)} ${s(0.225)}, ${s(0.805)} ${s(0.315)}, ${s(0.80)} ${s(0.42)}
             C ${s(0.835)} ${s(0.52)}, ${s(0.878)} ${s(0.63)}, ${s(0.868)} ${s(0.73)}
             C ${s(0.858)} ${s(0.80)}, ${s(0.832)} ${s(0.848)}, ${s(0.80)} ${s(0.862)}
             C ${s(0.788)} ${s(0.76)}, ${s(0.757)} ${s(0.655)}, ${s(0.726)} ${s(0.575)}
             C ${s(0.70)} ${s(0.50)}, ${s(0.672)} ${s(0.43)}, ${s(0.655)} ${s(0.395)}
             C ${s(0.60)} ${s(0.345)}, ${s(0.548)} ${s(0.305)}, ${s(0.543)} ${s(0.285)}
             C ${s(0.553)} ${s(0.253)}, ${s(0.574)} ${s(0.225)}, ${s(0.60)} ${s(0.225)} Z"
          fill="url(#hair)"/>

    <!-- Neck, tucked behind the dress -->
    <path d="M ${s(0.578)} ${s(0.415)} L ${s(0.635)} ${s(0.415)}
             L ${s(0.645)} ${s(0.50)} L ${s(0.575)} ${s(0.50)} Z" fill="#dfa273"/>

    <!-- Dress -->
    <path d="M ${s(0.60)} ${s(0.45)}
             C ${s(0.68)} ${s(0.45)}, ${s(0.72)} ${s(0.5)}, ${s(0.735)} ${s(0.58)}
             C ${s(0.755)} ${s(0.68)}, ${s(0.775)} ${s(0.78)}, ${s(0.78)} ${s(0.84)}
             L ${s(0.50)} ${s(0.84)}
             C ${s(0.505)} ${s(0.74)}, ${s(0.53)} ${s(0.6)}, ${s(0.565)} ${s(0.5)}
             C ${s(0.575)} ${s(0.47)}, ${s(0.585)} ${s(0.45)}, ${s(0.60)} ${s(0.45)} Z"
          fill="url(#dress)"/>

    <!-- Arm reaching toward the plant -->
    <path d="M ${s(0.60)} ${s(0.5)}
             C ${s(0.54)} ${s(0.55)}, ${s(0.47)} ${s(0.61)}, ${s(0.40)} ${s(0.655)}"
          stroke="url(#skin)" stroke-width="${s(0.055)}" stroke-linecap="round" fill="none"/>
    <circle cx="${s(0.385)}" cy="${s(0.665)}" r="${s(0.033)}" fill="url(#skin)"/>

    <!-- Head: profile facing the plant -->
    <path d="M ${s(0.60)} ${s(0.245)}
             C ${s(0.545)} ${s(0.25)}, ${s(0.515)} ${s(0.30)}, ${s(0.518)} ${s(0.345)}
             C ${s(0.50)} ${s(0.365)}, ${s(0.497)} ${s(0.378)}, ${s(0.508)} ${s(0.383)}
             C ${s(0.516)} ${s(0.387)}, ${s(0.516)} ${s(0.40)}, ${s(0.522)} ${s(0.408)}
             C ${s(0.528)} ${s(0.428)}, ${s(0.545)} ${s(0.447)}, ${s(0.575)} ${s(0.45)}
             C ${s(0.635)} ${s(0.455)}, ${s(0.68)} ${s(0.425)}, ${s(0.69)} ${s(0.375)}
             C ${s(0.70)} ${s(0.31)}, ${s(0.665)} ${s(0.25)}, ${s(0.60)} ${s(0.245)} Z"
          fill="url(#skin)"/>

    <!-- Fringe sweeping over the forehead -->
    <path d="M ${s(0.60)} ${s(0.235)}
             C ${s(0.66)} ${s(0.238)}, ${s(0.70)} ${s(0.285)}, ${s(0.695)} ${s(0.345)}
             C ${s(0.66)} ${s(0.315)}, ${s(0.60)} ${s(0.30)}, ${s(0.545)} ${s(0.315)}
             C ${s(0.532)} ${s(0.30)}, ${s(0.53)} ${s(0.275)}, ${s(0.545)} ${s(0.258)}
             C ${s(0.56)} ${s(0.242)}, ${s(0.58)} ${s(0.235)}, ${s(0.60)} ${s(0.235)} Z"
          fill="url(#hair)"/>

    <!-- A strand falling forward over the shoulder -->
    <path d="M ${s(0.663)} ${s(0.40)}
             C ${s(0.70)} ${s(0.46)}, ${s(0.715)} ${s(0.55)}, ${s(0.712)} ${s(0.63)}
             C ${s(0.71)} ${s(0.68)}, ${s(0.70)} ${s(0.71)}, ${s(0.688)} ${s(0.723)}
             C ${s(0.683)} ${s(0.65)}, ${s(0.67)} ${s(0.56)}, ${s(0.65)} ${s(0.49)}
             C ${s(0.64)} ${s(0.45)}, ${s(0.645)} ${s(0.42)}, ${s(0.663)} ${s(0.40)} Z"
          fill="url(#hair)"/>

    <!-- Hair highlight -->
    <path d="M ${s(0.66)} ${s(0.265)}
             C ${s(0.725)} ${s(0.305)}, ${s(0.755)} ${s(0.42)}, ${s(0.782)} ${s(0.525)}
             C ${s(0.808)} ${s(0.63)}, ${s(0.828)} ${s(0.73)}, ${s(0.822)} ${s(0.81)}
             C ${s(0.795)} ${s(0.725)}, ${s(0.762)} ${s(0.60)}, ${s(0.732)} ${s(0.495)}
             C ${s(0.706)} ${s(0.395)}, ${s(0.678)} ${s(0.305)}, ${s(0.66)} ${s(0.265)} Z"
          fill="url(#hairShine)"/>

    <!-- Eye -->
    <circle cx="${s(0.558)}" cy="${s(0.355)}" r="${s(0.011)}" fill="#5c3a24"/>
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
