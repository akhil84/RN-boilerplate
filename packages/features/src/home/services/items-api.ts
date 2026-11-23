import { api } from '@starter/api-client';

import { itemSchema, type Item } from '../types';

/**
 * Example feature endpoint (the pattern to copy): inject endpoints into the shared `api`, validate
 * the response at the boundary, and expose the generated hooks from the feature.
 */
const itemsApi = api.enhanceEndpoints({ addTagTypes: ['Item'] }).injectEndpoints({
  endpoints: (build) => ({
    getItems: build.query<Item[], void>({
      query: () => '/items',
      transformResponse: (response: unknown) => itemSchema.array().parse(response),
      providesTags: ['Item'],
    }),
  }),
});

export const { useGetItemsQuery } = itemsApi;
