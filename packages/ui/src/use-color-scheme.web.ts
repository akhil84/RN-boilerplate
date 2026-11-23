import {
  createContext,
  createElement,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

export type ColorScheme = 'light' | 'dark';

const OverrideContext = createContext<ColorScheme | null>(null);

/** See use-color-scheme.ts. */
export function ColorSchemeProvider({
  scheme,
  children,
}: {
  scheme: ColorScheme | null;
  children: ReactNode;
}) {
  return createElement(OverrideContext.Provider, { value: scheme }, children);
}

const noopSubscribe = () => () => {};

/**
 * On web the system scheme is only known after hydration: the server snapshot returns `false`,
 * the client snapshot `true`, so the real scheme is read without a setState-in-effect.
 */
export function useColorScheme(): ColorScheme | null | undefined {
  const override = useContext(OverrideContext);
  const hasHydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const system = useRNColorScheme();
  return override ?? (hasHydrated ? system : 'light');
}
