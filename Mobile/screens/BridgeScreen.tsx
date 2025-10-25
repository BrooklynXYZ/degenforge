import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  Easing,
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
import { SectionCard, InteractiveCard } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useTheme } from '@/contexts/ThemeContext';

interface BridgeScreenProps {
  onNavigate: (screen: string) => void;
}

type StepStatus = 'pending' | 'in_progress' | 'confirmed' | 'failed';

interface BridgeStep {
  id: number;
  label: string;
  description: string;
  txHash?: string;
  confirmations?: number;
  status: StepStatus;
  icon: string;
}

export const BridgeScreen: React.FC<BridgeScreenProps> = ({ onNavigate }) => {
  const { colors: themeColors } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [steps, setSteps] = useState<BridgeStep[]>([
    {
      id: 0,
      label: 'Mint on Mezo',
      description: 'BTC collateral locked, mUSD minted',
      txHash: '0x9f8c4a2b1e3d5f7a9c1b3e5f7a9c1b3e',
      confirmations: 12,
      status: 'confirmed',
      icon: 'check-circle',
    },
    {
      id: 1,
      label: 'Wrap on Solana',
      description: 'mUSD bridged to Solana network',
      txHash: 'Ey7Ck3Tz9mK2pL5qR8sT1uV4wX7yZ0aB1cD4eF5gH6iJ',
      confirmations: 8,
      status: 'in_progress',
      icon: 'loader',
    },
    {
      id: 2,
      label: 'Deposit to Pool',
      description: 'Wrapped mUSD deposited to earn yield',
      status: 'pending',
      icon: 'circle',
    },
  ]);

  const poolData = {
    poolName: 'Marinade Finance',
    apy: 8.5,
    tvl: 1250000000,
    logo: '🌊',
    risk: 'Low' as const,
  };

  const bridgeAmount = 25000; // mUSD

  useEffect(() => {
    // Simulate automatic progression
    if (currentStep === 0 && steps[0].status === 'confirmed') {
      // Auto-advance to wrapping step
      setTimeout(() => {
        setCurrentStep(1);
      }, 1000);
    }
  }, [steps]);

  const handleContinue = async () => {
    if (currentStep >= steps.length - 1) return;

    setIsProcessing(true);

    // Simulate step completion
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Update current step to confirmed
    setSteps((prev) =>
      prev.map((step, idx) =>
        idx === currentStep
          ? { ...step, status: 'confirmed', txHash: step.txHash || `0x${Math.random().toString(16).slice(2)}` }
          : step
      )
    );

    // Move to next step
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setSteps((prev) =>
        prev.map((step, idx) =>
          idx === currentStep + 1 ? { ...step, status: 'in_progress' } : step
        )
      );
    }

    setIsProcessing(false);
  };

  const isComplete = steps.every((s) => s.status === 'confirmed');
  const progressPercentage = ((steps.filter((s) => s.status === 'confirmed').length) / steps.length) * 100;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>
              Bridge to Solana
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              Wrap {bridgeAmount.toLocaleString()} mUSD and earn yield
            </Text>
          </View>
          {isComplete && (
            <Animated.View entering={FadeIn.duration(500)}>
              <Feather name="check-circle" size={32} color={Colors.semantic.success} />
            </Animated.View>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: themeColors.surfaceSecondary }]}>
            <Animated.View
              entering={SlideInRight.duration(800).delay(200)}
              style={[styles.progressFill, { width: `${progressPercentage}%` }]}
            />
          </View>
          <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>
            {Math.round(progressPercentage)}% Complete
          </Text>
        </View>
      </Animated.View>

      {/* Bridge Steps */}
      <Animated.View
        entering={FadeInDown.duration(500).delay(200)}
        style={styles.section}
      >
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          Bridge Progress
        </Text>
        {steps.map((step, index) => (
          <AnimatedStepCard
            key={step.id}
            step={step}
            index={index}
            isActive={currentStep === index}
            delay={300 + index * 100}
            themeColors={themeColors}
          />
        ))}
      </Animated.View>

      {/* Target Pool */}
      <Animated.View
        entering={FadeInDown.duration(500).delay(400)}
        style={styles.section}
      >
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          Target Yield Pool
        </Text>
        <InteractiveCard
          borderRadius="none"
          padding="xl"
          onPress={() => onNavigate('PoolDetail')}
        >
          <View style={styles.poolHeader}>
            <View
              style={[
                styles.poolIconContainer,
                {
                  backgroundColor: themeColors.surfaceSecondary,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <Text style={styles.poolIcon}>{poolData.logo}</Text>
            </View>
            <View style={styles.poolInfo}>
              <Text style={[styles.poolName, { color: themeColors.textPrimary }]}>
                {poolData.poolName}
              </Text>
              <View style={styles.poolMetaRow}>
                <StatusBadge status="success" label={`${poolData.risk} Risk`} size="sm" showDot={false} />
                <Text style={[styles.poolTvl, { color: themeColors.textTertiary }]}>
                  TVL: ${(poolData.tvl / 1000000000).toFixed(2)}B
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.poolApyContainer}>
            <Text style={styles.poolApyLabel}>Annual Yield</Text>
            <Text style={styles.poolApyValue}>{poolData.apy}%</Text>
          </View>

          <View style={styles.poolEstimate}>
            <Feather name="trending-up" size={16} color={Colors.semantic.success} />
            <Text style={[styles.poolEstimateText, { color: themeColors.textSecondary }]}>
              Estimated: ${((bridgeAmount * poolData.apy) / 100).toLocaleString()}/year
            </Text>
          </View>
        </InteractiveCard>
      </Animated.View>

      {/* Bridge Details */}
      <Animated.View
        entering={FadeInDown.duration(500).delay(500)}
        style={styles.section}
      >
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          Bridge Details
        </Text>
        <SectionCard borderRadius="none" padding="xl">
          <DetailRow label="Amount" value={`${bridgeAmount.toLocaleString()} mUSD`} icon="dollar-sign" />
          <DetailRow label="From" value="Mezo Network" icon="hexagon" />
          <DetailRow label="To" value="Solana" icon="zap" />
          <DetailRow label="Bridge Fee" value="0.5%" icon="percent" />
          <DetailRow label="Estimated Time" value="~5 minutes" icon="clock" />
        </SectionCard>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View
        entering={FadeInUp.duration(500).delay(600)}
        style={styles.actionsSection}
      >
        {!isComplete ? (
          <ActionButton
            variant="accent"
            fullWidth
            loading={isProcessing}
            onPress={handleContinue}
            disabled={steps[currentStep]?.status === 'confirmed'}
          >
            {isProcessing
              ? `Processing Step ${currentStep + 1}...`
              : currentStep === steps.length - 1
              ? 'Deposit to Pool'
              : 'Continue Bridge'}
          </ActionButton>
        ) : (
          <ActionButton
            variant="accent"
            fullWidth
            onPress={() => onNavigate('Activity')}
            icon={<Feather name="check-circle" size={20} color={Colors.text.inverse} />}
          >
            View Transaction
          </ActionButton>
        )}
        <ActionButton variant="secondary" fullWidth onPress={() => onNavigate('Home')}>
          {isComplete ? 'Back to Home' : 'Cancel'}
        </ActionButton>
      </Animated.View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

// Animated Step Card Component
interface AnimatedStepCardProps {
  step: BridgeStep;
  index: number;
  isActive: boolean;
  delay: number;
  themeColors: ReturnType<typeof useTheme>['colors'];
}

const AnimatedStepCard: React.FC<AnimatedStepCardProps> = ({
  step,
  index,
  isActive,
  delay,
  themeColors,
}) => {
  const scale = useSharedValue(isActive ? 1.02 : 1);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1.02 : 1);
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getStatusColor = () => {
    switch (step.status) {
      case 'confirmed':
        return Colors.semantic.success;
      case 'in_progress':
        return Colors.accent.primary;
      case 'failed':
        return Colors.semantic.error;
      default:
        return themeColors.textTertiary;
    }
  };

  const getStatusIcon = () => {
    switch (step.status) {
      case 'confirmed':
        return 'check-circle';
      case 'in_progress':
        return 'loader';
      case 'failed':
        return 'x-circle';
      default:
        return 'circle';
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(delay)}
      style={animatedStyle}
    >
      <SectionCard
        borderRadius="none"
        padding="lg"
        style={[
          styles.stepCard,
          isActive && styles.stepCardActive,
        ]}
      >
        <View style={styles.stepRow}>
          <View style={styles.stepLeft}>
            <View
              style={[
                styles.stepIconContainer,
                { borderColor: getStatusColor() },
                step.status === 'confirmed' && { backgroundColor: getStatusColor() },
              ]}
            >
              <Feather
                name={getStatusIcon() as any}
                size={20}
                color={step.status === 'confirmed' ? Colors.text.inverse : getStatusColor()}
              />
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepLabel, { color: themeColors.textPrimary }]}>
                {step.label}
              </Text>
              <Text style={[styles.stepDescription, { color: themeColors.textSecondary }]}>
                {step.description}
              </Text>
              {step.txHash && (
                <TouchableOpacity style={styles.txHashRow}>
                  <Text style={[styles.txHash, { color: themeColors.textTertiary }]}>
                    {step.txHash.slice(0, 8)}...{step.txHash.slice(-6)}
                  </Text>
                  <Feather name="external-link" size={12} color={themeColors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <StatusBadge status={step.status} size="sm" />
        </View>
      </SectionCard>
    </Animated.View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  contentContainer: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.xxxl,
  },
  header: {
    marginBottom: Spacing.xxl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
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
  progressContainer: {
    gap: Spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent.primary,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: 'right',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.labelMedium,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  stepCard: {
    marginBottom: Spacing.sm,
  },
  stepCardActive: {
    borderColor: Colors.accent.primary,
    borderWidth: Borders.width.thick,
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    flex: 1,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.circle,
    borderWidth: Borders.width.thick,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContent: {
    flex: 1,
    gap: Spacing.xxs,
  },
  stepLabel: {
    ...Typography.bodySemibold,
    color: Colors.text.primary,
  },
  stepDescription: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  txHashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
    marginTop: Spacing.xxs,
  },
  txHash: {
    ...Typography.mono,
    color: Colors.text.tertiary,
    fontSize: 11,
  },
  poolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  poolIconContainer: {
    width: 56,
    height: 56,
    borderWidth: Borders.width.thick,
    borderColor: Colors.border.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg.secondary,
  },
  poolIcon: {
    fontSize: 32,
  },
  poolInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  poolName: {
    ...Typography.h5,
    color: Colors.text.primary,
  },
  poolMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  poolTvl: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  poolApyContainer: {
    borderWidth: Borders.width.thick,
    borderColor: Colors.border.primary,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  poolApyLabel: {
    ...Typography.labelSmall,
    color: Colors.text.secondary,
    marginBottom: Spacing.xxs,
  },
  poolApyValue: {
    ...Typography.h2,
    color: Colors.semantic.success,
  },
  poolEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    backgroundColor: Colors.semantic.successBg,
    borderWidth: Borders.width.thin,
    borderColor: Colors.semantic.successBorder,
  },
  poolEstimateText: {
    ...Typography.bodySmall,
    color: Colors.semantic.success,
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
  actionsSection: {
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  bottomSpacer: {
    height: 120,
  },
});
