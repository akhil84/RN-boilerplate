# @starter/tooling

Dev-only presets every workspace extends. Never imported by app code (runtime code lives in
`@starter/core`).

| Import                                | Use in                                                                      |
| ------------------------------------- | --------------------------------------------------------------------------- |
| `@starter/tooling/eslint`             | `eslint.config.js` → `module.exports = require('@starter/tooling/eslint');` |
| `@starter/tooling/tsconfig.base.json` | `tsconfig.json` → `"extends": "@starter/tooling/tsconfig.base.json"`        |
| `@starter/tooling/jest`               | `jest.config.js` → `createJestConfig({ platforms, coverageThreshold })`     |

`jest/setup.js` holds the global mocks for native modules (secure store, Sentry, sign-in SDKs, …).
