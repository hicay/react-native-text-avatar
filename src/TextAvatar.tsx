import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type {
  GestureResponderEvent,
  StyleProp,
  TextStyle,
  ViewProps,
  ViewStyle,
} from 'react-native';

import { getColor, getContrastColor } from './color';
import { getInitials } from './initials';

export type TextAvatarShape = 'circle' | 'rounded' | 'square' | 'hexagon';

export interface TextAvatarProps extends Omit<ViewProps, 'children' | 'style'> {
  /** Name to build the initials from. Same as passing it as `children`. */
  name?: string;
  /** Name to build the initials from, e.g. `<TextAvatar>John Doe</TextAvatar>`. */
  children?: string | number | null;
  /** Exact text to show instead of computed initials, e.g. `+3`. */
  label?: string;
  /** Width and height in dp. Defaults to 60. */
  size?: number;
  /** Defaults to `circle`. */
  shape?: TextAvatarShape;
  /** @deprecated Use `shape`. Kept for 1.x compatibility. */
  type?: TextAvatarShape;
  /** Corner radius for the `rounded` shape. Defaults to 22% of `size`. */
  borderRadius?: number;
  /** Background color. Defaults to a color derived from the name. */
  backgroundColor?: string;
  /** Palette the derived background color is picked from. */
  colors?: readonly string[];
  /** Text color. Defaults to dark or light, whichever contrasts better. */
  textColor?: string;
  /** Maximum number of initials. Defaults to 2. */
  maxInitials?: number;
  /** Uppercase the initials. Defaults to true. */
  uppercase?: boolean;
  /** Locale used for uppercasing, e.g. `tr`. */
  locale?: string;
  /** Makes the avatar pressable. */
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const HEXAGON_ROTATIONS = ['0deg', '60deg', '-60deg'] as const;
const SQRT3_2 = Math.sqrt(3) / 2;

function TextAvatarBase({
  name,
  children,
  label,
  size = 60,
  shape,
  type,
  borderRadius,
  backgroundColor,
  colors,
  textColor,
  maxInitials = 2,
  uppercase = true,
  locale,
  onPress,
  style,
  textStyle,
  accessibilityLabel,
  ...rest
}: TextAvatarProps) {
  const fullName =
    name ??
    (typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : '');
  const text =
    label ?? getInitials(fullName, { max: maxInitials, uppercase, locale });

  const dimension = typeof size === 'number' && size > 0 ? size : 60;
  const resolvedShape = shape ?? type ?? 'circle';
  const background = backgroundColor ?? getColor(fullName || text, colors);
  const color = textColor ?? getContrastColor(background);

  const length = Array.from(text).length;
  const fontSize = dimension * (length <= 2 ? 0.4 : length === 3 ? 0.32 : 0.26);

  const isHexagon = resolvedShape === 'hexagon';
  const radius =
    resolvedShape === 'circle'
      ? dimension / 2
      : resolvedShape === 'rounded'
        ? (borderRadius ?? dimension * 0.22)
        : 0;

  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    {
      width: dimension,
      height: dimension,
      borderRadius: radius,
      backgroundColor: isHexagon ? 'transparent' : background,
    },
    style,
  ];

  const content = (
    <>
      {isHexagon
        ? HEXAGON_ROTATIONS.map((rotate) => (
            // A regular hexagon is the union of three rectangles rotated by 60 degrees.
            <View
              key={rotate}
              pointerEvents="none"
              style={[
                styles.hexagonPart,
                {
                  width: dimension * SQRT3_2,
                  height: dimension / 2,
                  left: (dimension * (1 - SQRT3_2)) / 2,
                  top: dimension / 4,
                  backgroundColor: background,
                  transform: [{ rotate }],
                },
              ]}
            />
          ))
        : null}
      <Text
        allowFontScaling={false}
        numberOfLines={1}
        style={[styles.text, { color, fontSize }, textStyle]}
      >
        {text}
      </Text>
    </>
  );

  const a11yLabel = accessibilityLabel ?? (fullName || text);

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
        {...rest}
        onPress={onPress}
        style={containerStyle}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={a11yLabel}
      {...rest}
      style={containerStyle}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexagonPart: {
    position: 'absolute',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
});

export const TextAvatar = memo(TextAvatarBase);
TextAvatar.displayName = 'TextAvatar';
