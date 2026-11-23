# ADR-0004: pnpm workspaces (hoisted, catalogs) with no task runner

Status: Accepted · Date: 2026-11-23 · Implemented on `feat/monorepo-starter`

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q6, Q14.

## Context

Expo SDK 58 supports npm, Yarn (Classic and Berry), pnpm and Bun workspaces.

- **npm:** no new tooling, hoisted by default; no catalogs, no changed-package filtering.
- **Yarn Classic:** frozen. **Yarn Berry:** constraints and `foreach --since`, but PnP is
  incompatible with React Native (needs `nodeLinker: node-modules`) and adds `.yarnrc.yml` /
  `.yarn/` upkeep.
- **pnpm:** fastest, shared content-addressed store, catalogs, `--filter`. Default isolated
  installs carry some risk with community native libraries.

Task runners: Turborepo (caching) or Nx (heavy) vs pnpm alone. With source-only packages
(ADR-0003) there are no build tasks — only lint, typecheck and test.

## Decision

- **pnpm** workspaces with **`nodeLinker: hoisted`**.
- **Catalogs** pin `react`, `react-native` and `expo` once in `pnpm-workspace.yaml`; workspaces use
  `"catalog:"`.
- pnpm version pinned through the `packageManager` field (Corepack); Node pinned via `.nvmrc` /
  `engines`.
- **No task runner.** Root scripts use `pnpm -r` and `pnpm --filter "...[origin/main]"`.

## Consequences

- One React / React Native version across the repo, enforced by catalogs.
- Hoisting means pnpm's strict isolation is off — phantom dependencies are not caught.
- Each developer runs `corepack enable` once.
- All docs and commands switch from `npm`/`npx` to `pnpm`/`pnpm dlx`.
- Isolated installs and Turborepo remain options for later ADRs.

## Implementation notes (2026-11-23)

- Implemented with pnpm 12.21.0 (Corepack). pnpm 12 runs dependency build scripts only when allowed: `allowBuilds` denies `@parcel/watcher` and `lefthook` (not needed) and allows `@sentry/cli` (fetches its binary).
- Native-only packages used by shared code are optional peer dependencies of `@starter/features`, so the web app does not need them.
- The `doctor` script is `expo:doctor` — pnpm 12 has a built-in `pnpm doctor`.
- Hardening: `react-native-drawer-layout` (used by expo-router) requires gesture-handler and reanimated (→ worklets); pnpm auto-installed **newer, SDK-incompatible** versions (3.5.0 / 4.8.0 / 0.14.0) that were compiled into the APK. They are now pinned at the SDK 58 versions via `expo install` (3.3.0 / 4.7.1 / 0.13.0) in the catalog and declared by both apps, so `expo-doctor` checks them.
- Audit (2026-11-23): 2 moderate advisories, both in build / test tooling only — `glob` (via Jest) and `minimatch` (via Jest and `@expo/fingerprint`). Not shipped in the app; patched versions are major bumps, so no overrides — wait for upstream Jest / Expo releases. Re-run `pnpm audit` before releases.
