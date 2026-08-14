import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '../../lib/store';
import { RootStackParamList } from '../../lib/navigation';
import { colors, radii, shadow } from '../../lib/theme';
import { Chip, EmptyState, PrimaryButton } from '../../components/ui';
import { formatNaira } from '../../lib/format';
import { MenuItem } from '../../lib/types';

export default function VendorMenuScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { menu, vendorId, activeVendor, toggleStock, deleteItem } = useStore();
  const items = useMemo(() => menu.filter((m) => m.vendorId === vendorId), [menu, vendorId]);
  const sections = useMemo(() => ['all', ...Array.from(new Set(items.map((i) => i.section)))], [items]);
  const [section, setSection] = useState('all');
  const visible = section === 'all' ? items : items.filter((i) => i.section === section);
  const catalog = activeVendor?.category === 'pharmacy' || activeVendor?.category === 'supermarket';

  const remove = (item: MenuItem) => {
    Alert.alert('Remove item', `Delete ${item.name} from the catalog?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteItem(item.id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.head}>
        <View>
          <Text style={styles.kicker}>{catalog ? 'Catalog' : 'Menu'}</Text>
          <Text style={styles.title}>{activeVendor?.name}</Text>
        </View>
        <PrimaryButton label="Add" icon="add" onPress={() => nav.navigate('ItemEditor', {})} />
      </View>
      <Text style={styles.hint}>
        {catalog
          ? 'Inventory flags matter for pharmacy and supermarket substitutions.'
          : 'Kitchen items. Toggle availability when you run out.'}
      </Text>
      <FlatList
        data={visible}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28 }}
        ListHeaderComponent={
          <View style={styles.chips}>
            {sections.map((s) => (
              <Chip key={s} label={s === 'all' ? 'All' : s} active={section === s} onPress={() => setSection(s)} />
            ))}
          </View>
        }
        ListEmptyComponent={<EmptyState icon="fast-food-outline" title="No items" body="Add your first catalog item." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable style={{ flex: 1 }} onPress={() => nav.navigate('ItemEditor', { itemId: item.id })}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.section} · {formatNaira(item.price)}
              </Text>
              <Text style={styles.desc} numberOfLines={2}>
                {item.description}
              </Text>
            </Pressable>
            <View style={styles.side}>
              <Text style={[styles.stock, { color: item.inStock ? colors.accentDark : colors.danger }]}>
                {item.inStock ? 'In stock' : 'Out'}
              </Text>
              <Switch
                value={item.inStock}
                onValueChange={() => toggleStock(item.id)}
                trackColor={{ false: '#E5E7EB', true: '#86E0B8' }}
                thumbColor={item.inStock ? colors.accent : '#f4f3f4'}
              />
              <Pressable onPress={() => remove(item)} hitSlop={8}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </Pressable>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 18, paddingTop: 8, gap: 12 },
  kicker: { fontFamily: 'Inter_600SemiBold', color: colors.primary },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 24, color: colors.ink, maxWidth: 220 },
  hint: { fontFamily: 'Inter_400Regular', color: colors.muted, paddingHorizontal: 18, marginTop: 8, fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 10,
    gap: 10,
    ...shadow.card,
  },
  name: { fontFamily: 'Poppins_600SemiBold', color: colors.ink, fontSize: 15 },
  meta: { fontFamily: 'Inter_400Regular', color: colors.muted, fontSize: 12, marginTop: 2 },
  desc: { fontFamily: 'Inter_400Regular', color: colors.slate, fontSize: 13, marginTop: 6 },
  side: { alignItems: 'flex-end', gap: 8, justifyContent: 'center' },
  stock: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
});
