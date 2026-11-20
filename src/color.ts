/**
 * Default palette the background color is picked from. Every color has a WCAG
 * contrast ratio of at least 4.5 against white text.
 */
export const DEFAULT_COLORS: readonly string[] = [
  '#dc2626',
  '#db2777',
  '#c026d3',
  '#9333ea',
  '#4f46e5',
  '#2563eb',
  '#0369a1',
  '#0e7490',
  '#0f766e',
  '#15803d',
  '#b45309',
  '#c2410c',
];

const DARK_TEXT = '#1c1c1e';
const LIGHT_TEXT = '#ffffff';

/** FNV-1a, 32 bit. Stable across platforms and JS engines. */
export function hash(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Pick a color for a name. The same name always maps to the same color,
 * ignoring case and surrounding whitespace.
 */
export function getColor(
  name: string | null | undefined,
  colors: readonly string[] = DEFAULT_COLORS
): string {
  const palette = colors.length > 0 ? colors : DEFAULT_COLORS;
  const key = typeof name === 'string' ? name.trim().toLowerCase() : '';
  return palette[hash(key) % palette.length] as string;
}

export function parseColor(color: string): [number, number, number] | null {
  const value = color.trim().toLowerCase();

  const hex = /^#([0-9a-f]{3,8})$/.exec(value)?.[1];
  if (hex) {
    if (hex.length === 3 || hex.length === 4) {
      return [0, 1, 2].map((i) => parseInt(hex.charAt(i) + hex.charAt(i), 16)) as [
        number,
        number,
        number,
      ];
    }
    if (hex.length === 6 || hex.length === 8) {
      return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [
        number,
        number,
        number,
      ];
    }
    return null;
  }

  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/.exec(value);
  if (rgb) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  }
  return null;
}

export function luminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const s = Math.min(255, Math.max(0, c)) / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * Return whichever of `dark` / `light` has the higher WCAG contrast ratio
 * against `background`. Understands hex and `rgb()` / `rgba()` colors; for
 * anything else (named colors, `hsl()`, platform colors) it returns `light`.
 */
export function getContrastColor(
  background: string,
  dark: string = DARK_TEXT,
  light: string = LIGHT_TEXT
): string {
  const bg = typeof background === 'string' ? parseColor(background) : null;
  if (!bg) return light;

  const bgLum = luminance(bg);
  const ratio = (color: string, fallback: number) => {
    const parsed = parseColor(color);
    const lum = parsed ? luminance(parsed) : fallback;
    return (Math.max(bgLum, lum) + 0.05) / (Math.min(bgLum, lum) + 0.05);
  };
  return ratio(dark, 0) > ratio(light, 1) ? dark : light;
}

export type ColorScheme = 'light' | 'dark';

function toHex(rgb: readonly [number, number, number]): string {
  return (
    '#' +
    rgb
      .map((c) =>
        Math.round(Math.min(255, Math.max(0, c)))
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  );
}

function mix(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  amount: number
): [number, number, number] {
  return [0, 1, 2].map(
    (i) => (a[i] as number) + ((b[i] as number) - (a[i] as number)) * amount
  ) as [number, number, number];
}

const WHITE = [255, 255, 255] as const;
const BLACK = [0, 0, 0] as const;

/**
 * Tinted background and matching text color for the `soft` variant: a pale
 * tint with dark text in light mode, a deep shade with light text in dark
 * mode. Returns null for colors it cannot parse.
 */
export function getSoftColors(
  color: string,
  scheme: ColorScheme = 'light'
): { background: string; text: string } | null {
  const rgb = typeof color === 'string' ? parseColor(color) : null;
  if (!rgb) return null;
  return scheme === 'dark'
    ? { background: toHex(mix(rgb, BLACK, 0.68)), text: toHex(mix(rgb, WHITE, 0.72)) }
    : { background: toHex(mix(rgb, WHITE, 0.86)), text: toHex(mix(rgb, BLACK, 0.4)) };
}

/** HSL (h in degrees, s and l in 0..1) to a hex color. */
export function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + hue / 30) % 12;
    return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
  };
  return toHex([f(0), f(8), f(4)]);
}
