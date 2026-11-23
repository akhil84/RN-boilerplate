import {
  configureApiClient,
  createMockFetch,
  getApiBaseUrl,
  type MockHandler,
} from '@starter/api-client';
import { getAppVariant, getEnv } from '@starter/core/env';

import { features } from '@app/registry';

export { isMockAuthorized, MOCK_ACCESS_TOKEN_PREFIX } from './helpers';

/** All features' mock handlers, from the registry (read lazily to avoid import cycles). */
export function getMockHandlers(): MockHandler[] {
  return features.flatMap((feature) => [...feature.mockHandlers]);
}

/** Mocks run only when asked for, and never in a production build — whatever the env says. */
export function areMocksEnabled() {
  return getEnv().apiMocks && getAppVariant() !== 'production';
}

/** Route API calls to the in-app mock backend. Returns whether mocks were enabled. */
export function enableApiMocks(handlers: MockHandler[] = getMockHandlers(), latencyMs?: number) {
  if (!areMocksEnabled()) return false;
  configureApiClient({
    fetchFn: createMockFetch(handlers, { baseUrl: getApiBaseUrl(), latencyMs }),
  });
  return true;
}
