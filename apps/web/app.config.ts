import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Web app config. `APP_VARIANT` (development | preview | production) is exposed to JS through
 * `extra.appVariant`; set it when exporting, e.g. `APP_VARIANT=production pnpm --filter
 * @starter/web export` (ADR-0011).
 */
const VARIANTS = ['development', 'preview', 'production'] as const;

export default ({ config }: ConfigContext): ExpoConfig => {
  const appVariant =
    VARIANTS.find((variant) => variant === process.env.APP_VARIANT) ?? 'development';

  return {
    ...config,
    name: 'Starter App',
    slug: 'starter-app-web',
    version: '1.0.0',
    scheme: 'starterapp',
    userInterfaceStyle: 'automatic',
    platforms: ['web'],
    web: {
      output: 'single',
      favicon: './assets/images/favicon.png',
    },
    plugins: ['expo-router'],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      appVariant,
    },
  };
};
