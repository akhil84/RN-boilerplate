---
description: Build an approved plan test-first, task by task
argument-hint: REQ-XXX
---

Implement $ARGUMENTS.

1. Read REQ, PLAN and DES for this number. Stop if PLAN is not `Approved`.
2. Read `AGENTS.md`. Expo APIs change every SDK — check the versioned Expo docs before using any Expo/RN API.
3. For each unchecked task in the plan, in order:
   - Write the failing test first (`packages/features/src/<slug>/__tests__/`), referencing the AC id in the test name (`AC-1: ...`). Use `renderWithProviders` and `setupMockApi` from `@starter/features/test-utils`.
   - Implement the minimum code to make it pass. Strings go in `<slug>/locales/en.json`; analytics events in `src/analytics-events.ts`; endpoints get a mock handler.
   - Run `pnpm --filter @starter/features test -- <path>` until green, then tick the task in the plan file.
4. Put every `testID` from the design spec on the matching element.
5. Add packages to an app with `pnpm --filter <app> exec expo install <pkg>`, then move shared versions into the `catalog:` in `pnpm-workspace.yaml`. A new native module means rebuilding the dev build.
6. Finish with `pnpm verify` (and `pnpm test:e2e:web` if web behaviour changed). Fix everything it reports. Do not disable lint rules, skip tests or use `--no-verify` to get green.
7. Report: tasks done, tests added, anything deferred.
