import { memo } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import type {
  GestureResponderEvent,
  StyleProp,
  TextStyle,
  ViewProps,
  ViewStyle,
} from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { darken, hash, luminance, parseColor } from './color';
import type { ColorScheme } from './color';
import { getInitials } from './initials';
import { NOISE_URI } from './noise';
import { getOrb } from './orb';

export type GradientAvatarShape = 'circle' | 'rounded' | 'square';

export interface GradientAvatarProps
  extends Omit<ViewProps, 'children' | 'style'> {
  /** Name the orb and the initials are derived from. Same as `children`. */
  name?: string;
  children?: string | number | null;
  /** Exact text to show instead of computed initials. */
  label?: string;
  /** Show the initials on top of the orb. Defaults to true. */
  showInitials?: boolean;
  /** Width and height in dp. Defaults to 60. */
  size?: number;
  /** Defaults to `circle`. */
  shape?: GradientAvatarShape;
  /** Corner radius for the `rounded` shape. Defaults to 22% of `size`. */
  borderRadius?: number;
  /** Film grain over the gradient. Defaults to true. */
  grain?: boolean;
  /** Defaults to the system color scheme. */
  colorScheme?: ColorScheme;
  textColor?: string;
  maxInitials?: number;
  uppercase?: boolean;
  locale?: string;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

function GradientAvatarBase({
  name,
  children,
  label,
  showInitials = true,
  size = 60,
  shape = 'circle',
  borderRadius,
  grain = true,
  colorScheme,
  textColor,
  maxInitials = 2,
  uppercase = true,
  locale,
  onPress,
  style,
  textStyle,
  accessibilityLabel,
  ...rest
}: GradientAvatarProps) {
  const systemScheme = useColorScheme();
  const scheme: ColorScheme =
    colorScheme ?? (systemScheme === 'dark' ? 'dark' : 'light');

  const fullName =
    name ??
    (typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : '');
  const text = showInitials
    ? (label ?? getInitials(fullName, { max: maxInitials, uppercase, locale }))
    : '';

  const dimension = typeof size === 'number' && size > 0 ? size : 60;
  const radius =
    shape === 'circle'
      ? dimension / 2
      : shape === 'rounded'
        ? (borderRadius ?? dimension * 0.22)
        : 0;

  const seed = fullName || label || '';
  const orb = getOrb(seed, scheme);
  // Gradient ids are global to the SVG document on web, so make them unique per orb.
  const id = `rnta-${hash(`${seed.trim().toLowerCase()}|${scheme}`).toString(36)}`;

  const length = Array.from(text).length;
  const fontSize = dimension * (length <= 2 ? 0.4 : length === 3 ? 0.32 : 0.26);
  const baseRgb = parseColor(orb.base);
  // White on most orbs; on pale ones a deep shade of the orb's own color.
  const color =
    textColor ??
    (baseRgb && luminance(baseRgb) > 0.42 ? darken(orb.base, 0.72) : '#ffffff');

  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    {
      width: dimension,
      height: dimension,
      borderRadius: radius,
      backgroundColor: orb.base,
    },
    style,
  ];

  const content = (
    <>
      <Svg
        width={dimension}
        height={dimension}
        viewBox="0 0 100 100"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          {orb.blobs.map((blob, i) => (
            <RadialGradient key={i} id={`${id}-${i}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={blob.color} stopOpacity={blob.opacity} />
              <Stop
                offset="0.5"
                stopColor={blob.color}
                stopOpacity={blob.opacity * 0.6}
              />
              <Stop offset="1" stopColor={blob.color} stopOpacity={0} />
            </RadialGradient>
          ))}
          {/* Sphere shading: a highlight towards the top left, darker towards the rim. */}
          <RadialGradient id={`${id}-shade`} cx="36%" cy="30%" r="78%">
            <Stop offset="0" stopColor="#ffffff" stopOpacity={0.2} />
            <Stop offset="0.5" stopColor="#ffffff" stopOpacity={0} />
            <Stop offset="1" stopColor="#000000" stopOpacity={0.2} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill={orb.base} />
        {orb.blobs.map((blob, i) => (
          <Circle
            key={i}
            cx={blob.cx * 100}
            cy={blob.cy * 100}
            r={blob.r * 100}
            fill={`url(#${id}-${i})`}
          />
        ))}
        <Rect x="0" y="0" width="100" height="100" fill={`url(#${id}-shade)`} />
      </Svg>
      {grain ? (
        <Image
          source={{ uri: NOISE_URI }}
          resizeMode="stretch"
          style={[StyleSheet.absoluteFill, styles.grain]}
        />
      ) : null}
      {text ? (
        <Text
          allowFontScaling={false}
          numberOfLines={1}
          style={[styles.text, { color, fontSize }, textStyle]}
        >
          {text}
        </Text>
      ) : null}
    </>
  );

  const a11yLabel = accessibilityLabel ?? (fullName || text || undefined);

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
    overflow: 'hidden',
  },
  grain: {
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
});

export const GradientAvatar = memo(GradientAvatarBase);
GradientAvatar.displayName = 'GradientAvatar';

export default GradientAvatar;
