# Features

One folder per feature, named after the requirement slug (`REQ-007-user-login` → `user-login/`).

```
src/features/<slug>/
  components/      UI used only by this feature
  hooks/           feature hooks (state, data fetching)
  services/        API calls, persistence, pure business logic
  types.ts         feature types
  index.ts         public API — the only file other code may import from
  __tests__/       unit + component tests (*.test.ts / *.test.tsx)
```

Rules

- Route files in `src/app/` stay thin: they import a screen from `@/features/<slug>` and render it.
- Features never import from another feature's internals — only from its `index.ts`.
- Shared, generic UI goes in `src/components/ui`; shared non-UI code in `src/services` / `src/utils`.
