import './analytics';

import { defineFeature } from '@app/feature';
import en from './locales/en.json';

export const settingsFeature = defineFeature({
  name: 'settings',
  translations: { en },
});
