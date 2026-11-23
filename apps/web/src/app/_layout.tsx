import '@/global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';

import { ErrorBoundary, initErrorReporting } from '@starter/config/observability';
import { AppProviders, ErrorFallback, useScreenTracking } from '@starter/features';
import { useColorScheme } from '@starter/ui';

import AppTabs from '@/components/app-tabs';

initErrorReporting(); // no-op unless EXPO_PUBLIC_SENTRY_DSN is set

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
        <RootNavigation />
      </AppProviders>
    </ErrorBoundary>
  );
}
