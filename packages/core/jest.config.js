const { createJestConfig } = require('@starter/tooling/jest');

module.exports = createJestConfig({
  coverageThreshold: { statements: 90, branches: 75, functions: 75, lines: 90 },
});
