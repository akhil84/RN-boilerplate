import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { Colors, Spacing } from '@ui/tokens/theme';
import { ThemedText } from '@ui/primitives/themed-text';
import { useColorScheme } from '@ui/hooks/use-color-scheme';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
};

/** Primary / secondary action. Always at least 44pt tall; announces busy state while loading. */
export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  ...rest
}: ButtonProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[scheme];
  const isDisabled = disabled || loading;
  const primary = variant === 'primary';

  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-disabled={isDisabled}
      aria-busy={loading}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: primary ? colors.text : colors.backgroundElement },
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={primary ? colors.background : colors.text} />
      ) : (
        <ThemedText type="smallBold" style={{ color: primary ? colors.background : colors.text }}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
});
