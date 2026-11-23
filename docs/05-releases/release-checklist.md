# Release checklist

Each app is released on its own (ADR-0023). Run the list for the app you are shipping.

## Mobile (`apps/mobile`)

1. [ ] All requirements in this release are `Status: Done`
2. [ ] `pnpm verify` green on the release commit (there is no CI — run it locally)
3. [ ] Maestro smoke flows green on Android and iOS preview builds (`pnpm test:e2e:mobile:smoke`)
4. [ ] Bump `version` in `apps/mobile/app.config.ts` (SemVer); build numbers are managed by EAS
5. [ ] Move _Unreleased_ entries in `apps/mobile/CHANGELOG.md` under the new version + date
6. [ ] `pnpm dlx eas-cli build --profile production --platform all` (from `apps/mobile`)
7. [ ] Smoke-test the store builds on a physical device
8. [ ] `pnpm dlx eas-cli submit --platform all`
9. [ ] Tag the commit `mobile-vX.Y.Z`

JS-only fixes may ship as an OTA update instead: `pnpm dlx eas-cli update --channel production`
(fingerprint runtime versions keep it away from builds with different native code).

## Web (`apps/web`)

1. [ ] All requirements in this release are `Status: Done`
2. [ ] `pnpm verify` and `pnpm test:e2e:web:all` green
3. [ ] Bump `version` in `apps/web/app.config.ts`; move _Unreleased_ entries in `apps/web/CHANGELOG.md`
4. [ ] `APP_VARIANT=production pnpm --filter @starter/web export` with production env values
5. [ ] Deploy `apps/web/dist` to the static host (single-page app: unknown paths → `index.html`)
6. [ ] Tag the commit `web-vX.Y.Z`
