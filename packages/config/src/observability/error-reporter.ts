/**
 * Vendor-agnostic error reporter core (ADR-0013). The SDK is supplied by a loader so each
 * platform decides how it is included:
 * - native: bundled statically (sentry-loader.ts) — size matters less, and crashes must be caught
 *   from the first instruction;
 * - web: `import()`ed on demand (sentry-loader.web.ts), so the browser never downloads the SDK
 *   unless a DSN is configured (ADR-0005 bundle-size follow-up).
 * Calls made while the SDK loads are queued (bounded) and replayed in order.
 */
export type ErrorReportingSdk = {
  init: (options: { dsn: string; environment: string; sendDefaultPii: boolean }) => unknown;
  captureException: (error: unknown, hint?: { extra: Record<string, unknown> }) => unknown;
  setUser: (user: { id: string } | null) => unknown;
};

export type ErrorReporter = ReturnType<typeof createErrorReporter>;

type QueuedCall = (sdk: ErrorReportingSdk) => void;

export function createErrorReporter(
  loadSdk: () => Promise<ErrorReportingSdk>,
  { maxQueued = 50 }: { maxQueued?: number } = {},
) {
  let sdk: ErrorReportingSdk | null = null;
  let loading: Promise<void> | null = null;
  let queue: QueuedCall[] = [];

  function run(call: QueuedCall) {
    if (sdk) call(sdk);
    else if (loading && queue.length < maxQueued) queue.push(call);
  }

  return {
    /** Returns whether reporting is on (it is as soon as a DSN is given; the SDK loads async). */
    init({ dsn, environment }: { dsn?: string; environment: string }): boolean {
      if (!dsn) return false;
      loading ??= loadSdk()
        .then((loaded) => {
          loaded.init({ dsn, environment, sendDefaultPii: false });
          sdk = loaded;
          const pending = queue;
          queue = [];
          pending.forEach((call) => call(loaded));
        })
        .catch((error) => {
          queue = [];
          loading = null;
          if (__DEV__) console.error('[reportError] could not load the error reporting SDK', error);
        });
      return true;
    },
    isEnabled: () => sdk !== null || loading !== null,
    report(error: unknown, context?: Record<string, unknown>) {
      run((loaded) => loaded.captureException(error, context ? { extra: context } : undefined));
    },
    setUser(userId: string | null) {
      run((loaded) => loaded.setUser(userId ? { id: userId } : null));
    },
    /** Resolves once a pending SDK load has finished (or immediately). */
    ready: () => loading ?? Promise.resolve(),
    reset() {
      sdk = null;
      loading = null;
      queue = [];
    },
  };
}
