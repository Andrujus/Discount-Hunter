import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Home, Search, Settings, Camera, Heart } from 'lucide-react-native';
import { palette, tones } from '../constants/colors';

interface BottomNavProps {
  onTakePhoto: () => void;
}

export default function BottomNav({ onTakePhoto }: BottomNavProps) {
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
          color={isActive('/home') ? tones.inverseText : 'rgba(255, 255, 255, 0.6)'}
          fill={isActive('/home') ? tones.inverseText : 'transparent'}
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
          color={isActive('/results') ? tones.inverseText : 'rgba(255, 255, 255, 0.6)'}
        />
        <Text style={[styles.navText, isActive('/results') && styles.navTextActive]}>
          Search
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cameraButton}
        onPress={onTakePhoto}
        activeOpacity={0.8}
      >
        <Camera size={28} color={palette.primary} strokeWidth={2.5} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/favorites')}
        activeOpacity={0.7}
      >
        <Heart
          size={24}
          color={isActive('/favorites') ? tones.inverseText : 'rgba(255, 255, 255, 0.6)'}
          fill={isActive('/favorites') ? tones.inverseText : 'transparent'}
        />
        <Text style={[styles.navText, isActive('/favorites') && styles.navTextActive]}>
          Favorites
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/settings')}
        activeOpacity={0.7}
      >
        <Settings
          size={24}
          color={isActive('/settings') ? tones.inverseText : 'rgba(255, 255, 255, 0.6)'}
        />
        <Text style={[styles.navText, isActive('/settings') && styles.navTextActive]}>
          Settings
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: palette.primary,
    paddingVertical: 12,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
    flex: 1,
  },
  cameraButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: tones.inverseText,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -28,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: palette.primary,
  },
  navText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  navTextActive: {
    color: tones.inverseText,
    fontWeight: '600',
  },
});
