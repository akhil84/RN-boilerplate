---
description: Build an approved plan test-first, task by task
argument-hint: REQ-XXX
---

Implement $ARGUMENTS.

1. Read REQ, PLAN and DES for this number. Stop if PLAN is not `Approved`.
2. Read `AGENTS.md`. Expo APIs change every SDK — check the versioned Expo docs before using any Expo/RN API.
3. For each unchecked task in the plan, in order:
   - Write the failing test first (`src/features/<slug>/__tests__/`), referencing the AC id in the test name (`AC-1: ...`).
   - Implement the minimum code to make it pass.
   - Run `npm test -- <path>` until green, then tick the task in the plan file.
4. Put every `testID` from the design spec on the matching element.
5. Install packages only with `npx expo install`.
6. Finish with `npm run verify`. Fix everything it reports. Do not disable lint rules or skip tests to get green.
7. Report: tasks done, tests added, anything deferred.
