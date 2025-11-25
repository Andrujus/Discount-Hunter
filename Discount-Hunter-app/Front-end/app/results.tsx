import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink, Tag } from 'lucide-react-native';
import { palette, tones } from '../constants/colors';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 30;

type StorePrice = {
  id?: string;
  store: string;
  price: number;
  currency?: string;
  originalPrice?: number | null;
  discountPercent?: number | null;
  productUrl?: string | null;
  lastUpdated?: string | null;
};

const sleep = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

export default function ResultsScreen() {
  const router = useRouter();
  const { productName: productNameParam } = useLocalSearchParams<{
    productName?: string | string[];
  }>();

  const productName = Array.isArray(productNameParam)
    ? productNameParam[0]
    : productNameParam || 'wireless bluetooth headphones';

  const [results, setResults] = useState<StorePrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const startScrape = async () => {
      setIsLoading(true);
      setError(null);
      setResults([]);

      try {
        const triggerResponse = await fetch(`${API_BASE_URL}/api/scrape`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: productName }),
          signal: controller.signal,
        });

        if (!triggerResponse.ok) {
          throw new Error('Unable to start scraping job');
        }

        const triggerPayload = await triggerResponse.json();
        const jobId = triggerPayload?.jobId;

        if (!jobId) {
          throw new Error('Scraping job id missing in response');
        }

        for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
          if (!isMounted) {
            return;
          }

          const statusResponse = await fetch(
            `${API_BASE_URL}/api/scrape/${jobId}`,
            { signal: controller.signal }
          );

          if (!statusResponse.ok) {
            throw new Error('Failed to fetch scraping status');
          }

          const statusPayload = await statusResponse.json();

          if (statusPayload.status === 'completed') {
            if (isMounted) {
              setResults(statusPayload.data ?? []);
            }
            return;
          }

          if (statusPayload.status === 'failed') {
            throw new Error(statusPayload.error ?? 'Scraping failed');
          }

          if (attempt < MAX_POLL_ATTEMPTS - 1) {
            await sleep(POLL_INTERVAL_MS);
          }
        }

        throw new Error('Timed out while waiting for scraping results');
      } catch (err) {
        if (!isMounted) {
          return;
        }
        const message =
          err instanceof Error ? err.message : 'Unexpected scraping error';
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    startScrape();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [productName, refreshToken]);

  const decoratedResults = useMemo(() => {
    if (!results.length) {
      return [];
    }

    const cheapestEntry = results.reduce((best, current) => {
      if (!best) {
        return current;
      }
      return current.price < best.price ? current : best;
    }, results[0]);

    const cheapestId =
      cheapestEntry.id ?? `${cheapestEntry.store}-${cheapestEntry.price}`;

    return results.map(result => ({
      ...result,
      isBest:
        (result.id ?? `${result.store}-${result.price}`) === cheapestId &&
        result.price === cheapestEntry.price,
    }));
  }, [results]);

  const formatPrice = (price?: number, currency = '€') => {
    if (typeof price !== 'number' || Number.isNaN(price)) {
      return '--';
    }
    return `${currency}${price.toFixed(2)}`;
  };

  const handleExternalLink = async (url?: string | null) => {
    if (!url) {
      return;
    }
    try {
      await Linking.openURL(url);
    } catch {
      setError('Unable to open store link');
    }
  };

  const handleRetry = () => {
    setRefreshToken(token => token + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/home')}
        >
          <ArrowLeft size={24} color={palette.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Results</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.productSection}>
          <View style={styles.productImageContainer}>
            <View style={styles.productImagePlaceholder}>
              <Tag size={64} color={palette.accentDark} strokeWidth={1.5} />
            </View>
          </View>
          <Text style={styles.productName}>{productName}</Text>
          <Text style={styles.productCategory}>Electronics</Text>
        </View>

        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>
            {isLoading
              ? 'Searching stores for the best prices...'
              : `Available at ${decoratedResults.length} stores`}
          </Text>

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={palette.primary} />
              <Text style={styles.loadingText}>Scraping local stores...</Text>
            </View>
          )}

          {!!error && !isLoading && (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Something went wrong</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
                activeOpacity={0.8}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isLoading && !error && !decoratedResults.length && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No live prices yet</Text>
              <Text style={styles.emptyMessage}>
                We could not find prices from Maxima, Rimi, Lidl, or other
                supported stores for this product. Try rescanning or adjusting
                the search term.
              </Text>
            </View>
          )}

          {decoratedResults.length > 0 && (
            <View style={styles.resultsList}>
              {decoratedResults.map((result, index) => {
                const resultKey =
                  result.id ?? `${result.store}-${result.price}-${index}`;
                const savings =
                  typeof result.originalPrice === 'number'
                    ? result.originalPrice - result.price
                    : null;
                const discountText =
                  typeof result.discountPercent === 'number'
                    ? `${Math.round(result.discountPercent)}% OFF`
                    : savings && result.originalPrice
                    ? `${Math.round(
                        (savings / result.originalPrice) * 100
                      )}% OFF`
                    : null;

                return (
                  <View
                    key={resultKey}
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
                      <TouchableOpacity
                        style={[
                          styles.externalLink,
                          !result.productUrl && styles.externalLinkDisabled,
                        ]}
                        onPress={() => handleExternalLink(result.productUrl)}
                        disabled={!result.productUrl}
                      >
                        <ExternalLink
                          size={20}
                          color={result.productUrl ? palette.primary : tones.subduedBorder}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.priceSection}>
                      <View style={styles.priceRow}>
                        <Text style={styles.currentPrice}>
                          {formatPrice(result.price, result.currency)}
                        </Text>
                        {typeof result.originalPrice === 'number' && (
                          <Text style={styles.originalPrice}>
                            {formatPrice(result.originalPrice, result.currency)}
                          </Text>
                        )}
                      </View>
                      {!!discountText && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>{discountText}</Text>
                        </View>
                      )}
                    </View>

                    {!!savings && savings > 0 && (
                      <View style={styles.savingsRow}>
                        <Text style={styles.savingsText}>
                          You save {formatPrice(savings, result.currency)}
                        </Text>
                      </View>
                    )}

                    {!!result.lastUpdated && (
                      <Text style={styles.timestamp}>
                        Updated {new Date(result.lastUpdated).toLocaleString()}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tones.background,
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
    color: palette.secondary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  productSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: tones.subduedBorder,
  },
  productImageContainer: {
    marginBottom: 20,
  },
  productImagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 20,
    backgroundColor: tones.softAccent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: palette.accent,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  productCategory: {
    fontSize: 16,
    color: tones.mutedText,
  },
  resultsSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.secondary,
  },
  resultsList: {
    gap: 16,
  },
  resultCard: {
    backgroundColor: tones.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: tones.subduedBorder,
    shadowColor: tones.accentShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultCardBest: {
    borderColor: palette.primary,
    borderWidth: 3,
    shadowColor: tones.primaryShadow,
    shadowOpacity: 0.15,
  },
  bestDealBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: palette.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bestDealText: {
    color: tones.inverseText,
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
    color: palette.secondary,
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
    color: palette.secondary,
  },
  originalPrice: {
    fontSize: 18,
    color: 'rgba(176, 121, 194, 0.8)',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: palette.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  discountText: {
    color: palette.secondary,
    fontSize: 14,
    fontWeight: '700',
  },
  savingsRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: tones.subduedBorder,
  },
  savingsText: {
    fontSize: 16,
    color: palette.primary,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
  timestamp: {
    marginTop: 12,
    fontSize: 12,
    color: tones.mutedText,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 24,
  },
  loadingText: {
    fontSize: 14,
    color: tones.mutedText,
  },
  errorCard: {
    backgroundColor: 'rgba(252, 180, 212, 0.2)',
    borderWidth: 2,
    borderColor: palette.accent,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.secondary,
  },
  errorMessage: {
    fontSize: 14,
    color: palette.accentDark,
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: palette.primary,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    color: tones.inverseText,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyState: {
    borderWidth: 2,
    borderColor: tones.subduedBorder,
    borderRadius: 16,
    padding: 20,
    backgroundColor: tones.softAccent,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.secondary,
  },
  emptyMessage: {
    fontSize: 14,
    color: tones.mutedText,
    lineHeight: 20,
  },
  externalLinkDisabled: {
    opacity: 0.4,
  },
});
