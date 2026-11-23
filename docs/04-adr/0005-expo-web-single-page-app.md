# ADR-0005: Web app built with Expo web as a single-page app

Status: Accepted · Date: 2026-11-23 · Implemented on `feat/monorepo-starter`

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q9, Q10.

## Context

A future Electron desktop app (Windows, macOS) is possible. Options for `apps/web`:

- **Expo web:** reuses shared React Native screens; renders with `react-dom` and exports plain
  HTML/JS/CSS that Electron can load.
- **Vite + React DOM with its own UI:** full web libraries (shadcn, MUI), but every screen is built
  twice and shares only non-UI code.
- **Vite + React rendering shared screens via react-native-web:** takes on integration work Expo
  does today; `expo-router` and many `expo-*` modules would be unusable in shared code.

Rendering modes: `static` (per-route HTML, SEO), `single` (SPA), `server` (needs a Node host).

## Decision

- `apps/web` is an **Expo** app (web only) using shared screens from `@starter/features`.
- `web.output: "single"` — a classic SPA served from any static host.

## Consequences

- Screens are written once for iOS, Android, web and a future desktop app.
- Desktop stays open via Electron or React Native for Windows / macOS.
- One route model (Expo Router) for browser, deep links and Electron.
- `testID` → `data-testid`, so Maestro and Playwright share selectors.
- Web UI is built from React Native primitives; web-only needs use `.web.tsx` or Expo DOM
  components.
- No per-route HTML: weaker SEO and link previews. Switching to `static` needs an ADR.
- Best suited to mobile-first products; web-first products would favour a React DOM app.

## Implementation notes (2026-11-23)

- Implemented as decided; the export is one `index.html` plus assets. Web routes are protected the same way as mobile (`Stack.Protected`).
- Covered by Playwright (`e2e/web`), verified in Chromium and WebKit.
- Bundle baseline (2026-11-23, production export): web 3.6 MB JS raw / **880 KB gzip** in 8 files (largest shared chunk 2.5 MB raw); Android Hermes bundle 5.8 MB; arm64 release APK 34 MB. Likely biggest web contributor: the Sentry browser SDK, loaded even when Sentry is off — candidate follow-up: load it only when a DSN is configured.
- Follow-up done: the Sentry SDK is now a separate chunk on web, downloaded only when a DSN is configured. Startup JS dropped from all 880 KB gzip to **498 KB gzip** (2.0 MB raw); total stays ~881 KB across 9 files.
