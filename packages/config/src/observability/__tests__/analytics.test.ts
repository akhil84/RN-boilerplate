import {
  analytics,
  consoleAnalyticsAdapter,
  recordAnalytics,
  resetAnalyticsAdapter,
  setAnalyticsAdapter,
} from '../analytics';

declare module '../analytics' {
  interface AnalyticsEventMap {
    test_event: { id: string };
    test_event_without_props: undefined;
  }
}

describe('analytics', () => {
  afterEach(() => {
    resetAnalyticsAdapter();
    jest.restoreAllMocks();
  });

  it('sends typed events to the installed adapter', () => {
    const calls = recordAnalytics();

    analytics.track('test_event', { id: '42' });
    analytics.track('test_event_without_props');

    expect(calls).toEqual([
      { type: 'track', name: 'test_event', props: { id: '42' } },
      { type: 'track', name: 'test_event_without_props', props: undefined },
    ]);
  });

  it('ships a built-in app_opened event without properties', () => {
    const calls = recordAnalytics();

    analytics.track('app_opened');

    expect(calls).toEqual([{ type: 'track', name: 'app_opened', props: undefined }]);
  });

  it('forwards screen, identify and reset', () => {
    const calls = recordAnalytics();

    analytics.screen('/settings');
    analytics.identify('user-1', { plan: 'free' });
    analytics.reset();

    expect(calls).toEqual([
      { type: 'screen', name: '/settings', props: undefined },
      { type: 'identify', name: 'user-1', props: { plan: 'free' } },
      { type: 'reset' },
    ]);
  });

  it('logs to the console in development by default', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    setAnalyticsAdapter(consoleAnalyticsAdapter);

    analytics.screen('/home');

    expect(log).toHaveBeenCalledWith('[analytics] screen', '/home', '');
  });
});
