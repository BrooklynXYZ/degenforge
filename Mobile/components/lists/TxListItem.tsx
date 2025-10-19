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

export const TxListItem: React.FC<TxListItemProps> = ({
  icon,
  token,
  amount,
  status,
  timestamp,
  onPress,
  style,
}) => {
  const statusColor =
    status === 'confirmed'
      ? Colors.semantic.confirmed
      : status === 'pending'
      ? Colors.semantic.pending
      : Colors.semantic.error;

  const statusLabel =
    status === 'confirmed'
      ? 'Confirmed'
      : status === 'pending'
      ? 'Pending'
      : 'Failed';

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Left: Icon and details */}
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.token}>{token}</Text>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>
      </View>

      {/* Middle: Amount and status */}
      <View style={styles.middleSection}>
        <Text style={styles.amount}>{amount.toLocaleString()}</Text>
        <View style={[styles.statusChip, { backgroundColor: statusColor }]}>
          <Text style={styles.statusLabel}>{statusLabel}</Text>
        </View>
      </View>

      {/* Right: Chevron */}
      <View style={styles.chevron}>
        <Text style={styles.chevronIcon}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.bg.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.bg.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
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
  },
  statusLabel: {
    ...Typography.caption,
    color: Colors.base.white,
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
