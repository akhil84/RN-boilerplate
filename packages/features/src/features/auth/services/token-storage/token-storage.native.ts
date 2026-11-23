import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { userSchema } from '@features/auth/types';
import type { StoredSession, TokenStorage } from './types';

// SecureStore keys allow letters, numbers, `.`, `-` and `_`.
const KEYS = {
  accessToken: 'auth.accessToken',
  refreshToken: 'auth.refreshToken',
  user: 'auth.user',
} as const;

let cachedAccessToken: string | null | undefined;

/**
 * iOS keeps Keychain items after the app is deleted, so a reinstall would silently restore the
 * previous install's session. App storage (AsyncStorage) *is* wiped on uninstall, so a missing
 * marker there means "fresh install": drop any leftover tokens before trusting them.
 */
const INSTALL_MARKER = 'auth.installMarker';

async function forgetTokensFromPreviousInstall() {
  if (await AsyncStorage.getItem(INSTALL_MARKER)) return;
  await Promise.all(Object.values(KEYS).map((key) => SecureStore.deleteItemAsync(key)));
  await AsyncStorage.setItem(INSTALL_MARKER, '1');
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

/** iOS Keychain / Android Keystore. Tokens never touch AsyncStorage or Redux. */
export const tokenStorage: TokenStorage = {
  refreshTransport: 'body',

  async load() {
    await forgetTokensFromPreviousInstall();
    const [accessToken, refreshToken, user] = await Promise.all([
      SecureStore.getItemAsync(KEYS.accessToken),
      SecureStore.getItemAsync(KEYS.refreshToken),
      SecureStore.getItemAsync(KEYS.user).then(parseUser),
    ]);
    cachedAccessToken = accessToken;
    if (!user || (!accessToken && !refreshToken)) return null;
    return { accessToken, refreshToken, user };
  },

  async save({ accessToken, refreshToken, user }: StoredSession) {
    cachedAccessToken = accessToken;
    await AsyncStorage.setItem(INSTALL_MARKER, '1'); // a session saved now belongs to this install
    await Promise.all([
      accessToken
        ? SecureStore.setItemAsync(KEYS.accessToken, accessToken)
        : SecureStore.deleteItemAsync(KEYS.accessToken),
      refreshToken
        ? SecureStore.setItemAsync(KEYS.refreshToken, refreshToken)
        : SecureStore.deleteItemAsync(KEYS.refreshToken),
      SecureStore.setItemAsync(KEYS.user, JSON.stringify(user)),
    ]);
  },

  async clear() {
    cachedAccessToken = null;
    await Promise.all(Object.values(KEYS).map((key) => SecureStore.deleteItemAsync(key)));
  },

  async getAccessToken() {
    if (cachedAccessToken === undefined) {
      cachedAccessToken = await SecureStore.getItemAsync(KEYS.accessToken);
    }
    return cachedAccessToken;
  },
};
