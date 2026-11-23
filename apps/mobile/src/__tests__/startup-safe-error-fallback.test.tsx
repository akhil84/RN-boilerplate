import { renderWithProviders, screen } from '@starter/features/test-utils';
import * as SplashScreen from 'expo-splash-screen';

import { StartupSafeErrorFallback } from '@/shell/startup-safe-error-fallback';

jest.mock('expo-splash-screen', () => ({ hide: jest.fn(), preventAutoHideAsync: jest.fn() }));

describe('<StartupSafeErrorFallback />', () => {
  it('hides the splash so a startup error is visible', async () => {
    await renderWithProviders(
      <StartupSafeErrorFallback error={new Error('boom')} reset={jest.fn()} />,
    );

    expect(SplashScreen.hide).toHaveBeenCalled();
    expect(screen.getByTestId('error-title')).toBeOnTheScreen();
  });
});
