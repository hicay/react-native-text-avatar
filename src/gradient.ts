// Separate entry point so that `react-native-svg` is only required by apps
// that use the gradient avatar: import from 'react-native-text-avatar/gradient'.
export { GradientAvatar, default } from './GradientAvatar';
export type { GradientAvatarProps, GradientAvatarShape } from './GradientAvatar';
export { getOrb } from './orb';
export type { Orb, OrbBlob } from './orb';
