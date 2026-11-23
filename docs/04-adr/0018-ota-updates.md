# ADR-0018: EAS Update for over-the-air updates

Status: Accepted · Date: 2026-11-23 · Implemented on `feat/monorepo-starter`

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q33.

## Context

Options: EAS Update configured from the start; not included (builds made without `expo-updates`
can never receive updates); included with forced-update screens (needs a backend-controlled
minimum version).

## Decision

- `expo-updates` in `apps/mobile`, one channel per variant (`development`, `preview`,
  `production`).
- Runtime version policy: `fingerprint`.
- Check on launch, apply on next start.
- `/ship` prints the `eas update` command; agents never run it.
- Sentry source maps uploaded per update.

## Consequences

- JS fixes reach users without store review.
- Fingerprint prevents updates reaching binaries with mismatched native code.
- Users get a fix on the second launch after publishing.
- Forced updates left to project ADRs.

## Implementation notes (2026-11-23)

- Implemented as decided. Updates stay **disabled until `EAS_PROJECT_ID` is set** (`updates.enabled: false`), since a starter has no EAS project.
- After `eas update`, upload the update's source maps with `pnpm sentry:upload-update` (ADR-0013).
