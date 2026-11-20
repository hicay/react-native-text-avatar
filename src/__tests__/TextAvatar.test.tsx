import { StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import DefaultExport, { TextAvatar, getColor, getSoftColors } from '../index';

const flat = (style: unknown) => StyleSheet.flatten(style as never) as Record<string, unknown>;

describe('TextAvatar', () => {
  it('exports the component as default and named', () => {
    expect(DefaultExport).toBe(TextAvatar);
  });

  it('renders initials from children', async () => {
    await render(<TextAvatar testID="avatar">John Doe</TextAvatar>);
    expect(screen.getByText('JD')).toBeTruthy();
    expect(screen.getByLabelText('John Doe')).toBeTruthy();
  });

  it('renders initials from the name prop', async () => {
    await render(<TextAvatar name="Jane Roe" />);
    expect(screen.getByText('JR')).toBeTruthy();
  });

  it('defaults to a circle with a color derived from the name', async () => {
    await render(<TextAvatar testID="avatar">John Doe</TextAvatar>);
    const style = flat(screen.getByTestId('avatar').props.style);
    expect(style).toMatchObject({
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: getColor('John Doe'),
    });
  });

  it('supports the 1.x props', async () => {
    await render(
      <TextAvatar
        testID="avatar"
        backgroundColor="#ffff00"
        textColor="#0000ff"
        size={100}
        type="circle"
      >
        John Doe
      </TextAvatar>
    );
    expect(flat(screen.getByTestId('avatar').props.style)).toMatchObject({
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#ffff00',
    });
    expect(flat(screen.getByText('JD').props.style)).toMatchObject({
      color: '#0000ff',
      fontSize: 40,
    });
  });

  it('picks a readable text color', async () => {
    await render(<TextAvatar backgroundColor="#ffff00">John Doe</TextAvatar>);
    expect(flat(screen.getByText('JD').props.style).color).toBe('#1c1c1e');
  });

  it.each([
    ['square', 0],
    ['rounded', 22],
    ['circle', 50],
  ] as const)('shape %s', async (shape, radius) => {
    await render(
      <TextAvatar testID="avatar" size={100} shape={shape}>
        John Doe
      </TextAvatar>
    );
    expect(flat(screen.getByTestId('avatar').props.style).borderRadius).toBe(radius);
  });

  it('uses a custom radius for the rounded shape', async () => {
    await render(
      <TextAvatar testID="avatar" shape="rounded" borderRadius={8}>
        John Doe
      </TextAvatar>
    );
    expect(flat(screen.getByTestId('avatar').props.style).borderRadius).toBe(8);
  });

  it('draws a hexagon on a transparent container', async () => {
    await render(
      <TextAvatar testID="avatar" shape="hexagon" backgroundColor="#123456">
        John Doe
      </TextAvatar>
    );
    const avatar = screen.getByTestId('avatar');
    expect(flat(avatar.props.style).backgroundColor).toBe('transparent');
    expect(screen.getByText('JD')).toBeTruthy();
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it.each(['light', 'dark'] as const)('soft variant in %s mode', async (scheme) => {
    await render(
      <TextAvatar testID="avatar" variant="soft" colorScheme={scheme}>
        John Doe
      </TextAvatar>
    );
    const soft = getSoftColors(getColor('John Doe'), scheme)!;
    expect(flat(screen.getByTestId('avatar').props.style).backgroundColor).toBe(soft.background);
    expect(flat(screen.getByText('JD').props.style).color).toBe(soft.text);
  });

  it('soft variant tints a custom color and falls back to solid when it cannot', async () => {
    await render(
      <>
        <TextAvatar testID="tinted" variant="soft" colorScheme="light" backgroundColor="#2563eb">
          A
        </TextAvatar>
        <TextAvatar testID="named" variant="soft" backgroundColor="tomato">
          B
        </TextAvatar>
      </>
    );
    expect(flat(screen.getByTestId('tinted').props.style).backgroundColor).toBe(
      getSoftColors('#2563eb', 'light')!.background
    );
    expect(flat(screen.getByTestId('named').props.style).backgroundColor).toBe('tomato');
  });

  it('solid variant ignores the color scheme', async () => {
    await render(
      <TextAvatar testID="avatar" colorScheme="dark">
        John Doe
      </TextAvatar>
    );
    expect(flat(screen.getByTestId('avatar').props.style).backgroundColor).toBe(getColor('John Doe'));
  });

  it('shows a label verbatim', async () => {
    await render(<TextAvatar label="+3" />);
    expect(screen.getByText('+3')).toBeTruthy();
  });

  it('respects maxInitials and uppercase', async () => {
    await render(
      <TextAvatar maxInitials={3} uppercase={false}>
        john ronald reuel tolkien
      </TextAvatar>
    );
    expect(screen.getByText('jrt')).toBeTruthy();
  });

  it('does not throw on missing or odd input', async () => {
    await render(<TextAvatar testID="empty" />);
    expect(screen.getByTestId('empty')).toBeTruthy();
    await render(<TextAvatar testID="number">{42}</TextAvatar>);
    expect(screen.getByText('4')).toBeTruthy();
    await render(<TextAvatar testID="bad-size" size={-5}>A</TextAvatar>);
    expect(flat(screen.getByTestId('bad-size').props.style).width).toBe(60);
  });

  it('applies style and textStyle last', async () => {
    await render(
      <TextAvatar testID="avatar" style={{ margin: 4 }} textStyle={{ fontSize: 10 }}>
        John Doe
      </TextAvatar>
    );
    expect(flat(screen.getByTestId('avatar').props.style).margin).toBe(4);
    expect(flat(screen.getByText('JD').props.style).fontSize).toBe(10);
  });

  it('is pressable when onPress is given', async () => {
    const onPress = jest.fn();
    await render(<TextAvatar onPress={onPress}>John Doe</TextAvatar>);
    await fireEvent.press(screen.getByRole('button', { name: 'John Doe' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
