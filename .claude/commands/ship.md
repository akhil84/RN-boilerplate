---
description: Prepare a release — verify, changelog, version bump, and the PR/release notes
argument-hint: [patch|minor|major]
---

Prepare a release (bump: ${ARGUMENTS:-patch}).

1. Run `npm run verify`. Stop and report if anything fails.
2. Walk `docs/05-releases/release-checklist.md` and report each item as done / not done / needs a human.
3. Bump `expo.version` in `app.json`, move _Unreleased_ entries in `docs/05-releases/CHANGELOG.md` under the new version with today's date.
4. Mark shipped requirements `Status: Done`.
5. Draft release notes (user-facing, plain words) and print the EAS commands to run. Do not run `eas build`, `eas submit` or `eas update` yourself — I will.
