import { getEnv } from '@starter/core/env';

import { userSchema } from '../types';
import type { StoredSession, TokenStorage } from './types';

/**
 * Web token storage (ADR-0015), chosen by EXPO_PUBLIC_WEB_AUTH_MODE:
 *
 * - `local` (default): tokens in localStorage. Works with any backend, but any XSS or compromised
 *   third-party script can read them — keep access tokens short-lived and use a strict CSP.
 * - `cookie`: the backend keeps the refresh token in an httpOnly cookie that JavaScript cannot
 *   read; the access token lives only in memory and is re-obtained on reload via /auth/refresh.
 *   Requires backend support (cookie issuing, CORS with credentials, CSRF protection).
 */
const KEYS = {
  accessToken: 'auth.accessToken',
  refreshToken: 'auth.refreshToken',
  user: 'auth.user',
} as const;

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null; // e.g. blocked by browser privacy settings
  }
}

function parseUser(value: string | null) {
  if (!value) return null;
  try {
    const result = userSchema.safeParse(JSON.parse(value));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function createWebTokenStorage(mode: 'local' | 'cookie'): TokenStorage {
  let memoryAccessToken: string | null = null;

  if (mode === 'cookie') {
    return {
      refreshTransport: 'cookie',
      async load() {
        // The user profile is not secret; the session itself is proven by the refresh cookie.
        const user = parseUser(storage()?.getItem(KEYS.user) ?? null);
        return user ? { accessToken: null, refreshToken: null, user } : null;
      },
      async save({ accessToken, user }: StoredSession) {
        memoryAccessToken = accessToken;
        storage()?.setItem(KEYS.user, JSON.stringify(user));
      },
      async clear() {
        memoryAccessToken = null;
        storage()?.removeItem(KEYS.user);
      },
      async getAccessToken() {
        return memoryAccessToken;
      },
    };
  }

  return {
    refreshTransport: 'body',
    async load() {
      const store = storage();
      const accessToken = store?.getItem(KEYS.accessToken) ?? null;
      const refreshToken = store?.getItem(KEYS.refreshToken) ?? null;
      const user = parseUser(store?.getItem(KEYS.user) ?? null);
      memoryAccessToken = accessToken;
      if (!user || (!accessToken && !refreshToken)) return null;
      return { accessToken, refreshToken, user };
    },
    async save({ accessToken, refreshToken, user }: StoredSession) {
      memoryAccessToken = accessToken;
      const store = storage();
      if (!store) return;
      if (accessToken) store.setItem(KEYS.accessToken, accessToken);
      else store.removeItem(KEYS.accessToken);
      if (refreshToken) store.setItem(KEYS.refreshToken, refreshToken);
      else store.removeItem(KEYS.refreshToken);
      store.setItem(KEYS.user, JSON.stringify(user));
    },
    async clear() {
      memoryAccessToken = null;
      const store = storage();
      Object.values(KEYS).forEach((key) => store?.removeItem(key));
    },
    async getAccessToken() {
      return memoryAccessToken ?? storage()?.getItem(KEYS.accessToken) ?? null;
    },
  };
}

export const tokenStorage: TokenStorage = createWebTokenStorage(getEnv().webAuthMode);
