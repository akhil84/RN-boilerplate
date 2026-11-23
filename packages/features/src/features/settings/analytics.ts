import type { LanguagePreference } from '@app/i18n/languages';
import type { ThemePreference } from '@app/store/preferences-slice';

/** Analytics events sent by the settings feature (ADR-0014). */
declare module '@starter/core/observability' {
  interface AnalyticsEventMap {
    theme_changed: { theme: ThemePreference };
    language_changed: { language: LanguagePreference };
  }
}
