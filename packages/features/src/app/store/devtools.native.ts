import type { StoreEnhancer } from '@reduxjs/toolkit';
import devToolsEnhancer from 'redux-devtools-expo-dev-plugin';

/**
 * Redux DevTools on iOS / Android (ADR-0007): the Expo dev tools plugin shows the action log and
 * state, including every RTK Query request, with time travel. Open it from the Expo CLI with
 * `shift+m` → "Open devtools plugin - redux-devtools-expo-dev-plugin".
 *
 * Development builds only; the plugin is a no-op in production builds. Off in tests, where no
 * dev tools server exists.
 */
export const useBuiltInDevTools = false;

export function devToolsEnhancers(): StoreEnhancer<object>[] {
  return __DEV__ && process.env.NODE_ENV !== 'test' ? [devToolsEnhancer()] : [];
}
