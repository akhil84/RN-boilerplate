import { createApi } from '@reduxjs/toolkit/query/react';

import { apiBaseQuery } from './base-query';

/**
 * The single RTK Query API (ADR-0007). Features add their endpoints with `api.injectEndpoints`
 * and their cache tags with `api.enhanceEndpoints({ addTagTypes })`, so each feature owns its
 * own network code.
 */
export const api = createApi({
  reducerPath: 'api',
  baseQuery: apiBaseQuery,
  endpoints: () => ({}),
});
