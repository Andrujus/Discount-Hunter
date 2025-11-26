import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Heart } from 'lucide-react-native';
import { palette, tones } from '../constants/colors';
import BottomNav from '../components/BottomNav';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function FavoritesScreen() {
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);

  const handleTakePhoto = () => {
    // Camera functionality will be implemented
    router.push('/scanning');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Heart size={32} color={palette.primary} strokeWidth={2} />
          <Text style={styles.title}>Favorites</Text>
        </View>
        
        <View style={styles.emptyState}>
          <Heart size={64} color={tones.neutral400} strokeWidth={1.5} />
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>
            Save your favorite deals to access them quickly
          </Text>
        </View>
      </ScrollView>

      <BottomNav onTakePhoto={handleTakePhoto} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tones.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: palette.secondary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: palette.secondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: tones.mutedText,
    textAlign: 'center',
    maxWidth: 240,
  },
});
