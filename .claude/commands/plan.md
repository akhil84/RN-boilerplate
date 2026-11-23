---
description: Write an implementation plan (PLAN-XXX) for an approved requirement
argument-hint: REQ-XXX
---

Plan the implementation of $ARGUMENTS.

1. Read the requirement in `docs/01-requirements/`. Stop if its status is not `Approved` and tell me.
2. Read `AGENTS.md`, `src/features/README.md`, relevant ADRs in `docs/04-adr/`, and the existing code the feature touches.
3. Copy `docs/02-plans/_TEMPLATE.md` to `docs/02-plans/PLAN-<NNN>-<slug>.md` (same number and slug as the REQ).
4. Tasks must be small, ordered, and each one test-first. Map every AC to at least one unit/component test and every user journey to a Maestro flow.
5. Any new dependency or architectural choice → propose an ADR (`/adr`) rather than deciding silently.
6. Leave `Status: Draft` and summarise the plan for approval.
