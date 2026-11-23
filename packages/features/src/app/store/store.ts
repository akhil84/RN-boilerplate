import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  createMigrate,
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
  type MigrationManifest,
  type Storage,
} from 'redux-persist';

import { api } from '@starter/api-client';

import { features, type AppFeature } from '@app/registry';
import { devToolsEnhancers, useBuiltInDevTools } from './devtools';
import { initialPreferences, preferencesSlice, type PreferencesState } from './preferences-slice';

/** Feature-owned slices, from the registry (ADR-0026): mounted under each slice's name. */
type FeatureSlice = AppFeature['slices'][number];
type FeatureReducers = { [S in FeatureSlice as S['name']]: S['reducer'] };

const featureReducers = Object.fromEntries(
  features.flatMap((feature) => feature.slices.map((slice) => [slice.name, slice.reducer])),
) as FeatureReducers;

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  [preferencesSlice.name]: preferencesSlice.reducer,
  ...featureReducers,
});

export type RootState = ReturnType<typeof rootReducer>;

/**
 * Only these slices are written to device storage (ADR-0009). Never add slices that hold
 * secrets — tokens live in secure storage, not Redux.
 */
export const persistedSlices: (keyof RootState)[] = [preferencesSlice.name];

/**
 * Bump `PERSIST_VERSION` and add a migration whenever a persisted slice changes shape, so users
 * upgrading the app keep their saved state.
 */
export const PERSIST_VERSION = 2;
export const migrations: MigrationManifest = {
  1: (state) => state,
  // v2 added `preferences.language`.
  2: (state) => {
    if (!state) return state;
    const { preferences, ...rest } = state as typeof state & {
      preferences?: Partial<PreferencesState>;
    };
    return {
      ...rest,
      preferences: { ...initialPreferences, ...preferences },
    } as typeof state;
  },
};

export type MakeStoreOptions = {
  storage?: Storage;
  /**
   * Give up waiting for storage after this many ms and start fresh (redux-persist's safety net for
   * storage that never answers). Tests pass 0 so no timer outlives the test.
   */
  persistTimeoutMs?: number;
};

export function makeStore({
  storage = AsyncStorage as Storage,
  persistTimeoutMs = 5000,
}: MakeStoreOptions = {}) {
  const persistedReducer = persistReducer(
    {
      key: 'root',
      version: PERSIST_VERSION,
      storage,
      timeout: persistTimeoutMs,
      whitelist: persistedSlices as string[],
      migrate: createMigrate(migrations, { debug: false }),
    },
    rootReducer,
  );

  const store = configureStore({
    reducer: persistedReducer,
    devTools: useBuiltInDevTools,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // redux-persist dispatches actions carrying functions; they are expected.
        serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
      }).concat(api.middleware),
    // After `middleware`: TypeScript infers these callbacks in order, and RTK types the enhancers
    // from the middleware. DevTools enhancer last, as the plugin requires (see devtools.*.ts).
    enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(devToolsEnhancers()),
  });

  const persistor = persistStore(store);
  return { store, persistor };
}

export type AppStore = ReturnType<typeof makeStore>['store'];
export type AppDispatch = AppStore['dispatch'];
