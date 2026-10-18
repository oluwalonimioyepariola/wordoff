// Builds the Wordoff logo and every app icon from one drawing.
//   node scripts/build-brand.mjs
// Writes SVGs to brand/ and rasterizes PNGs into assets/ with headless Chrome.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const C = {
  walnut: '#24160d',
  walnutHi: '#3a2416',
  brassHi: '#f0c870',
  brass: '#c8962e',
  brassLo: '#8f6519',
  edge: '#5e3f0e',
  cream: '#f6ead2',
  ink: '#2a160d',
  oxblood: '#9e2b25',
};

function starPoints(cx, cy, outer, inner) {
  return Array.from({ length: 12 }, (_, i) => {
    const a = (Math.PI / 6) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    return `${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`;
  }).join(' ');
}

/**
 * The mark: a lawman's six-point star in polished brass with ball tips, a
 * walnut medallion in the middle, and a wood-type W struck into it with two
 * oxblood bullet holes. Drawn on a 512 grid, centred at (256, 256).
 */
function mark({ mono = false } = {}) {
  const fill = (c) => (mono ? '#ffffff' : c);
  const tips = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return [256 + Math.cos(a) * 214, 256 + Math.sin(a) * 214];
  });
  // Wood-type W: heavy outer strokes, lighter inner strokes, slab serifs on top.
  const wShapes = (color) => `
    <g transform="translate(256 258) scale(0.92)">
      <polygon points="-92,-48 -60,-48 -30,62 -62,62" fill="${color}"/>
      <polygon points="-56,62 -34,62 10,-22 -12,-22" fill="${color}"/>
      <polygon points="56,62 34,62 -10,-22 12,-22" fill="${color}"/>
      <polygon points="92,-48 60,-48 30,62 62,62" fill="${color}"/>
      <rect x="-106" y="-64" width="60" height="18" fill="${color}"/>
      <rect x="46" y="-64" width="60" height="18" fill="${color}"/>
    </g>`;
  const W = wShapes(fill(C.cream));
  if (mono) {
    // Monochrome (Android themed icons): one silhouette, W knocked out.
    return `
      <mask id="m"><rect width="512" height="512" fill="#fff"/>${wShapes('#000')}</mask>
      <g mask="url(#m)">
        <polygon points="${starPoints(256, 256, 206, 120)}" fill="#fff"/>
        ${tips.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="22" fill="#fff"/>`).join('')}
      </g>`;
  }
  return `
    <defs>
      <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${C.brassHi}"/><stop offset="0.55" stop-color="${C.brass}"/><stop offset="1" stop-color="${C.brassLo}"/>
      </linearGradient>
      <radialGradient id="med" cx="0.4" cy="0.35" r="0.75">
        <stop offset="0" stop-color="${C.walnutHi}"/><stop offset="1" stop-color="${C.walnut}"/>
      </radialGradient>
    </defs>
    <polygon points="${starPoints(256, 266, 206, 120)}" fill="${C.edge}"/>
    <polygon points="${starPoints(256, 256, 206, 120)}" fill="url(#brass)"/>
    ${tips.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="22" fill="url(#brass)" stroke="${C.edge}" stroke-width="4"/>`).join('')}
    <circle cx="256" cy="256" r="128" fill="${C.edge}"/>
    <circle cx="256" cy="256" r="120" fill="url(#med)"/>
    <circle cx="256" cy="256" r="108" fill="none" stroke="${C.brass}" stroke-width="3" stroke-dasharray="6 7" opacity="0.8"/>
    ${W}
    <circle cx="300" cy="346" r="8" fill="${C.oxblood}"/><circle cx="300" cy="346" r="3.5" fill="${C.ink}"/>`;
}

const svg = (body, { bg, size = 512, pad = 0 } = {}) => {
  const s = 512 + pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${s} ${s}" width="${size}" height="${size}">
${bg ? `<rect x="${-pad}" y="${-pad}" width="${s}" height="${s}" fill="${bg}"/>` : ''}${body}</svg>`;
};

/** Square app icon: the star on a lamplit walnut field. */
const iconSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <defs><radialGradient id="lamp" cx="0.5" cy="0.42" r="0.7">
    <stop offset="0" stop-color="#5a3620"/><stop offset="1" stop-color="${C.walnut}"/></radialGradient></defs>
  <rect width="512" height="512" fill="url(#lamp)"/>
  <g transform="translate(256 256) scale(0.8) translate(-256 -256)">${mark()}</g></svg>`;

/** Wordmark lockup for the README and landing page (text set in Ultra via the page's own font). */
const files = {
  'brand/logo.svg': svg(mark()),
  'brand/logo-mono.svg': svg(mark({ mono: true })),
  'brand/icon.svg': iconSvg(512),
};

mkdirSync(join(root, 'brand'), { recursive: true });
for (const [path, content] of Object.entries(files)) writeFileSync(join(root, path), content);

/** Render an SVG string to a PNG of the given size; transparent unless it paints a background. */
function rasterize(content, out, size) {
  const tmp = join(root, 'brand', '.render.html');
  writeFileSync(
    tmp,
    `<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style></head><body>${content}</body></html>`,
  );
  execFileSync(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--default-background-color=00000000',
    `--window-size=${size},${size}`,
    `--screenshot=${join(root, out)}`,
    `file://${tmp}`,
  ], { stdio: 'ignore' });
  console.log('wrote', out);
}

rasterize(iconSvg(1024), 'assets/icon.png', 1024);
rasterize(svg(`<g transform="translate(256 256) scale(0.62) translate(-256 -256)">${mark()}</g>`), 'assets/android-icon-foreground.png', 1024);
rasterize(svg('', { bg: C.walnut }), 'assets/android-icon-background.png', 1024);
rasterize(svg(`<g transform="translate(256 256) scale(0.62) translate(-256 -256)">${mark({ mono: true })}</g>`), 'assets/android-icon-monochrome.png', 1024);
rasterize(svg(mark()), 'assets/splash-icon.png', 1024);
rasterize(iconSvg(96), 'assets/favicon.png', 96);
rasterize(svg(mark()), 'brand/logo.png', 512);
