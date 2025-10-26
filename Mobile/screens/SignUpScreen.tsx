import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Typography, Spacing, FontFamily, BorderRadius } from '../constants/designTokens';
import { useTheme } from '../contexts/ThemeContext';
import { checkBiometricCapability, getBiometricTypeName } from '../utils/biometric';
import { formatAddress } from '../utils/walletConnect';

interface SignUpScreenProps {
  walletAddress: string;
  onComplete: (username: string, enableBiometric: boolean) => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ walletAddress, onComplete }) => {
  const { colors } = useTheme();
  const [username, setUsername] = useState('');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const capability = await checkBiometricCapability();
    setBiometricAvailable(capability.isAvailable);
    setBiometricType(getBiometricTypeName(capability.biometricType));
  };

  const handleContinue = () => {
    if (!username.trim()) {
      return;
    }
    if (!agreedToTerms) {
      return;
    }
    onComplete(username.trim(), biometricEnabled);
  };

  const isFormValid = username.trim().length > 0 && agreedToTerms;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(500).delay(100)}
          style={styles.content}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Create Your Profile
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Set up your Ghala account
            </Text>
          </View>

          {/* Wallet Address Display */}
          <View
            style={[
              styles.walletCard,
              {
                backgroundColor: colors.surface,
                borderColor: Colors.accent.ghalaGold,
              },
            ]}
          >
            <Text style={[styles.walletLabel, { color: colors.textSecondary }]}>
              Connected Wallet
            </Text>
            <Text style={[styles.walletAddress, { color: colors.textPrimary }]}>
              {formatAddress(walletAddress, 8, 6)}
            </Text>
          </View>

          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
              Username <Text style={{ color: Colors.semantic.error }}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="Enter a username"
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
            <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
              This is how you'll appear in the app
            </Text>
          </View>

          {/* Biometric Toggle */}
          {biometricAvailable && (
            <View
              style={[
                styles.settingCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.settingContent}>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                    Enable {biometricType}
                  </Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Unlock Ghala quickly with {biometricType}
                  </Text>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={setBiometricEnabled}
                  trackColor={{
                    false: colors.border,
                    true: Colors.accent.ghalaGold,
                  }}
                  thumbColor={Colors.base.white}
                  ios_backgroundColor={colors.border}
                />
              </View>
            </View>
          )}

          {/* Terms & Conditions */}
          <Pressable
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            style={styles.termsContainer}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: agreedToTerms ? Colors.accent.ghalaGold : colors.border,
                  backgroundColor: agreedToTerms
                    ? Colors.accent.ghalaGold
                    : 'transparent',
                },
              ]}
            >
              {agreedToTerms && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <Text style={[styles.termsText, { color: colors.textSecondary }]}>
              I agree to the{' '}
              <Text style={{ color: Colors.accent.ghalaGold, fontFamily: FontFamily.semibold }}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text style={{ color: Colors.accent.ghalaGold, fontFamily: FontFamily.semibold }}>
                Privacy Policy
              </Text>
            </Text>
          </Pressable>

          {/* Continue Button */}
          <Pressable
            onPress={handleContinue}
            disabled={!isFormValid}
            style={({ pressed }) => [
              styles.continueButton,
              {
                backgroundColor: isFormValid
                  ? Colors.accent.ghalaGold
                  : colors.border,
                borderColor: isFormValid ? Colors.base.black : colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.continueButtonText,
                {
                  color: isFormValid ? Colors.base.black : colors.textSecondary,
                },
              ]}
            >
              Continue
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    marginBottom: Spacing.xxxl,
  },
  title: {
    ...Typography.h1,
    fontFamily: FontFamily.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    fontFamily: FontFamily.regular,
  },
  walletCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    marginBottom: Spacing.xxxl,
  },
  walletLabel: {
    ...Typography.caption,
    fontFamily: FontFamily.medium,
    textTransform: 'uppercase',
    marginBottom: Spacing.xxs,
  },
  walletAddress: {
    ...Typography.h4,
    fontFamily: FontFamily.bold,
  },
  inputContainer: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    ...Typography.bodyMedium,
    fontFamily: FontFamily.semibold,
    marginBottom: Spacing.sm,
  },
  input: {
    height: 56,
    borderRadius: 0,
    borderWidth: 2,
    paddingHorizontal: Spacing.lg,
    ...Typography.body,
    fontFamily: FontFamily.regular,
  },
  inputHint: {
    ...Typography.caption,
    fontFamily: FontFamily.regular,
    marginTop: Spacing.xs,
  },
  settingCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    marginBottom: Spacing.xl,
  },
  settingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingTitle: {
    ...Typography.bodyMedium,
    fontFamily: FontFamily.semibold,
    marginBottom: Spacing.xxs,
  },
  settingDescription: {
    ...Typography.caption,
    fontFamily: FontFamily.regular,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xxxl,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.xs,
    borderWidth: 2,
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 14,
    color: Colors.base.black,
    fontFamily: FontFamily.bold,
  },
  termsText: {
    ...Typography.bodySmall,
    fontFamily: FontFamily.regular,
    flex: 1,
    lineHeight: 20,
  },
  continueButton: {
    height: 56,
    borderRadius: 0,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    ...Typography.button,
    fontFamily: FontFamily.bold,
    textTransform: 'uppercase',
  },
});

export default SignUpScreen;
