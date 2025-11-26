import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, Image as ImageIcon, User, LogOut, LogIn } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useState, useRef } from 'react';
import { palette, tones } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';

export default function HomeScreen() {
  const router = useRouter();
  const { logout, user, isAuthenticated } = useAuth();
  const [showCamera, setShowCamera] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth');
        },
      },
    ]);
  };

  const handleTakePhoto = async () => {
    if (!permission) {
      return;
    }

    if (!permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera permission is needed to scan products.');
        return;
      }
    }

    setShowCamera(true);
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      setShowCamera(false);
      router.push('/scanning');
    }
  };

  const handleUploadFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      router.push('/scanning');
    }
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.captureContainer}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleCapture}
                activeOpacity={0.8}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Button */}
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => setShowProfileMenu(true)}
        activeOpacity={0.7}
      >
        <User size={24} color={palette.primary} strokeWidth={2} />
      </TouchableOpacity>

      {/* Profile Menu Modal */}
      <Modal
        visible={showProfileMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowProfileMenu(false)}
        >
          <View style={styles.profileMenu}>
            {isAuthenticated && user ? (
              <>
                <View style={styles.profileInfo}>
                  <View style={styles.avatarCircle}>
                    <User size={32} color={palette.primary} strokeWidth={2} />
                  </View>
                  <Text style={styles.profileName}>{user.firstName} {user.lastName}</Text>
                  <Text style={styles.profileEmail}>{user.email}</Text>
                </View>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowProfileMenu(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={20} color={palette.primary} strokeWidth={2} />
                  <Text style={styles.menuItemText}>Logout</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowProfileMenu(false);
                  router.push('/auth');
                }}
              >
                <LogIn size={20} color={palette.primary} strokeWidth={2} />
                <Text style={styles.menuItemText}>Sign In</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.content}>
        <View style={styles.topSection}>
          <View style={styles.welcomeSection}>
            <Text style={styles.title}>Find the Best Deals</Text>
            {user && <Text style={styles.userName}>Hi, {user.firstName}!</Text>}
          </View>
        </View>

        <View style={styles.actionSection}>
          {/* Take Photo button moved to footer - content will be added here later */}
        </View>
      </View>

      <BottomNav onTakePhoto={handleTakePhoto} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tones.background,
  },
  profileButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tones.softAccent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: tones.subduedBorder,
    zIndex: 10,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 110,
    paddingRight: 24,
  },
  profileMenu: {
    backgroundColor: tones.inverseText,
    borderRadius: 16,
    padding: 20,
    minWidth: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  profileInfo: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: tones.subduedBorder,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: tones.softAccent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: palette.primary,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.secondary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: tones.mutedText,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: palette.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topSection: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  welcomeSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: palette.secondary,
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    color: tones.mutedText,
    fontWeight: '500',
  },
  actionSection: {
    gap: 20,
    minHeight: 200,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  captureContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(252, 180, 212, 0.45)',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.primary,
  },
});
