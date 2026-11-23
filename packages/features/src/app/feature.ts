import type { Slice } from '@reduxjs/toolkit';

import type { MockHandler } from '@starter/api-client';

/**
 * A feature's manifest (ADR-0026): everything the app wiring needs from it, in one place.
 * `app/registry.ts` lists the manifests; the store, i18n resources and mock API are built from
 * that list — so adding a feature never means editing those files.
 */
export type Feature<
  Name extends string = string,
  Translations = unknown,
  Slices extends readonly Slice[] = readonly Slice[],
> = {
  /** Kebab-case folder name; also the i18n namespace (`useTranslation(name)`). */
  name: Name;
  /** `{ en: json, … }` — one entry per supported language, or `undefined` for no strings. */
  translations: Translations;
  /** Redux slices this feature owns; added to the root reducer under `slice.name`. */
  slices: Slices;
  /** Mock API handlers for this feature's endpoints (dev / tests / E2E; never in production). */
  mockHandlers: readonly MockHandler[];
};

export function defineFeature<
  const Name extends string,
  Translations = undefined,
  const Slices extends readonly Slice[] = [],
>(definition: {
  name: Name;
  translations?: Translations;
  slices?: Slices;
  mockHandlers?: readonly MockHandler[];
}): Feature<Name, Translations, Slices> {
  return {
    translations: undefined as Translations,
    slices: [] as unknown as Slices,
    mockHandlers: [],
    ...definition,
  };
}
