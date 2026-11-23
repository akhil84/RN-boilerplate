# @starter/features

Feature screens and logic shared by `apps/mobile` and `apps/web`. One folder per feature, named
after the requirement slug (`REQ-007-user-login` → `user-login/`).

```
packages/features/src/<slug>/
  components/      UI used only by this feature
  hooks/           feature hooks (state, data fetching)
  services/        RTK Query endpoints, persistence, pure business logic
  types.ts         feature types
  index.ts         public API — the only file other code may import from
  __tests__/       unit + component tests (*.test.ts / *.test.tsx), named `AC-n: ...`
```

Rules

- Features live here, never in `apps/`. Route files in `apps/*/src/app/` stay thin: they import a
  screen from `@starter/features` and render it.
- Every feature is re-exported from `src/index.ts`. Features never import another feature's
  internals — only its `index.ts`.
- Import shared UI from `@starter/ui`, networking from `@starter/api-client`. Use relative imports
  inside this package (no `@/` alias — the apps' bundler does not apply package-local aliases).
- Tests run on the iOS and Android renderers (`jest.config.js`). RNTL cannot render
  react-native-web output, so web rendering is covered by end-to-end tests.
- User-facing strings go in `<feature>/locales/en.json` (registered in `src/i18n/resources.ts`)
  and are read with `useTranslation('<feature>')` — keys are type-checked (ADR-0012).
- Analytics events are declared in `src/analytics-events.ts` before being tracked (ADR-0014).
  Report handled errors with `reportError` from `@starter/core/observability` (ADR-0013).

State (ADR-0007, ADR-0009)

- `src/store/` holds the single Redux store: RTK Query's `api` reducer plus app-wide slices
  (e.g. `preferences`). Feature-only slices live in their feature and are added to `rootReducer`.
- Persisted slices are listed in `persistedSlices`. When a persisted slice changes shape, bump
  `PERSIST_VERSION` and add a migration. Never persist secrets.
- Use `useAppDispatch` / `useAppSelector`. Server data comes from RTK Query endpoints added with
  `api.injectEndpoints` — never copy it into a slice.
- Component tests use `renderWithProviders` from `@starter/features/test-utils` (fresh store per
  test).
