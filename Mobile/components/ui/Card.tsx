import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
  PressableProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  Colors,
  BorderRadius,
  Spacing,
  Shadows,
  Borders,
  Animations,
} from '@/constants/designTokens';

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
  const scale = useSharedValue(1);
  const elevation = useSharedValue(0);

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

  const variantStyle = getVariantStyle(variant);
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

function getVariantStyle(variant: CardProps['variant']): ViewStyle {
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
        backgroundColor: Colors.bg.secondary,
        borderWidth: Borders.width.thick,
        borderColor: Colors.border.primary,
        ...Shadows.none,
      };
    case 'elevated':
      return {
        backgroundColor: Colors.bg.secondary,
        borderWidth: Borders.width.thick,
        borderColor: Colors.border.primary,
        ...Shadows.lg,
      };
    case 'default':
    default:
      return {
        backgroundColor: Colors.bg.secondary,
        borderWidth: Borders.width.thick,
        borderColor: Colors.border.primary,
        ...Shadows.sm,
      };
  }
}

// Specialized Card variants for common use cases

export const BalanceCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="dark" {...props} />
);

export const SectionCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="outlined" {...props} />
);

export const InteractiveCard: React.FC<Omit<CardProps, 'variant' | 'pressable'>> = (
  props
) => <Card variant="elevated" pressable {...props} />;
