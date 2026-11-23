# ADR-0014: Vendor-neutral analytics interface

Status: Accepted · Date: 2026-11-23 · Implemented on `feat/monorepo-starter`

Source: [decision record](../00-product/monorepo-starter-decisions.md) Q28.

## Context

The analytics vendor is usually chosen by the client and varies between projects. Options: a
vendor-neutral interface; wiring a specific vendor (PostHog, Firebase); no analytics.

## Decision

- `analytics.track(event, props)`, `analytics.screen(name)`, `analytics.identify(id, traits)`.
- Event names typed as an `AnalyticsEvent` union.
- Screen views tracked automatically from Expo Router route changes in each app's root layout.
- Default adapter: console in development, no-op in production.
- A guide explains writing a vendor adapter, with PostHog as the worked example.
- A Jest helper lets tests assert that events fired.

## Consequences

- No vendor account needed to run the starter.
- Each project writes one small adapter.
- Typo-free event names; acceptance criteria can include analytics events.

## Implementation notes (2026-11-23)

- Implemented as decided. Features declare events by augmenting `AnalyticsEventMap` (`packages/features/src/analytics-events.ts`). The default adapter is silent in production and in tests.
- Vendor adapter guide with PostHog as the worked example: `docs/guides/analytics-adapters.md`.
