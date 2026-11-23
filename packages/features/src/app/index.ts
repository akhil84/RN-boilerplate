// App infrastructure (ADR-0026): store, providers, navigation, i18n, mocks and the feature
// registry. Features build on this; apps import it through the package entry (`@starter/features`).
export { defineFeature, type Feature } from './feature';
export * from './i18n';
export { areMocksEnabled, enableApiMocks, getMockHandlers, isMockAuthorized } from './mocks';
export * from './navigation';
export * from './providers';
export { features, type AppFeature } from './registry';
export * from './store';
