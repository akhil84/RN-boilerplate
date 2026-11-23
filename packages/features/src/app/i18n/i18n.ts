import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { detectDeviceLanguage, FALLBACK_LANGUAGE } from './languages';
import { NAMESPACES, resources } from './resources';

const i18n = createInstance();

// Resources are bundled, so initialisation is synchronous and the first render is translated.
void i18n.use(initReactI18next).init({
  resources,
  lng: detectDeviceLanguage(),
  fallbackLng: FALLBACK_LANGUAGE,
  ns: NAMESPACES,
  defaultNS: 'common',
  interpolation: { escapeValue: false }, // React already escapes output
  initAsync: false,
  returnNull: false,
});

export { i18n };
