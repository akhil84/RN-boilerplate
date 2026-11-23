import { DEMO_PASSWORD } from '@features/auth/mocks/handlers';
import {
  makeConnectedStore,
  renderWithProviders,
  screen,
  setupMockApi,
  userEvent,
} from '@app/testing/test-utils';
import { selectSessionStatus } from '@features/auth/model/session-slice';
import { SignInScreen } from '@features/auth/screens/sign-in-screen';
import { tokenStorage } from '@features/auth/services/token-storage';

describe('<SignInScreen />', () => {
  beforeEach(async () => {
    await tokenStorage.clear();
    setupMockApi();
  });

  it('shows the sign-in title', async () => {
    await renderWithProviders(<SignInScreen />);

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeOnTheScreen();
    expect(screen.getByTestId('sign-in-title')).toBeOnTheScreen();
  });

  it('AC-signin-1: validates email and password before calling the API', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<SignInScreen />);

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.press(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Enter a valid email address.')).toBeOnTheScreen();
    expect(screen.getByText('Enter your password.')).toBeOnTheScreen();
  });

  it('AC-signin-2: shows the backend message for wrong credentials', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<SignInScreen />, { store: makeConnectedStore() });

    await user.type(screen.getByLabelText('Email'), 'a@b.co');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.press(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByTestId('sign-in-error')).toHaveTextContent(
      'Email or password is incorrect.',
    );
  });

  it('AC-signin-3: signs in with valid credentials', async () => {
    const user = userEvent.setup();
    const store = makeConnectedStore();
    await renderWithProviders(<SignInScreen />, { store });

    await user.type(screen.getByLabelText('Email'), 'a@b.co');
    await user.type(screen.getByLabelText('Password'), DEMO_PASSWORD);
    await user.press(screen.getByRole('button', { name: 'Sign in' }));

    await screen.findByRole('button', { name: 'Sign in' });
    expect(selectSessionStatus(store.getState())).toBe('signedIn');
  });

  it('hides social buttons until a provider is configured', async () => {
    await renderWithProviders(<SignInScreen />);

    expect(screen.queryByTestId('sign-in-google')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('sign-in-apple')).not.toBeOnTheScreen();
  });
});
