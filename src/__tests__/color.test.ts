import {
  DEFAULT_COLORS,
  getColor,
  getContrastColor,
  getSoftColors,
  hslToHex,
  luminance,
  parseColor,
} from '../color';

describe('getColor', () => {
  it('is deterministic and ignores case and whitespace', () => {
    expect(getColor('John Doe')).toBe(getColor('John Doe'));
    expect(getColor('  john DOE ')).toBe(getColor('John Doe'));
    expect(DEFAULT_COLORS).toContain(getColor('John Doe'));
  });

  it('pins known values so colors never shift between releases', () => {
    expect(getColor('John Doe')).toMatchInlineSnapshot(`"#0f766e"`);
    expect(getColor('Jane Doe')).toMatchInlineSnapshot(`"#2563eb"`);
  });

  it('spreads names over the palette', () => {
    const used = new Set(
      Array.from({ length: 200 }, (_, i) => getColor(`user ${i}`))
    );
    expect(used.size).toBe(DEFAULT_COLORS.length);
  });

  it('uses a custom palette and survives an empty one', () => {
    expect(getColor('John Doe', ['#111'])).toBe('#111');
    expect(DEFAULT_COLORS).toContain(getColor('John Doe', []));
  });

  it('tolerates missing names', () => {
    expect(getColor(null)).toBe(getColor(''));
    expect(getColor(undefined)).toBe(getColor(''));
  });
});

describe('getContrastColor', () => {
  it.each([
    ['#ffffff', '#1c1c1e'],
    ['#fff', '#1c1c1e'],
    ['#ffff00', '#1c1c1e'],
    ['#ffc53d', '#1c1c1e'],
    ['rgb(255, 255, 255)', '#1c1c1e'],
    ['rgba(250 250 250 / 0.5)', '#1c1c1e'],
    ['#000', '#ffffff'],
    ['#333333', '#ffffff'],
    ['#333333ff', '#ffffff'],
    ['#3e63dd', '#ffffff'],
    ['rgb(0,0,0)', '#ffffff'],
  ])('%s -> %s', (background, expected) => {
    expect(getContrastColor(background)).toBe(expected);
  });

  it('gives every default color white text at AA contrast', () => {
    const channel = (c: number) => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    for (const color of DEFAULT_COLORS) {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16)) as [number, number, number];
      const lum = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
      expect(getContrastColor(color)).toBe('#ffffff');
      expect(1.05 / (lum + 0.05)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('falls back to light for colors it cannot parse', () => {
    expect(getContrastColor('papayawhip')).toBe('#ffffff');
    expect(getContrastColor('#12')).toBe('#ffffff');
    expect(getContrastColor('#12345')).toBe('#ffffff');
    expect(getContrastColor(undefined as unknown as string)).toBe('#ffffff');
  });

  it('accepts custom dark and light colors', () => {
    expect(getContrastColor('#fff', 'navy', 'ivory')).toBe('navy');
    expect(getContrastColor('#000', 'navy', 'ivory')).toBe('ivory');
  });
});

describe('getSoftColors', () => {
  const contrast = (a: string, b: string) => {
    const la = luminance(parseColor(a) as [number, number, number]);
    const lb = luminance(parseColor(b) as [number, number, number]);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  };

  it.each(['light', 'dark'] as const)(
    'keeps AA contrast for every default color in %s mode',
    (scheme) => {
      for (const color of DEFAULT_COLORS) {
        const soft = getSoftColors(color, scheme);
        expect(soft).not.toBeNull();
        expect(contrast(soft!.background, soft!.text)).toBeGreaterThanOrEqual(4.5);
      }
    }
  );

  it('is pale in light mode and deep in dark mode', () => {
    const light = getSoftColors('#2563eb', 'light')!;
    const dark = getSoftColors('#2563eb', 'dark')!;
    expect(luminance(parseColor(light.background)!)).toBeGreaterThan(0.6);
    expect(luminance(parseColor(dark.background)!)).toBeLessThan(0.1);
    expect(getSoftColors('#2563eb')).toEqual(light);
  });

  it('returns null for colors it cannot parse', () => {
    expect(getSoftColors('papayawhip')).toBeNull();
    expect(getSoftColors(undefined as unknown as string)).toBeNull();
  });
});

describe('hslToHex', () => {
  it.each([
    [0, 1, 0.5, '#ff0000'],
    [120, 1, 0.5, '#00ff00'],
    [240, 1, 0.5, '#0000ff'],
    [-120, 1, 0.5, '#0000ff'],
    [480, 1, 0.5, '#00ff00'],
    [0, 0, 1, '#ffffff'],
    [0, 0, 0, '#000000'],
  ])('hsl(%d, %d, %d) -> %s', (h, s, l, hex) => {
    expect(hslToHex(h, s, l)).toBe(hex);
  });
});
