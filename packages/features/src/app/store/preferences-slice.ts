import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { LanguagePreference } from '@app/i18n/languages';

export type ThemePreference = 'system' | 'light' | 'dark';

export type PreferencesState = {
  theme: ThemePreference;
  language: LanguagePreference;
};

export const initialPreferences: PreferencesState = {
  theme: 'system',
  language: 'system',
};

/** User preferences. Persisted to device storage (see `persistedSlices` in store.ts). */
export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: initialPreferences,
  reducers: {
    themeChanged(state, action: PayloadAction<ThemePreference>) {
      state.theme = action.payload;
    },
    languageChanged(state, action: PayloadAction<LanguagePreference>) {
      state.language = action.payload;
    },
  },
  selectors: {
    selectThemePreference: (state) => state.theme,
    selectLanguagePreference: (state) => state.language,
  },
});

export const { themeChanged, languageChanged } = preferencesSlice.actions;
export const { selectThemePreference, selectLanguagePreference } = preferencesSlice.selectors;
