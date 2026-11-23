# ADR-0021: No CI for now — local checks with lefthook

Status: Accepted · Date: 2026-11-23 · Implemented on `feat/monorepo-starter`

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q35.

## Context

The existing `.github/workflows/ci.yml` and `e2e-android.yml` assume npm and a single app and would
break after the conversion. A full GitHub Actions setup was proposed; the owner chose no CI for
now. Options for what replaces it: remove workflows and add git hooks; remove with no hooks (no
enforcement); keep them disabled (misleading).

## Decision

- Remove `.github/workflows/*` and CI references in the PR template.
- Add **lefthook**, installed by a `prepare` script on `pnpm install`:
  - pre-commit: Prettier + ESLint on staged files;
  - pre-push: `pnpm verify:changed`.
- A doc explains how to add CI back; the old `ci.yml` stays in git history.

## Consequences

- Most of CI's protection, locally, with no GitHub runner cost.
- Hooks can be skipped with `--no-verify`: a safety net, not a gate.
- Nothing verifies changes pushed from machines without hooks.
- E2E tests run only when developers run them.

## Implementation notes (2026-11-23)

- Implemented as decided. `verify:changed` excludes the root package (its `test` script would rerun every workspace). Lint uses `--max-warnings=0` everywhere so hooks and `pnpm verify` agree.
