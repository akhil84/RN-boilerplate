import type { ErrorReportingSdk } from './error-reporter';

/**
 * Web: load Sentry as a separate chunk, only when a DSN is configured, so the default web bundle
 * does not carry the SDK (ADR-0005, ADR-0013).
 */
export const loadErrorReportingSdk = (): Promise<ErrorReportingSdk> =>
  import('@sentry/react-native') as unknown as Promise<ErrorReportingSdk>;
