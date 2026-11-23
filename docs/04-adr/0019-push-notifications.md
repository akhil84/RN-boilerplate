# ADR-0019: Push notification plumbing with expo-notifications

Status: Accepted · Date: 2026-11-23 · Implemented on `feat/monorepo-starter`

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q34.

## Context

Options: plumbing without provider tie-in; not included; a full setup tied to Expo's push service
(assumes the backend uses it).

## Decision

- `expo-notifications` in `apps/mobile`.
- Permission requested from a screen via `requestPushPermission()`, never at launch.
- Device token registered through a `registerDevice` endpoint in `api-client`.
- Notification taps open screens through Expo Router deep links (`data.url`).
- Foreground handling and Android notification channels configured.
- No web push.

## Consequences

- Inactive until a project adds APNs / FCM credentials (README covers setup).
- Backend decides whether to send via Expo's push service or FCM / APNs directly.
- Android push tokens need a dev build (ADR-0025).

## Implementation notes (2026-11-23)

- Implemented as decided. Registration prefers an Expo push token (needs the EAS project ID) and falls back to the raw APNs / FCM token; simulators register nothing.
- Notification taps only open **internal paths** (`/…`); external URLs, `//host` and `javascript:` are ignored (tested). Web is a no-op module, and Settings hides the row.
