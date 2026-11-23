---
description: Write an implementation plan (PLAN-XXX) for an approved requirement
argument-hint: REQ-XXX
---

Plan the implementation of $ARGUMENTS.

1. Read the requirement in `docs/01-requirements/`. Stop if its status is not `Approved` and tell me.
2. Read `AGENTS.md` (layout and decided stack), `packages/features/README.md`, relevant ADRs in `docs/04-adr/`, and the existing code the feature touches.
3. Copy `docs/02-plans/_TEMPLATE.md` to `docs/02-plans/PLAN-<NNN>-<slug>.md` (same number and slug as the REQ).
4. Every task names the workspace it touches (`packages/features`, `packages/ui`, `apps/mobile`, …). Features go in `packages/features/src/features/<slug>/` (scaffold with `pnpm new:feature <slug>`; layout in packages/features/README.md); apps only get thin route files.
5. Tasks must be small, ordered, and each one test-first. Map every AC to at least one unit/component test. Map every user journey to a Maestro flow (`mobile`), a Playwright spec (`web`), or both, per the requirement's `Platforms:`.
6. New endpoints: plan the RTK Query endpoint (`api.injectEndpoints`), its Zod response schema, and a mock handler in the feature's `mocks/handlers.ts`.
7. Any new dependency or deviation from the stack in `AGENTS.md` → propose an ADR (`/adr`) rather than deciding silently.
8. Leave `Status: Draft` and summarise the plan for approval.
