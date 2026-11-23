import '@/global.css';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';

import { ErrorBoundary, initErrorReporting } from '@starter/config/observability';
import {
  AppProviders,
  ErrorFallback,
  useScreenTracking,
  useSessionStatus,
} from '@starter/features';
import { useColorScheme } from '@starter/ui';

initErrorReporting(); // no-op unless EXPO_PUBLIC_SENTRY_DSN is set

/** Route guard (ADR-0015): `(app)` needs a session, `sign-in` needs none. */
function RootNavigator() {
  const status = useSessionStatus();
  const colorScheme = useColorScheme();
  useScreenTracking();

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
