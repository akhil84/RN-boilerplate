import * as Sentry from '@sentry/react-native';

import type { ErrorReportingSdk } from './error-reporter';

/** Native: Sentry is bundled so crashes are captured from the first instruction. */
export const loadErrorReportingSdk = (): Promise<ErrorReportingSdk> =>
  Promise.resolve(Sentry as unknown as ErrorReportingSdk);
