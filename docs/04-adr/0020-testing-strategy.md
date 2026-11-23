# ADR-0020: Jest per package, Maestro for mobile, Playwright for web

Status: Accepted · Date: 2026-11-23 · Implemented on `feat/monorepo-starter`

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q15, Q16.
Extends the testing section of ADR-0001.

## Context

Unit / component tests keep feedback fast, cover edge cases cheaply and back the test-first
`AC-n` workflow. Jest is required in practice: `jest-expo` is Expo's preset and React Native
Testing Library is built around Jest; Vitest, Node's and Bun's runners lack React Native support.

Jest structure: per-package configs with a shared preset vs one root config using `projects`.
Web E2E: Playwright; Maestro for web (newer, Chrome-only); none.

## Decision

- Shared Jest preset in `packages/config`; a small `jest.config.js` per workspace.
- `ui` and `features` run on the iOS and Android renderers. `jest-expo/universal` exists in SDK 58,
  but RNTL's test renderer only understands React Native host components and fails on
  react-native-web DOM output, so web rendering is covered by Playwright instead (verified
  during implementation, 2026-11-23).
- App route wiring is tested with `expo-router/testing-library` (`renderRouter`) in each app.
- `renderWithProviders` moves to `@starter/ui/test-utils` (adds Redux, i18n, safe area).
- `AC-n: …` test naming unchanged.
- E2E: **Maestro** in `e2e/mobile/`, **Playwright** in `e2e/web/`, sharing `testID`s.
- Each user journey gets a Maestro flow and/or Playwright spec per the requirement's
  `Platforms:`.

## Consequences

- Works with `pnpm --filter` for changed-package runs.
- Shared code is tested against both native renderers; web output relies on Playwright.
- Two E2E tools and formats (YAML and TypeScript).
- Playwright can later drive Electron.

## Implementation notes (2026-11-23)

- Playwright projects for Chromium, Firefox and WebKit; `pnpm test:e2e:web` runs Chromium. Verified in Chromium and WebKit (Firefox could not launch in the agent's sandbox).
- Maestro smoke flows verified on an Android 17 emulator (release build). The sign-in subflow hides the keyboard before tapping submit.
- Running on a device found a bug Jest cannot: NativeTabs `md` icons need `expo-symbols` on Android. Keep a device run in the release checklist.
- Coverage ratchet: each workspace's `jest.config.js` sets `coverageThreshold` just below its current coverage, and `pnpm verify` / `verify:changed` run with `--coverage`. Raise thresholds as coverage improves; never lower them to get green.
- Playwright Firefox cannot launch on this development Mac (macOS 27: "Could not find profile folder", also after a forced reinstall and outside the sandbox) — an environment incompatibility with Playwright's Firefox build. Chromium and WebKit pass 14/14.
- **Coverage gate paused** (owner's decision, 2026-11-23) while framework setup proceeds without new tests: `pnpm verify` / `verify:changed` (and so the pre-push hook) run tests without `--coverage`. Thresholds stay in each `jest.config.js` and are enforced by `pnpm test:coverage`; re-enable `--coverage` in `verify` once tests catch up (`@starter/config` is at 88% statements / 73.7% branches vs 90 / 75 after the lazy error reporter).
- **iOS verified** (2026-11-23, iPhone 18 Pro simulator, iOS 27.2, Xcode 27.2, Release build): both Maestro smoke flows pass, 0 JS errors. The sign-in subflow dismisses iOS's "Save Password?" sheet (iOS only), which otherwise covers Home and the tab bar.
