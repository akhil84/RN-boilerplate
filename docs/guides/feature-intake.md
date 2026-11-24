# Feature intake: what to have ready before UI and feature work

What a project owner gathers before building screens and features on this starter. Nothing here
blocks starting: items marked ★ are the minimum for the first feature, and anything missing can be
mocked, defaulted or decided later. The answers feed the delivery pipeline in
[docs/README.md](../README.md): requirement → plan → design → build → test → ship.

**Quickest start:** name the first feature, share designs (or ask for a proposed design), and say
whether a backend exists. Then run `/requirement <idea>`; the agent asks for anything else it
needs, one question at a time.

## 1. Features → `/requirement`

| Need                                                              | Why                                 | Min |
| ----------------------------------------------------------------- | ----------------------------------- | --- |
| First feature to build and what it does (a few sentences)         | Becomes `REQ-001`                   | ★   |
| Platforms: `mobile`, `web` or `both`                              | Decides apps, layouts and E2E specs | ★   |
| User journeys: who, and the main steps                            | Screens, navigation and E2E flows   |     |
| Acceptance criteria (or ask the agent to draft them for approval) | Each `AC-n` maps to a test          |     |
| Roles and permissions, if users see different things              | Guards, menus, API scopes           |     |
| Out of scope, and the order of the remaining features             | Keeps each requirement small        |     |

## 2. Backend / API → plan + `api/` + `mocks/`

| Need                                                                                                                | Why                                                                             | Min |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --- |
| Does a backend exist yet?                                                                                           | If not, build against mock handlers (`EXPO_PUBLIC_API_MOCKS`) and connect later | ★   |
| API contract: OpenAPI / Swagger, or example requests and responses                                                  | RTK Query endpoints + Zod schemas                                               |     |
| Base URL per environment (development, preview, production)                                                         | `EXPO_PUBLIC_API_URL` per EAS environment                                       |     |
| Error format and pagination style                                                                                   | `ApiError` mapping, list screens                                                |     |
| Real auth: sign-in methods used (password, Google, Apple, enterprise SSO), login and refresh endpoints, token shape | `AUTH_PATHS`, auth schemas, which sign-in buttons show                          |     |
| Real-time or offline needs (push, websockets, offline cache)                                                        | May need an ADR                                                                 |     |

## 3. Design / UI → `/design` + `@starter/ui` tokens

| Need                                                                                                            | Why                                      | Min |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | --- |
| Designs: Figma link or screenshots, or ask the agent to propose layouts for approval                            | `DES-xxx` screens, states and testIDs    | ★   |
| Brand colours for light and dark                                                                                | `packages/ui/src/tokens/theme.ts`        |     |
| Fonts (with font files and licences)                                                                            | `Fonts` token, loaded in the apps        |     |
| Logo, app icon, splash screen                                                                                   | `apps/mobile/app.config.ts`, web favicon |     |
| Corner radius, spacing and shadow feel                                                                          | Tokens, so every screen picks them up    |     |
| Navigation: which screens are tabs (mobile) and sidebar entries (web), and their order                          | `app/navigation/destinations.ts`         |     |
| Components needed beyond Button, TextField, Card, Screen, Stack (lists, sheets, pickers, avatars, empty states) | New `@starter/ui` components             |     |
| Accessibility or responsiveness targets beyond the defaults (44pt targets, light + dark, phone → desktop web)   | Design and test checklist                |     |

## 4. Copy and languages → `locales/en.json`

| Need                                               | Why                                     | Min |
| -------------------------------------------------- | --------------------------------------- | --- |
| English copy, or let the agent write it for review | No hard-coded UI text (ADR-0012)        |     |
| Other languages, now or later                      | Extra `locales/<lang>.json` per feature |     |

## 5. Project identity and credentials → before shipping, not before building

| Need                                              | Where it goes                               |
| ------------------------------------------------- | ------------------------------------------- |
| App name, bundle ID / Android package, URL scheme | `pnpm init:project`                         |
| Expo account and EAS project                      | `apps/mobile/app.config.ts`, `eas.json`     |
| Sentry DSN                                        | `EXPO_PUBLIC_SENTRY_DSN` (EAS environment)  |
| Analytics vendor                                  | [analytics adapters](analytics-adapters.md) |
| Push credentials (APNs key, FCM)                  | EAS credentials                             |
| Google / Apple sign-in client IDs                 | `EXPO_PUBLIC_*` keys, app config            |

Never commit secrets — use `.env*.local` (git-ignored) and EAS environment variables.

## 6. Ways of working (decide once)

- **Tests:** feature work is test-first by default (an `AC-n` Jest test per criterion, plus Maestro /
  Playwright flows per `Platforms:`). Say if a pause still applies.
- **Approval gates:** full Requirement → Plan → Design approval for every feature, or a lighter
  path for small ones.
- **Outstanding UI work:** whether to do these before or alongside features:
  - move the existing screens onto the `@starter/ui` components (ADR-0017);
  - the Google sign-in button (ADR-0016).
