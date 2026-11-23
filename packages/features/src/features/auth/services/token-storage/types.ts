import type { User } from '@features/auth/types';

export type StoredSession = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User;
};

/**
 * Where the session is kept between launches (ADR-0015). Implementations:
 * - token-storage.native.ts — iOS Keychain / Android Keystore via expo-secure-store
 * - token-storage.web.ts — `local` (localStorage) or `cookie` (httpOnly refresh cookie) mode
 */
export type TokenStorage = {
  load: () => Promise<StoredSession | null>;
  save: (session: StoredSession) => Promise<void>;
  clear: () => Promise<void>;
  /** Fast path for every request; kept in memory after load/save. */
  getAccessToken: () => Promise<string | null>;
  /** How the refresh call sends credentials: in the body, or as an httpOnly cookie. */
  refreshTransport: 'body' | 'cookie';
};
