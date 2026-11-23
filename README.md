# Katon

Cross-platform mobile app (iOS · Android) built with Expo SDK 58, React Native 0.88, TypeScript and Expo Router —
set up for AI-assisted delivery from requirement to release.

## Quick start

```bash
npm install
npm start            # Expo dev server — press i (iOS) / a (Android)
```

## Scripts

| Command                  | What it does                                            |
| ------------------------ | ------------------------------------------------------- |
| `npm start`              | Start the dev server                                    |
| `npm test`               | Unit + component tests (Jest + RNTL)                    |
| `npm run test:coverage`  | Tests with coverage report in `coverage/`               |
| `npm run test:e2e`       | All Maestro flows against an installed build            |
| `npm run test:e2e:smoke` | Only `smoke`-tagged flows                               |
| `npm run lint`           | ESLint (expo config + prettier)                         |
| `npm run typecheck`      | `tsc --noEmit`                                          |
| `npm run verify`         | lint + typecheck + format check + tests — run before PR |

## How we build features (with AI)

```
/requirement <idea>  →  docs/01-requirements/REQ-001-*.md   (human approves)
/plan REQ-001        →  docs/02-plans/PLAN-001-*.md         (human approves)
/design REQ-001      →  docs/03-design/DES-001-*.md         (human approves)
/implement REQ-001   →  src/features/<slug>/ + tests        (test-first)
/test REQ-001        →  e2e/flows/*.yaml + coverage gaps
/ship minor          →  version bump, changelog, release notes
```

Details: [docs/README.md](docs/README.md) · agent rules: [AGENTS.md](AGENTS.md) · E2E: [e2e/README.md](e2e/README.md).

## Testing layers

| Layer      | Tool                            | Location                        | Runs in CI               |
| ---------- | ------------------------------- | ------------------------------- | ------------------------ |
| Unit       | Jest (`jest-expo`)              | `src/**/__tests__`, `*.test.ts` | every PR                 |
| Component  | React Native Testing Library 14 | `src/**/__tests__/*.test.tsx`   | every PR                 |
| End-to-end | Maestro                         | `e2e/flows/*.yaml`              | manual / `run-e2e` label |

## Stack decisions

See [docs/04-adr](docs/04-adr).
