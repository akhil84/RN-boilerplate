# ADR-0015: Token-auth skeleton and configurable token storage

Status: Accepted · Date: 2026-11-23 · Implemented on `feat/monorepo-starter`

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q29, Q30.

## Context

The backend varies per project, so only the client side can be standardised. Options: a generic
token-auth skeleton; plumbing only (no screen); skeleton plus SSO (see ADR-0016).

`expo-secure-store` has no web support. Web options: `localStorage` (works with any backend,
readable by XSS or compromised third-party scripts); access token in memory + refresh token in an
`httpOnly` cookie (most secure, needs backend cookie, CORS-credentials and CSRF support); an
interface supporting both.

## Decision

- Session in Redux (`user`, `status: 'unknown' | 'signedIn' | 'signedOut'`); tokens never in
  Redux state.
- Protected routes with Expo Router `Stack.Protected` in both apps: the `(app)` group needs a
  session, the `sign-in` route needs none.
- Refresh on 401 via ADR-0008.
- Email + password sign-in screen (`TextField` + Zod) against a placeholder `login` endpoint.
- Sign-out clears tokens, resets the RTK Query cache, detaches analytics and error reporting from
  the user. Device preferences (theme, language) are kept — they belong to the device, not the
  user; user-specific persisted slices must be reset on sign-out.
- `tokenStorage` interface: `token-storage.native.ts` → `expo-secure-store`;
  `token-storage.web.ts` → `EXPO_PUBLIC_WEB_AUTH_MODE = 'local' | 'cookie'`, default `local`.

## Consequences

- Works with any backend out of the box; README recommends `cookie` mode where supported.
- `local` mode accepts XSS risk on web; mitigate with short-lived tokens and a strict CSP.
- Electron would add a `safeStorage` strategy later.
- Each project maps the `login` endpoint and response.

## Implementation notes (2026-11-23)

- `Stack.Protected` confirmed for SDK 58; the splash stays up while the session status is `unknown`.
- `tokenStorage.refreshTransport` (`body` | `cookie`) tells the refresh call how to send credentials. The README recommends cookie mode wherever the backend supports it.
- Sign-out is guarded against re-entry (a 401 on the logout call would otherwise loop through a failed refresh into another sign-out).
- Code review fixes: a session epoch stops a refresh that finishes after sign-out from saving tokens (which would sign the user back in on next launch); sign-out is a no-op without a session; `restoreSession` keeps a rotated refresh token.
- **iOS fresh-install fix** (found on the iOS simulator): Keychain items survive uninstalling the app, so a reinstall silently restored the previous install's session. Native token storage now keeps an install marker in AsyncStorage (wiped on uninstall); when it is missing, leftover Keychain tokens are deleted before restoring. Saving a session writes the marker.
