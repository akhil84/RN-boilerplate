This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Katon project rules

### Where things go

```
docs/                 requirements → plans → design → ADRs → releases (see docs/README.md)
src/app/              Expo Router routes only — thin files that render a feature screen
src/features/<slug>/  feature code + its __tests__ (see src/features/README.md)
src/components/       shared UI (generic pieces in src/components/ui)
src/services/         cross-feature non-UI code (API client, storage, analytics)
src/store/            app-wide client state
src/hooks/ utils/ constants/ types/
src/test/             Jest setup + renderWithProviders test utils
e2e/                  Maestro flows (e2e/flows) and reusable steps (e2e/subflows)
.claude/commands/     /requirement /plan /design /implement /test /ship /adr
```

### Workflow

Requirement → Plan → Design → Implement → Test → Ship. Each stage is one doc in `docs/`; a human sets
`Status: Approved` before the next stage starts. Never approve your own output, never build from a `Draft`.

### Testing rules

- Test-first. Every acceptance criterion (`AC-n`) maps to at least one Jest test named `AC-n: ...`.
- Component tests use `renderWithProviders` from `@/test/test-utils`. RNTL v14 is async:
  `await render(...)`, `await user.press(...)`. Follow `node_modules/@testing-library/react-native/docs/guides/llm-guidelines.md`.
- Every screen title has a `testID` (`<screen>-title`); every user journey has a Maestro flow in `e2e/flows/`.
- `npm run verify` (lint + typecheck + format + unit tests) must pass before a task is done.
  Do not skip, delete, or `.only` tests, and do not disable lint rules, to get green.

### Safety

- Never commit secrets; use `.env*.local` (git-ignored) and EAS secrets.
- Do not run `eas build`, `eas submit`, `eas update`, or push to `main` unless explicitly asked.
