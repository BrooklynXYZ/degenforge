import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Layout } from '@/constants/designTokens';
import { ActionButton } from '@/components/ui/ActionButton';
import { StatCard } from '@/components/cards/StatCard';
import { VaultCard } from '@/components/cards/VaultCard';
import { BridgeStepper } from '@/components/cards/BridgeStepper';
import { TxListItem } from '@/components/lists/TxListItem';

const SCREEN_WIDTH = Dimensions.get('window').width;

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

  const bridgeSteps = [
    {
      label: 'Minted',
      txHash: '0x9f8c4a2b1e3d5f7a9c1b3e5f7a9c1b3e',
      confirmations: 12,
      status: 'confirmed' as const,
    },
    {
      label: 'Wrapped',
      txHash: 'Ey7Ck3Tz9mK2pL5qR8sT1uV4wX7yZ0aB1cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3w',
      confirmations: 8,
      status: 'confirmed' as const,
    },
    {
      label: 'Deposited',
      txHash: '',
      confirmations: 0,
      status: 'pending' as const,
    },
  ];

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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Mezo Wallet</Text>
        <Text style={styles.subheading}>Solana Yield Bridge</Text>
      </View>

      {/* Wallet Summary */}
      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Value</Text>
          <Text style={styles.summaryValue}>
            ${walletData.totalValue.toLocaleString()}
          </Text>
          <Text style={styles.summaryChange}>
            +{walletData.portfolioChange}% this week
          </Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          label="BTC Collateral"
          value={walletData.btcCollateral}
          unit="BTC"
          change="+0.05 BTC"
          changeType="positive"
          icon={<Text style={styles.statIcon}>₿</Text>}
          style={styles.statCardHalf}
        />
        <StatCard
          label="mUSD Balance"
          value={walletData.musdBalance}
          unit="USD"
          change="+$500"
          changeType="positive"
          icon={<Text style={styles.statIcon}>💵</Text>}
          style={styles.statCardHalf}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionButton
            variant="primary"
            size="md"
            onPress={() => onNavigate('Mint')}
            style={styles.actionButtonHalf}
          >
            Deposit
          </ActionButton>
          <ActionButton
            variant="secondary"
            size="md"
            onPress={() => onNavigate('Bridge')}
            style={styles.actionButtonHalf}
          >
            Bridge
          </ActionButton>
        </View>
        <ActionButton
          variant="secondary"
          size="md"
          fullWidth
          onPress={() => onNavigate('Redeem')}
        >
          Redeem
        </ActionButton>
      </View>

      {/* Active Vault */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Vault</Text>
        <VaultCard
          collateralSats={vaultData.collateralSats}
          debtMUSD={vaultData.debtMUSD}
          collateralRatio={vaultData.collateralRatio}
          vaultId={vaultData.vaultId}
          onPress={() => onNavigate('VaultDetail')}
        />
      </View>

      {/* Bridge Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bridge Status</Text>
        <BridgeStepper
          currentStep={2}
          steps={bridgeSteps}
          onStepPress={(index) => console.log('Step pressed:', index)}
        />
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <ActionButton
            variant="secondary"
            size="sm"
            onPress={() => onNavigate('Activity')}
          >
            View All
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

      {/* Bottom spacing for nav */}
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
  header: {
    marginBottom: Spacing.xl,
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
  summarySection: {
    marginBottom: Spacing.xl,
  },
  summaryCard: {
    backgroundColor: Colors.accent.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  summaryLabel: {
    ...Typography.bodySmall,
    color: Colors.base.white,
    opacity: 0.8,
  },
  summaryValue: {
    ...Typography.h1,
    color: Colors.base.white,
  },
  summaryChange: {
    ...Typography.caption,
    color: Colors.base.white,
    opacity: 0.8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
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
