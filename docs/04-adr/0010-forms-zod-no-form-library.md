# ADR-0010: No form library — Zod validation and a shared TextField

Status: Accepted · Date: 2026-11-23 · Implemented on `feat/monorepo-starter`

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q24.

## Context

Apps are expected to have few, simple forms. Options: React Hook Form + Zod; Formik + Yup;
TanStack Form + Zod; plain controlled inputs with Zod; plain inputs with hand-written validation.

## Decision

- No form library. Forms use controlled inputs; on submit a Zod schema validates and returns field
  errors (`safeParse` → `flatten().fieldErrors`).
- `packages/ui` provides `TextField` (label, error, `testID`, accessibility props).
- Zod is the single validation library (forms, env config, optional API response checks).

## Consequences

- Deliberate exception to "batteries included".
- Minimal dependencies; simple forms stay simple.
- A project with heavy forms adds React Hook Form via ADR; Zod schemas and `TextField` carry over
  through the Zod resolver.

## Implementation notes (2026-11-23)

- Implemented as decided; `TextField` (label, error with `role="alert"`, testID) is in `@starter/ui`.
