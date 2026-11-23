import { getEnv } from '@starter/config/env';

import type { SocialProvider } from '../types';
import { SocialSignInCancelledError, SocialSignInUnavailableError } from './errors';

/**
 * Web social sign-in without native SDKs (ADR-0016):
 * - Google Identity Services (One Tap prompt) — https://developers.google.com/identity/gsi/web
 * - Sign in with Apple JS (popup) — https://developer.apple.com/documentation/signinwithapplejs
 * Both scripts are loaded on demand, only when the user picks that provider.
 */
/**
 * One Tap status callbacks. Under FedCM some methods (e.g. `isNotDisplayed`) no longer exist, so
 * every one is optional and called defensively.
 */
type PromptMomentNotification = {
  isNotDisplayed?: () => boolean;
  isSkippedMoment?: () => boolean;
  isDismissedMoment?: () => boolean;
  getDismissedReason?: () => string;
};

type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: { credential?: string }) => void;
        cancel_on_tap_outside?: boolean;
      }) => void;
      prompt: (listener?: (notification: PromptMomentNotification) => void) => void;
    };
  };
};

type AppleId = {
  auth: {
    init: (config: {
      clientId: string;
      scope: string;
      redirectURI: string;
      usePopup: boolean;
    }) => void;
    signIn: () => Promise<{ authorization: { id_token: string } }>;
  };
};

declare global {
  interface Window {
    google?: GoogleIdentity;
    AppleID?: AppleId;
  }
}

const SCRIPTS = {
  google: 'https://accounts.google.com/gsi/client',
  apple: 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js',
};

const loaded = new Map<string, Promise<void>>();

function loadScript(src: string): Promise<void> {
  let promise = loaded.get(src);
  if (!promise) {
    promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        loaded.delete(src);
        reject(new Error(`Could not load ${src}`));
      };
      document.head.appendChild(script);
    });
    loaded.set(src, promise);
  }
  return promise;
}

async function googleIdToken(clientId: string): Promise<string> {
  if (!window.google) await loadScript(SCRIPTS.google);
  const google = window.google;
  if (!google) throw new SocialSignInUnavailableError('Google');

  return new Promise((resolve, reject) => {
    google.accounts.id.initialize({
      client_id: clientId,
      cancel_on_tap_outside: true,
      callback: ({ credential }) =>
        credential ? resolve(credential) : reject(new SocialSignInCancelledError()),
    });
    google.accounts.id.prompt((notification) => {
      // A successful sign-in also ends with a "dismissed" moment (reason `credential_returned`),
      // which must not be treated as a cancel.
      const dismissedByUser =
        notification.isDismissedMoment?.() === true &&
        notification.getDismissedReason?.() !== 'credential_returned';
      if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.() || dismissedByUser) {
        reject(new SocialSignInCancelledError());
      }
    });
  });
}

async function appleIdToken(serviceId: string, redirectUri: string): Promise<string> {
  if (!window.AppleID) await loadScript(SCRIPTS.apple);
  const appleId = window.AppleID;
  if (!appleId) throw new SocialSignInUnavailableError('Apple');

  appleId.auth.init({
    clientId: serviceId,
    scope: 'name email',
    redirectURI: redirectUri,
    usePopup: true,
  });
  try {
    const response = await appleId.auth.signIn();
    return response.authorization.id_token;
  } catch (error) {
    if ((error as { error?: string } | null)?.error === 'popup_closed_by_user') {
      throw new SocialSignInCancelledError();
    }
    throw error;
  }
}

export async function getIdToken(provider: SocialProvider): Promise<string> {
  const env = getEnv();
  if (provider === 'google') {
    if (!env.google.webClientId) throw new SocialSignInUnavailableError('Google');
    return googleIdToken(env.google.webClientId);
  }
  if (!env.apple.serviceId || !env.apple.redirectUri)
    throw new SocialSignInUnavailableError('Apple');
  return appleIdToken(env.apple.serviceId, env.apple.redirectUri);
}
