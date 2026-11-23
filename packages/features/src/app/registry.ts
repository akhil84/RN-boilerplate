import { authFeature } from '@features/auth/feature';
import { homeFeature } from '@features/home/feature';
import { notificationsFeature } from '@features/notifications/feature';
import { settingsFeature } from '@features/settings/feature';

/**
 * Every feature in the app — the only list of features (ADR-0026). The store's reducers, the i18n
 * namespaces and the mock API are derived from it. `pnpm new:feature <name>` adds entries here.
 */
export const features = [
  authFeature,
  homeFeature,
  notificationsFeature,
  settingsFeature,
  // new-feature:registry (do not remove — `pnpm new:feature` inserts above this line)
] as const;

export type AppFeature = (typeof features)[number];
