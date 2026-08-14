import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useEffect } from 'react';
import { useStore } from '../../lib/store';
import { RootStackParamList } from '../../lib/navigation';
import { colors, radii } from '../../lib/theme';
import { EmptyState } from '../../components/ui';
import { formatNaira, statusColor } from '../../lib/format';
import { CURRENT_RIDER } from '../../lib/data';
import { STATUS_LABELS } from '../../lib/types';

export default function RiderJobScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'RiderJob'>>();
  const { orders, updateOrderStatus, assignRider } = useStore();
  const order = orders.find((o) => o.id === route.params.orderId);
  const x = useSharedValue(20);

  useEffect(() => {
    x.value = withRepeat(withTiming(70, { duration: 2600 }), -1, true);
  }, [x]);

  const bike = useAnimatedStyle(() => ({ left: `${x.value}%` }));

  if (!order) {
    return (
      <View style={styles.root}>
        <EmptyState icon="map" title="Job gone" body="This ticket is no longer available." />
      </View>
    );
  }

  const mine = order.riderId === CURRENT_RIDER.id;
  const shopper = order.deliveryMode === 'shopper';

  const claim = () => {
    assignRider(order.id);
    if (shopper && order.status !== 'ready' && order.status !== 'on_the_way') {
      updateOrderStatus(order.id, 'shopping', {
        riderId: CURRENT_RIDER.id,
        riderName: CURRENT_RIDER.name,
        riderPhone: CURRENT_RIDER.phone,
      });
    }
  };

  const pickedUp = () => {
    updateOrderStatus(order.id, 'on_the_way', {
      riderId: CURRENT_RIDER.id,
      riderName: CURRENT_RIDER.name,
      riderPhone: CURRENT_RIDER.phone,
    });
  };

  const delivered = () => updateOrderStatus(order.id, 'delivered');

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.map}>
        <View style={styles.road} />
        <View style={[styles.pin, { left: 24 }]}>
          <Ionicons name="storefront" size={14} color="#fff" />
        </View>
        <View style={[styles.pin, { right: 24, backgroundColor: colors.accent }]}>
          <Ionicons name="home" size={14} color="#fff" />
        </View>
        {order.status === 'on_the_way' ? (
          <Animated.View style={[styles.bike, bike]}>
            <Ionicons name="bicycle" size={16} color="#fff" />
          </Animated.View>
        ) : null}
        <Text style={styles.mapCap}>MOCK MAP · rider pin is animated, not live GPS</Text>
      </View>

      <View style={styles.body}>
        <Text style={[styles.status, { color: statusColor(order.status) }]}>{STATUS_LABELS[order.status]}</Text>
        <Text style={styles.title}>{order.vendorName}</Text>
        <Text style={styles.meta}>
          {shopper ? 'Shopper-mode supermarket run' : 'Point-to-point pickup'} · {order.id}
        </Text>

        <View style={styles.block}>
          <Row icon="navigate" label="Pickup" value={order.vendorName} />
          <Row icon="home" label="Drop-off" value={`${order.address}, ${order.neighborhood}`} />
          <Row icon="call" label="Customer" value={`${order.customerName} · ${order.customerPhone}`} />
          <Row
            icon="cash"
            label="Payment"
            value={order.paymentMethod === 'cash' ? `Collect ${formatNaira(order.total)} cash` : 'Already paid (sim)'}
          />
        </View>

        <Text style={styles.section}>{shopper ? 'Shopping list' : 'Bag contents'}</Text>
        <View style={styles.block}>
          {order.items.map((it) => (
            <View key={it.itemId} style={styles.item}>
              <Text style={styles.itemName}>
                {it.quantity}× {it.name}
              </Text>
              <Text style={styles.itemPrice}>{formatNaira(it.price * it.quantity)}</Text>
            </View>
          ))}
          {shopper ? (
            <View style={styles.running}>
              <Text style={styles.runLabel}>Running total (placeholder)</Text>
              <Text style={styles.runVal}>{formatNaira(order.subtotal)}</Text>
              <Text style={styles.runHint}>
                Shopper-mode is structured for later: substitutions, weight, and a live till. This screen is the placeholder shell.
              </Text>
            </View>
          ) : null}
        </View>

        {order.notes ? <Text style={styles.notes}>Customer note: {order.notes}</Text> : null}

        {!mine && order.status !== 'delivered' ? (
          <Pressable onPress={claim} style={styles.primary}>
            <Text style={styles.primaryText}>Claim this job</Text>
          </Pressable>
        ) : null}

        {mine && (order.status === 'ready' || order.status === 'preparing' || order.status === 'shopping') ? (
          <Pressable onPress={pickedUp} style={styles.primary}>
            <Text style={styles.primaryText}>{shopper && order.status === 'shopping' ? 'Finished shopping · start delivery' : 'Picked up · start delivery'}</Text>
          </Pressable>
        ) : null}

        {mine && order.status === 'on_the_way' ? (
          <Pressable onPress={delivered} style={[styles.primary, { backgroundColor: colors.accent }]}>
            <Text style={styles.primaryText}>
              {order.paymentMethod === 'cash' ? `Collected ${formatNaira(order.total)} · Delivered` : 'Mark delivered'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

function Row({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={16} color={colors.gold} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowVal}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.riderBg },
  map: { height: 180, backgroundColor: '#121722', justifyContent: 'center' },
  road: { height: 14, backgroundColor: '#2A3142' },
  pin: {
    position: 'absolute',
    top: 78,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bike: {
    position: 'absolute',
    top: 76,
    width: 34,
    height: 34,
    marginLeft: -17,
    borderRadius: 17,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  mapCap: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    color: colors.riderMuted,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
  },
  body: { padding: 18 },
  status: { fontFamily: 'Poppins_700Bold', fontSize: 14 },
  title: { fontFamily: 'Poppins_700Bold', color: colors.white, fontSize: 24, marginTop: 4 },
  meta: { fontFamily: 'Inter_400Regular', color: colors.riderMuted, marginTop: 4 },
  block: {
    backgroundColor: colors.riderCard,
    borderRadius: radii.lg,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.riderLine,
    gap: 10,
  },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  rowLabel: { fontFamily: 'Inter_400Regular', color: colors.riderMuted, fontSize: 11 },
  rowVal: { fontFamily: 'Inter_500Medium', color: colors.white, marginTop: 2 },
  section: { fontFamily: 'Poppins_600SemiBold', color: colors.white, marginTop: 18 },
  item: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontFamily: 'Inter_400Regular', color: colors.white, flex: 1, paddingRight: 8 },
  itemPrice: { fontFamily: 'Inter_600SemiBold', color: colors.riderMuted },
  running: { borderTopWidth: 1, borderTopColor: colors.riderLine, paddingTop: 10, marginTop: 4 },
  runLabel: { fontFamily: 'Inter_400Regular', color: colors.riderMuted, fontSize: 12 },
  runVal: { fontFamily: 'Poppins_700Bold', color: colors.white, fontSize: 22, marginTop: 4 },
  runHint: { fontFamily: 'Inter_400Regular', color: colors.riderMuted, fontSize: 12, marginTop: 6, lineHeight: 18 },
  notes: { fontFamily: 'Inter_400Regular', color: colors.gold, marginTop: 12, fontStyle: 'italic' },
  primary: {
    marginTop: 18,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { fontFamily: 'Poppins_600SemiBold', color: colors.white, fontSize: 15, textAlign: 'center', paddingHorizontal: 12 },
});
