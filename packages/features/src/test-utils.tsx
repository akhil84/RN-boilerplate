import type { RenderOptions } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';

import { renderWithProviders as renderWithUiProviders } from '@starter/ui/test-utils';

import './i18n/i18n';

import {
  configureApiClient,
  createMockFetch,
  resetApiClient,
  type MockHandler,
} from '@starter/api-client';

import { connectApiClientToSession } from './auth/auth-service';
import { mockHandlers } from './mocks/handlers';
import { makeStore } from './store/store';

/**
 * Render a feature component with every app-level provider: safe area (from @starter/ui) plus a
 * fresh Redux store per test. Returns the store so tests can dispatch and inspect state.
 */
export async function renderWithProviders(
  ui: ReactElement,
  {
    store = makeStore({ persistTimeoutMs: 0 }).store,
    ...options
  }: RenderOptions & { store?: ReturnType<typeof makeStore>['store'] } = {},
) {
  const result = await renderWithUiProviders(<Provider store={store}>{ui}</Provider>, options);
  return { ...result, store };
}

/**
 * Point the API client at the in-app mock backend (no latency, no retry delay). Pass handlers to
 * override responses, e.g. an empty list or a 500, for one test.
 */
export function setupMockApi(handlers: MockHandler[] = mockHandlers, latencyMs = 0) {
  resetApiClient();
  configureApiClient({
    baseUrl: 'https://api.test',
    retryDelayMs: 0,
    fetchFn: createMockFetch(handlers, { baseUrl: 'https://api.test', latencyMs }),
  });
}

/** A store wired to the session like the real app (auth adapter for 401 refresh / sign-out). */
export function makeConnectedStore() {
  const { store } = makeStore({ persistTimeoutMs: 0 });
  connectApiClientToSession(store.dispatch);
  return store;
}

export * from '@testing-library/react-native';
