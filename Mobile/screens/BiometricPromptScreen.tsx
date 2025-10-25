import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Colors, Typography, Spacing, FontFamily, BorderRadius } from '../constants/designTokens';
import { useTheme } from '../contexts/ThemeContext';
import {
  authenticateWithBiometric,
  checkBiometricCapability,
  getBiometricTypeName,
  getBiometricIcon,
} from '../utils/biometric';

interface BiometricPromptScreenProps {
  onAuthSuccess: () => void;
  onUseWalletConnect: () => void;
  onCancel?: () => void;
}

const BiometricPromptScreen: React.FC<BiometricPromptScreenProps> = ({
  onAuthSuccess,
  onUseWalletConnect,
  onCancel,
}) => {
  const { colors } = useTheme();
  const [biometricType, setBiometricType] = useState('Biometric');
  const [biometricIcon, setBiometricIcon] = useState('🔐');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    initializeBiometric();
  }, []);

  const initializeBiometric = async () => {
    const capability = await checkBiometricCapability();
    setBiometricType(getBiometricTypeName(capability.biometricType));
    setBiometricIcon(getBiometricIcon(capability.biometricType));

    // Auto-trigger biometric prompt on mount
    if (capability.isAvailable) {
      setTimeout(() => {
        handleBiometricAuth();
      }, 500);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      setIsAuthenticating(true);
      const result = await authenticateWithBiometric();

      if (result.success) {
        onAuthSuccess();
      } else {
        Alert.alert(
          'Authentication Failed',
          result.error || 'Failed to authenticate. Please try again or use wallet connection.',
          [
            {
              text: 'Try Again',
              onPress: () => {
                setIsAuthenticating(false);
                setTimeout(() => handleBiometricAuth(), 300);
              },
            },
            {
              text: 'Use Wallet',
              onPress: onUseWalletConnect,
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Biometric auth error:', error);
      Alert.alert(
        'Error',
        'An error occurred during authentication',
        [
          {
            text: 'OK',
            onPress: () => setIsAuthenticating(false),
          },
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        entering={FadeInDown.duration(500).delay(100)}
        style={styles.content}
      >
        {/* Biometric Icon */}
        <Animated.View
          entering={FadeIn.duration(800).delay(300)}
          style={[
            styles.iconContainer,
            {
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              borderColor: Colors.accent.ghalaGold,
            },
          ]}
        >
          <Text style={styles.icon}>{biometricIcon}</Text>
        </Animated.View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Welcome Back
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Use {biometricType} to unlock Ghala
        </Text>

        {/* Authenticate Button */}
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={handleBiometricAuth}
            disabled={isAuthenticating}
            style={({ pressed }) => [
              styles.biometricButton,
              {
                backgroundColor: Colors.accent.ghalaGold,
                borderColor: Colors.base.black,
                opacity: pressed ? 0.8 : isAuthenticating ? 0.7 : 1,
              },
            ]}
          >
            <Text style={styles.buttonIcon}>{biometricIcon}</Text>
            <Text style={styles.buttonText}>
              {isAuthenticating ? 'Authenticating...' : `Use ${biometricType}`}
            </Text>
          </Pressable>

          {/* Alternative: Connect with Wallet */}
          <Pressable
            onPress={onUseWalletConnect}
            style={({ pressed }) => [
              styles.walletButton,
              {
                borderColor: colors.border,
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Text style={[styles.walletButtonText, { color: colors.textPrimary }]}>
              Connect with Wallet Instead
            </Text>
          </Pressable>

          {/* Cancel Option */}
          {onCancel && (
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.cancelButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </Pressable>
          )}
        </View>

        {/* Info Text */}
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Your biometric data never leaves your device
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 100,
    paddingBottom: Spacing.xxxl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  icon: {
    fontSize: 72,
  },
  title: {
    ...Typography.h1,
    fontFamily: FontFamily.bold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    marginBottom: Spacing.xxxl,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  biometricButton: {
    height: 56,
    borderRadius: 0,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  buttonText: {
    ...Typography.button,
    fontFamily: FontFamily.bold,
    color: Colors.base.black,
    textTransform: 'uppercase',
  },
  walletButton: {
    height: 56,
    borderRadius: 0,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    backgroundColor: 'transparent',
  },
  walletButtonText: {
    ...Typography.bodyMedium,
    fontFamily: FontFamily.semibold,
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    alignSelf: 'center',
  },
  cancelText: {
    ...Typography.bodySmall,
    fontFamily: FontFamily.regular,
  },
  infoText: {
    ...Typography.caption,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
  },
});

export default BiometricPromptScreen;
