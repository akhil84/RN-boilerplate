// Sentry's wrapper around Expo's default Metro config (monorepo support is kept): it adds debug
// IDs so uploaded source maps match the bundle (ADR-0013).
// https://docs.expo.dev/guides/using-sentry/
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

module.exports = getSentryExpoConfig(__dirname);
