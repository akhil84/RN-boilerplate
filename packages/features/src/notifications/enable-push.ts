import { createAsyncThunk } from '@reduxjs/toolkit';

import { analytics, reportError } from '@starter/config/observability';

import type { AppDispatch } from '../store/store';
import { devicesApi } from './devices-api';
import { getPushRegistration, requestPushPermission } from './notifications';
import type { PushPermission } from './types';

/**
 * Ask for permission and, if granted, register this device with the backend. Resolves the final
 * permission; registration failures are reported but do not undo the permission.
 */
export const enablePushNotifications = createAsyncThunk<
  PushPermission,
  void,
  { dispatch: AppDispatch }
>('notifications/enable', async (_, { dispatch }) => {
  const permission = await requestPushPermission();
  analytics.track('push_permission_result', { permission });
  if (permission !== 'granted') return permission;

  try {
    const registration = await getPushRegistration();
    if (registration)
      await dispatch(devicesApi.endpoints.registerDevice.initiate(registration)).unwrap();
  } catch (error) {
    reportError(error, { flow: 'push-registration' });
  }
  return permission;
});
