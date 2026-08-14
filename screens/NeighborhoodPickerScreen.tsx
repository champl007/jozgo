import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../lib/store';
import { NEIGHBORHOODS } from '../lib/types';
import { colors, radii } from '../lib/theme';

export default function NeighborhoodPickerScreen() {
  const nav = useNavigation();
  const { neighborhood, setNeighborhood } = useStore();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Text style={styles.lead}>JozGo delivers across Jos. Pick your zone — not free text, so riders know the streets.</Text>
      <FlatList
        data={NEIGHBORHOODS}
        keyExtractor={(n) => n}
        contentContainerStyle={{ padding: 18, gap: 10 }}
        renderItem={({ item }) => {
          const active = item === neighborhood;
          return (
            <Pressable
              onPress={() => {
                setNeighborhood(item);
                nav.goBack();
              }}
              style={[styles.row, active && styles.rowActive]}
            >
              <View style={[styles.dot, active && styles.dotActive]}>
                <Ionicons name="location" size={16} color={active ? colors.white : colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item}</Text>
                <Text style={styles.meta}>Jos · Plateau State</Text>
              </View>
              {active ? <Ionicons name="checkmark-circle" size={22} color={colors.primary} /> : null}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  lead: {
    fontFamily: 'Inter_400Regular',
    color: colors.slate,
    paddingHorizontal: 20,
    paddingTop: 8,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  rowActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: { backgroundColor: colors.primary },
  name: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: colors.ink },
  meta: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.muted },
});
