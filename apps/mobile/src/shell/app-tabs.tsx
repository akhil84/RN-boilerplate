import { NativeTabs } from 'expo-router/native-tabs';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { destinations } from '@starter/features';
import { Colors, useColorScheme } from '@starter/ui';

type IconProps = ComponentProps<typeof NativeTabs.Trigger.Icon>;

/** Native bottom tabs, one per shared destination (`@starter/features` navigation). */
export default function AppTabs() {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      {destinations.map((destination) => (
        <NativeTabs.Trigger key={destination.route} name={destination.route}>
          <NativeTabs.Trigger.Label>{t(destination.labelKey)}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon {...(destination.icon as IconProps)} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
