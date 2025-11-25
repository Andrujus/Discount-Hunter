import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { Scan } from 'lucide-react-native';
import { palette, tones } from '../constants/colors';

export default function ScanningScreen() {
  const router = useRouter();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);
  const [loading, setLoading] = useState(false);

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

    // Try to immediately open the camera when the screen mounts
    (async () => {
      await startImageCaptureAndUpload();
    })();
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  async function startImageCaptureAndUpload() {
    setLoading(true);

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setLoading(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        base64: false,
      });

      if (result.cancelled) {
        setLoading(false);
        return;
      }

      // Prepare upload
      const uri = result.assets?.[0]?.uri ?? (result as any).uri;
      if (!uri) {
        setLoading(false);
        console.log('No URI available');
        router.replace({ pathname: '/results', params: { productName: 'Unknown Product' } });
        return;
      }

      const form = new FormData();
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = filename.match(/\.(\w+)$/);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // For web, we need to fetch the blob from the URI
      let fileData = { uri, name: filename, type };
      
      // Check if we're in web environment and need to convert blob
      if (typeof window !== 'undefined' && uri.startsWith('blob:')) {
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          fileData = blob;
        } catch (e) {
          console.log('Could not convert blob, using URI directly');
        }
      }

      // @ts-ignore - React Native FormData file
      form.append('file', fileData);

      // API base - use localhost:3000 for web
      const API_BASE = 'http://localhost:3000';

      console.log('Uploading to:', `${API_BASE}/api/ocr`);
      const resp = await fetch(`${API_BASE}/api/ocr`, {
        method: 'POST',
        body: form as any,
        headers: {
          'Accept': 'application/json',
          // Let fetch set multipart boundary
        },
      });

      console.log('Response status:', resp.status);

      if (!resp.ok) {
        const errorText = await resp.text();
        console.log('Error response:', errorText);
        setLoading(false);
        router.replace({ pathname: '/results', params: { productName: 'Unknown Product' } });
        return;
      }

      const json = await resp.json();
      const productName = json.productName || 'Unknown Product';
      
      console.log('OCR Result:', productName);

      setLoading(false);
      router.replace({ pathname: '/results', params: { productName } });
    } catch (err) {
      console.error('Error in OCR upload:', err);
      setLoading(false);
      router.replace({ pathname: '/results', params: { productName: 'Unknown Product' } });
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, animatedStyle]}>
          <View style={styles.iconBackground}>
            <Scan size={80} color={palette.primary} strokeWidth={2} />
          </View>
        </Animated.View>

        <Text style={styles.title}>Identifying product...</Text>
        <Text style={styles.subtitle}>Take a photo of the product</Text>

        <View style={styles.loadingContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={palette.primary} />
          ) : (
            <TouchableOpacity onPress={startImageCaptureAndUpload} style={styles.captureButton}>
              <Text style={styles.captureButtonText}>Take Photo</Text>
            </TouchableOpacity>
          )}
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
