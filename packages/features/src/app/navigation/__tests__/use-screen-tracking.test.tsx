import { usePathname } from 'expo-router';

import { recordAnalytics, resetAnalyticsAdapter } from '@starter/core/observability';

import { renderHook } from '@app/testing/test-utils';
import { useScreenTracking } from '@app/navigation/use-screen-tracking';

jest.mock('expo-router', () => ({ usePathname: jest.fn() }));

describe('useScreenTracking', () => {
  afterEach(resetAnalyticsAdapter);

  it('reports a screen view for each new route', async () => {
    const calls = recordAnalytics();
    jest.mocked(usePathname).mockReturnValue('/');

    const { rerender } = await renderHook(() => useScreenTracking());
    jest.mocked(usePathname).mockReturnValue('/settings');
    await rerender({});

    expect(calls).toEqual([
      { type: 'screen', name: '/', props: undefined },
      { type: 'screen', name: '/settings', props: undefined },
    ]);
  });
});
