import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Layout } from '@/constants/designTokens';
import { ActionButton } from '@/components/ui/ActionButton';
import { StatCard } from '@/components/cards/StatCard';
import { VaultCard } from '@/components/cards/VaultCard';
// import { BridgeStepper } from '@/components/cards/BridgeStepper';
import { TxListItem } from '@/components/lists/TxListItem';

// Removed grid width calculations

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const [selectedTx, setSelectedTx] = useState<string | null>(null);

  // Mock data
  const walletData = {
    btcCollateral: 0.5,
    musdBalance: 25000,
    totalValue: 32500,
    portfolioChange: 2.5,
  };

  const vaultData = {
    collateralSats: 50000000,
    debtMUSD: 25000,
    collateralRatio: 0.75,
    vaultId: '0x1234567890abcdef',
  };

  // Bridge flow removed for simplified neutral wallet experience

  const recentTxs = [
    {
      id: '1',
      icon: '📤',
      token: 'mUSD',
      amount: 1000,
      status: 'confirmed' as const,
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      icon: '🌉',
      token: 'SOL',
      amount: 5.5,
      status: 'confirmed' as const,
      timestamp: '1 day ago',
    },
    {
      id: '3',
      icon: '💰',
      token: 'mUSD',
      amount: 500,
      status: 'pending' as const,
      timestamp: '5 minutes ago',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Balance card centered a bit lower with actions */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Your available balance</Text>
          <Text style={styles.balanceValue}>{`$${walletData.totalValue.toLocaleString()}`}</Text>
        </View>
        <View style={styles.quickActionsRow}>
          <View style={styles.quickItem}>
            <Text style={styles.quickIcon}>＋</Text>
            <Text style={styles.quickLabel}>Top Up</Text>
          </View>
          <View style={styles.quickItem}>
            <Text style={styles.quickIcon}>➤</Text>
            <Text style={styles.quickLabel}>Send</Text>
          </View>
          <View style={styles.quickItem}>
            <Text style={styles.quickIcon}>📷</Text>
            <Text style={styles.quickLabel}>Withdraw</Text>
          </View>
        </View>
      </View>

      {/* Removed services grid and promo banner for minimal home */}

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transaction</Text>
          <ActionButton
            variant="secondary"
            size="sm"
            onPress={() => onNavigate('Activity')}
          >
            See All
          </ActionButton>
        </View>
        <View style={styles.txList}>
          {recentTxs.map((tx) => (
            <TxListItem
              key={tx.id}
              icon={tx.icon}
              token={tx.token}
              amount={tx.amount}
              status={tx.status}
              timestamp={tx.timestamp}
              onPress={() => setSelectedTx(tx.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  contentContainer: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
  },
  balanceCard: {
    backgroundColor: Colors.base.black,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  balanceLabel: {
    ...Typography.bodySmall,
    color: Colors.base.white,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.xl,
  },
  headerLeft: {
    gap: Spacing.xs,
  },
  greeting: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subheading: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  balanceValue: {
    ...Typography.h1,
    color: Colors.text.primary,
  },
  summarySection: {
    marginBottom: Spacing.xl,
  },
  summaryCard: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  summaryLabel: {
    ...Typography.bodySmall,
    color: Colors.neutral[700],
  },
  summaryValue: {
    ...Typography.h1,
    color: Colors.neutral[900],
  },
  summaryChange: {
    ...Typography.caption,
    color: Colors.neutral[600],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  // quickBar replaced by balanceCard.quickActionsRow
  quickItem: {
    alignItems: 'center',
    width: '32%',
  },
  quickIcon: {
    fontSize: 20,
    color: Colors.base.white,
    marginBottom: Spacing.xs,
  },
  quickLabel: {
    ...Typography.bodySmall,
    color: Colors.base.white,
  },
  // removed services/promo styles
  statCardHalf: {
    flex: 1,
  },
  statIcon: {
    fontSize: 20,
  },
  actionsSection: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  actionButtonHalf: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  txList: {
    backgroundColor: Colors.bg.primary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  bottomSpacer: {
    height: 120,
  },
});
