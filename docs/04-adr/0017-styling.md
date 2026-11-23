# ADR-0017: StyleSheet with theme tokens

Status: Accepted · Date: 2026-11-23 · Implemented on `feat/monorepo-starter`

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q31.

## Context

Today the app uses `StyleSheet`, `ThemedText` / `ThemedView` and tokens in `constants/theme.ts`.
Options: extend that; Tailwind-style classes (NativeWind / Uniwind — fast, adds a Babel/Metro
transform); Unistyles 3 (themes and breakpoints, native code, smaller community); a component
library (Tamagui, gluestack-ui, Paper — fast start, opinionated, large upgrade surface).

## Decision

- `StyleSheet` + theme tokens in `packages/ui`: colour (light / dark), spacing, typography, radius.
- `useTheme()` and primitives: `ThemedText`, `ThemedView`, `Button`, `TextField`, `Card`,
  `Screen`, `Stack`, plus `ColorSchemeProvider` (theme preference on every platform).
- `useBreakpoint()` for responsive web layouts.

## Consequences

- No styling dependency to upgrade across SDK releases.
- Works wherever React Native works, including Windows / macOS.
- More hand-written styles; responsive helpers are ours to maintain.
- A project preferring Tailwind can switch via ADR.

## Implementation notes (2026-11-23)

- `Screen`, `Stack` and `Card` exist in `@starter/ui` (tested) but the starter screens have not been migrated to them yet — deferred while the focus is the framework setup.
- Breakpoints: `sm` < 768, `md` ≥ 768, `lg` ≥ 1024 (`useBreakpoint`, `useMinWidth`).
