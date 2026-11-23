# ADR-0006: Starter contains clients only — no backend

Status: Accepted · Date: 2026-11-23 · Implemented on `feat/monorepo-starter`

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q8.

## Context

Options: no backend; Expo Router API routes (`+api.ts`, ties backend to web deploy); a separate
`apps/api` (e.g. Hono, NestJS) with shared contracts — more value when the team builds the
backend, but much more to maintain and another opinion to accept or remove.

## Decision

The starter ships no backend. `packages/api-client` is a typed RTK Query base API configured from
environment variables, which each project points at its own backend.

## Consequences

- Placeholder endpoints (`login`, `socialSignIn`, `registerDevice`, example list) must be mapped
  per project.
- Tests mock the network; there is no local API to run.
- Projects that own their backend add it via their own ADR.

## Implementation notes (2026-11-23)

- Added an in-app **mock API** (`createMockFetch` in `@starter/api-client`, handlers in `packages/features/src/mocks`) so the starter, tests and E2E run without a backend. Enabled by `EXPO_PUBLIC_API_MOCKS` (committed default `true`), always ignored in production builds. Demo login: any email, password `password`.
- Mocks can no longer reach production: the variant check fails closed (see ADR-0011), the web `export` script defaults to production, and the OTA command sets the variant explicitly (ADR-0018).
