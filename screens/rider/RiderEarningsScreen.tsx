import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../../lib/store';
import { RootStackParamList } from '../../lib/navigation';
import { colors, radii } from '../../lib/theme';
import { GhostButton } from '../../components/ui';
import { formatNaira } from '../../lib/format';
import { CURRENT_RIDER } from '../../lib/data';

export default function RiderEarningsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { orders, setRole } = useStore();
  const mine = useMemo(() => orders.filter((o) => o.riderId === CURRENT_RIDER.id), [orders]);
  const done = mine.filter((o) => o.status === 'delivered');
  const fees = done.reduce((s, o) => s + o.deliveryFee, 0);
  const tips = Math.round(done.length * 150);
  const cashCollected = done.filter((o) => o.paymentMethod === 'cash').reduce((s, o) => s + o.total, 0);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']}>
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
          <Text style={styles.h}>Earnings</Text>
          <Text style={styles.sub}>
            {CURRENT_RIDER.name} · ★ {CURRENT_RIDER.rating} · {CURRENT_RIDER.trips} trips
          </Text>

          <View style={styles.hero}>
            <Text style={styles.heroLabel}>Net this week (mock)</Text>
            <Text style={styles.heroVal}>{formatNaira(fees + tips)}</Text>
            <Text style={styles.heroMeta}>Delivery fees {formatNaira(fees)} + estimated tips {formatNaira(tips)}</Text>
          </View>

          <View style={styles.row}>
            <Tile icon="bicycle" label="Completed" value={String(done.length)} />
            <Tile icon="cash" label="Cash held" value={formatNaira(cashCollected)} />
          </View>
          <View style={styles.row}>
            <Tile icon="flash" label="Active jobs" value={String(mine.filter((o) => o.status !== 'delivered').length)} />
            <Tile icon="navigate" label="P2P / Shopper" value={`${mine.filter((o) => o.deliveryMode === 'point_to_point').length}/${mine.filter((o) => o.deliveryMode === 'shopper').length}`} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payouts</Text>
            <Text style={styles.body}>
              Cash-on-delivery stays with the rider until hub remittance. Card/wallet jobs settle to the rider wallet the next
              morning. This screen does not talk to a bank — figures are computed from local orders only.
            </Text>
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
    </View>
  );
}

function Tile({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.tile}>
      <Ionicons name={icon} size={16} color={colors.gold} />
      <Text style={styles.tileVal}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.riderBg },
  h: { fontFamily: 'Poppins_700Bold', fontSize: 28, color: colors.white },
  sub: { fontFamily: 'Inter_400Regular', color: colors.riderMuted, marginTop: 4, marginBottom: 16 },
  hero: {
    backgroundColor: colors.riderCard,
    borderRadius: radii.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.riderLine,
    marginBottom: 12,
  },
  heroLabel: { fontFamily: 'Inter_400Regular', color: colors.riderMuted },
  heroVal: { fontFamily: 'Poppins_700Bold', color: colors.white, fontSize: 32, marginTop: 4 },
  heroMeta: { fontFamily: 'Inter_400Regular', color: colors.riderMuted, marginTop: 6, fontSize: 12 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  tile: {
    flex: 1,
    backgroundColor: colors.riderCard,
    borderRadius: radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.riderLine,
  },
  tileVal: { fontFamily: 'Poppins_700Bold', color: colors.white, fontSize: 18, marginTop: 8 },
  tileLabel: { fontFamily: 'Inter_400Regular', color: colors.riderMuted, fontSize: 12, marginTop: 2 },
  card: {
    backgroundColor: colors.riderCard,
    borderRadius: radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.riderLine,
    marginTop: 6,
  },
  cardTitle: { fontFamily: 'Poppins_600SemiBold', color: colors.white, marginBottom: 6 },
  body: { fontFamily: 'Inter_400Regular', color: colors.riderMuted, lineHeight: 20, fontSize: 13 },
});
