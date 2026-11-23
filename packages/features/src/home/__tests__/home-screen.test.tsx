import { renderWithProviders, screen } from '@starter/ui/test-utils';

import { HomeScreen } from '..';

describe('<HomeScreen />', () => {
  it('shows the app name as the screen title', async () => {
    await renderWithProviders(<HomeScreen />);

    expect(screen.getByTestId('home-title')).toHaveTextContent('Starter App');
  });

  it('exposes the title as a header for assistive tech', async () => {
    await renderWithProviders(<HomeScreen />);

    expect(screen.getByRole('heading', { name: 'Starter App' })).toBeOnTheScreen();
  });
});
