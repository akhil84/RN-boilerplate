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

describe('getAppVariant', () => {
  it('reads the variant from app config extra', () => {
    expect(getAppVariant({ appVariant: 'preview' })).toBe('preview');
  });

  it('defaults to development when unset or unknown', () => {
    expect(getAppVariant(undefined)).toBe('development');
    expect(getAppVariant({ appVariant: 'staging' })).toBe('development');
  });
});
