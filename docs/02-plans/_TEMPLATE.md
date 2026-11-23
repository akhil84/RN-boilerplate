# PLAN-XXX: <feature name>

Status: Draft · Requirement: [REQ-XXX](../01-requirements/REQ-XXX-slug.md)

## Approach

<!-- 3–6 sentences. What we will build and why this way. -->

## Changes

| Workspace         | Path                                    | Change |
| ----------------- | --------------------------------------- | ------ |
| packages/features | `src/features/<slug>/...`               |        |
| packages/features | `src/features/<slug>/mocks/handlers.ts` |        |
| packages/ui       | `src/components/...` (shared UI only)   |        |
| apps/mobile       | `src/app/(app)/...` (thin route)        |        |
| apps/web          | `src/app/(app)/...` (thin route)        |        |

## Tasks

<!-- Small, independently verifiable. Each ends with a green test run. -->

1. [ ] Write failing test for AC-1 → implement → green
2. [ ] ...
3. [ ] E2E: Maestro `e2e/mobile/flows/<area>-<journey>.yaml` and/or Playwright `e2e/web/tests/<area>.spec.ts`

## Test plan

| AC   | Unit / component test | Maestro (mobile) | Playwright (web) |
| ---- | --------------------- | ---------------- | ---------------- |
| AC-1 |                       |                  |                  |

## Risks & rollback

-

## New dependencies

<!-- Name, why, alternatives considered. Install with `pnpm --filter <app> exec expo install`; shared versions go in the pnpm catalog. Needs an ADR if it changes the stack. -->
