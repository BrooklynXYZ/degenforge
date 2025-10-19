import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Layout } from '@/constants/designTokens';
import { ActionButton } from '@/components/ui/ActionButton';
import { StatCard } from '@/components/cards/StatCard';
import { TxListItem } from '@/components/lists/TxListItem';

interface PoolDetailScreenProps {
  onNavigate: (screen: string) => void;
}

export const PoolDetailScreen: React.FC<PoolDetailScreenProps> = ({ onNavigate }) => {
  const [depositAmount, setDepositAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');

  // Mock data
  const poolData = {
    name: 'Marinade Finance',
    apy: 8.5,
    tvl: 1250000000,
    logo: '🌊',
    userDeposit: 25000,
    userShares: 25500,
  };

  const projectedReturns = {
    daily: 5.83,
    weekly: 40.83,
    monthly: 175.0,
    yearly: 2125.0,
  };

  const recentHarvests = [
    {
      id: '1',
      icon: '🌾',
      token: 'SOL',
      amount: 125.5,
      status: 'confirmed' as const,
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      icon: '🌾',
      token: 'SOL',
      amount: 98.2,
      status: 'confirmed' as const,
      timestamp: '1 day ago',
    },
    {
      id: '3',
      icon: '🌾',
      token: 'SOL',
      amount: 112.7,
      status: 'confirmed' as const,
      timestamp: '2 days ago',
    },
  ];

  const depositValue = parseFloat(depositAmount) || 0;
  const estimatedReturn = (depositValue * poolData.apy) / 100 / 365;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.poolHeader}>
          <Text style={styles.poolLogo}>{poolData.logo}</Text>
          <View>
            <Text style={styles.poolName}>{poolData.name}</Text>
            <Text style={styles.poolSubtitle}>Solana Liquid Staking</Text>
          </View>
        </View>
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <StatCard
          label="APY"
          value={poolData.apy}
          unit="%"
          style={styles.metricCard}
        />
        <StatCard
          label="TVL"
          value={`$${(poolData.tvl / 1e9).toFixed(2)}B`}
          style={styles.metricCard}
        />
      </View>

      {/* Your Position */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Position</Text>
        <View style={styles.positionCard}>
          <PositionRow label="Deposited" value={`${poolData.userDeposit.toLocaleString()} mUSD`} />
          <PositionRow label="Shares" value={`${poolData.userShares.toLocaleString()} mSOL`} />
          <View style={styles.positionDivider} />
          <PositionRow
            label="Earned This Week"
            value={`$${projectedReturns.weekly.toFixed(2)}`}
            highlight
          />
        </View>
      </View>

      {/* Projected Returns */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Projected Returns</Text>
        <View style={styles.returnsGrid}>
          <ReturnCard label="Daily" value={`$${projectedReturns.daily.toFixed(2)}`} />
          <ReturnCard label="Weekly" value={`$${projectedReturns.weekly.toFixed(2)}`} />
          <ReturnCard label="Monthly" value={`$${projectedReturns.monthly.toFixed(2)}`} />
          <ReturnCard label="Yearly" value={`$${projectedReturns.yearly.toFixed(2)}`} />
        </View>
      </View>

      {/* Deposit/Withdraw */}
      <View style={styles.section}>
        <View style={styles.tabContainer}>
          <TabButton
            label="Deposit"
            active={activeTab === 'deposit'}
            onPress={() => setActiveTab('deposit')}
          />
          <TabButton
            label="Withdraw"
            active={activeTab === 'withdraw'}
            onPress={() => setActiveTab('withdraw')}
          />
        </View>

        <View style={styles.actionCard}>
          <Text style={styles.actionLabel}>
            {activeTab === 'deposit' ? 'Deposit Amount' : 'Withdraw Amount'}
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Colors.text.tertiary}
              keyboardType="decimal-pad"
              value={depositAmount}
              onChangeText={setDepositAmount}
            />
            <Text style={styles.inputUnit}>mUSD</Text>
          </View>

          {depositValue > 0 && (
            <View style={styles.estimateBox}>
              <Text style={styles.estimateLabel}>
                Estimated Daily Return
              </Text>
              <Text style={styles.estimateValue}>
                ${estimatedReturn.toFixed(2)}
              </Text>
            </View>
          )}

          <ActionButton
            variant="primary"
            fullWidth
            disabled={depositValue <= 0}
            onPress={() => console.log('Action pressed')}
          >
            {activeTab === 'deposit' ? 'Deposit' : 'Withdraw'}
          </ActionButton>
        </View>
      </View>

      {/* Recent Harvests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Harvests</Text>
        <View style={styles.txList}>
          {recentHarvests.map((tx) => (
            <TxListItem
              key={tx.id}
              icon={tx.icon}
              token={tx.token}
              amount={tx.amount}
              status={tx.status}
              timestamp={tx.timestamp}
              onPress={() => console.log('Tx pressed:', tx.id)}
            />
          ))}
        </View>
      </View>

      {/* Pool Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pool Information</Text>
        <View style={styles.infoCard}>
          <InfoRow label="Pool Address" value="mSoL..." />
          <InfoRow label="Validator" value="Marinade" />
          <InfoRow label="Commission" value="2%" />
          <InfoRow label="Min Deposit" value="1 mUSD" />
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

interface PositionRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const PositionRow: React.FC<PositionRowProps> = ({ label, value, highlight }) => (
  <View style={styles.positionRow}>
    <Text style={[styles.positionLabel, highlight && styles.positionLabelHighlight]}>
      {label}
    </Text>
    <Text style={[styles.positionValue, highlight && styles.positionValueHighlight]}>
      {value}
    </Text>
  </View>
);

interface ReturnCardProps {
  label: string;
  value: string;
}

const ReturnCard: React.FC<ReturnCardProps> = ({ label, value }) => (
  <View style={styles.returnCard}>
    <Text style={styles.returnLabel}>{label}</Text>
    <Text style={styles.returnValue}>{value}</Text>
  </View>
);

interface TabButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, active, onPress }) => (
  <ActionButton
    variant={active ? 'primary' : 'secondary'}
    size="md"
    onPress={onPress}
    style={styles.tabButton}
  >
    {label}
  </ActionButton>
);

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

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
  poolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  poolLogo: {
    fontSize: 48,
  },
  poolName: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  poolSubtitle: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  metricCard: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  positionCard: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  positionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  positionLabel: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  positionLabelHighlight: {
    color: Colors.accent.primary,
    fontWeight: '600',
  },
  positionValue: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  positionValueHighlight: {
    color: Colors.accent.primary,
  },
  positionDivider: {
    height: 1,
    backgroundColor: Colors.neutral[200],
  },
  returnsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  returnCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  returnLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  returnValue: {
    ...Typography.bodyMedium,
    color: Colors.accent.primary,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  tabButton: {
    flex: 1,
  },
  actionCard: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  actionLabel: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.lg,
    ...Typography.h2,
    color: Colors.text.primary,
  },
  inputUnit: {
    ...Typography.bodyMedium,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  estimateBox: {
    backgroundColor: Colors.accent.light,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  estimateLabel: {
    ...Typography.caption,
    color: Colors.accent.dark,
  },
  estimateValue: {
    ...Typography.bodyMedium,
    color: Colors.accent.primary,
    fontWeight: '700',
  },
  txList: {
    backgroundColor: Colors.bg.primary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  infoCard: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  infoValue: {
    ...Typography.bodySmall,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 120,
  },
});
