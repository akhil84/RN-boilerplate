# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · Versioning: SemVer (`app.json` → `expo.version`).

## [Unreleased]

### Changed

- Converted to a pnpm monorepo starter: `apps/mobile`, `apps/web`, `packages/{ui,features,api-client,config}`.
- Generic `Starter App` placeholder identity replaces Katon.

### Removed

- GitHub Actions workflows; replaced by lefthook pre-commit / pre-push hooks.

### Added

- Project scaffold: Expo SDK 58, Expo Router, Jest + RNTL, Maestro smoke flows, CI.
