import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  api,
  apiRequest,
  configureApiClient,
  isApiError,
  type ApiError,
} from '@starter/api-client';
import { analytics, setErrorReportingUser } from '@starter/core/observability';

import type { AppDispatch, RootState } from '@app/store/store';
import { authApi } from '@features/auth/api/auth-api';
import {
  selectSessionStatus,
  sessionEnded,
  sessionStarted,
} from '@features/auth/model/session-slice';
import { SocialSignInCancelledError } from './social/errors';
import { getIdToken } from './social/get-id-token';
import { tokenStorage } from './token-storage';
import {
  AUTH_PATHS,
  refreshResponseSchema,
  type AuthResponse,
  type SignInMethod,
  type SocialProvider,
} from '@features/auth/types';

let refreshTokenInMemory: string | null = null;

/**
 * Bumped on every sign-in and sign-out. A refresh that started in an older session must not save
 * its tokens — otherwise a refresh finishing after sign-out would quietly sign the user back in.
 */
let sessionEpoch = 0;

/**
 * Exchange the refresh token for new tokens (called by the API client on 401, ADR-0008).
 * Uses a plain request so a failing refresh can never trigger another refresh.
 */
export async function refreshTokens(): Promise<boolean> {
  const epoch = sessionEpoch;
  const stored = await tokenStorage.load();
  if (!stored) return false;

  const byCookie = tokenStorage.refreshTransport === 'cookie';
  const refreshToken = stored.refreshToken ?? refreshTokenInMemory;
  if (!byCookie && !refreshToken) return false;

  try {
    const response = await apiRequest(AUTH_PATHS.refresh, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: byCookie ? 'include' : 'same-origin',
      body: byCookie ? undefined : JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return false;
    const tokens = refreshResponseSchema.parse(await response.json());
    if (epoch !== sessionEpoch) return false; // signed out (or in again) meanwhile
    refreshTokenInMemory = tokens.refreshToken ?? refreshToken;
    await tokenStorage.save({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? refreshToken,
      user: stored.user,
    });
    return true;
  } catch {
    return false;
  }
}

async function startSession(dispatch: AppDispatch, auth: AuthResponse, method: SignInMethod) {
  sessionEpoch += 1;
  refreshTokenInMemory = auth.refreshToken ?? null;
  await tokenStorage.save({
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken ?? null,
    user: auth.user,
  });
  dispatch(sessionStarted(auth.user));
  analytics.identify(auth.user.id);
  analytics.track('sign_in_succeeded', { method });
  setErrorReportingUser(auth.user.id);
}

/** Launch: restore a stored session (refreshing first when only a refresh credential is left). */
export const restoreSession = createAsyncThunk<void, void, { dispatch: AppDispatch }>(
  'session/restore',
  async (_, { dispatch }) => {
    const stored = await tokenStorage.load().catch(() => null);
    if (stored?.accessToken) {
      refreshTokenInMemory = stored.refreshToken;
    }
    // Without an access token, refresh first; refreshTokens() keeps the rotated refresh token.
    const valid = stored && (stored.accessToken || (await refreshTokens()));
    if (stored && valid) {
      dispatch(sessionStarted(stored.user));
      setErrorReportingUser(stored.user.id);
    } else {
      dispatch(sessionEnded());
    }
  },
);

type ThunkConfig = { dispatch: AppDispatch; rejectValue: ApiError };

/**
 * API failures are rejected with the ApiError itself (`rejectWithValue`) — a plain `throw` would be
 * serialised by createAsyncThunk and lose `status` / `code`. `unwrap()` then throws the ApiError.
 */
export const signInWithPassword = createAsyncThunk<
  void,
  { email: string; password: string },
  ThunkConfig
>('session/signInWithPassword', async (credentials, { dispatch, rejectWithValue }) => {
  try {
    const auth = await dispatch(authApi.endpoints.login.initiate(credentials)).unwrap();
    await startSession(dispatch, auth, 'password');
  } catch (error) {
    if (isApiError(error)) return rejectWithValue(error);
    throw error;
  }
});

/**
 * Social sign-in: get an ID token from the provider, then trade it for our own tokens. Resolves
 * `false` (no error) when the user cancels the provider sheet.
 */
export const signInWithProvider = createAsyncThunk<boolean, SocialProvider, ThunkConfig>(
  'session/signInWithProvider',
  async (provider, { dispatch, rejectWithValue }) => {
    let idToken: string;
    try {
      idToken = await getIdToken(provider);
    } catch (error) {
      if (error instanceof SocialSignInCancelledError) return false;
      throw error;
    }
    try {
      const auth = await dispatch(
        authApi.endpoints.socialSignIn.initiate({ provider, idToken }),
      ).unwrap();
      await startSession(dispatch, auth, provider);
      return true;
    } catch (error) {
      if (isApiError(error)) return rejectWithValue(error);
      throw error;
    }
  },
);

/**
 * Sign out everywhere on this device: tell the backend (best effort), forget tokens, drop all
 * cached server data, and detach analytics / error reporting from the user.
 */
let signingOut = false;

export const signOut = createAsyncThunk<void, void, { dispatch: AppDispatch; state: RootState }>(
  'session/signOut',
  async (_, { dispatch, getState }) => {
    // Nothing to end (e.g. a stray 401 while signed out), or already ending.
    if (signingOut || selectSessionStatus(getState()) === 'signedOut') return;
    signingOut = true;
    sessionEpoch += 1; // any refresh still in flight must not save its tokens
    try {
      analytics.track('sign_out');
      await dispatch(authApi.endpoints.logout.initiate());
      refreshTokenInMemory = null;
      await tokenStorage.clear();
      dispatch(api.util.resetApiState());
      dispatch(sessionEnded());
      analytics.reset();
      setErrorReportingUser(null);
    } finally {
      signingOut = false;
    }
  },
);

/** Connect the API client to the session. Called once when the store is created. */
export function connectApiClientToSession(dispatch: AppDispatch) {
  configureApiClient({
    auth: {
      getAccessToken: () => tokenStorage.getAccessToken(),
      refresh: refreshTokens,
      onSessionExpired: () => void dispatch(signOut()),
    },
  });
}
