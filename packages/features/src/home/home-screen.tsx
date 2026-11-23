import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing, ThemedText, ThemedView } from '@starter/ui';

/**
 * Placeholder home screen. The stack phase replaces the body with the example RTK Query list
 * (loading / empty / error / success) described in DES for the starter screens.
 */
export function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" role="heading" testID="home-title" style={styles.center}>
          Starter App
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.center}>
          Shared screen from @starter/features
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  center: {
    textAlign: 'center',
  },
});
