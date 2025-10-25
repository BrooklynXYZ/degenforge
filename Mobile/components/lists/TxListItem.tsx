import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Borders } from '@/constants/designTokens';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { colors: themeColors } = useTheme();
  const config = STATUS_CONFIG[status];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: themeColors.surfaceSecondary,
              borderColor: themeColors.border,
            },
          ]}
        >
          <Feather name={icon as any} size={24} color={themeColors.textPrimary} />
        </View>
        <View style={styles.details}>
          <Text style={[styles.token, { color: themeColors.textPrimary }]}>
            {token}
          </Text>
          <Text style={[styles.timestamp, { color: themeColors.textTertiary }]}>
            {timestamp}
          </Text>
        </View>
      </View>

      <View style={styles.middleSection}>
        <Text style={[styles.amount, { color: themeColors.textPrimary }]}>
          {amount.toLocaleString()}
        </Text>
        <View style={[styles.statusChip, { backgroundColor: config.bg, borderColor: config.color }]}>
          <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>

      <View style={styles.chevron}>
        <Feather name="chevron-right" size={20} color={themeColors.textTertiary} />
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
    borderRadius: BorderRadius.lg,
    borderWidth: Borders.width.regular,
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
    borderWidth: Borders.width.regular,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    gap: Spacing.xs,
  },
  token: {
    ...Typography.bodyMedium,
  },
  timestamp: {
    ...Typography.caption,
  },
  middleSection: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
  },
  amount: {
    ...Typography.bodyMedium,
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
});
