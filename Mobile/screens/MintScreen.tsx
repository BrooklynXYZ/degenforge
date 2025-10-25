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
import { useTheme } from '@/contexts/ThemeContext';

interface MintScreenProps {
  onNavigate: (screen: string) => void;
}

export const MintScreen: React.FC<MintScreenProps> = ({ onNavigate }) => {
  const { colors: themeColors } = useTheme();
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
      <ScrollView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <Animated.View
          entering={FadeInDown.duration(600).delay(100)}
          style={styles.successSection}
        >
          <Animated.View
            entering={FadeInUp.duration(500).delay(200)}
            style={[styles.successIcon, { backgroundColor: themeColors.surfaceSecondary }]}
          >
            <Feather name="check" size={64} color={Colors.semantic.success} />
          </Animated.View>
          <Animated.Text
            entering={FadeInUp.duration(500).delay(300)}
            style={[styles.successTitle, { color: themeColors.textPrimary }]}
          >
            Mint Successful
          </Animated.Text>
          <Animated.Text
            entering={FadeInUp.duration(500).delay(400)}
            style={[styles.successSubtitle, { color: themeColors.textSecondary }]}
          >
            Your mUSD has been minted on Mezo
          </Animated.Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(600).delay(500)}
        >
          <SectionCard borderRadius="none" padding="xxxl">
            <Text style={[styles.resultLabel, { color: themeColors.textSecondary }]}>You Received</Text>
            <AnimatedCounter value={netMinted} decimals={2} themeColors={themeColors} />
            <Text style={[styles.resultUnit, { color: themeColors.textTertiary }]}>mUSD</Text>
          </SectionCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(600)}>
          <SectionCard borderRadius="none" padding="xl">
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Transaction Details</Text>
            <DetailRow
              label="Amount Minted"
              value={`${netMinted.toFixed(2)} mUSD`}
              icon="check-circle"
              themeColors={themeColors}
            />
            <DetailRow
              label="Fee"
              value={`${feeAmount.toFixed(2)} mUSD`}
              icon="info"
              themeColors={themeColors}
            />
            <DetailRow
              label="BTC Collateral"
              value={`${btcAmount} BTC`}
              icon="lock"
              themeColors={themeColors}
            />
          </SectionCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(700)}>
          <SectionCard borderRadius="none" padding="xl">
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Mezo Proof</Text>
            <ProofBox label="Mint TX Hash" value={mockMintTxHash} themeColors={themeColors} />
            <ProofBox label="Vault ID" value={mockVaultId} themeColors={themeColors} />
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.header}>
          <Text style={[styles.title, { color: themeColors.textPrimary }]}>
            Mint mUSD
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Deposit BTC collateral to mint stablecoin
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <SectionCard borderRadius="none" padding="xl">
            <View style={styles.inputHeader}>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>
                Amount
              </Text>
              <TouchableOpacity
                onPress={handleMaxAmount}
                style={[
                  styles.maxButton,
                  {
                    backgroundColor: themeColors.surfaceSecondary,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Text style={[styles.maxButtonText, { color: themeColors.textPrimary }]}>
                  MAX
                </Text>
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
                  <Text style={[styles.inputUnit, { color: themeColors.textSecondary }]}>
                    BTC
                  </Text>
                }
              />
            </View>

            <View style={styles.balanceRow}>
              <View style={styles.balanceItem}>
                <Feather name="briefcase" size={14} color={themeColors.textSecondary} />
                <Text style={[styles.balanceLabel, { color: themeColors.textSecondary }]}>
                  Balance: {walletBalance} BTC
                </Text>
              </View>
              <View style={styles.balanceItem}>
                <Feather name="trending-up" size={14} color={themeColors.textSecondary} />
                <Text style={[styles.priceLabel, { color: themeColors.textSecondary }]}>
                  ${btcPrice.toLocaleString()}
                </Text>
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
                <Feather name="dollar-sign" size={20} color={themeColors.textSecondary} />
                <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                  USD Value
                </Text>
                <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>
                  ${usdValue.toLocaleString()}
                </Text>
              </SectionCard>
              <SectionCard borderRadius="none" padding="lg" style={styles.statBox}>
                <Feather name="arrow-down-circle" size={20} color={Colors.accent.primary} />
                <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                  You Receive
                </Text>
                <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>
                  {netMinted.toFixed(2)}
                </Text>
                <Text style={[styles.statUnit, { color: themeColors.textTertiary }]}>
                  mUSD
                </Text>
              </SectionCard>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(500).delay(200)}>
              <SectionCard borderRadius="none" padding="xl">
                <View style={styles.ltvHeader}>
                  <View>
                    <Text style={[styles.ltvLabel, { color: themeColors.textPrimary }]}>
                      Loan-to-Value Ratio
                    </Text>
                    <Text style={[styles.ltvDescription, { color: themeColors.textSecondary }]}>
                      Safe collateralization
                    </Text>
                  </View>
                  <Text style={[styles.ltvValue, { color: themeColors.textPrimary }]}>
                    {(ltvRatio * 100).toFixed(0)}%
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <Animated.View
                    entering={SlideInRight.duration(600).delay(400)}
                    style={[styles.progressBar, { backgroundColor: themeColors.surfaceSecondary }]}
                  >
                    <Animated.View
                      style={[styles.progressFill, { width: `${ltvRatio * 100}%` }]}
                    />
                  </Animated.View>
                </View>
                <View style={styles.ltvRange}>
                  <View style={styles.rangeItem}>
                    <View style={[styles.rangeDot, { backgroundColor: Colors.semantic.success }]} />
                    <Text style={[styles.rangeLabel, { color: themeColors.textSecondary }]}>Safe</Text>
                  </View>
                  <View style={styles.rangeItem}>
                    <View style={[styles.rangeDot, { backgroundColor: Colors.semantic.error }]} />
                    <Text style={[styles.rangeLabel, { color: themeColors.textSecondary }]}>Risky</Text>
                  </View>
                </View>
              </SectionCard>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(500).delay(300)}>
              <SectionCard borderRadius="none" padding="xl">
                <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Fee Breakdown</Text>
                <FeeRow
                  label="Mint Amount"
                  value={`${musdMinted.toFixed(2)} mUSD`}
                  icon="plus-circle"
                  themeColors={themeColors}
                />
                <FeeRow
                  label="Protocol Fee (1%)"
                  value={`${feeAmount.toFixed(2)} mUSD`}
                  icon="minus-circle"
                  themeColors={themeColors}
                />
                <View style={[styles.feeDivider, { backgroundColor: themeColors.border }]} />
                <FeeRow
                  label="You Receive"
                  value={`${netMinted.toFixed(2)} mUSD`}
                  icon="check-circle"
                  bold
                  themeColors={themeColors}
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
  themeColors: ReturnType<typeof useTheme>['colors'];
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, decimals = 0, themeColors }) => {
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
    <Text style={[styles.resultAmount, { color: themeColors.textPrimary }]}>
      {displayValue.toFixed(decimals)}
    </Text>
  );
};

// Detail Row Component
interface DetailRowProps {
  label: string;
  value: string;
  icon?: string;
  themeColors: ReturnType<typeof useTheme>['colors'];
}

const DetailRow = React.memo<DetailRowProps>(({ label, value, icon, themeColors }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailLeft}>
      {icon && <Feather name={icon as any} size={16} color={themeColors.textSecondary} />}
      <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]}>{label}</Text>
    </View>
    <Text style={[styles.detailValue, { color: themeColors.textPrimary }]}>{value}</Text>
  </View>
));

DetailRow.displayName = 'DetailRow';

// Proof Box Component
interface ProofBoxProps {
  label: string;
  value: string;
  themeColors: ReturnType<typeof useTheme>['colors'];
}

const ProofBox = React.memo<ProofBoxProps>(({ label, value, themeColors }) => (
  <View style={styles.proofRow}>
    <View style={styles.proofLeft}>
      <Feather name="shield" size={16} color={themeColors.textSecondary} />
      <Text style={[styles.proofLabel, { color: themeColors.textSecondary }]}>{label}</Text>
    </View>
    <TouchableOpacity style={styles.proofValue}>
      <Text style={[styles.proofText, { color: themeColors.textPrimary }]}>
        {value.slice(0, 8)}...{value.slice(-6)}
      </Text>
      <Feather name="copy" size={14} color={themeColors.textTertiary} />
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
  themeColors: ReturnType<typeof useTheme>['colors'];
}

const FeeRow = React.memo<FeeRowProps>(({ label, value, icon, bold, themeColors }) => (
  <View style={styles.feeRow}>
    <View style={styles.feeLeft}>
      {icon && (
        <Feather
          name={icon as any}
          size={16}
          color={bold ? themeColors.textPrimary : themeColors.textSecondary}
        />
      )}
      <Text style={[
        styles.feeLabel,
        bold && styles.feeLabelBold,
        { color: bold ? themeColors.textPrimary : themeColors.textSecondary }
      ]}>{label}</Text>
    </View>
    <Text style={[
      styles.feeValue,
      bold && styles.feeValueBold,
      { color: themeColors.textPrimary }
    ]}>{value}</Text>
  </View>
));

FeeRow.displayName = 'FeeRow';

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.labelMedium,
  },
  maxButton: {
    borderWidth: Borders.width.regular,
    paddingVertical: Spacing.xxs,
    paddingHorizontal: Spacing.sm,
  },
  maxButtonText: {
    ...Typography.label,
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
  },
  priceLabel: {
    ...Typography.bodySmallSemibold,
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
    textAlign: 'center',
  },
  statValue: {
    ...Typography.h3,
    textAlign: 'center',
  },
  statUnit: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
  sectionTitle: {
    ...Typography.labelMedium,
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
    marginBottom: Spacing.xxs,
  },
  ltvDescription: {
    ...Typography.caption,
  },
  ltvValue: {
    ...Typography.h2,
  },
  progressBarContainer: {
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: 8,
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
  },
  feeLabelBold: {
    ...Typography.bodySemibold,
  },
  feeValue: {
    ...Typography.bodySmallSemibold,
  },
  feeValueBold: {
    ...Typography.h5,
  },
  feeDivider: {
    height: Borders.width.thick,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  successTitle: {
    ...Typography.h1,
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    ...Typography.body,
    textAlign: 'center',
  },
  resultLabel: {
    ...Typography.labelMedium,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  resultAmount: {
    ...Typography.display.large,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  resultUnit: {
    ...Typography.h4,
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
  },
  detailValue: {
    ...Typography.bodySmallSemibold,
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
  },
  proofValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  proofText: {
    ...Typography.mono,
  },
});
