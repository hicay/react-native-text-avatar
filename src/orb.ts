import { hash, hslToHex } from './color';
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

/**
 * Describe the soft gradient orb for a name: a base color plus a handful of
 * blurred color blobs in neighbouring hues. The same name always gives the
 * same orb; dark mode gives a deeper version of it.
 */
export function getOrb(
  name: string | null | undefined,
  scheme: ColorScheme = 'light'
): Orb {
  const key = typeof name === 'string' ? name.trim().toLowerCase() : '';
  const rand = random(hash(key));
  const dark = scheme === 'dark';

  const hue = rand() * 360;
  const base = hslToHex(hue, 0.5 + rand() * 0.2, dark ? 0.38 : 0.56);

  // Lightness per blob: one highlight, one shadow, the rest in between.
  const lightness = dark
    ? [0.58, 0.18, 0.44, 0.28, 0.5]
    : [0.78, 0.4, 0.66, 0.5, 0.72];
  const hueShift = [18, -30, 38, -12, 50];

  const blobs = lightness.map((l, i) => ({
    cx: round(0.12 + rand() * 0.76),
    cy: round(0.12 + rand() * 0.76),
    r: round(0.38 + rand() * 0.3),
    color: hslToHex(
      hue + (hueShift[i] as number) * (0.5 + rand() * 0.6),
      0.5 + rand() * 0.3,
      l
    ),
    opacity: 0.9,
  }));

  return { base, blobs };
}
