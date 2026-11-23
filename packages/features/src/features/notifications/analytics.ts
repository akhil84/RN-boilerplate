import type { PushPermission } from './types';

/** Analytics events sent by the notifications feature (ADR-0014). */
declare module '@starter/core/observability' {
  interface AnalyticsEventMap {
    push_permission_result: { permission: PushPermission };
  }
}
