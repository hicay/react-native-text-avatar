# React Native Text Avatar

[![npm version](https://img.shields.io/npm/v/react-native-text-avatar.svg)](https://www.npmjs.com/package/react-native-text-avatar)
[![CI](https://github.com/hicay/react-native-text-avatar/actions/workflows/ci.yml/badge.svg)](https://github.com/hicay/react-native-text-avatar/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/react-native-text-avatar.svg)](./LICENSE)

Initials avatar for React Native, like the ones in Gmail. Give it a name and it
picks the initials, a background color that stays the same for that name, and a
readable text color.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/hicay/react-native-text-avatar/master/demo-dark.svg" />
  <img src="https://raw.githubusercontent.com/hicay/react-native-text-avatar/master/demo.svg" alt="Gradient orb, solid, soft and hexagon avatars" width="600" />
</picture>

Rows, top to bottom: gradient orbs, solid, soft, hexagon. The picture follows
your light or dark setting on GitHub; the other one is
[demo.svg](./demo.svg) / [demo-dark.svg](./demo-dark.svg).

- Four shapes: circle, rounded, square and hexagon
- Solid and soft variants; soft follows light and dark mode
- Optional gradient orb avatar with film grain, unique per name
- No required dependencies and no native code of its own; works with Expo and react-native-web
- Written in TypeScript
- Handles non-Latin names, emoji and locale-aware uppercasing (`i` to `İ` in Turkish)

## Installation

```sh
npm install react-native-text-avatar
```

## Usage

```tsx
import TextAvatar from 'react-native-text-avatar';

<TextAvatar>John Doe</TextAvatar>

<TextAvatar name="Ada Lovelace" size={48} shape="rounded" />

<TextAvatar shape="hexagon" backgroundColor="#ffff00">
  Grace Hopper
</TextAvatar>

<TextAvatar label="+3" backgroundColor="#e5e5ea" onPress={showEveryone} />

<TextAvatar variant="soft">Katherine Johnson</TextAvatar>
```

## Dark mode

`variant="soft"` draws a pale tint with dark text in light mode and a deep
shade with light text in dark mode. It reads the system setting through
`useColorScheme`; pass `colorScheme="light"` or `"dark"` if your app has its
own theme switch. Text keeps a contrast ratio of at least 4.5 in both modes
with the default palette.

The default `solid` variant uses the same colors in both modes: white text on
a saturated color works on light and dark screens alike.

## Gradient orbs

`GradientAvatar` draws a soft, grainy gradient sphere that is unique to the
name. It needs [react-native-svg](https://github.com/software-mansion/react-native-svg),
so it lives in its own entry point and the rest of the package stays free of
dependencies.

```sh
npm install react-native-svg
```

```tsx
import GradientAvatar from 'react-native-text-avatar/gradient';

<GradientAvatar name="Mars Rover" size={72} />

<GradientAvatar name="Mars Rover" showInitials={false} />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` / `name` | `string` | | Name the orb and initials come from. |
| `showInitials` | `boolean` | `true` | Show the initials on the orb. |
| `grain` | `boolean` | `true` | Film grain over the gradient. |
| `colorScheme` | `'light' \| 'dark'` | system | Dark mode gives a deeper orb. |
| `shape` | `'circle' \| 'rounded' \| 'square'` | `'circle'` | No hexagon for gradients. |

It also takes `size`, `borderRadius`, `label`, `textColor`, `maxInitials`,
`uppercase`, `locale`, `onPress`, `style` and `textStyle`, with the same
meaning as on `TextAvatar`. `getOrb(name, scheme)` from the same entry point
returns the colors and layout if you want to draw the orb yourself.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` / `name` | `string` | | Name the initials are built from. |
| `label` | `string` | | Exact text to show instead of initials, such as `+3`. |
| `size` | `number` | `60` | Width and height. |
| `shape` | `'circle' \| 'rounded' \| 'square' \| 'hexagon'` | `'circle'` | Shape of the avatar. `type` is accepted as an alias. |
| `variant` | `'solid' \| 'soft'` | `'solid'` | `soft` is a tint of the color with colored text. See [Dark mode](#dark-mode). |
| `colorScheme` | `'light' \| 'dark'` | system | Color scheme for the `soft` variant. |
| `borderRadius` | `number` | `size * 0.22` | Corner radius for the `rounded` shape. |
| `backgroundColor` | `string` | derived from the name | Background color. With `soft`, the color the tint is made from. |
| `colors` | `string[]` | `DEFAULT_COLORS` | Palette the derived background is picked from. |
| `textColor` | `string` | dark or light | Text color. By default, whichever contrasts better with the background. |
| `maxInitials` | `number` | `2` | Maximum number of initials. |
| `uppercase` | `boolean` | `true` | Uppercase the initials. |
| `locale` | `string` | | Locale for uppercasing, such as `tr`. |
| `onPress` | `function` | | Makes the avatar pressable. |
| `style` | `ViewStyle` | | Style for the container. |
| `textStyle` | `TextStyle` | | Style for the text. |

Other `View` props, such as `testID`, are passed through.

## How initials are picked

| Name | Initials |
| --- | --- |
| `John Doe` | `JD` |
| `Technology` | `T` |
| `John Ronald Reuel Tolkien` | `JT` (`JRT` with `maxInitials={3}`) |
| `john.doe@example.com` | `JD` |
| `Çağlar İspirli` | `Çİ` |

## Helpers

The logic is exported for use outside the component, for example to color a
list row to match its avatar.

```ts
import {
  getInitials,
  getColor,
  getContrastColor,
  getSoftColors,
  DEFAULT_COLORS,
} from 'react-native-text-avatar';

getInitials('John Doe'); // 'JD'
getColor('John Doe'); // '#0f766e', always the same for this name
getContrastColor('#ffff00'); // '#1c1c1e'
getSoftColors('#2563eb', 'dark'); // { background, text }
```

`getContrastColor` understands hex and `rgb()` colors. For named colors and
`hsl()` it returns white, so set `textColor` yourself if you use those with a
light background.

## Upgrading from 1.x

The 1.x props still work. Three defaults changed:

- The default shape is a circle. Pass `shape="square"` for the old one.
- The default background comes from the name. Pass `backgroundColor="#333"` for the old one.
- A single word gives one initial (`Technology` is `T`, not `TE`).

See the [changelog](./CHANGELOG.md) for the full list.

## License

[ISC](./LICENSE)
