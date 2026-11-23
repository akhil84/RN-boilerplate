import {
  configureApiClient,
  createMockFetch,
  getApiBaseUrl,
  type MockHandler,
} from '@starter/api-client';
import { getAppVariant, getEnv } from '@starter/core/env';

import { mockHandlers } from './handlers';

export { DEMO_PASSWORD, mockHandlers, mockItems } from './handlers';

/** Mocks run only when asked for, and never in a production build — whatever the env says. */
export function areMocksEnabled() {
  return getEnv().apiMocks && getAppVariant() !== 'production';
}

/** Route API calls to the in-app mock backend. Returns whether mocks were enabled. */
export function enableApiMocks(handlers: MockHandler[] = mockHandlers, latencyMs?: number) {
  if (!areMocksEnabled()) return false;
  configureApiClient({
    fetchFn: createMockFetch(handlers, { baseUrl: getApiBaseUrl(), latencyMs }),
  });
  return true;
}
