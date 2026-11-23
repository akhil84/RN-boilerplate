import { api, type ApiExtraOptions } from '@starter/api-client';

import {
  AUTH_PATHS,
  authResponseSchema,
  type AuthResponse,
  type SocialProvider,
} from '@features/auth/types';

/** A 401 from these endpoints means bad credentials, never an expired session (ADR-0008). */
const authCall: ApiExtraOptions = { skipReauth: true };

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: AUTH_PATHS.login, method: 'POST', body }),
      extraOptions: authCall,
      transformResponse: (response: unknown) => authResponseSchema.parse(response),
    }),
    socialSignIn: build.mutation<AuthResponse, { provider: SocialProvider; idToken: string }>({
      query: (body) => ({ url: AUTH_PATHS.social, method: 'POST', body }),
      extraOptions: authCall,
      transformResponse: (response: unknown) => authResponseSchema.parse(response),
    }),
    logout: build.mutation<void, void>({
      query: () => ({ url: AUTH_PATHS.logout, method: 'POST', credentials: 'include' }),
      extraOptions: authCall,
    }),
  }),
});
