# ADR-0008: fetchBaseQuery with re-auth, normalised errors and retry

Status: Accepted · Date: 2026-11-23 · Implemented on `feat/monorepo-starter`

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q21.

## Context

RTK Query needs a `baseQuery`. Options: built-in `fetchBaseQuery` (native `fetch`, no dependency);
an axios-based query (interceptors, upload progress, extra dependency); `ky` or similar (adds a
layer for little gain).

## Decision

`fetchBaseQuery`, wrapped once in `packages/api-client`:

- base URL from env config; `Authorization` header from the session;
- on 401: refresh once behind a mutex, retry, sign out if refresh fails;
- errors normalised to `ApiError { status, code, message }`;
- timeout, and retries via RTK Query's `retry`.

## Consequences

- Same behaviour on iOS, Android, web and Electron; small bundle.
- Features handle one error type.
- No upload progress events; projects needing them add an axios query for those endpoints.
- The mutex and refresh logic need thorough tests (parallel 401s, failed refresh).

## Implementation notes (2026-11-23)

- Implemented as decided: bearer token, one shared refresh on 401 (sign-out when it fails), retries via RTK Query `retry` with `retryCondition` (idempotent methods, transient failures only) and exponential backoff, normalised `ApiError`.
- The refresh call uses `apiRequest` (no auth, no retry) so a failing refresh cannot trigger another refresh. `fetchFn` is injectable (mock mode, tests).
- Endpoints can pass `extraOptions: { skipReauth: true }` (`ApiExtraOptions`); the auth endpoints do, so a 401 from login / social sign-in / logout is a plain error — never a refresh or sign-out (found in code review: a wrong password ran the sign-out flow).
