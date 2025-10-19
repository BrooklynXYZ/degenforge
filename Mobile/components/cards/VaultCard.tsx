import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/designTokens';

interface VaultCardProps {
  collateralSats: number;
  debtMUSD: number;
  collateralRatio: number; // 0-1
  vaultId: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const VaultCard: React.FC<VaultCardProps> = ({
  collateralSats,
  debtMUSD,
  collateralRatio,
  vaultId,
  onPress,
  style,
}) => {
  const btcAmount = (collateralSats / 100000000).toFixed(4);
  const ratioPercentage = Math.round(collateralRatio * 100);
  const isHealthy = collateralRatio > 0.5;

  const containerStyle: ViewStyle[] = [styles.container, style];

  const content = (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Active Vault</Text>
        <Text style={styles.vaultId}>{vaultId.slice(0, 10)}...</Text>
      </View>

      <View style={styles.content}>
        {/* Left: Collateral Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Collateral</Text>
            <Text style={styles.value}>{btcAmount} BTC</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Debt</Text>
            <Text style={styles.value}>${debtMUSD.toLocaleString()}</Text>
          </View>
        </View>

        {/* Right: Circular Progress */}
        <View style={styles.progressSection}>
          <CircularProgress ratio={collateralRatio} />
          <Text style={styles.ratioLabel}>LTV</Text>
          <Text style={[styles.ratioValue, { color: isHealthy ? Colors.semantic.success : Colors.semantic.warning }]}>
            {ratioPercentage}%
          </Text>
        </View>
      </View>

      {/* Status indicator */}
      <View style={styles.footer}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isHealthy ? Colors.semantic.success : Colors.semantic.warning },
          ]}
        />
        <Text style={styles.statusText}>
          {isHealthy ? 'Healthy' : 'At Risk'}
        </Text>
      </View>
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

interface CircularProgressProps {
  ratio: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ ratio }) => {
  const size = 80;
  const percentage = Math.round(ratio * 100);

  return (
    <View style={styles.progressContainer}>
      <View style={[styles.progressCircle, { width: size, height: size }]}>
        <Text style={styles.progressText}>{percentage}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bg.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.card,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  vaultId: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontFamily: 'monospace',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  infoSection: {
    flex: 1,
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  value: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
  },
  progressSection: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    width: 80,
    height: 80,
  },
  ratioLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  ratioValue: {
    ...Typography.h3,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.circle,
  },
  statusText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircle: {
    borderRadius: BorderRadius.circle,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.accent.primary,
  },
  progressText: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: '600',
  },
});
