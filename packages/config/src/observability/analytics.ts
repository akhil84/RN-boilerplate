/**
 * Vendor-neutral analytics (ADR-0014).
 *
 * Event names and their properties are declared by the features that send them, by augmenting
 * `AnalyticsEventMap`:
 *
 *   declare module '@starter/config/observability' {
 *     interface AnalyticsEventMap {
 *       order_submitted: { orderId: string; total: number };
 *       onboarding_skipped: undefined; // no properties
 *     }
 *   }
 *
 * A typo in an event name or a missing property is then a type error.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- augmented by features
export interface AnalyticsEventMap {}

export type AnalyticsEventName = keyof AnalyticsEventMap;
export type AnalyticsProps = Record<string, unknown>;

/** What a vendor adapter (PostHog, Amplitude, Firebase, …) implements. */
export type AnalyticsAdapter = {
  track: (event: string, props?: AnalyticsProps) => void;
  screen: (name: string, props?: AnalyticsProps) => void;
  identify: (userId: string, traits?: AnalyticsProps) => void;
  reset: () => void;
};

export const noopAnalyticsAdapter: AnalyticsAdapter = {
  track: () => {},
  screen: () => {},
  identify: () => {},
  reset: () => {},
};

export const consoleAnalyticsAdapter: AnalyticsAdapter = {
  track: (event, props) => console.log('[analytics] track', event, props ?? ''),
  screen: (name, props) => console.log('[analytics] screen', name, props ?? ''),
  identify: (userId, traits) => console.log('[analytics] identify', userId, traits ?? ''),
  reset: () => console.log('[analytics] reset'),
};

// Console in development builds; silent in production and in tests (NODE_ENV=test).
const defaultAdapter = () =>
  __DEV__ && process.env.NODE_ENV !== 'test' ? consoleAnalyticsAdapter : noopAnalyticsAdapter;

let adapter: AnalyticsAdapter = defaultAdapter();

/** Install a vendor adapter at startup. */
export function setAnalyticsAdapter(next: AnalyticsAdapter) {
  adapter = next;
}

export function resetAnalyticsAdapter() {
  adapter = defaultAdapter();
}

type PropsArg<K extends AnalyticsEventName> = AnalyticsEventMap[K] extends undefined
  ? []
  : [props: AnalyticsEventMap[K]];

export const analytics = {
  track<K extends AnalyticsEventName>(event: K, ...props: PropsArg<K>) {
    adapter.track(event as string, props[0] as AnalyticsProps | undefined);
  },
  screen(name: string, props?: AnalyticsProps) {
    adapter.screen(name, props);
  },
  identify(userId: string, traits?: AnalyticsProps) {
    adapter.identify(userId, traits);
  },
  reset() {
    adapter.reset();
  },
};

export type RecordedAnalyticsCall =
  | { type: 'track'; name: string; props?: AnalyticsProps }
  | { type: 'screen'; name: string; props?: AnalyticsProps }
  | { type: 'identify'; name: string; props?: AnalyticsProps }
  | { type: 'reset' };

/**
 * Test helper: install an adapter that records every call.
 *
 *   const calls = recordAnalytics();
 *   ...
 *   expect(calls).toContainEqual({ type: 'track', name: 'theme_changed', props: { theme: 'dark' } });
 */
export function recordAnalytics(): RecordedAnalyticsCall[] {
  const calls: RecordedAnalyticsCall[] = [];
  setAnalyticsAdapter({
    track: (name, props) => calls.push({ type: 'track', name, props }),
    screen: (name, props) => calls.push({ type: 'screen', name, props }),
    identify: (name, props) => calls.push({ type: 'identify', name, props }),
    reset: () => calls.push({ type: 'reset' }),
  });
  return calls;
}
