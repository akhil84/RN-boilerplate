import { useEffect, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { setupAppListeners } from './listeners';
import { makeStore } from './store';

let appStore: ReturnType<typeof makeStore> | undefined;

/** The app's single store, created on first use. */
export function getAppStore() {
  appStore ??= makeStore();
  return appStore;
}

/**
 * App-wide providers for both apps' root layouts. Children render only after persisted state has
 * been restored, so keep the splash screen up until then (hide it from a child's effect).
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const { store, persistor } = getAppStore();

  useEffect(() => setupAppListeners(store.dispatch), [store]);

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={null}>
        {children}
      </PersistGate>
    </Provider>
  );
}
