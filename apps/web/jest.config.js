// Route-wiring tests run under the native renderer: RNTL cannot render react-native-web DOM.
// Real browser rendering is covered by Playwright (e2e/web, ADR-0020).
const { createJestConfig } = require('@starter/config/jest');

module.exports = createJestConfig({
  coverageThreshold: { statements: 65, branches: 70, functions: 40, lines: 70 },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/app/**/_layout.tsx'],
});
