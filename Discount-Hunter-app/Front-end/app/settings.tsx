import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Store, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { palette, tones } from '../constants/colors';
import BottomNav from '../components/BottomNav';

const storeChains = [
  { id: '1', name: 'Maxima', link: "https://barbora.lt/", selected: true },
  { id: '2', name: 'Rimi', link:"https://www.rimi.lt/e-parduotuve", selected: true },
  { id: '3', name: 'Iki', link:"https://www.lastmile.lt/chain/IKI", selected: true },
  { id: '4', name: 'Lidl', link:"https://www.lidl.lt/c", selected: true },
  { id: '5', name: 'Assorti', link:"https://www.assorti.lt/", selected: false },
  { id: '6', name: 'Norfa', link:"https://www.norfa.lt/", selected: false },
  { id: '7', name: 'Aibė', link:"Front-end/assets/images/prices/Aibė. Leidinys Nr. 22 (2025.11.13 - 2025.11.25).pdf", selected: false },
];

export default function SettingsScreen() {
  const router = useRouter();

  const handleTakePhoto = () => {
    router.push('/scanning');
  };
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [stores, setStores] = useState(storeChains);

  const toggleStore = (id: string) => {
    setStores(stores.map(store =>
      store.id === id ? { ...store, selected: !store.selected } : store
    ));
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={24} color={palette.secondary} />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Discount Alerts</Text>
                <Text style={styles.settingDescription}>
                  Get notified when new discounts are available
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: tones.subduedBorder, true: palette.accentDark }}
                thumbColor={notificationsEnabled ? palette.primary : tones.surface}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Store size={24} color={palette.secondary} />
            <Text style={styles.sectionTitle}>Preferred Stores</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Select stores to search for discounts
          </Text>

          <View style={styles.storesList}>
            {stores.map((store) => (
              <TouchableOpacity
                key={store.id}
                style={[
                  styles.storeCard,
                  store.selected && styles.storeCardSelected,
                ]}
                onPress={() => toggleStore(store.id)}
                activeOpacity={0.7}
              >
                <View style={styles.storeInfo}>
                  <View style={[
                    styles.storeCheckbox,
                    store.selected && styles.storeCheckboxSelected,
                  ]}>
                    {store.selected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[
                    styles.storeName,
                    store.selected && styles.storeNameSelected,
                  ]}>
                    {store.name}
                  </Text>
                </View>
                <ChevronRight
                  size={20}
                  color={store.selected ? palette.primary : tones.subduedBorder}
                />
              </TouchableOpacity>
            ))}
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.secondary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: tones.mutedText,
    marginBottom: 16,
    marginLeft: 36,
  },
  settingCard: {
    backgroundColor: tones.softAccent,
    borderRadius: 20,
    padding: 20,
    marginTop: 8,
    borderWidth: 2,
    borderColor: tones.subduedBorder,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.secondary,
    marginBottom: 6,
  },
  settingDescription: {
    fontSize: 14,
    color: tones.mutedText,
    lineHeight: 20,
  },
  storesList: {
    gap: 12,
  },
  storeCard: {
    backgroundColor: tones.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: tones.subduedBorder,
  },
  storeCardSelected: {
    backgroundColor: tones.softAccent,
    borderColor: palette.primary,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storeCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: tones.subduedBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeCheckboxSelected: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: tones.mutedText,
  },
  storeNameSelected: {
    color: palette.secondary,
  },
});
