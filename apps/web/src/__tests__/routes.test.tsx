import { renderRouter, screen } from 'expo-router/testing-library';

// Relative to the workspace root, where Jest runs.
const appDir = './src/app';

describe('web routes', () => {
  it('opens the shared home screen at /', async () => {
    await renderRouter(appDir, { initialUrl: '/' });

    expect(await screen.findByTestId('home-title')).toBeOnTheScreen();
  });

  it('opens the shared settings screen at /settings', async () => {
    await renderRouter(appDir, { initialUrl: '/settings' });

    expect(await screen.findByTestId('settings-title')).toBeOnTheScreen();
  });
});
