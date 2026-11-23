import { getAppVariant, parseEnv } from '../env';

describe('parseEnv', () => {
  it('returns typed config for valid values', () => {
    const env = parseEnv({
      EXPO_PUBLIC_API_URL: 'https://api.example.com',
      EXPO_PUBLIC_API_TIMEOUT_MS: '5000',
    });

    expect(env).toEqual({
      apiUrl: 'https://api.example.com',
      apiTimeoutMs: 5000,
      sentryDsn: undefined,
      apiMocks: false,
      webAuthMode: 'local',
      google: { webClientId: undefined, iosClientId: undefined },
      apple: { enabled: false, serviceId: undefined, redirectUri: undefined },
    });
  });

  it('defaults the API timeout to 15 seconds', () => {
    const env = parseEnv({ EXPO_PUBLIC_API_URL: 'https://api.example.com' });

    expect(env.apiTimeoutMs).toBe(15000);
  });

  it('strips a trailing slash from the API URL', () => {
    expect(parseEnv({ EXPO_PUBLIC_API_URL: 'https://api.example.com/v1/' }).apiUrl).toBe(
      'https://api.example.com/v1',
    );
  });

  it('fails fast with a readable message when the API URL is missing', () => {
    expect(() => parseEnv({})).toThrow(/EXPO_PUBLIC_API_URL/);
  });

  it('rejects a malformed API URL', () => {
    expect(() => parseEnv({ EXPO_PUBLIC_API_URL: 'not a url' })).toThrow(/EXPO_PUBLIC_API_URL/);
  });

  it('rejects a non-numeric timeout', () => {
    expect(() =>
      parseEnv({ EXPO_PUBLIC_API_URL: 'https://api.example.com', EXPO_PUBLIC_API_TIMEOUT_MS: 'x' }),
    ).toThrow(/EXPO_PUBLIC_API_TIMEOUT_MS/);
  });
});

describe('parseEnv — Sentry DSN', () => {
  const base = { EXPO_PUBLIC_API_URL: 'https://api.example.com' };

  it('treats an empty DSN as unset', () => {
    expect(parseEnv({ ...base, EXPO_PUBLIC_SENTRY_DSN: '' }).sentryDsn).toBeUndefined();
  });

  it('accepts a DSN URL', () => {
    const dsn = 'https://key@o0.ingest.sentry.io/1';
    expect(parseEnv({ ...base, EXPO_PUBLIC_SENTRY_DSN: dsn }).sentryDsn).toBe(dsn);
  });

  it('rejects a malformed DSN', () => {
    expect(() => parseEnv({ ...base, EXPO_PUBLIC_SENTRY_DSN: 'nope' })).toThrow(
      /EXPO_PUBLIC_SENTRY_DSN/,
    );
  });
});

describe('parseEnv — auth and mocks', () => {
  const base = { EXPO_PUBLIC_API_URL: 'https://api.example.com' };

  it('reads boolean flags', () => {
    const env = parseEnv({
      ...base,
      EXPO_PUBLIC_API_MOCKS: 'true',
      EXPO_PUBLIC_APPLE_SIGN_IN: 'true',
    });

    expect(env.apiMocks).toBe(true);
    expect(env.apple.enabled).toBe(true);
  });

  it('rejects a flag that is not true/false', () => {
    expect(() => parseEnv({ ...base, EXPO_PUBLIC_API_MOCKS: 'yes' })).toThrow(
      /EXPO_PUBLIC_API_MOCKS/,
    );
  });

  it('accepts cookie web auth mode and rejects unknown modes', () => {
    expect(parseEnv({ ...base, EXPO_PUBLIC_WEB_AUTH_MODE: 'cookie' }).webAuthMode).toBe('cookie');
    expect(() => parseEnv({ ...base, EXPO_PUBLIC_WEB_AUTH_MODE: 'session' })).toThrow(
      /EXPO_PUBLIC_WEB_AUTH_MODE/,
    );
  });

  it('treats empty social client IDs as unset', () => {
    const env = parseEnv({ ...base, EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: '' });

    expect(env.google.webClientId).toBeUndefined();
  });
});

describe('getAppVariant', () => {
  it('reads the variant from app config extra', () => {
    expect(getAppVariant({ appVariant: 'preview' }, false, undefined)).toBe('preview');
  });

  it('defaults to development when unset or unknown in a development build', () => {
    expect(getAppVariant(undefined, true, undefined)).toBe('development');
    expect(getAppVariant({ appVariant: 'staging' }, true, undefined)).toBe('development');
  });

  it('prefers EXPO_PUBLIC_APP_VARIANT (the only source available in web exports)', () => {
    expect(getAppVariant(undefined, false, 'preview')).toBe('preview');
    expect(getAppVariant({ appVariant: 'development' }, false, 'production')).toBe('production');
  });

  it('fails closed to production when unset or unknown in a release build', () => {
    expect(getAppVariant(undefined, false, undefined)).toBe('production');
    expect(getAppVariant({ appVariant: 'staging' }, false, 'staging')).toBe('production');
  });
});
