import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../../lib/store';
import { RootStackParamList } from '../../lib/navigation';
import { colors, radii, shadow } from '../../lib/theme';
import { EmptyState, PrimaryButton, QtyStepper } from '../../components/ui';
import { deliveryFeeFor, formatNaira } from '../../lib/format';

export default function CartScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { cart, cartVendor, cartSubtotal, setQty, clearCart, neighborhood } = useStore();

  if (!cart.length || !cartVendor) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.title}>Cart</Text>
        <EmptyState
          icon="bag-handle-outline"
          title="Your bag is empty"
          body="Add jollof, meds or groceries from a Jos vendor."
        />
      </SafeAreaView>
    );
  }

  const fee = deliveryFeeFor(cartVendor.category, neighborhood, cartVendor.neighborhood);
  const belowMin = cartSubtotal < cartVendor.minOrder;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.head}>
        <Text style={styles.title}>Cart</Text>
        <Pressable onPress={clearCart}>
          <Text style={styles.clear}>Clear</Text>
        </Pressable>
      </View>
      <FlatList
        data={cart}
        keyExtractor={(l) => l.item.id}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 160 }}
        ListHeaderComponent={
          <Pressable
            onPress={() => nav.navigate('VendorDetail', { vendorId: cartVendor.id })}
            style={styles.vendorCard}
          >
            <View style={[styles.vIcon, { backgroundColor: cartVendor.accent }]}>
              <Ionicons name={cartVendor.icon as keyof typeof Ionicons.glyphMap} size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.vName}>{cartVendor.name}</Text>
              <Text style={styles.vMeta}>
                {cartVendor.neighborhood} · Delivering to {neighborhood}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </Pressable>
        }
        renderItem={({ item }) => (
          <View style={styles.line}>
            <View style={{ flex: 1 }}>
              <Text style={styles.lineName}>{item.item.name}</Text>
              <Text style={styles.linePrice}>{formatNaira(item.item.price * item.quantity)}</Text>
            </View>
            <QtyStepper value={item.quantity} onChange={(n) => setQty(item.item.id, n)} compact />
          </View>
        )}
        ListFooterComponent={
          <View style={styles.totals}>
            <Row label="Subtotal" value={formatNaira(cartSubtotal)} />
            <Row label="Delivery fee" value={formatNaira(fee)} />
            <Row label="Total" value={formatNaira(cartSubtotal + fee)} bold />
            {belowMin ? (
              <Text style={styles.minWarn}>
                Minimum order is {formatNaira(cartVendor.minOrder)}. Add {formatNaira(cartVendor.minOrder - cartSubtotal)} more.
              </Text>
            ) : null}
          </View>
        }
      />
      <View style={styles.dock}>
        <PrimaryButton
          label={belowMin ? 'Below minimum order' : `Checkout · ${formatNaira(cartSubtotal + fee)}`}
          disabled={belowMin}
          icon="card"
          onPress={() => nav.navigate('Checkout')}
        />
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.rowVal, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 8 },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 28, color: colors.ink, paddingHorizontal: 18, paddingTop: 8 },
  clear: { fontFamily: 'Inter_600SemiBold', color: colors.danger },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 12,
    marginBottom: 12,
    ...shadow.card,
  },
  vIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  vName: { fontFamily: 'Poppins_600SemiBold', color: colors.ink },
  vMeta: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.muted },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 8,
  },
  lineName: { fontFamily: 'Inter_600SemiBold', color: colors.ink },
  linePrice: { fontFamily: 'Poppins_600SemiBold', color: colors.slate, marginTop: 4 },
  totals: { backgroundColor: colors.white, borderRadius: radii.lg, padding: 16, marginTop: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rowLabel: { fontFamily: 'Inter_400Regular', color: colors.slate },
  rowVal: { fontFamily: 'Inter_600SemiBold', color: colors.ink },
  bold: { fontFamily: 'Poppins_600SemiBold', fontSize: 16 },
  minWarn: { fontFamily: 'Inter_400Regular', color: colors.danger, marginTop: 6, fontSize: 13 },
  dock: { position: 'absolute', left: 16, right: 16, bottom: 20 },
});
