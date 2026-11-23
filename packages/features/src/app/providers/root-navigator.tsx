import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';

import { useColorScheme } from '@starter/ui';

import { useSessionStatus } from '@features/auth';
import { useScreenTracking } from '@app/navigation/use-screen-tracking';

/**
 * The root navigator both apps render (ADR-0015, ADR-0026): `(app)` routes need a session,
 * `sign-in` needs none. Renders nothing until the stored session has been checked, then calls
 * `onReady` once — mobile hides its splash screen there, so nobody sees the wrong screen flash.
 */
export function RootNavigator({ onReady }: { onReady?: () => void }) {
  const status = useSessionStatus();
  const colorScheme = useColorScheme();
  useScreenTracking();

  useEffect(() => {
    if (status !== 'unknown') onReady?.();
  }, [status, onReady]);

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
