# Analytics: writing a vendor adapter

Features never call an analytics SDK directly (ADR-0014). They call `analytics.track / screen /
identify / reset` from `@starter/config/observability`, with event names declared in
`packages/features/src/analytics-events.ts`. A project connects its vendor by writing one small
adapter and installing it at startup. Until then, development logs to the console and production
sends nothing.

## The contract

```ts
type AnalyticsAdapter = {
  track: (event: string, props?: Record<string, unknown>) => void;
  screen: (name: string, props?: Record<string, unknown>) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
  reset: () => void; // called on sign-out
};
```

Screen views are already sent on every route change (`useScreenTracking`), sign-in calls
`identify(user.id)` and sign-out calls `reset()` — an adapter only maps these calls to the SDK.

## Worked example: PostHog

1. Install the SDK in the apps that use it (and move the version into the pnpm catalog):

   ```bash
   pnpm --filter @starter/mobile exec expo install posthog-react-native
   pnpm --filter @starter/web exec expo install posthog-react-native
   ```

2. Add public config (`EXPO_PUBLIC_POSTHOG_KEY`, `EXPO_PUBLIC_POSTHOG_HOST`) to the env schema in
   `packages/config/src/env.ts` — keys and `readRawEnv` — so a missing value fails fast.

3. Write the adapter, e.g. `packages/features/src/analytics/posthog-adapter.ts`:

   ```ts
   import PostHog from 'posthog-react-native';

   import type { AnalyticsAdapter } from '@starter/config/observability';

   export function createPostHogAdapter(apiKey: string, host: string): AnalyticsAdapter {
     const client = new PostHog(apiKey, { host });
     return {
       track: (event, props) => client.capture(event, props),
       screen: (name, props) => void client.screen(name, props),
       identify: (userId, traits) => client.identify(userId, traits),
       reset: () => client.reset(),
     };
   }
   ```

   Check the SDK's current API against the PostHog React Native docs when you add it — method
   names and options change between major versions.

4. Install it once, before the first screen renders — e.g. in `getAppStore()`
   (`packages/features/src/store/app-providers.tsx`):

   ```ts
   const { posthogKey, posthogHost } = getEnv();
   if (posthogKey) setAnalyticsAdapter(createPostHogAdapter(posthogKey, posthogHost));
   ```

5. Test features with `recordAnalytics()` as today; test the adapter itself with a mocked SDK.
   Record the vendor choice in an ADR.

## Privacy

Send opaque IDs and coarse properties only — no emails, names or free text. Respect the user's
consent choice before installing the adapter where the law requires it (GDPR, App Store privacy
labels).
