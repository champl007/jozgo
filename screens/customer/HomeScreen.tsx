import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../../lib/store';
import { colors, radii, shadow } from '../../lib/theme';
import { Chip } from '../../components/ui';
import { PROMOS } from '../../lib/data';
import { formatNaira } from '../../lib/format';
import { RootStackParamList } from '../../lib/navigation';
import { Vendor, VendorCategory } from '../../lib/types';

const CATS: { key: VendorCategory | 'all'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'all', label: 'All', icon: 'apps' },
  { key: 'food', label: 'Food', icon: 'restaurant' },
  { key: 'pharmacy', label: 'Pharmacy', icon: 'medkit' },
  { key: 'supermarket', label: 'Supermarket', icon: 'cart' },
];

export default function HomeScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { vendors, neighborhood, cartCount } = useStore();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<VendorCategory | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vendors.filter((v) => {
      if (cat !== 'all' && v.category !== cat) return false;
      if (!q) return true;
      return (
        v.name.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q)) ||
        v.neighborhood.toLowerCase().includes(q)
      );
    });
  }, [vendors, query, cat]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  const renderVendor = ({ item }: { item: Vendor }) => (
    <Pressable
      onPress={() => nav.navigate('VendorDetail', { vendorId: item.id })}
      style={({ pressed }) => [styles.vendor, pressed && { opacity: 0.92 }]}
    >
      <View style={[styles.vendorIcon, { backgroundColor: item.accent }]}>
        <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={26} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.vendorName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={12} color={colors.gold} />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {item.neighborhood} · {item.deliveryMins[0]}–{item.deliveryMins[1]} min · {formatNaira(item.deliveryFee)}
        </Text>
        <View style={styles.tagRow}>
          {item.tags.slice(0, 3).map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
          {!item.isOpen ? (
            <View style={[styles.tag, { backgroundColor: colors.dangerSoft }]}>
              <Text style={[styles.tagText, { color: colors.danger }]}>Closed</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.muted} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(v) => v.id}
        renderItem={renderVendor}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.topRow}>
              <Pressable onPress={() => nav.navigate('NeighborhoodPicker')} style={styles.loc}>
                <Text style={styles.delivering}>Delivering to</Text>
                <View style={styles.locRow}>
                  <Ionicons name="location" size={16} color={colors.primary} />
                  <Text style={styles.locName}>{neighborhood}</Text>
                  <Ionicons name="chevron-down" size={14} color={colors.slate} />
                </View>
              </Pressable>
              <View style={styles.cartHint}>
                <Ionicons name="bag-handle" size={16} color={colors.primary} />
                <Text style={styles.cartHintText}>{cartCount}</Text>
              </View>
            </View>

            <Text style={styles.hello}>What do you need in Jos?</Text>

            <View style={styles.search}>
              <Ionicons name="search" size={18} color={colors.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search jollof, paracetamol, rice…"
                placeholderTextColor={colors.muted}
                style={styles.searchInput}
                returnKeyType="search"
              />
              {query ? (
                <Pressable onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={18} color={colors.muted} />
                </Pressable>
              ) : null}
            </View>

            <FlatList
              horizontal
              data={CATS}
              keyExtractor={(c) => c.key}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              renderItem={({ item }) => (
                <Chip
                  label={item.label}
                  icon={item.icon}
                  active={cat === item.key}
                  onPress={() => setCat(item.key)}
                />
              )}
            />

            <FlatList
              horizontal
              data={PROMOS}
              keyExtractor={(p) => p.code}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.promos}
              renderItem={({ item }) => (
                <LinearGradient
                  colors={[item.color, item.color === '#FF5A36' ? '#FF8A50' : item.color]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.promo}
                >
                  <Text style={styles.promoCode}>{item.code}</Text>
                  <Text style={styles.promoTitle}>{item.title}</Text>
                  <Text style={styles.promoSub}>{item.subtitle}</Text>
                </LinearGradient>
              )}
            />

            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Near you in {neighborhood}</Text>
              <Pressable onPress={() => nav.navigate('VendorList', { category: cat, title: 'All vendors' })}>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search" size={28} color={colors.muted} />
            <Text style={styles.emptyTitle}>No matches in Jos</Text>
            <Text style={styles.emptyBody}>Try another category or a simpler search.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  list: { paddingHorizontal: 18, paddingBottom: 28 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  loc: { flex: 1 },
  delivering: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.muted },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locName: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.ink },
  cartHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: radii.pill,
  },
  cartHintText: { fontFamily: 'Poppins_600SemiBold', color: colors.primary },
  hello: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    color: colors.ink,
    letterSpacing: -0.6,
    marginTop: 18,
    marginBottom: 14,
    lineHeight: 34,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: colors.line,
  },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, color: colors.ink },
  chips: { gap: 8, paddingVertical: 16 },
  promos: { gap: 12, paddingBottom: 8 },
  promo: {
    width: 240,
    borderRadius: radii.lg,
    padding: 16,
    minHeight: 118,
  },
  promoCode: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: colors.white,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  promoTitle: { fontFamily: 'Poppins_700Bold', color: colors.white, fontSize: 18, marginTop: 10, lineHeight: 22 },
  promoSub: { fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.88)', fontSize: 12, marginTop: 4 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, marginBottom: 10 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 17, color: colors.ink },
  seeAll: { fontFamily: 'Inter_600SemiBold', color: colors.primary, fontSize: 13 },
  vendor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 12,
    marginBottom: 10,
    ...shadow.card,
  },
  vendorIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorName: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: colors.ink, flex: 1, marginRight: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'center' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.ink },
  meta: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.muted, marginTop: 2 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: { backgroundColor: colors.paper, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.pill },
  tagText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.slate },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 6 },
  emptyTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.ink },
  emptyBody: { fontFamily: 'Inter_400Regular', color: colors.muted },
});
