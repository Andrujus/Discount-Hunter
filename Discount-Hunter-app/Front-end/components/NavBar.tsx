import { useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { palette, tones } from '../constants/colors';

type NavRoute = '/home' | '/results' | '/settings';

type NavItem = {
  label: string;
  route: NavRoute;
};

type NavBarProps = {
  style?: StyleProp<ViewStyle>;
};

const navItems: ReadonlyArray<NavItem> = [
  { label: 'Home', route: '/home' },
  { label: 'Results', route: '/results' },
  { label: 'Settings', route: '/settings' },
];

export default function NavBar({ style }: NavBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const activeRoute = useMemo<NavRoute | null>(() => {
    const match = navItems.find(item => item.route === pathname);
    return match?.route ?? null;
  }, [pathname]);

  return (
    <View style={[styles.container, style]}>
      {navItems.map(item => {
        const isActive = item.route === activeRoute;
        return (
          <TouchableOpacity
            key={item.route}
            style={[styles.item, isActive && styles.itemActive]}
            onPress={() => router.push(item.route)}
            activeOpacity={0.8}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: palette.primary,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.primary,
    shadowColor: tones.primaryShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  item: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
  },
  itemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  label: {
    color: tones.inverseText,
    fontSize: 16,
    fontWeight: '600',
  },
  labelActive: {
    color: tones.inverseText,
  },
});

