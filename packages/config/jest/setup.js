// Global Jest setup shared by every workspace. Runs after the test framework is installed.
// RNTL v14 registers its Jest matchers automatically (toBeOnTheScreen, toHaveTextContent, ...).
// Add global mocks for native modules that have no JS fallback here.

// Valid default config so code that calls getEnv() works in tests (ADR-0011).
process.env.EXPO_PUBLIC_API_URL ??= 'https://api.test';

// Native modules without a JS implementation in Jest: use the mocks their packages ship.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);
// Error reporting is a no-op in tests; assert on it with jest.mocked(Sentry.captureException).
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  setUser: jest.fn(),
  wrap: (component) => component,
}));
