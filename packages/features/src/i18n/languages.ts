import { getLocales } from 'expo-localization';

/** Languages the app ships translations for. Add a code here and its JSON files to add one. */
export const SUPPORTED_LANGUAGES = ['en'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const FALLBACK_LANGUAGE: Language = 'en';

/** `system` follows the device language; anything else is a user override. */
export type LanguagePreference = 'system' | Language;

export function isSupportedLanguage(code: string | null | undefined): code is Language {
  return SUPPORTED_LANGUAGES.some((language) => language === code);
}

/** The device's preferred language if we support it, otherwise the fallback. */
export function detectDeviceLanguage(locales = getLocales()): Language {
  const match = locales.find((locale) => isSupportedLanguage(locale.languageCode));
  return (match?.languageCode as Language | undefined) ?? FALLBACK_LANGUAGE;
}

export function resolveLanguage(
  preference: LanguagePreference,
  deviceLanguage: Language = detectDeviceLanguage(),
): Language {
  return preference === 'system' ? deviceLanguage : preference;
}
