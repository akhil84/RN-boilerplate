// Tests for the one-time init script (ADR-0002). Runs with Node's built-in runner:
//   pnpm test:scripts
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, lstatSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { after, before, describe, it } from 'node:test';

import { initProject, PLACEHOLDERS, replacementsFor, validate } from './init-project.mjs';

const REPO = resolve(import.meta.dirname, '..');

const identity = {
  name: 'Acme Field',
  slug: 'acme-field',
  bundleId: 'com.acme.field',
  scope: 'acme',
  easProjectId: '11111111-2222-3333-4444-555555555555',
};

describe('validate', () => {
  it('accepts a complete identity', () => {
    assert.deepEqual(validate(identity), []);
  });

  it('rejects bad values with a message per field', () => {
    const errors = validate({ name: '', slug: 'Bad Slug', bundleId: 'acme', scope: '@acme' });
    assert.equal(errors.length, 4);
  });

  it('refuses the placeholder bundle ID namespace', () => {
    assert.ok(validate({ ...identity, bundleId: 'com.example.field' }).length > 0);
  });
});

describe('replacementsFor', () => {
  it('replaces the bundle ID before the scheme it contains', () => {
    const order = replacementsFor(identity).map(([from]) => from);
    assert.ok(order.indexOf(PLACEHOLDERS.bundleId) < order.indexOf(PLACEHOLDERS.scheme));
  });
});

describe('initProject on a copy of the repo', () => {
  let copy;

  before(() => {
    copy = mkdtempSync(join(tmpdir(), 'init-project-'));
    const files = execFileSync('git', ['ls-files', '-z'], { cwd: REPO, encoding: 'utf8' })
      .split('\0')
      .filter(Boolean);
    for (const file of files) {
      if (!existsSync(join(REPO, file))) continue;
      cpSync(join(REPO, file), join(copy, file), { recursive: true, verbatimSymlinks: true });
    }
    execFileSync('git', ['init', '-q'], { cwd: copy });
    execFileSync('git', ['add', '-A'], { cwd: copy });
    initProject(copy, identity);
  });

  after(() => rmSync(copy, { recursive: true, force: true }));

  it('leaves no placeholder identity in any tracked file', () => {
    const leftovers = [];
    const files = execFileSync('git', ['ls-files', '-z'], { cwd: copy, encoding: 'utf8' })
      .split('\0')
      .filter(
        (file) => file && existsSync(join(copy, file)) && lstatSync(join(copy, file)).isFile(),
      );
    for (const file of files) {
      const text = readFileSync(join(copy, file));
      if (text.subarray(0, 8000).includes(0)) continue;
      for (const placeholder of Object.values(PLACEHOLDERS)) {
        if (text.toString('utf8').includes(placeholder)) leftovers.push(`${file}: ${placeholder}`);
      }
    }
    assert.deepEqual(leftovers, []);
  });

  it('applies the new identity to the app config and packages', () => {
    const config = readFileSync(join(copy, 'apps/mobile/app.config.ts'), 'utf8');
    assert.match(config, /const BUNDLE_ID = 'com\.acme\.field';/);
    assert.match(config, /const APP_NAME = 'Acme Field';/);
    assert.match(config, /EAS_PROJECT_ID \?\? '11111111-2222-3333-4444-555555555555'/);

    const ui = JSON.parse(readFileSync(join(copy, 'packages/ui/package.json'), 'utf8'));
    assert.equal(ui.name, '@acme/ui');
  });

  it('removes itself and its package.json scripts', () => {
    assert.equal(existsSync(join(copy, 'scripts/init-project.mjs')), false);
    const pkg = JSON.parse(readFileSync(join(copy, 'package.json'), 'utf8'));
    assert.equal(pkg.scripts['init:project'], undefined);
    assert.doesNotMatch(pkg.scripts.verify, /test:scripts/);
  });

  it('resets the per-app changelogs and the product vision', () => {
    assert.match(readFileSync(join(copy, 'apps/mobile/CHANGELOG.md'), 'utf8'), /Acme Field mobile/);
    assert.match(readFileSync(join(copy, 'docs/00-product/vision.md'), 'utf8'), /# Acme Field/);
    assert.ok(existsSync(dirname(join(copy, 'apps/web/CHANGELOG.md'))));
  });
});
