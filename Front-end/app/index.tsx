import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingBag } from 'lucide-react-native';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          <View style={styles.illustration}>
            <ShoppingBag size={120} color="#0705F6" strokeWidth={1.5} />
          </View>
        </View>

        <Text style={styles.title}>Discount Hunter</Text>
        <Text style={styles.subtitle}>Find discounts instantly by snapping a photo.</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/home')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  illustrationContainer: {
    marginBottom: 48,
  },
  illustration: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F8F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0705F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#110792',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 27,
    marginBottom: 48,
  },
  button: {
    backgroundColor: '#0705F6',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 28,
    shadowColor: '#0705F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
