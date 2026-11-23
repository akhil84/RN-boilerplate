# Monorepo starter — decision record

Status: Approved

Date: 2026-11-23

Source: `/grill-me` design session. Each decision below lists the question asked, the options
considered, the outcome, and why. Decisions are grouped by area and keep their session numbering
(Q-numbers) so they can be traced. Where a decision was later revised, both are kept and the
earlier one is marked **superseded**.

Every decision marked 📝 gets its own ADR in `docs/04-adr/` (0002 onwards) when implementation
starts.

## Summary

```
apps/mobile          Expo app — iOS + Android (dev builds only)
apps/web             Expo app — web only, single-page app (`single` output)
packages/ui          design system: tokens, primitives, test-utils
packages/features    feature screens + logic (shared by both apps)
packages/api-client  RTK Query base API + baseQuery
packages/config      shared eslint / tsconfig / prettier / jest presets, env, analytics, errors
docs/  e2e/mobile/  e2e/web/  .claude/  AGENTS.md      (root, shared)
```

| Area              | Decision                                                                               |
| ----------------- | -------------------------------------------------------------------------------------- |
| Purpose           | Starter template, copied per project                                                   |
| Identity          | `Starter App` / `starter-app` / `starterapp` / `@starter/*` / `com.example.starterapp` |
| Bootstrapping     | GitHub template + `pnpm init:project`                                                  |
| Apps              | Two Expo apps (`apps/mobile`, `apps/web`) sharing React Native code                    |
| Web output        | `single` (SPA)                                                                         |
| Package manager   | pnpm, `nodeLinker: hoisted`, catalogs                                                  |
| Task runner       | None (pnpm `-r` / `--filter`)                                                          |
| Shared packages   | `ui`, `features`, `api-client`, `config`; TypeScript source, no build step             |
| Backend           | None (clients only)                                                                    |
| Client state      | Redux Toolkit                                                                          |
| Server state      | RTK Query                                                                              |
| HTTP              | `fetchBaseQuery` + re-auth / error / retry wrapper                                     |
| Storage           | AsyncStorage (general), `expo-secure-store` (secrets, native)                          |
| Redux persistence | redux-persist                                                                          |
| Forms             | No form library; Zod + `TextField`                                                     |
| Environments      | dev / preview / production, side-by-side, Zod-validated `EXPO_PUBLIC_*`                |
| i18n              | i18next + react-i18next + expo-localization                                            |
| Error reporting   | Sentry behind a wrapper, off unless DSN set                                            |
| Analytics         | Vendor-neutral typed interface                                                         |
| Auth              | Generic token skeleton + Google & Apple social sign-in                                 |
| Web token storage | `tokenStorage` interface, `local` (default) or `cookie` mode                           |
| Styling           | `StyleSheet` + theme tokens                                                            |
| OTA               | EAS Update, channel per variant, fingerprint runtime                                   |
| Push              | `expo-notifications` plumbing                                                          |
| Unit tests        | Jest + jest-expo, per-package configs, shared preset                                   |
| E2E               | Maestro (mobile), Playwright (web)                                                     |
| CI                | None for now; lefthook git hooks                                                       |
| Versioning        | Independent per app                                                                    |
| Desktop           | Electron out of scope; path documented                                                 |
| Expo Go           | Not supported; development builds only                                                 |

---

## 1. Purpose and structure

### Q1 — What is the monorepo for? 📝

- **Options:** (a) a starter template copied per new project; (b) one shared workspace holding many
  real projects side by side.
- **Decision:** (a) Starter template.
- **Why:** Expo does not support multiple React Native versions in one monorepo, so (b) would force
  every client project to upgrade in lockstep and would mix client codebases in one repo. A
  template gives each project its own independent monorepo.

### Q2 — How is the web app built? (superseded by Q3)

- **Options:** (a) one universal Expo app for iOS, Android and web; (b) Expo mobile + separate
  Next.js web; (c) universal Expo app with room for an optional Next.js app.
- **Initial decision:** (a) one universal Expo app.
- **Superseded:** clarified in Q3 — mobile and web are separate apps, both built with Expo / React
  Native.

### Q3 — Two Expo apps sharing one React Native codebase? 📝

- **Options:** (a) two Expo apps — `apps/mobile` (iOS + Android) and `apps/web` (web only) — as thin
  shells over shared packages; (b) one Expo app for all platforms with `.web.tsx` overrides.
- **Decision:** (a) Two Expo apps.
- **Why:** Web gets its own navigation and layout (sidebar instead of tabs, web-only routes) and
  can deploy and version independently, while screens and logic are still written once in
  `packages/*`. Cost accepted: routes are declared in both apps (each a few lines) and there is one
  more app to configure and test.

### Q4 — How is shared code split into packages? 📝

- **Options:** (a) one `packages/app`; (b) a few focused packages; (c) one package per feature.
- **Decision:** (b) Four packages: `ui`, `features`, `api-client`, `config`.
- **Why:** Real boundaries where they matter (design system vs feature logic vs networking vs
  tooling config) without per-feature package overhead. Inside `packages/features`, each feature
  keeps the existing rule: other code imports only from its `index.ts`.

### Q5 — Where do the apps live?

- **Options:** (a) `apps/*` for deployables, `packages/*` for libraries; (b) everything in
  `packages/*`.
- **Decision:** (a) `apps/mobile`, `apps/web`, `packages/*`.
- **Why:** The layout the Expo monorepo guide uses, and the common convention. It makes clear
  what is shipped (with its own `eas.json` / deploy) and what is a library, and lets tooling tell
  them apart by path.

### Q6 — Package manager 📝

- **Options:** npm workspaces; Yarn Classic; Yarn Berry (`nodeLinker: node-modules`); pnpm.
- **Decision:** pnpm with `nodeLinker: hoisted`, plus **catalogs** for `react`, `react-native`,
  `expo`.
- **Why:**
  - Hoisted layout gives the same React Native compatibility as npm. Note this also turns off
    pnpm's strict dependency isolation, so strictness is _not_ the reason for choosing it.
  - **Catalogs** define each React / React Native / Expo version once. Expo does not support
    duplicate React Native versions, and duplicate React versions break the app at runtime.
  - `--filter "...[origin/main]"` runs tasks only for changed packages without adding a task
    runner.
  - Faster installs and a shared content-addressed store across every project made from the
    starter.
  - Yarn Classic is frozen; Yarn Berry is comparable (constraints, `foreach --since`) but has
    more config (`.yarnrc.yml`, `.yarn/`) and less momentum; npm has no catalogs or
    changed-package filtering.
- **Cost accepted:** Corepack setup per machine; command changes in AGENTS.md and slash commands.
- **Later option:** try isolated (non-hoisted) installs through a separate ADR.

### Q7 — Convert this repo or start a new one?

- **Options:** (a) convert `RN-boilerplate` in place on a branch; (b) create a new repo.
- **Decision:** (a) Convert in place.
- **Why:** Keeps history and existing work; `docs/`, `.claude/`, `e2e/` and `AGENTS.md` stay at
  the root and are updated rather than copied.

### Q8 — Is a backend part of the starter? 📝

- **Options:** (a) none, client only; (b) Expo Router API routes; (c) a separate `apps/api`.
- **Decision:** (a) No backend.
- **Why:** The backend varies per project and is often owned by another team. The starter ships a
  typed `api-client` with environment-based config that each project points at its own API.

### Q9 — Expo web or a plain React (DOM) web app? 📝

- **Context:** Electron desktop apps (Windows, macOS) may be needed in future.
- **Options:** (a) Expo web, reusing shared React Native screens; (b) Vite + React DOM with its own
  web UI, sharing only non-UI code; (c) Vite + React rendering shared screens through
  react-native-web.
- **Decision:** (a) Keep Expo web.
- **Why:**
  - Expo web **is** React — it renders with `react-dom`, and its export is plain HTML/JS/CSS that
    Electron can load exactly like a Vite build. Electron works the same for every option.
  - Screens are written once, not twice. With a separate web UI, every screen, design spec,
    `AC-n` test suite and bug fix is duplicated (estimated 1.6–1.8× UI effort).
  - Two desktop routes stay open: Electron, or React Native for Windows / macOS (only possible if
    the UI is React Native).
  - One route map (Expo Router) across browser, deep links and Electron.
  - One design system and one component model for all developers.
  - `testID` renders as `data-testid` on web, so Maestro and Playwright share selectors.
  - `.web.tsx` files and Expo DOM components (`'use dom'`) cover web-only needs.
- **When the alternative would win:** web-first products (dense admin consoles, content sites),
  heavy dependence on web UI libraries, very tight bundle-size limits, or a mostly web team. The
  owner confirmed projects are typically mobile-first.

### Q10 — Web rendering mode 📝

- **Options:** (a) `static` (pre-rendered HTML per route); (b) `single` (classic SPA);
  (c) `server` (Node server, API routes).
- **Decision:** (b) `single`.
- **Why:** Simplest to host on any static host and the easiest to put inside Electron later. No
  backend means `server` output is not needed. Trade-off accepted: no per-route HTML for SEO or
  link previews; a project needing that can switch to `static` through an ADR.

### Q12 — Placeholder identity

- **Decision:** Remove "Katon" everywhere and use:

  | Identifier                      | Value                    |
  | ------------------------------- | ------------------------ |
  | Display name                    | `Starter App`            |
  | slug / package name             | `starter-app`            |
  | URL scheme                      | `starterapp`             |
  | npm scope                       | `@starter/*`             |
  | iOS bundle ID / Android package | `com.example.starterapp` |
  | AGENTS.md heading               | "Project rules"          |

- **Why:** Generic, and each string is distinctive enough to find and replace safely (a bare word
  like `app` is not). The stores reject `com.example`, which acts as a safety net if a project
  forgets to run the init script. The repo itself may be renamed later (e.g.
  `expo-monorepo-starter`).

### Q11 — How does a new project start from the starter? 📝

- **Options:** (a) GitHub "Use this template" + one-time init script; (b) a generator CLI;
  (c) a manual checklist.
- **Decision:** (a) GitHub template + `pnpm init:project`.
- **Why:** The script asks for the project name, bundle-ID prefix and npm scope, replaces every
  placeholder, resets `CHANGELOG.md` and `vision.md`, then deletes itself. A Jest test asserts
  no placeholder string remains. A CLI is a separate tool to maintain that can drift from the
  template; a manual checklist misses identifiers that only fail at store submission.

### Q13 — Shared packages: source or built? 📝

- **Options:** (a) source-only internal packages (`exports` → `./src/index.ts`); (b) built to
  `dist/`.
- **Decision:** (a) Source-only.
- **Why:** No build step and no stale-build bugs; edits hot-reload in both apps; platform files
  (`.ios.tsx`, `.web.tsx`), Reanimated worklets and the React Compiler keep working without extra
  config. This is the setup Expo's monorepo guide assumes. Publishing to npm is not a goal.

### Q14 — Task runner 📝

- **Options:** (a) pnpm only; (b) Turborepo; (c) Nx.
- **Decision:** (a) pnpm only (`pnpm -r`, `pnpm --filter`).
- **Why:** With source-only packages there are no build tasks — only lint, typecheck and test.
  `--filter "...[origin/main]"` already limits work to changed packages. Turborepo's caching is
  modest gain at this size and can be added later via ADR without restructuring.

---

## 2. Testing

### Q15 — Unit and component tests 📝

- **Question raised:** why Jest at all?
- **Why unit/component tests:** End-to-end tests alone are slow (need a built app on a
  simulator), make edge cases (offline, 500 errors, empty lists) impractical, give vague failures,
  and would break the test-first `AC-n` workflow that `/implement` relies on. Unit tests are also
  the safety net for AI-written code.
- **Why Jest specifically:** `jest-expo` is Expo's official preset (native-module mocks, RN
  transform, per-platform runs); React Native Testing Library is built around Jest; Vitest, Node's
  test runner and Bun's runner lack React Native support. It is already set up and passing here.
- **Options for structure:** (a) per-package `jest.config.js` extending a shared preset;
  (b) one root config using `projects`.
- **Decision:** (a) Shared preset in `packages/config`, small config per workspace;
  `jest-expo/universal` (iOS + Android + web) for `ui` and `features`; `renderWithProviders`
  moves to `@starter/ui/test-utils`.
- **Why:** Works with pnpm's changed-package filtering, and shared code gets tested against every
  platform renderer.

### Q16 — Web end-to-end tests 📝

- **Options:** (a) Playwright for web, Maestro for mobile; (b) Maestro for both; (c) no web E2E.
- **Decision:** (a) Playwright in `e2e/web/`; Maestro moves to `e2e/mobile/`.
- **Why:** Playwright is the standard web E2E tool (three browsers, traces, network mocking) and
  can later drive Electron. `testID` → `data-testid` means both tools use the same
  `<screen>-title` IDs. Maestro web support is newer and Chrome-only. Every user journey gets
  both a Maestro flow and a Playwright spec (per the requirement's `Platforms:`).

---

## 3. Stack

### Q17 — How opinionated is the starter?

- **Options:** (a) minimal; (b) batteries included, each choice backed by an ADR; (c) core plus
  optional modules chosen by the init script.
- **Decision:** (b) Batteries included.
- **Why:** Client apps nearly always need the same pieces; a consistent stack lets developers and
  agents move between projects. ADRs make each choice replaceable deliberately. Option (c) would
  make the init script very hard to test (every combination must compile and pass).

### Q18 — Server data fetching (superseded by Q20)

- **Options:** (a) TanStack Query (React Query); (b) RTK Query; (c) SWR; (d) OpenAPI-generated
  hooks.
- **Initial decision:** React Query (`@tanstack/react-query`). (Clarified: "React Query" and
  "TanStack Query" are the same library — renamed in v4; the old `react-query` package is
  deprecated.)
- **Superseded:** once Redux Toolkit was chosen for client state (Q19), revisited in Q20.

### Q19 — Client state 📝

- **Options:** (a) Zustand; (b) Redux Toolkit; (c) Jotai; (d) Context + `useReducer`.
- **Recommended:** Zustand (less boilerplate; React Query was covering server state).
- **Decision:** (b) **Redux Toolkit** — the owner's choice.
- **Considerations recorded:** Redux Toolkit gives enforced structure (one store, actions, pure
  reducers), best-in-class devtools (action log, time travel), clean reducer tests, and lets one
  action update many slices — strengths for larger teams and complex client-side flows. Costs:
  more boilerplate (slices, store, typed hooks, `Provider`), larger bundle, and persistence
  depends on `redux-persist`.

### Q20 — RTK Query instead of React Query? 📝

- **Options:** (a) keep React Query + Redux for client state; (b) switch to RTK Query.
- **Decision:** (b) RTK Query; React Query dropped.
- **Why:** With Redux already in place, RTK Query gives one library, one store, one `Provider` and
  one devtools timeline where API calls appear as actions. Features add their endpoints with
  `injectEndpoints`, so code stays owned by its feature. OpenAPI codegen is available
  (`@rtk-query/codegen-openapi`).
- **Costs accepted:** React Native foreground/reconnect refetch needs `setupListeners` plus
  `AppState`/NetInfo wiring; infinite queries and cache persistence are less established than in
  React Query. The RTK Query cache is not persisted — data refetches on launch.

### Q21 — HTTP layer under RTK Query 📝

- **Options:** (a) built-in `fetchBaseQuery`; (b) axios-based `baseQuery`; (c) `ky` or similar.
- **Decision:** (a) `fetchBaseQuery`, wrapped once in `packages/api-client` with:
  - base URL from env config and `Authorization` header from the session;
  - re-auth on 401 — refresh once behind a mutex, retry, sign out if refresh fails;
  - a normalised `ApiError { status, code, message }`;
  - timeout and retry via RTK Query's `retry`.
- **Why:** No extra dependency; `fetch` behaves the same on iOS, Android, web and Electron; this is
  the pattern documented by RTK Query. Projects needing upload progress can add an axios-based
  query for those endpoints.

### Q22 — General persisted storage 📝

- **Options:** (a) AsyncStorage; (b) MMKV; (c) `expo-sqlite` key-value store.
- **Decision:** (a) AsyncStorage (`@react-native-async-storage/async-storage`).
- **Why:** Covers iOS, Android, web (`localStorage`) and Electron, and plugs into Redux
  persistence. Performance is irrelevant at this data size (a few KB). Projects with heavy local
  data can switch via ADR. Secrets never go here — see Q30.

### Q23 — Redux persistence 📝

- **Options:** (a) `redux-persist`; (b) a small custom layer on `listenerMiddleware`;
  (c) persist nothing in Redux.
- **Recommended:** (b) custom layer.
- **Decision:** (a) **`redux-persist`** — the owner's choice.
- **Implementation notes:** each persisted slice whitelisted explicitly; `PersistGate` holds
  rendering while the splash screen stays up; RTK's serializability check configured to ignore
  redux-persist actions; versioned migrations for state-shape changes.
- **Risk recorded:** `redux-persist` is barely maintained; moving to the listener-based approach
  remains an option via a later ADR.

### Q24 — Forms and validation 📝

- **Context:** apps will have few, simple forms.
- **Options:** (a) no form library, Zod for validation; (b) React Hook Form + Zod anyway; (c) no
  library and no Zod.
- **Decision:** (a) No form library. Controlled inputs, Zod `safeParse` on submit, and a
  `TextField` (label, error, `testID`, accessibility props) in `packages/ui`.
- **Why:** React Hook Form is more than a few simple forms need. Zod still earns its place: it
  validates env config at startup and can optionally check API responses. This is a deliberate
  exception to "batteries included"; a project with heavy forms adds React Hook Form via ADR, and
  the Zod schemas and `TextField` carry over unchanged.

### Q25 — Environments 📝

- **Options:** (a) three side-by-side variants; (b) two variants; (c) one build with a runtime
  environment switch.
- **Decision:** (a) Three variants:

  | Variant     | Bundle ID                        | App name              | Used for                            |
  | ----------- | -------------------------------- | --------------------- | ----------------------------------- |
  | development | `com.example.starterapp.dev`     | Starter App (Dev)     | dev builds, local API               |
  | preview     | `com.example.starterapp.preview` | Starter App (Preview) | QA / staging, internal distribution |
  | production  | `com.example.starterapp`         | Starter App           | store releases                      |
  - Selected by `APP_VARIANT` in `apps/mobile/app.config.ts`, with matching EAS build profiles.
  - Public values from `.env.local` (local, git-ignored) and EAS environment variables (builds).
  - One `env.ts` in `packages/config` validates every `EXPO_PUBLIC_*` value with Zod at startup.

- **Why:** Testers can install all three on one device; a bad or missing value fails immediately
  with a clear error. `EXPO_PUBLIC_*` values are bundled into the app, so they hold public config
  only, never secrets. A runtime switch would ship non-production URLs in the production binary.

### Q26 — Internationalisation 📝

- **Options:** (a) i18next + react-i18next + `expo-localization`; (b) centralised string files,
  i18n later; (c) inline strings.
- **Decision:** (a), shipping English only.
- **Why:** Client projects often need a second language eventually, and retrofitting means
  finding every hard-coded string. Each feature owns a namespace (`locales/en.json`), keys are
  typed, the language override persists through redux-persist, and the `/design` Copy table
  becomes the source for keys. Right-to-left layout is out of scope.

### Q27 — Error reporting 📝

- **Options:** (a) Sentry; (b) Firebase Crashlytics; (c) vendor-neutral interface only.
- **Decision:** (a) Sentry (`@sentry/react-native` + Expo config plugin), behind a thin
  `reportError` / `ErrorBoundary` wrapper.
- **Why:** Covers JS errors and native crashes on iOS, Android and web (Electron too); source maps
  upload automatically with EAS Build and EAS Update. Crashlytics has no web support. The wrapper
  keeps features vendor-free. Disabled unless `EXPO_PUBLIC_SENTRY_DSN` is set, so the starter
  runs without an account; the init script asks for a DSN as an optional step.

### Q28 — Product analytics 📝

- **Options:** (a) vendor-neutral interface; (b) a specific vendor (PostHog, Firebase);
  (c) none.
- **Decision:** (a) `analytics.track / screen / identify` with typed event names, automatic
  screen tracking from Expo Router route changes, and a console (dev) / no-op (prod) adapter.
  A doc explains writing a vendor adapter, with PostHog as the worked example.
- **Why:** The analytics vendor is usually chosen by the client and varies more than crash
  reporting. Typed events catch typos, and a Jest helper lets acceptance criteria assert events.

---

## 4. Authentication

### Q29 — Auth skeleton 📝

- **Options:** (a) generic token-auth skeleton; (b) (a) + OAuth / SSO; (c) plumbing only.
- **Decision:** (a), extended with social sign-in (Q29b–d):
  - session in Redux (`user`, `status: 'unknown' | 'signedIn' | 'signedOut'`); tokens in secure
    storage, never in Redux, so redux-persist never writes them to AsyncStorage;
  - protected routes with Expo Router `Stack.Protected` — `(auth)` and `(app)` groups in both
    apps;
  - refresh on 401 via the Q21 `baseQuery`;
  - email + password sign-in screen (`TextField` + Zod) against a placeholder `login` endpoint;
  - sign-out clears tokens, resets the RTK Query cache and persisted slices;
  - tests for each flow with mocked endpoints.

### Q29b — Which kind of SSO? 📝

- **Options:** (a) enterprise SSO via generic OIDC (`expo-auth-session`, PKCE); (b) social login
  buttons; (c) both.
- **Recommended:** (a) generic OIDC.
- **Decision:** (b) **Social login** — the owner's choice. A written recipe for OIDC / corporate
  SSO can still be added to the docs.
- **Constraint recorded:** App Store guideline 4.8 — an iOS app offering third-party social login
  must also offer Sign in with Apple (or an equivalent privacy-focused option). To verify against
  the current guideline wording.

### Q29c — Which providers? 📝

- **Options:** (a) Google + Apple; (b) + Facebook; (c) Google only.
- **Decision:** (a) Google + Apple, each shown only when its env config is set.
- **Why:** Google is the most-used login on Android and web; Apple is effectively required on iOS
  once Google is offered. Facebook adds its own SDK and review burden and is less common now.
  Google-only would just postpone the Apple requirement to App Store review.
- **Backend flow:** the app gets an ID token from the provider and sends it to one
  `socialSignIn` endpoint (`{ provider, idToken }`); the backend verifies it and returns its own
  access and refresh tokens. Provider tokens never call the app's API directly.

### Q29d — Native SDKs or browser flows? 📝

- **Options:** (a) native on mobile, browser-based on web; (b) browser-based everywhere via
  `expo-auth-session`.
- **Decision:** (a):

  | Platform       | Google                                      | Apple                       |
  | -------------- | ------------------------------------------- | --------------------------- |
  | iOS            | `@react-native-google-signin/google-signin` | `expo-apple-authentication` |
  | Android        | `@react-native-google-signin/google-signin` | web-based Apple flow        |
  | Web / Electron | Google Identity Services                    | Sign in with Apple JS       |

  All behind one `signInWith(provider)` function with `.native.ts` / `.web.ts` files.

- **Why:** One-tap native sign-in gives better UX and conversion, and Apple's review expects the
  native Sign in with Apple button on iOS. Native modules need dev builds, which are already
  required (Q39). Expo's current Google sign-in guidance to be checked against SDK 58 docs.

### Q30 — Token storage on web 📝

- **Options:** (a) `localStorage`; (b) access token in memory + refresh token in an `httpOnly`
  cookie; (c) a `tokenStorage` interface supporting both.
- **Decision:** (c) `token-storage.native.ts` uses `expo-secure-store`; `token-storage.web.ts`
  picks a strategy from `EXPO_PUBLIC_WEB_AUTH_MODE = 'local' | 'cookie'`, default `local`.
- **Why:** `expo-secure-store` has no web support. `localStorage` works with any backend but is
  readable by XSS or compromised third-party scripts (Google / Apple scripts load on the sign-in
  page); the cookie mode is more secure but needs backend support (cookie issuing, CORS
  credentials, CSRF). Since the backend varies, the starter supports both and the README
  recommends cookie mode wherever the backend allows. Electron would later add a `safeStorage`
  strategy.

---

## 5. UI and screens

### Q31 — Styling 📝

- **Options:** (a) `StyleSheet` + theme tokens with own components; (b) Tailwind-style
  (NativeWind / Uniwind); (c) Unistyles 3; (d) a component library (Tamagui, gluestack, Paper).
- **Decision:** (a) Extend the existing theme (`constants/theme.ts`, light/dark) into
  `packages/ui`: tokens (colour, spacing, typography, radius), `useTheme()`, primitives (`Text`,
  `Button`, `TextField`, `Card`, `Screen`, `Stack`) and a `useBreakpoint()` helper for web.
- **Why:** No styling dependency to upgrade across SDK releases; works wherever React Native
  works, including React Native for Windows / macOS; client designs map directly to tokens. A
  project preferring Tailwind can switch via ADR.

### Q32 — App shells and starter screens

- **Options:** (a) auth / home / settings shells with an example feature; (b) empty shells only;
  (c) more examples (detail route, modal, form).
- **Decision:** (a):

  ```
  apps/mobile                          apps/web
  (auth)/sign-in                       (auth)/sign-in
  (app)/  — native bottom tabs         (app)/  — sidebar ≥ md, top bar + drawer < md
     home                                 home
     settings                             settings
     +not-found                           +not-found
  ```

  - Screens are shared from `packages/features`: `auth` (email/password + Google + Apple),
    `home` (example RTK Query list showing loading / empty / error / success), `settings` (theme,
    language, sign out, app version and environment).
  - Every title has a `testID` (`sign-in-title`, `home-title`, `settings-title`); the journey
    sign in → home → settings → sign out has both a Maestro flow and a Playwright spec.
  - Template screens (Welcome, Explore, `AnimatedIcon`, `HintRow`, `WebBadge`) are removed.

- **Why:** The example list is the one place the starter shows the full pattern — endpoint →
  screen states → tests → E2E — for developers and `/implement` to copy.

---

## 6. Delivery

### Q33 — Over-the-air updates 📝

- **Options:** (a) EAS Update configured; (b) not included; (c) included with forced updates.
- **Decision:** (a) `expo-updates` with one channel per variant, `fingerprint` runtime version
  policy, updates checked on launch and applied on next start. `/ship` prints the `eas update`
  command but never runs it. Sentry receives source maps per update.
- **Why:** Fixes reach users without store review; the fingerprint policy prevents updates
  reaching binaries with mismatched native code. Adding it later would need a new native build,
  so builds made without it could never receive updates. Forced-update screens need a
  backend-controlled minimum version, so they are left to a project ADR.

### Q34 — Push notifications 📝

- **Options:** (a) plumbing without provider tie-in; (b) not included; (c) full setup tied to
  Expo's push service.
- **Decision:** (a) `expo-notifications`; permission requested from a screen via
  `requestPushPermission()` (never at launch); device registration through a `registerDevice`
  endpoint; taps routed through Expo Router deep links (`data.url`); foreground handling and
  Android channels set up. Inactive until a project adds APNs / FCM credentials. No web push.
- **Why:** Cold permission prompts hurt opt-in rates. Leaving the sending side to the backend
  avoids assuming Expo's push service.

### Q35 — CI and local checks 📝

- **Proposed:** GitHub Actions for changed-package checks, Playwright on PRs, Maestro on label.
- **Decision:** **No CI for now.**
  - Remove `.github/workflows/ci.yml` and `e2e-android.yml` (they would break after the
    conversion) and the PR template's CI references.
  - Add **lefthook**: pre-commit runs Prettier + ESLint on staged files; pre-push runs
    `pnpm verify:changed`. Installed through a `prepare` script on `pnpm install`.
  - A doc explains how to add CI back; the old `ci.yml` remains in git history.
- **Why:** Gives most of CI's protection locally without running anything on GitHub. Hooks can
  be bypassed with `--no-verify`, so they are a safety net, not a gate.

### Q36 — Delivery workflow and slash commands 📝

- **Options:** (a) monorepo-aware workflow with a `Platforms:` field on requirements; (b) keep it
  single-platform and let the plan decide.
- **Decision:** (a):
  - `docs/` stays at the root with shared numbering; requirements get `Platforms: mobile | web |
both`.
  - AGENTS.md rewritten: new layout, "features live in `packages/features`, never in `apps/`",
    pnpm commands, stack decisions with ADR links, "Project rules" heading.
  - `/plan` lists the package each task touches and maps journeys to Maestro and/or Playwright;
    `/design` covers mobile and web layouts with shared `testID`s; `/implement` writes tests in
    `packages/features/src/<feature>/__tests__/` and finishes with `pnpm verify`; `/test` writes
    flows and specs without CI references; `/ship` versions per app and prints (never runs)
    `eas build`, `eas update` and the web export command.
  - ADRs 0002+ record the 📝 decisions in this document.
  - `vision.md` and `glossary.md` become generic templates reset by the init script.

### Q37 — Versioning 📝

- **Options:** (a) independent version per app; (b) one version for the repo.
- **Decision:** (a) `apps/mobile` and `apps/web` each have their own `version` and
  `CHANGELOG.md`; `/ship mobile minor`, `/ship web patch`. Build numbers are managed by EAS
  (`autoIncrement`, remote app versioning). Shared packages are not versioned.
- **Why:** Web can ship a fix immediately while mobile waits for store review — the reason the
  apps were split in Q3. Internal source packages ship as part of the apps.

### Q38 — Electron desktop 📝

- **Options:** (a) out of scope, path documented; (b) a minimal `apps/desktop` now.
- **Decision:** (a) Out of scope. `docs/guides/desktop-electron.md` describes the path: load the
  `apps/web` export over a custom `app://` protocol, `safeStorage` for tokens, loopback or
  custom-protocol OAuth redirects, electron-builder / Electron Forge packaging, and code signing.
  An AGENTS.md rule keeps shared code desktop-safe (no browser-only APIs outside `.web.ts`).
- **Why:** Avoids maintaining Electron upgrades, security config, packaging and a third E2E
  target before any project needs it; the abstractions above keep the path cheap.

### Q39 — Expo Go 📝

- **Options:** (a) development builds only; (b) keep Expo Go working with reduced features.
- **Decision:** (a) Development builds only, with `expo-dev-client`. Documented in README,
  AGENTS.md and the init script.
- **Why:** Native Google Sign-In, Sentry native crash capture and Android push tokens are not
  available in Expo Go. Fallback paths for each would add code to build and test, and Expo Go
  would differ from what ships. Web development needs no native build.

---

## To verify against Expo SDK 58 docs before implementation

- `jest-expo/universal` preset (Q15)
- Expo Router `Stack.Protected` API (Q29)
- Expo DOM components / `'use dom'` (Q9)
- EAS environment variable commands (Q25)
- Expo's current Google sign-in recommendation (Q29d)
- What Expo Go includes in SDK 58 (Q39)
- App Store guideline 4.8 current wording (Q29b)

## Next steps

1. Owner reviews this record and sets `Status: Approved`.
2. Write ADRs 0002+ for each 📝 decision (`/adr`).
3. Write the conversion plan (`/plan`) — ordered, test-first tasks.

## Implementation status (2026-11-23)

Built on `feat/monorepo-starter` (phases 1–6, the Android device fix, and the ADR gap-fill). Each
ADR in `docs/04-adr/` carries implementation notes. Departures from this record:

| Q    | Decided                                                                  | Built                                             | Why                                                                   |
| ---- | ------------------------------------------------------------------------ | ------------------------------------------------- | --------------------------------------------------------------------- |
| Q15  | Shared packages test on iOS, Android **and web** (`jest-expo/universal`) | iOS + Android renderers; web via Playwright       | RNTL cannot render react-native-web DOM output                        |
| Q11  | Jest test for the init script                                            | Node's built-in test runner (`pnpm test:scripts`) | The script is plain Node, outside any workspace                       |
| Q29  | Sign-out resets persisted slices                                         | Keeps device preferences (theme, language)        | They belong to the device, not the user                               |
| Q29d | Web-based Apple flow on Android                                          | Apple not offered on Android                      | `expo-apple-authentication` is iOS-only; guideline 4.8 applies to iOS |
| Q29d | Google on web                                                            | One Tap prompt                                    | Simplest GIS flow; can be suppressed — use `renderButton` if needed   |
| Q31  | `Card`, `Screen`, `Stack` primitives                                     | Built and tested; screens not migrated yet        | Focus on framework setup first                                        |
| Q33  | OTA updates on                                                           | Off until `EAS_PROJECT_ID` is set                 | A starter has no EAS project                                          |

Added beyond this record: an in-app mock API (runs without a backend; never in production), a
dependency-free static server for Playwright, `pnpm init:project` options for the EAS project ID
and Sentry DSN, and guides for CI, Electron, analytics adapters and enterprise SSO.

A high-effort code review of the branch found 13 issues (auth/session races, mocks reachable in
production, notification and One Tap edge cases, init-script robustness); all were fixed with
tests.

Verified: `pnpm verify` (218 Jest + 12 script tests), Playwright in Chromium and WebKit, Maestro
smoke flows on an Android 17 emulator (release build). Not yet verified: iOS (needs full Xcode),
push and OTA end to end (need an EAS project and credentials), Firefox (sandbox limitation).
