import Constants from 'expo-constants';
import { z } from 'zod';

/**
 * Public runtime configuration (ADR-0011).
 *
 * `EXPO_PUBLIC_*` values are inlined into the JS bundle at build time, so they are readable by
 * anyone with the app: public config only, never secrets. Expo only inlines static property
 * access (`process.env.EXPO_PUBLIC_X`), which is why `readRawEnv` lists every key explicitly.
 */
/** Optional string: an empty value (as left in .env templates) counts as unset. */
const optionalString = (message: string) =>
  z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string({ error: message }).trim().min(1, { error: message }).optional(),
  );

const flag = (name: string) =>
  z
    .enum(['true', 'false'], { error: `${name} must be "true" or "false"` })
    .default('false')
    .transform((value) => value === 'true');

const envSchema = z
  .object({
    EXPO_PUBLIC_API_URL: z.url({ error: 'EXPO_PUBLIC_API_URL must be an absolute URL' }),
    EXPO_PUBLIC_API_TIMEOUT_MS: z.coerce
      .number({ error: 'EXPO_PUBLIC_API_TIMEOUT_MS must be a number of milliseconds' })
      .int()
      .positive()
      .default(15000),
    // Optional: error reporting is off unless a DSN is set (ADR-0013).
    EXPO_PUBLIC_SENTRY_DSN: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.url({ error: 'EXPO_PUBLIC_SENTRY_DSN must be a Sentry DSN URL' }).optional(),
    ),
    // In-app mock backend for development and E2E. Ignored in production builds.
    EXPO_PUBLIC_API_MOCKS: flag('EXPO_PUBLIC_API_MOCKS'),
    // Web token storage (ADR-0015): `local` works with any backend; `cookie` needs backend support.
    EXPO_PUBLIC_WEB_AUTH_MODE: z
      .enum(['local', 'cookie'], { error: 'EXPO_PUBLIC_WEB_AUTH_MODE must be "local" or "cookie"' })
      .default('local'),
    // Social sign-in (ADR-0016). Each provider is hidden unless configured.
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: optionalString('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is empty'),
    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: optionalString('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is empty'),
    EXPO_PUBLIC_APPLE_SIGN_IN: flag('EXPO_PUBLIC_APPLE_SIGN_IN'),
    EXPO_PUBLIC_APPLE_SERVICE_ID: optionalString('EXPO_PUBLIC_APPLE_SERVICE_ID is empty'),
    EXPO_PUBLIC_APPLE_REDIRECT_URI: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.url({ error: 'EXPO_PUBLIC_APPLE_REDIRECT_URI must be a URL' }).optional(),
    ),
  })
  .transform((raw) => ({
    apiUrl: raw.EXPO_PUBLIC_API_URL.replace(/\/+$/, ''),
    apiTimeoutMs: raw.EXPO_PUBLIC_API_TIMEOUT_MS,
    sentryDsn: raw.EXPO_PUBLIC_SENTRY_DSN,
    apiMocks: raw.EXPO_PUBLIC_API_MOCKS,
    webAuthMode: raw.EXPO_PUBLIC_WEB_AUTH_MODE,
    google: {
      webClientId: raw.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: raw.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    },
    apple: {
      enabled: raw.EXPO_PUBLIC_APPLE_SIGN_IN,
      serviceId: raw.EXPO_PUBLIC_APPLE_SERVICE_ID,
      redirectUri: raw.EXPO_PUBLIC_APPLE_REDIRECT_URI,
    },
  }));

export type Env = z.infer<typeof envSchema>;
export type RawEnv = Partial<Record<keyof z.input<typeof envSchema>, string | undefined>>;

export function readRawEnv(): RawEnv {
  return {
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    EXPO_PUBLIC_API_TIMEOUT_MS: process.env.EXPO_PUBLIC_API_TIMEOUT_MS,
    EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
    EXPO_PUBLIC_API_MOCKS: process.env.EXPO_PUBLIC_API_MOCKS,
    EXPO_PUBLIC_WEB_AUTH_MODE: process.env.EXPO_PUBLIC_WEB_AUTH_MODE,
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    EXPO_PUBLIC_APPLE_SIGN_IN: process.env.EXPO_PUBLIC_APPLE_SIGN_IN,
    EXPO_PUBLIC_APPLE_SERVICE_ID: process.env.EXPO_PUBLIC_APPLE_SERVICE_ID,
    EXPO_PUBLIC_APPLE_REDIRECT_URI: process.env.EXPO_PUBLIC_APPLE_REDIRECT_URI,
  };
}

export function parseEnv(raw: RawEnv): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `Invalid app configuration. Check apps/<app>/.env and EAS environment variables:\n${problems}`,
    );
  }
  return result.data;
}

let cached: Env | undefined;

/** Validated config, parsed once. Throws a readable error on the first call if it is invalid. */
export function getEnv(): Env {
  cached ??= parseEnv(readRawEnv());
  return cached;
}

export const APP_VARIANTS = ['development', 'preview', 'production'] as const;
export type AppVariant = (typeof APP_VARIANTS)[number];

/**
 * The build variant (development | preview | production).
 *
 * Read from `EXPO_PUBLIC_APP_VARIANT` (inlined at build time — the only source that reaches web
 * exports), then from `extra.appVariant` set by app.config.ts (native builds and updates).
 * Fails closed: when neither gives a known variant outside a development build, assume production,
 * so production-only safety switches (e.g. mocks off) cannot be skipped by a misconfigured build.
 */
export function getAppVariant(
  extra: Record<string, unknown> | undefined = Constants.expoConfig?.extra,
  isDevBuild: boolean = __DEV__,
  envVariant: string | undefined = process.env.EXPO_PUBLIC_APP_VARIANT,
): AppVariant {
  const known = (value: unknown) => APP_VARIANTS.find((variant) => variant === value);
  return (
    known(envVariant) ?? known(extra?.appVariant) ?? (isDevBuild ? 'development' : 'production')
  );
}
