import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { AppProviders } from '@starter/features';
import { useColorScheme } from '@starter/ui';

import AppTabs from '@/components/app-tabs';

SplashScreen.preventAutoHideAsync();

/** Rendered only after AppProviders has restored persisted state, so the splash covers loading. */
function HideSplashWhenReady() {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppProviders>
      <HideSplashWhenReady />
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppTabs />
      </ThemeProvider>
    </AppProviders>
  );
}
