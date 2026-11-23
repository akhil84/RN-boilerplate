const { createJestConfig } = require('@starter/config/jest');

module.exports = createJestConfig({
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/app/**/_layout.tsx'],
});
