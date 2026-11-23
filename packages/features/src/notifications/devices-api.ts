import { Platform } from 'react-native';

import { api } from '@starter/api-client';

import type { PushRegistration } from './types';

/** Change the path / body to match your backend's device registration endpoint. */
export const DEVICES_PATH = '/devices';

export const devicesApi = api.injectEndpoints({
  endpoints: (build) => ({
    registerDevice: build.mutation<void, PushRegistration>({
      query: (registration) => ({
        url: DEVICES_PATH,
        method: 'POST',
        body: { ...registration, platform: Platform.OS },
      }),
    }),
  }),
});
