import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

import type { MockHandler } from '@starter/api-client';
import { recordAnalytics, resetAnalyticsAdapter } from '@starter/core/observability';

import { getMockHandlers } from '@app/mocks';
import { makeConnectedStore, renderHook, setupMockApi } from '@app/testing/test-utils';
import { enablePushNotifications } from '@features/notifications/services/enable-push';
import { useNotificationDeepLinks } from '@features/notifications/services/notifications';
import { getNotificationPath } from '@features/notifications/types';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

describe('getNotificationPath', () => {
  it.each([
    [{ url: '/settings' }, '/settings'],
    [{ url: '/items/42?ref=push' }, '/items/42?ref=push'],
  ])('accepts internal path %j', (data, expected) => {
    expect(getNotificationPath(data)).toBe(expected);
  });

  it.each([
    [{ url: 'https://evil.example' }],
    [{ url: '//evil.example/path' }],
    [{ url: 'javascript:alert(1)' }],
    [{ url: '/\\evil.example' }],
    [{ url: 42 }],
    [undefined],
  ])('ignores %j', (data) => {
    expect(getNotificationPath(data)).toBeNull();
  });
});

describe('enablePushNotifications', () => {
  let registered: unknown[];

  beforeEach(() => {
    registered = [];
    const capture: MockHandler = {
      method: 'POST',
      path: '/devices',
      respond: ({ body }) => {
        registered.push(body);
        return { status: 204 };
      },
    };
    setupMockApi([capture, ...getMockHandlers()]);
  });
  afterEach(resetAnalyticsAdapter);

  it('AC-push-1: registers the device when permission is granted', async () => {
    const calls = recordAnalytics();
    const store = makeConnectedStore();

    const result = await store.dispatch(enablePushNotifications()).unwrap();

    expect(result).toBe('granted');
    expect(registered).toEqual([
      expect.objectContaining({ token: expect.any(String), platform: expect.any(String) }),
    ]);
    expect(calls).toContainEqual({
      type: 'track',
      name: 'push_permission_result',
      props: { permission: 'granted' },
    });
  });

  it('AC-push-2: does not register when permission is denied', async () => {
    jest
      .mocked(Notifications.requestPermissionsAsync)
      .mockResolvedValueOnce({ status: 'denied' } as never);
    const store = makeConnectedStore();

    const result = await store.dispatch(enablePushNotifications()).unwrap();

    expect(result).toBe('denied');
    expect(registered).toEqual([]);
  });
});

describe('useNotificationDeepLinks', () => {
  // Each tap gets its own notification id, like real notifications do.
  let nextId = 0;
  const tapped = (data: unknown) =>
    ({
      actionIdentifier: 'expo.modules.notifications.actions.DEFAULT',
      notification: { request: { identifier: `n-${(nextId += 1)}`, content: { data } } },
    }) as never;

  beforeEach(() => jest.mocked(router.push).mockClear());

  it('AC-push-3: opens the internal screen named in the tapped notification', async () => {
    jest
      .mocked(Notifications.useLastNotificationResponse)
      .mockReturnValue(tapped({ url: '/settings' }));

    await renderHook(() => useNotificationDeepLinks());

    expect(router.push).toHaveBeenCalledWith('/settings');
  });

  it('handles each tap once, even when the signed-in area remounts', async () => {
    jest
      .mocked(Notifications.useLastNotificationResponse)
      .mockReturnValue(tapped({ url: '/settings' }));

    const first = await renderHook(() => useNotificationDeepLinks());
    await first.unmount();
    await renderHook(() => useNotificationDeepLinks());

    expect(router.push).toHaveBeenCalledTimes(1);
  });

  it('ignores external URLs', async () => {
    jest
      .mocked(Notifications.useLastNotificationResponse)
      .mockReturnValue(tapped({ url: 'https://evil.example' }));

    await renderHook(() => useNotificationDeepLinks());

    expect(router.push).not.toHaveBeenCalled();
  });
});
