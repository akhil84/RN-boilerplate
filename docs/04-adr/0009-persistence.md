# ADR-0009: AsyncStorage + redux-persist for persisted state

Status: Accepted · Date: 2026-11-23 · Implemented on `feat/monorepo-starter`

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q22, Q23.

## Context

Storage options: AsyncStorage (works in Expo Go and on web via `localStorage`); MMKV (sync, fast,
needs dev builds); `expo-sqlite` key-value store (first-party, web support via WASM).

Redux persistence options: `redux-persist` (standard, but barely maintained and noisy with RTK's
serializability check); a ~60-line custom layer on `listenerMiddleware` (recommended at the time);
persisting nothing in Redux.

## Decision

- **AsyncStorage** for general persisted data.
- **redux-persist** (owner's choice) with:
  - an explicit whitelist of persisted slices;
  - `PersistGate` holding render until state is restored (the splash stays up until the session
    status is known);
  - RTK serializability check configured to ignore redux-persist actions;
  - versioned migrations for state-shape changes.
- Secrets never go in AsyncStorage (see ADR-0015).

## Consequences

- Works on every platform including web and Electron.
- Depends on a barely-maintained library; replacing it with the listener-based approach remains
  open via a later ADR.
- Large local datasets would need MMKV or SQLite via ADR.

## Implementation notes (2026-11-23)

- Implemented as decided. `PERSIST_VERSION` is 2: v2 added `preferences.language` with a migration that keeps the saved theme (tested).
- `makeStore({ persistTimeoutMs })`: the app keeps redux-persist's 5 s storage timeout; tests pass 0 so no timer outlives a test.
