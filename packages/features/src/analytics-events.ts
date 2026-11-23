import type { ThemePreference } from './store/preferences-slice';
import type { LanguagePreference } from './i18n/languages';

/**
 * Analytics events sent by @starter/features (ADR-0014). Add an event here before tracking it;
 * `analytics.track` only accepts names and properties declared in this map.
 */
declare module '@starter/config/observability' {
  interface AnalyticsEventMap {
    theme_changed: { theme: ThemePreference };
    language_changed: { language: LanguagePreference };
  }
}
