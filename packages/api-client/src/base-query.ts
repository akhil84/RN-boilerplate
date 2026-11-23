import {
  fetchBaseQuery,
  retry,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query';

import { getEnv } from '@starter/config/env';

import { toApiError, type ApiError } from './api-error';

/**
 * How the API client talks to the session (provided by the auth feature at startup).
 * Kept as an interface so the network layer never imports UI or feature code.
 */
export type AuthAdapter = {
  getAccessToken: () => Promise<string | null> | string | null;
  /** Exchange the refresh token for new tokens. Resolve `true` if new tokens were stored. */
  refresh: () => Promise<boolean>;
  /** Called when a refresh fails: clear the session and send the user to sign-in. */
  onSessionExpired: () => void;
};

export type ApiClientConfig = {
  baseUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  auth?: AuthAdapter;
  /** Replace the network, e.g. with `createMockFetch` (mock mode) or a test double. */
  fetchFn?: typeof fetch;
};

const DEFAULTS = { maxRetries: 2, retryDelayMs: 500 };

let config: ApiClientConfig = {};

/** Merge settings into the client config. Unset values fall back to env / defaults. */
export function configureApiClient(next: ApiClientConfig) {
  config = { ...config, ...next };
}

/** Test helper: forget all configuration. */
export function resetApiClient() {
  config = {};
  refreshInFlight = null;
}

const rawBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = (
  args,
  api,
  extraOptions,
) =>
  fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
    timeout: config.timeoutMs ?? getEnv().apiTimeoutMs,
    fetchFn: (input, init) => (config.fetchFn ?? fetch)(input, init),
    prepareHeaders: async (headers) => {
      const token = await config.auth?.getAccessToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  })(args, api, extraOptions);

/** The configured base URL (env by default). */
export function getApiBaseUrl() {
  return config.baseUrl ?? getEnv().apiUrl;
}

/**
 * A plain request to the API that bypasses auth and retries — for the token refresh call itself,
 * which must never trigger another refresh. Uses the configured `fetchFn` and base URL.
 */
export function apiRequest(path: string, init?: RequestInit): Promise<Response> {
  return (config.fetchFn ?? fetch)(`${getApiBaseUrl()}${path}`, init);
}

// One refresh at a time: parallel requests that hit 401 wait for the same refresh.
let refreshInFlight: Promise<boolean> | null = null;

function refreshOnce(auth: AuthAdapter): Promise<boolean> {
  refreshInFlight ??= auth.refresh().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  const auth = config.auth;

  if (result.error?.status === 401 && auth) {
    const refreshed = await refreshOnce(auth).catch(() => false);
    if (refreshed) {
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      auth.onSessionExpired();
    }
  }
  return result;
};

const isIdempotent = (args: string | FetchArgs) =>
  typeof args === 'string' ||
  ['GET', 'HEAD', 'OPTIONS'].includes((args.method ?? 'GET').toUpperCase());

const isTransient = (error: FetchBaseQueryError) =>
  error.status === 'FETCH_ERROR' ||
  error.status === 'TIMEOUT_ERROR' ||
  (typeof error.status === 'number' && error.status >= 500);

const retryingBaseQuery = retry(baseQueryWithReauth, {
  // Only safe-to-repeat requests are retried, and only for failures that may be temporary.
  retryCondition: (error, args, { attempt }) =>
    attempt <= (config.maxRetries ?? DEFAULTS.maxRetries) &&
    isIdempotent(args as string | FetchArgs) &&
    isTransient(error as FetchBaseQueryError),
  backoff: async (attempt) => {
    const delay = (config.retryDelayMs ?? DEFAULTS.retryDelayMs) * 2 ** (attempt - 1);
    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
  },
});

/** The base query every endpoint uses. Errors are always an `ApiError`. */
export const apiBaseQuery: BaseQueryFn<string | FetchArgs, unknown, ApiError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await retryingBaseQuery(args, api, extraOptions);
  if (result.error) {
    return { error: toApiError(result.error as FetchBaseQueryError), meta: result.meta };
  }
  return { data: result.data, meta: result.meta };
};
