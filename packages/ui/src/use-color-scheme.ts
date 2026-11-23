import { createContext, createElement, useContext, type ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export type ColorScheme = 'light' | 'dark';

const OverrideContext = createContext<ColorScheme | null>(null);

/**
 * Force a colour scheme for everything below (e.g. the user's theme preference). `null` follows
 * the system setting. Works the same on iOS, Android and web.
 */
export function ColorSchemeProvider({
  scheme,
  children,
}: {
  scheme: ColorScheme | null;
  children: ReactNode;
}) {
  return createElement(OverrideContext.Provider, { value: scheme }, children);
}

export function useColorScheme(): ColorScheme | null | undefined {
  const override = useContext(OverrideContext);
  const system = useSystemColorScheme();
  return override ?? system;
}
