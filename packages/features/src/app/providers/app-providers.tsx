import { useEffect, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { analytics } from '@starter/core/observability';
import { ColorSchemeProvider } from '@starter/ui';

import { connectApiClientToSession, restoreSession } from '@features/auth';
import { useLanguageSync } from '@app/i18n/use-language-sync';
import { enableApiMocks } from '@app/mocks';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import { setupAppListeners } from '@app/store/listeners';
import { selectThemePreference } from '@app/store/preferences-slice';
import { makeStore } from '@app/store/store';

let appStore: ReturnType<typeof makeStore> | undefined;

/** The app's single store, created on first use and connected to the API client. */
export function getAppStore() {
  if (!appStore) {
    appStore = makeStore();
    connectApiClientToSession(appStore.store.dispatch);
    enableApiMocks();
    analytics.track('app_opened');
  }
  return appStore;
}

/** Applies the persisted preferences: language, and the theme override for @starter/ui. */
function PreferencesBridge({ children }: { children: ReactNode }) {
  useLanguageSync();
  const theme = useAppSelector(selectThemePreference);
  return (
    <ColorSchemeProvider scheme={theme === 'system' ? null : theme}>{children}</ColorSchemeProvider>
  );
}

/** Checks the stored session once at launch (status leaves `unknown` when done). */
function SessionBootstrap() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    void dispatch(restoreSession());
  }, [dispatch]);
  return null;
}

/**
 * App-wide providers for both apps' root layouts. Children render once persisted state is
 * restored; keep the splash screen up until the session status is known (`useSessionStatus`).
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const { store, persistor } = getAppStore();

  useEffect(() => setupAppListeners(store.dispatch), [store]);

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={null}>
        <SessionBootstrap />
        <PreferencesBridge>{children}</PreferencesBridge>
      </PersistGate>
    </Provider>
  );
}
