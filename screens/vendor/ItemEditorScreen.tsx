import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useStore } from '../../lib/store';
import { RootStackParamList } from '../../lib/navigation';
import { colors, radii } from '../../lib/theme';
import { PrimaryButton } from '../../components/ui';
import { MenuItem } from '../../lib/types';

export default function ItemEditorScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ItemEditor'>>();
  const nav = useNavigation();
  const { menu, vendorId, upsertItem, activeVendor } = useStore();
  const existing = useMemo(() => menu.find((m) => m.id === route.params.itemId), [menu, route.params.itemId]);
  const catalog = activeVendor?.category === 'pharmacy' || activeVendor?.category === 'supermarket';

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [price, setPrice] = useState(existing ? String(existing.price) : '');
  const [section, setSection] = useState(existing?.section ?? (catalog ? 'General' : 'Mains'));
  const [inStock, setInStock] = useState(existing?.inStock ?? true);

  const save = () => {
    const p = Number(price.replace(/[^0-9]/g, ''));
    if (!name.trim() || !p) {
      Alert.alert('Check fields', 'Name and a naira price are required.');
      return;
    }
    const item: MenuItem = {
      id: existing?.id ?? `m-${Date.now()}`,
      vendorId,
      name: name.trim(),
      description: description.trim(),
      price: p,
      section: section.trim() || 'General',
      inStock,
      icon: existing?.icon ?? (catalog ? 'cube' : 'restaurant'),
    };
    upsertItem(item);
    nav.goBack();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.lead}>
          {existing ? 'Update this listing.' : 'New listing for your JozGo storefront.'}
        </Text>
        <Label>Name</Label>
        <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="e.g. Jollof Rice & Chicken" placeholderTextColor={colors.muted} />
        <Label>Description</Label>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
          multiline
          placeholder="What the customer gets"
          placeholderTextColor={colors.muted}
        />
        <Label>Price (₦)</Label>
        <TextInput
          value={price}
          onChangeText={setPrice}
          keyboardType="number-pad"
          style={styles.input}
          placeholder="2800"
          placeholderTextColor={colors.muted}
        />
        <Label>Section</Label>
        <TextInput value={section} onChangeText={setSection} style={styles.input} placeholder="Mains" placeholderTextColor={colors.muted} />
        <View style={styles.stockRow}>
          <View>
            <Text style={styles.stockTitle}>{catalog ? 'In stock' : 'Available'}</Text>
            <Text style={styles.stockMeta}>
              {catalog ? 'Out-of-stock items cannot be substituted silently.' : 'Hide from the customer menu when you 86 it.'}
            </Text>
          </View>
          <Switch
            value={inStock}
            onValueChange={setInStock}
            trackColor={{ false: '#E5E7EB', true: '#86E0B8' }}
            thumbColor={inStock ? colors.accent : '#f4f3f4'}
          />
        </View>
        <PrimaryButton label={existing ? 'Save changes' : 'Add item'} onPress={save} icon="checkmark" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  scroll: { padding: 18, backgroundColor: colors.paper, paddingBottom: 40 },
  lead: { fontFamily: 'Inter_400Regular', color: colors.slate, marginBottom: 16, lineHeight: 20 },
  label: { fontFamily: 'Poppins_600SemiBold', color: colors.ink, marginBottom: 6, marginTop: 8 },
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
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 14,
    marginVertical: 16,
    gap: 12,
  },
  stockTitle: { fontFamily: 'Poppins_600SemiBold', color: colors.ink },
  stockMeta: { fontFamily: 'Inter_400Regular', color: colors.muted, fontSize: 12, marginTop: 2, maxWidth: 240 },
});
