import './analytics';

import { defineFeature } from '@app/feature';
import en from './locales/en.json';
import { authMockHandlers } from './mocks/handlers';
import { sessionSlice } from './model/session-slice';

export const authFeature = defineFeature({
  name: 'auth',
  translations: { en },
  slices: [sessionSlice],
  mockHandlers: authMockHandlers,
});
