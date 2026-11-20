// Regenerates demo.svg (light) and demo-dark.svg from the built library:
//   npm run demo
// It mirrors the layout in src/TextAvatar.tsx and src/GradientAvatar.tsx so the
// pictures match what the components draw.
const fs = require('fs');
const path = require('path');
const { getInitials } = require('../lib/initials');
const {
  getColor,
  getContrastColor,
  getSoftColors,
  darken,
  luminance,
  parseColor,
} = require('../lib/color');
const { getOrb } = require('../lib/orb');
const { NOISE_URI } = require('../lib/noise');

const WIDTH = 620;
const PAD = 32;
const GAP = 20;
const ROW_GAP = 28;
const INNER = WIDTH - PAD * 2;

const rows = [
  { kind: 'gradient', text: false, names: ['Alan Turing', 'Linus Torvalds', 'Ada Lovelace', 'Margaret Hamilton'] },
  { kind: 'gradient', text: true, names: ['Çağlar İspirli', 'Grace Hopper', 'Carl Sagan', 'Rosalind Franklin', 'Ken Thompson', 'Mars Rover'] },
  { kind: 'solid', shape: 'circle', names: ['John Doe', 'Margaret Hamilton', 'Dennis Ritchie', 'Technology', 'Donald Knuth', 'Barbara Liskov'] },
  { kind: 'soft', shape: 'rounded', names: ['Tim Berners-Lee', 'Katherine Johnson', 'Edsger Dijkstra', 'Hedy Lamarr', 'Donald Knuth', 'Annie Easley'] },
  { kind: 'solid', shape: 'hexagon', names: ['React Native', 'Text Avatar', 'Open Source', 'Type Script', 'Dark Mode', 'Barbara Liskov'] },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const k = Math.sqrt(3) / 2;
const n = (v) => Math.round(v * 100) / 100;

function label(text, fill, size) {
  return `<text x="${size / 2}" y="${size / 2}" fill="${fill}" font-size="${n(size * 0.4)}" font-weight="600" text-anchor="middle" dominant-baseline="central">${esc(text)}</text>`;
}

function flat(name, kind, shape, scheme, size) {
  const c = size / 2;
  const base = getColor(name);
  const soft = kind === 'soft' ? getSoftColors(base, scheme) : null;
  const bg = soft ? soft.background : base;
  const fg = soft ? soft.text : getContrastColor(bg);
  let body;
  if (shape === 'hexagon') {
    body = ['0', '60', '-60']
      .map(
        (deg) =>
          `<rect x="${n((size * (1 - k)) / 2)}" y="${n(size / 4)}" width="${n(size * k)}" height="${n(size / 2)}" fill="${bg}" transform="rotate(${deg} ${c} ${c})"/>`
      )
      .join('');
  } else {
    const r = shape === 'circle' ? c : shape === 'rounded' ? size * 0.22 : 0;
    body = `<rect width="${size}" height="${size}" rx="${n(r)}" fill="${bg}"/>`;
  }
  return body + label(getInitials(name), fg, size);
}

function gradient(name, scheme, id, size, withText) {
  const c = size / 2;
  const orb = getOrb(name, scheme);
  const defs = orb.blobs
    .map(
      (b, i) =>
        `<radialGradient id="${id}-${i}"><stop offset="0" stop-color="${b.color}" stop-opacity="${b.opacity}"/><stop offset="0.5" stop-color="${b.color}" stop-opacity="${n(b.opacity * 0.6)}"/><stop offset="1" stop-color="${b.color}" stop-opacity="0"/></radialGradient>`
    )
    .join('');
  const blobs = orb.blobs
    .map((b, i) => `<circle cx="${n(b.cx * size)}" cy="${n(b.cy * size)}" r="${n(b.r * size)}" fill="url(#${id}-${i})"/>`)
    .join('');
  const rgb = parseColor(orb.base);
  const fg = rgb && luminance(rgb) > 0.42 ? darken(orb.base, 0.72) : '#ffffff';
  return `<defs>${defs}<clipPath id="${id}-clip"><circle cx="${c}" cy="${c}" r="${c}"/></clipPath></defs><g clip-path="url(#${id}-clip)"><rect width="${size}" height="${size}" fill="${orb.base}"/>${blobs}<rect width="${size}" height="${size}" fill="url(#shade)"/><image width="${size}" height="${size}" preserveAspectRatio="none" opacity="0.3" href="${NOISE_URI}"/></g>${withText ? label(getInitials(name), fg, size) : ''}`;
}

function render(scheme) {
  let y = PAD;
  const items = rows
    .map((row, r) => {
      const cols = row.names.length;
      const size = (INNER - (cols - 1) * GAP) / cols;
      const out = row.names
        .map((name, i) => {
          const inner =
            row.kind === 'gradient'
              ? gradient(name, scheme, `o${r}${i}`, size, row.text)
              : flat(name, row.kind, row.shape, scheme, size);
          return `<g transform="translate(${n(PAD + i * (size + GAP))} ${n(y)})">${inner}</g>`;
        })
        .join('\n');
      y += size + ROW_GAP;
      return out;
    })
    .join('\n');
  const height = n(y - ROW_GAP + PAD);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" font-family="-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
<defs>
<radialGradient id="shade" cx="36%" cy="30%" r="78%"><stop offset="0" stop-color="#fff" stop-opacity="0.2"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.2"/></radialGradient>
</defs>
<rect width="${WIDTH}" height="${height}" rx="20" fill="${scheme === 'dark' ? '#161618' : '#f4f3f1'}"/>
${items}
</svg>
`;
}

fs.writeFileSync(path.join(__dirname, '..', 'demo.svg'), render('light'));
fs.writeFileSync(path.join(__dirname, '..', 'demo-dark.svg'), render('dark'));
