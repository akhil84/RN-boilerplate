const { createJestConfig } = require('@starter/config/jest');

module.exports = createJestConfig({
  coverageThreshold: { statements: 80, branches: 70, functions: 75, lines: 85 },
});
