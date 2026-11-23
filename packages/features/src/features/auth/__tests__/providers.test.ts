import { getAvailableProviders } from '@features/auth/services/social/providers';

const env = (
  overrides: Partial<{
    web: string;
    ios: string;
    apple: boolean;
    serviceId: string;
    redirect: string;
  }> = {},
) => ({
  google: { webClientId: overrides.web, iosClientId: overrides.ios },
  apple: {
    enabled: overrides.apple ?? false,
    serviceId: overrides.serviceId,
    redirectUri: overrides.redirect,
  },
});

describe('getAvailableProviders', () => {
  it('shows nothing until providers are configured', () => {
    expect(getAvailableProviders(env(), 'ios')).toEqual([]);
    expect(getAvailableProviders(env(), 'web')).toEqual([]);
  });

  it('needs the iOS client ID for Google on iOS only', () => {
    expect(getAvailableProviders(env({ web: 'w' }), 'ios')).toEqual([]);
    expect(getAvailableProviders(env({ web: 'w', ios: 'i' }), 'ios')).toEqual(['google']);
    expect(getAvailableProviders(env({ web: 'w' }), 'android')).toEqual(['google']);
  });

  it('offers Apple natively on iOS and via Apple JS on web, never on Android', () => {
    expect(getAvailableProviders(env({ apple: true }), 'ios')).toEqual(['apple']);
    expect(getAvailableProviders(env({ apple: true }), 'android')).toEqual([]);
    expect(
      getAvailableProviders(env({ serviceId: 's', redirect: 'https://x.test/cb' }), 'web'),
    ).toEqual(['apple']);
  });
});
