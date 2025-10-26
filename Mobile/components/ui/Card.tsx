import React from 'react';
import {
  View,
  ViewStyle,
  Pressable,
  PressableProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  Colors,
  BorderRadius,
  Spacing,
  Shadows,
  Borders,
} from '@/constants/designTokens';
import { useTheme } from '@/contexts/ThemeContext';

export interface CardProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  variant?: 'default' | 'dark' | 'outlined' | 'elevated';
  padding?: keyof typeof Spacing;
  borderRadius?: keyof typeof BorderRadius;
  style?: ViewStyle;
  animated?: boolean;
  pressable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'xl',
  borderRadius = 'xxl',
  style,
  animated = true,
  pressable = false,
  onPress,
  ...pressableProps
}) => {
  const { colors: themeColors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (animated && pressable) {
      scale.value = withSpring(0.98, {
        damping: 15,
        stiffness: 150,
      });
    }
  };

  const handlePressOut = () => {
    if (animated && pressable) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
    }
  };

  const variantStyle = getVariantStyle(variant, themeColors);
  const paddingValue = Spacing[padding];
  const borderRadiusValue = BorderRadius[borderRadius];

  const combinedStyle: ViewStyle = {
    ...variantStyle,
    padding: paddingValue,
    borderRadius: borderRadiusValue,
    ...style,
  };

  if (pressable || onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...pressableProps}
      >
        <Animated.View style={[combinedStyle, animated && animatedStyle]}>
          {children}
        </Animated.View>
      </Pressable>
    );
  }

  if (animated) {
    return (
      <Animated.View style={[combinedStyle, animatedStyle]}>
        {children}
      </Animated.View>
    );
  }

  return <View style={combinedStyle}>{children}</View>;
};

function getVariantStyle(
  variant: CardProps['variant'],
  themeColors: ReturnType<typeof useTheme>['colors']
): ViewStyle {
  switch (variant) {
    case 'dark':
      return {
        backgroundColor: Colors.bg.card,
        borderWidth: 0,
        ...Shadows.brutal,
        overflow: 'hidden',
      };
    case 'outlined':
      return {
        backgroundColor: themeColors.surface,
        borderWidth: Borders.width.thick,
        borderColor: themeColors.border,
        ...Shadows.none,
      };
    case 'elevated':
      return {
        backgroundColor: themeColors.surface,
        borderWidth: Borders.width.thick,
        borderColor: themeColors.border,
        ...Shadows.lg,
      };
    case 'default':
    default:
      return {
        backgroundColor: themeColors.surface,
        borderWidth: Borders.width.thick,
        borderColor: themeColors.border,
        ...Shadows.sm,
      };
  }
}

// Specialized Card variants for common use cases

export const BalanceCard: React.FC<Omit<CardProps, 'variant'>> = (props) => {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  const glassyStyle: ViewStyle = isDark ? {
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  } : {};

  return <Card variant="dark" {...props} style={[glassyStyle, props.style]} />;
};

export const SectionCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="outlined" {...props} />
);

export const InteractiveCard: React.FC<Omit<CardProps, 'variant' | 'pressable'>> = (
  props
) => <Card variant="elevated" pressable {...props} />;
