import HomeScreen from '@/app/index';
import { renderWithProviders, screen } from '@/test/test-utils';

describe('<HomeScreen />', () => {
  it('shows the Katon welcome title', async () => {
    await renderWithProviders(<HomeScreen />);

    expect(screen.getByTestId('home-title')).toHaveTextContent(/Welcome to\s*Katon/);
  });

  it('shows the getting-started hints', async () => {
    await renderWithProviders(<HomeScreen />);

    expect(screen.getByText('Try editing')).toBeOnTheScreen();
    expect(screen.getByText('Dev tools')).toBeOnTheScreen();
  });
});
