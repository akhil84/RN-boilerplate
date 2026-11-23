// Route-wiring tests run under the native renderer: RNTL cannot render react-native-web DOM.
// Real browser rendering is covered by Playwright (e2e/web, ADR-0020).
const { createJestConfig } = require('@starter/config/jest');

module.exports = createJestConfig({
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/app/**/_layout.tsx'],
});
