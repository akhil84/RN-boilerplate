// Shared code runs once per native renderer (ADR-0020). Web rendering is covered by Playwright:
// RNTL's test renderer only understands React Native host components, not react-native-web DOM.
const { createJestConfig } = require('@starter/tooling/jest');

module.exports = createJestConfig({
  coverageThreshold: { statements: 75, branches: 60, functions: 80, lines: 80 },
  platforms: ['ios', 'android'],
});
