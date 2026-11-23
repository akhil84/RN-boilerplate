import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { getNotificationPath, type PushPermission, type PushRegistration } from './types';

/**
 * Push notification plumbing (ADR-0019). Inactive until the project adds push credentials
 * (APNs key / FCM google-services.json) and an EAS project ID — see the README.
 */
export const isPushSupported = true;

const ANDROID_CHANNEL_ID = 'default';

/** Show notifications that arrive while the app is open. Call once at startup. */
export function configureNotificationHandling() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

// Android 13+ only shows the permission prompt once a channel exists.
async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Default',
    importance: AndroidImportance.DEFAULT,
  });
}

export async function getPushPermission(): Promise<PushPermission> {
  const { status } = await Notifications.getPermissionsAsync();
  return status as PushPermission;
}

/** Ask for permission. Call from a screen where the value is clear — never cold at launch. */
export async function requestPushPermission(): Promise<PushPermission> {
  await ensureAndroidChannel();
  const { status } = await Notifications.requestPermissionsAsync();
  return status as PushPermission;
}

/**
 * The token to register with the backend. Prefers an Expo push token (needs the EAS project ID);
 * falls back to the raw APNs / FCM token. Simulators cannot receive push, so they return null.
 */
export async function getPushRegistration(): Promise<PushRegistration | null> {
  if (!Device.isDevice) return null;
  const projectId =
    (Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined)?.projectId ??
    Constants.easConfig?.projectId;

  if (projectId) {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return { type: 'expo', token: data };
  }
  const { data, type } = await Notifications.getDevicePushTokenAsync();
  return { type: type === 'ios' ? 'ios' : 'android', token: String(data) };
}

// The last response survives remounts of the signed-in area (e.g. sign out, sign back in), so
// remember which taps were handled — otherwise an old tap would reopen its screen every time.
const handledResponses = new Set<string>();

/** Open the screen named in a tapped notification's `data.url` (internal paths only), once. */
export function useNotificationDeepLinks() {
  const response = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!response) return;
    const id = `${response.notification.request.identifier}:${response.actionIdentifier}`;
    if (handledResponses.has(id)) return;
    handledResponses.add(id);
    const path = getNotificationPath(response.notification.request.content.data);
    if (path) router.push(path as never);
  }, [response]);
}
