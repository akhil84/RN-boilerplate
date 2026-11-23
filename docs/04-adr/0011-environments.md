# ADR-0011: Three side-by-side app variants with validated env config

Status: Accepted · Date: 2026-11-23 · Implemented on `feat/monorepo-starter`

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q25.

## Context

Expo inlines `EXPO_PUBLIC_*` variables into the bundle (public config only). Native identity per
environment needs a dynamic `app.config.ts`. EAS has `development` / `preview` / `production`
environments. Options: three variants; two variants (no QA build); one build with a runtime
environment switch (ships non-production URLs in production, no side-by-side installs).

## Decision

| Variant     | Bundle ID                        | App name              |
| ----------- | -------------------------------- | --------------------- |
| development | `com.example.starterapp.dev`     | Starter App (Dev)     |
| preview     | `com.example.starterapp.preview` | Starter App (Preview) |
| production  | `com.example.starterapp`         | Starter App           |

- Selected by `APP_VARIANT` in `apps/mobile/app.config.ts`, matching EAS build profiles.
- Values from `.env.local` (git-ignored) locally and EAS environment variables in builds;
  `apps/web` uses the same names at export time.
- `packages/config/env.ts` validates all `EXPO_PUBLIC_*` values with Zod at startup and exports a
  typed `env`.

## Consequences

- Testers can install all three variants on one device.
- Bad or missing config fails fast with a clear error.
- `app.json` becomes `app.config.ts`; the init script must handle variant suffixes.
- Never put secrets in `EXPO_PUBLIC_*`.
- Build profiles select EAS environments with `"environment"` (development / preview / production).

## Implementation notes (2026-11-23)

- Implemented as decided. Public defaults are committed in `apps/*/.env` (mock mode on); `.env.local` overrides; variant via `APP_VARIANT` → `extra.appVariant`. URL schemes are per variant (`starterapp`, `starterapp-dev`, `starterapp-preview`).
- Since SDK 58 only `.env`, `.env.local`, `.env.<NODE_ENV>` and `.env.<NODE_ENV>.local` are loaded, so variants are not driven by env file names.
