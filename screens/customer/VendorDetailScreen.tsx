import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../../lib/store';
import { RootStackParamList } from '../../lib/navigation';
import { colors, radii, shadow } from '../../lib/theme';
import { Badge, Chip, EmptyState, PrimaryButton, QtyStepper } from '../../components/ui';
import { formatNaira } from '../../lib/format';
import { CATEGORY_LABELS, MenuItem } from '../../lib/types';

export default function VendorDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'VendorDetail'>>();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { vendors, menu, addToCart, cart, setQty, cartCount, cartSubtotal, cartVendor } = useStore();
  const vendor = vendors.find((v) => v.id === route.params.vendorId);
  const items = useMemo(() => menu.filter((m) => m.vendorId === route.params.vendorId), [menu, route.params.vendorId]);
  const sections = useMemo(() => Array.from(new Set(items.map((i) => i.section))), [items]);
  const [section, setSection] = useState<string | 'all'>('all');

  if (!vendor) {
    return <EmptyState icon="alert-circle" title="Vendor not found" body="This shop is no longer on JozGo." />;
  }

  const visible = section === 'all' ? items : items.filter((i) => i.section === section);
  const isCatalog = vendor.category === 'pharmacy' || vendor.category === 'supermarket';

  const qtyFor = (id: string) => cart.find((l) => l.item.id === id)?.quantity ?? 0;

  const add = (item: MenuItem) => {
    const res = addToCart(item);
    if (!res.ok) Alert.alert('Cart', res.reason || 'Could not add item');
  };

  const renderItem = ({ item }: { item: MenuItem }) => {
    const qty = qtyFor(item.id);
    return (
      <View style={[styles.item, !item.inStock && { opacity: 0.55 }]}>
        <View style={styles.itemIcon}>
          <Ionicons name={(item.icon as keyof typeof Ionicons.glyphMap) || 'cube'} size={20} color={vendor.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDesc} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatNaira(item.price)}</Text>
            {!item.inStock ? <Badge text="Out of stock" tone="danger" /> : null}
          </View>
        </View>
        {item.inStock ? (
          qty > 0 ? (
            <QtyStepper value={qty} onChange={(n) => setQty(item.id, n)} />
          ) : (
            <Pressable onPress={() => add(item)} style={styles.addBtn}>
              <Ionicons name="add" size={18} color={colors.white} />
            </Pressable>
          )
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.wrap}>
      <FlatList
        data={visible}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        ListHeaderComponent={
          <View>
            <View style={[styles.hero, { backgroundColor: vendor.accent }]}>
              <Ionicons name={vendor.icon as keyof typeof Ionicons.glyphMap} size={36} color="#fff" />
              <View style={styles.heroBadges}>
                <Badge text={CATEGORY_LABELS[vendor.category]} tone="muted" />
                <Badge text={vendor.isOpen ? 'Open now' : 'Closed'} tone={vendor.isOpen ? 'accent' : 'danger'} />
              </View>
            </View>
            <Text style={styles.title}>{vendor.name}</Text>
            <Text style={styles.sub}>
              {vendor.neighborhood} · ★ {vendor.rating} ({vendor.reviewCount}) · {vendor.deliveryMins[0]}–{vendor.deliveryMins[1]} min
            </Text>
            <Text style={styles.desc}>{vendor.description}</Text>
            <View style={styles.feeRow}>
              <View style={styles.feeCard}>
                <Text style={styles.feeLabel}>Delivery from</Text>
                <Text style={styles.feeVal}>{formatNaira(vendor.deliveryFee)}</Text>
              </View>
              <View style={styles.feeCard}>
                <Text style={styles.feeLabel}>Min. order</Text>
                <Text style={styles.feeVal}>{formatNaira(vendor.minOrder)}</Text>
              </View>
              <View style={styles.feeCard}>
                <Text style={styles.feeLabel}>Mode</Text>
                <Text style={styles.feeVal}>{vendor.category === 'supermarket' ? 'Shopper' : 'Pickup'}</Text>
              </View>
            </View>
            {isCatalog ? (
              <Text style={styles.hint}>
                Catalog browse — add in-stock items. Substitutions matter; out-of-stock items stay locked.
              </Text>
            ) : null}
            <FlatList
              horizontal
              data={['all', ...sections]}
              keyExtractor={(s) => s}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.secChips}
              renderItem={({ item }) => (
                <Chip label={item === 'all' ? 'All' : item} active={section === item} onPress={() => setSection(item)} />
              )}
            />
          </View>
        }
        ListEmptyComponent={<EmptyState icon="file-tray" title="No items" body="This vendor has not published a catalog yet." />}
      />

      {cartCount > 0 && cartVendor?.id === vendor.id ? (
        <View style={styles.dock}>
          <PrimaryButton
            label={`View cart · ${cartCount} · ${formatNaira(cartSubtotal)}`}
            icon="bag-handle"
            onPress={() => nav.navigate('CustomerTabs', { screen: 'CartTab' })}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.paper },
  hero: {
    height: 120,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroBadges: { flexDirection: 'row', gap: 8, position: 'absolute', bottom: 12, left: 12 },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 24, color: colors.ink, letterSpacing: -0.4 },
  sub: { fontFamily: 'Inter_400Regular', color: colors.muted, marginTop: 4 },
  desc: { fontFamily: 'Inter_400Regular', color: colors.slate, marginTop: 10, lineHeight: 20 },
  feeRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  feeCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: 10,
    ...shadow.card,
  },
  feeLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.muted },
  feeVal: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: colors.ink, marginTop: 2 },
  hint: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.slate, marginTop: 12, lineHeight: 18 },
  secChips: { gap: 8, paddingVertical: 14 },
  item: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    ...shadow.card,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: colors.ink },
  itemDesc: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.muted, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  price: { fontFamily: 'Poppins_600SemiBold', color: colors.ink },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dock: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
  },
});
