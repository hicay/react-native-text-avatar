import { StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import DefaultExport, { GradientAvatar, getOrb } from '../gradient';

const flat = (style: unknown) => StyleSheet.flatten(style as never) as Record<string, unknown>;

describe('getOrb', () => {
  it('is deterministic and ignores case and whitespace', () => {
    expect(getOrb('John Doe')).toEqual(getOrb('John Doe'));
    expect(getOrb('  john DOE ')).toEqual(getOrb('John Doe'));
    expect(getOrb('John Doe')).not.toEqual(getOrb('Jane Doe'));
  });

  it('pins a known orb so it never shifts between releases', () => {
    expect(getOrb('John Doe')).toMatchSnapshot();
  });

  it('gives a different, deeper orb in dark mode', () => {
    const light = getOrb('John Doe', 'light');
    const dark = getOrb('John Doe', 'dark');
    expect(dark.base).not.toBe(light.base);
    // Same layout, different colors.
    expect(dark.blobs.map(({ cx, cy, r }) => [cx, cy, r])).toEqual(
      light.blobs.map(({ cx, cy, r }) => [cx, cy, r])
    );
  });

  it('returns valid geometry and colors for any input', () => {
    for (const name of ['', null, undefined, '🙂', 'a'.repeat(500)]) {
      const orb = getOrb(name);
      expect(orb.base).toMatch(/^#[0-9a-f]{6}$/);
      expect(orb.blobs).toHaveLength(5);
      for (const blob of orb.blobs) {
        expect(blob.color).toMatch(/^#[0-9a-f]{6}$/);
        expect(blob.cx).toBeGreaterThanOrEqual(0);
        expect(blob.cx).toBeLessThanOrEqual(1);
        expect(blob.cy).toBeGreaterThanOrEqual(0);
        expect(blob.cy).toBeLessThanOrEqual(1);
        expect(blob.r).toBeGreaterThan(0);
      }
    }
  });
});

describe('GradientAvatar', () => {
  it('exports the component as default and named', () => {
    expect(DefaultExport).toBe(GradientAvatar);
  });

  it('renders initials on a clipped circle', async () => {
    await render(<GradientAvatar testID="avatar">John Doe</GradientAvatar>);
    expect(screen.getByText('JD')).toBeTruthy();
    expect(screen.getByLabelText('John Doe')).toBeTruthy();
    expect(flat(screen.getByTestId('avatar').props.style)).toMatchObject({
      width: 60,
      height: 60,
      borderRadius: 30,
      overflow: 'hidden',
      backgroundColor: getOrb('John Doe', 'light').base,
    });
  });

  it('follows the colorScheme prop', async () => {
    await render(
      <GradientAvatar testID="avatar" colorScheme="dark" name="John Doe" />
    );
    expect(flat(screen.getByTestId('avatar').props.style).backgroundColor).toBe(
      getOrb('John Doe', 'dark').base
    );
  });

  it('can hide the initials', async () => {
    await render(<GradientAvatar name="John Doe" showInitials={false} />);
    expect(screen.queryByText('JD')).toBeNull();
    expect(screen.getByLabelText('John Doe')).toBeTruthy();
  });

  it('supports rounded and square shapes', async () => {
    await render(
      <>
        <GradientAvatar testID="rounded" size={100} shape="rounded" name="A" />
        <GradientAvatar testID="square" size={100} shape="square" name="A" />
      </>
    );
    expect(flat(screen.getByTestId('rounded').props.style).borderRadius).toBe(22);
    expect(flat(screen.getByTestId('square').props.style).borderRadius).toBe(0);
  });

  it('is pressable when onPress is given', async () => {
    const onPress = jest.fn();
    await render(<GradientAvatar onPress={onPress}>John Doe</GradientAvatar>);
    await fireEvent.press(screen.getByRole('button', { name: 'John Doe' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders without a name and without grain', async () => {
    await render(<GradientAvatar testID="avatar" grain={false} />);
    expect(screen.getByTestId('avatar')).toBeTruthy();
  });
});
