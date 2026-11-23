import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { ErrorBoundary, initErrorReporting } from '@starter/config/observability';
import {
  AppProviders,
  configureNotificationHandling,
  ErrorFallback,
  useScreenTracking,
  useSessionStatus,
} from '@starter/features';
import { useColorScheme } from '@starter/ui';

SplashScreen.preventAutoHideAsync();
initErrorReporting(); // no-op unless EXPO_PUBLIC_SENTRY_DSN is set
configureNotificationHandling(); // show notifications that arrive while the app is open

/**
 * Route guard (ADR-0015): `(app)` needs a session, `sign-in` needs none. The splash screen stays
 * up until the stored session has been checked, so nobody sees the wrong screen flash.
 */
function RootNavigator() {
  const status = useSessionStatus();
  const colorScheme = useColorScheme();
  useScreenTracking();

  useEffect(() => {
    if (status !== 'unknown') SplashScreen.hide();
  }, [status]);

  if (status === 'unknown') return null;
  const signedIn = status === 'signedIn';

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="sign-in" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
      <AppProviders>
        <RootNavigator />
      </AppProviders>
    </ErrorBoundary>
  );
}
