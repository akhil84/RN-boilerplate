import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  api,
  apiRequest,
  configureApiClient,
  isApiError,
  type ApiError,
} from '@starter/api-client';
import { analytics, setErrorReportingUser } from '@starter/config/observability';

import type { AppDispatch } from '../store/store';
import { authApi } from './auth-api';
import { sessionEnded, sessionStarted } from './session-slice';
import { SocialSignInCancelledError } from './social/errors';
import { getIdToken } from './social/get-id-token';
import { tokenStorage } from './token-storage';
import {
  AUTH_PATHS,
  refreshResponseSchema,
  type AuthResponse,
  type SignInMethod,
  type SocialProvider,
} from './types';

let refreshTokenInMemory: string | null = null;

/**
 * Exchange the refresh token for new tokens (called by the API client on 401, ADR-0008).
 * Uses a plain request so a failing refresh can never trigger another refresh.
 */
export async function refreshTokens(): Promise<boolean> {
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
    const valid = stored && (stored.accessToken || (await refreshTokens()));
    if (stored && valid) {
      refreshTokenInMemory = stored.refreshToken;
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

export const signOut = createAsyncThunk<void, void, { dispatch: AppDispatch }>(
  'session/signOut',
  async (_, { dispatch }) => {
    // The logout call can itself get a 401 → failed refresh → onSessionExpired → signOut again.
    if (signingOut) return;
    signingOut = true;
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
