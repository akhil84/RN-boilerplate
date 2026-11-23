import { getAppVariant, parseEnv } from '../env';

describe('parseEnv', () => {
  it('returns typed config for valid values', () => {
    const env = parseEnv({
      EXPO_PUBLIC_API_URL: 'https://api.example.com',
      EXPO_PUBLIC_API_TIMEOUT_MS: '5000',
    });

    expect(env).toEqual({ apiUrl: 'https://api.example.com', apiTimeoutMs: 5000 });
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

describe('getAppVariant', () => {
  it('reads the variant from app config extra', () => {
    expect(getAppVariant({ appVariant: 'preview' })).toBe('preview');
  });

  it('defaults to development when unset or unknown', () => {
    expect(getAppVariant(undefined)).toBe('development');
    expect(getAppVariant({ appVariant: 'staging' })).toBe('development');
  });
});
