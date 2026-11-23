# @starter/api-client

Typed HTTP layer shared by every feature: one RTK Query `createApi` with a `fetchBaseQuery`
wrapper (base URL from env, auth header, refresh on 401, normalised `ApiError`, timeout, retry).
Features add endpoints with `injectEndpoints` — see ADR-0007 and ADR-0008.

No UI code here. Each project points the base URL at its own backend (ADR-0006).
