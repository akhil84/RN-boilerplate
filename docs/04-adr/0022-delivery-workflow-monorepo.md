# ADR-0022: Delivery workflow adapted for the monorepo

Status: Accepted · Date: 2026-11-23 · Implemented on `feat/monorepo-starter`

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q36.

## Context

The Requirement → Plan → Design → Implement → Test → Ship workflow and its slash commands assume a
single app, npm and `src/features`. Options: make it monorepo-aware with a `Platforms:` field on
requirements; keep it single-platform and let each plan decide.

## Decision

- `docs/` stays at the root with shared numbering; requirements gain
  `Platforms: mobile | web | both`.
- AGENTS.md rewritten: new layout, "features live in `packages/features`, never in `apps/`", pnpm
  commands, stack summary linking ADRs, "Project rules" heading, desktop-safe rule (ADR-0024).
- Slash commands:
  - `/plan` — tasks name the package; journeys map to Maestro and/or Playwright.
  - `/design` — mobile and web layouts, shared `testID`s.
  - `/implement` — tests in `packages/features/src/<feature>/__tests__/`; ends with `pnpm verify`.
  - `/test` — writes flows and specs; no CI references.
  - `/ship` — per-app versioning; prints (never runs) `eas build`, `eas update`, web export.
- `vision.md` and `glossary.md` become generic templates, reset by the init script.

## Consequences

- Every stage states which platforms it covers.
- Slash commands and AGENTS.md must be kept in step with future structural ADRs.

## Implementation notes (2026-11-23)

- Implemented as decided: AGENTS.md (layout, decided-stack table with ADR links, rules), all slash commands and templates updated; requirements carry `Platforms:`.
