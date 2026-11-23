import NetInfo from '@react-native-community/netinfo';
import { setupListeners } from '@reduxjs/toolkit/query';
import { AppState } from 'react-native';

import type { AppDispatch } from './store';

/**
 * Wire RTK Query's refetchOnFocus / refetchOnReconnect to React Native: the app returning to the
 * foreground counts as focus, and NetInfo reports connectivity. Returns an unsubscribe function.
 */
export function setupAppListeners(dispatch: AppDispatch) {
  return setupListeners(dispatch, (_dispatch, { onFocus, onFocusLost, onOnline, onOffline }) => {
    const appState = AppState.addEventListener('change', (state) => {
      _dispatch(state === 'active' ? onFocus() : onFocusLost());
    });
    const netInfo = NetInfo.addEventListener((state) => {
      _dispatch(state.isConnected === false ? onOffline() : onOnline());
    });
    return () => {
      appState.remove();
      netInfo();
    };
  });
}
