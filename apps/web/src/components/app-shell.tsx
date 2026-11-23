import {
  TabList,
  type TabListProps,
  Tabs,
  TabSlot,
  TabTrigger,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { createContext, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, type PressableProps, StyleSheet, View } from 'react-native';

import { Spacing, ThemedText, ThemedView, useMinWidth } from '@starter/ui';

const CloseMenuContext = createContext<() => void>(() => {});

/**
 * Signed-in web shell: a sidebar from the `md` breakpoint up; below it, a top bar whose menu
 * button expands the navigation. Built on expo-router/ui headless tabs, so routing and the
 * active state come from the router.
 */
export function AppShell() {
  const { t } = useTranslation();
  const wide = useMinWidth('md');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <CloseMenuContext.Provider value={() => setMenuOpen(false)}>
      <Tabs style={wide ? styles.row : styles.column}>
        <TabList asChild>
          <Navigation wide={wide} open={menuOpen} onToggle={() => setMenuOpen((open) => !open)}>
            <TabTrigger name="home" href="/" asChild>
              <NavItem testID="nav-home">{t('tabs.home')}</NavItem>
            </TabTrigger>
            <TabTrigger name="settings" href="/settings" asChild>
              <NavItem testID="nav-settings">{t('tabs.settings')}</NavItem>
            </TabTrigger>
          </Navigation>
        </TabList>
        <TabSlot style={styles.slot} />
      </Tabs>
    </CloseMenuContext.Provider>
  );
}

type NavigationProps = TabListProps & { wide: boolean; open: boolean; onToggle: () => void };

function Navigation({ wide, open, onToggle, children, ...props }: NavigationProps) {
  const { t } = useTranslation();

  if (wide) {
    return (
      <View {...props} role="navigation" style={styles.sidebar} testID="web-nav">
        <ThemedView type="backgroundElement" style={styles.sidebarInner}>
          <ThemedText type="smallBold" style={styles.brand}>
            {t('appName')}
          </ThemedText>
          {children}
        </ThemedView>
      </View>
    );
  }

  return (
    <View {...props} role="navigation" testID="web-nav">
      <ThemedView type="backgroundElement" style={styles.topBar}>
        <ThemedText type="smallBold">{t('appName')}</ThemedText>
        <Pressable
          role="button"
          aria-label={t('menu')}
          aria-expanded={open}
          onPress={onToggle}
          testID="web-nav-toggle"
          style={styles.menuButton}>
          <ThemedText type="smallBold">{open ? '✕' : '☰'}</ThemedText>
        </Pressable>
      </ThemedView>
      {/* Triggers stay mounted (the router needs them); only their visibility changes. */}
      <ThemedView type="backgroundElement" style={[styles.menu, !open && styles.hidden]}>
        {children}
      </ThemedView>
    </View>
  );
}

function NavItem({ children, isFocused, onPress, ...props }: TabTriggerSlotProps) {
  const closeMenu = useContext(CloseMenuContext);

  return (
    <Pressable
      {...(props as PressableProps)}
      aria-current={isFocused ? 'page' : undefined}
      onPress={(event) => {
        onPress?.(event);
        closeMenu();
      }}
      style={({ pressed }) => [styles.navItem, pressed && styles.pressed]}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.navItemInner}>
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: 'row' },
  column: { flex: 1, flexDirection: 'column' },
  slot: { flex: 1 },
  sidebar: { width: 240, padding: Spacing.three },
  sidebarInner: { flex: 1, gap: Spacing.one, padding: Spacing.three, borderRadius: Spacing.four },
  brand: { marginBottom: Spacing.three },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    minHeight: 56,
  },
  menuButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  menu: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.three, gap: Spacing.one },
  hidden: { display: 'none' },
  navItem: { minHeight: 44 },
  navItemInner: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
  pressed: { opacity: 0.7 },
});
