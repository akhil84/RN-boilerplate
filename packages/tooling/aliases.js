// Path aliases for absolute imports inside the workspace packages (ADR-0026).
//
// Metro only applies the *app's* tsconfig `paths`, so a package-local `@/` cannot work; each
// package gets its own prefix instead. This list is the source of truth for Jest (below); the same
// aliases are repeated in tooling/tsconfig.base.json and apps/*/tsconfig.json (JSON cannot import
// this file) — keep all three in sync.
const path = require('node:path');

const packages = path.resolve(__dirname, '..');

/** alias prefix → directory it maps to */
const aliases = {
  '@app': path.join(packages, 'features/src/app'),
  '@features': path.join(packages, 'features/src/features'),
  '@ui': path.join(packages, 'ui/src'),
  '@core': path.join(packages, 'core/src'),
  '@api-client': path.join(packages, 'api-client/src'),
};

/** Jest `moduleNameMapper` entries: `^@ui/(.*)$` → `<abs>/ui/src/$1`. */
const jestModuleNameMapper = Object.fromEntries(
  Object.entries(aliases).map(([alias, dir]) => [`^${alias}/(.*)$`, `${dir}/$1`]),
);

module.exports = { aliases, jestModuleNameMapper };
