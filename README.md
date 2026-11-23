# Starter App

Starter template for cross-platform apps — iOS and Android (`apps/mobile`) and web (`apps/web`) —
built with Expo SDK 58, React Native 0.88, TypeScript and Expo Router, sharing screens and logic
from `packages/*`. Set up for AI-assisted delivery from requirement to release.

Decisions behind this layout: [docs/00-product/monorepo-starter-decisions.md](docs/00-product/monorepo-starter-decisions.md)
and [docs/04-adr](docs/04-adr).

## Quick start

```bash
corepack enable      # once per machine — uses the pnpm version pinned in package.json
pnpm install
pnpm mobile          # Expo dev server for iOS / Android — press i or a
pnpm web             # Expo dev server for web
```

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
/ship minor          →  version bump, changelog, release notes
```

Details: [docs/README.md](docs/README.md) · agent rules: [AGENTS.md](AGENTS.md) · E2E: [e2e/mobile/README.md](e2e/mobile/README.md).

## Testing layers

| Layer      | Tool                            | Location                         | Runs in CI               |
| ---------- | ------------------------------- | -------------------------------- | ------------------------ |
| Unit       | Jest (`jest-expo`)              | `**/src/**/__tests__`            | every PR                 |
| Component  | React Native Testing Library 14 | `**/src/**/__tests__/*.test.tsx` | every PR                 |
| End-to-end | Maestro                         | `e2e/mobile/flows/*.yaml`        | manual / `run-e2e` label |

## Stack decisions

See [docs/04-adr](docs/04-adr).
