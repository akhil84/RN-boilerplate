import { recordAnalytics, resetAnalyticsAdapter } from '@starter/core/observability';

import { DEMO_PASSWORD, signInWithPassword, selectSessionStatus } from '@features/auth';
import {
  makeConnectedStore,
  renderWithProviders,
  screen,
  setupMockApi,
  userEvent,
} from '@app/testing/test-utils';
import { SettingsScreen } from '..';

describe('<SettingsScreen />', () => {
  beforeEach(() => setupMockApi());
  afterEach(resetAnalyticsAdapter);

  it('shows the settings title', async () => {
    await renderWithProviders(<SettingsScreen />);

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeOnTheScreen();
    expect(screen.getByTestId('settings-title')).toBeOnTheScreen();
  });

  it('AC-settings-1: changes the theme and tracks it', async () => {
    const calls = recordAnalytics();
    const user = userEvent.setup();
    const { store } = await renderWithProviders(<SettingsScreen />);

    await user.press(screen.getByRole('radio', { name: 'Dark' }));

    expect(store.getState().preferences.theme).toBe('dark');
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
    expect(calls).toContainEqual({
      type: 'track',
      name: 'theme_changed',
      props: { theme: 'dark' },
    });
  });

  it('AC-settings-2: changes the language preference', async () => {
    const user = userEvent.setup();
    const { store } = await renderWithProviders(<SettingsScreen />);

    await user.press(screen.getByRole('radio', { name: 'English' }));

    expect(store.getState().preferences.language).toBe('en');
  });

  it('AC-settings-3: signs out', async () => {
    const user = userEvent.setup();
    const store = makeConnectedStore();
    await store.dispatch(signInWithPassword({ email: 'a@b.co', password: DEMO_PASSWORD }));
    await renderWithProviders(<SettingsScreen />, { store });

    await user.press(screen.getByRole('button', { name: 'Sign out' }));

    expect(selectSessionStatus(store.getState())).toBe('signedOut');
  });

  it('shows the app version and variant', async () => {
    await renderWithProviders(<SettingsScreen />);

    expect(screen.getByTestId('settings-version')).toHaveTextContent(/Version .* · development/);
  });
});

describe('<SettingsScreen /> notifications', () => {
  beforeEach(() => setupMockApi());

  it('AC-push-4: asks for permission only when the user taps the button', async () => {
    const { requestPermissionsAsync } = jest.requireMock('expo-notifications');
    requestPermissionsAsync.mockClear();
    const user = userEvent.setup();
    await renderWithProviders(<SettingsScreen />, { store: makeConnectedStore() });

    const enable = await screen.findByRole('button', { name: 'Turn on notifications' });
    expect(requestPermissionsAsync).not.toHaveBeenCalled();
    await user.press(enable);

    expect(await screen.findByTestId('settings-notifications-status')).toHaveTextContent(
      'Notifications are on.',
    );
    expect(requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });
});

describe('<SettingsScreen /> notifications errors', () => {
  beforeEach(() => setupMockApi());

  it('reports a failing permission request instead of leaving it unhandled', async () => {
    const { requestPermissionsAsync } = jest.requireMock('expo-notifications');
    requestPermissionsAsync.mockRejectedValueOnce(new Error('native module unavailable'));
    const { captureException } = jest.requireMock('@sentry/react-native');
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    await renderWithProviders(<SettingsScreen />, { store: makeConnectedStore() });

    await user.press(await screen.findByRole('button', { name: 'Turn on notifications' }));

    expect(await screen.findByRole('button', { name: 'Turn on notifications' })).toBeEnabled();
    expect(console.error).toHaveBeenCalledWith(
      '[reportError]',
      expect.objectContaining({ message: 'native module unavailable' }),
      { flow: 'push-permission' },
    );
    expect(captureException).not.toHaveBeenCalled(); // Sentry is off without a DSN
  });
});
