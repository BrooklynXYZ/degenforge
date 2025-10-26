import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useFonts, PlayfairDisplay_900Black } from '@expo-google-fonts/playfair-display';
import { Colors, Typography, Spacing, FontFamily, BorderRadius } from '../constants/designTokens';
import { useTheme } from '../contexts/ThemeContext';
import {
  authenticateWithBiometric,
  checkBiometricCapability,
  getBiometricTypeName,
  getBiometricIcon,
} from '../utils/biometric';

const { width } = Dimensions.get('window');

interface BiometricPromptScreenProps {
  onAuthSuccess: () => void;
  onUseWalletConnect: () => void;
  onCancel?: () => void;
  transitionComplete?: boolean;
}

const BiometricPromptScreen: React.FC<BiometricPromptScreenProps> = ({
  onAuthSuccess,
  onUseWalletConnect,
  onCancel,
  transitionComplete = false,
}) => {
  const { colors } = useTheme();
  const [biometricType, setBiometricType] = useState('Biometric');
  const [biometricIcon, setBiometricIcon] = useState('🔐');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_900Black,
  });

  const ghalaOpacity = useSharedValue(0);
  const welcomeY = useSharedValue(40);
  const welcomeOpacity = useSharedValue(0);
  const subtitleY = useSharedValue(40);
  const subtitleOpacity = useSharedValue(0);
  const buttonsY = useSharedValue(40);
  const buttonsOpacity = useSharedValue(0);

  useEffect(() => {
    initializeBiometric();
  }, []);

  useEffect(() => {
    if (transitionComplete && fontsLoaded) {
      ghalaOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
      welcomeY.value = withDelay(400, withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }));
      welcomeOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
      subtitleY.value = withDelay(600, withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }));
      subtitleOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
      buttonsY.value = withDelay(800, withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }));
      buttonsOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    }
  }, [transitionComplete, fontsLoaded]);

  const initializeBiometric = async () => {
    const capability = await checkBiometricCapability();
    setBiometricType(getBiometricTypeName(capability.biometricType));
    setBiometricIcon(getBiometricIcon(capability.biometricType));

    if (capability.isAvailable) {
      setTimeout(() => handleBiometricAuth(), 1800);
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
          result.error || 'Please try again or use wallet connection.',
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
      Alert.alert('Error', 'Authentication error occurred', [
        {
          text: 'OK',
          onPress: () => setIsAuthenticating(false),
        },
      ]);
    }
  };

  const ghalaStyle = useAnimatedStyle(() => ({
    opacity: ghalaOpacity.value,
  }));

  const welcomeStyle = useAnimatedStyle(() => ({
    opacity: welcomeOpacity.value,
    transform: [{ translateY: welcomeY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleY.value }],
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsY.value }],
  }));

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Animated.View style={[styles.ghalaContainer, ghalaStyle]}>
            <Text style={styles.ghalaText}>GHALA</Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.titleContainer, welcomeStyle]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome Back</Text>
        </Animated.View>

        <Animated.View style={[styles.subtitleContainer, subtitleStyle]}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Use {biometricType} to unlock
          </Text>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, buttonsStyle]}>
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
              {isAuthenticating ? 'AUTHENTICATING...' : `USE ${biometricType.toUpperCase()}`}
            </Text>
          </Pressable>

          <Pressable
            onPress={onUseWalletConnect}
            style={({ pressed }) => [
              styles.walletButton,
              {
                borderColor: colors.border,
                backgroundColor: colors.surface,
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Text style={[styles.walletButtonText, { color: colors.textPrimary }]}>
              Connect with Wallet
            </Text>
          </Pressable>

          {onCancel && (
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.cancelButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
          )}
        </Animated.View>

        <Animated.View style={[styles.infoContainer, buttonsStyle]}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Your biometric data never leaves your device
          </Text>
        </Animated.View>
      </View>
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
    paddingTop: 80,
    paddingBottom: Spacing.xxxl,
    alignItems: 'center',
  },
  logoContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  ghalaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghalaText: {
    fontFamily: 'PlayfairDisplay_900Black',
    fontSize: 42,
    color: '#000000',
    letterSpacing: 3,
    fontWeight: '900',
  },
  titleContainer: {
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitleContainer: {
    marginBottom: 48,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    textAlign: 'center',
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
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Colors.base.black,
    letterSpacing: 1,
  },
  walletButton: {
    height: 56,
    borderRadius: 0,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  walletButtonText: {
    fontFamily: FontFamily.semibold,
    fontSize: 15,
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    alignSelf: 'center',
  },
  cancelText: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
  },
  infoContainer: {
    marginTop: 'auto',
  },
  infoText: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default BiometricPromptScreen;
