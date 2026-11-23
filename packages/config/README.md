# @starter/config

Shared tooling presets. Every workspace extends these instead of keeping its own copy.

| Import                               | Use in                                                                     |
| ------------------------------------ | -------------------------------------------------------------------------- |
| `@starter/config/eslint`             | `eslint.config.js` → `module.exports = require('@starter/config/eslint');` |
| `@starter/config/tsconfig.base.json` | `tsconfig.json` → `"extends": "@starter/config/tsconfig.base.json"`        |
| `@starter/config/jest`               | `jest.config.js` → `createJestConfig({ platforms })`                       |

Later phases add env config, error reporting and analytics here (ADR-0011, 0013, 0014).
