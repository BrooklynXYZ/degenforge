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
  withSequence,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
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
  const [slippage, setSlippage] = useState(0.5);

  const swapIconRotation = useSharedValue(0);

  const exchangeRate = 0.000015;
  const swapFee = 0.003;
  const minSwapAmount = 1;

  const fromValue = parseFloat(fromAmount) || 0;
  const toValue = fromValue * exchangeRate;
  const feeAmount = fromValue * swapFee;
  const priceImpact = fromValue > 10000 ? 0.5 : 0.1;
  const minimumReceived = toValue * (1 - slippage / 100);

  const mockTxHash = '0x9f8c4a2b1e3d5f7a9c1b3e5f7a9c1b3e5f7a9c1b3e5f7a9c1b3e5f7a9c1b3e';

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
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsConfirmed(true);
  }, [fromAmount, validateAmount]);

  const handleMaxAmount = useCallback(() => {
    setFromAmount(fromToken.balance.toString());
    setTouched(true);
  }, [fromToken.balance]);

  const handleAmountChange = useCallback((value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
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
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Swap Successful
          </Animated.Text>
          <Animated.Text
            entering={FadeInUp.duration(500).delay(400)}
            style={[styles.successSubtitle, { color: themeColors.textSecondary }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            Your tokens have been swapped
          </Animated.Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(500)}>
          <PremiumResultCard
            value={toValue.toFixed(8)}
            unit={toToken.symbol}
            themeColors={themeColors}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(600)}>
          <SectionCard borderRadius="none" padding="xl">
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]} numberOfLines={1}>
              Swap Details
            </Text>
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
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]} numberOfLines={1}>
              Transaction Proof
            </Text>
            <TouchableOpacity style={styles.txHashContainer}>
              <Feather name="shield" size={16} color={themeColors.textSecondary} />
              <Text style={[styles.txHashLabel, { color: themeColors.textSecondary }]} numberOfLines={1}>
                TX Hash
              </Text>
              <View style={styles.txHashValue}>
                <Text style={[styles.txHashText, { color: themeColors.textPrimary }]} numberOfLines={1} ellipsizeMode="middle">
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
          <Text style={[styles.title, { color: themeColors.textPrimary }]} numberOfLines={1}>
            Swap Tokens
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]} numberOfLines={2}>
            Exchange tokens at the best rate
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <SectionCard borderRadius="none" padding="xl">
            <View style={styles.tokenHeader}>
              <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]} numberOfLines={1}>
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
                <Text style={[styles.tokenSymbol, { color: themeColors.textPrimary }]} numberOfLines={1}>
                  {fromToken.symbol}
                </Text>
              </View>
            </View>

            <View style={styles.balanceRow}>
              <Feather name="briefcase" size={14} color={themeColors.textSecondary} />
              <Text style={[styles.balanceLabel, { color: themeColors.textSecondary }]} numberOfLines={1}>
                Balance: {fromToken.balance.toLocaleString()} {fromToken.symbol}
              </Text>
            </View>
          </SectionCard>
        </Animated.View>

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

        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <SectionCard borderRadius="none" padding="xl">
            <Text style={[styles.inputLabel, { color: themeColors.textPrimary }]} numberOfLines={1}>
              To (estimated)
            </Text>

            <View style={styles.tokenInputRow}>
              <View style={styles.estimatedAmountContainer}>
                <Text style={[styles.estimatedAmount, { color: themeColors.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">
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
                <Text style={[styles.tokenSymbol, { color: themeColors.textPrimary }]} numberOfLines={1}>
                  {toToken.symbol}
                </Text>
              </View>
            </View>

            <View style={styles.balanceRow}>
              <Feather name="briefcase" size={14} color={themeColors.textSecondary} />
              <Text style={[styles.balanceLabel, { color: themeColors.textSecondary }]} numberOfLines={1}>
                Balance: {toToken.balance.toLocaleString()} {toToken.symbol}
              </Text>
            </View>
          </SectionCard>
        </Animated.View>

        {fromValue > 0 && isValid && (
          <>
            <Animated.View entering={FadeInDown.duration(500).delay(500)}>
              <SectionCard borderRadius="none" padding="xl">
                <View style={styles.rateRow}>
                  <View style={styles.rateLeft}>
                    <Feather name="refresh-cw" size={16} color={themeColors.textSecondary} />
                    <Text style={[styles.rateLabel, { color: themeColors.textSecondary }]} numberOfLines={1}>
                      Exchange Rate
                    </Text>
                  </View>
                  <Text style={[styles.rateValue, { color: themeColors.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">
                    1 {fromToken.symbol} = {exchangeRate.toFixed(8)} {toToken.symbol}
                  </Text>
                </View>
              </SectionCard>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(500).delay(600)}>
              <SectionCard borderRadius="none" padding="xl">
                <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]} numberOfLines={1}>
                  Swap Details
                </Text>
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

const PremiumResultCard: React.FC<{
  value: string;
  unit: string;
  themeColors: ReturnType<typeof useTheme>['colors'];
}> = ({ value, unit, themeColors }) => {
  const shimmerTranslateX = useSharedValue(-300);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    shimmerTranslateX.value = withRepeat(
      withTiming(300, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );

    scale.value = withSpring(1, { damping: 15, stiffness: 100 });
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslateX.value }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={cardStyle}>
      <View
        style={[
          styles.premiumCard,
          {
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
          },
        ]}
      >
        <View style={styles.shimmerContainer}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>

        <Text style={[styles.premiumLabel, { color: themeColors.textSecondary }]} numberOfLines={1}>
          You Received
        </Text>

        <Text
          style={[styles.premiumAmount, { color: themeColors.textPrimary }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </Text>

        <View style={styles.unitContainer}>
          <View style={[styles.unitBadge, { borderColor: Colors.accent.primary }]}>
            <Text style={[styles.premiumUnit, { color: Colors.accent.primary }]} numberOfLines={1}>
              {unit}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

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
      <Text style={[styles.detailLabel, { color: themeColors.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
    <Text style={[styles.detailValue, { color: themeColors.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">
      {value}
    </Text>
  </View>
));

DetailRow.displayName = 'DetailRow';

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
      ]} numberOfLines={1}>{label}</Text>
    </View>
    <Text style={[
      styles.feeValue,
      bold && styles.feeValueBold,
      { color: warning ? Colors.semantic.warning : themeColors.textPrimary }
    ]} numberOfLines={1} ellipsizeMode="tail">{value}</Text>
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
    flexShrink: 1,
  },
  balanceLabel: {
    ...Typography.bodySmall,
    flexShrink: 1,
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
    gap: Spacing.md,
  },
  rateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexShrink: 1,
  },
  rateLabel: {
    ...Typography.bodySmall,
    flexShrink: 1,
  },
  rateValue: {
    ...Typography.bodySmallSemibold,
    flexShrink: 1,
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
    gap: Spacing.md,
  },
  feeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  feeLabel: {
    ...Typography.bodySmall,
    flexShrink: 1,
  },
  feeLabelBold: {
    ...Typography.bodySemibold,
  },
  feeValue: {
    ...Typography.bodySmallSemibold,
    flexShrink: 1,
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
  premiumCard: {
    borderWidth: 2,
    paddingVertical: Spacing.xxxxl,
    paddingHorizontal: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ skewX: '-20deg' }],
  },
  premiumLabel: {
    ...Typography.labelMedium,
    marginBottom: Spacing.lg,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '600',
  },
  premiumAmount: {
    fontSize: 56,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontFamily: 'SpaceGrotesk_700Bold',
    letterSpacing: -2,
    lineHeight: 64,
  },
  unitContainer: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  unitBadge: {
    borderWidth: 2,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(234, 193, 25, 0.05)',
  },
  premiumUnit: {
    ...Typography.h4,
    fontWeight: '700',
    letterSpacing: 1,
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
    gap: Spacing.md,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  detailLabel: {
    ...Typography.bodySmall,
    flexShrink: 1,
  },
  detailValue: {
    ...Typography.bodySmallSemibold,
    flexShrink: 1,
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
    flexShrink: 1,
  },
});
