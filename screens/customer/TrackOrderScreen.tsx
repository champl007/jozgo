import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useStore } from '../../lib/store';
import { RootStackParamList } from '../../lib/navigation';
import { colors, radii, shadow } from '../../lib/theme';
import { EmptyState } from '../../components/ui';
import { etaFor, formatNaira, formatTime, statusColor } from '../../lib/format';
import { OrderStatus, PAYMENT_LABELS, STATUS_LABELS } from '../../lib/types';

const STEPS: OrderStatus[] = ['pending', 'preparing', 'ready', 'on_the_way', 'delivered'];
const SHOPPER_STEPS: OrderStatus[] = ['pending', 'shopping', 'ready', 'on_the_way', 'delivered'];

export default function TrackOrderScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'TrackOrder'>>();
  const { orders } = useStore();
  const order = orders.find((o) => o.id === route.params.orderId);
  const riderX = useSharedValue(18);

  useEffect(() => {
    riderX.value = withRepeat(withTiming(78, { duration: 2800 }), -1, true);
  }, [riderX]);

  const riderStyle = useAnimatedStyle(() => ({
    left: `${riderX.value}%`,
  }));

  if (!order) {
    return <EmptyState icon="map" title="Order not found" body="This ticket is no longer on your device." />;
  }

  const steps = order.deliveryMode === 'shopper' ? SHOPPER_STEPS : STEPS;
  const idx = Math.max(0, steps.indexOf(order.status === 'rejected' || order.status === 'cancelled' ? 'pending' : order.status));
  const live = order.status === 'on_the_way';

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <View style={styles.map}>
        <View style={styles.grid} />
        <View style={styles.roadH} />
        <View style={styles.roadV} />
        <View style={[styles.pin, { top: 28, left: 28 }]}>
          <Ionicons name="storefront" size={14} color={colors.white} />
        </View>
        <View style={[styles.pin, { bottom: 28, right: 28, backgroundColor: colors.accent }]}>
          <Ionicons name="home" size={14} color={colors.white} />
        </View>
        {live ? (
          <Animated.View style={[styles.bike, riderStyle]}>
            <Ionicons name="bicycle" size={16} color={colors.white} />
          </Animated.View>
        ) : null}
        <View style={styles.mapCaption}>
          <Text style={styles.mapKicker}>MOCK MAP · Jos streets not live GPS</Text>
          <Text style={styles.mapTitle}>{etaFor(order.status, order.vendorCategory)}</Text>
        </View>
      </View>

      <View style={styles.statusCard}>
        <Text style={[styles.status, { color: statusColor(order.status) }]}>{STATUS_LABELS[order.status]}</Text>
        <Text style={styles.vendor}>{order.vendorName}</Text>
        <Text style={styles.meta}>
          {order.id} · {formatTime(order.createdAt)} · {PAYMENT_LABELS[order.paymentMethod]}
        </Text>
        <View style={styles.steps}>
          {steps.map((s, i) => {
            const on = i <= idx && order.status !== 'rejected' && order.status !== 'cancelled';
            return (
              <View key={s} style={styles.step}>
                <View style={[styles.stepDot, on && { backgroundColor: colors.primary }]} />
                {i < steps.length - 1 ? <View style={[styles.stepLine, on && i < idx && { backgroundColor: colors.primary }]} /> : null}
                <Text style={[styles.stepLabel, on && { color: colors.ink }]}>{STATUS_LABELS[s]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {order.riderName ? (
        <View style={styles.card}>
          <View style={styles.riderAvatar}>
            <Ionicons name="bicycle" size={20} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{order.riderName}</Text>
            <Text style={styles.cardMeta}>{order.riderPhone} · JozGo rider</Text>
          </View>
          <Pressable style={styles.call}>
            <Ionicons name="call" size={16} color={colors.primary} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <Ionicons name="time" size={20} color={colors.primary} />
          <Text style={styles.cardMeta}>Assigning a rider around {order.neighborhood}…</Text>
        </View>
      )}

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Drop-off</Text>
        <Text style={styles.body}>{order.address}</Text>
        <Text style={styles.cardMeta}>{order.neighborhood} · {order.customerName}</Text>
        {order.notes ? <Text style={styles.notes}>Note: {order.notes}</Text> : null}
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Items</Text>
        {order.items.map((it) => (
          <View key={it.itemId} style={styles.itemRow}>
            <Text style={styles.body}>
              {it.quantity}× {it.name}
            </Text>
            <Text style={styles.body}>{formatNaira(it.price * it.quantity)}</Text>
          </View>
        ))}
        <View style={styles.itemRow}>
          <Text style={styles.cardMeta}>Delivery</Text>
          <Text style={styles.cardMeta}>{formatNaira(order.deliveryFee)}</Text>
        </View>
        {order.discount ? (
          <View style={styles.itemRow}>
            <Text style={styles.cardMeta}>Promo</Text>
            <Text style={styles.cardMeta}>−{formatNaira(order.discount)}</Text>
          </View>
        ) : null}
        <View style={styles.itemRow}>
          <Text style={styles.total}>Total</Text>
          <Text style={styles.total}>{formatNaira(order.total)}</Text>
        </View>
        {order.paymentMethod === 'cash' ? (
          <Text style={styles.cod}>Pay the rider {formatNaira(order.total)} cash on delivery.</Text>
        ) : (
          <Text style={styles.cod}>Paid via {PAYMENT_LABELS[order.paymentMethod]} (simulated).</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.paper },
  map: {
    height: 210,
    borderRadius: radii.xl,
    backgroundColor: '#D7E4D2',
    overflow: 'hidden',
    marginBottom: 14,
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#C9D8C4',
    opacity: 0.35,
  },
  roadH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '48%',
    height: 18,
    backgroundColor: '#B7B3A8',
  },
  roadV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '42%',
    width: 14,
    backgroundColor: '#C0BBAF',
  },
  pin: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bike: {
    position: 'absolute',
    top: '44%',
    width: 34,
    height: 34,
    marginLeft: -17,
    borderRadius: 17,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapCaption: { position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: 'rgba(18,20,28,0.78)', borderRadius: 12, padding: 10 },
  mapKicker: { color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 0.6 },
  mapTitle: { color: colors.white, fontFamily: 'Poppins_600SemiBold', fontSize: 16, marginTop: 2 },
  statusCard: { backgroundColor: colors.white, borderRadius: radii.lg, padding: 16, ...shadow.card },
  status: { fontFamily: 'Poppins_700Bold', fontSize: 20 },
  vendor: { fontFamily: 'Poppins_600SemiBold', color: colors.ink, marginTop: 4 },
  meta: { fontFamily: 'Inter_400Regular', color: colors.muted, marginTop: 2, fontSize: 12 },
  steps: { marginTop: 16, gap: 0 },
  step: { flexDirection: 'row', alignItems: 'center', minHeight: 28 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.line, zIndex: 1 },
  stepLine: { position: 'absolute', left: 4, top: 18, width: 2, height: 18, backgroundColor: colors.line },
  stepLabel: { marginLeft: 12, fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.muted },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 14,
    marginTop: 12,
    ...shadow.card,
  },
  riderAvatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: 'Poppins_600SemiBold', color: colors.ink },
  cardMeta: { fontFamily: 'Inter_400Regular', color: colors.muted, fontSize: 13 },
  call: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  block: { backgroundColor: colors.white, borderRadius: radii.lg, padding: 14, marginTop: 12 },
  blockTitle: { fontFamily: 'Poppins_600SemiBold', color: colors.ink, marginBottom: 8 },
  body: { fontFamily: 'Inter_400Regular', color: colors.slate, lineHeight: 20 },
  notes: { fontFamily: 'Inter_400Regular', color: colors.slate, marginTop: 8, fontStyle: 'italic' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  total: { fontFamily: 'Poppins_600SemiBold', color: colors.ink, marginTop: 6 },
  cod: { fontFamily: 'Inter_600SemiBold', color: colors.accentDark, marginTop: 8 },
});
