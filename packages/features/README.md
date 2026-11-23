# @starter/features

Everything shared by `apps/mobile` and `apps/web` above the design system: app infrastructure in
`src/app/` and one folder per feature in `src/features/` (ADR-0026).

```
src/
  app/                     infrastructure — not a feature
    store/                 configureStore, typed hooks, persistence, DevTools
    providers/             AppProviders, RootNavigator (session guard), ErrorFallback
    navigation/            destinations (top-level screens for both apps), screen tracking
    i18n/                  i18next setup; namespaces come from the registry
    mocks/                 mock API wiring + shared mock helpers
    testing/               renderWithProviders, setupMockApi  (→ @starter/features/test-utils)
    feature.ts             defineFeature() — the manifest type
    registry.ts            THE list of features
  features/<name>/
    screens/               route-level screens (exported from index.ts)
    components/            UI used only by this feature
    hooks/                 feature hooks
    api/                   RTK Query endpoints (`api.injectEndpoints`) + Zod response schemas
    model/                 Redux slices owned by the feature
    services/              non-UI logic, platform adapters (.native.ts / .web.ts)
    locales/en.json        strings (namespace = feature name)
    mocks/handlers.ts      mock API handlers for this feature's endpoints
    analytics.ts           analytics events this feature sends (augments AnalyticsEventMap)
    types.ts               feature types
    feature.ts             manifest: defineFeature({ name, translations, slices, mockHandlers })
    index.ts               public API — the only thing other features and apps import
    __tests__/             unit + component tests, named `AC-n: …`
  index.ts                 package entry (re-exports app/ and every feature's index)
```

## Adding a feature

```bash
pnpm new:feature order-history
```

Creates the folder with a screen, strings, mock handlers, manifest and public entry, and adds it
to `app/registry.ts` and `src/index.ts`. Add the route files in both apps; for a top-level screen,
add an entry to `app/navigation/destinations.ts`. Only create the sub-folders you need.

## Rules (ESLint enforces the import ones)

- Absolute imports: `@app/…` for infrastructure, `@features/<name>` for features, `./x` only within a
  folder. Never `../`.
- Another feature is used only through `@features/<name>` (its `index.ts`) — never its internals.
  Only `app/registry.ts` imports `@features/<name>/feature`.
- A feature registers its slices, strings and mock handlers in `feature.ts` — never by editing the
  store, i18n or mocks setup.
- Server data comes from RTK Query endpoints in `api/` — never copy it into a slice. Persisted
  slices are listed in `app/store/store.ts` (`persistedSlices`); bump `PERSIST_VERSION` and add a
  migration when a persisted slice changes shape. Never persist secrets.
- Generic UI belongs in `@starter/ui`, non-UI platform code in `@starter/core`; if two features
  need the same helper, move it down a layer instead of copying it.
- Tests run on the iOS and Android renderers; web rendering is covered by Playwright. Use
  `renderWithProviders` and `setupMockApi` from `@starter/features/test-utils`.
