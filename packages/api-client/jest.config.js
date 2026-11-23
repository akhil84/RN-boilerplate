const { createJestConfig } = require('@starter/tooling/jest');

module.exports = createJestConfig({
  coverageThreshold: { statements: 80, branches: 70, functions: 75, lines: 85 },
});
