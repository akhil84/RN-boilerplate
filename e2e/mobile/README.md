# End-to-end tests (Maestro)

Black-box UI tests that drive a real build on a simulator/emulator.

## Setup (once)

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash   # installs the `maestro` CLI
```

## Run

```bash
# 1. Install a build with the native app id com.example.starterapp on a booted device
cd apps/mobile && npx expo run:android --variant release   # or: npx expo run:ios --configuration Release
# 2. Run flows
pnpm test:e2e:mobile          # all flows
pnpm test:e2e:mobile:smoke    # only flows tagged `smoke`
maestro studio            # interactive inspector to find selectors
```

Override the app id with `maestro test -e APP_ID=com.other.id e2e/mobile/flows`.

## Conventions

- One user journey per file: `<area>-<journey>.yaml`. Reusable steps live in `subflows/` (not run as tests).
- First line comment links the requirement: `# REQ: <requirement-id> — <journey>`.
- Select by `id:` (React Native `testID`) first, visible text second. Never by coordinates.
- Every new screen gets a `testID` on its title, and every feature ships at least one flow.
- Tag critical-path flows `smoke`; CI runs those on every PR that reaches the E2E job.
