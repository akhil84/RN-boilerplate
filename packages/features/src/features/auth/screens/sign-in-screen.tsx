import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { isApiError } from '@starter/api-client';
import { getEnv } from '@starter/core/env';
import { reportError } from '@starter/core/observability';
import { Button, Colors, Spacing, TextField, ThemedText, ThemedView } from '@starter/ui';

import { areMocksEnabled } from '@app/mocks';
import { useAppDispatch } from '@app/store/hooks';
import { signInWithPassword, signInWithProvider } from '@features/auth/services/auth-service';
import { getAvailableProviders } from '@features/auth/services/social/providers';
import type { SocialProvider } from '@features/auth/types';

const credentialsSchema = z.object({
  email: z.email({ error: 'emailInvalid' }),
  password: z.string().min(1, { error: 'passwordRequired' }),
});

type FieldErrors = Partial<Record<'email' | 'password', 'emailInvalid' | 'passwordRequired'>>;

const PROVIDER_LABEL = { google: 'continueWithGoogle', apple: 'continueWithApple' } as const;
const PROVIDER_NAME = { google: 'Google', apple: 'Apple' } as const;

export function SignInScreen() {
  const { t } = useTranslation('auth');
  const dispatch = useAppDispatch();
  const providers = useMemo(() => getAvailableProviders(getEnv()), []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState<'password' | SocialProvider | null>(null);

  async function submit() {
    setFormError(null);
    const parsed = credentialsSchema.safeParse({ email: email.trim(), password });
    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        errors[field] ??= issue.message as FieldErrors[keyof FieldErrors];
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setPending('password');
    try {
      await dispatch(signInWithPassword(parsed.data)).unwrap();
    } catch (error) {
      setFormError(
        isApiError(error) && typeof error.status === 'number' ? error.message : t('errors.generic'),
      );
      if (!isApiError(error)) reportError(error, { flow: 'sign-in', method: 'password' });
    } finally {
      setPending(null);
    }
  }

  async function signInWith(provider: SocialProvider) {
    setFormError(null);
    setPending(provider);
    try {
      await dispatch(signInWithProvider(provider)).unwrap();
    } catch (error) {
      setFormError(t('errors.socialFailed', { provider: PROVIDER_NAME[provider] }));
      reportError(error, { flow: 'sign-in', method: provider });
    } finally {
      setPending(null);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Android 15+ draws edge-to-edge, so the window no longer resizes for the keyboard:
            pad on every native platform or the submit button ends up behind the keyboard. */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'web' ? undefined : 'padding'}
          style={styles.flex}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <ThemedText type="subtitle" role="heading" testID="sign-in-title">
                {t('title')}
              </ThemedText>
              <ThemedText themeColor="textSecondary">{t('subtitle')}</ThemedText>
            </View>

            <TextField
              label={t('email')}
              value={email}
              onChangeText={setEmail}
              error={fieldErrors.email && t(`errors.${fieldErrors.email}`)}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              inputMode="email"
              textContentType="emailAddress"
              testID="sign-in-email"
            />
            <TextField
              label={t('password')}
              value={password}
              onChangeText={setPassword}
              error={fieldErrors.password && t(`errors.${fieldErrors.password}`)}
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              onSubmitEditing={submit}
              testID="sign-in-password"
            />

            {formError ? (
              <ThemedText role="alert" style={styles.formError} testID="sign-in-error">
                {formError}
              </ThemedText>
            ) : null}

            <Button
              label={t('submit')}
              onPress={submit}
              loading={pending === 'password'}
              disabled={pending !== null}
              testID="sign-in-submit"
            />

            {providers.length > 0 ? (
              <>
                <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
                  {t('orContinueWith')}
                </ThemedText>
                {providers.map((provider) => (
                  <Button
                    key={provider}
                    variant="secondary"
                    label={t(PROVIDER_LABEL[provider])}
                    onPress={() => signInWith(provider)}
                    loading={pending === provider}
                    disabled={pending !== null}
                    testID={`sign-in-${provider}`}
                  />
                ))}
              </>
            ) : null}

            {areMocksEnabled() ? (
              <ThemedText type="small" themeColor="textSecondary" testID="sign-in-demo-hint">
                {t('demoHint')}
              </ThemedText>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: { flex: 1, maxWidth: 480 },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  header: { gap: Spacing.two, marginBottom: Spacing.two },
  formError: { color: Colors.danger },
  center: { textAlign: 'center' },
});
