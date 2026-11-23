import { Text } from 'react-native';

import { Card } from '../components/card';
import { Screen } from '../components/screen';
import { Stack } from '../components/stack';
import { Colors, MaxContentWidth, Spacing } from '../theme';
import { renderWithProviders, screen } from '../test-utils';
import { useColorScheme } from '../use-color-scheme';

jest.mock('../use-color-scheme', () => ({
  ...jest.requireActual('../use-color-scheme'),
  useColorScheme: jest.fn(() => 'light'),
}));

describe('<Stack />', () => {
  it('lays children out in a column with a token gap by default', async () => {
    await renderWithProviders(
      <Stack testID="stack">
        <Text>a</Text>
        <Text>b</Text>
      </Stack>,
    );

    expect(screen.getByTestId('stack')).toHaveStyle({
      flexDirection: 'column',
      gap: Spacing.three,
    });
  });

  it('supports rows, other gaps and alignment', async () => {
    await renderWithProviders(
      <Stack testID="row" direction="row" gap="one" align="center" justify="space-between" />,
    );

    expect(screen.getByTestId('row')).toHaveStyle({
      flexDirection: 'row',
      gap: Spacing.one,
      alignItems: 'center',
      justifyContent: 'space-between',
    });
  });
});

describe('<Card />', () => {
  it('uses the elevated background colour and token padding', async () => {
    await renderWithProviders(
      <Card testID="card">
        <Text>content</Text>
      </Card>,
    );

    expect(screen.getByTestId('card')).toHaveStyle({
      backgroundColor: Colors.light.backgroundElement,
      padding: Spacing.three,
    });
    expect(screen.getByText('content')).toBeOnTheScreen();
  });

  it('follows the dark colour scheme', async () => {
    jest.mocked(useColorScheme).mockReturnValueOnce('dark');

    await renderWithProviders(<Card testID="card" />);

    expect(screen.getByTestId('card')).toHaveStyle({
      backgroundColor: Colors.dark.backgroundElement,
    });
  });
});

describe('<Screen />', () => {
  it('renders children inside a width-limited content column', async () => {
    await renderWithProviders(
      <Screen testID="screen">
        <Text>Body</Text>
      </Screen>,
    );

    expect(screen.getByText('Body')).toBeOnTheScreen();
    expect(screen.getByTestId('screen-content')).toHaveStyle({ maxWidth: MaxContentWidth });
  });

  it('scrolls when asked', async () => {
    await renderWithProviders(
      <Screen scroll testID="screen">
        <Text>Long</Text>
      </Screen>,
    );

    expect(screen.getByTestId('screen-scroll')).toBeOnTheScreen();
  });

  it('honours a narrower max width', async () => {
    await renderWithProviders(<Screen maxWidth={480} testID="screen" />);

    expect(screen.getByTestId('screen-content')).toHaveStyle({ maxWidth: 480 });
  });
});
