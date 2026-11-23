import type { MockHandler } from '@starter/api-client';

import { AUTH_PATHS, type User } from '../auth/types';
import type { Item } from '../home/types';

/**
 * Mock backend used when EXPO_PUBLIC_API_MOCKS=true (never in production builds). Replace or
 * extend these as you build features; delete them once every endpoint exists on the real API.
 *
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
    accessToken: `mock-access-${tokenCounter}`,
    refreshToken: `mock-refresh-${tokenCounter}`,
  };
};

export const mockItems: Item[] = Array.from({ length: 12 }, (_, index) => ({
  id: String(index + 1),
  title: `Example item ${index + 1}`,
  description: 'Served by the in-app mock API (packages/features/src/mocks).',
}));

const requireAuth = (authorization: string | null) =>
  authorization?.startsWith('Bearer mock-access-');

export const mockHandlers: MockHandler[] = [
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
  { method: 'POST', path: '/devices', respond: () => ({ status: 204 }) },
  {
    method: 'GET',
    path: '/items',
    respond: ({ headers }) =>
      requireAuth(headers.get('Authorization'))
        ? { status: 200, body: mockItems }
        : { status: 401, body: { code: 'UNAUTHORIZED', message: 'Sign in required' } },
  },
];
