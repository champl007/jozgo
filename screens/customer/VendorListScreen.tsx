import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../../lib/store';
import { RootStackParamList } from '../../lib/navigation';
import { colors, radii, shadow } from '../../lib/theme';
import { Chip } from '../../components/ui';
import { formatNaira } from '../../lib/format';
import { Vendor, VendorCategory } from '../../lib/types';

const CATS: { key: VendorCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'food', label: 'Food' },
  { key: 'pharmacy', label: 'Pharmacy' },
  { key: 'supermarket', label: 'Market' },
];

export default function VendorListScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'VendorList'>>();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { vendors } = useStore();
  const [cat, setCat] = useState<VendorCategory | 'all'>(route.params.category);

  const data = useMemo(
    () => vendors.filter((v) => (cat === 'all' ? true : v.category === cat)),
    [vendors, cat]
  );

  const renderVendor = ({ item }: { item: Vendor }) => (
    <Pressable
      onPress={() => nav.navigate('VendorDetail', { vendorId: item.id })}
      style={styles.card}
    >
      <View style={[styles.icon, { backgroundColor: item.accent }]}>
        <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={24} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>
          {item.neighborhood} · {formatNaira(item.deliveryFee)} · {item.deliveryMins[0]}–{item.deliveryMins[1]} min
        </Text>
        <Text style={styles.desc} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.wrap}>
      <FlatList
        data={data}
        keyExtractor={(v) => v.id}
        renderItem={renderVendor}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListHeaderComponent={
          <View style={styles.chips}>
            {CATS.map((c) => (
              <Chip key={c.key} label={c.label} active={cat === c.key} onPress={() => setCat(c.key)} />
            ))}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.paper },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 10,
    ...shadow.card,
  },
  icon: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.ink },
  meta: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.muted, marginTop: 2 },
  desc: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.slate, marginTop: 6, lineHeight: 18 },
});
