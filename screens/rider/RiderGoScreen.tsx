import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../../lib/store';
import { RootStackParamList } from '../../lib/navigation';
import { colors, radii } from '../../lib/theme';
import { formatNaira } from '../../lib/format';
import { CURRENT_RIDER } from '../../lib/data';
import { Order } from '../../lib/types';

export default function RiderGoScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { orders, riderOnline, setRiderOnline, assignRider, updateOrderStatus } = useStore();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.18, { duration: 900 }), -1, true);
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 2 - pulse.value,
  }));

  const offer = useMemo(() => {
    if (!riderOnline) return undefined;
    return orders.find(
      (o) =>
        !o.riderId &&
        (o.status === 'ready' || o.status === 'pending' || o.status === 'preparing' || o.status === 'shopping')
    );
  }, [orders, riderOnline]);

  const active = useMemo(
    () => orders.find((o) => o.riderId === CURRENT_RIDER.id && ['shopping', 'on_the_way', 'ready', 'preparing'].includes(o.status)),
    [orders]
  );

  const [skipped, setSkipped] = useState<string[]>([]);
  const visibleOffer = offer && !skipped.includes(offer.id) ? offer : undefined;

  const accept = (order: Order) => {
    assignRider(order.id);
    if (order.deliveryMode === 'shopper' && (order.status === 'pending' || order.status === 'shopping')) {
      updateOrderStatus(order.id, 'shopping', {
        riderId: CURRENT_RIDER.id,
        riderName: CURRENT_RIDER.name,
        riderPhone: CURRENT_RIDER.phone,
      });
    } else if (order.status === 'ready') {
      updateOrderStatus(order.id, 'on_the_way', {
        riderId: CURRENT_RIDER.id,
        riderName: CURRENT_RIDER.name,
        riderPhone: CURRENT_RIDER.phone,
      });
    }
    nav.navigate('RiderJob', { orderId: order.id });
  };

  return (
    <View style={styles.root}>
      <View style={styles.map}>
        <View style={styles.blockA} />
        <View style={styles.blockB} />
        <View style={styles.roadH} />
        <View style={styles.roadV} />
        <View style={styles.roadH2} />
        <Animated.View style={[styles.youRing, pulseStyle]} />
        <View style={styles.you}>
          <Ionicons name="navigate" size={16} color={colors.white} />
        </View>
        <Text style={styles.mapNote}>MOCK MAP · Terminus / Ahmadu Bello Way</Text>
      </View>

      <SafeAreaView edges={['top']} style={styles.topSafe}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.hi}>{CURRENT_RIDER.name.split(' ')[0]}</Text>
            <Text style={styles.plate}>{CURRENT_RIDER.vehicle} · {CURRENT_RIDER.plate}</Text>
          </View>
          <Pressable
            onPress={() => setRiderOnline(!riderOnline)}
            style={[styles.toggle, riderOnline && styles.toggleOn]}
          >
            <View style={[styles.knob, riderOnline && styles.knobOn]} />
            <Text style={styles.toggleText}>{riderOnline ? 'Online' : 'Offline'}</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <View style={styles.sheet}>
        {!riderOnline ? (
          <View>
            <Text style={styles.sheetTitle}>You're offline</Text>
            <Text style={styles.sheetBody}>Go online to see food pickups and supermarket shopper jobs around Jos.</Text>
          </View>
        ) : active ? (
          <Pressable onPress={() => nav.navigate('RiderJob', { orderId: active.id })}>
            <Text style={styles.pill}>{active.deliveryMode === 'shopper' ? 'SHOPPER JOB' : 'POINT-TO-POINT'}</Text>
            <Text style={styles.sheetTitle}>Job in progress</Text>
            <Text style={styles.sheetBody}>
              {active.vendorName} → {active.neighborhood} · {formatNaira(active.total)}
            </Text>
            <View style={styles.cta}>
              <Text style={styles.ctaText}>Open job</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.white} />
            </View>
          </Pressable>
        ) : visibleOffer ? (
          <View>
            <Text style={styles.pill}>{visibleOffer.deliveryMode === 'shopper' ? 'SHOPPER MODE' : 'PICKUP'}</Text>
            <Text style={styles.sheetTitle}>{visibleOffer.vendorName}</Text>
            <Text style={styles.sheetBody}>
              {visibleOffer.neighborhood} · {visibleOffer.items.length} items · {visibleOffer.paymentMethod === 'cash' ? 'Collect cash' : 'Prepaid'}
            </Text>
            <Text style={styles.pay}>{formatNaira(visibleOffer.deliveryFee)} delivery · {formatNaira(visibleOffer.total)} order</Text>
            <View style={styles.row}>
              <Pressable onPress={() => setSkipped((s) => [...s, visibleOffer.id])} style={styles.skip}>
                <Text style={styles.skipText}>Skip</Text>
              </Pressable>
              <Pressable onPress={() => accept(visibleOffer)} style={styles.accept}>
                <Text style={styles.acceptText}>Accept</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.sheetTitle}>Hunting around Jos…</Text>
            <Text style={styles.sheetBody}>No open tickets in your zone. Stay online — pharmacy and food pop first.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.riderBg },
  map: { ...StyleSheet.absoluteFillObject, backgroundColor: '#141821' },
  blockA: { position: 'absolute', top: 80, left: 30, width: 120, height: 90, backgroundColor: '#1C2230', borderRadius: 8 },
  blockB: { position: 'absolute', top: 220, right: 24, width: 150, height: 130, backgroundColor: '#1A2030', borderRadius: 8 },
  roadH: { position: 'absolute', top: 200, left: 0, right: 0, height: 16, backgroundColor: '#2A3142' },
  roadH2: { position: 'absolute', top: 360, left: 0, right: 0, height: 12, backgroundColor: '#262C3C' },
  roadV: { position: 'absolute', top: 0, bottom: 0, left: '38%', width: 14, backgroundColor: '#2A3142' },
  youRing: {
    position: 'absolute',
    top: 268,
    left: '38%',
    marginLeft: -22,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(14,169,104,0.28)',
  },
  you: {
    position: 'absolute',
    top: 280,
    left: '38%',
    marginLeft: -10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapNote: {
    position: 'absolute',
    top: 120,
    right: 16,
    color: colors.riderMuted,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  topSafe: { position: 'absolute', left: 0, right: 0, top: 0 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 6 },
  hi: { fontFamily: 'Poppins_700Bold', color: colors.white, fontSize: 20 },
  plate: { fontFamily: 'Inter_400Regular', color: colors.riderMuted, fontSize: 12 },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.riderCard,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.riderLine,
  },
  toggleOn: { backgroundColor: '#123D2C', borderColor: colors.accent },
  knob: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.riderMuted },
  knobOn: { backgroundColor: colors.accent },
  toggleText: { fontFamily: 'Inter_600SemiBold', color: colors.white, marginRight: 6 },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.riderSheet,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 28,
    minHeight: 200,
  },
  pill: {
    alignSelf: 'flex-start',
    color: colors.gold,
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 6,
  },
  sheetTitle: { fontFamily: 'Poppins_700Bold', color: colors.white, fontSize: 22 },
  sheetBody: { fontFamily: 'Inter_400Regular', color: colors.riderMuted, marginTop: 6, lineHeight: 20 },
  pay: { fontFamily: 'Poppins_600SemiBold', color: colors.white, marginTop: 10 },
  row: { flexDirection: 'row', gap: 10, marginTop: 16 },
  skip: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.riderLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: { fontFamily: 'Poppins_600SemiBold', color: colors.white },
  accept: {
    flex: 1.4,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: { fontFamily: 'Poppins_600SemiBold', color: colors.white, fontSize: 16 },
  cta: {
    marginTop: 14,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  ctaText: { fontFamily: 'Poppins_600SemiBold', color: colors.white },
});
