# ADR-0001: Expo + React Native + TypeScript as the app stack

Status: Accepted · Date: 2026-11-23

## Context

Katon is a cross-platform mobile app built largely with AI assistance. We want one codebase,
fast iteration, cloud builds, and tooling that agents can drive from the command line.

## Decision

- **Expo SDK 58** (React Native 0.88, React 19.3) with **Continuous Native Generation** — `ios/` and
  `android/` are generated, never committed.
- **Expo Router** for file-based navigation in `src/app/`.
- **TypeScript strict** everywhere.
- **Feature folders** in `src/features/<slug>/` for business logic; `src/app/` holds thin route files.
- **Testing:** Jest (`jest-expo`) + React Native Testing Library v14 for unit/component tests;
  **Maestro** for end-to-end flows on real builds.
- **EAS** for builds, store submission and OTA updates.

## Consequences

- Native changes go through `app.json` / config plugins, not hand-edited native code.
- Libraries with native code need a development build (not Expo Go).
- Maestro flows are YAML, easy for agents to write and for humans to review.
