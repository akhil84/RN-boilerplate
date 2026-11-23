import { render, type RenderOptions } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/**
 * Wrap every component under test with the app-level providers.
 * Add new global providers (theme, query client, store) here so tests stay in sync with the app.
 */
function AllProviders({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}>
      {children}
    </SafeAreaProvider>
  );
}

export async function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return await render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react-native';
