import { Text } from 'react-native';

import { Button } from '../components/button';
import { TextField } from '../components/text-field';
import { Colors } from '../theme';
import { renderWithProviders, screen, userEvent } from '../test-utils';
import { breakpointForWidth } from '../use-breakpoint';
import { ColorSchemeProvider, useColorScheme } from '../use-color-scheme';

describe('<Button />', () => {
  it('is an accessible button that fires onPress', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<Button label="Save" onPress={onPress} />);

    await user.press(screen.getByRole('button', { name: 'Save' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ignores presses and reports busy while loading', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<Button label="Save" loading onPress={onPress} />);

    const button = screen.getByRole('button', { name: 'Save' });
    await user.press(button);

    expect(onPress).not.toHaveBeenCalled();
    expect(button).toBeBusy();
  });
});

describe('<TextField />', () => {
  it('is labelled and accepts typing', async () => {
    const onChangeText = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<TextField label="Email" onChangeText={onChangeText} />);

    await user.type(screen.getByLabelText('Email'), 'a@b.co');

    expect(onChangeText).toHaveBeenLastCalledWith('a@b.co');
  });

  it('shows and announces a validation error', async () => {
    await renderWithProviders(
      <TextField label="Email" error="Enter a valid email" testID="email" />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email');
    expect(screen.getByTestId('email-error')).toBeOnTheScreen();
  });
});

describe('breakpointForWidth', () => {
  it.each([
    [375, 'sm'],
    [768, 'md'],
    [1280, 'lg'],
  ])('%i → %s', (width, expected) => {
    expect(breakpointForWidth(width)).toBe(expected);
  });
});

describe('<ColorSchemeProvider />', () => {
  function Probe() {
    return <Text>scheme:{useColorScheme()}</Text>;
  }

  it('overrides the system colour scheme', async () => {
    await renderWithProviders(
      <ColorSchemeProvider scheme="dark">
        <Probe />
      </ColorSchemeProvider>,
    );

    expect(screen.getByText('scheme:dark')).toBeOnTheScreen();
  });

  it('exposes a danger colour for errors', () => {
    expect(Colors.danger).toMatch(/^#/);
  });
});
