import type { SignInMethod } from './types';

/** Analytics events sent by the auth feature (ADR-0014); `analytics.track` only accepts these. */
declare module '@starter/core/observability' {
  interface AnalyticsEventMap {
    sign_in_succeeded: { method: SignInMethod };
    sign_out: undefined;
  }
}
