#!/usr/bin/env node
// Scaffold a feature in the standard layout (ADR-0026) and register it.
//
//   pnpm new:feature order-history
//
// Creates packages/features/src/features/<name>/ with a screen, translations, mock handlers, the
// feature manifest and its public entry; adds it to app/registry.ts and the package entry.
// Then: add route files in apps/*/src/app/(app)/ and, for a top-level screen, a destination in
// app/navigation/destinations.ts.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const featuresDir = join(root, 'packages/features/src/features');
const registryPath = join(root, 'packages/features/src/app/registry.ts');
const entryPath = join(root, 'packages/features/src/index.ts');

const name = process.argv[2];
if (!name || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
  console.error('Usage: pnpm new:feature <kebab-case-name>   e.g. pnpm new:feature order-history');
  process.exit(1);
}
const dir = join(featuresDir, name);
if (existsSync(dir)) {
  console.error(`Feature "${name}" already exists at ${dir}`);
  process.exit(1);
}

const pascal = name.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
const camel = pascal[0].toLowerCase() + pascal.slice(1);

const files = {
  'locales/en.json': `${JSON.stringify({ title: pascal.replace(/([a-z])([A-Z])/g, '$1 $2') }, null, 2)}\n`,
  [`screens/${name}-screen.tsx`]: `import { useTranslation } from 'react-i18next';

import { Screen, ThemedText } from '@starter/ui';

export function ${pascal}Screen() {
  const { t } = useTranslation('${name}');

  return (
    <Screen scroll>
      <ThemedText type="subtitle" role="heading" testID="${name}-title">
        {t('title')}
      </ThemedText>
    </Screen>
  );
}
`,
  'mocks/handlers.ts': `import type { MockHandler } from '@starter/api-client';

/** ${pascal} endpoints of the in-app mock API (dev / tests / E2E; never in production builds). */
export const ${camel}MockHandlers: MockHandler[] = [];
`,
  'feature.ts': `import { defineFeature } from '@app/feature';

import en from './locales/en.json';
import { ${camel}MockHandlers } from './mocks/handlers';

export const ${camel}Feature = defineFeature({
  name: '${name}',
  translations: { en },
  mockHandlers: ${camel}MockHandlers,
});
`,
  'index.ts': `// Public API of the ${name} feature — other features and apps import only from here.
export { ${camel}Feature } from './feature';
export { ${pascal}Screen } from './screens/${name}-screen';
`,
};

for (const [file, content] of Object.entries(files)) {
  const path = join(dir, file);
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, content);
}

function insertBefore(path, marker, line, { atImports = false, importLine } = {}) {
  let text = readFileSync(path, 'utf8');
  if (!text.includes(marker)) throw new Error(`Marker "${marker}" not found in ${path}`);
  text = text.replace(marker, `${line}\n  ${marker}`);
  if (atImports && importLine) {
    const lastImport = text.lastIndexOf('\nimport ');
    const end = text.indexOf('\n', lastImport + 1);
    text = `${text.slice(0, end + 1)}${importLine}\n${text.slice(end + 1)}`;
  }
  writeFileSync(path, text);
}

insertBefore(registryPath, '// new-feature:registry', `${camel}Feature,`, {
  atImports: true,
  importLine: `import { ${camel}Feature } from '@features/${name}/feature';`,
});
let entry = readFileSync(entryPath, 'utf8');
entry = entry.replace(
  '// new-feature:exports',
  `export * from './features/${name}';\n// new-feature:exports`,
);
writeFileSync(entryPath, entry);

console.log(`Created packages/features/src/features/${name}/ and registered it.`);
console.log('Next:');
console.log(
  `  - add route files that render ${pascal}Screen in apps/mobile and apps/web (src/app/(app)/${name}.tsx)`,
);
console.log(
  '  - for a top-level screen, add it to packages/features/src/app/navigation/destinations.ts',
);
console.log('  - run pnpm format && pnpm verify');
