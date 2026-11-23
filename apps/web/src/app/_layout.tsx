import '@/global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';

import { AppProviders } from '@starter/features';
import { useColorScheme } from '@starter/ui';

import AppTabs from '@/components/app-tabs';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppProviders>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppTabs />
      </ThemeProvider>
    </AppProviders>
  );
}
