import type { StoreEnhancer } from '@reduxjs/toolkit';

/**
 * Web keeps Redux Toolkit's built-in DevTools, which talk to the Redux DevTools browser extension
 * (enabled in development, off in production builds).
 */
export const useBuiltInDevTools = true;

export function devToolsEnhancers(): StoreEnhancer<object>[] {
  return [];
}
