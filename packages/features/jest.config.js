// Shared code runs once per native renderer (ADR-0020). Web rendering is covered by Playwright:
// RNTL's test renderer only understands React Native host components, not react-native-web DOM.
const { createJestConfig } = require('@starter/config/jest');

module.exports = createJestConfig({ platforms: ['ios', 'android'] });
