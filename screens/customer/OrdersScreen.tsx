import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../../lib/store';
import { RootStackParamList } from '../../lib/navigation';
import { colors, radii, shadow } from '../../lib/theme';
import { Chip, EmptyState } from '../../components/ui';
import { formatNaira, formatRelative, statusColor } from '../../lib/format';
import { Order, PAYMENT_LABELS, STATUS_LABELS } from '../../lib/types';

export default function OrdersScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { orders } = useStore();
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const [refreshing, setRefreshing] = useState(false);

  const data = useMemo(() => {
    const active = ['pending', 'shopping', 'preparing', 'ready', 'on_the_way'];
    return orders.filter((o) => (tab === 'active' ? active.includes(o.status) : !active.includes(o.status)));
  }, [orders, tab]);

  const render = ({ item }: { item: Order }) => (
    <Pressable onPress={() => nav.navigate('TrackOrder', { orderId: item.id })} style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.id}>{item.id}</Text>
        <View style={[styles.pill, { backgroundColor: statusColor(item.status) + '22' }]}>
          <View style={[styles.dot, { backgroundColor: statusColor(item.status) }]} />
          <Text style={[styles.pillText, { color: statusColor(item.status) }]}>{STATUS_LABELS[item.status]}</Text>
        </View>
      </View>
      <Text style={styles.vendor}>{item.vendorName}</Text>
      <Text style={styles.meta}>
        {item.items.length} item{item.items.length === 1 ? '' : 's'} · {formatNaira(item.total)} · {PAYMENT_LABELS[item.paymentMethod]}
      </Text>
      <Text style={styles.time}>{formatRelative(item.createdAt)} · {item.neighborhood}</Text>
      <View style={styles.arrow}>
        <Ionicons name="navigate" size={14} color={colors.primary} />
        <Text style={styles.track}>Track order</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Orders</Text>
      <View style={styles.chips}>
        <Chip label="Active" active={tab === 'active'} onPress={() => setTab('active')} />
        <Chip label="Past" active={tab === 'past'} onPress={() => setTab('past')} />
      </View>
      <FlatList
        data={data}
        keyExtractor={(o) => o.id}
        renderItem={render}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 24 }}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => setRefreshing(false), 600);
        }}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title={tab === 'active' ? 'No live orders' : 'No history yet'}
            body="Place a food, pharmacy or market order from Home."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 28, color: colors.ink, paddingHorizontal: 18, paddingTop: 8 },
  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingVertical: 12 },
  card: { backgroundColor: colors.white, borderRadius: radii.lg, padding: 14, marginBottom: 10, ...shadow.card },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { fontFamily: 'Inter_600SemiBold', color: colors.muted, fontSize: 12 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  pillText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  vendor: { fontFamily: 'Poppins_600SemiBold', fontSize: 17, color: colors.ink, marginTop: 8 },
  meta: { fontFamily: 'Inter_400Regular', color: colors.slate, marginTop: 4 },
  time: { fontFamily: 'Inter_400Regular', color: colors.muted, fontSize: 12, marginTop: 4 },
  arrow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  track: { fontFamily: 'Inter_600SemiBold', color: colors.primary, fontSize: 13 },
});
