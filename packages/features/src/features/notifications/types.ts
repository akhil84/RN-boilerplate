export type PushPermission = 'granted' | 'denied' | 'undetermined' | 'unsupported';

/** What the backend needs to send to this device (ADR-0019). */
export type PushRegistration = {
  /** `expo` tokens go through Expo's push service; `ios` / `android` are raw APNs / FCM tokens. */
  type: 'expo' | 'ios' | 'android';
  token: string;
};

/**
 * Notification taps may only open screens inside the app: a relative path such as `/settings`.
 * Anything else (`https://…`, `//host`, `javascript:`) is ignored, so a crafted payload cannot
 * send users to an arbitrary site.
 */
export function getNotificationPath(data: unknown): string | null {
  const url = (data as { url?: unknown } | null | undefined)?.url;
  if (typeof url !== 'string') return null;
  if (!url.startsWith('/') || url.startsWith('//') || url.includes('\\')) return null;
  return url;
}
