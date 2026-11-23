# Recipes

Copyable patterns taken from the existing features. `orders` is an example name — use your own.
The live references are `features/home` (query + list screen), `features/auth` (slice, mutation,
services), `features/settings` (analytics, preferences) and `features/notifications` (mutation,
platform-specific services).

## Types — `types.ts`

```ts
import { z } from 'zod';

export const orderSchema = z.object({
  id: z.string(),
  total: z.number(),
  status: z.enum(['open', 'shipped']),
});
export type Order = z.infer<typeof orderSchema>;
```

## Endpoints — `api/orders-api.ts`

```ts
import { api } from '@starter/api-client';

import { orderSchema, type Order } from '@features/orders/types';

const ordersApi = api.enhanceEndpoints({ addTagTypes: ['Order'] }).injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query<Order[], void>({
      query: () => '/orders',
      transformResponse: (response: unknown) => orderSchema.array().parse(response),
      providesTags: ['Order'],
    }),
    cancelOrder: build.mutation<void, string>({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: 'POST' }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const { useGetOrdersQuery, useCancelOrderMutation } = ordersApi;
```

- Auth header, refresh on 401 and retries (idempotent requests only) come from `apiBaseQuery`.
- Errors are `ApiError` — check with `isApiError` from `@starter/api-client`; report unexpected
  ones with `reportError` from `@starter/core/observability`.
- Multi-step logic outside components goes in `services/` as a thunk (see
  `notifications/services/enable-push.ts`):

  ```ts
  import { createAsyncThunk } from '@reduxjs/toolkit';
  import type { AppDispatch } from '@app/store/store';

  export const cancelOrder = createAsyncThunk<void, string, { dispatch: AppDispatch }>(
    'orders/cancel',
    async (id, { dispatch }) => {
      await dispatch(ordersApi.endpoints.cancelOrder.initiate(id)).unwrap();
    },
  );
  ```

## Mock handlers — `mocks/handlers.ts`

```ts
import type { MockHandler } from '@starter/api-client';

import { isMockAuthorized } from '@app/mocks/helpers';
import type { Order } from '@features/orders/types';

export const mockOrders: Order[] = [{ id: '1', total: 42, status: 'open' }];

const unauthorized = { status: 401, body: { code: 'UNAUTHORIZED', message: 'Sign in required' } };

export const ordersMockHandlers: MockHandler[] = [
  {
    method: 'GET',
    path: '/orders',
    respond: ({ headers }) =>
      isMockAuthorized(headers.get('Authorization'))
        ? { status: 200, body: mockOrders }
        : unauthorized,
  },
];
```

## Slice — `model/orders-slice.ts` (client state only)

```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type OrdersState = { filter: 'all' | 'open' };
const initialState: OrdersState = { filter: 'all' };

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    filterChanged(state, action: PayloadAction<OrdersState['filter']>) {
      state.filter = action.payload;
    },
  },
  selectors: { selectOrdersFilter: (state) => state.filter },
});

export const { filterChanged } = ordersSlice.actions;
export const { selectOrdersFilter } = ordersSlice.selectors;
```

Read and write with `useAppSelector` / `useAppDispatch` from `@app/store/hooks`. The slice is
mounted under `orders` once it is listed in `feature.ts`. Persisting it: add `'orders'` to
`persistedSlices`, bump `PERSIST_VERSION`, add a migration (see `app/store/store.ts`).

## Analytics — `analytics.ts`

```ts
/** Analytics events sent by the orders feature (ADR-0014). */
declare module '@starter/core/observability' {
  interface AnalyticsEventMap {
    order_cancelled: { orderId: string };
  }
}
export {};
```

Then `analytics.track('order_cancelled', { orderId })` with `analytics` from
`@starter/core/observability`. No personal data in event properties.

## Manifest — `feature.ts`

```ts
import './analytics';

import { defineFeature } from '@app/feature';
import en from './locales/en.json';
import { ordersMockHandlers } from './mocks/handlers';
import { ordersSlice } from './model/orders-slice';

export const ordersFeature = defineFeature({
  name: 'orders', // = folder name = i18n namespace
  translations: { en },
  slices: [ordersSlice], // omit if none
  mockHandlers: ordersMockHandlers,
});
```

## Public entry — `index.ts`

```ts
export { ordersFeature } from './feature';
export { OrdersScreen } from './screens/orders-screen';
// Only what other features or the apps need:
export { useGetOrdersQuery } from './api/orders-api';
export type { Order } from './types';
```

## Screen — `screens/orders-screen.tsx`

Copy `features/home/screens/home-screen.tsx` for a data screen: header with
`<ThemedText type="subtitle" role="heading" testID="orders-title">`, then one of
`orders-loading` (ActivityIndicator with an accessibility label), `orders-error` (message with
`role="alert"` + retry `Button`), `orders-empty`, or the list (`FlatList`, pull to refresh). Style
with `StyleSheet.create` and `Spacing` / `MaxContentWidth` / `BottomTabInset` tokens. For a
simple screen, wrap content in `<Screen scroll>` from `@starter/ui`.

Forms: controlled `TextField`s, validate with a Zod schema on submit, show the first error per
field via the `error` prop.

## Routes

```tsx
// apps/mobile/src/app/(app)/orders.tsx  and  apps/web/src/app/(app)/orders.tsx
export { OrdersScreen as default } from '@starter/features';
```

Dynamic segment: `(app)/orders/[id].tsx`, read it in the screen with
`useLocalSearchParams<{ id: string }>()` from `expo-router`.

## Top-level destination — `app/navigation/destinations.ts`

```ts
{
  route: 'orders',
  href: '/orders',
  labelKey: 'tabs.orders', // add "orders" under "tabs" in app/i18n/locales/en/common.json
  icon: { sf: { default: 'bag', selected: 'bag.fill' }, md: 'shopping_bag' },
  testID: 'nav-orders',
},
```

## Test — `__tests__/orders-screen.test.tsx`

```tsx
import { renderWithProviders, screen, setupMockApi } from '@app/testing/test-utils';
import { mockOrders } from '@features/orders/mocks/handlers';
import { OrdersScreen } from '..';

it('AC-1: lists the open orders', async () => {
  setupMockApi([
    { method: 'GET', path: '/orders', respond: () => ({ status: 200, body: mockOrders }) },
  ]);
  await renderWithProviders(<OrdersScreen />);

  expect(await screen.findByText('42')).toBeOnTheScreen();
});
```

`renderWithProviders` gives a fresh store per test; `setupMockApi()` with no arguments uses every
feature's registered handlers. Tests run on the iOS and Android renderers; web rendering is covered
by Playwright.
