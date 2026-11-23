# Adding CI back

The starter has no CI for now (ADR-0021). Local git hooks (`lefthook.yml`) run Prettier and
ESLint on staged files before each commit and `pnpm verify:changed` before each push.

When a project needs CI, add a GitHub Actions workflow that runs the same checks. The previous
npm-based workflows are in git history (`git log --all -- .github/workflows`) as a reference.

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # `--filter "...[origin/main]"` needs history
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
      - run: corepack enable
      - run: pnpm install --frozen-lockfile
      # PRs: only changed workspaces and their dependents. main: everything.
      - run: pnpm verify:changed
        if: github.event_name == 'pull_request'
      - run: pnpm verify
        if: github.event_name == 'push'
```

Then:

1. Record the change in a new ADR that supersedes ADR-0021.
2. Decide whether the lefthook pre-push hook stays (faster feedback) or goes (CI is the gate).
3. Add E2E jobs separately: Playwright for `apps/web` on every PR; Maestro on Android / iOS
   behind a label, since emulator and macOS runners are slow and expensive.
