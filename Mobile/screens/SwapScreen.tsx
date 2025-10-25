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
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Layout,
  Borders,
} from '@/constants/designTokens';
import { ActionButton } from '@/components/ui/ActionButton';
import { SectionCard } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/contexts/ThemeContext';

interface SwapScreenProps {
  onNavigate: (screen: string) => void;
}

type Token = {
  symbol: string;
  name: string;
  balance: number;
  icon: string;
};

const TOKENS: Token[] = [
  { symbol: 'mUSD', name: 'Mezo USD', balance: 25000, icon: 'dollar-sign' },
  { symbol: 'BTC', name: 'Bitcoin', balance: 0.5, icon: 'circle' },
  { symbol: 'ETH', name: 'Ethereum', balance: 2.3, icon: 'hexagon' },
  { symbol: 'SOL', name: 'Solana', balance: 50, icon: 'zap' },
];

export const SwapScreen: React.FC<SwapScreenProps> = ({ onNavigate }) => {
  const { colors: themeColors } = useTheme();
  const [fromToken, setFromToken] = useState<Token>(TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [slippage, setSlippage] = useState(0.5); // 0.5%

  const swapIconRotation = useSharedValue(0);

  // Mock exchange rates (fromToken to toToken)
  const exchangeRate = 0.000015; // Example: 1 mUSD = 0.000015 BTC
  const swapFee = 0.003; // 0.3%
  const minSwapAmount = 1;

  const fromValue = parseFloat(fromAmount) || 0;
  const toValue = fromValue * exchangeRate;
  const feeAmount = fromValue * swapFee;
  const priceImpact = fromValue > 10000 ? 0.5 : 0.1; // Simplified price impact
  const minimumReceived = toValue * (1 - slippage / 100);

  const mockTxHash = '0x9f8c4a2b1e3d5f7a9c1b3e5f7a9c1b3e5f7a9c1b3e5f7a9c1b3e5f7a9c1b3e';

  // Validation
  const validateAmount = useCallback((value: string) => {
    const numValue = parseFloat(value);

    if (!value || numValue === 0) {
      return '';
    }

    if (isNaN(numValue)) {
      return 'Please enter a valid number';
    }

    if (numValue < minSwapAmount) {
      return `Minimum amount is ${minSwapAmount} ${fromToken.symbol}`;
    }

    if (numValue > fromToken.balance) {
      return 'Insufficient balance';
    }

    return '';
  }, [fromToken, minSwapAmount]);

  useEffect(() => {
    if (touched) {
      setError(validateAmount(fromAmount));
    }
  }, [fromAmount, touched, validateAmount]);

  const handleConfirm = useCallback(async () => {
    const validationError = validateAmount(fromAmount);
    if (validationError) {
      setError(validationError);
      setTouched(true);
      return;
    }

    setIsLoading(true);

    // Simulate swapping
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsConfirmed(true);
  }, [fromAmount, validateAmount]);

  const handleMaxAmount = useCallback(() => {
    setFromAmount(fromToken.balance.toString());
    setTouched(true);
  }, [fromToken.balance]);

  const handleAmountChange = useCallback((value: string) => {
    // Only allow numbers and decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    // Only allow one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) return;

    setFromAmount(cleaned);
  }, []);

  const handleSwapTokens = useCallback(() => {
    swapIconRotation.value = withSpring(swapIconRotation.value + 180);
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
    setTouched(false);
    setError('');
  }, [fromToken, toToken, swapIconRotation]);

  const swapIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${swapIconRotation.value}deg` }],
  }));

  const isValid = fromValue > 0 && !error && fromValue >= minSwapAmount && fromValue <= fromToken.balance;

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
            Swap Successful
          </Animated.Text>
          <Animated.Text
            entering={FadeInUp.duration(500).delay(400)}
            style={[styles.successSubtitle, { color: themeColors.textSecondary }]}
          >
            Your tokens have been swapped
          </Animated.Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(500)}>
          <SectionCard borderRadius="none" padding="xxxl">
            <Text style={[styles.resultLabel, { color: themeColors.textSecondary }]}>You Received</Text>
            <Text style={[styles.resultAmount, { color: themeColors.textPrimary }]}>
              {toValue.toFixed(8)}
            </Text>
            <Text style={[styles.resultUnit, { color: themeColors.textTertiary }]}>{toToken.symbol}</Text>
          </SectionCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(600)}>
          <SectionCard borderRadius="none" padding="xl">
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Swap Details</Text>
            <DetailRow
              label="From Amount"
              value={`${fromValue.toFixed(2)} ${fromToken.symbol}`}
              icon="arrow-up"
              themeColors={themeColors}
            />
            <DetailRow
              label="To Amount"
              value={`${toValue.toFixed(8)} ${toToken.symbol}`}
              icon="arrow-down"
              themeColors={themeColors}
            />
            <DetailRow
              label="Exchange Rate"
              value={`1 ${fromToken.symbol} = ${exchangeRate.toFixed(8)} ${toToken.symbol}`}
              icon="refresh-cw"
              themeColors={themeColors}
            />
            <DetailRow
              label="Swap Fee"
              value={`${feeAmount.toFixed(2)} ${fromToken.symbol}`}
              icon="percent"
              themeColors={themeColors}
            />
          </SectionCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(700)}>
          <SectionCard borderRadius="none" padding="xl">
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Transaction Proof</Text>
            <TouchableOpacity style={styles.txHashContainer}>
              <Feather name="shield" size={16} color={themeColors.textSecondary} />
              <Text style={[styles.txHashLabel, { color: themeColors.textSecondary }]}>TX Hash</Text>
              <View style={styles.txHashValue}>
                <Text style={[styles.txHashText, { color: themeColors.textPrimary }]}>
                  {mockTxHash.slice(0, 10)}...{mockTxHash.slice(-8)}
                </Text>
                <Feather name="copy" size={14} color={themeColors.textTertiary} />
              </View>
            </TouchableOpacity>
          </SectionCard>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(600).delay(800)}
          style={styles.actionsSection}
        >
          <ActionButton variant="accent" fullWidth onPress={() => onNavigate('Activity')}>
            View in Activity
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
            Swap Tokens
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Exchange tokens at the best rate
          </Text>
        </Animated.View>

        {/* From Token */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <SectionCard borderRadius="none" padding="xl">
            <View style={styles.tokenHeader}>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>
                From
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

            <View style={styles.tokenInputRow}>
              <Input
                value={fromAmount}
                onChangeText={handleAmountChange}
                placeholder="0.00"
                keyboardType="decimal-pad"
                error={touched ? error : undefined}
                onBlur={() => setTouched(true)}
                style={styles.tokenInput}
                variant="filled"
              />
              <View
                style={[
                  styles.tokenSelector,
                  {
                    backgroundColor: themeColors.surfaceSecondary,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Feather name={fromToken.icon as any} size={20} color={themeColors.textPrimary} />
                <Text style={[styles.tokenSymbol, { color: themeColors.textPrimary }]}>
                  {fromToken.symbol}
                </Text>
              </View>
            </View>

            <View style={styles.balanceRow}>
              <Feather name="briefcase" size={14} color={themeColors.textSecondary} />
              <Text style={[styles.balanceLabel, { color: themeColors.textSecondary }]}>
                Balance: {fromToken.balance.toLocaleString()} {fromToken.symbol}
              </Text>
            </View>
          </SectionCard>
        </Animated.View>

        {/* Swap Button */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(300)}
          style={styles.swapButtonContainer}
        >
          <TouchableOpacity
            onPress={handleSwapTokens}
            style={[
              styles.swapButton,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              },
            ]}
          >
            <Animated.View style={swapIconStyle}>
              <Feather name="repeat" size={24} color={themeColors.textPrimary} />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        {/* To Token */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <SectionCard borderRadius="none" padding="xl">
            <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]}>
              To (estimated)
            </Text>

            <View style={styles.tokenInputRow}>
              <View style={styles.estimatedAmountContainer}>
                <Text style={[styles.estimatedAmount, { color: themeColors.textPrimary }]}>
                  {fromValue > 0 ? toValue.toFixed(8) : '0.00'}
                </Text>
              </View>
              <View
                style={[
                  styles.tokenSelector,
                  {
                    backgroundColor: themeColors.surfaceSecondary,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Feather name={toToken.icon as any} size={20} color={themeColors.textPrimary} />
                <Text style={[styles.tokenSymbol, { color: themeColors.textPrimary }]}>
                  {toToken.symbol}
                </Text>
              </View>
            </View>

            <View style={styles.balanceRow}>
              <Feather name="briefcase" size={14} color={themeColors.textSecondary} />
              <Text style={[styles.balanceLabel, { color: themeColors.textSecondary }]}>
                Balance: {toToken.balance.toLocaleString()} {toToken.symbol}
              </Text>
            </View>
          </SectionCard>
        </Animated.View>

        {fromValue > 0 && isValid && (
          <>
            {/* Exchange Rate */}
            <Animated.View entering={FadeInDown.duration(500).delay(500)}>
              <SectionCard borderRadius="none" padding="xl">
                <View style={styles.rateRow}>
                  <View style={styles.rateLeft}>
                    <Feather name="refresh-cw" size={16} color={themeColors.textSecondary} />
                    <Text style={[styles.rateLabel, { color: themeColors.textSecondary }]}>
                      Exchange Rate
                    </Text>
                  </View>
                  <Text style={[styles.rateValue, { color: themeColors.textPrimary }]}>
                    1 {fromToken.symbol} = {exchangeRate.toFixed(8)} {toToken.symbol}
                  </Text>
                </View>
              </SectionCard>
            </Animated.View>

            {/* Swap Details */}
            <Animated.View entering={FadeInDown.duration(500).delay(600)}>
              <SectionCard borderRadius="none" padding="xl">
                <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>Swap Details</Text>
                <FeeRow
                  label="Price Impact"
                  value={`${priceImpact.toFixed(2)}%`}
                  icon="trending-down"
                  themeColors={themeColors}
                  warning={priceImpact > 1}
                />
                <FeeRow
                  label="Swap Fee (0.3%)"
                  value={`${feeAmount.toFixed(2)} ${fromToken.symbol}`}
                  icon="percent"
                  themeColors={themeColors}
                />
                <FeeRow
                  label="Slippage Tolerance"
                  value={`${slippage}%`}
                  icon="alert-circle"
                  themeColors={themeColors}
                />
                <View style={[styles.feeDivider, { backgroundColor: themeColors.border }]} />
                <FeeRow
                  label="Minimum Received"
                  value={`${minimumReceived.toFixed(8)} ${toToken.symbol}`}
                  icon="check-circle"
                  bold
                  themeColors={themeColors}
                />
              </SectionCard>
            </Animated.View>
          </>
        )}

        <Animated.View
          entering={FadeInUp.duration(500).delay(700)}
          style={styles.actionsSection}
        >
          <ActionButton
            variant="accent"
            fullWidth
            disabled={!isValid}
            loading={isLoading}
            onPress={handleConfirm}
          >
            {isLoading ? 'Swapping...' : 'Confirm Swap'}
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

// Fee Row Component
interface FeeRowProps {
  label: string;
  value: string;
  icon?: string;
  bold?: boolean;
  warning?: boolean;
  themeColors: ReturnType<typeof useTheme>['colors'];
}

const FeeRow = React.memo<FeeRowProps>(({ label, value, icon, bold, warning, themeColors }) => (
  <View style={styles.feeRow}>
    <View style={styles.feeLeft}>
      {icon && (
        <Feather
          name={icon as any}
          size={16}
          color={warning ? Colors.semantic.warning : bold ? themeColors.textPrimary : themeColors.textSecondary}
        />
      )}
      <Text style={[
        styles.feeLabel,
        bold && styles.feeLabelBold,
        { color: warning ? Colors.semantic.warning : bold ? themeColors.textPrimary : themeColors.textSecondary }
      ]}>{label}</Text>
    </View>
    <Text style={[
      styles.feeValue,
      bold && styles.feeValueBold,
      { color: warning ? Colors.semantic.warning : themeColors.textPrimary }
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
  tokenHeader: {
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
  tokenInputRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  tokenInput: {
    flex: 1,
    ...Typography.h3,
  },
  tokenSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: Borders.width.regular,
    borderRadius: BorderRadius.md,
  },
  tokenSymbol: {
    ...Typography.bodySemibold,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  balanceLabel: {
    ...Typography.bodySmall,
  },
  swapButtonContainer: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  swapButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.circle,
    borderWidth: Borders.width.thick,
    justifyContent: 'center',
    alignItems: 'center',
  },
  estimatedAmountContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  estimatedAmount: {
    ...Typography.h3,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  rateLabel: {
    ...Typography.bodySmall,
  },
  rateValue: {
    ...Typography.bodySmallSemibold,
  },
  sectionTitle: {
    ...Typography.labelMedium,
    marginBottom: Spacing.md,
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
  txHashContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  txHashLabel: {
    ...Typography.bodySmall,
  },
  txHashValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
    justifyContent: 'flex-end',
  },
  txHashText: {
    ...Typography.mono,
  },
});
