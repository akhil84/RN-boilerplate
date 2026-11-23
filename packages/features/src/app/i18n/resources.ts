import { features, type AppFeature } from '@app/registry';
import commonEn from './locales/en/common.json';

/**
 * Translation resources (ADR-0012), built from the feature registry: each feature's
 * `translations.en` becomes the namespace named after the feature; shared strings live in `common`.
 */
type FeatureNamespaces = {
  [
    F in AppFeature as F['translations'] extends { en: unknown } ? F['name'] : never
  ]: F['translations'] extends {
    en: infer Strings;
  }
    ? Strings
    : never;
};

export type Resources = { common: typeof commonEn } & FeatureNamespaces;

const featureNamespaces = Object.fromEntries(
  features.flatMap((feature) => {
    const translations = feature.translations as { en?: unknown } | undefined;
    return translations?.en ? [[feature.name, translations.en]] : [];
  }),
) as FeatureNamespaces;

export const resources = {
  en: { common: commonEn, ...featureNamespaces } as Resources,
};

export const NAMESPACES = Object.keys(resources.en) as (keyof Resources)[];

// Typed keys: `t('home:titel')` or a missing key is a type error.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: Resources;
  }
}
