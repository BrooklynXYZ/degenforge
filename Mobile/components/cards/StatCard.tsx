import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/designTokens';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export const StatCard = React.memo<StatCardProps>(({
  label,
  value,
  unit,
  change,
  changeType = 'neutral',
  icon,
  onPress,
  style,
}) => {
  const changeColor =
    changeType === 'positive'
      ? Colors.semantic.success
      : changeType === 'negative'
        ? Colors.semantic.error
        : Colors.text.secondary;

  const containerStyle: ViewStyle[] = [styles.container, style];

  const content = (
    <>
      <View style={styles.header}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
          {unit && <Text style={styles.unit}>{unit}</Text>}
        </View>
        {change && (
          <Text style={[styles.change, { color: changeColor }]}>{change}</Text>
        )}
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{content}</View>;
});

StatCard.displayName = 'StatCard';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bg.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.card,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  icon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    flex: 1,
  },
  content: {
    gap: Spacing.sm,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  value: {
    ...Typography.h3,
    color: Colors.text.primary,
    fontWeight: '700',
  },
  unit: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  change: {
    ...Typography.caption,
    fontWeight: '500',
  },
});
