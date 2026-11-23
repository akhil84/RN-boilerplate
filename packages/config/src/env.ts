import Constants from 'expo-constants';
import { z } from 'zod';

/**
 * Public runtime configuration (ADR-0011).
 *
 * `EXPO_PUBLIC_*` values are inlined into the JS bundle at build time, so they are readable by
 * anyone with the app: public config only, never secrets. Expo only inlines static property
 * access (`process.env.EXPO_PUBLIC_X`), which is why `readRawEnv` lists every key explicitly.
 */
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
  })
  .transform((raw) => ({
    apiUrl: raw.EXPO_PUBLIC_API_URL.replace(/\/+$/, ''),
    apiTimeoutMs: raw.EXPO_PUBLIC_API_TIMEOUT_MS,
    sentryDsn: raw.EXPO_PUBLIC_SENTRY_DSN,
  }));

export type Env = z.infer<typeof envSchema>;
export type RawEnv = Partial<Record<keyof z.input<typeof envSchema>, string | undefined>>;

export function readRawEnv(): RawEnv {
  return {
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    EXPO_PUBLIC_API_TIMEOUT_MS: process.env.EXPO_PUBLIC_API_TIMEOUT_MS,
    EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
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
 * The build variant, set by `APP_VARIANT` in app.config.ts and exposed through `extra.appVariant`.
 */
export function getAppVariant(
  extra: Record<string, unknown> | undefined = Constants.expoConfig?.extra,
): AppVariant {
  const value = extra?.appVariant;
  return APP_VARIANTS.find((variant) => variant === value) ?? 'development';
}
