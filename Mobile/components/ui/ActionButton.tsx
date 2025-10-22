import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Spacing } from '@/constants/designTokens';

interface ActionButtonProps {
  variant?: 'primary' | 'secondary' | 'accent';
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
  const isAccent = variant === 'accent';
  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle[] = [
    styles.container,
    fullWidth ? styles.fullWidth : undefined,
    size === 'sm' ? styles.sizeSm : undefined,
    size === 'md' ? styles.sizeMd : undefined,
    size === 'lg' ? styles.sizeLg : undefined,
    isPrimary ? styles.primaryContainer : isAccent ? styles.accentContainer : styles.secondaryContainer,
    isDisabled ? styles.disabled : undefined,
    isPressed ? styles.pressed : undefined,
  ].filter(Boolean) as ViewStyle[];

  const textStyle: TextStyle[] = [
    styles.text,
    isPrimary ? styles.primaryText : isAccent ? styles.accentText : styles.secondaryText,
    isDisabled ? styles.disabledText : undefined,
  ].filter(Boolean) as TextStyle[];

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
          color={isPrimary || isAccent ? '#FFFFFF' : '#000000'}
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
    borderRadius: 0,
    gap: Spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  sizeSm: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  sizeMd: {
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
  },
  sizeLg: {
    paddingVertical: 20,
    paddingHorizontal: Spacing.xl,
  },
  primaryContainer: {
    backgroundColor: '#000000',
    borderWidth: 0,
  },
  accentContainer: {
    backgroundColor: '#000000',
    borderWidth: 0,
  },
  secondaryContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'SpaceGrotesk_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  accentText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'SpaceGrotesk_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  secondaryText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
