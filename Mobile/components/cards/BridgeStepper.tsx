import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Animations } from '@/constants/designTokens';

interface StepData {
  label: string;
  txHash?: string;
  confirmations?: number;
  status?: 'pending' | 'confirmed' | 'failed';
}

interface BridgeStepperProps {
  currentStep: number; // 0-2
  steps: StepData[];
  onStepPress?: (index: number) => void;
  style?: ViewStyle;
}

export const BridgeStepper: React.FC<BridgeStepperProps> = ({
  currentStep,
  steps,
  onStepPress,
  style,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: Animations.stepper,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  return (
    <View style={[styles.container, style]}>
      {/* Stepper line */}
      <View style={styles.stepperTrack}>
        {steps.map((_, index) => (
          <React.Fragment key={index}>
            {/* Step circle */}
            <TouchableOpacity
              style={[
                styles.stepCircle,
                index < currentStep && styles.stepCompleted,
                index === currentStep && styles.stepActive,
              ]}
              onPress={() => onStepPress?.(index)}
              activeOpacity={0.7}
            >
              <Text style={styles.stepNumber}>
                {index < currentStep ? '✓' : index + 1}
              </Text>
            </TouchableOpacity>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.connector,
                  index < currentStep && styles.connectorCompleted,
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Step labels and details */}
      <View style={styles.detailsContainer}>
        {steps.map((step, index) => (
          <Animated.View
            key={index}
            style={[
              styles.stepDetail,
              index === currentStep && { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.stepLabel}>{step.label}</Text>

            {step.txHash && (
              <View style={styles.txHashContainer}>
                <Text style={styles.txHashLabel}>TX:</Text>
                <Text style={styles.txHash}>{truncateHash(step.txHash)}</Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(step.txHash!)}
                  style={styles.copyButton}
                >
                  <Text style={styles.copyIcon}>📋</Text>
                </TouchableOpacity>
              </View>
            )}

            {step.confirmations !== undefined && step.confirmations > 0 && (
              <View style={styles.confirmationContainer}>
                <Text style={styles.confirmationText}>
                  {step.confirmations} confirmation{step.confirmations !== 1 ? 's' : ''}
                </Text>
              </View>
            )}

            {step.status === 'pending' && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>⏳ Pending</Text>
              </View>
            )}
            {step.status === 'confirmed' && (
              <View style={[styles.statusBadge, styles.statusConfirmed]}>
                <Text style={[styles.statusText, styles.statusConfirmedText]}>
                  ✓ Confirmed
                </Text>
              </View>
            )}
            {step.status === 'failed' && (
              <View style={[styles.statusBadge, styles.statusFailed]}>
                <Text style={[styles.statusText, styles.statusFailedText]}>
                  ✗ Failed
                </Text>
              </View>
            )}
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const truncateHash = (hash: string): string => {
  if (hash.length <= 12) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};

const copyToClipboard = (text: string) => {
  // Placeholder for clipboard functionality
  console.log('Copied:', text);
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  stepperTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.circle,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral[200],
  },
  stepActive: {
    backgroundColor: Colors.accent.primary,
    borderColor: Colors.accent.primary,
  },
  stepCompleted: {
    backgroundColor: Colors.semantic.success,
    borderColor: Colors.semantic.success,
  },
  stepNumber: {
    ...Typography.bodyMedium,
    color: Colors.base.white,
    fontWeight: '700',
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.neutral[200],
    marginHorizontal: Spacing.sm,
  },
  connectorCompleted: {
    backgroundColor: Colors.semantic.success,
  },
  detailsContainer: {
    gap: Spacing.lg,
  },
  stepDetail: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  stepLabel: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  txHashContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bg.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  txHashLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  txHash: {
    ...Typography.caption,
    color: Colors.accent.primary,
    fontFamily: 'monospace',
    flex: 1,
  },
  copyButton: {
    padding: Spacing.xs,
  },
  copyIcon: {
    fontSize: 14,
  },
  confirmationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  confirmationText: {
    ...Typography.caption,
    color: Colors.semantic.success,
    fontWeight: '500',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.semantic.pending,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.pill,
  },
  statusConfirmed: {
    backgroundColor: Colors.semantic.confirmed,
  },
  statusFailed: {
    backgroundColor: Colors.semantic.error,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.base.white,
    fontWeight: '600',
  },
  statusConfirmedText: {
    color: Colors.base.white,
  },
  statusFailedText: {
    color: Colors.base.white,
  },
});
