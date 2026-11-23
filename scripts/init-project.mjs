#!/usr/bin/env node
// One-time project setup for repos created from this starter (ADR-0002).
//
//   pnpm init:project                                  # asks for each value
//   pnpm init:project --name "Acme Field" --slug acme-field \
//     --bundle-id com.acme.field --scope acme [--eas-project-id <uuid>] [--yes]
//
// Replaces every placeholder identity in tracked files, resets the changelogs and product vision,
// then deletes itself (and its test). Run `pnpm install` afterwards.
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';

/** Placeholder strings, longest first so `com.example.starterapp` is replaced before `starterapp`. */
export const PLACEHOLDERS = {
  bundleId: 'com.example.starterapp',
  name: 'Starter App',
  slug: 'starter-app',
  scope: '@starter/',
  scheme: 'starterapp',
};

const SELF = ['scripts/init-project.mjs', 'scripts/init-project.test.mjs'];

const SLUG = /^[a-z][a-z0-9-]*[a-z0-9]$/;
const BUNDLE_ID = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*){2,}$/;
const SCOPE = /^[a-z][a-z0-9-]*$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validate({ name, slug, bundleId, scope, easProjectId }) {
  const errors = [];
  if (!name?.trim()) errors.push('--name is required (the display name, e.g. "Acme Field")');
  if (!SLUG.test(slug ?? '')) errors.push('--slug must be kebab-case, e.g. acme-field');
  if (!BUNDLE_ID.test(bundleId ?? ''))
    errors.push('--bundle-id must be reverse-DNS lowercase, e.g. com.acme.field');
  if (!SCOPE.test(scope ?? '')) errors.push('--scope must be lowercase without @, e.g. acme');
  if (bundleId?.startsWith('com.example.')) errors.push('--bundle-id must not use com.example');
  if (easProjectId && !UUID.test(easProjectId)) errors.push('--eas-project-id must be a UUID');
  return errors;
}

/** Ordered [from, to] replacements for the given identity. */
export function replacementsFor({ name, slug, bundleId, scope }) {
  return [
    [PLACEHOLDERS.bundleId, bundleId],
    [PLACEHOLDERS.name, name],
    [PLACEHOLDERS.slug, slug],
    [PLACEHOLDERS.scope, `@${scope}/`],
    // The URL scheme: the slug without dashes (schemes allow them, but this matches the starter).
    [PLACEHOLDERS.scheme, slug.replace(/-/g, '')],
  ];
}

function isText(buffer) {
  return !buffer.subarray(0, 8000).includes(0);
}

function trackedFiles(root) {
  return execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean)
    .filter((file) => !SELF.includes(file));
}

const VISION = `# <Project name> — product vision

Status: Draft

## Problem

<!-- Who has what problem today? One paragraph. -->

## Users

| Persona | Goal | Pain today |
| ------- | ---- | ---------- |
|         |      |            |

## Product promise

<!-- One sentence: <Project name> helps <who> <do what> so that <outcome>. -->

## Success metrics

-

## Out of scope (for now)

-

## Platforms

iOS and Android (\`apps/mobile\`) and web (\`apps/web\`).
`;

const changelog = (app) => `# Changelog — ${app}

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · Versioning: SemVer
(\`version\` in this app's app.config.ts). Released independently of the other app (ADR-0023).

## [Unreleased]
`;

export function initProject(root, identity) {
  const errors = validate(identity);
  if (errors.length) throw new Error(errors.join('\n'));

  const replacements = replacementsFor(identity);
  const changed = [];

  for (const file of trackedFiles(root)) {
    const path = join(root, file);
    // Regular files only: tracked symlinks (e.g. .claude/skills/*) are left untouched.
    if (!existsSync(path) || !lstatSync(path).isFile()) continue;
    const buffer = readFileSync(path);
    if (!isText(buffer)) continue;
    const before = buffer.toString('utf8');
    let after = before;
    for (const [from, to] of replacements) after = after.split(from).join(to);
    if (after !== before) {
      writeFileSync(path, after);
      changed.push(file);
    }
  }

  if (identity.easProjectId) {
    const config = join(root, 'apps/mobile/app.config.ts');
    const source = readFileSync(config, 'utf8');
    writeFileSync(
      config,
      source.replace(
        "process.env.EAS_PROJECT_ID ?? ''",
        `process.env.EAS_PROJECT_ID ?? '${identity.easProjectId}'`,
      ),
    );
  }

  writeFileSync(
    join(root, 'docs/00-product/vision.md'),
    VISION.replace(/<Project name>/g, identity.name),
  );
  writeFileSync(join(root, 'apps/mobile/CHANGELOG.md'), changelog(`${identity.name} mobile`));
  writeFileSync(join(root, 'apps/web/CHANGELOG.md'), changelog(`${identity.name} web`));

  // Remove the one-time script and its package.json entry.
  const packageJsonPath = join(root, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  delete packageJson.scripts['init:project'];
  delete packageJson.scripts['test:scripts'];
  packageJson.scripts.verify = packageJson.scripts.verify.replace(' && pnpm test:scripts', '');
  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
  for (const file of SELF) rmSync(join(root, file), { force: true });

  return changed;
}

async function ask(questions) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answers = {};
  for (const [key, prompt, fallback] of questions) {
    const answer = (await rl.question(`${prompt}${fallback ? ` (${fallback})` : ''}: `)).trim();
    answers[key] = answer || fallback?.() || '';
  }
  rl.close();
  return answers;
}

async function main() {
  const { values } = parseArgs({
    options: {
      name: { type: 'string' },
      slug: { type: 'string' },
      'bundle-id': { type: 'string' },
      scope: { type: 'string' },
      'eas-project-id': { type: 'string' },
      yes: { type: 'boolean', default: false },
    },
  });

  let identity = {
    name: values.name,
    slug: values.slug,
    bundleId: values['bundle-id'],
    scope: values.scope,
    easProjectId: values['eas-project-id'],
  };

  if (!values.yes) {
    const toSlug = (text) =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    const asked = await ask(
      [
        ['name', 'Display name (e.g. Acme Field)'],
        ['slug', 'Slug', identity.name && (() => toSlug(identity.name))],
        ['bundleId', 'iOS bundle ID / Android package (e.g. com.acme.field)'],
        ['scope', 'npm scope for packages, without @ (e.g. acme)'],
        ['easProjectId', 'EAS project ID (optional — from `eas init`)', () => ''],
      ].filter(([key]) => !identity[key]),
    );
    identity = { ...identity, ...asked };
    if (!identity.slug) identity.slug = toSlug(identity.name ?? '');
  }

  const root = resolve(import.meta.dirname, '..');
  const changed = initProject(root, identity);
  console.log(`\nUpdated ${changed.length} files for "${identity.name}".`);
  console.log('Next: pnpm install && pnpm verify, then commit.');
  if (!identity.easProjectId) {
    console.log('Later: run `pnpm dlx eas-cli init` in apps/mobile and set EAS_PROJECT_ID.');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
