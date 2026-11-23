import { defineFeature } from '@app/feature';
import en from './locales/en.json';
import { homeMockHandlers } from './mocks/handlers';

export const homeFeature = defineFeature({
  name: 'home',
  translations: { en },
  mockHandlers: homeMockHandlers,
});
