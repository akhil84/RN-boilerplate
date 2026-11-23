# ADR-0007: Redux Toolkit for client state, RTK Query for server data

Status: Accepted · Date: 2026-11-23 · Implemented on `feat/monorepo-starter`

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q18, Q19, Q20.

## Context

Client state options: Zustand (minimal boilerplate, built-in persist; recommended at the time),
Redux Toolkit, Jotai, Context + `useReducer`. Server-data options: React Query
(`@tanstack/react-query`), RTK Query, SWR, OpenAPI-generated hooks.

React Query was first chosen, then revisited once Redux Toolkit was selected: keeping both means
two libraries, two providers and two devtools.

## Decision

- **Redux Toolkit** for client state (owner's choice over the Zustand recommendation).
- **RTK Query** for server data; React Query is not used.
- One `createApi` in `packages/api-client`; each feature adds endpoints with `injectEndpoints`.
- React Native foreground / reconnect refetch via `setupListeners` + `AppState` / NetInfo.

## Consequences

- One store, one `Provider`, one devtools timeline — API calls appear as actions.
- Enforced structure (slices, actions, pure reducers) suits larger teams and complex flows.
- More boilerplate than Zustand: slices, store, typed hooks, `Provider` in `renderWithProviders`.
- Infinite queries and cache persistence are less mature than in React Query; the RTK Query cache
  is not persisted (data refetches on launch).
- OpenAPI codegen available via `@rtk-query/codegen-openapi`.

## Implementation notes (2026-11-23)

- Implemented as decided. Focus / reconnect refetch uses `setupListeners` with `AppState` and NetInfo.
- Thunks reject API failures with `rejectWithValue(ApiError)` — a plain `throw` is serialised by `createAsyncThunk` and loses `status` / `code`.
- **Redux DevTools on every platform:** native dev builds use `redux-devtools-expo-dev-plugin` (Expo CLI `shift+m` → the plugin), wired as a store enhancer with `devTools: false` (`store/devtools.native.ts`); web keeps RTK's built-in browser-extension DevTools (`devtools.web.ts`). Off in production builds and in tests; the plugin is not in the web bundle. Before this, mobile had no DevTools despite the "one devtools timeline" rationale above.
- Typing note: `enhancers` must come **after** `middleware` in `configureStore` — TypeScript infers the callbacks in order and RTK types the enhancers from the middleware.
