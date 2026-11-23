# Release checklist

1. [ ] All requirements in this release are `Status: Done`
2. [ ] `npm run verify` green on `main`
3. [ ] Maestro smoke flows green on Android and iOS release builds
4. [ ] Bump `expo.version` in `app.json` (SemVer)
5. [ ] Move _Unreleased_ entries in `CHANGELOG.md` under the new version + date
6. [ ] `npx eas-cli@latest build --profile production --platform all`
7. [ ] Smoke-test the store builds on a physical device
8. [ ] `npx eas-cli@latest submit --platform all`
9. [ ] Tag the commit `vX.Y.Z`

JS-only fixes may ship as an OTA update: `npx eas-cli@latest update --branch production`.
