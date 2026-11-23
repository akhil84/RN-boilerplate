# ADR-0023: Independent version and changelog per app

Status: Accepted · Date: 2026-11-23 · Implemented on `feat/monorepo-starter`

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q37.

## Context

Options: an independent version per app; one version for the whole repo (simpler to talk about,
but bumps web for mobile-only changes and couples release schedules).

## Decision

- `apps/mobile` and `apps/web` each have their own `version` and `CHANGELOG.md`.
- `/ship mobile <bump>` and `/ship web <bump>` release independently.
- Mobile build numbers managed by EAS (`autoIncrement`, remote app versioning).
- Shared packages are not versioned.

## Consequences

- Web can ship immediately while mobile waits for store review.
- `docs/05-releases/CHANGELOG.md` moves into each app (or is split per app).
- Changes to shared packages are recorded in whichever app changelogs they affect.

## Implementation notes (2026-11-23)

- Implemented as decided: `apps/mobile/CHANGELOG.md`, `apps/web/CHANGELOG.md`, per-app release checklist, tags `mobile-vX.Y.Z` / `web-vX.Y.Z`, `/ship <app> [bump]`.
