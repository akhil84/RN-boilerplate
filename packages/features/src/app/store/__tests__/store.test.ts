import AsyncStorage from '@react-native-async-storage/async-storage';

import { makeStore, PERSIST_VERSION } from '@app/store/store';
import { selectThemePreference, themeChanged } from '@app/store/preferences-slice';

const waitForRehydrate = (persistor: ReturnType<typeof makeStore>['persistor']) =>
  new Promise<void>((resolve) => {
    if (persistor.getState().bootstrapped) return resolve();
    const unsubscribe = persistor.subscribe(() => {
      if (persistor.getState().bootstrapped) {
        unsubscribe();
        resolve();
      }
    });
  });

describe('store persistence', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts with the system theme', async () => {
    const { store, persistor } = makeStore({ persistTimeoutMs: 0 });
    await waitForRehydrate(persistor);

    expect(selectThemePreference(store.getState())).toBe('system');
  });

  it('writes whitelisted slices only — never the API cache', async () => {
    const { store, persistor } = makeStore({ persistTimeoutMs: 0 });
    await waitForRehydrate(persistor);

    store.dispatch(themeChanged('dark'));
    await persistor.flush();

    const saved = JSON.parse((await AsyncStorage.getItem('persist:root')) ?? '{}');
    expect(JSON.parse(saved.preferences)).toEqual({ theme: 'dark', language: 'system' });
    expect(saved.api).toBeUndefined();
  });

  it('restores saved preferences on the next launch', async () => {
    await AsyncStorage.setItem(
      'persist:root',
      JSON.stringify({
        preferences: JSON.stringify({ theme: 'light' }),
        _persist: JSON.stringify({ version: PERSIST_VERSION, rehydrated: true }),
      }),
    );

    const { store, persistor } = makeStore({ persistTimeoutMs: 0 });
    await waitForRehydrate(persistor);

    expect(selectThemePreference(store.getState())).toBe('light');
  });
});

describe('persisted state migrations', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('v1 → v2 keeps the saved theme and adds the language preference', async () => {
    await AsyncStorage.setItem(
      'persist:root',
      JSON.stringify({
        preferences: JSON.stringify({ theme: 'dark' }),
        _persist: JSON.stringify({ version: 1, rehydrated: true }),
      }),
    );

    const { store, persistor } = makeStore({ persistTimeoutMs: 0 });
    await waitForRehydrate(persistor);

    expect(store.getState().preferences).toEqual({ theme: 'dark', language: 'system' });
  });
});
