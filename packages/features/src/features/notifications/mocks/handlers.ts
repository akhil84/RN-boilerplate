import type { MockHandler } from '@starter/api-client';

import { DEVICES_PATH } from '@features/notifications/api/devices-api';

/** Notification endpoints of the in-app mock API (dev / tests / E2E; never in production). */
export const notificationsMockHandlers: MockHandler[] = [
  { method: 'POST', path: DEVICES_PATH, respond: () => ({ status: 204 }) },
];
