import { getAppVariant, getEnv } from '../env';
import { createErrorReporter } from './error-reporter';
import { loadErrorReportingSdk } from './sentry-loader';

/**
 * Error reporting (ADR-0013). Features call `reportError` and never import Sentry directly, so
 * the vendor can be swapped by changing the loader. Reporting stays off unless a DSN is set;
 * on web the SDK is only downloaded in that case.
 */
const reporter = createErrorReporter(loadErrorReportingSdk);

export type ErrorReportingOptions = {
  dsn?: string;
  environment?: string;
};

/** Call once at startup. Returns whether reporting was enabled. */
export function initErrorReporting({
  dsn = getEnv().sentryDsn,
  environment = getAppVariant(),
}: ErrorReportingOptions = {}): boolean {
  return reporter.init({ dsn, environment });
}

export function isErrorReportingEnabled() {
  return reporter.isEnabled();
}

/** Report a handled error with optional context. Always logged in development. */
export function reportError(error: unknown, context?: Record<string, unknown>) {
  if (__DEV__) console.error('[reportError]', error, context ?? '');
  reporter.report(error, context);
}

/** Attach (or clear) the signed-in user — an opaque id only, never personal data. */
export function setErrorReportingUser(userId: string | null) {
  reporter.setUser(userId);
}

/** Resolves once the SDK has loaded (if reporting is on). Mostly for tests and shutdown paths. */
export function errorReportingReady() {
  return reporter.ready();
}

/** Test helper: return to the disabled state. */
export function resetErrorReporting() {
  reporter.reset();
}
