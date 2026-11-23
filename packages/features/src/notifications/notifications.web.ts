import type { PushPermission, PushRegistration } from './types';

/** Web push (service workers, VAPID) is out of scope (ADR-0019): every call is a safe no-op. */
export const isPushSupported = false;

export function configureNotificationHandling() {}

export async function getPushPermission(): Promise<PushPermission> {
  return 'unsupported';
}

export async function requestPushPermission(): Promise<PushPermission> {
  return 'unsupported';
}

export async function getPushRegistration(): Promise<PushRegistration | null> {
  return null;
}

export function useNotificationDeepLinks() {}
