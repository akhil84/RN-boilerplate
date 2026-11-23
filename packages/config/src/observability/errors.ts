import * as Sentry from '@sentry/react-native';

import { getAppVariant, getEnv } from '../env';

/**
 * Error reporting (ADR-0013). Features call `reportError` and never import Sentry directly, so
 * the vendor can be swapped by rewriting this file. Sentry stays off unless a DSN is configured.
 */
let enabled = false;

export type ErrorReportingOptions = {
  dsn?: string;
  environment?: string;
};

/** Call once at startup. Returns whether reporting was enabled. */
export function initErrorReporting({
  dsn = getEnv().sentryDsn,
  environment = getAppVariant(),
}: ErrorReportingOptions = {}): boolean {
  if (!dsn) return false;
  Sentry.init({ dsn, environment, sendDefaultPii: false });
  enabled = true;
  return true;
}

export function isErrorReportingEnabled() {
  return enabled;
}

/** Report a handled error with optional context. Always logged in development. */
export function reportError(error: unknown, context?: Record<string, unknown>) {
  if (__DEV__) console.error('[reportError]', error, context ?? '');
  if (enabled) Sentry.captureException(error, context ? { extra: context } : undefined);
}

/** Attach (or clear) the signed-in user — an opaque id only, never personal data. */
export function setErrorReportingUser(userId: string | null) {
  if (enabled) Sentry.setUser(userId ? { id: userId } : null);
}

/** Test helper: return to the disabled state. */
export function resetErrorReporting() {
  enabled = false;
}
