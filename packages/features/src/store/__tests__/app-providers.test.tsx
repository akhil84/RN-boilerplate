import { Text } from 'react-native';

import { renderWithProviders as renderUi, screen } from '@starter/ui/test-utils';

import { useAppSelector } from '../hooks';
import { AppProviders } from '../app-providers';
import { selectThemePreference } from '../preferences-slice';

function ThemeLabel() {
  const theme = useAppSelector(selectThemePreference);
  return <Text>theme:{theme}</Text>;
}

describe('<AppProviders />', () => {
  it('renders children with store access once persisted state is restored', async () => {
    await renderUi(
      <AppProviders>
        <ThemeLabel />
      </AppProviders>,
    );

    expect(await screen.findByText('theme:system')).toBeOnTheScreen();
  });
});
