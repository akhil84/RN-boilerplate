import type { MockHandler } from '@starter/api-client';

import { isMockAuthorized } from '@app/mocks/helpers';
import type { Item } from '@features/home/types';

/** Home endpoints of the in-app mock API (dev / tests / E2E; never in production builds). */
export const mockItems: Item[] = Array.from({ length: 12 }, (_, index) => ({
  id: String(index + 1),
  title: `Example item ${index + 1}`,
  description: 'Served by the in-app mock API (packages/features/src/features/home/mocks).',
}));

export const homeMockHandlers: MockHandler[] = [
  {
    method: 'GET',
    path: '/items',
    respond: ({ headers }) =>
      isMockAuthorized(headers.get('Authorization'))
        ? { status: 200, body: mockItems }
        : { status: 401, body: { code: 'UNAUTHORIZED', message: 'Sign in required' } },
  },
];
