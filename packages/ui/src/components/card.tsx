import { StyleSheet } from 'react-native';

import { Spacing } from '../theme';
import { ThemedView, type ThemedViewProps } from '../themed-view';

export type CardProps = ThemedViewProps & {
  /** Inner padding as a spacing token. */
  padding?: keyof typeof Spacing;
};

/** A raised surface for grouped content (list rows, panels). Light and dark aware. */
export function Card({ padding = 'three', style, type = 'backgroundElement', ...rest }: CardProps) {
  return (
    <ThemedView type={type} style={[styles.card, { padding: Spacing[padding] }, style]} {...rest} />
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Spacing.three, gap: Spacing.half },
});
