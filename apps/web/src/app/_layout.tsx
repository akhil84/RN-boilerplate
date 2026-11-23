import '@/global.css';

import { ErrorBoundary, initErrorReporting } from '@starter/core/observability';
import { AppProviders, ErrorFallback, RootNavigator } from '@starter/features';

initErrorReporting(); // no-op unless EXPO_PUBLIC_SENTRY_DSN is set

export default function RootLayout() {
  return (
    <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
      <AppProviders>
        <RootNavigator />
      </AppProviders>
    </ErrorBoundary>
  );
}
