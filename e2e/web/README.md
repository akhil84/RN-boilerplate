# End-to-end tests — web (Playwright)

Drives the real web app in a browser. `playwright.config.ts` exports `apps/web` as a static
single-page app with the in-app mock API on, serves it on port 4173 (`serve.mjs`), then runs the
specs in `tests/`.

## Setup (once)

```bash
pnpm exec playwright install chromium        # add firefox webkit for test:e2e:web:all
```

## Run

```bash
pnpm test:e2e:web          # Chromium
pnpm test:e2e:web:all      # Chromium, Firefox, WebKit
pnpm exec playwright show-report e2e/web/playwright-report
```

## Conventions

- One journey area per file: `tests/<area>.spec.ts`; first line `// REQ: REQ-XXX — <journey>`.
- Select with `page.getByTestId(...)` — React Native Web renders `testID` as `data-testid`, so
  specs share IDs with the Maestro flows. Fall back to roles / labels, never CSS classes.
- Reuse `signIn` from `tests/helpers.ts` for signed-in journeys (demo credentials, mock API).
- Tag critical-path describes `@smoke` in the title.
