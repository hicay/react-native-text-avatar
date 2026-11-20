export interface InitialsOptions {
  /** Maximum number of initials to return. Defaults to 2. */
  max?: number;
  /** Uppercase the result. Defaults to true. */
  uppercase?: boolean;
  /** BCP 47 locale used for uppercasing, e.g. `tr` so that `i` becomes `İ`. */
  locale?: string;
}

// ASCII whitespace/punctuation that should never be picked as an initial.
const LEADING_NOISE = /^[\s!-/:-@[-`{-~]+/;
const WORD_SEPARATORS = /[\s._]+/;

type Segmenter = {
  segment(input: string): Iterable<{ segment: string }>;
};

let segmenter: Segmenter | null | undefined;

function getSegmenter(): Segmenter | null {
  if (segmenter === undefined) {
    const SegmenterCtor = (
      globalThis as { Intl?: { Segmenter?: new () => Segmenter } }
    ).Intl?.Segmenter;
    try {
      segmenter = SegmenterCtor ? new SegmenterCtor() : null;
    } catch {
      segmenter = null;
    }
  }
  return segmenter;
}

function isExtender(codePoint: number): boolean {
  return (
    (codePoint >= 0x0300 && codePoint <= 0x036f) || // combining diacritics
    (codePoint >= 0xfe00 && codePoint <= 0xfe0f) || // variation selectors
    (codePoint >= 0x1f3fb && codePoint <= 0x1f3ff) || // emoji skin tones
    codePoint === 0x20e3 // combining keycap
  );
}

function isRegionalIndicator(codePoint: number): boolean {
  return codePoint >= 0x1f1e6 && codePoint <= 0x1f1ff;
}

/**
 * First user-perceived character of a string. Uses `Intl.Segmenter` where the
 * engine has it and a small heuristic (surrogate pairs, combining marks, ZWJ
 * emoji sequences, flags) where it does not, as on Hermes.
 */
function firstGrapheme(value: string): string {
  const seg = getSegmenter();
  if (seg) {
    for (const part of seg.segment(value)) return part.segment;
    return '';
  }

  const points = Array.from(value);
  const first = points[0];
  if (first === undefined) return '';

  let result = first;
  let i = 1;
  const firstCode = first.codePointAt(0) ?? 0;
  const second = points[1];
  if (
    isRegionalIndicator(firstCode) &&
    second !== undefined &&
    isRegionalIndicator(second.codePointAt(0) ?? 0)
  ) {
    return first + second;
  }

  while (i < points.length) {
    const point = points[i] as string;
    const code = point.codePointAt(0) ?? 0;
    if (isExtender(code)) {
      result += point;
      i += 1;
    } else if (code === 0x200d && i + 1 < points.length) {
      result += point + (points[i + 1] as string);
      i += 2;
    } else {
      break;
    }
  }
  return result;
}

function upper(value: string, locale?: string): string {
  if (locale) {
    try {
      return value.toLocaleUpperCase(locale);
    } catch {
      // Unknown locale tag: fall through to the locale-independent mapping.
    }
  }
  return value.toUpperCase();
}

/**
 * Build initials from a name.
 *
 * - `John Doe` -> `JD`
 * - `Technology` -> `T`
 * - `John Ronald Reuel Tolkien` -> `JT` (first and last word)
 * - `john.doe@example.com` -> `JD`
 */
export function getInitials(
  name: string | null | undefined,
  options: InitialsOptions = {}
): string {
  const { max = 2, uppercase = true, locale } = options;
  if (typeof name !== 'string' || max < 1) return '';

  let source = name.trim();
  const at = source.indexOf('@');
  if (at > 0 && !/\s/.test(source)) source = source.slice(0, at);

  const letters = source
    .split(WORD_SEPARATORS)
    .map((word) => firstGrapheme(word.replace(LEADING_NOISE, '')))
    .filter((letter) => letter !== '');

  const limit = Math.floor(max);
  const picked =
    letters.length <= limit
      ? letters
      : limit === 1
        ? letters.slice(0, 1)
        : [...letters.slice(0, limit - 1), letters[letters.length - 1] as string];

  const result = picked.join('');
  return uppercase ? upper(result, locale) : result;
}
