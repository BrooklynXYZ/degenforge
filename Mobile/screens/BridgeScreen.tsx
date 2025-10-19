import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Layout } from '@/constants/designTokens';
import { ActionButton } from '@/components/ui/ActionButton';
import { BridgeStepper } from '@/components/cards/BridgeStepper';
import { PoolCard } from '@/components/cards/PoolCard';

interface BridgeScreenProps {
  onNavigate: (screen: string) => void;
}

export const BridgeScreen: React.FC<BridgeScreenProps> = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock data
  const bridgeSteps = [
    {
      label: 'Minted on Mezo',
      txHash: '0x9f8c4a2b1e3d5f7a9c1b3e5f7a9c1b3e',
      confirmations: 12,
      status: 'confirmed' as const,
    },
    {
      label: 'Wrapped on Solana',
      txHash: 'Ey7Ck3Tz9mK2pL5qR8sT1uV4wX7yZ0aB1cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3w',
      confirmations: 8,
      status: 'confirmed' as const,
    },
    {
      label: 'Deposited to Pool',
      txHash: '',
      confirmations: 0,
      status: 'pending' as const,
    },
  ];

  const poolData = {
    poolName: 'Marinade Finance',
    apy: 8.5,
    tvl: 1250000000,
    logo: '🌊',
  };

  const handleDeposit = async () => {
    setIsProcessing(true);
    // Simulate deposit
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setCurrentStep(2);
    setIsProcessing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Bridge to Solana</Text>
        <Text style={styles.subtitle}>
          Wrap mUSD and deposit to yield pool
        </Text>
      </View>

      {/* Bridge Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bridge Progress</Text>
        <BridgeStepper
          currentStep={currentStep}
          steps={bridgeSteps}
          onStepPress={(index) => console.log('Step pressed:', index)}
        />
      </View>

      {/* Bridge Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.infoCard}>
          <InfoStep
            number={1}
            title="Mint on Mezo"
            description="Your BTC collateral is locked and mUSD is minted"
          />
          <InfoStep
            number={2}
            title="Wrap on Solana"
            description="mUSD is wrapped and bridged to Solana network"
          />
          <InfoStep
            number={3}
            title="Deposit to Pool"
            description="Wrapped mUSD is deposited to earn yield"
          />
        </View>
      </View>

      {/* Target Pool */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Target Yield Pool</Text>
        <PoolCard
          poolName={poolData.poolName}
          apy={poolData.apy}
          tvl={poolData.tvl}
          logo={poolData.logo}
          onDeposit={handleDeposit}
          onPress={() => onNavigate('PoolDetail')}
        />
      </View>

      {/* Bridge Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bridge Details</Text>
        <View style={styles.detailsCard}>
          <DetailRow label="Amount" value="25,000 mUSD" />
          <DetailRow label="From" value="Mezo" />
          <DetailRow label="To" value="Solana" />
          <DetailRow label="Bridge Fee" value="0.5%" />
          <DetailRow label="Estimated Time" value="~5 minutes" />
        </View>
      </View>

      {/* Status Messages */}
      {currentStep === 0 && (
        <View style={[styles.statusBox, styles.statusPending]}>
          <Text style={styles.statusIcon}>⏳</Text>
          <Text style={styles.statusText}>
            Waiting for Mezo confirmation...
          </Text>
        </View>
      )}
      {currentStep === 1 && (
        <View style={[styles.statusBox, styles.statusPending]}>
          <Text style={styles.statusIcon}>🌉</Text>
          <Text style={styles.statusText}>
            Wrapping on Solana...
          </Text>
        </View>
      )}
      {currentStep === 2 && (
        <View style={[styles.statusBox, styles.statusSuccess]}>
          <Text style={styles.statusIcon}>✓</Text>
          <Text style={styles.statusText}>
            Ready to deposit to pool
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        {currentStep < 2 && (
          <ActionButton
            variant="primary"
            fullWidth
            loading={isProcessing}
            onPress={handleDeposit}
          >
            Continue Bridge
          </ActionButton>
        )}
        {currentStep === 2 && (
          <ActionButton
            variant="primary"
            fullWidth
            loading={isProcessing}
            onPress={handleDeposit}
          >
            Deposit to Pool
          </ActionButton>
        )}
        <ActionButton
          variant="secondary"
          fullWidth
          onPress={() => onNavigate('Home')}
        >
          Back to Home
        </ActionButton>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

interface InfoStepProps {
  number: number;
  title: string;
  description: string;
}

const InfoStep: React.FC<InfoStepProps> = ({ number, title, description }) => (
  <View style={styles.infoStep}>
    <View style={styles.stepNumber}>
      <Text style={styles.stepNumberText}>{number}</Text>
    </View>
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDescription}>{description}</Text>
    </View>
  </View>
);

interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
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
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  infoCard: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  infoStep: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.circle,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    ...Typography.bodyMedium,
    color: Colors.base.white,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  stepTitle: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  stepDescription: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  detailsCard: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  detailValue: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  statusPending: {
    backgroundColor: Colors.semantic.pending,
    opacity: 0.1,
  },
  statusSuccess: {
    backgroundColor: Colors.semantic.success,
    opacity: 0.1,
  },
  statusIcon: {
    fontSize: 24,
  },
  statusText: {
    ...Typography.bodySmall,
    color: Colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  actionsSection: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  bottomSpacer: {
    height: 120,
  },
});
