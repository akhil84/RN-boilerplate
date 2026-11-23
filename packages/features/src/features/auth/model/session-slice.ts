import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { User } from '@features/auth/types';

/**
 * `unknown` until the stored session has been checked at launch — the splash screen stays up
 * until then, so signed-in users never see the sign-in screen flash. Not persisted: tokens live
 * in secure storage (ADR-0015).
 */
export type SessionStatus = 'unknown' | 'signedIn' | 'signedOut';

export type SessionState = {
  status: SessionStatus;
  user: User | null;
};

const initialState: SessionState = { status: 'unknown', user: null };

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    sessionStarted(state, action: PayloadAction<User>) {
      state.status = 'signedIn';
      state.user = action.payload;
    },
    sessionEnded(state) {
      state.status = 'signedOut';
      state.user = null;
    },
  },
  selectors: {
    selectSessionStatus: (state) => state.status,
    selectCurrentUser: (state) => state.user,
  },
});

export const { sessionStarted, sessionEnded } = sessionSlice.actions;
export const { selectSessionStatus, selectCurrentUser } = sessionSlice.selectors;
