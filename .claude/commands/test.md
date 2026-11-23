---
description: Write/refresh E2E flows (Maestro, Playwright) and fill unit-test gaps for a requirement
argument-hint: REQ-XXX
---

Close the test gaps for $ARGUMENTS.

1. Read the REQ (acceptance criteria, `Platforms:`) and the plan's test table.
2. Run `pnpm --filter @starter/features test -- --coverage src/features/<slug>` and add unit/component tests for any AC or branch not covered.
   Follow `node_modules/@testing-library/react-native/docs/guides/llm-guidelines.md` (async `render`, `screen`, `userEvent`, role queries first).
3. For each user journey, per `Platforms:`:
   - **mobile:** add `e2e/mobile/flows/<area>-<journey>.yaml` following `e2e/mobile/README.md` — start with `- runFlow: ../subflows/launch.yaml` (and `../subflows/sign-in.yaml` for signed-in journeys), select by `id:` (testID), first-line comment `# REQ: REQ-XXX — <journey>`. Tag the critical path `smoke`.
   - **web:** add `e2e/web/tests/<area>.spec.ts` following `e2e/web/README.md` — select with `getByTestId`, reuse `signIn` from `tests/helpers.ts`, first-line comment `// REQ: REQ-XXX — <journey>`.
4. Run `pnpm test:e2e:web` (Playwright starts its own server). If `maestro` is installed and a device with a dev build is booted, run `pnpm test:e2e:mobile`; otherwise say the mobile flows are unrun.
5. Update the plan's test table and report coverage per AC.
