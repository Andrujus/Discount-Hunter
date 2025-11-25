import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Store, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';

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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [stores, setStores] = useState(storeChains);

  const toggleStore = (id: string) => {
    setStores(stores.map(store =>
      store.id === id ? { ...store, selected: !store.selected } : store
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/home')}
        >
          <ArrowLeft size={24} color="#110792" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={24} color="#110792" />
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
                trackColor={{ false: '#E0E0E0', true: '#B079C2' }}
                thumbColor={notificationsEnabled ? '#0705F6' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Store size={24} color="#110792" />
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
                  color={store.selected ? '#0705F6' : '#CCCCCC'}
                />
              </TouchableOpacity>
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
    color: '#110792',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    marginLeft: 36,
  },
  settingCard: {
    backgroundColor: '#F8F9FF',
    borderRadius: 20,
    padding: 20,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#E8E9FF',
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
    color: '#110792',
    marginBottom: 6,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  storesList: {
    gap: 12,
  },
  storeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },
  storeCardSelected: {
    backgroundColor: '#F8F9FF',
    borderColor: '#0705F6',
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
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeCheckboxSelected: {
    backgroundColor: '#0705F6',
    borderColor: '#0705F6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  storeNameSelected: {
    color: '#110792',
  },
  bottomPadding: {
    height: 40,
  },
});
