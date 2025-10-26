import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {
  Colors,
  BorderRadius,
  Spacing,
  Animations,
} from '@/constants/designTokens';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: keyof typeof BorderRadius;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 'sm',
  style,
}) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, {
        duration: Animations.duration.slowest,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: BorderRadius[borderRadius],
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

// Pre-built skeleton components for common use cases

export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.card, style]}>
      <Skeleton width="60%" height={24} borderRadius="sm" />
      <Skeleton width="100%" height={40} borderRadius="sm" style={styles.mt} />
      <View style={styles.row}>
        <Skeleton width="45%" height={16} borderRadius="sm" />
        <Skeleton width="45%" height={16} borderRadius="sm" />
      </View>
    </View>
  );
};

export const SkeletonListItem: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.listItem, style]}>
      <Skeleton width={44} height={44} borderRadius="none" />
      <View style={styles.listItemContent}>
        <Skeleton width="70%" height={18} borderRadius="sm" />
        <Skeleton width="40%" height={14} borderRadius="sm" style={styles.mtSmall} />
      </View>
      <View style={styles.listItemRight}>
        <Skeleton width={60} height={18} borderRadius="sm" />
        <Skeleton width={80} height={16} borderRadius="sm" style={styles.mtSmall} />
      </View>
    </View>
  );
};

export const SkeletonBalanceCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.balanceCard, style]}>
      <Skeleton width="40%" height={14} borderRadius="sm" />
      <Skeleton width="80%" height={48} borderRadius="sm" style={styles.mt} />
      <Skeleton width="50%" height={16} borderRadius="sm" style={styles.mt} />
      <View style={styles.divider} />
      <View style={styles.row}>
        <View style={styles.column}>
          <Skeleton width={80} height={12} borderRadius="sm" />
          <Skeleton width={100} height={16} borderRadius="sm" style={styles.mtSmall} />
        </View>
        <View style={styles.column}>
          <Skeleton width={80} height={12} borderRadius="sm" />
          <Skeleton width={100} height={16} borderRadius="sm" style={styles.mtSmall} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.neutral[200],
  },
  card: {
    backgroundColor: Colors.bg.secondary,
    borderWidth: 2,
    borderColor: Colors.border.primary,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  balanceCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: 24,
    padding: Spacing.xl,
    minHeight: 260,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  listItemContent: {
    flex: 1,
  },
  listItemRight: {
    alignItems: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  column: {
    flex: 1,
  },
  mt: {
    marginTop: Spacing.md,
  },
  mtSmall: {
    marginTop: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[800],
    marginVertical: Spacing.md,
    opacity: 0.2,
  },
});
