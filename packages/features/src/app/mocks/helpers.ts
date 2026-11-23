/** Shared helpers for feature mock handlers (dev / tests / E2E only). */

/** Access tokens issued by the auth mock start with this. */
export const MOCK_ACCESS_TOKEN_PREFIX = 'mock-access-';

/** True when a mock request carries a token issued by the auth mock. */
export const isMockAuthorized = (authorization: string | null) =>
  authorization?.startsWith(`Bearer ${MOCK_ACCESS_TOKEN_PREFIX}`) ?? false;
