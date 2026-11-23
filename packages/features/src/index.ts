// Public API of @starter/features. Apps import screens from here; features import each other
// only through these entry points, never through internal paths.
import './analytics-events';

export * from './auth';
export { HomeScreen } from './home';
export * from './i18n';
export { areMocksEnabled, DEMO_PASSWORD, enableApiMocks, mockHandlers, mockItems } from './mocks';
export * from './notifications';
export * from './observability';
export { SettingsScreen } from './settings';
export * from './store';
