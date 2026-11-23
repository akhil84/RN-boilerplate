import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

import { renderWithProviders, screen } from '../../test-utils';
import { i18n } from '../i18n';

function Probe() {
  const { t } = useTranslation();
  return <Text>{t('tabs.settings')}</Text>;
}

describe('i18n', () => {
  it('translates common strings on first render', async () => {
    await renderWithProviders(<Probe />);

    expect(screen.getByText('Settings')).toBeOnTheScreen();
  });

  it('translates feature namespaces', () => {
    expect(i18n.t('home:title')).toBe('Starter App');
  });
});
