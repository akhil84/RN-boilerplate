import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '../tokens/theme';
import { ThemedView } from '../primitives/themed-view';

export type ScreenProps = {
  children?: ReactNode;
  /** Wrap the content in a ScrollView (forms, settings). Leave off for screens with a list. */
  scroll?: boolean;
  /** Centre the content vertically (sign-in, empty / error states). */
  centered?: boolean;
  /** Pad for the on-screen keyboard. Needed on Android 15+, which no longer resizes the window. */
  keyboardAvoiding?: boolean;
  /** Apply the standard screen padding (default). Turn off when children manage their own. */
  padded?: boolean;
  /** Safe-area edges to respect. Tab screens skip `bottom` (the tab bar handles it). */
  edges?: Edge[];
  maxWidth?: number;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Standard screen frame (ADR-0017): themed background, safe area, a content column capped at
 * `MaxContentWidth` and centred on wide (web / tablet) windows, optional scroll and keyboard
 * handling. Every feature screen starts with this instead of repeating container styles.
 */
export function Screen({
  children,
  scroll = false,
  centered = false,
  keyboardAvoiding = false,
  padded = true,
  edges = ['top', 'left', 'right'],
  maxWidth = MaxContentWidth,
  contentStyle,
  testID,
}: ScreenProps) {
  const inner = [styles.inner, padded && styles.padded, centered && styles.centered, contentStyle];

  let body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, inner]}
      keyboardShouldPersistTaps="handled"
      testID={testID ? `${testID}-scroll` : undefined}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fill, inner]}>{children}</View>
  );

  if (keyboardAvoiding) {
    body = (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'web' ? undefined : 'padding'}
        style={styles.fill}>
        {body}
      </KeyboardAvoidingView>
    );
  }

  return (
    <ThemedView style={styles.container} testID={testID}>
      <SafeAreaView
        style={[styles.column, { maxWidth }]}
        edges={edges}
        testID={testID ? `${testID}-content` : undefined}>
        {body}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  column: { flex: 1 },
  fill: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  inner: { gap: Spacing.three },
  padded: { padding: Spacing.four },
  centered: { justifyContent: 'center' },
});
