// Regenerates demo.svg from the built library: `npm run build && node scripts/demo.js`.
// It mirrors the layout in src/TextAvatar.tsx so the picture matches what the component draws.
const fs = require('fs');
const path = require('path');
const { getInitials } = require('../lib/initials');
const { getColor, getContrastColor } = require('../lib/color');

const SIZE = 72;
const GAP = 20;
const PAD = 24;
const rows = [
  { shape: 'circle', names: ['John Doe', 'Çağlar İspirli', 'Ada Lovelace', 'Technology', 'Grace Hopper', 'Linus Torvalds'] },
  { shape: 'rounded', names: ['Alan Turing', 'Margaret Hamilton', 'Dennis Ritchie', 'Barbara Liskov', 'Ken Thompson', 'Radia Perlman'] },
  { shape: 'square', names: ['Tim Berners-Lee', 'Katherine Johnson', 'Edsger Dijkstra', 'Hedy Lamarr', 'Donald Knuth', 'Annie Easley'] },
  { shape: 'hexagon', names: ['Mars Rover', 'React Native', 'Text Avatar', 'Open Source', 'Type Script', 'Zero Deps'] },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const k = Math.sqrt(3) / 2;

function avatar(name, shape, x, y) {
  const bg = getColor(name);
  const fg = getContrastColor(bg);
  const text = getInitials(name);
  const c = SIZE / 2;
  let body;
  if (shape === 'hexagon') {
    body = ['0', '60', '-60']
      .map(
        (deg) =>
          `<rect x="${(SIZE * (1 - k)) / 2}" y="${SIZE / 4}" width="${SIZE * k}" height="${SIZE / 2}" fill="${bg}" transform="rotate(${deg} ${c} ${c})"/>`
      )
      .join('');
  } else {
    const r = shape === 'circle' ? c : shape === 'rounded' ? SIZE * 0.22 : 0;
    body = `<rect width="${SIZE}" height="${SIZE}" rx="${r}" fill="${bg}"/>`;
  }
  return `<g transform="translate(${x} ${y})">${body}<text x="${c}" y="${c}" fill="${fg}" font-size="${SIZE * 0.4}" font-weight="600" text-anchor="middle" dominant-baseline="central">${esc(text)}</text></g>`;
}

const cols = rows[0].names.length;
const width = PAD * 2 + cols * SIZE + (cols - 1) * GAP;
const height = PAD * 2 + rows.length * SIZE + (rows.length - 1) * GAP;
const items = rows
  .map((row, r) =>
    row.names.map((name, i) => avatar(name, row.shape, PAD + i * (SIZE + GAP), PAD + r * (SIZE + GAP))).join('\n')
  )
  .join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
<rect width="${width}" height="${height}" rx="16" fill="#f6f6f8"/>
${items}
</svg>
`;
fs.writeFileSync(path.join(__dirname, '..', 'demo.svg'), svg);
