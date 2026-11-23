import * as SplashScreen from 'expo-splash-screen';

import { ErrorBoundary, initErrorReporting } from '@starter/core/observability';
import { AppProviders, configureNotificationHandling, RootNavigator } from '@starter/features';

import { StartupSafeErrorFallback } from '@/shell/startup-safe-error-fallback';

SplashScreen.preventAutoHideAsync();
initErrorReporting(); // no-op unless EXPO_PUBLIC_SENTRY_DSN is set
configureNotificationHandling(); // show notifications that arrive while the app is open

// The splash stays up until the stored session has been checked (see RootNavigator).
const hideSplash = () => SplashScreen.hide();

export default function RootLayout() {
  return (
    <ErrorBoundary fallback={(props) => <StartupSafeErrorFallback {...props} />}>
      <AppProviders>
        <RootNavigator onReady={hideSplash} />
      </AppProviders>
    </ErrorBoundary>
  );
}
