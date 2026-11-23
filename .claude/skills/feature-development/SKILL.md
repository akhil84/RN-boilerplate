---
name: feature-development
description: How to build or change a feature in THIS repo (Expo SDK 58 pnpm monorepo, ADR-0026 structure) — scaffold with `pnpm new:feature`, feature manifest + registry, RTK Query endpoint + Zod schema + mock handler, Redux slice and persistence, i18n strings, analytics events, screens from @starter/ui, route files in both apps, navigation destinations, testIDs, import boundaries, and the checks to run. Use whenever adding a screen, endpoint, slice, translation, analytics event or feature folder, or when deciding where code goes. Also use to reconcile generic React Native / Expo skill advice with this repo's decided stack.
---

# Feature development in this repo

The repo's rules live in `AGENTS.md` and the ADRs in `docs/04-adr/`. This skill turns them into
the order of work for a feature. Code templates for each step: [references/recipes.md](references/recipes.md).

## This repo's decisions win over generic skills

Other installed skills (Expo, Callstack, agent-skills) give general advice. Where it conflicts
with a decision below, follow the decision — changing one needs a new ADR (`/adr`).

| Generic advice                           | Here                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| "Try Expo Go first"                      | Development builds only (ADR-0025)                                             |
| React Query / SWR / fetch in components  | RTK Query endpoints in the feature's `api/` (ADR-0007, 0008)                   |
| Zustand / Jotai / Context for state      | Redux Toolkit slices, typed `useAppSelector` / `useAppDispatch`                |
| `combineSlices` / lazy reducer injection | List slices in the feature's `feature.ts`; the registry mounts them (ADR-0026) |
| A second `createApi`                     | `api.injectEndpoints` on the one shared `api` from `@starter/api-client`       |
| NativeWind / Tamagui / Unistyles         | `StyleSheet` + tokens from `@starter/ui` (ADR-0017)                            |
| `@expo/ui`, new UI libraries             | `@starter/ui` components first; a new library needs an ADR                     |
| react-hook-form / Formik                 | Controlled inputs + Zod + `TextField` (ADR-0010)                               |
| `npm` / `npx` / `yarn`                   | `pnpm` / `pnpm dlx`; `pnpm --filter @starter/mobile exec expo install`         |
| Import Sentry / an analytics SDK         | `reportError` / `analytics.track` from `@starter/core/observability`           |
| Tokens in AsyncStorage / Redux           | `tokenStorage` (SecureStore / web storage) only (ADR-0015, 0016)               |
| Edit `ios/` / `android/`                 | Never — `app.config.ts` + config plugins (CNG)                                 |

## Before you start

1. Work from an **Approved** plan (`docs/02-plans/`); never build from a `Draft`. Note its
   `Platforms:` — `mobile`, `web` or `both` decides which apps, layouts and E2E specs you touch.
2. Check the API you need against the Expo SDK 58 docs (`https://docs.expo.dev/versions/v58.0.0/`)
   — don't trust memory.
3. Reuse before writing: `@starter/ui` (Button, TextField, Card, Screen, Stack, ThemedText/View,
   tokens, useBreakpoint), `@starter/core` (env, observability), `@starter/api-client`, and other
   features' public entries.

## Order of work

1. **Scaffold** — `pnpm new:feature <kebab-name>` creates
   `packages/features/src/features/<name>/` (screen, `locales/en.json`, `mocks/handlers.ts`,
   `feature.ts`, `index.ts`) and registers it in `app/registry.ts` and `src/index.ts`. For an
   existing feature, skip this. Add only the sub-folders you need: `screens/ components/ hooks/
api/ model/ services/ __tests__/`, plus `types.ts` and `analytics.ts`.
2. **Types** — Zod schemas + inferred types in `types.ts` for anything crossing a boundary
   (responses, stored data, form input).
3. **Endpoints** — `api/<thing>-api.ts`: `api.injectEndpoints`, `transformResponse` parses with the
   Zod schema, tags for cache invalidation. Export the generated hooks.
4. **Mock handlers** — one per endpoint in `mocks/handlers.ts`, listed in `feature.ts`
   (`mockHandlers`). Guard authenticated routes with `isMockAuthorized` from `@app/mocks/helpers`.
   The app, tests and E2E run without a backend.
5. **Client state** (only if needed) — a slice in `model/`, listed in `feature.ts` (`slices`).
   Never copy server data into a slice. To persist it, add it to `persistedSlices` in
   `app/store/store.ts`, bump `PERSIST_VERSION` and add a migration. Never persist secrets.
6. **Strings** — every user-visible string in `locales/en.json`; `useTranslation('<name>')`.
   Shared labels (tabs, generic errors) are in `app/i18n/locales/en/common.json`.
7. **Analytics** — declare events in `analytics.ts` (module augmentation of `AnalyticsEventMap`),
   `import './analytics'` in `feature.ts`, then `analytics.track('event_name', props)`.
8. **Screens and components** — `screens/<name>-screen.tsx`, exported from `index.ts`. Use
   `@starter/ui` + tokens; cover loading / error-with-retry / empty / success for data screens
   (`home-screen.tsx` is the reference). Title gets `testID="<screen>-title"` and
   `role="heading"`; interactive elements get testIDs and 44pt targets; works in light and dark.
   Platform code: `x.native.ts` + `x.web.ts` + a plain `x.ts` for the type checker; no `window` /
   `document` / `localStorage` outside `.web.ts`.
9. **Routes** — thin files that only re-export a screen:
   `apps/mobile/src/app/(app)/<route>.tsx` and/or `apps/web/src/app/(app)/<route>.tsx` (per
   `Platforms:`), `export { XScreen as default } from '@starter/features';`. `(app)` is behind the
   session guard; public screens go next to `sign-in.tsx`.
10. **Navigation** — a top-level screen gets one entry in `app/navigation/destinations.ts` (drives
    mobile tabs and the web sidebar) plus its label in `common.json` → `tabs`. Navigate with
    `Link` / `router` from `expo-router`.
11. **Tests** — every `AC-n` maps to a Jest test named `AC-n: …` in `__tests__/`, using
    `renderWithProviders` + `setupMockApi` from `@app/testing/test-utils` (inside the package) —
    RNTL v14 is async (`await render`, `await user.press`). User journeys get a Maestro flow
    (`e2e/mobile/flows/`) and/or a Playwright spec (`e2e/web/tests/`). Follow any standing
    instruction from the user that pauses test writing.
12. **Check** — `pnpm format && pnpm verify`; `pnpm test:e2e:web` when web behaviour changed.
    After adding a library with native code: `pnpm expo:doctor` and rebuild the dev client.

## Where code goes

| It is…                                           | Put it in                                              |
| ------------------------------------------------ | ------------------------------------------------------ |
| Used by one feature                              | that feature's folder                                  |
| Generic UI (no feature knowledge)                | `packages/ui/src/{primitives,components,layout,hooks}` |
| Non-UI platform helper (env, errors, formatting) | `packages/core/src`                                    |
| Networking (base query, errors, mock fetch)      | `packages/api-client/src`                              |
| App wiring (store, providers, i18n, navigation)  | `packages/features/src/app`                            |
| App-specific chrome (tabs, sidebar)              | `apps/<app>/src/shell`                                 |
| Needed by two features                           | move it down a layer — never copy it                   |

## Imports (ESLint enforces these)

- Absolute, never `../`: `@app/…`, `@features/<name>/…` (own feature), `@ui/…`, `@core/…`,
  `@api-client/…` inside their package; `./x` only within one folder.
- Other packages only via `@starter/<pkg>` entry points (`@starter/ui`, `@starter/core/env`, …).
- Another feature only via `@features/<name>` (its `index.ts`) — export what it needs there.
  Only `app/registry.ts` imports `@features/<name>/feature`.
- Layers: `apps → features → api-client → core`, `features → ui`. `ui`, `core`, `api-client`
  never import `features`.
- Adding an alias means updating `packages/tooling/aliases.js`, `tooling/tsconfig.base.json` and
  `apps/*/tsconfig.json` together.

## Done means

- [ ] `pnpm verify` passes (lint, typecheck, format, unit + script tests)
- [ ] No hard-coded UI text; strings in `locales/en.json`
- [ ] Every endpoint has a mock handler; every response is Zod-parsed
- [ ] Screen title testID, 44pt targets, light + dark checked
- [ ] Both apps updated if `Platforms: both`
- [ ] Any decision that changed the stack or structure has an ADR
