import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ExternalLink, Tag } from 'lucide-react-native';

const mockResults = [
  {
    id: '1',
    store: 'Target',
    price: 24.99,
    discount: 30,
    originalPrice: 35.99,
    isBest: true,
  },
  {
    id: '2',
    store: 'Walmart',
    price: 26.99,
    discount: 25,
    originalPrice: 35.99,
    isBest: false,
  },
  {
    id: '3',
    store: 'Best Buy',
    price: 28.99,
    discount: 20,
    originalPrice: 35.99,
    isBest: false,
  },
  {
    id: '4',
    store: 'Amazon',
    price: 29.99,
    discount: 15,
    originalPrice: 35.99,
    isBest: false,
  },
];

export default function ResultsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/home')}
        >
          <ArrowLeft size={24} color="#110792" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Results</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.productSection}>
          <View style={styles.productImageContainer}>
            <View style={styles.productImagePlaceholder}>
              <Tag size={64} color="#B079C2" strokeWidth={1.5} />
            </View>
          </View>
          <Text style={styles.productName}>Wireless Bluetooth Headphones</Text>
          <Text style={styles.productCategory}>Electronics</Text>
        </View>

        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Available at {mockResults.length} stores</Text>

          <View style={styles.resultsList}>
            {mockResults.map((result) => (
              <View
                key={result.id}
                style={[
                  styles.resultCard,
                  result.isBest && styles.resultCardBest,
                ]}
              >
                {result.isBest && (
                  <View style={styles.bestDealBadge}>
                    <Text style={styles.bestDealText}>Best Deal</Text>
                  </View>
                )}

                <View style={styles.resultHeader}>
                  <Text style={styles.storeName}>{result.store}</Text>
                  <TouchableOpacity style={styles.externalLink}>
                    <ExternalLink size={20} color="#0705F6" />
                  </TouchableOpacity>
                </View>

                <View style={styles.priceSection}>
                  <View style={styles.priceRow}>
                    <Text style={styles.currentPrice}>${result.price.toFixed(2)}</Text>
                    <Text style={styles.originalPrice}>
                      ${result.originalPrice.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{result.discount}% OFF</Text>
                  </View>
                </View>

                <View style={styles.savingsRow}>
                  <Text style={styles.savingsText}>
                    You save ${(result.originalPrice - result.price).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#110792',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  productSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productImageContainer: {
    marginBottom: 20,
  },
  productImagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 20,
    backgroundColor: '#FCF5FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FCB4D4',
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#110792',
    textAlign: 'center',
    marginBottom: 8,
  },
  productCategory: {
    fontSize: 16,
    color: '#666666',
  },
  resultsSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#110792',
    marginBottom: 20,
  },
  resultsList: {
    gap: 16,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultCardBest: {
    borderColor: '#0705F6',
    borderWidth: 3,
    shadowColor: '#0705F6',
    shadowOpacity: 0.15,
  },
  bestDealBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#0705F6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bestDealText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  storeName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#110792',
  },
  externalLink: {
    padding: 4,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: '#110792',
  },
  originalPrice: {
    fontSize: 18,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FCB4D4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  discountText: {
    color: '#110792',
    fontSize: 14,
    fontWeight: '700',
  },
  savingsRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  savingsText: {
    fontSize: 16,
    color: '#0705F6',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
