import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useAnimatedProps,
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Layout,
  Borders,
  Shadows,
  Animations,
} from '@/constants/designTokens';
import { ActionButton } from '@/components/ui/ActionButton';
import { SectionCard } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface MintScreenProps {
  onNavigate: (screen: string) => void;
}

export const MintScreen: React.FC<MintScreenProps> = ({ onNavigate }) => {
  const [btcAmount, setBtcAmount] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const progressValue = useSharedValue(0);

  // Mock wallet data
  const walletBalance = 0.5; // BTC
  const btcPrice = 65000;
  const ltvRatio = 0.5;
  const fee = 0.01;
  const minMintAmount = 0.001; // Minimum BTC to mint

  const btcValue = parseFloat(btcAmount) || 0;
  const usdValue = btcValue * btcPrice;
  const musdMinted = usdValue * ltvRatio;
  const feeAmount = musdMinted * fee;
  const netMinted = musdMinted - feeAmount;

  const mockMintTxHash = '0x9f8c4a2b1e3d5f7a9c1b3e5f7a9c1b3e5f7a9c1b3e5f7a9c1b3e5f7a9c1b3e';
  const mockVaultId = '0x1234567890abcdef1234567890abcdef';

  // Validation
  const validateAmount = useCallback((value: string) => {
    const numValue = parseFloat(value);

    if (!value || numValue === 0) {
      return '';
    }

    if (isNaN(numValue)) {
      return 'Please enter a valid number';
    }

    if (numValue < minMintAmount) {
      return `Minimum amount is ${minMintAmount} BTC`;
    }

    if (numValue > walletBalance) {
      return 'Insufficient balance';
    }

    return '';
  }, [walletBalance, minMintAmount]);

  useEffect(() => {
    if (touched) {
      setError(validateAmount(btcAmount));
    }
  }, [btcAmount, touched, validateAmount]);

  const handleConfirm = useCallback(async () => {
    const validationError = validateAmount(btcAmount);
    if (validationError) {
      setError(validationError);
      setTouched(true);
      return;
    }

    setIsLoading(true);
    progressValue.value = 0;
    progressValue.value = withTiming(1, { duration: 2000 });

    // Simulate minting
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsConfirmed(true);
  }, [btcAmount, validateAmount, progressValue]);

  const handleMaxAmount = useCallback(() => {
    setBtcAmount(walletBalance.toString());
    setTouched(true);
  }, [walletBalance]);

  const handleAmountChange = useCallback((value: string) => {
    // Only allow numbers and decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    // Only allow one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) return;

    setBtcAmount(cleaned);
  }, []);

  const isValid = btcValue > 0 && !error && btcValue >= minMintAmount && btcValue <= walletBalance;

  if (isConfirmed) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Animated.View
          entering={FadeInDown.duration(600).delay(100)}
          style={styles.successSection}
        >
          <Animated.View
            entering={FadeInUp.duration(500).delay(200)}
            style={styles.successIcon}
          >
            <Feather name="check" size={64} color={Colors.semantic.success} />
          </Animated.View>
          <Animated.Text
            entering={FadeInUp.duration(500).delay(300)}
            style={styles.successTitle}
          >
            Mint Successful
          </Animated.Text>
          <Animated.Text
            entering={FadeInUp.duration(500).delay(400)}
            style={styles.successSubtitle}
          >
            Your mUSD has been minted on Mezo
          </Animated.Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(600).delay(500)}
        >
          <SectionCard borderRadius="none" padding="xxxl">
            <Text style={styles.resultLabel}>You Received</Text>
            <AnimatedCounter value={netMinted} decimals={2} />
            <Text style={styles.resultUnit}>mUSD</Text>
          </SectionCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(600)}>
          <SectionCard borderRadius="none" padding="xl">
            <Text style={styles.sectionTitle}>Transaction Details</Text>
            <DetailRow
              label="Amount Minted"
              value={`${netMinted.toFixed(2)} mUSD`}
              icon="check-circle"
            />
            <DetailRow
              label="Fee"
              value={`${feeAmount.toFixed(2)} mUSD`}
              icon="info"
            />
            <DetailRow
              label="BTC Collateral"
              value={`${btcAmount} BTC`}
              icon="lock"
            />
          </SectionCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(700)}>
          <SectionCard borderRadius="none" padding="xl">
            <Text style={styles.sectionTitle}>Mezo Proof</Text>
            <ProofBox label="Mint TX Hash" value={mockMintTxHash} />
            <ProofBox label="Vault ID" value={mockVaultId} />
          </SectionCard>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(600).delay(800)}
          style={styles.actionsSection}
        >
          <ActionButton variant="accent" fullWidth onPress={() => onNavigate('Bridge')}>
            Proceed to Bridge
          </ActionButton>
          <ActionButton variant="secondary" fullWidth onPress={() => onNavigate('Home')}>
            Back to Home
          </ActionButton>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.header}>
          <Text style={styles.title}>Mint mUSD</Text>
          <Text style={styles.subtitle}>Deposit BTC collateral to mint stablecoin</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <SectionCard borderRadius="none" padding="xl">
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>Amount</Text>
              <TouchableOpacity onPress={handleMaxAmount} style={styles.maxButton}>
                <Text style={styles.maxButtonText}>MAX</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.largeInputContainer}>
              <Input
                value={btcAmount}
                onChangeText={handleAmountChange}
                placeholder="0.00"
                keyboardType="decimal-pad"
                error={touched ? error : undefined}
                onBlur={() => setTouched(true)}
                style={styles.largeInput}
                variant="filled"
                rightElement={
                  <Text style={styles.inputUnit}>BTC</Text>
                }
              />
            </View>

            <View style={styles.balanceRow}>
              <View style={styles.balanceItem}>
                <Feather name="wallet" size={14} color={Colors.text.secondary} />
                <Text style={styles.balanceLabel}>
                  Balance: {walletBalance} BTC
                </Text>
              </View>
              <View style={styles.balanceItem}>
                <Feather name="trending-up" size={14} color={Colors.text.secondary} />
                <Text style={styles.priceLabel}>${btcPrice.toLocaleString()}</Text>
              </View>
            </View>
          </SectionCard>
        </Animated.View>

        {btcValue > 0 && isValid && (
          <>
            <Animated.View
              entering={FadeInDown.duration(500).delay(100)}
              style={styles.statsGrid}
            >
              <SectionCard borderRadius="none" padding="lg" style={styles.statBox}>
                <Feather name="dollar-sign" size={20} color={Colors.text.secondary} />
                <Text style={styles.statLabel}>USD Value</Text>
                <Text style={styles.statValue}>${usdValue.toLocaleString()}</Text>
              </SectionCard>
              <SectionCard borderRadius="none" padding="lg" style={styles.statBox}>
                <Feather name="arrow-down-circle" size={20} color={Colors.accent.primary} />
                <Text style={styles.statLabel}>You Receive</Text>
                <Text style={styles.statValue}>{netMinted.toFixed(2)}</Text>
                <Text style={styles.statUnit}>mUSD</Text>
              </SectionCard>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(500).delay(200)}>
              <SectionCard borderRadius="none" padding="xl">
                <View style={styles.ltvHeader}>
                  <View>
                    <Text style={styles.ltvLabel}>Loan-to-Value Ratio</Text>
                    <Text style={styles.ltvDescription}>Safe collateralization</Text>
                  </View>
                  <Text style={styles.ltvValue}>{(ltvRatio * 100).toFixed(0)}%</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <Animated.View
                    entering={SlideInRight.duration(600).delay(400)}
                    style={[styles.progressBar]}
                  >
                    <Animated.View
                      style={[styles.progressFill, { width: `${ltvRatio * 100}%` }]}
                    />
                  </Animated.View>
                </View>
                <View style={styles.ltvRange}>
                  <View style={styles.rangeItem}>
                    <View style={[styles.rangeDot, { backgroundColor: Colors.semantic.success }]} />
                    <Text style={styles.rangeLabel}>Safe</Text>
                  </View>
                  <View style={styles.rangeItem}>
                    <View style={[styles.rangeDot, { backgroundColor: Colors.semantic.error }]} />
                    <Text style={styles.rangeLabel}>Risky</Text>
                  </View>
                </View>
              </SectionCard>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(500).delay(300)}>
              <SectionCard borderRadius="none" padding="xl">
                <Text style={styles.sectionTitle}>Fee Breakdown</Text>
                <FeeRow
                  label="Mint Amount"
                  value={`${musdMinted.toFixed(2)} mUSD`}
                  icon="plus-circle"
                />
                <FeeRow
                  label="Protocol Fee (1%)"
                  value={`${feeAmount.toFixed(2)} mUSD`}
                  icon="minus-circle"
                />
                <View style={styles.feeDivider} />
                <FeeRow
                  label="You Receive"
                  value={`${netMinted.toFixed(2)} mUSD`}
                  icon="check-circle"
                  bold
                />
              </SectionCard>
            </Animated.View>
          </>
        )}

        <Animated.View
          entering={FadeInUp.duration(500).delay(400)}
          style={styles.actionsSection}
        >
          <ActionButton
            variant="accent"
            fullWidth
            disabled={!isValid}
            loading={isLoading}
            onPress={handleConfirm}
          >
            {isLoading ? 'Minting...' : 'Confirm Mint'}
          </ActionButton>
          <ActionButton variant="secondary" fullWidth onPress={() => onNavigate('Home')}>
            Cancel
          </ActionButton>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Animated Counter Component
interface AnimatedCounterProps {
  value: number;
  decimals?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, decimals = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startValue = 0;
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      const current = startValue + (value - startValue) * eased;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <Text style={styles.resultAmount}>
      {displayValue.toFixed(decimals)}
    </Text>
  );
};

// Detail Row Component
interface DetailRowProps {
  label: string;
  value: string;
  icon?: string;
}

const DetailRow = React.memo<DetailRowProps>(({ label, value, icon }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailLeft}>
      {icon && <Feather name={icon as any} size={16} color={Colors.text.secondary} />}
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
));

DetailRow.displayName = 'DetailRow';

// Proof Box Component
const ProofBox = React.memo<{ label: string; value: string }>(({ label, value }) => (
  <View style={styles.proofRow}>
    <View style={styles.proofLeft}>
      <Feather name="shield" size={16} color={Colors.text.secondary} />
      <Text style={styles.proofLabel}>{label}</Text>
    </View>
    <TouchableOpacity style={styles.proofValue}>
      <Text style={styles.proofText}>
        {value.slice(0, 8)}...{value.slice(-6)}
      </Text>
      <Feather name="copy" size={14} color={Colors.text.tertiary} />
    </TouchableOpacity>
  </View>
));

ProofBox.displayName = 'ProofBox';

// Fee Row Component
interface FeeRowProps {
  label: string;
  value: string;
  icon?: string;
  bold?: boolean;
}

const FeeRow = React.memo<FeeRowProps>(({ label, value, icon, bold }) => (
  <View style={styles.feeRow}>
    <View style={styles.feeLeft}>
      {icon && (
        <Feather
          name={icon as any}
          size={16}
          color={bold ? Colors.text.primary : Colors.text.secondary}
        />
      )}
      <Text style={[styles.feeLabel, bold && styles.feeLabelBold]}>{label}</Text>
    </View>
    <Text style={[styles.feeValue, bold && styles.feeValueBold]}>{value}</Text>
  </View>
));

FeeRow.displayName = 'FeeRow';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.secondary,
  },
  contentContainer: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.xxxl,
  },
  header: {
    marginBottom: Spacing.xxxl,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.labelMedium,
    color: Colors.text.primary,
  },
  maxButton: {
    borderWidth: Borders.width.regular,
    borderColor: Colors.border.primary,
    paddingVertical: Spacing.xxs,
    paddingHorizontal: Spacing.sm,
  },
  maxButtonText: {
    ...Typography.label,
    color: Colors.text.primary,
  },
  largeInputContainer: {
    marginBottom: Spacing.md,
  },
  largeInput: {
    ...Typography.display.small,
    height: 80,
  },
  inputUnit: {
    ...Typography.h3,
    color: Colors.text.tertiary,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  balanceLabel: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  priceLabel: {
    ...Typography.bodySmallSemibold,
    color: Colors.text.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statLabel: {
    ...Typography.labelSmall,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  statValue: {
    ...Typography.h3,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  statUnit: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  sectionTitle: {
    ...Typography.labelMedium,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  ltvHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  ltvLabel: {
    ...Typography.bodySmallSemibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xxs,
  },
  ltvDescription: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  ltvValue: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  progressBarContainer: {
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.semantic.success,
  },
  ltvRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  rangeDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.circle,
  },
  rangeLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  feeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  feeLabel: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  feeLabelBold: {
    ...Typography.bodySemibold,
    color: Colors.text.primary,
  },
  feeValue: {
    ...Typography.bodySmallSemibold,
    color: Colors.text.primary,
  },
  feeValueBold: {
    ...Typography.h5,
    color: Colors.text.primary,
  },
  feeDivider: {
    height: Borders.width.thick,
    backgroundColor: Colors.border.primary,
    marginVertical: Spacing.md,
  },
  actionsSection: {
    gap: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  bottomSpacer: {
    height: 120,
  },
  successSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxxxl,
    paddingTop: Spacing.xxxxl + Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderWidth: Borders.width.bold,
    borderColor: Colors.semantic.success,
    backgroundColor: Colors.bg.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  successTitle: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  resultLabel: {
    ...Typography.labelMedium,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  resultAmount: {
    ...Typography.display.large,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  resultUnit: {
    ...Typography.h4,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailLabel: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  detailValue: {
    ...Typography.bodySmallSemibold,
    color: Colors.text.primary,
  },
  proofRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  proofLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  proofLabel: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  proofValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  proofText: {
    ...Typography.mono,
    color: Colors.text.primary,
  },
});
