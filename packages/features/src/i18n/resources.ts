import authEn from '../auth/locales/en.json';
import homeEn from '../home/locales/en.json';
import settingsEn from '../settings/locales/en.json';
import commonEn from './locales/en/common.json';

/**
 * Translation resources (ADR-0012). Each feature owns a namespace in `<feature>/locales/<lang>.json`;
 * shared strings live in the `common` namespace. Register a new feature's namespace here.
 */
export const resources = {
  en: {
    common: commonEn,
    auth: authEn,
    home: homeEn,
    settings: settingsEn,
  },
} as const;

export const NAMESPACES = Object.keys(resources.en) as (keyof typeof resources.en)[];

// Typed keys: `t('home:titel')` or a missing key is a type error.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: (typeof resources)['en'];
  }
}
