# ADR-0025: Development builds only — Expo Go not supported

Status: Accepted · Date: 2026-11-23 · Implemented on `feat/monorepo-starter`

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q39.

## Context

Native Google Sign-In (ADR-0016), Sentry native crash capture (ADR-0013) and Android push tokens
(ADR-0019) are not available in Expo Go (to confirm for SDK 58). Options: development builds only;
keep Expo Go working with each native feature detecting it and switching off (more code paths,
and Expo Go differs from what ships).

## Decision

- `expo-dev-client` in `apps/mobile`; developers install a dev build once (`expo run:*` or
  `eas build --profile development`) and use `expo start --dev-client`.
- README, AGENTS.md and the init script state that Expo Go is not supported.

## Consequences

- First run takes longer for new developers (one native build).
- What developers run matches what ships.
- Web development needs no native build.

## Implementation notes (2026-11-23)

- Implemented as decided (`expo-dev-client`, `development` and `development-simulator` EAS profiles, `ios` / `android` scripts run `expo run:*`).
- First local Android release build ≈ 12 min; with `ORG_GRADLE_PROJECT_reactNativeArchitectures=arm64-v8a` incremental builds take seconds to ~2 min (README).
- The mobile root error fallback hides the splash screen, so an error during startup is visible instead of a splash that never goes away (code review).
