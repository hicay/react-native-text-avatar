// Regenerates demo.svg (light) and demo-dark.svg from the built library:
//   npm run demo
// It mirrors the layout in src/TextAvatar.tsx and src/GradientAvatar.tsx so the
// pictures match what the components draw.
const fs = require('fs');
const path = require('path');
const { getInitials } = require('../lib/initials');
const { getColor, getContrastColor, getSoftColors } = require('../lib/color');
const { getOrb } = require('../lib/orb');
const { NOISE_URI, NOISE_SIZE } = require('../lib/noise');

const SIZE = 72;
const GAP = 20;
const PAD = 24;
const rows = [
  { kind: 'gradient', shape: 'circle', names: ['Mars Rover', 'Çağlar İspirli', 'Ada Lovelace', 'Grace Hopper', 'Linus Torvalds', 'Alan Turing'] },
  { kind: 'solid', shape: 'circle', names: ['John Doe', 'Margaret Hamilton', 'Dennis Ritchie', 'Technology', 'Ken Thompson', 'Radia Perlman'] },
  { kind: 'soft', shape: 'rounded', names: ['Tim Berners-Lee', 'Katherine Johnson', 'Edsger Dijkstra', 'Hedy Lamarr', 'Donald Knuth', 'Annie Easley'] },
  { kind: 'solid', shape: 'hexagon', names: ['React Native', 'Text Avatar', 'Open Source', 'Type Script', 'Dark Mode', 'Barbara Liskov'] },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const k = Math.sqrt(3) / 2;
const c = SIZE / 2;

function label(text, fill) {
  return `<text x="${c}" y="${c}" fill="${fill}" font-size="${SIZE * 0.4}" font-weight="600" text-anchor="middle" dominant-baseline="central">${esc(text)}</text>`;
}

function flat(name, kind, shape, scheme) {
  const base = getColor(name);
  const soft = kind === 'soft' ? getSoftColors(base, scheme) : null;
  const bg = soft ? soft.background : base;
  const fg = soft ? soft.text : getContrastColor(bg);
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
  return body + label(getInitials(name), fg);
}

function gradient(name, scheme, id) {
  const orb = getOrb(name, scheme);
  const defs = orb.blobs
    .map(
      (b, i) =>
        `<radialGradient id="${id}-${i}"><stop offset="0" stop-color="${b.color}" stop-opacity="${b.opacity}"/><stop offset="0.55" stop-color="${b.color}" stop-opacity="${b.opacity * 0.55}"/><stop offset="1" stop-color="${b.color}" stop-opacity="0"/></radialGradient>`
    )
    .join('');
  const blobs = orb.blobs
    .map((b, i) => `<circle cx="${b.cx * SIZE}" cy="${b.cy * SIZE}" r="${b.r * SIZE}" fill="url(#${id}-${i})"/>`)
    .join('');
  return `<defs>${defs}<clipPath id="${id}-clip"><circle cx="${c}" cy="${c}" r="${c}"/></clipPath></defs><g clip-path="url(#${id}-clip)"><rect width="${SIZE}" height="${SIZE}" fill="${orb.base}"/>${blobs}<rect width="${SIZE}" height="${SIZE}" fill="url(#shade)"/><rect width="${SIZE}" height="${SIZE}" fill="url(#grain)" opacity="0.3"/></g><g filter="url(#shadow)">${label(getInitials(name), '#ffffff')}</g>`;
}

function render(scheme) {
  const cols = rows[0].names.length;
  const width = PAD * 2 + cols * SIZE + (cols - 1) * GAP;
  const height = PAD * 2 + rows.length * SIZE + (rows.length - 1) * GAP;
  const items = rows
    .map((row, r) =>
      row.names
        .map((name, i) => {
          const inner =
            row.kind === 'gradient'
              ? gradient(name, scheme, `o${r}${i}`)
              : flat(name, row.kind, row.shape, scheme);
          return `<g transform="translate(${PAD + i * (SIZE + GAP)} ${PAD + r * (SIZE + GAP)})">${inner}</g>`;
        })
        .join('\n')
    )
    .join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
<defs>
<radialGradient id="shade" cx="36%" cy="30%" r="78%"><stop offset="0" stop-color="#fff" stop-opacity="0.28"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.3"/></radialGradient>
<pattern id="grain" width="${NOISE_SIZE}" height="${NOISE_SIZE}" patternUnits="userSpaceOnUse"><image width="${NOISE_SIZE}" height="${NOISE_SIZE}" href="${NOISE_URI}"/></pattern>
<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.3"/></filter>
</defs>
<rect width="${width}" height="${height}" rx="16" fill="${scheme === 'dark' ? '#1c1c1e' : '#f6f6f8'}"/>
${items}
</svg>
`;
}

fs.writeFileSync(path.join(__dirname, '..', 'demo.svg'), render('light'));
fs.writeFileSync(path.join(__dirname, '..', 'demo-dark.svg'), render('dark'));
