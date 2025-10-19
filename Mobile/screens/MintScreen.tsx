/**
 * MintScreen / Deposit
 * 
 * Displays:
 * - Amount input (BTC)
 * - Estimated mUSD result
 * - LTV preview (progress bar)
 * - Confirm CTA with estimated fee (1%)
 * - Post-confirm screen showing Mezo mintTxHash and vault id
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Layout } from '@/constants/designTokens';
import { ActionButton } from '@/components/ui/ActionButton';
import { StatCard } from '@/components/cards/StatCard';

interface MintScreenProps {
  onNavigate: (screen: string) => void;
}

export const MintScreen: React.FC<MintScreenProps> = ({ onNavigate }) => {
  const [btcAmount, setBtcAmount] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data
  const btcPrice = 65000;
  const ltvRatio = 0.5; // 50% LTV
  const fee = 0.01; // 1%

  const btcValue = parseFloat(btcAmount) || 0;
  const usdValue = btcValue * btcPrice;
  const musdMinted = usdValue * ltvRatio;
  const feeAmount = musdMinted * fee;
  const netMinted = musdMinted - feeAmount;

  const mockMintTxHash = '0x9f8c4a2b1e3d5f7a9c1b3e5f7a9c1b3e5f7a9c1b3e5f7a9c1b3e5f7a9c1b3e';
  const mockVaultId = '0x1234567890abcdef1234567890abcdef';

  const handleConfirm = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsConfirmed(true);
  };

  if (isConfirmed) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.successSection}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>Mint Successful</Text>
          <Text style={styles.successSubtitle}>
            Your mUSD has been minted on Mezo
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>
          <View style={styles.detailCard}>
            <DetailRow label="Amount Minted" value={`${netMinted.toFixed(2)} mUSD`} />
            <DetailRow label="Fee" value={`${feeAmount.toFixed(2)} mUSD`} />
            <DetailRow label="BTC Collateral" value={`${btcAmount} BTC`} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mezo Proof</Text>
          <ProofBox label="Mint TX Hash" value={mockMintTxHash} />
          <ProofBox label="Vault ID" value={mockVaultId} />
        </View>

        <View style={styles.actionsSection}>
          <ActionButton
            variant="primary"
            fullWidth
            onPress={() => onNavigate('Bridge')}
          >
            Proceed to Bridge
          </ActionButton>
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
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Mint mUSD</Text>
          <Text style={styles.subtitle}>Deposit BTC collateral on Mezo</Text>
        </View>

        {/* Input Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amount</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={Colors.text.tertiary}
              keyboardType="decimal-pad"
              value={btcAmount}
              onChangeText={setBtcAmount}
            />
            <Text style={styles.inputUnit}>BTC</Text>
          </View>
          <Text style={styles.inputHint}>
            Current price: ${btcPrice.toLocaleString()} / BTC
          </Text>
        </View>

        {/* Preview Section */}
        {btcValue > 0 && (
          <>
            <View style={styles.statsGrid}>
              <StatCard
                label="USD Value"
                value={usdValue.toFixed(2)}
                unit="USD"
                style={styles.statCardHalf}
              />
              <StatCard
                label="mUSD Minted"
                value={netMinted.toFixed(2)}
                unit="mUSD"
                style={styles.statCardHalf}
              />
            </View>

            {/* LTV Preview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>LTV Preview</Text>
              <View style={styles.ltvCard}>
                <View style={styles.ltvHeader}>
                  <Text style={styles.ltvLabel}>Loan-to-Value</Text>
                  <Text style={styles.ltvValue}>{(ltvRatio * 100).toFixed(0)}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${ltvRatio * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.ltvHint}>
                  Safe range: 30% - 70%
                </Text>
              </View>
            </View>

            {/* Fee Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fee Breakdown</Text>
              <View style={styles.feeCard}>
                <FeeRow label="Mint Amount" value={musdMinted.toFixed(2)} />
                <FeeRow label="Fee (1%)" value={feeAmount.toFixed(2)} highlight />
                <View style={styles.feeDivider} />
                <FeeRow label="You Receive" value={netMinted.toFixed(2)} bold />
              </View>
            </View>
          </>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <ActionButton
            variant="primary"
            fullWidth
            disabled={btcValue <= 0}
            loading={isLoading}
            onPress={handleConfirm}
          >
            Confirm Mint
          </ActionButton>
          <ActionButton
            variant="secondary"
            fullWidth
            onPress={() => onNavigate('Home')}
          >
            Cancel
          </ActionButton>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

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

interface ProofBoxProps {
  label: string;
  value: string;
}

const ProofBox: React.FC<ProofBoxProps> = ({ label, value }) => (
  <View style={styles.proofBox}>
    <Text style={styles.proofLabel}>{label}</Text>
    <View style={styles.proofValueContainer}>
      <Text style={styles.proofValue}>{truncateHash(value)}</Text>
      <ActionButton
        variant="secondary"
        size="sm"
        onPress={() => copyToClipboard(value)}
      >
        Copy
      </ActionButton>
    </View>
  </View>
);

interface FeeRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  bold?: boolean;
}

const FeeRow: React.FC<FeeRowProps> = ({ label, value, highlight, bold }) => (
  <View style={styles.feeRow}>
    <Text
      style={[
        styles.feeLabel,
        highlight && styles.feeLabelHighlight,
        bold && styles.feeLabelBold,
      ]}
    >
      {label}
    </Text>
    <Text
      style={[
        styles.feeValue,
        highlight && styles.feeValueHighlight,
        bold && styles.feeValueBold,
      ]}
    >
      {value}
    </Text>
  </View>
);

const truncateHash = (hash: string): string => {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
};

const copyToClipboard = (text: string) => {
  console.log('Copied:', text);
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.secondary,
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
  inputHint: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: Spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCardHalf: {
    flex: 1,
  },
  ltvCard: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  ltvHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ltvLabel: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  ltvValue: {
    ...Typography.h3,
    color: Colors.accent.primary,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.primary,
  },
  ltvHint: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  feeCard: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeLabel: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  feeLabelHighlight: {
    color: Colors.semantic.warning,
    fontWeight: '600',
  },
  feeLabelBold: {
    color: Colors.text.primary,
    fontWeight: '700',
  },
  feeValue: {
    ...Typography.bodySmall,
    color: Colors.text.primary,
  },
  feeValueHighlight: {
    color: Colors.semantic.warning,
    fontWeight: '600',
  },
  feeValueBold: {
    ...Typography.bodyMedium,
    fontWeight: '700',
  },
  feeDivider: {
    height: 1,
    backgroundColor: Colors.neutral[200],
  },
  actionsSection: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  bottomSpacer: {
    height: 120,
  },
  successSection: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
    gap: Spacing.md,
  },
  successIcon: {
    fontSize: 64,
    color: Colors.semantic.success,
  },
  successTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  successSubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  detailCard: {
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
  proofBox: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  proofLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  proofValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  proofValue: {
    ...Typography.caption,
    color: Colors.accent.primary,
    fontFamily: 'monospace',
    flex: 1,
  },
});
