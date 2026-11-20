import { getInitials } from '../initials';

describe('getInitials', () => {
  it.each([
    ['John Doe', 'JD'],
    ['john doe', 'JD'],
    ['  John   Doe  ', 'JD'],
    ['Technology', 'T'],
    ['John Ronald Reuel Tolkien', 'JT'],
    ['J. R. R. Tolkien', 'JT'],
    ['Jean-Luc Picard', 'JP'],
    ['john.doe@example.com', 'JD'],
    ['john_doe', 'JD'],
    ['(John) "Doe"', 'JD'],
    ['Çağlar İspirli', 'Çİ'],
    ['李 小龍', '李小'],
    ['', ''],
    ['   ', ''],
    ['...', ''],
  ])('%j -> %j', (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });

  it('respects max', () => {
    expect(getInitials('John Ronald Reuel Tolkien', { max: 1 })).toBe('J');
    expect(getInitials('John Ronald Reuel Tolkien', { max: 3 })).toBe('JRT');
    expect(getInitials('John Ronald Reuel Tolkien', { max: 10 })).toBe('JRRT');
    expect(getInitials('John Doe', { max: 0 })).toBe('');
  });

  it('can keep the original case', () => {
    expect(getInitials('john Doe', { uppercase: false })).toBe('jD');
  });

  it('uppercases with a locale', () => {
    expect(getInitials('ilker ışık', { locale: 'tr' })).toBe('İI');
    expect(getInitials('ilker ışık')).toBe('II');
    expect(getInitials('ilker', { locale: 'not a locale' })).toBe('I');
  });

  it('keeps emoji and astral characters whole', () => {
    expect(getInitials('👩‍💻 Dev')).toBe('👩‍💻D');
    expect(getInitials('🇹🇷 Team')).toBe('🇹🇷T');
    expect(getInitials('𝒜lice')).toBe('𝒜');
  });

  it('tolerates non-string input', () => {
    expect(getInitials(null)).toBe('');
    expect(getInitials(undefined)).toBe('');
    expect(getInitials(42 as unknown as string)).toBe('');
  });
});

describe('getInitials without Intl.Segmenter (Hermes)', () => {
  const original = Intl.Segmenter;

  beforeAll(() => {
    // @ts-expect-error simulate an engine without Intl.Segmenter
    delete Intl.Segmenter;
  });
  afterAll(() => {
    (Intl as { Segmenter: typeof original }).Segmenter = original;
  });

  it('falls back to the heuristic', () => {
    jest.isolateModules(() => {
      const { getInitials: fallback } =
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('../initials') as typeof import('../initials');
      expect(fallback('John Doe')).toBe('JD');
      expect(fallback('👩‍💻 Dev')).toBe('👩‍💻D');
      expect(fallback('🇹🇷 Team')).toBe('🇹🇷T');
      expect(fallback('👍🏽 ok')).toBe('👍🏽O');
      expect(fallback('𝒜lice')).toBe('𝒜');
      expect(fallback('élan')).toBe('É');
    });
  });
});
