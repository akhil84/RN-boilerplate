import type { ThemePreference } from './store/preferences-slice';
import type { SignInMethod } from './auth/types';
import type { LanguagePreference } from './i18n/languages';
import type { PushPermission } from './notifications/types';

/**
 * Analytics events sent by @starter/features (ADR-0014). Add an event here before tracking it;
 * `analytics.track` only accepts names and properties declared in this map.
 */
declare module '@starter/config/observability' {
  interface AnalyticsEventMap {
    theme_changed: { theme: ThemePreference };
    language_changed: { language: LanguagePreference };
    sign_in_succeeded: { method: SignInMethod };
    sign_out: undefined;
    push_permission_result: { permission: PushPermission };
  }
}
