import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, radii, shadow } from '../lib/theme';

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Heading({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.heading, style]}>{children}</Text>;
}

export function Muted({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.muted, style]}>{children}</Text>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  icon,
  color,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryBtn,
        { backgroundColor: color || colors.primary },
        disabled && { opacity: 0.45 },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={colors.white} /> : null}
      <Text style={styles.primaryBtnText}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
  icon,
  danger,
}: {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.ghostBtn, danger && styles.ghostDanger, pressed && { opacity: 0.75 }]}
    >
      {icon ? <Ionicons name={icon} size={16} color={danger ? colors.danger : colors.ink} /> : null}
      <Text style={[styles.ghostBtnText, danger && { color: colors.danger }]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      {icon ? (
        <Ionicons name={icon} size={14} color={active ? colors.white : colors.slate} />
      ) : null}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({
  icon,
  title,
  body,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

export function Badge({
  text,
  tone = 'primary',
}: {
  text: string;
  tone?: 'primary' | 'accent' | 'gold' | 'muted' | 'danger';
}) {
  const map = {
    primary: { bg: colors.primarySoft, fg: colors.primary },
    accent: { bg: colors.accentSoft, fg: colors.accentDark },
    gold: { bg: '#FFF6DE', fg: '#B45309' },
    muted: { bg: colors.paper, fg: colors.slate },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
  }[tone];
  return (
    <View style={[styles.badge, { backgroundColor: map.bg }]}>
      <Text style={[styles.badgeText, { color: map.fg }]}>{text}</Text>
    </View>
  );
}

export function Spinner() {
  return (
    <View style={styles.spinner}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export function QtyStepper({
  value,
  onChange,
  compact,
}: {
  value: number;
  onChange: (n: number) => void;
  compact?: boolean;
}) {
  return (
    <View style={[styles.stepper, compact && { height: 32 }]}>
      <Pressable onPress={() => onChange(value - 1)} style={styles.stepBtn} hitSlop={8}>
        <Ionicons name="remove" size={16} color={colors.ink} />
      </Pressable>
      <Text style={styles.stepVal}>{value}</Text>
      <Pressable onPress={() => onChange(value + 1)} style={styles.stepBtn} hitSlop={8}>
        <Ionicons name="add" size={16} color={colors.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  heading: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 26,
    color: colors.ink,
    letterSpacing: -0.4,
  },
  muted: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.muted, lineHeight: 20 },
  primaryBtn: {
    height: 54,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...shadow.float,
  },
  primaryBtnText: { color: colors.white, fontFamily: 'Poppins_600SemiBold', fontSize: 16 },
  ghostBtn: {
    height: 46,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
  },
  ghostDanger: { borderColor: '#F4C2C2', backgroundColor: colors.dangerSoft },
  ghostBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.ink },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.slate },
  chipTextActive: { color: colors.white },
  empty: { alignItems: 'center', padding: 36, gap: 8 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 18, color: colors.ink },
  emptyBody: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.pill },
  badgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  spinner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderRadius: radii.pill,
    height: 36,
    paddingHorizontal: 4,
    gap: 8,
  },
  stepBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepVal: { fontFamily: 'Poppins_600SemiBold', minWidth: 16, textAlign: 'center', color: colors.ink },
});
