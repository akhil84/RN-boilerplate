# ADR-0013: Sentry for error reporting, behind a wrapper

Status: Accepted · Date: 2026-11-23 · Implemented on `feat/monorepo-starter`

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q27.

## Context

Options: Sentry (JS + native crashes, web support, source maps through EAS); Firebase Crashlytics
(free, strong native, no web support); a vendor-neutral interface only (projects still do the hard
integration work themselves).

## Decision

- `@sentry/react-native` with its Expo config plugin.
- Features use `reportError(error, context)` and `ErrorBoundary` from `packages/config`; nothing
  imports Sentry directly.
- Disabled unless `EXPO_PUBLIC_SENTRY_DSN` is set; `pnpm init:project` asks for a DSN optionally.
- The config plugin (build-time source map upload) is added only when `SENTRY_ORG` and
  `SENTRY_PROJECT` are set, so unconfigured release builds never fail on missing credentials.
- Source maps uploaded for EAS builds and EAS Updates.

## Consequences

- One tool across iOS, Android, web and a future Electron app.
- Requires a dev build (no Expo Go — ADR-0025).
- Paid above the free tier; self-hosting possible.
- Swapping vendors means rewriting only the wrapper.

## Implementation notes (2026-11-23)

- `@sentry/react-native` with `getSentryExpoConfig` in `apps/mobile/metro.config.js`.
- OTA updates: run `pnpm sentry:upload-update` (in `apps/mobile`) after `eas update` to upload that update's source maps — builds upload theirs through the config plugin.
- Sentry is mocked globally in Jest.
