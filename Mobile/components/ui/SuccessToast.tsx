import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, useSharedValue, withSpring } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/designTokens';
import { useTheme } from '@/contexts/ThemeContext';

interface SuccessToastProps {
  message: string;
  onAction?: () => void;
  actionLabel?: string;
  onClose: () => void;
}

export const SuccessToast: React.FC<SuccessToastProps> = ({
  message,
  onAction,
  actionLabel = 'View',
  onClose,
}) => {
  const { colors } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <Animated.View
      entering={FadeInUp.springify()}
      exiting={FadeOutUp.springify()}
      style={[styles.container, { backgroundColor: colors.surface, borderColor: Colors.semantic.success }]}
    >
      <View style={[styles.iconContainer, { backgroundColor: Colors.semantic.success + '20' }]}>
        <Feather name="check-circle" size={20} color={Colors.semantic.success} />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.message, { color: colors.textPrimary }]} numberOfLines={2}>
          {message}
        </Text>
        {onAction && (
          <TouchableOpacity onPress={onAction} style={styles.actionButton}>
            <Text style={styles.actionText}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Feather name="x" size={18} color={colors.textTertiary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  message: {
    ...Typography.body.medium,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: Spacing.xs,
  },
  actionText: {
    ...Typography.body.medium,
    color: Colors.accent.primary,
    fontWeight: '600',
  },
  closeButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

