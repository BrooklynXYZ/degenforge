import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Colors,
  Typography,
  Spacing,
  Borders,
  Layout,
  Animations,
} from '@/constants/designTokens';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  onRightElementPress?: () => void;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftElement,
  rightElement,
  onRightElementPress,
  variant = 'default',
  size = 'md',
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = useSharedValue(Colors.border.primary);

  const animatedBorderStyle = useAnimatedStyle(() => {
    return {
      borderColor: withTiming(borderColor.value, {
        duration: Animations.duration.fast,
      }),
    };
  });

  const handleFocus = (e: any) => {
    setIsFocused(true);
    borderColor.value = Colors.accent.primary;
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    borderColor.value = error ? Colors.semantic.error : Colors.border.primary;
    onBlur?.(e);
  };

  const inputVariantStyle = getVariantStyle(variant);
  const inputSizeStyle = getSizeStyle(size);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Animated.View
        style={[
          styles.inputContainer,
          inputVariantStyle,
          inputSizeStyle,
          error && styles.inputError,
          isFocused && styles.inputFocused,
          animatedBorderStyle,
        ]}
      >
        {leftElement && <View style={styles.leftElement}>{leftElement}</View>}

        <TextInput
          style={[
            styles.input,
            style,
            leftElement && styles.inputWithLeft,
            rightElement && styles.inputWithRight,
          ]}
          placeholderTextColor={Colors.text.tertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...textInputProps}
        />

        {rightElement && (
          <TouchableOpacity
            style={styles.rightElement}
            onPress={onRightElementPress}
            disabled={!onRightElementPress}
          >
            {rightElement}
          </TouchableOpacity>
        )}
      </Animated.View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

function getVariantStyle(variant: InputProps['variant']): ViewStyle {
  switch (variant) {
    case 'filled':
      return {
        backgroundColor: Colors.neutral[100],
        borderWidth: 0,
        borderBottomWidth: Borders.width.thick,
      };
    case 'outlined':
      return {
        backgroundColor: Colors.bg.secondary,
        borderWidth: Borders.width.thick,
      };
    case 'default':
    default:
      return {
        backgroundColor: Colors.bg.secondary,
        borderWidth: Borders.width.thick,
      };
  }
}

function getSizeStyle(size: InputProps['size']): ViewStyle {
  switch (size) {
    case 'sm':
      return {
        height: 40,
        paddingHorizontal: Spacing.sm,
      };
    case 'lg':
      return {
        height: Layout.inputHeight + 8,
        paddingHorizontal: Spacing.lg,
      };
    case 'md':
    default:
      return {
        height: Layout.inputHeight,
        paddingHorizontal: Spacing.md,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.labelMedium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: Colors.border.primary,
    borderRadius: Layout.inputBorderRadius,
  },
  inputFocused: {
    borderColor: Colors.accent.primary,
  },
  inputError: {
    borderColor: Colors.semantic.error,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.text.primary,
    padding: 0,
  },
  inputWithLeft: {
    paddingLeft: Spacing.xs,
  },
  inputWithRight: {
    paddingRight: Spacing.xs,
  },
  leftElement: {
    marginRight: Spacing.sm,
  },
  rightElement: {
    marginLeft: Spacing.sm,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.semantic.error,
    marginTop: Spacing.xxs,
  },
  helperText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: Spacing.xxs,
  },
});

// Specialized Input variant for currency/number inputs
export const CurrencyInput: React.FC<InputProps & { currency?: string }> = ({
  currency = 'BTC',
  ...props
}) => {
  return (
    <Input
      {...props}
      keyboardType="decimal-pad"
      rightElement={
        <Text style={[Typography.bodyMedium, { color: Colors.text.tertiary }]}>
          {currency}
        </Text>
      }
    />
  );
};
