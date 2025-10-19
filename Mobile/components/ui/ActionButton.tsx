import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Animations } from '@/constants/designTokens';

interface ActionButtonProps {
  variant?: 'primary' | 'secondary';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  variant = 'primary',
  onPress,
  disabled = false,
  loading = false,
  children,
  size = 'md',
  fullWidth = false,
  icon,
}) => {
  const [isPressed, setIsPressed] = React.useState(false);

  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle[] = [
    styles.container,
    fullWidth && styles.fullWidth,
    size === 'sm' && styles.sizeSm,
    size === 'md' && styles.sizeMd,
    size === 'lg' && styles.sizeLg,
    isPrimary ? styles.primaryContainer : styles.secondaryContainer,
    isDisabled && styles.disabled,
    isPressed && styles.pressed,
  ];

  const textStyle: TextStyle[] = [
    styles.text,
    isPrimary ? styles.primaryText : styles.secondaryText,
    isDisabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? Colors.base.white : Colors.accent.primary}
          size="small"
        />
      ) : (
        <>
          {icon && icon}
          <Text style={textStyle}>{children}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    transition: `all ${Animations.normal}ms ease-out`,
  },
  fullWidth: {
    width: '100%',
  },
  sizeSm: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  sizeMd: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  sizeLg: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  primaryContainer: {
    backgroundColor: Colors.accent.primary,
  },
  secondaryContainer: {
    backgroundColor: Colors.bg.secondary,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  primaryText: {
    color: Colors.base.white,
    ...Typography.bodyMedium,
  },
  secondaryText: {
    color: Colors.text.primary,
    ...Typography.bodyMedium,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: Colors.text.tertiary,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
  text: {
    fontWeight: '600',
  },
});
