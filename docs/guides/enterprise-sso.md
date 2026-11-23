# Enterprise SSO (OpenID Connect)

The starter ships social sign-in (Google, Apple — ADR-0016). Client projects that sign users in
with a corporate identity provider (Microsoft Entra ID, Okta, Auth0, Keycloak, Google Workspace…)
can add a generic OIDC flow alongside it. Record the decision in an ADR first.

## Approach

Use `expo-auth-session` with the **authorization code flow + PKCE** — the standard for mobile and
single-page apps; no client secret ships in the app. It works on iOS, Android and web.

1. Install: `pnpm --filter @starter/mobile exec expo install expo-auth-session expo-crypto`
   (and the same for `@starter/web`). Check the versioned Expo docs for the current API.
2. Config (public, per environment): add `EXPO_PUBLIC_OIDC_ISSUER`, `EXPO_PUBLIC_OIDC_CLIENT_ID`
   and `EXPO_PUBLIC_OIDC_SCOPES` (e.g. `openid profile email offline_access`) to the env schema.
3. Redirect URI: built from the app's scheme (`starterapp-dev://…` per variant, see
   `apps/mobile/app.config.ts`) and the web origin. Register every variant's redirect URI with the
   identity provider.
4. Flow: discover the issuer (`useAutoDiscovery(issuer)`), start the request with PKCE
   (`useAuthRequest`), then **send the authorization code (and PKCE verifier) to your backend**,
   which exchanges it and returns the app's own tokens — the same shape as `/auth/login`. Treat it
   like social sign-in: a `signInWithSso` thunk that ends in `startSession`
   (`packages/features/src/features/auth/services/auth-service.ts`), so token storage, refresh on 401 and sign-out
   work unchanged.
5. UI: a "Continue with SSO" button on the sign-in screen, shown only when the issuer is
   configured — like the social buttons (`getAvailableProviders`).
6. Tests: mock `expo-auth-session` in Jest; add a mock handler for the code-exchange endpoint so the
   flow runs end to end against the mock API.

Exchanging the code on the backend (rather than in the app) keeps provider tokens off the device
and lets the backend map corporate identities to app users.
