import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../../lib/store';
import { RootStackParamList } from '../../lib/navigation';
import { colors, radii, shadow } from '../../lib/theme';
import { PrimaryButton } from '../../components/ui';
import { deliveryFeeFor, formatNaira } from '../../lib/format';
import { CURRENT_CUSTOMER } from '../../lib/data';
import { PaymentMethod } from '../../lib/types';

const PAYMENTS: { key: PaymentMethod; title: string; body: string; icon: keyof typeof Ionicons.glyphMap; first?: boolean }[] = [
  { key: 'cash', title: 'Cash on delivery', body: 'Pay the rider in naira when it arrives. Default in Jos.', icon: 'cash', first: true },
  { key: 'wallet', title: 'JozGo Wallet', body: 'Instant. Simulated local wallet — not a real payment rail.', icon: 'wallet' },
  { key: 'card', title: 'Card', body: 'Mock card checkout. No charge is made.', icon: 'card' },
];

export default function CheckoutScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { cart, cartVendor, cartSubtotal, neighborhood, placeOrder, wallet } = useStore();
  const [address, setAddress] = useState(`${CURRENT_CUSTOMER.address}, ${neighborhood}`);
  const [notes, setNotes] = useState('');
  const [promo, setPromo] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');

  if (!cartVendor || !cart.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Cart is empty.</Text>
      </View>
    );
  }

  const fee = deliveryFeeFor(cartVendor.category, neighborhood, cartVendor.neighborhood);
  const code = promo.trim().toUpperCase();
  let discount = 0;
  let promoNote = '';
  if (code === 'JOZ200' && cartVendor.category === 'food' && cartSubtotal >= 2500) {
    discount = 200;
    promoNote = '₦200 food promo applied';
  } else if (code === 'PHARM50' && cartVendor.category === 'pharmacy' && cartSubtotal >= 3000) {
    discount = fee;
    promoNote = 'Pharmacy delivery waived';
  } else if (code === 'MARKET' && cartVendor.category === 'supermarket') {
    discount = 200;
    promoNote = 'Market promo applied';
  } else if (code) {
    promoNote = 'Code not valid for this cart';
  }
  const total = Math.max(0, cartSubtotal + fee - discount);
  const walletShort = method === 'wallet' && wallet < total;

  const submit = () => {
    if (!address.trim()) {
      Alert.alert('Address needed', 'Tell the rider where to stop.');
      return;
    }
    if (walletShort) {
      Alert.alert('Wallet', 'Not enough wallet balance. Top up from Account or pay cash.');
      return;
    }
    const order = placeOrder({
      paymentMethod: method,
      address: address.trim(),
      notes: notes.trim(),
      promoCode: code,
    });
    if (!order) {
      Alert.alert('Could not place order', 'Check wallet balance or cart and try again.');
      return;
    }
    nav.replace('TrackOrder', { orderId: order.id });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.kicker}>{cartVendor.name}</Text>
        <Text style={styles.h}>{cart.length} item{cart.length === 1 ? '' : 's'} to {neighborhood}</Text>

        <Text style={styles.label}>Drop-off</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          style={styles.input}
          placeholder="Street, compound, landmark"
          placeholderTextColor={colors.muted}
          returnKeyType="next"
        />
        <TextInput
          value={notes}
          onChangeText={setNotes}
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Gate code, call on arrival, extra pepper…"
          placeholderTextColor={colors.muted}
          multiline
        />

        <Text style={styles.label}>Promo code</Text>
        <TextInput
          value={promo}
          onChangeText={setPromo}
          autoCapitalize="characters"
          style={styles.input}
          placeholder="JOZ200 · PHARM50 · MARKET"
          placeholderTextColor={colors.muted}
          returnKeyType="done"
        />
        {promoNote ? <Text style={styles.promoNote}>{promoNote}</Text> : null}

        <Text style={styles.label}>Pay with</Text>
        {PAYMENTS.map((p) => {
          const active = method === p.key;
          return (
            <Pressable key={p.key} onPress={() => setMethod(p.key)} style={[styles.pay, active && styles.payActive]}>
              <View style={[styles.payIcon, active && { backgroundColor: colors.primary }]}>
                <Ionicons name={p.icon} size={18} color={active ? colors.white : colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.payTitleRow}>
                  <Text style={styles.payTitle}>{p.title}</Text>
                  {p.first ? (
                    <View style={styles.flag}>
                      <Text style={styles.flagText}>Recommended in Jos</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.payBody}>{p.body}</Text>
                {p.key === 'wallet' ? (
                  <Text style={styles.wallet}>Balance {formatNaira(wallet)}</Text>
                ) : null}
              </View>
              <Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={20} color={active ? colors.primary : colors.muted} />
            </Pressable>
          );
        })}

        <View style={styles.totals}>
          <Line k="Subtotal" v={formatNaira(cartSubtotal)} />
          <Line k="Delivery" v={formatNaira(fee)} />
          {discount ? <Line k="Promo" v={`−${formatNaira(discount)}`} /> : null}
          <Line k="To pay" v={formatNaira(total)} bold />
        </View>

        {walletShort ? <Text style={styles.warn}>Wallet is short by {formatNaira(total - wallet)}.</Text> : null}

        <PrimaryButton
          label={method === 'cash' ? `Place order · Pay ${formatNaira(total)} cash` : `Place order · ${formatNaira(total)}`}
          onPress={submit}
          icon="checkmark-circle"
        />
        <Text style={styles.fake}>
          Card and wallet are simulated in this prototype. Cash-on-delivery is the first-class path for Jos.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Line({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <View style={styles.line}>
      <Text style={[styles.lk, bold && styles.bold]}>{k}</Text>
      <Text style={[styles.lv, bold && styles.bold]}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, paddingBottom: 40, backgroundColor: colors.paper },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper },
  muted: { fontFamily: 'Inter_400Regular', color: colors.muted },
  kicker: { fontFamily: 'Inter_600SemiBold', color: colors.primary, fontSize: 13 },
  h: { fontFamily: 'Poppins_700Bold', fontSize: 24, color: colors.ink, marginBottom: 18 },
  label: { fontFamily: 'Poppins_600SemiBold', color: colors.ink, marginBottom: 8, marginTop: 8 },
  input: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.ink,
    marginBottom: 10,
  },
  promoNote: { fontFamily: 'Inter_400Regular', color: colors.accentDark, marginBottom: 8, fontSize: 13 },
  pay: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  payActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  payIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  payTitle: { fontFamily: 'Poppins_600SemiBold', color: colors.ink },
  payBody: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.muted, marginTop: 2 },
  wallet: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.accentDark, marginTop: 4 },
  flag: { backgroundColor: colors.gold, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  flagText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: colors.ink },
  totals: { backgroundColor: colors.white, borderRadius: radii.lg, padding: 14, marginVertical: 14, ...shadow.card },
  line: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  lk: { fontFamily: 'Inter_400Regular', color: colors.slate },
  lv: { fontFamily: 'Inter_600SemiBold', color: colors.ink },
  bold: { fontFamily: 'Poppins_600SemiBold', fontSize: 16 },
  warn: { color: colors.danger, fontFamily: 'Inter_400Regular', marginBottom: 10 },
  fake: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.muted, marginTop: 12, lineHeight: 18, textAlign: 'center' },
});
