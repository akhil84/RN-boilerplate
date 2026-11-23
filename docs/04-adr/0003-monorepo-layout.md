# ADR-0003: Two Expo apps over four source-only shared packages

Status: Accepted, layout amended by ADR-0026 · Date: 2026-11-23

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q3, Q4, Q5, Q13.
Amends the folder layout in ADR-0001 (`src/app`, `src/features`).

## Context

Mobile and web should share React Native code but differ in navigation, layout and release
cadence. Options considered:

- **App split:** one universal Expo app with `.web.tsx` overrides (less setup, but mobile and web
  are coupled in navigation, config and releases) vs **two Expo apps** as thin shells.
- **Package split:** one `packages/app`; a few focused packages; one package per feature
  (heaviest).
- **Folder naming:** `apps/` + `packages/` vs everything under `packages/`.
- **Package format:** TypeScript source consumed directly vs built `dist/` output (publishable,
  but stale-build bugs and fiddly with platform files, worklets and the React Compiler).

## Decision

```
apps/mobile          Expo — iOS + Android
apps/web             Expo — web only
packages/ui          tokens, primitives, test-utils
packages/features    feature screens + logic
packages/api-client  RTK Query base API
packages/config      eslint / tsconfig / prettier / jest presets, env, analytics, errors
```

- Apps contain route files and layouts only; screens come from `@starter/features`.
- Packages ship **TypeScript source** (`"exports": { ".": "./src/index.ts" }`), no build step.
- Inside `packages/features`, other code imports a feature only from its `index.ts`.

## Consequences

- Screens are written once; each app owns its navigation and deploy.
- Routes are declared in both apps (a few lines each).
- Edits in packages hot-reload in both apps; no `dist/` to rebuild.
- Packages are not publishable to npm (not a goal).
- AGENTS.md, `src/features/README.md` and slash commands must describe the new paths.

## Implementation notes (2026-11-23)

- Implemented as decided. `packages/features` also holds the Redux store, i18n setup, mock API handlers and `@starter/features/test-utils`; `packages/config` also holds the Zod env (`/env`) and observability (`/observability`).
- Platform-specific modules use `.native.ts` / `.web.ts` plus a plain `.ts` entry for the type checker.
