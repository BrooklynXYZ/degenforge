import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  Colors,
  Spacing,
  Typography,
  Layout,
  Borders,
  Opacity,
} from '@/constants/designTokens';

interface ActionButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'danger';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const ActionButton: React.FC<ActionButtonProps> = ({
  variant = 'primary',
  onPress,
  disabled = false,
  loading = false,
  children,
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
}) => {
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (!isDisabled) {
      scale.value = withSpring(0.96, {
        damping: 15,
        stiffness: 200,
      });
    }
  };

  const handlePressOut = () => {
    if (!isDisabled) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
    }
  };

  const variantStyle = getVariantStyle(variant);
  const sizeStyle = getSizeStyle(size);
  const textStyle = getTextStyle(variant, size);
  const spinnerColor = getSpinnerColor(variant);

  return (
    <AnimatedTouchable
      style={[
        styles.container,
        variantStyle,
        sizeStyle,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <View style={[styles.content, iconPosition === 'right' && styles.contentReverse]}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={textStyle}>{children}</Text>
        </View>
      )}
    </AnimatedTouchable>
  );
};

function getVariantStyle(variant: ActionButtonProps['variant']): ViewStyle {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: Colors.base.black,
        borderWidth: Borders.width.thick,
        borderColor: Colors.base.black,
      };
    case 'accent':
      return {
        backgroundColor: Colors.accent.primary,
        borderWidth: Borders.width.thick,
        borderColor: Colors.accent.primary,
      };
    case 'secondary':
      return {
        backgroundColor: Colors.bg.secondary,
        borderWidth: Borders.width.thick,
        borderColor: Colors.border.primary,
      };
    case 'outline':
      return {
        backgroundColor: Colors.base.transparent,
        borderWidth: Borders.width.thick,
        borderColor: Colors.border.primary,
      };
    case 'ghost':
      return {
        backgroundColor: Colors.base.transparent,
        borderWidth: 0,
      };
    case 'danger':
      return {
        backgroundColor: Colors.semantic.error,
        borderWidth: Borders.width.thick,
        borderColor: Colors.semantic.error,
      };
    default:
      return {
        backgroundColor: Colors.base.black,
        borderWidth: Borders.width.thick,
        borderColor: Colors.base.black,
      };
  }
}

function getSizeStyle(size: ActionButtonProps['size']): ViewStyle {
  switch (size) {
    case 'sm':
      return {
        height: Layout.buttonHeight.sm,
        paddingHorizontal: Spacing.md,
      };
    case 'lg':
      return {
        height: Layout.buttonHeight.lg,
        paddingHorizontal: Spacing.xl,
      };
    case 'md':
    default:
      return {
        height: Layout.buttonHeight.md,
        paddingHorizontal: Spacing.lg,
      };
  }
}

function getTextStyle(variant: ActionButtonProps['variant'], size: ActionButtonProps['size']): TextStyle {
  const baseStyle = size === 'sm' ? Typography.buttonSmall : Typography.button;

  const colorStyle: TextStyle = (() => {
    switch (variant) {
      case 'primary':
      case 'accent':
      case 'danger':
        return { color: Colors.text.inverse };
      case 'secondary':
      case 'outline':
      case 'ghost':
        return { color: Colors.text.primary };
      default:
        return { color: Colors.text.inverse };
    }
  })();

  return {
    ...baseStyle,
    ...colorStyle,
    textTransform: 'uppercase',
  };
}

function getSpinnerColor(variant: ActionButtonProps['variant']): string {
  switch (variant) {
    case 'primary':
    case 'accent':
    case 'danger':
      return Colors.text.inverse;
    case 'secondary':
    case 'outline':
    case 'ghost':
      return Colors.text.primary;
    default:
      return Colors.text.inverse;
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Layout.buttonBorderRadius,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: Opacity.disabled,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  contentReverse: {
    flexDirection: 'row-reverse',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
