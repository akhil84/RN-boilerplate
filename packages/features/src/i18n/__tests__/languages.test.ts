import { detectDeviceLanguage, resolveLanguage } from '../languages';

const locale = (languageCode: string | null) =>
  ({ languageCode, languageTag: `${languageCode}-XX` }) as never;

describe('detectDeviceLanguage', () => {
  it('uses the first supported device language', () => {
    expect(detectDeviceLanguage([locale('fr'), locale('en')])).toBe('en');
  });

  it('falls back to English when no device language is supported', () => {
    expect(detectDeviceLanguage([locale('xx'), locale(null)])).toBe('en');
  });
});

describe('resolveLanguage', () => {
  it('follows the device for the system preference', () => {
    expect(resolveLanguage('system', 'en')).toBe('en');
  });

  it('uses an explicit preference over the device language', () => {
    expect(resolveLanguage('en', 'en')).toBe('en');
  });
});
