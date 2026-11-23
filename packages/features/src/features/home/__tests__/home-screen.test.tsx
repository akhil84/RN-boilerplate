import type { MockHandler } from '@starter/api-client';

import { mockItems } from '@features/home/mocks/handlers';
import { renderWithProviders, screen, setupMockApi, userEvent } from '@app/testing/test-utils';
import { HomeScreen } from '..';

const items = (respond: MockHandler['respond']): MockHandler[] => [
  { method: 'GET', path: '/items', respond },
];

describe('<HomeScreen />', () => {
  it('shows the screen title as a heading', async () => {
    setupMockApi(items(() => ({ status: 200, body: [] })));
    await renderWithProviders(<HomeScreen />);

    expect(screen.getByRole('heading', { name: 'Starter App' })).toBeOnTheScreen();
    expect(screen.getByTestId('home-title')).toBeOnTheScreen();
  });

  it('AC-home-1: shows loading, then the items', async () => {
    setupMockApi(
      items(() => ({ status: 200, body: mockItems })),
      50,
    );
    await renderWithProviders(<HomeScreen />);

    expect(screen.getByTestId('home-loading')).toBeOnTheScreen();
    expect(await screen.findByText('Example item 1')).toBeOnTheScreen();
  });

  it('AC-home-2: shows an empty state when there are no items', async () => {
    setupMockApi(items(() => ({ status: 200, body: [] })));
    await renderWithProviders(<HomeScreen />);

    expect(await screen.findByTestId('home-empty')).toHaveTextContent('Nothing here yet.');
  });

  it('AC-home-3: shows an error with a retry that recovers', async () => {
    let fail = true;
    setupMockApi(items(() => (fail ? { status: 500 } : { status: 200, body: mockItems })));
    const user = userEvent.setup();
    await renderWithProviders(<HomeScreen />);

    expect(await screen.findByText('Couldn’t load items.')).toBeOnTheScreen();
    fail = false;
    await user.press(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Example item 1')).toBeOnTheScreen();
  });
});
