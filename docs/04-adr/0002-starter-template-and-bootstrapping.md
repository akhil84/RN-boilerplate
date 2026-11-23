# ADR-0002: Repo is a starter template, bootstrapped by an init script

Status: Accepted · Date: 2026-11-23 · Implemented on `feat/monorepo-starter`

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q1, Q7, Q11, Q12.

## Context

This repo exists to kick off new client projects (iOS, Android, web). Two models were considered:

- **Starter template** copied per project — each copy is an independent monorepo.
- **One shared workspace** holding many projects side by side — but Expo does not support more than
  one React Native version per monorepo, so every project would upgrade in lockstep, and client
  codebases would be mixed.

For bootstrapping a copy: a GitHub template + init script, a generator CLI (separate tool that can
drift), or a manual checklist (identifiers get missed and fail only at store submission).

## Decision

- The repo is a **starter template**, converted in place from `RN-boilerplate` on a branch.
- Placeholder identity replaces "Katon" everywhere:
  `Starter App` · `starter-app` · `starterapp` (scheme) · `@starter/*` · `com.example.starterapp`.
- New projects use GitHub **"Use this template"**, then run **`pnpm init:project`**, which asks
  for the name, bundle-ID prefix and npm scope, replaces every placeholder, resets
  `CHANGELOG.md` and `vision.md`, and deletes itself.
- A test (Node's built-in runner, `pnpm test:scripts`, part of `pnpm verify`) runs the script on a
  copy of the repo and asserts no placeholder string remains.

## Consequences

- Each project is independent: own SDK upgrade schedule, own history.
- Placeholders are distinctive, so find-and-replace is safe; `com.example` is rejected by the
  stores, which catches a forgotten init.
- The init script must be kept in step with every new file that carries identity.
- Improvements to the starter do not flow to existing projects automatically.

## Implementation notes (2026-11-23)

- Implemented as decided. `pnpm init:project` also takes an optional EAS project ID (written to `apps/mobile/app.config.ts`) and Sentry DSN (written to both apps' `.env`); it skips tracked symlinks (`.claude/skills/*`).
- Verified by initialising a copy as "Acme Field": all workspaces typecheck and tests pass under `@acme/*`.
- Manual step: enable **Template repository** in the GitHub repo settings.
