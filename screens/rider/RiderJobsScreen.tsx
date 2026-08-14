import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../../lib/store';
import { RootStackParamList } from '../../lib/navigation';
import { colors, radii } from '../../lib/theme';
import { Chip, EmptyState } from '../../components/ui';
import { formatNaira, formatRelative, statusColor } from '../../lib/format';
import { CURRENT_RIDER } from '../../lib/data';
import { Order, STATUS_LABELS } from '../../lib/types';

export default function RiderJobsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { orders } = useStore();
  const [tab, setTab] = useState<'mine' | 'open'>('mine');

  const mine = useMemo(() => orders.filter((o) => o.riderId === CURRENT_RIDER.id), [orders]);
  const open = useMemo(
    () => orders.filter((o) => !o.riderId && ['pending', 'preparing', 'ready', 'shopping'].includes(o.status)),
    [orders]
  );
  const data = tab === 'mine' ? mine : open;

  const render = ({ item }: { item: Order }) => (
    <Pressable onPress={() => nav.navigate('RiderJob', { orderId: item.id })} style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.mode}>{item.deliveryMode === 'shopper' ? 'SHOPPER' : 'P2P'}</Text>
        <Text style={[styles.status, { color: statusColor(item.status) }]}>{STATUS_LABELS[item.status]}</Text>
      </View>
      <Text style={styles.title}>{item.vendorName}</Text>
      <Text style={styles.meta}>
        → {item.neighborhood} · {item.items.length} items · {formatNaira(item.deliveryFee)} fee
      </Text>
      <Text style={styles.time}>{formatRelative(item.createdAt)} · {item.paymentMethod === 'cash' ? 'Collect cash' : 'Prepaid'}</Text>
    </Pressable>
  );

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']}>
        <Text style={styles.h}>Jobs</Text>
        <View style={styles.chips}>
          <Chip label="My jobs" active={tab === 'mine'} onPress={() => setTab('mine')} />
          <Chip label={`Open (${open.length})`} active={tab === 'open'} onPress={() => setTab('open')} />
        </View>
      </SafeAreaView>
      <FlatList
        data={data}
        keyExtractor={(o) => o.id}
        renderItem={render}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListEmptyComponent={
          <EmptyState
            icon="bicycle"
            title={tab === 'mine' ? 'No assigned jobs' : 'Nothing in the pool'}
            body="Go online on the Go tab to receive requests."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.riderBg },
  h: { fontFamily: 'Poppins_700Bold', fontSize: 28, color: colors.white, paddingHorizontal: 18, paddingTop: 8 },
  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingVertical: 12 },
  card: {
    backgroundColor: colors.riderCard,
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.riderLine,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between' },
  mode: { fontFamily: 'Inter_700Bold', color: colors.gold, fontSize: 11, letterSpacing: 1 },
  status: { fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
  title: { fontFamily: 'Poppins_600SemiBold', color: colors.white, fontSize: 17, marginTop: 8 },
  meta: { fontFamily: 'Inter_400Regular', color: colors.riderMuted, marginTop: 4 },
  time: { fontFamily: 'Inter_400Regular', color: colors.riderMuted, fontSize: 12, marginTop: 4 },
});
