This is a pnpm monorepo of Expo/React Native apps (`apps/mobile` for iOS + Android, `apps/web` for web) sharing code from `packages/*`. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of `expo` in the `catalog:` of `pnpm-workspace.yaml`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

This repo uses **pnpm** (`pnpm-lock.yaml`). Use `pnpm`/`pnpm dlx`, never npm/npx/yarn/bun for installs.

```bash
pnpm --filter @starter/mobile exec expo install <pkg>  # add an Expo-compatible package to an app
pnpm --filter @starter/mobile start                     # mobile dev server (or: pnpm mobile)
pnpm --filter @starter/web start                        # web dev server (or: pnpm web)
pnpm lint | pnpm typecheck | pnpm test                  # every workspace
pnpm --filter <workspace> test                          # one workspace
pnpm expo:doctor                                        # expo-doctor for both apps
pnpm verify                                             # lint + typecheck + format + tests
pnpm new:feature <name>                                 # scaffold + register a feature
pnpm test:e2e:web                                       # Playwright (starts its own server)
pnpm test:e2e:mobile                                    # Maestro (needs a booted device + dev build)
```

Versions shared across workspaces (react, react-native, expo, …) live once in the `catalog:` of
`pnpm-workspace.yaml`; workspaces reference them as `"catalog:"`. After `expo install` adds a
package to an app, move its version into the catalog if more than one workspace uses it.

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `apps/<app>/src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Route files stay thin: they render a screen from `@starter/features`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI from the app directory as `pnpm dlx eas-cli <command>`; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `apps/mobile/app.json` and config plugins.
- Expo Go is **not supported** (ADR-0025): the mobile app runs in a development build (`pnpm --filter @starter/mobile ios|android`, or `eas build --profile development`). Rebuild it after adding a library with native code.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Project rules

### Where things go

```
docs/                    requirements → plans → design → ADRs (see docs/README.md)
apps/mobile/             Expo app, iOS + Android — routes (src/app), shell (src/shell), app.config.ts, eas.json
apps/web/                Expo app, web single-page app — routes (src/app), responsive shell (src/shell)
packages/features/
  src/app/               infrastructure: store, providers (AppProviders, RootNavigator), navigation
                         (destinations), i18n, mocks, testing, registry.ts (the list of features)
  src/features/<name>/   one feature: screens/ components/ hooks/ api/ model/ services/ locales/
                         mocks/ analytics.ts types.ts feature.ts (manifest) index.ts (public API)
packages/ui/             tokens/ hooks/ primitives/ components/ layout/ testing/
packages/api-client/     RTK Query `api`, baseQuery (auth, refresh, retry, ApiError), mock fetch — no UI
packages/core/           runtime platform code: env (Zod), observability (errors, analytics) — no UI
packages/tooling/        dev-only: eslint / tsconfig / jest presets, path aliases, boundary rules
e2e/mobile/  e2e/web/    Maestro flows · Playwright specs
scripts/                 new-feature.mjs (`pnpm new:feature`), init-project.mjs (one-time)
.claude/commands/        /requirement /plan /design /implement /test /ship /adr
```

- **New feature:** `pnpm new:feature <name>` — scaffolds the folder and registers it. Never put
  feature code in `apps/`; route files only render a screen from `@starter/features`.
- **Layers** (enforced by ESLint, ADR-0026): `apps → features → api-client → core`, `features → ui`.
  `ui`, `core` and `api-client` never import `features`; `core` imports no other package.
- **Imports:** absolute, no `../`. Inside a package use its alias — `@app/…` and `@features/<name>`
  (features), `@ui/…`, `@core/…`, `@api-client/…`. Across packages use `@starter/<pkg>` entry
  points only. Same-folder `./x` imports are fine. Aliases live in `packages/tooling/aliases.js`
  (mirrored in tooling/tsconfig.base.json and apps/*/tsconfig.json).
- **Between features:** only through the other feature's public entry `@features/<name>` (its
  `index.ts`). `app/registry.ts` is the only file that imports `@features/<name>/feature`.
- **Registry, not edits:** a feature's reducers (`slices`), translations and mock handlers go in its
  `feature.ts`; the store, i18n and mock API pick them up from `app/registry.ts`. Top-level screens
  go in `app/navigation/destinations.ts` (drives both mobile tabs and the web sidebar).
- **Shared code:** generic UI → `@starter/ui`; non-UI platform code → `@starter/core`; networking →
  `@starter/api-client`. Don't duplicate a helper in two features — move it down a layer.
- Platform-specific code uses `.native.ts` / `.web.ts` plus a plain `.ts` entry for the type
  checker. No browser-only APIs (`window`, `document`, `localStorage`) outside `.web.ts` files —
  shared code must stay safe for mobile and a future desktop app (ADR-0024).

### Skills

`.claude/skills/` holds the project skill `feature-development` (how to build a feature here —
start with it), vendored Expo, Callstack and agent-skills skills, and the Redux Toolkit skills
that pnpm links from `@reduxjs/toolkit` on install (sources in
`.claude/skills/THIRD_PARTY_NOTICES.md`). Where generic skill advice conflicts with the stack
below (Expo Go, React Query, Zustand, NativeWind, npm …), the stack wins.

### Stack (decided — change only through a new ADR in `docs/04-adr/`)

| Concern      | Use                                                                                                                                          | ADR        |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Client state | Redux Toolkit; typed `useAppDispatch` / `useAppSelector`                                                                                     | 0007       |
| Server data  | RTK Query endpoints via `api.injectEndpoints` in the feature; never copy server data into a slice                                            | 0007       |
| HTTP         | `apiBaseQuery` (bearer auth, refresh on 401, retries idempotent requests only); errors are `ApiError`                                        | 0008       |
| Persistence  | redux-persist on AsyncStorage — list slices in `persistedSlices`, bump `PERSIST_VERSION` + migration on shape changes; never persist secrets | 0009       |
| Forms        | No form library: controlled inputs + Zod + `TextField`                                                                                       | 0010       |
| Config       | `getEnv()` from `@starter/core/env`; add new `EXPO_PUBLIC_*` keys to its Zod schema and `readRawEnv` (static access only)                    | 0011       |
| Copy         | i18next: strings in `<feature>/locales/en.json`, `useTranslation('<feature>')`; no hard-coded UI text                                        | 0012       |
| Errors       | `reportError` / `ErrorBoundary` from `@starter/core/observability`; never import Sentry directly                                             | 0013       |
| Analytics    | `analytics.track` with events declared in the feature's `analytics.ts`                                                                       | 0014       |
| Auth         | session slice + `tokenStorage`; tokens never in Redux or AsyncStorage                                                                        | 0015, 0016 |
| Styling      | `StyleSheet` + tokens from `@starter/ui`; 44pt targets; light and dark                                                                       | 0017       |

New endpoints get a handler in the feature's `mocks/handlers.ts` (listed in its `feature.ts`) so the app, tests and E2E
run without a backend (`EXPO_PUBLIC_API_MOCKS`; ignored in production builds).

### Workflow

Requirement → Plan → Design → Implement → Test → Ship. Each stage is one doc in `docs/`; a human sets
`Status: Approved` before the next stage starts. Never approve your own output, never build from a `Draft`.
Requirements state `Platforms: mobile | web | both`, which decides the apps, layouts and E2E specs
every later stage must cover.

### Testing rules

- Test-first. Every acceptance criterion (`AC-n`) maps to at least one Jest test named `AC-n: ...`.
- Feature tests use `renderWithProviders` from `@starter/features/test-utils` (fresh store) and
  `setupMockApi(handlers?)` for network responses; generic UI tests use `@starter/ui/test-utils`.
  RNTL v14 is async: `await render(...)`, `await user.press(...)`. Follow
  `node_modules/@testing-library/react-native/docs/guides/llm-guidelines.md`.
- Shared packages run Jest on the iOS and Android renderers; RNTL cannot render react-native-web,
  so web rendering is covered by Playwright.
- Every screen title has a `testID` (`<screen>-title`). Every user journey has a Maestro flow
  (`e2e/mobile/flows/`) and/or a Playwright spec (`e2e/web/tests/`) per its `Platforms:`.
- Coverage is a ratchet: each workspace's `coverageThreshold` sits just below current coverage.
  Raise it when you add tests; never lower it. **Paused** during framework setup: `pnpm verify` runs
  tests without `--coverage` (ADR-0020); `pnpm test:coverage` still enforces the thresholds.
- `pnpm verify` (lint + typecheck + format + unit tests + script tests) must pass before a task is
  done; run `pnpm test:e2e:web` when web behaviour changed. There is no CI — lefthook runs checks
  on commit and push (ADR-0021). Do not skip, delete, or `.only` tests, disable lint rules, or use
  `--no-verify` to get green.

### Safety

- Never commit secrets; use `.env*.local` (git-ignored) and EAS environment variables.
  `EXPO_PUBLIC_*` values are public — they ship inside the app.
- Do not run `eas build`, `eas submit`, `eas update`, or push to `main` unless explicitly asked.
