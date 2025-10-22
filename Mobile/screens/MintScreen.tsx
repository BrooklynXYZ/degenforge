import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Layout } from '@/constants/designTokens';
import { ActionButton } from '@/components/ui/ActionButton';

interface MintScreenProps {
  onNavigate: (screen: string) => void;
}

export const MintScreen: React.FC<MintScreenProps> = ({ onNavigate }) => {
  const [btcAmount, setBtcAmount] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const btcPrice = 65000;
  const ltvRatio = 0.5;
  const fee = 0.01;

  const btcValue = parseFloat(btcAmount) || 0;
  const usdValue = btcValue * btcPrice;
  const musdMinted = usdValue * ltvRatio;
  const feeAmount = musdMinted * fee;
  const netMinted = musdMinted - feeAmount;

  const mockMintTxHash = '0x9f8c4a2b1e3d5f7a9c1b3e5f7a9c1b3e5f7a9c1b3e5f7a9c1b3e5f7a9c1b3e';
  const mockVaultId = '0x1234567890abcdef1234567890abcdef';

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsConfirmed(true);
  }, []);

  const handleMaxAmount = useCallback(() => {
    setBtcAmount('0.5');
  }, []);

  if (isConfirmed) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.successSection}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Mint Successful</Text>
          <Text style={styles.successSubtitle}>Your mUSD has been minted on Mezo</Text>
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>You Received</Text>
          <Text style={styles.resultAmount}>{netMinted.toFixed(2)}</Text>
          <Text style={styles.resultUnit}>mUSD</Text>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.detailsTitle}>Transaction Details</Text>
          <DetailRow label="Amount Minted" value={`${netMinted.toFixed(2)} mUSD`} />
          <DetailRow label="Fee" value={`${feeAmount.toFixed(2)} mUSD`} />
          <DetailRow label="BTC Collateral" value={`${btcAmount} BTC`} />
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.detailsTitle}>Mezo Proof</Text>
          <ProofBox label="Mint TX Hash" value={mockMintTxHash} />
          <ProofBox label="Vault ID" value={mockVaultId} />
        </View>

        <View style={styles.actionsSection}>
          <ActionButton variant="primary" fullWidth onPress={() => onNavigate('Bridge')}>
            Proceed to Bridge
          </ActionButton>
          <ActionButton variant="secondary" fullWidth onPress={() => onNavigate('Home')}>
            Back to Home
          </ActionButton>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Mint mUSD</Text>
          <Text style={styles.subtitle}>Deposit BTC collateral</Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>Amount</Text>
            <TouchableOpacity onPress={handleMaxAmount} style={styles.maxButtonContainer}>
              <Text style={styles.maxButton}>MAX</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#CCCCCC"
              keyboardType="decimal-pad"
              value={btcAmount}
              onChangeText={setBtcAmount}
            />
            <Text style={styles.inputUnit}>BTC</Text>
          </View>

          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Balance: 0.5 BTC</Text>
            <Text style={styles.priceLabel}>${btcPrice.toLocaleString()}</Text>
          </View>
        </View>

        {btcValue > 0 && (
          <>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>USD Value</Text>
                <Text style={styles.statValue}>${usdValue.toLocaleString()}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>You Receive</Text>
                <Text style={styles.statValue}>{netMinted.toFixed(2)} mUSD</Text>
              </View>
            </View>

            <View style={styles.ltvSection}>
              <View style={styles.ltvHeader}>
                <Text style={styles.ltvLabel}>Loan-to-Value</Text>
                <Text style={styles.ltvValue}>{(ltvRatio * 100).toFixed(0)}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${ltvRatio * 100}%` }]} />
              </View>
              <View style={styles.ltvRange}>
                <Text style={styles.rangeLabel}>Safe</Text>
                <Text style={styles.rangeLabel}>Risky</Text>
              </View>
            </View>

            <View style={styles.feeSection}>
              <FeeRow label="Mint Amount" value={`${musdMinted.toFixed(2)} mUSD`} />
              <FeeRow label="Protocol Fee (1%)" value={`${feeAmount.toFixed(2)} mUSD`} />
              <View style={styles.feeDivider} />
              <FeeRow label="You Receive" value={`${netMinted.toFixed(2)} mUSD`} bold />
            </View>
          </>
        )}

        <View style={styles.actionsSection}>
          <ActionButton variant="accent" fullWidth disabled={btcValue <= 0} loading={isLoading} onPress={handleConfirm}>
            Confirm Mint
          </ActionButton>
          <ActionButton variant="secondary" fullWidth onPress={() => onNavigate('Home')}>
            Cancel
          </ActionButton>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const DetailRow = React.memo<{ label: string; value: string }>(({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
));

DetailRow.displayName = 'DetailRow';

const ProofBox = React.memo<{ label: string; value: string }>(({ label, value }) => (
  <View style={styles.proofRow}>
    <Text style={styles.proofLabel}>{label}</Text>
    <Text style={styles.proofValue}>{value.slice(0, 8)}...{value.slice(-6)}</Text>
  </View>
));

ProofBox.displayName = 'ProofBox';

const FeeRow = React.memo<{ label: string; value: string; bold?: boolean }>(
  ({ label, value, bold }) => (
    <View style={styles.feeRow}>
      <Text style={[styles.feeLabel, bold && styles.feeLabelBold]}>{label}</Text>
      <Text style={[styles.feeValue, bold && styles.feeValueBold]}>{value}</Text>
    </View>
  )
);

FeeRow.displayName = 'FeeRow';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  inputSection: {
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#000000',
    padding: 24,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SpaceGrotesk_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  maxButtonContainer: {
    borderWidth: 1.5,
    borderColor: '#000000',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  maxButton: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'SpaceGrotesk_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    minHeight: 80,
  },
  input: {
    fontSize: 56,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'SpaceGrotesk_700Bold',
    flex: 1,
    padding: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  inputUnit: {
    fontSize: 28,
    fontWeight: '600',
    color: '#999999',
    fontFamily: 'SpaceGrotesk_600SemiBold',
    marginLeft: Spacing.sm,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    padding: 24,
    borderWidth: 2,
    borderColor: '#000000',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    fontFamily: 'SpaceGrotesk_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  ltvSection: {
    marginBottom: 32,
    padding: 24,
    borderWidth: 2,
    borderColor: '#000000',
  },
  ltvHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  ltvLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    fontFamily: 'SpaceGrotesk_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ltvValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    marginBottom: Spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000000',
  },
  ltvRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeLabel: {
    fontSize: 11,
    color: '#999999',
    fontFamily: 'SpaceGrotesk_400Regular',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  feeSection: {
    marginBottom: 32,
    padding: 24,
    borderWidth: 2,
    borderColor: '#000000',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  feeLabel: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  feeLabelBold: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  feeValueBold: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  feeDivider: {
    height: 2,
    backgroundColor: '#000000',
    marginVertical: 16,
  },
  actionsSection: {
    gap: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  bottomSpacer: {
    height: 120,
  },
  successSection: {
    alignItems: 'center',
    marginBottom: 64,
    paddingTop: 80,
    paddingBottom: 48,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 0,
    borderWidth: 4,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  successIconText: {
    fontSize: 64,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 64,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'SpaceGrotesk_400Regular',
    textAlign: 'center',
  },
  resultCard: {
    padding: 48,
    alignItems: 'center',
    marginBottom: 48,
    borderWidth: 3,
    borderColor: '#000000',
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    fontFamily: 'SpaceGrotesk_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  resultAmount: {
    fontSize: 72,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 8,
    lineHeight: 72,
  },
  resultUnit: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666666',
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  detailsSection: {
    marginBottom: 32,
    padding: 24,
    borderWidth: 2,
    borderColor: '#000000',
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    fontFamily: 'SpaceGrotesk_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  proofRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  proofLabel: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  proofValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontVariant: ['tabular-nums'],
  },
});
