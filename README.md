# Starter App

Starter template for cross-platform apps — iOS and Android (`apps/mobile`) and web (`apps/web`) —
built with Expo SDK 58, React Native 0.88, TypeScript and Expo Router, sharing screens and logic
from `packages/*`. Set up for AI-assisted delivery from requirement to release.

Decisions behind this layout: [docs/00-product/monorepo-starter-decisions.md](docs/00-product/monorepo-starter-decisions.md)
and [docs/04-adr](docs/04-adr).

## Start a new project from this template

1. On GitHub, **Use this template** → create the project repo, then clone it.
2. `corepack enable && pnpm install`
3. `pnpm init:project` — asks for the app name, slug, bundle ID and npm scope (and optionally the
   EAS project ID), replaces every `Starter App` placeholder, resets the changelogs and vision,
   then removes itself.
4. `pnpm install && pnpm verify`, then commit.

## Quick start

```bash
corepack enable      # once per machine — uses the pnpm version pinned in package.json
pnpm install
pnpm mobile          # Expo dev server for iOS / Android — press i or a
pnpm web             # Expo dev server for web
```

## Development builds (no Expo Go)

The mobile app uses native modules that Expo Go does not include (secure storage, Google sign-in,
Sentry, push), so it runs in a **development build** (ADR-0025):

```bash
pnpm --filter @starter/mobile ios        # build + install a dev build locally (Xcode)
pnpm --filter @starter/mobile android    # same for Android (Android Studio / SDK)
pnpm mobile                              # then start Metro; the dev build connects to it
```

The first local Android build takes 10–20 minutes (release builds compile native code for four
CPU architectures). For local testing, build only your emulator's architecture — roughly 3× faster
native compile; EAS store builds still include all of them:

```bash
ORG_GRADLE_PROJECT_reactNativeArchitectures=arm64-v8a pnpm --filter @starter/mobile android
```

Or build in the cloud: `pnpm dlx eas-cli build --profile development` from `apps/mobile`
(`development-simulator` for an iOS simulator build). Web needs no native build: `pnpm web`.

Sign in with any email and the password `password` — the in-app mock API
(`EXPO_PUBLIC_API_MOCKS=true` in `apps/*/.env`) answers until a real backend is configured.

## Over-the-air updates and push (per project)

Both are wired but inactive until the project is connected to EAS:

1. `pnpm dlx eas-cli init` in `apps/mobile`, then put the project ID in `EAS_PROJECT_ID`
   (`apps/mobile/app.config.ts`). This turns on EAS Update (one channel per build profile,
   `fingerprint` runtime versions) and Expo push tokens.
2. Push credentials: an APNs key (`eas credentials`) and, for Android, `google-services.json`
   uploaded as the `GOOGLE_SERVICES_JSON` EAS file variable.
3. Point `DEVICES_PATH` (`packages/features/src/notifications/devices-api.ts`) at your backend.
   Users opt in from Settings; notification taps open `data.url` (internal paths only).

Publishing an update, from `apps/mobile` — always set the variant and environment to match the
channel, or the update is built with development config (dev bundle ID, mocks on):
`APP_VARIANT=<variant> EXPO_PUBLIC_APP_VARIANT=<variant> pnpm dlx eas-cli update --channel <variant> --environment <variant>`, then `pnpm sentry:upload-update` if Sentry is set up (builds upload their source maps
automatically; updates need this step). Agents print these commands; they never run them.

## Error reporting (Sentry, optional)

Off until configured (ADR-0013). Set `EXPO_PUBLIC_SENTRY_DSN` in `apps/*/.env` (or answer the DSN
question in `pnpm init:project`), and `SENTRY_ORG`, `SENTRY_PROJECT` plus a secret
`SENTRY_AUTH_TOKEN` in the EAS environment to upload source maps from builds.

## Web sign-in tokens

The web app stores tokens per `EXPO_PUBLIC_WEB_AUTH_MODE` in `apps/web/.env` (ADR-0015):

- `local` (default) — localStorage. Works with any backend, but any XSS or compromised third-party
  script can read the tokens.
- `cookie` — **recommended whenever your backend supports it**: the refresh token lives in an
  httpOnly cookie JavaScript cannot read, and the access token only in memory. The backend must set
  the cookie on `/auth/login` and `/auth/refresh`, allow credentialed CORS from the web origin, and
  protect against CSRF.

## Layout

```
apps/mobile          Expo app — iOS + Android
apps/web             Expo app — web (single-page app)
packages/features    feature screens + logic (shared)
packages/ui          theme tokens, themed primitives, test-utils
packages/api-client  networking (RTK Query base API)
packages/config      shared eslint / tsconfig / jest presets
```

## Scripts

| Command                    | What it does                                            |
| -------------------------- | ------------------------------------------------------- |
| `pnpm mobile` / `pnpm web` | Start a dev server                                      |
| `pnpm test`                | Unit + component tests in every workspace (Jest + RNTL) |
| `pnpm test:coverage`       | Tests with coverage per workspace                       |
| `pnpm test:e2e:mobile`     | All Maestro flows against an installed build            |
| `pnpm lint`                | ESLint in every workspace                               |
| `pnpm typecheck`           | `tsc --noEmit` in every workspace                       |
| `pnpm expo:doctor`         | expo-doctor for both apps                               |
| `pnpm verify`              | lint + typecheck + format check + tests — run before PR |

## How we build features (with AI)

```
/requirement <idea>  →  docs/01-requirements/REQ-001-*.md   (human approves)
/plan REQ-001        →  docs/02-plans/PLAN-001-*.md         (human approves)
/design REQ-001      →  docs/03-design/DES-001-*.md         (human approves)
/implement REQ-001   →  packages/features/src/<slug>/ + tests        (test-first)
/test REQ-001        →  e2e/mobile/flows/*.yaml + coverage gaps
/ship mobile minor   →  version bump, per-app changelog, release notes
```

Details: [docs/README.md](docs/README.md) · agent rules: [AGENTS.md](AGENTS.md) · E2E: [mobile](e2e/mobile/README.md), [web](e2e/web/README.md).

## Testing layers

| Layer      | Tool                            | Location                         | When          |
| ---------- | ------------------------------- | -------------------------------- | ------------- |
| Unit       | Jest (`jest-expo`)              | `**/src/**/__tests__`            | pre-push hook |
| Component  | React Native Testing Library 14 | `**/src/**/__tests__/*.test.tsx` | pre-push hook |
| End-to-end | Maestro                         | `e2e/mobile/flows/*.yaml`        | manual        |

## Stack decisions

See [docs/04-adr](docs/04-adr).

## Git hooks (no CI)

There is no CI yet (ADR-0021). `pnpm install` installs [lefthook](https://lefthook.dev) hooks:

- **pre-commit:** Prettier (auto-fixes and re-stages) + ESLint on staged files, per workspace.
- **pre-push:** `pnpm verify:changed` — lint, typecheck and tests for workspaces changed since
  `origin/main`.

To add CI later, see [docs/guides/adding-ci.md](docs/guides/adding-ci.md).
