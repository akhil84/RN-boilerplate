import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { ErrorBoundary, initErrorReporting } from '@starter/config/observability';
import { AppProviders, ErrorFallback, useScreenTracking } from '@starter/features';
import { useColorScheme } from '@starter/ui';

import AppTabs from '@/components/app-tabs';

SplashScreen.preventAutoHideAsync();
initErrorReporting(); // no-op unless EXPO_PUBLIC_SENTRY_DSN is set

/** Rendered only after AppProviders has restored persisted state, so the splash covers loading. */
function HideSplashWhenReady() {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return null;
}

function RootNavigation() {
  const colorScheme = useColorScheme();
  useScreenTracking();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppTabs />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
      <AppProviders>
        <HideSplashWhenReady />
        <RootNavigation />
      </AppProviders>
    </ErrorBoundary>
  );
}
