---
description: Prepare a release of one app — verify, changelog, version bump, and release notes
argument-hint: <mobile|web> [patch|minor|major]
---

Prepare a release: $ARGUMENTS (app first, bump defaults to `patch`). Each app is versioned and released on its own (ADR-0023).

1. Run `pnpm verify` and `pnpm test:e2e:web`. Stop and report if anything fails.
2. Walk `docs/05-releases/release-checklist.md` for that app and report each item as done / not done / needs a human.
3. Bump `version` in `apps/<app>/app.config.ts` (mobile build numbers are managed by EAS). Move _Unreleased_ entries in `apps/<app>/CHANGELOG.md` under the new version with today's date.
4. Mark shipped requirements `Status: Done`.
5. Draft release notes (user-facing, plain words) and print the commands to run — never run them yourself:
   - mobile: `pnpm dlx eas-cli build --profile production --platform all`, then `pnpm dlx eas-cli submit --platform all` (from `apps/mobile`); a JS-only fix can ship as `pnpm dlx eas-cli update --channel production`, followed by `pnpm sentry:upload-update` when Sentry is configured (source maps for the update).
   - web: `APP_VARIANT=production pnpm --filter @starter/web export`, then deploy `apps/web/dist` to the static host.
