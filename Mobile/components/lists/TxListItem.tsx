import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/designTokens';

interface TxListItemProps {
  icon: string;
  token: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  onPress: () => void;
  style?: ViewStyle;
}

const STATUS_CONFIG = {
  confirmed: { color: Colors.semantic.confirmed, bg: '#E6F9F0', label: 'Confirmed' },
  pending: { color: Colors.semantic.pending, bg: '#FFF4E6', label: 'Pending' },
  failed: { color: Colors.semantic.error, bg: '#FFECEC', label: 'Failed' },
};

export const TxListItem = React.memo<TxListItemProps>(({
  icon,
  token,
  amount,
  status,
  timestamp,
  onPress,
  style,
}) => {
  const config = STATUS_CONFIG[status];

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.token}>{token}</Text>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>
      </View>

      <View style={styles.middleSection}>
        <Text style={styles.amount}>{amount.toLocaleString()}</Text>
        <View style={[styles.statusChip, { backgroundColor: config.bg, borderColor: config.color }]}>
          <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>

      <View style={styles.chevron}>
        <Text style={styles.chevronIcon}>›</Text>
      </View>
    </TouchableOpacity>
  );
});

TxListItem.displayName = 'TxListItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.base.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.bg.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  details: {
    gap: Spacing.xs,
  },
  token: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
  },
  timestamp: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  middleSection: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
  },
  amount: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  statusChip: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
  },
  statusLabel: {
    ...Typography.caption,
    fontWeight: '600',
  },
  chevron: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronIcon: {
    fontSize: 20,
    color: Colors.text.tertiary,
  },
});
