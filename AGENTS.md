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
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `pnpm --filter @starter/mobile exec expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Project rules

### Where things go

```
docs/                  requirements → plans → design → ADRs → releases (see docs/README.md)
apps/mobile/           Expo app, iOS + Android — routes (src/app) and native navigation only
apps/web/              Expo app, web only (single-page app) — routes and web layout only
packages/features/     feature screens + logic + __tests__ (see packages/features/README.md)
packages/ui/           design system: theme tokens, themed primitives, test-utils
packages/api-client/   RTK Query base API (networking, no UI)
packages/config/       shared eslint / tsconfig / jest presets
e2e/mobile/            Maestro flows (flows/) and reusable steps (subflows/)
.claude/commands/      /requirement /plan /design /implement /test /ship /adr
```

- Features live in `packages/features`, never in `apps/`.
- Inside `packages/*`, use relative imports (no `@/` alias). Import other packages by name
  (`@starter/ui`), only through their public entry points.

### Workflow

Requirement → Plan → Design → Implement → Test → Ship. Each stage is one doc in `docs/`; a human sets
`Status: Approved` before the next stage starts. Never approve your own output, never build from a `Draft`.

### Testing rules

- Test-first. Every acceptance criterion (`AC-n`) maps to at least one Jest test named `AC-n: ...`.
- Component tests use `renderWithProviders` from `@starter/ui/test-utils`. RNTL v14 is async:
  `await render(...)`, `await user.press(...)`. Follow `node_modules/@testing-library/react-native/docs/guides/llm-guidelines.md`.
- Every screen title has a `testID` (`<screen>-title`); every user journey has a Maestro flow in `e2e/mobile/flows/`.
- Shared packages run Jest on the iOS and Android renderers; RNTL cannot render react-native-web,
  so web rendering is covered by end-to-end tests.
- `pnpm verify` (lint + typecheck + format + unit tests) must pass before a task is done.
  Do not skip, delete, or `.only` tests, and do not disable lint rules, to get green.

### Safety

- Never commit secrets; use `.env*.local` (git-ignored) and EAS secrets.
- Do not run `eas build`, `eas submit`, `eas update`, or push to `main` unless explicitly asked.
