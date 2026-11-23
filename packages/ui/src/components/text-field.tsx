import { useId } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Colors, Spacing } from '../theme';
import { ThemedText } from '../themed-text';
import { useColorScheme } from '../use-color-scheme';

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  /** Validation message shown under the field and announced to screen readers. */
  error?: string;
};

/** Labelled text input with an error slot (ADR-0010). `testID` is placed on the input. */
export function TextField({ label, error, testID, ...rest }: TextFieldProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const errorId = useId();

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        aria-label={label}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        placeholderTextColor={colors.textSecondary}
        testID={testID}
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.backgroundElement,
            borderColor: error ? Colors.danger : colors.backgroundSelected,
          },
        ]}
        {...rest}
      />
      {error ? (
        <ThemedText
          nativeID={errorId}
          type="small"
          role="alert"
          style={styles.error}
          testID={testID ? `${testID}-error` : undefined}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.one },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  error: { color: Colors.danger },
});
