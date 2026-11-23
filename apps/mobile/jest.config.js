const { createJestConfig } = require('@starter/config/jest');

module.exports = createJestConfig({
  coverageThreshold: { statements: 90, branches: 50, functions: 90, lines: 90 },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/app/**/_layout.tsx'],
});
