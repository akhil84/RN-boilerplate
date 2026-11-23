import * as Sentry from '@sentry/react-native';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ErrorBoundary } from '../error-boundary';
import {
  errorReportingReady,
  initErrorReporting,
  reportError,
  resetErrorReporting,
  setErrorReportingUser,
} from '../errors';

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  setUser: jest.fn(),
}));

describe('error reporting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetErrorReporting();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('stays off without a DSN', () => {
    expect(initErrorReporting({ dsn: undefined })).toBe(false);

    reportError(new Error('boom'));

    expect(Sentry.init).not.toHaveBeenCalled();
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('initialises Sentry with the DSN and app variant as environment', async () => {
    expect(
      initErrorReporting({ dsn: 'https://k@o0.ingest.sentry.io/1', environment: 'preview' }),
    ).toBe(true);
    await errorReportingReady();

    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({ dsn: 'https://k@o0.ingest.sentry.io/1', environment: 'preview' }),
    );
  });

  it('reports errors with context once enabled', async () => {
    initErrorReporting({ dsn: 'https://k@o0.ingest.sentry.io/1' });
    const error = new Error('boom');

    reportError(error, { screen: 'home' });
    await errorReportingReady();

    expect(Sentry.captureException).toHaveBeenCalledWith(error, { extra: { screen: 'home' } });
  });

  it('sets only an opaque user id', async () => {
    initErrorReporting({ dsn: 'https://k@o0.ingest.sentry.io/1' });

    setErrorReportingUser('user-1');
    setErrorReportingUser(null);
    await errorReportingReady();

    expect(Sentry.setUser).toHaveBeenNthCalledWith(1, { id: 'user-1' });
    expect(Sentry.setUser).toHaveBeenNthCalledWith(2, null);
  });
});

describe('<ErrorBoundary />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetErrorReporting();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  function Boom(): never {
    throw new Error('render failed');
  }

  it('shows the fallback and reports the error', async () => {
    initErrorReporting({ dsn: 'https://k@o0.ingest.sentry.io/1' });

    await render(
      <ErrorBoundary fallback={({ error }) => <Text>Fallback: {error.message}</Text>}>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Fallback: render failed')).toBeOnTheScreen();
    await errorReportingReady();
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'render failed' }),
      expect.objectContaining({
        extra: expect.objectContaining({ componentStack: expect.any(String) }),
      }),
    );
  });

  it('renders children when nothing throws', async () => {
    await render(
      <ErrorBoundary fallback={() => <Text>Fallback</Text>}>
        <Text>All good</Text>
      </ErrorBoundary>,
    );

    expect(screen.getByText('All good')).toBeOnTheScreen();
  });
});
