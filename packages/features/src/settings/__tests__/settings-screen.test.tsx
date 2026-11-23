import { recordAnalytics, resetAnalyticsAdapter } from '@starter/config/observability';

import { DEMO_PASSWORD } from '../../mocks/handlers';
import { signInWithPassword } from '../../auth/auth-service';
import { selectSessionStatus } from '../../auth/session-slice';
import {
  makeConnectedStore,
  renderWithProviders,
  screen,
  setupMockApi,
  userEvent,
} from '../../test-utils';
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
