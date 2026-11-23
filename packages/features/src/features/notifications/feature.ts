import './analytics';

import { defineFeature } from '@app/feature';
import { notificationsMockHandlers } from './mocks/handlers';

export const notificationsFeature = defineFeature({
  name: 'notifications',
  mockHandlers: notificationsMockHandlers,
});
