---
description: Write/refresh Maestro E2E flows and fill unit-test gaps for a requirement
argument-hint: REQ-XXX
---

Close the test gaps for $ARGUMENTS.

1. Read the REQ (acceptance criteria) and the plan's test table.
2. Run `npm run test:coverage -- src/features/<slug>` and add unit/component tests for any AC or branch not covered.
   Follow `node_modules/@testing-library/react-native/docs/guides/llm-guidelines.md` (async `render`, `screen`, `userEvent`, role queries first).
3. For each user journey add `e2e/flows/<area>-<journey>.yaml` following `e2e/README.md`:
   start with `- runFlow: ../subflows/launch.yaml`, select by `id:` (testID), first-line comment `# REQ: REQ-XXX — <journey>`.
   Tag the critical path `smoke`.
4. If `maestro` is installed and a device is booted, run `npm run test:e2e` and fix failures; otherwise say the flows are unrun.
5. Update the plan's test table and report coverage per AC.
