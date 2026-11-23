// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', '.expo/*', 'coverage/*', 'ios/*', 'android/*'],
  },
  {
    files: ['**/__tests__/**', '**/*.test.{ts,tsx}', 'src/test/**'],
    languageOptions: { globals: { jest: 'readonly' } },
  },
]);
