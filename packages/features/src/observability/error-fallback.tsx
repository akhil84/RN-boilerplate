import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import type { ErrorFallbackProps } from '@starter/config/observability';
import { MaxContentWidth, Spacing, ThemedText, ThemedView } from '@starter/ui';

/** Shown by the root ErrorBoundary after a render error (the error is already reported). */
export function ErrorFallback({ reset }: ErrorFallbackProps) {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle" role="heading" testID="error-title">
          {t('errors.title')}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{t('errors.body')}</ThemedText>
        <Pressable
          role="button"
          onPress={reset}
          testID="error-retry"
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <ThemedView type="backgroundElement" style={styles.buttonInner}>
            <ThemedText type="smallBold">{t('errors.retry')}</ThemedText>
          </ThemedView>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  button: { alignSelf: 'flex-start', minHeight: 44 },
  buttonInner: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
  },
  pressed: { opacity: 0.7 },
});
