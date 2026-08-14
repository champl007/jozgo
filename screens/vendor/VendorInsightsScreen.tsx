import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../../lib/store';
import { RootStackParamList } from '../../lib/navigation';
import { colors, radii, shadow } from '../../lib/theme';
import { GhostButton } from '../../components/ui';
import { formatNaira } from '../../lib/format';
import { VENDORS } from '../../lib/data';
import { CATEGORY_LABELS } from '../../lib/types';

export default function VendorInsightsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { orders, vendorId, setVendorId, activeVendor, setRole, menu } = useStore();
  const mine = useMemo(() => orders.filter((o) => o.vendorId === vendorId), [orders, vendorId]);
  const delivered = mine.filter((o) => o.status === 'delivered');
  const gmv = delivered.reduce((s, o) => s + o.subtotal, 0);
  const rate = activeVendor?.commissionRate ?? 0.15;
  const commission = Math.round(gmv * rate);
  const stockOut = menu.filter((m) => m.vendorId === vendorId && !m.inStock).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
        <Text style={styles.kicker}>Vendor console</Text>
        <Text style={styles.title}>{activeVendor?.name}</Text>
        <Text style={styles.sub}>
          {activeVendor ? CATEGORY_LABELS[activeVendor.category] : ''} · {activeVendor?.neighborhood} · commission{' '}
          {Math.round(rate * 100)}%
        </Text>

        <View style={styles.grid}>
          <Tile label="Today's tickets" value={String(mine.length)} icon="receipt" />
          <Tile label="Delivered GMV" value={formatNaira(gmv)} icon="trending-up" />
          <Tile label="Commission due" value={formatNaira(commission)} icon="pie-chart" />
          <Tile label="Out of stock" value={String(stockOut)} icon="alert-circle" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Category commission</Text>
          <Text style={styles.body}>
            Food vendors typically sit at 15–18%. Pharmacy is ~10%. Supermarket / market shopper runs are 7–8%. This rate is a
            per-vendor field, not a global constant.
          </Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${Math.min(100, rate * 400)}%` }]} />
          </View>
          <Text style={styles.rate}>{Math.round(rate * 100)}% of item subtotal · delivery fee stays with JozGo</Text>
        </View>

        <Text style={styles.section}>Switch kitchen / shop</Text>
        {VENDORS.map((v) => (
          <Pressable key={v.id} onPress={() => setVendorId(v.id)} style={[styles.vrow, vendorId === v.id && styles.vrowOn]}>
            <View style={[styles.vdot, { backgroundColor: v.accent }]}>
              <Ionicons name={v.icon as keyof typeof Ionicons.glyphMap} size={16} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.vname}>{v.name}</Text>
              <Text style={styles.vmeta}>
                {CATEGORY_LABELS[v.category]} · {Math.round(v.commissionRate * 100)}% commission
              </Text>
            </View>
            {vendorId === v.id ? <Ionicons name="checkmark-circle" size={20} color={colors.accent} /> : null}
          </Pressable>
        ))}

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

function Tile({ label, value, icon }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.tile}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={styles.tileVal}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  kicker: { fontFamily: 'Inter_600SemiBold', color: colors.primary },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 26, color: colors.ink, marginTop: 4 },
  sub: { fontFamily: 'Inter_400Regular', color: colors.muted, marginTop: 4, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: '47.5%',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 14,
    ...shadow.card,
  },
  tileVal: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: colors.ink, marginTop: 8 },
  tileLabel: { fontFamily: 'Inter_400Regular', color: colors.muted, fontSize: 12, marginTop: 2 },
  card: { backgroundColor: colors.white, borderRadius: radii.lg, padding: 14, marginTop: 14 },
  cardTitle: { fontFamily: 'Poppins_600SemiBold', color: colors.ink, marginBottom: 6 },
  body: { fontFamily: 'Inter_400Regular', color: colors.slate, lineHeight: 20, fontSize: 13 },
  barTrack: { height: 8, backgroundColor: colors.paper, borderRadius: 8, marginTop: 12, overflow: 'hidden' },
  barFill: { height: 8, backgroundColor: colors.primary, borderRadius: 8 },
  rate: { fontFamily: 'Inter_400Regular', color: colors.muted, fontSize: 12, marginTop: 8 },
  section: { fontFamily: 'Poppins_600SemiBold', marginTop: 20, marginBottom: 10, color: colors.ink },
  vrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  vrowOn: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  vdot: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  vname: { fontFamily: 'Poppins_600SemiBold', color: colors.ink },
  vmeta: { fontFamily: 'Inter_400Regular', color: colors.muted, fontSize: 12 },
});
