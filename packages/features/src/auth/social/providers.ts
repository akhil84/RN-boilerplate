import { Platform } from 'react-native';

import type { Env } from '@starter/core/env';

import type { SocialProvider } from '../types';

type Os = typeof Platform.OS;

/**
 * Which social buttons to show (ADR-0016). A provider appears only when it is configured for
 * the current platform:
 * - Google: needs the web client ID everywhere (it is the token audience), plus the iOS client
 *   ID on iOS.
 * - Apple: native on iOS (expo-apple-authentication, EXPO_PUBLIC_APPLE_SIGN_IN=true); on web via
 *   Sign in with Apple JS (service ID + redirect URI). Not offered on Android.
 */
export function getAvailableProviders(
  env: Pick<Env, 'google' | 'apple'>,
  os: Os = Platform.OS,
): SocialProvider[] {
  const providers: SocialProvider[] = [];

  const googleReady = !!env.google.webClientId && (os !== 'ios' || !!env.google.iosClientId);
  if (googleReady) providers.push('google');

  const appleReady =
    (os === 'ios' && env.apple.enabled) ||
    (os === 'web' && !!env.apple.serviceId && !!env.apple.redirectUri);
  if (appleReady) providers.push('apple');

  return providers;
}
