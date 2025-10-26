import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import {
  Colors,
  Typography,
  Spacing,
  Layout,
} from '@/constants/designTokens';
import { ActionButton } from './ActionButton';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  emoji?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  emoji,
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {emoji && (
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
      )}
      {icon && <View style={styles.iconContainer}>{icon}</View>}

      <Text style={styles.title}>{title}</Text>

      {description && <Text style={styles.description}>{description}</Text>}

      {actionLabel && onAction && (
        <ActionButton
          variant="primary"
          onPress={onAction}
          size="md"
          style={styles.actionButton}
        >
          {actionLabel}
        </ActionButton>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxxl,
    paddingHorizontal: Layout.screenPadding,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderWidth: 3,
    borderColor: Colors.border.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    backgroundColor: Colors.bg.secondary,
  },
  emoji: {
    fontSize: 56,
    lineHeight: 64,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderWidth: 3,
    borderColor: Colors.border.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    backgroundColor: Colors.bg.secondary,
  },
  title: {
    ...Typography.h3,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    maxWidth: 300,
  },
  actionButton: {
    marginTop: Spacing.md,
    minWidth: 200,
  },
});
