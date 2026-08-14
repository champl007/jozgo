import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { colors, radii, shadow } from '../lib/theme';
import { useStore } from '../lib/store';
import { RootStackParamList } from '../lib/navigation';
import { UserRole } from '../lib/types';

const ROLES: {
  role: UserRole;
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: keyof RootStackParamList;
  tint: string;
}[] = [
  {
    role: 'customer',
    title: 'Order in Jos',
    body: 'Food, pharmacy and market runs to your street.',
    icon: 'bag-handle',
    route: 'CustomerTabs',
    tint: '#FF5A36',
  },
  {
    role: 'vendor',
    title: 'Sell on JozGo',
    body: 'Accept orders, update stock, track commission.',
    icon: 'storefront',
    route: 'VendorTabs',
    tint: '#0EA968',
  },
  {
    role: 'rider',
    title: 'Ride with JozGo',
    body: 'Point-to-point pickups and shopper-mode jobs.',
    icon: 'bicycle',
    route: 'RiderTabs',
    tint: '#1A1D2B',
  },
];

export default function RoleSelectScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setRole } = useStore();

  const pick = (role: UserRole, route: keyof RootStackParamList) => {
    setRole(role);
    nav.replace(route as never);
  };

  return (
    <LinearGradient colors={['#FFF4EF', '#F6F7FA', '#EEF8F3']} style={styles.flex}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Ionicons name="flash" size={22} color={colors.white} />
          </View>
          <Text style={styles.brand}>JozGo</Text>
        </View>
        <Text style={styles.h1}>Jos, delivered.</Text>
        <Text style={styles.sub}>
          Food, pharmacy and supermarket — built for Plateau streets, cash on delivery, and patchy networks.
        </Text>

        <View style={styles.cards}>
          {ROLES.map((r) => (
            <Pressable
              key={r.role}
              onPress={() => pick(r.role, r.route)}
              style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.985 }] }]}
            >
              <View style={[styles.iconWrap, { backgroundColor: r.tint }]}>
                <Ionicons name={r.icon} size={22} color={colors.white} />
              </View>
              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>{r.title}</Text>
                <Text style={styles.cardBody}>{r.body}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          ))}
        </View>

        <Text style={styles.foot}>Prototype · Jos, Plateau State · ₦ cash-first</Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 22, paddingTop: 12 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.float,
  },
  brand: { fontFamily: 'Poppins_700Bold', fontSize: 22, color: colors.ink, letterSpacing: -0.4 },
  h1: { fontFamily: 'Poppins_700Bold', fontSize: 36, color: colors.ink, letterSpacing: -1, lineHeight: 42 },
  sub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.slate,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 28,
    maxWidth: 340,
  },
  cards: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 16,
    gap: 14,
    ...shadow.card,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCopy: { flex: 1 },
  cardTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.ink },
  cardBody: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.muted, marginTop: 2, lineHeight: 18 },
  foot: {
    marginTop: 'auto',
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.muted,
    paddingBottom: 10,
  },
});
