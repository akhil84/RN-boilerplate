import { api } from '@starter/api-client';

import { AUTH_PATHS, authResponseSchema, type AuthResponse, type SocialProvider } from './types';

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: AUTH_PATHS.login, method: 'POST', body }),
      transformResponse: (response: unknown) => authResponseSchema.parse(response),
    }),
    socialSignIn: build.mutation<AuthResponse, { provider: SocialProvider; idToken: string }>({
      query: (body) => ({ url: AUTH_PATHS.social, method: 'POST', body }),
      transformResponse: (response: unknown) => authResponseSchema.parse(response),
    }),
    logout: build.mutation<void, void>({
      query: () => ({ url: AUTH_PATHS.logout, method: 'POST', credentials: 'include' }),
    }),
  }),
});
