import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../../lib/store';
import { RootStackParamList } from '../../lib/navigation';
import { colors, radii, shadow } from '../../lib/theme';
import { GhostButton, PrimaryButton } from '../../components/ui';
import { formatNaira } from '../../lib/format';
import { CURRENT_CUSTOMER } from '../../lib/data';

export default function AccountScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { neighborhood, wallet, topUpWallet, setRole, orders } = useStore();
  const delivered = orders.filter((o) => o.status === 'delivered').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
        <Text style={styles.title}>Account</Text>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>ND</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{CURRENT_CUSTOMER.name}</Text>
            <Text style={styles.meta}>{CURRENT_CUSTOMER.phone}</Text>
            <Text style={styles.meta}>{CURRENT_CUSTOMER.address}, {neighborhood}</Text>
          </View>
        </View>

        <View style={styles.wallet}>
          <View>
            <Text style={styles.wLabel}>JozGo Wallet</Text>
            <Text style={styles.wVal}>{formatNaira(wallet)}</Text>
            <Text style={styles.wHint}>Simulated balance · not a real PSP</Text>
          </View>
          <PrimaryButton
            label="Top up ₦2,000"
            onPress={() => {
              topUpWallet(2000);
              Alert.alert('Wallet', '₦2,000 added (mock).');
            }}
          />
        </View>

        <Pressable onPress={() => nav.navigate('NeighborhoodPicker')} style={styles.row}>
          <Ionicons name="location" size={18} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Delivery zone</Text>
            <Text style={styles.rowMeta}>{neighborhood}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </Pressable>

        <View style={styles.stats}>
          <Stat k="Orders" v={String(orders.length)} />
          <Stat k="Delivered" v={String(delivered)} />
          <Stat k="Zone" v={neighborhood.split('/')[0]} />
        </View>

        <Text style={styles.section}>Support</Text>
        <View style={styles.row}>
          <Ionicons name="call" size={18} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>JozGo desk</Text>
            <Text style={styles.rowMeta}>0700 JOZGO NG · Terminus hub</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Ionicons name="information-circle" size={18} color={colors.slate} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>About this build</Text>
            <Text style={styles.rowMeta}>
              Local prototype for Jos. Maps, card rails and live GPS are mocked. Cash-on-delivery is fully wired in the order flow.
            </Text>
          </View>
        </View>

        <View style={{ height: 16 }} />
        <GhostButton
          label="Switch role"
          icon="swap-horizontal"
          onPress={() => {
            setRole(null);
            nav.reset({ index: 0, routes: [{ name: 'RoleSelect' }] });
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statV}>{v}</Text>
      <Text style={styles.statK}>{k}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 28, color: colors.ink, marginBottom: 14 },
  profile: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 16 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontFamily: 'Poppins_700Bold', color: colors.white, fontSize: 20 },
  name: { fontFamily: 'Poppins_600SemiBold', fontSize: 20, color: colors.ink },
  meta: { fontFamily: 'Inter_400Regular', color: colors.muted, marginTop: 2 },
  wallet: {
    backgroundColor: colors.navy,
    borderRadius: radii.xl,
    padding: 16,
    gap: 14,
    marginBottom: 14,
  },
  wLabel: { fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.7)' },
  wVal: { fontFamily: 'Poppins_700Bold', color: colors.white, fontSize: 28, marginTop: 4 },
  wHint: { fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 8,
    ...shadow.card,
  },
  rowTitle: { fontFamily: 'Poppins_600SemiBold', color: colors.ink },
  rowMeta: { fontFamily: 'Inter_400Regular', color: colors.muted, fontSize: 13, marginTop: 2, lineHeight: 18 },
  stats: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  stat: { flex: 1, backgroundColor: colors.white, borderRadius: radii.lg, padding: 12, alignItems: 'center' },
  statV: { fontFamily: 'Poppins_700Bold', color: colors.ink, fontSize: 18 },
  statK: { fontFamily: 'Inter_400Regular', color: colors.muted, fontSize: 12, marginTop: 2 },
  section: { fontFamily: 'Poppins_600SemiBold', marginTop: 10, marginBottom: 8, color: colors.ink },
});
