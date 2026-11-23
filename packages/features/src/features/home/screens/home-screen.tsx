import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BottomTabInset,
  Button,
  MaxContentWidth,
  Spacing,
  ThemedText,
  ThemedView,
} from '@starter/ui';

import { selectCurrentUser } from '@features/auth';
import { useAppSelector } from '@app/store/hooks';
import { useGetItemsQuery } from '@features/home/api/items-api';
import type { Item } from '@features/home/types';

/**
 * Example feature screen: one RTK Query endpoint rendered in all four states (loading, error with
 * retry, empty, success). Copy this shape for new list screens.
 */
export function HomeScreen() {
  const { t } = useTranslation('home');
  const user = useAppSelector(selectCurrentUser);
  const { data, isLoading, isError, isFetching, refetch } = useGetItemsQuery();

  const header = (
    <View style={styles.header}>
      <ThemedText type="subtitle" role="heading" testID="home-title">
        {t('title')}
      </ThemedText>
      {user?.name ? (
        <ThemedText themeColor="textSecondary" testID="home-greeting">
          {t('greeting', { name: user.name })}
        </ThemedText>
      ) : null}
    </View>
  );

  let body;
  if (isLoading) {
    body = (
      <View style={styles.state} testID="home-loading">
        <ActivityIndicator accessibilityLabel={t('loading')} />
      </View>
    );
  } else if (isError) {
    body = (
      <View style={styles.state} testID="home-error">
        <ThemedText role="alert">{t('error')}</ThemedText>
        <Button
          variant="secondary"
          label={t('retry')}
          onPress={refetch}
          loading={isFetching}
          testID="home-retry"
        />
      </View>
    );
  } else if (!data?.length) {
    body = (
      <View style={styles.state} testID="home-empty">
        <ThemedText themeColor="textSecondary">{t('empty')}</ThemedText>
      </View>
    );
  } else {
    body = (
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ItemRow item={item} />}
        onRefresh={refetch}
        refreshing={isFetching}
        contentContainerStyle={styles.list}
        testID="home-list"
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {header}
        {body}
      </SafeAreaView>
    </ThemedView>
  );
}

function ItemRow({ item }: { item: Item }) {
  return (
    <ThemedView type="backgroundElement" style={styles.row} testID={`home-item-${item.id}`}>
      <ThemedText type="smallBold">{item.title}</ThemedText>
      {item.description ? (
        <ThemedText type="small" themeColor="textSecondary">
          {item.description}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: { flex: 1, maxWidth: MaxContentWidth },
  header: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  list: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  row: { gap: Spacing.half, padding: Spacing.three, borderRadius: Spacing.three },
});
