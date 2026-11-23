/**
 * Top-level destinations of the signed-in app — the single source for mobile's native tabs and the
 * web sidebar / menu (ADR-0026). Add a screen here once and both apps show it.
 *
 * - `route`: the file in each app's `src/app/(app)/` (e.g. `settings.tsx`)
 * - `href`:  its URL
 * - `labelKey`: key in the `common` i18n namespace
 * - `icon`: SF Symbol (iOS) and Material Symbol (Android) names
 */
export const destinations = [
  {
    route: 'index',
    href: '/',
    labelKey: 'tabs.home',
    icon: { sf: { default: 'house', selected: 'house.fill' }, md: 'home' },
    testID: 'nav-home',
  },
  {
    route: 'settings',
    href: '/settings',
    labelKey: 'tabs.settings',
    icon: { sf: { default: 'gearshape', selected: 'gearshape.fill' }, md: 'settings' },
    testID: 'nav-settings',
  },
] as const;

export type Destination = (typeof destinations)[number];
