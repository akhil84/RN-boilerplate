import { renderWithProviders, screen, userEvent } from '@app/testing/test-utils';
import { ErrorFallback } from '@app/providers/error-fallback';

describe('<ErrorFallback />', () => {
  it('explains the problem and lets the user retry', async () => {
    const reset = jest.fn();
    const user = userEvent.setup();
    await renderWithProviders(<ErrorFallback error={new Error('x')} reset={reset} />);

    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Try again' }));

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
