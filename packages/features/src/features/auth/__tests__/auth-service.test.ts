import * as SecureStore from 'expo-secure-store';

import type { MockHandler } from '@starter/api-client';
import { recordAnalytics, resetAnalyticsAdapter } from '@starter/core/observability';
import { getIdToken } from '@features/auth/services/social/get-id-token';

import { makeConnectedStore, setupMockApi } from '@app/testing/test-utils';
import { getMockHandlers } from '@app/mocks';
import { DEMO_PASSWORD } from '@features/auth/mocks/handlers';
import {
  refreshTokens,
  restoreSession,
  signInWithPassword,
  signInWithProvider,
  signOut,
} from '@features/auth/services/auth-service';
import { selectCurrentUser, selectSessionStatus } from '@features/auth/model/session-slice';
import { SocialSignInCancelledError } from '@features/auth/services/social/errors';
import { tokenStorage } from '@features/auth/services/token-storage';

jest.mock('@features/auth/services/social/get-id-token', () => ({ getIdToken: jest.fn() }));

const resetSecureStore = () => (SecureStore as unknown as { __reset: () => void }).__reset();

describe('auth service', () => {
  beforeEach(async () => {
    resetSecureStore();
    await tokenStorage.clear();
    setupMockApi();
  });
  afterEach(resetAnalyticsAdapter);

  it('AC-auth-1: signs in with email and password and stores tokens securely', async () => {
    const store = makeConnectedStore();
    const calls = recordAnalytics();

    await store.dispatch(signInWithPassword({ email: 'a@b.co', password: DEMO_PASSWORD })).unwrap();

    expect(selectSessionStatus(store.getState())).toBe('signedIn');
    expect(selectCurrentUser(store.getState())).toMatchObject({ id: 'user-1', email: 'a@b.co' });
    expect(await SecureStore.getItemAsync('auth.accessToken')).toMatch(/^mock-access-/);
    expect(calls).toContainEqual({
      type: 'track',
      name: 'sign_in_succeeded',
      props: { method: 'password' },
    });
  });

  it('AC-auth-2: rejects wrong credentials with the backend message', async () => {
    const store = makeConnectedStore();

    await expect(
      store.dispatch(signInWithPassword({ email: 'a@b.co', password: 'nope' })).unwrap(),
    ).rejects.toMatchObject({ status: 401, message: 'Email or password is incorrect.' });
    expect(selectSessionStatus(store.getState())).toBe('unknown');
  });

  it('a wrong password does not run the sign-out flow', async () => {
    const store = makeConnectedStore();
    await store.dispatch(restoreSession());
    const calls = recordAnalytics();

    await store.dispatch(signInWithPassword({ email: 'a@b.co', password: 'nope' }));

    expect(calls.map((call) => call.type === 'track' && call.name)).not.toContain('sign_out');
    expect(selectSessionStatus(store.getState())).toBe('signedOut');
  });

  it('a refresh that finishes after sign-out does not restore the tokens', async () => {
    let releaseRefresh: () => void = () => {};
    const slowRefresh: MockHandler = {
      method: 'POST',
      path: '/auth/refresh',
      respond: () =>
        new Promise((resolve) => {
          releaseRefresh = () =>
            resolve({
              status: 200,
              body: { accessToken: 'mock-access-late', refreshToken: 'mock-refresh-late' },
            });
        }),
    };
    setupMockApi([slowRefresh, ...getMockHandlers()]);
    const store = makeConnectedStore();
    await store.dispatch(signInWithPassword({ email: 'a@b.co', password: DEMO_PASSWORD })).unwrap();

    const refreshing = refreshTokens();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await store.dispatch(signOut());
    releaseRefresh();

    expect(await refreshing).toBe(false);
    expect(await tokenStorage.load()).toBeNull();
  });

  it('AC-auth-3: restores a stored session on launch', async () => {
    await tokenStorage.save({
      accessToken: 'mock-access-9',
      refreshToken: 'mock-refresh-9',
      user: { id: 'user-1', name: 'Demo User' },
    });
    const store = makeConnectedStore();

    await store.dispatch(restoreSession());

    expect(selectSessionStatus(store.getState())).toBe('signedIn');
  });

  it('AC-auth-4: starts signed out when nothing is stored', async () => {
    const store = makeConnectedStore();

    await store.dispatch(restoreSession());

    expect(selectSessionStatus(store.getState())).toBe('signedOut');
  });

  it('AC-auth-5: refreshes with only a refresh token left', async () => {
    await tokenStorage.save({
      accessToken: null,
      refreshToken: 'mock-refresh-1',
      user: { id: 'user-1' },
    });
    const store = makeConnectedStore();

    await store.dispatch(restoreSession());

    expect(selectSessionStatus(store.getState())).toBe('signedIn');
    expect(await tokenStorage.getAccessToken()).toMatch(/^mock-access-/);
  });

  it('AC-auth-6: signs out, clears tokens and resets analytics', async () => {
    const store = makeConnectedStore();
    await store.dispatch(signInWithPassword({ email: 'a@b.co', password: DEMO_PASSWORD })).unwrap();
    const calls = recordAnalytics();

    await store.dispatch(signOut());

    expect(selectSessionStatus(store.getState())).toBe('signedOut');
    expect(await tokenStorage.load()).toBeNull();
    expect(calls.map((call) => call.type)).toEqual(['track', 'reset']);
  });

  it('AC-auth-7: social sign-in trades the provider ID token for a session', async () => {
    jest.mocked(getIdToken).mockResolvedValue('google-id-token');
    const store = makeConnectedStore();

    const result = await store.dispatch(signInWithProvider('google')).unwrap();

    expect(result).toBe(true);
    expect(selectSessionStatus(store.getState())).toBe('signedIn');
  });

  it('AC-auth-8: cancelling the provider sheet is not an error', async () => {
    jest.mocked(getIdToken).mockRejectedValue(new SocialSignInCancelledError());
    const store = makeConnectedStore();

    const result = await store.dispatch(signInWithProvider('apple')).unwrap();

    expect(result).toBe(false);
    expect(selectSessionStatus(store.getState())).toBe('unknown');
  });
});
