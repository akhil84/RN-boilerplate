import Constants from 'expo-constants';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAppVariant } from '@starter/config/env';
import { analytics } from '@starter/config/observability';
import { Button, MaxContentWidth, Spacing, ThemedText, ThemedView } from '@starter/ui';

import { signOut } from '../auth/auth-service';
import { SUPPORTED_LANGUAGES, type LanguagePreference } from '../i18n/languages';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  languageChanged,
  selectLanguagePreference,
  selectThemePreference,
  themeChanged,
  type ThemePreference,
} from '../store/preferences-slice';

const THEMES: ThemePreference[] = ['system', 'light', 'dark'];
const LANGUAGES: LanguagePreference[] = ['system', ...SUPPORTED_LANGUAGES];

export function SettingsScreen() {
  const { t } = useTranslation('settings');
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectThemePreference);
  const language = useAppSelector(selectLanguagePreference);

  function chooseTheme(next: ThemePreference) {
    if (next === theme) return;
    dispatch(themeChanged(next));
    analytics.track('theme_changed', { theme: next });
  }

  function chooseLanguage(next: LanguagePreference) {
    if (next === language) return;
    dispatch(languageChanged(next));
    analytics.track('language_changed', { language: next });
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle" role="heading" testID="settings-title">
            {t('title')}
          </ThemedText>

          <Section title={t('appearance')}>
            <View role="radiogroup" aria-label={t('appearance')}>
              {THEMES.map((option) => (
                <OptionRow
                  key={option}
                  label={t(`theme.${option}`)}
                  selected={theme === option}
                  onPress={() => chooseTheme(option)}
                  testID={`settings-theme-${option}`}
                />
              ))}
            </View>
          </Section>

          <Section title={t('language')}>
            <View role="radiogroup" aria-label={t('language')}>
              {LANGUAGES.map((option) => (
                <OptionRow
                  key={option}
                  label={t(`languages.${option}`)}
                  selected={language === option}
                  onPress={() => chooseLanguage(option)}
                  testID={`settings-language-${option}`}
                />
              ))}
            </View>
          </Section>

          <Section title={t('about')}>
            <ThemedText type="small" themeColor="textSecondary" testID="settings-version">
              {t('version', {
                version: Constants.expoConfig?.version ?? '0.0.0',
                variant: getAppVariant(),
              })}
            </ThemedText>
          </Section>

          <Button
            variant="secondary"
            label={t('signOut')}
            onPress={() => void dispatch(signOut())}
            testID="settings-sign-out"
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary" role="heading" aria-level={2}>
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

function OptionRow({
  label,
  selected,
  onPress,
  testID,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID: string;
}) {
  return (
    <Pressable
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
      <ThemedView
        type={selected ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.optionInner}>
        <ThemedText>{label}</ThemedText>
        <ThemedText type="smallBold">{selected ? '✓' : ''}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: { flex: 1, maxWidth: MaxContentWidth },
  content: { gap: Spacing.four, padding: Spacing.four, paddingBottom: Spacing.six * 2 },
  section: { gap: Spacing.two },
  option: { minHeight: 44, marginBottom: Spacing.one },
  optionInner: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
  pressed: { opacity: 0.7 },
});
