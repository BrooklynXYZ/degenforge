

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/designTokens';
import { ActionButton } from '@/components/ui/ActionButton';

interface PoolCardProps {
  poolName: string;
  apy: number;
  tvl: number;
  logo?: string;
  onDeposit: () => void;
  onPress?: () => void;
  style?: ViewStyle;
}

export const PoolCard: React.FC<PoolCardProps> = ({
  poolName,
  apy,
  tvl,
  logo = '💰',
  onDeposit,
  onPress,
  style,
}) => {
  const tvlFormatted = formatTVL(tvl);

  const containerStyle: ViewStyle[] = [styles.container, style];

  const content = (
    <>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>{logo}</Text>
        </View>
        <View style={styles.titleSection}>
          <Text style={styles.poolName}>{poolName}</Text>
          <Text style={styles.tvl}>TVL: ${tvlFormatted}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>APY</Text>
          <Text style={styles.statValue}>{apy.toFixed(2)}%</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Status</Text>
          <Text style={styles.statusBadge}>Active</Text>
        </View>
      </View>

      <ActionButton
        variant="primary"
        size="md"
        fullWidth
        onPress={onDeposit}
      >
        Deposit
      </ActionButton>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{content}</View>;
};

const formatTVL = (tvl: number): string => {
  if (tvl >= 1e9) {
    return `${(tvl / 1e9).toFixed(2)}B`;
  }
  if (tvl >= 1e6) {
    return `${(tvl / 1e6).toFixed(2)}M`;
  }
  if (tvl >= 1e3) {
    return `${(tvl / 1e3).toFixed(2)}K`;
  }
  return tvl.toFixed(2);
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bg.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.card,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.bg.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 24,
  },
  titleSection: {
    flex: 1,
    gap: Spacing.xs,
  },
  poolName: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
  },
  tvl: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  statValue: {
    ...Typography.bodyMedium,
    color: Colors.accent.primary,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.neutral[200],
  },
  statusBadge: {
    ...Typography.caption,
    color: Colors.semantic.success,
    fontWeight: '600',
  },
});
