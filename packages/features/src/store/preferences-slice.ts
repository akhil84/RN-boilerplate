import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ThemePreference = 'system' | 'light' | 'dark';

export type PreferencesState = {
  theme: ThemePreference;
};

const initialState: PreferencesState = {
  theme: 'system',
};

/** User preferences. Persisted to device storage (see `persistedSlices` in store.ts). */
export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    themeChanged(state, action: PayloadAction<ThemePreference>) {
      state.theme = action.payload;
    },
  },
  selectors: {
    selectThemePreference: (state) => state.theme,
  },
});

export const { themeChanged } = preferencesSlice.actions;
export const { selectThemePreference } = preferencesSlice.selectors;
