// Public API of @starter/features (ADR-0026). Apps import only from here (and the
// `@starter/features/test-utils` entry in tests). Inside the package, features import each other
// only through `features/<name>/index.ts` — never through another feature's internal paths.
export * from './app';
export * from './features/auth';
export * from './features/home';
export * from './features/notifications';
export * from './features/settings';
// new-feature:exports (do not remove — `pnpm new:feature` inserts above this line)
