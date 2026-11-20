# Changelog

## 2.1.0

### Added

- `GradientAvatar`, a grainy gradient orb unique to each name, from
  `react-native-text-avatar/gradient`. Needs `react-native-svg`, which is an
  optional peer dependency; the main entry point still has no dependencies.
- `variant="soft"` on `TextAvatar`: a tint of the color with colored text,
  which follows light and dark mode.
- `colorScheme` prop to override the system color scheme.
- `getSoftColors` and `getOrb` helpers.
- Light and dark demo images.

## 2.0.0

A rewrite in TypeScript. The 1.x props (`size`, `backgroundColor`, `textColor`,
`type`, `style`) still work.

### Added

- TypeScript types, bundled.
- Background color derived from the name, with a `colors` prop for your own palette.
- Text color chosen for contrast against the background when `textColor` is not set.
- `shape` prop with `circle`, `rounded`, `square` and `hexagon`; `borderRadius` for `rounded`.
- `name`, `label`, `maxInitials`, `uppercase`, `locale`, `textStyle` and `onPress` props.
- `getInitials`, `getColor`, `getContrastColor` and `DEFAULT_COLORS` exports.
- Accessibility role and label.
- Tests, CI, and releases published from GitHub Actions with npm provenance.

### Changed

- The default shape is now `circle` (was square). Pass `shape="square"` for the old look.
- The default background is now derived from the name (was `#333`). Pass
  `backgroundColor="#333"` for the old look.
- A single word gives one initial: `Technology` is `T` (was `TE`).
- Names with more than two words use the first and last word: `John Ronald Tolkien` is `JT`.
- The hexagon is a regular hexagon that fits inside `size` x `size` (it used to be taller than `size`).
- `style` is applied after the built-in styles, so it can override them.
- Invalid input no longer throws; a missing name renders an empty avatar.
- `react` and `react-native` are peer dependencies. Requires React 17 or newer.

### Removed

- The `initials` dependency. The package has no runtime dependencies.
