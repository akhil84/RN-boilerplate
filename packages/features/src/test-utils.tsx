import type { RenderOptions } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';

import { renderWithProviders as renderWithUiProviders } from '@starter/ui/test-utils';

import './i18n/i18n';

import { makeStore } from './store/store';

/**
 * Render a feature component with every app-level provider: safe area (from @starter/ui) plus a
 * fresh Redux store per test. Returns the store so tests can dispatch and inspect state.
 */
export async function renderWithProviders(
  ui: ReactElement,
  {
    store = makeStore().store,
    ...options
  }: RenderOptions & { store?: ReturnType<typeof makeStore>['store'] } = {},
) {
  const result = await renderWithUiProviders(<Provider store={store}>{ui}</Provider>, options);
  return { ...result, store };
}

export * from '@testing-library/react-native';
