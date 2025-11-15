import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/designTokens';
import { useTheme } from '@/contexts/ThemeContext';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'info' | 'error' | 'warning' | 'success';
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = 'info',
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
}) => {
  const { colors } = useTheme();

  const getIconConfig = () => {
    switch (type) {
      case 'error':
        return { name: 'x-circle' as const, color: Colors.semantic.error };
      case 'warning':
        return { name: 'alert-circle' as const, color: Colors.semantic.warning };
      case 'success':
        return { name: 'check-circle' as const, color: Colors.semantic.success };
      default:
        return { name: 'info' as const, color: Colors.accent.primary };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.overlay}
      >
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          activeOpacity={1} 
          onPress={onCancel || onConfirm}
        />
        
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown.springify().damping(15)}
          style={[styles.alertContainer, { backgroundColor: colors.surface }]}
        >
          <View style={[styles.iconContainer, { backgroundColor: iconConfig.color + '15' }]}>
            <Feather name={iconConfig.name} size={32} color={iconConfig.color} />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

          <View style={styles.buttonContainer}>
            {onCancel && (
              <TouchableOpacity
                onPress={onCancel}
                style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
              >
                <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onConfirm}
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: iconConfig.color },
                !onCancel && styles.fullWidthButton,
              ]}
            >
              <Text style={[styles.buttonText, { color: Colors.text.inverse }]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  alertContainer: {
    width: '85%',
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h3,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    ...Typography.body.medium,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fullWidthButton: {
    flex: 1,
  },
  buttonText: {
    ...Typography.body.medium,
    fontWeight: '600',
  },
});

