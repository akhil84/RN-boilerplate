import { renderWithProviders, screen } from '@starter/ui/test-utils';

import { SettingsScreen } from '..';

describe('<SettingsScreen />', () => {
  it('shows the settings title', async () => {
    await renderWithProviders(<SettingsScreen />);

    expect(screen.getByTestId('settings-title')).toHaveTextContent('Settings');
  });

  it('exposes the title as a header for assistive tech', async () => {
    await renderWithProviders(<SettingsScreen />);

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeOnTheScreen();
  });
});
