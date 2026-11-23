// Shared Jest config factory (ADR-0020). Each workspace's jest.config.js calls this.
//
//   module.exports = createJestConfig();                              // jest-expo (native)
//   module.exports = createJestConfig({ platforms: ['web'] });        // web only
//   module.exports = createJestConfig({ platforms: ['ios', 'android', 'web'] }); // shared code
//
// More than one platform runs every test file once per platform renderer, which catches
// `.web.tsx` / `.ios.tsx` mistakes in shared packages.
const {
  getIOSPreset,
  getAndroidPreset,
  getWebPreset,
  withWatchPlugins,
} = require('jest-expo/config');

const PRESETS = { ios: getIOSPreset, android: getAndroidPreset, web: getWebPreset };

const shared = {
  setupFilesAfterEnv: [require.resolve('./setup.js')],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
};

const styleMapper = { '\\.(css)$': require.resolve('./style-mock.js') };

// ESM-only packages that Jest must transform. Under the `react-native` export condition, Redux
// Toolkit resolves to ESM builds of immer / redux / reselect, which Jest cannot load untransformed.
const TRANSFORM_PACKAGES = [
  '@reduxjs/toolkit',
  'immer',
  'redux',
  'redux-thunk',
  'reselect',
  'react-redux',
  'redux-persist',
];

function withTransformedPackages(patterns = []) {
  return patterns.map((pattern) =>
    pattern.startsWith('/node_modules/(?!(')
      ? pattern.replace('/node_modules/(?!(', `/node_modules/(?!(${TRANSFORM_PACKAGES.join('|')}|`)
      : pattern,
  );
}

function withShared(preset, moduleNameMapper) {
  return {
    ...preset,
    ...shared,
    transformIgnorePatterns: withTransformedPackages(preset.transformIgnorePatterns),
    // Jest uses the first matching pattern, so the CSS stub must come before path aliases such as
    // `^@/(.*)$`, or `@/global.css` would be resolved and parsed as JavaScript.
    moduleNameMapper: { ...styleMapper, ...preset.moduleNameMapper, ...moduleNameMapper },
  };
}

/**
 * @param {{ platforms?: Array<'ios' | 'android' | 'web'>, moduleNameMapper?: Record<string, string>, collectCoverageFrom?: string[] }} [options]
 */
function createJestConfig({ platforms, moduleNameMapper = {}, collectCoverageFrom } = {}) {
  const coverage = {
    collectCoverageFrom: collectCoverageFrom ?? ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  };

  if (!platforms) {
    const base = require('jest-expo/jest-preset');
    return { ...withShared(base, moduleNameMapper), ...coverage };
  }

  if (platforms.length === 1) {
    return { ...withShared(PRESETS[platforms[0]](), moduleNameMapper), ...coverage };
  }

  return withWatchPlugins({
    ...coverage,
    projects: platforms.map((platform) => withShared(PRESETS[platform](), moduleNameMapper)),
  });
}

module.exports = { createJestConfig };
