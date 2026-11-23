import { tokenStorage as nativeStorage } from '../token-storage/token-storage.native';
import { createWebTokenStorage } from '../token-storage/token-storage.web';

const session = {
  accessToken: 'access',
  refreshToken: 'refresh',
  user: { id: 'u1', name: 'Ada' },
};

function installLocalStorage() {
  const data = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => void data.set(key, value),
      removeItem: (key: string) => void data.delete(key),
    },
  });
  return data;
}

describe('native token storage (secure store)', () => {
  it('round-trips a session and clears it', async () => {
    await nativeStorage.save(session);

    expect(await nativeStorage.load()).toEqual(session);
    expect(await nativeStorage.getAccessToken()).toBe('access');

    await nativeStorage.clear();
    expect(await nativeStorage.load()).toBeNull();
    expect(await nativeStorage.getAccessToken()).toBeNull();
  });
});

describe('web token storage', () => {
  it('local mode keeps tokens in localStorage', async () => {
    const data = installLocalStorage();
    const storage = createWebTokenStorage('local');

    await storage.save(session);

    expect(data.get('auth.refreshToken')).toBe('refresh');
    expect(await storage.load()).toEqual(session);
    expect(storage.refreshTransport).toBe('body');
  });

  it('cookie mode never writes tokens to localStorage', async () => {
    const data = installLocalStorage();
    const storage = createWebTokenStorage('cookie');

    await storage.save(session);

    expect(data.has('auth.accessToken')).toBe(false);
    expect(data.has('auth.refreshToken')).toBe(false);
    expect(await storage.getAccessToken()).toBe('access'); // memory only
    expect(storage.refreshTransport).toBe('cookie');
    expect(await storage.load()).toEqual({
      accessToken: null,
      refreshToken: null,
      user: session.user,
    });
  });
});
