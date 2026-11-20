import { darken, hash } from './color';
import type { ColorScheme } from './color';

export interface OrbBlob {
  /** Center and radius as fractions of the avatar size. */
  cx: number;
  cy: number;
  r: number;
  color: string;
  opacity: number;
}

export interface Orb {
  /** Flat color underneath the blobs. Also a good accent color for the name. */
  base: string;
  blobs: OrbBlob[];
}

/**
 * Hand-picked palettes: a base color, then highlight, shadow and three accents
 * in neighbouring hues. Random hues turn muddy quickly, so the orb picks one
 * of these and only randomizes the layout.
 */
export const ORB_PALETTES: readonly (readonly string[])[] = [
  ['#a78bfa', '#f5d0fe', '#6d5bd0', '#93c5fd', '#fbcfe8', '#c4b5fd'], // lavender
  ['#ea6a2a', '#fdc58a', '#a33a12', '#fb923c', '#fed7aa', '#d9531e'], // ember
  ['#6f5252', '#d9a391', '#3b2e2e', '#a5b4fc', '#c98b7a', '#574040'], // cocoa
  ['#1fb5a6', '#a5f3fc', '#0f6f68', '#38bdf8', '#a7f3d0', '#5eead4'], // lagoon
  ['#ee4d6a', '#fecdd3', '#b01540', '#fdba74', '#f9a8d4', '#fb7185'], // rose
  ['#4a86f0', '#bfdbfe', '#1f3fa6', '#a5b4fc', '#67e8f9', '#6d70f0'], // ocean
  ['#f2768c', '#fed7aa', '#b0309c', '#fcd34d', '#f472b6', '#b267f0'], // sunset
  ['#9a45e6', '#f5d0fe', '#5a1f8f', '#f9a8d4', '#818cf8', '#c084fc'], // grape
  ['#f0a01c', '#fef3c7', '#b4560c', '#fdba74', '#fcd34d', '#ea6a12'], // gold
  ['#6c7c93', '#e2e8f0', '#364356', '#a5b4fc', '#cbd5e1', '#94a3b8'], // slate
  ['#f8b27a', '#ffe4e6', '#f08a3c', '#fef3c7', '#f9a8d4', '#fca5a5'], // peach
  ['#3fae78', '#d1fae5', '#17694a', '#99f6e4', '#bef264', '#6ee7b7'], // fern
];

/** mulberry32: small seeded PRNG, identical on every JS engine. */
function random(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (value: number) => Math.round(value * 1000) / 1000;

// Rough positions for the five blobs, so they spread over the orb instead of
// piling up; each one is then nudged and the whole layout rotated per name.
const ANCHORS: readonly (readonly [number, number])[] = [
  [0.3, 0.26],
  [0.74, 0.78],
  [0.76, 0.28],
  [0.26, 0.76],
  [0.52, 0.52],
];

/**
 * Describe the soft gradient orb for a name: a base color plus five large,
 * blurred color blobs. The same name always gives the same orb; dark mode
 * gives a deeper version of it.
 */
export function getOrb(
  name: string | null | undefined,
  scheme: ColorScheme = 'light'
): Orb {
  const key = typeof name === 'string' ? name.trim().toLowerCase() : '';
  const seed = hash(key);
  const rand = random(seed);
  const dark = scheme === 'dark';

  const palette = ORB_PALETTES[seed % ORB_PALETTES.length] as readonly string[];
  const tone = (color: string, amount: number) =>
    dark ? darken(color, amount) : color;

  const angle = rand() * Math.PI * 2;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const blobs = ANCHORS.map(([ax, ay], i) => {
    const x = ax - 0.5 + (rand() - 0.5) * 0.22;
    const y = ay - 0.5 + (rand() - 0.5) * 0.22;
    return {
      cx: round(0.5 + x * cos - y * sin),
      cy: round(0.5 + x * sin + y * cos),
      r: round(0.46 + rand() * 0.22),
      // The highlight stays brighter in dark mode so the orb keeps its depth.
      color: tone(palette[i + 1] as string, i === 0 ? 0.08 : 0.26),
      opacity: 0.95,
    };
  });

  return { base: tone(palette[0] as string, 0.26), blobs };
}
