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
- Tests run on iOS, Android and web renderers (`jest.config.js`), so platform files
  (`.web.tsx`, `.native.tsx`) are covered.
