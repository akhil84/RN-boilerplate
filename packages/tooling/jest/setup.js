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

// Secure storage: an in-memory Keychain/Keystore per test file.
jest.mock('expo-secure-store', () => {
  const store = new Map();
  return {
    getItemAsync: jest.fn(async (key) => (store.has(key) ? store.get(key) : null)),
    setItemAsync: jest.fn(async (key, value) => void store.set(key, value)),
    deleteItemAsync: jest.fn(async (key) => void store.delete(key)),
    __reset: () => store.clear(),
  };
});

// Social sign-in SDKs talk to native code; tests drive them through these mocks.
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(async () => true),
    signIn: jest.fn(),
    signOut: jest.fn(async () => null),
  },
  isSuccessResponse: (response) => response?.type === 'success',
  isErrorWithCode: () => false,
  statusCodes: {},
}));
jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: jest.fn(async () => true),
  signInAsync: jest.fn(),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
}));

// Push notifications: permission and token calls resolve to safe defaults; override per test.
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => null),
  getPermissionsAsync: jest.fn(async () => ({ status: 'undetermined', canAskAgain: true })),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted', canAskAgain: true })),
  getExpoPushTokenAsync: jest.fn(async () => ({ type: 'expo', data: 'ExponentPushToken[test]' })),
  getDevicePushTokenAsync: jest.fn(async () => ({ type: 'ios', data: 'device-token' })),
  useLastNotificationResponse: jest.fn(() => undefined),
  AndroidImportance: { DEFAULT: 5, MAX: 7 },
}));
jest.mock('expo-device', () => ({ isDevice: true }));

// Redux DevTools (Expo dev plugin): never connect from tests.
jest.mock('redux-devtools-expo-dev-plugin', () => ({
  __esModule: true,
  default: () => (next) => next,
  composeWithDevTools: (...funcs) => funcs[0],
}));
