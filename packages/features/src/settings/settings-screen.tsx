import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing, ThemedText, ThemedView } from '@starter/ui';

/**
 * Placeholder settings screen. Later phases add theme, language, sign out and app version /
 * environment rows.
 */
export function SettingsScreen() {
  const { t } = useTranslation('settings');

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle" role="heading" testID="settings-title">
          {t('title')}
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
  },
});
