import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { colors, radii, shadow } from '../../lib/theme';
import { Chip, EmptyState, GhostButton, PrimaryButton } from '../../components/ui';
import { formatNaira, formatRelative, nextVendorStatus, statusColor } from '../../lib/format';
import { Order, STATUS_LABELS } from '../../lib/types';

export default function VendorOrdersScreen() {
  const { orders, vendorId, activeVendor, updateOrderStatus } = useStore();
  const [tab, setTab] = useState<'incoming' | 'live' | 'done'>('incoming');

  const mine = useMemo(() => orders.filter((o) => o.vendorId === vendorId), [orders, vendorId]);
  const data = useMemo(() => {
    if (tab === 'incoming') return mine.filter((o) => o.status === 'pending');
    if (tab === 'live') return mine.filter((o) => ['shopping', 'preparing', 'ready', 'on_the_way'].includes(o.status));
    return mine.filter((o) => ['delivered', 'rejected', 'cancelled'].includes(o.status));
  }, [mine, tab]);

  const accept = (order: Order) => {
    const next = nextVendorStatus('pending', order.vendorCategory);
    if (next) updateOrderStatus(order.id, next);
  };

  const advance = (order: Order) => {
    const next = nextVendorStatus(order.status, order.vendorCategory);
    if (next) updateOrderStatus(order.id, next);
    else Alert.alert('Waiting on rider', 'Mark ready — a rider picks up from here.');
  };

  const render = ({ item }: { item: Order }) => {
    const next = nextVendorStatus(item.status, item.vendorCategory);
    const commission = Math.round(item.subtotal * (activeVendor?.commissionRate ?? 0.15));
    return (
      <View style={styles.card}>
        <View style={styles.top}>
          <Text style={styles.id}>{item.id}</Text>
          <Text style={[styles.status, { color: statusColor(item.status) }]}>{STATUS_LABELS[item.status]}</Text>
        </View>
        <Text style={styles.name}>{item.customerName} · {item.neighborhood}</Text>
        <Text style={styles.meta}>{formatRelative(item.createdAt)} · {item.paymentMethod === 'cash' ? 'COD' : item.paymentMethod}</Text>
        {item.items.map((it) => (
          <Text key={it.itemId} style={styles.line}>
            {it.quantity}× {it.name}
          </Text>
        ))}
        {item.notes ? <Text style={styles.notes}>Note: {item.notes}</Text> : null}
        <View style={styles.money}>
          <Text style={styles.total}>{formatNaira(item.total)}</Text>
          <Text style={styles.comm}>Commission {formatNaira(commission)} · {(activeVendor?.commissionRate ?? 0) * 100}%</Text>
        </View>
        {item.status === 'pending' ? (
          <View style={styles.actions}>
            <View style={{ flex: 1 }}>
              <GhostButton label="Reject" danger onPress={() => updateOrderStatus(item.id, 'rejected')} />
            </View>
            <View style={{ flex: 1.4 }}>
              <PrimaryButton
                label={item.vendorCategory === 'supermarket' ? 'Start shopping' : 'Accept'}
                onPress={() => accept(item)}
              />
            </View>
          </View>
        ) : next ? (
          <PrimaryButton
            label={next === 'ready' ? 'Mark ready for pickup' : `Move to ${STATUS_LABELS[next]}`}
            color={colors.accent}
            onPress={() => advance(item)}
          />
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.kicker}>{activeVendor?.name}</Text>
      <Text style={styles.title}>Orders</Text>
      <View style={styles.chips}>
        <Chip label={`Incoming (${mine.filter((o) => o.status === 'pending').length})`} active={tab === 'incoming'} onPress={() => setTab('incoming')} />
        <Chip label="Live" active={tab === 'live'} onPress={() => setTab('live')} />
        <Chip label="Done" active={tab === 'done'} onPress={() => setTab('done')} />
      </View>
      <FlatList
        data={data}
        keyExtractor={(o) => o.id}
        renderItem={render}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28 }}
        ListEmptyComponent={
          <EmptyState icon="file-tray-outline" title="Queue is clear" body="New JozGo tickets will land here first." />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  kicker: { fontFamily: 'Inter_600SemiBold', color: colors.primary, paddingHorizontal: 18, paddingTop: 8 },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 28, color: colors.ink, paddingHorizontal: 18 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16 },
  card: { backgroundColor: colors.white, borderRadius: radii.lg, padding: 14, marginBottom: 10, ...shadow.card },
  top: { flexDirection: 'row', justifyContent: 'space-between' },
  id: { fontFamily: 'Inter_600SemiBold', color: colors.muted, fontSize: 12 },
  status: { fontFamily: 'Poppins_600SemiBold', fontSize: 13 },
  name: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.ink, marginTop: 8 },
  meta: { fontFamily: 'Inter_400Regular', color: colors.muted, marginTop: 2, marginBottom: 8 },
  line: { fontFamily: 'Inter_400Regular', color: colors.slate, marginBottom: 2 },
  notes: { fontFamily: 'Inter_400Regular', fontStyle: 'italic', color: colors.slate, marginTop: 6 },
  money: { marginVertical: 10 },
  total: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: colors.ink },
  comm: { fontFamily: 'Inter_400Regular', color: colors.muted, fontSize: 12, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
});
