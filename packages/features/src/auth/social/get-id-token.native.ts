import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

import { getEnv } from '@starter/core/env';

import type { SocialProvider } from '../types';
import { SocialSignInCancelledError, SocialSignInUnavailableError } from './errors';

function isAppleCancel(error: unknown) {
  return (error as { code?: string } | null)?.code === 'ERR_REQUEST_CANCELED';
}

/** Run the provider's native sign-in sheet and return its ID token (a JWT for the backend). */
export async function getIdToken(provider: SocialProvider): Promise<string> {
  const env = getEnv();

  if (provider === 'google') {
    if (!env.google.webClientId) throw new SocialSignInUnavailableError('Google');
    GoogleSignin.configure({
      webClientId: env.google.webClientId,
      iosClientId: env.google.iosClientId,
    });
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) throw new SocialSignInCancelledError();
    if (!response.data.idToken) throw new Error('Google did not return an ID token');
    return response.data.idToken;
  }

  if (Platform.OS !== 'ios' || !(await AppleAuthentication.isAvailableAsync())) {
    throw new SocialSignInUnavailableError('Apple');
  }
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!credential.identityToken) throw new Error('Apple did not return an identity token');
    return credential.identityToken;
  } catch (error) {
    if (isAppleCancel(error)) throw new SocialSignInCancelledError();
    throw error;
  }
}
