// Shared ESLint flat config — https://docs.expo.dev/guides/using-eslint/
// Each workspace re-exports this from its own eslint.config.js.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', '.expo/*', 'coverage/*', 'ios/*', 'android/*', 'expo-env.d.ts'],
  },
  {
    files: ['**/__tests__/**', '**/*.test.{ts,tsx}', 'jest/**'],
    languageOptions: { globals: { jest: 'readonly' } },
  },
]);
