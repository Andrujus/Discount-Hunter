import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { Scan } from 'lucide-react-native';
import { palette, tones } from '../constants/colors';
import NavBar from '../components/NavBar';

export default function ScanningScreen() {
  const router = useRouter();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    opacity.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    const timeout = setTimeout(() => {
      router.replace({
        pathname: '/results',
        params: {
          productName: 'Wireless Bluetooth Headphones',
        },
      });
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <NavBar style={styles.navBar} />
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, animatedStyle]}>
          <View style={styles.iconBackground}>
            <Scan size={80} color={palette.primary} strokeWidth={2} />
          </View>
        </Animated.View>

        <Text style={styles.title}>Identifying product...</Text>
        <Text style={styles.subtitle}>Searching for the best discounts</Text>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tones.background,
  },
  navBar: {
    marginHorizontal: 24,
    marginTop: 48,
    marginBottom: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: tones.softAccent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: tones.subduedBorder,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.secondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: tones.mutedText,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  loadingContainer: {
    marginTop: 20,
  },
});
