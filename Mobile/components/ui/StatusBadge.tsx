import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from '@/constants/designTokens';

export type StatusType = 'confirmed' | 'pending' | 'failed' | 'success' | 'warning' | 'error' | 'info';

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  showDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  showDot = true,
  size = 'md',
  style,
}) => {
  const config = getStatusConfig(status);
  const sizeStyle = getSizeStyle(size);

  return (
    <View
      style={[
        styles.container,
        sizeStyle.container,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
        },
        style,
      ]}
    >
      {showDot && (
        <View
          style={[
            styles.dot,
            sizeStyle.dot,
            { backgroundColor: config.color },
          ]}
        />
      )}
      <Text
        style={[
          styles.label,
          sizeStyle.text,
          { color: config.color },
        ]}
      >
        {label || config.defaultLabel}
      </Text>
    </View>
  );
};

function getStatusConfig(status: StatusType) {
  switch (status) {
    case 'confirmed':
    case 'success':
      return {
        color: Colors.semantic.success,
        bg: Colors.semantic.successBg,
        border: Colors.semantic.successBorder,
        defaultLabel: 'Confirmed',
      };
    case 'pending':
    case 'warning':
      return {
        color: Colors.semantic.warning,
        bg: Colors.semantic.warningBg,
        border: Colors.semantic.warningBorder,
        defaultLabel: 'Pending',
      };
    case 'failed':
    case 'error':
      return {
        color: Colors.semantic.error,
        bg: Colors.semantic.errorBg,
        border: Colors.semantic.errorBorder,
        defaultLabel: 'Failed',
      };
    case 'info':
      return {
        color: Colors.semantic.info,
        bg: Colors.semantic.infoBg,
        border: Colors.semantic.infoBorder,
        defaultLabel: 'Info',
      };
    default:
      return {
        color: Colors.text.secondary,
        bg: Colors.neutral[100],
        border: Colors.border.secondary,
        defaultLabel: 'Unknown',
      };
  }
}

function getSizeStyle(size: StatusBadgeProps['size']) {
  switch (size) {
    case 'sm':
      return {
        container: {
          paddingVertical: 2,
          paddingHorizontal: 6,
        },
        dot: {
          width: 3,
          height: 3,
        },
        text: {
          ...Typography.labelSmall,
        },
      };
    case 'lg':
      return {
        container: {
          paddingVertical: 6,
          paddingHorizontal: 12,
        },
        dot: {
          width: 6,
          height: 6,
        },
        text: {
          ...Typography.labelMedium,
        },
      };
    case 'md':
    default:
      return {
        container: {
          paddingVertical: 3,
          paddingHorizontal: 8,
        },
        dot: {
          width: 4,
          height: 4,
        },
        text: {
          ...Typography.captionSemibold,
        },
      };
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    borderRadius: BorderRadius.circle,
  },
  label: {
    textTransform: 'uppercase',
  },
});
