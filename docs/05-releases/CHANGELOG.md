# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · Versioning: SemVer (`app.json` → `expo.version`).

## [Unreleased]

### Changed

- Converted to a pnpm monorepo starter: `apps/mobile`, `apps/web`, `packages/{ui,features,api-client,config}`.
- Generic `Starter App` placeholder identity replaces Katon.

### Removed

- GitHub Actions workflows; replaced by lefthook pre-commit / pre-push hooks.

### Added

- State, networking and persistence: Redux Toolkit, RTK Query client with refresh on 401,
  redux-persist, Zod-validated env config, three app variants.
- i18n, Sentry error reporting (opt-in), vendor-neutral analytics.
- Auth: email/password and Google / Apple sign-in, secure token storage, protected routes, mock API.
- Sign-in, Home (example list) and Settings screens; responsive web navigation.
- EAS Update (fingerprint runtime, channel per profile), push notification plumbing, dev builds.

- Project scaffold: Expo SDK 58, Expo Router, Jest + RNTL, Maestro smoke flows, CI.
