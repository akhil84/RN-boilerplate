# @starter/core

Runtime platform code every package and app can use — no UI, no feature logic (ADR-0026).

| Import                        | What                                                                 |
| ----------------------------- | -------------------------------------------------------------------- |
| `@starter/core/env`           | `getEnv()` — Zod-validated `EXPO_PUBLIC_*` config; `getAppVariant()` |
| `@starter/core/observability` | `reportError`, `ErrorBoundary`, `initErrorReporting`, `analytics`    |

`core` sits at the bottom of the layers: it imports no other workspace package. Put pure,
dependency-free helpers shared by several features here (e.g. `src/lib/format-date.ts`) rather than
copying them between features.
