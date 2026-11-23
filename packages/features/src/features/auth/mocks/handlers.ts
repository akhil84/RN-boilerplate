import type { MockHandler } from '@starter/api-client';

import { MOCK_ACCESS_TOKEN_PREFIX } from '@app/mocks/helpers';
import { AUTH_PATHS, type User } from '@features/auth/types';

/**
 * Auth endpoints of the in-app mock API (dev / tests / E2E; never in production builds).
 * Demo credentials: any email, password `password`.
 */
export const DEMO_PASSWORD = 'password';

const demoUser = (email?: string | null): User => ({
  id: 'user-1',
  email: email ?? 'demo@example.com',
  name: 'Demo User',
});

let tokenCounter = 0;
const issueTokens = () => {
  tokenCounter += 1;
  return {
    accessToken: `${MOCK_ACCESS_TOKEN_PREFIX}${tokenCounter}`,
    refreshToken: `mock-refresh-${tokenCounter}`,
  };
};

export const authMockHandlers: MockHandler[] = [
  {
    method: 'POST',
    path: AUTH_PATHS.login,
    respond: ({ body }) => {
      const { email, password } = (body ?? {}) as { email?: string; password?: string };
      if (password !== DEMO_PASSWORD) {
        return {
          status: 401,
          body: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' },
        };
      }
      return { status: 200, body: { ...issueTokens(), user: demoUser(email) } };
    },
  },
  {
    method: 'POST',
    path: AUTH_PATHS.social,
    respond: ({ body }) => {
      const { idToken } = (body ?? {}) as { idToken?: string };
      if (!idToken)
        return { status: 400, body: { code: 'MISSING_TOKEN', message: 'idToken is required' } };
      return { status: 200, body: { ...issueTokens(), user: demoUser() } };
    },
  },
  {
    method: 'POST',
    path: AUTH_PATHS.refresh,
    respond: ({ body }) => {
      const { refreshToken } = (body ?? {}) as { refreshToken?: string };
      // Cookie mode sends no body; the mock accepts it as if the cookie were valid.
      if (refreshToken !== undefined && !refreshToken.startsWith('mock-refresh-')) {
        return { status: 401, body: { code: 'INVALID_REFRESH', message: 'Session expired' } };
      }
      return { status: 200, body: issueTokens() };
    },
  },
  { method: 'POST', path: AUTH_PATHS.logout, respond: () => ({ status: 204 }) },
];
