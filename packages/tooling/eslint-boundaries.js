// Dependency boundaries between packages and features (ADR-0026), enforced with
// `no-restricted-imports`. Each workspace's eslint.config.js adds `boundaries('<workspace>')`.
//
// Layers (an arrow means "may import"):  apps → features → api-client → core
//                                         apps → ui,  features → ui,  features → core
const fs = require('node:fs');
const path = require('node:path');

const ALL_ALIASES = ['@app', '@features', '@ui', '@core', '@api-client'];
const OWN_ALIASES = {
  features: ['@app', '@features'],
  ui: ['@ui'],
  core: ['@core'],
  'api-client': ['@api-client'],
  apps: [],
};
const FORBIDDEN_PACKAGES = {
  ui: ['@starter/features', '@starter/api-client'],
  core: ['@starter/ui', '@starter/features', '@starter/api-client'],
  'api-client': ['@starter/ui', '@starter/features'],
  features: [],
  apps: [],
};

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function rule(patterns) {
  return { 'no-restricted-imports': ['error', { patterns }] };
}

/** @param {'apps' | 'features' | 'ui' | 'core' | 'api-client'} workspace */
function boundaries(workspace, workspaceDir = process.cwd()) {
  const foreignAliases = ALL_ALIASES.filter((alias) => !OWN_ALIASES[workspace].includes(alias));
  const common = [
    {
      regex: '^@starter/[^/]+/src(/|$)',
      message: 'Import packages through their entry points (e.g. `@starter/ui`), not their src/.',
    },
    ...foreignAliases.map((alias) => ({
      regex: `^${escape(alias)}(/|$)`,
      message: `\`${alias}/…\` is private to its package — import the package (\`@starter/…\`) instead.`,
    })),
    ...FORBIDDEN_PACKAGES[workspace].map((name) => ({
      regex: `^${escape(name)}(/|$)`,
      message: `${workspace} must not depend on ${name} (see the layer diagram in ADR-0026).`,
    })),
  ];
  const configs = [{ files: ['**/*.{ts,tsx,js,jsx}'], rules: rule(common) }];

  if (workspace === 'features') {
    // A feature may use another feature only through its public entry `@features/<name>`.
    const featuresDir = path.join(workspaceDir, 'src/features');
    const names = fs.existsSync(featuresDir)
      ? fs
          .readdirSync(featuresDir)
          .filter((n) => fs.statSync(path.join(featuresDir, n)).isDirectory())
      : [];
    for (const name of names) {
      configs.push({
        files: [`src/features/${name}/**/*.{ts,tsx}`],
        rules: rule([
          ...common,
          {
            regex: `^@features/(?!${escape(name)}(/|$))[^/]+/.+`,
            message: `Use another feature only through its public entry (\`@features/<name>\`).`,
          },
        ]),
      });
    }
    // The app layer uses features' public entries; only the registry may import manifests.
    configs.push({
      files: ['src/app/**/*.{ts,tsx}'],
      ignores: ['src/app/registry.ts'],
      rules: rule([
        ...common,
        {
          regex: '^@features/[^/]+/.+',
          message:
            'App code uses features only through `@features/<name>` (the registry may import `@features/<name>/feature`).',
        },
      ]),
    });
  }
  return configs;
}

module.exports = { boundaries };
