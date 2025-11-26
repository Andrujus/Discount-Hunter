import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Home, Search, Settings, LogOut } from 'lucide-react-native';
import { palette, tones } from '../constants/colors';

interface BottomNavProps {
  onLogout?: () => void;
}

export default function BottomNav({ onLogout }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/home')}
        activeOpacity={0.7}
      >
        <Home
          size={24}
          color={isActive('/home') ? palette.primary : tones.neutral400}
          fill={isActive('/home') ? palette.primary : 'transparent'}
        />
        <Text style={[styles.navText, isActive('/home') && styles.navTextActive]}>
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/results')}
        activeOpacity={0.7}
      >
        <Search
          size={24}
          color={isActive('/results') ? palette.primary : tones.neutral400}
        />
        <Text style={[styles.navText, isActive('/results') && styles.navTextActive]}>
          Search
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/settings')}
        activeOpacity={0.7}
      >
        <Settings
          size={24}
          color={isActive('/settings') ? palette.primary : tones.neutral400}
        />
        <Text style={[styles.navText, isActive('/settings') && styles.navTextActive]}>
          Settings
        </Text>
      </TouchableOpacity>

      {onLogout && (
        <TouchableOpacity
          style={styles.navItem}
          onPress={onLogout}
          activeOpacity={0.7}
        >
          <LogOut size={24} color="#e74c3c" />
          <Text style={[styles.navText, { color: '#e74c3c' }]}>Logout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: tones.neutral50,
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: tones.neutral200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  navText: {
    fontSize: 12,
    fontWeight: '500',
    color: tones.neutral400,
    marginTop: 2,
  },
  navTextActive: {
    color: palette.primary,
    fontWeight: '600',
  },
});
