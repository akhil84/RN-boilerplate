import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { configureApiClient, createMockFetch } from '@starter/api-client';
import { DEMO_PASSWORD, getMockHandlers } from '@starter/features';

// Relative to the workspace root, where Jest runs.
const appDir = './src/app';

/**
 * Route guard flow through the real root layout (ADR-0015). The app store is a singleton, so
 * these tests run in order: signed out → sign in → signed-in routes.
 */
describe('mobile routes', () => {
  beforeAll(() => {
    configureApiClient({
      retryDelayMs: 0,
      fetchFn: createMockFetch(getMockHandlers(), { baseUrl: 'https://api.test', latencyMs: 0 }),
    });
  });

  it('shows sign-in when there is no stored session', async () => {
    await renderRouter(appDir, { initialUrl: '/' });

    expect(await screen.findByTestId('sign-in-title')).toBeOnTheScreen();
  });

  it('opens home after signing in', async () => {
    const user = userEvent.setup();
    await renderRouter(appDir, { initialUrl: '/' });

    await user.type(await screen.findByLabelText('Email'), 'demo@example.com');
    await user.type(screen.getByLabelText('Password'), DEMO_PASSWORD);
    await user.press(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByTestId('home-title')).toBeOnTheScreen();
    expect(await screen.findByText('Example item 1')).toBeOnTheScreen();
  });

  it('opens settings at /settings once signed in', async () => {
    await renderRouter(appDir, { initialUrl: '/settings' });

    expect(await screen.findByTestId('settings-title')).toBeOnTheScreen();
  });
});
