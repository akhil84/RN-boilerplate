import { useEffect } from 'react';

import { useAppSelector } from '../store/hooks';
import { selectLanguagePreference } from '../store/preferences-slice';
import { i18n } from './i18n';
import { resolveLanguage } from './languages';

/** Keep i18next on the user's chosen language (or the device language for `system`). */
export function useLanguageSync() {
  const preference = useAppSelector(selectLanguagePreference);

  useEffect(() => {
    const language = resolveLanguage(preference);
    if (i18n.language !== language) void i18n.changeLanguage(language);
  }, [preference]);
}
