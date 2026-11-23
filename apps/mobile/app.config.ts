import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * App variants (ADR-0011): development, preview and production install side by side, each with
 * its own bundle ID and name. `APP_VARIANT` comes from the EAS build profile (eas.json) or the
 * shell (`APP_VARIANT=preview pnpm mobile`); it defaults to development.
 */
const VARIANTS = {
  development: { idSuffix: '.dev', nameSuffix: ' (Dev)' },
  preview: { idSuffix: '.preview', nameSuffix: ' (Preview)' },
  production: { idSuffix: '', nameSuffix: '' },
} as const;

type Variant = keyof typeof VARIANTS;

const APP_NAME = 'Starter App';
const BUNDLE_ID = 'com.example.starterapp';

function resolveVariant(value: string | undefined): Variant {
  if (value && value in VARIANTS) return value as Variant;
  return 'development';
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const appVariant = resolveVariant(process.env.APP_VARIANT);
  const { idSuffix, nameSuffix } = VARIANTS[appVariant];
  const bundleId = `${BUNDLE_ID}${idSuffix}`;

  return {
    ...config,
    name: `${APP_NAME}${nameSuffix}`,
    slug: 'starter-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: `starterapp${idSuffix.replace('.', '-')}`,
    userInterfaceStyle: 'automatic',
    platforms: ['ios', 'android'],
    ios: {
      icon: './assets/expo.icon',
      bundleIdentifier: bundleId,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      package: bundleId,
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#208AEF',
          image: './assets/images/splash-icon.png',
          imageWidth: 76,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      appVariant,
    },
  };
};
