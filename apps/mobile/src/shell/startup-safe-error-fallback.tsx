import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import type { ErrorFallbackProps } from '@starter/core/observability';
import { ErrorFallback } from '@starter/features';

/**
 * Root error fallback for the mobile app. The splash normally hides once the session status is
 * known; if rendering fails before that, hide it here — otherwise the error screen stays behind a
 * splash that never goes away.
 */
export function StartupSafeErrorFallback(props: ErrorFallbackProps) {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return <ErrorFallback {...props} />;
}
