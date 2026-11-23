# ADR-0016: Google and Apple social sign-in

Status: Accepted · Date: 2026-11-23 · Implemented on `feat/monorepo-starter`

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q29b, Q29c, Q29d.

## Context

SSO options: enterprise OIDC through `expo-auth-session` (recommended at the time); social login
buttons; both. Provider options: Google + Apple; + Facebook; Google only. Implementation options:
native SDKs on mobile; browser-based flows everywhere.

App Store guideline 4.8: an iOS app offering third-party social login must also offer Sign in
with Apple (or an equivalent) — wording to be confirmed.

## Decision

- **Social login** (owner's choice) with **Google and Apple**, each shown only when configured.
- Native on mobile, browser-based on web:

  | Platform       | Google                                      | Apple                       |
  | -------------- | ------------------------------------------- | --------------------------- |
  | iOS            | `@react-native-google-signin/google-signin` | `expo-apple-authentication` |
  | Android        | `@react-native-google-signin/google-signin` | not offered                 |
  | Web / Electron | Google Identity Services (One Tap)          | Sign in with Apple JS       |

- One `signInWith(provider)` with `.native.ts` / `.web.ts` implementations.
- The provider ID token is sent to one `socialSignIn` endpoint (`{ provider, idToken }`); the
  backend returns its own tokens, stored via ADR-0015.

## Consequences

- One-tap native UX; meets Apple's requirement.
- Native modules require dev builds (ADR-0025).
- Each project configures Google Cloud and Apple Developer credentials.
- Enterprise OIDC is not included; see the recipe in `docs/guides/enterprise-sso.md`.
- Expo's SDK 58 guide recommends `@react-native-google-signin/google-signin` (used here).

## Implementation notes (2026-11-23)

- **Apple on Android is not offered**: `expo-apple-authentication` supports iOS only, and Apple's guideline 4.8 requires Sign in with Apple only where third-party social login is offered on iOS. Web uses Sign in with Apple JS.
- **Google on web uses One Tap** (`google.accounts.id.prompt`), which browsers or users can suppress; a project needing a guaranteed entry point should render the Google button (`renderButton`) instead.
- Buttons appear only when configured for the current platform; the Google and Apple config plugins are added only when their env values are set.
- Enterprise SSO (OIDC + PKCE) recipe: `docs/guides/enterprise-sso.md`.
- Code review fix: One Tap's dismissed moment with reason `credential_returned` (a success) is no longer treated as a cancel, and every status method is called defensively (FedCM removed some) — sign-in could be dropped or hang. Tested with a fake `window.google`.
- Deferred: a rendered Google button on web (instead of One Tap only) needs a web-specific element inside the sign-in screen — UI work, postponed with the screen migration (ADR-0017) while the focus is framework setup.
