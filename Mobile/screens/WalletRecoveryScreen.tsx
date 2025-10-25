import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Typography, Spacing, FontFamily, BorderRadius } from '../constants/designTokens';
import { useTheme } from '../contexts/ThemeContext';

interface WalletRecoveryScreenProps {
  onConnectDifferentWallet: () => void;
  onGoBack: () => void;
}

const WalletRecoveryScreen: React.FC<WalletRecoveryScreenProps> = ({
  onConnectDifferentWallet,
  onGoBack,
}) => {
  const { colors } = useTheme();

  const openExternalLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open URL:', err)
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(500).delay(100)}
          style={styles.content}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerIcon}>🆘</Text>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Need Help?
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Choose an option below to recover access to your wallet
            </Text>
          </View>

          {/* Help Options */}
          <View style={styles.optionsContainer}>
            {/* Option 1: Use Recovery Phrase */}
            <HelpCard
              icon="🔑"
              title="Use Recovery Phrase"
              description="Access your wallet using your 12 or 24-word recovery phrase in your wallet app"
              steps={[
                'Open your wallet app (MetaMask, Rainbow, etc.)',
                'Select "Import wallet" or "Restore wallet"',
                'Enter your recovery phrase',
                'Return here and connect your wallet',
              ]}
              colors={colors}
            />

            {/* Option 2: Connect Different Wallet */}
            <Pressable
              onPress={onConnectDifferentWallet}
              style={({ pressed }) => [
                styles.actionCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: Colors.accent.ghalaGold,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={styles.cardIcon}>🔄</Text>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Connect a Different Wallet
              </Text>
              <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
                Connect using another wallet address
              </Text>
            </Pressable>

            {/* Option 3: Create New Wallet */}
            <HelpCard
              icon="➕"
              title="Create a New Wallet"
              description="If you don't have a wallet yet, you'll need to create one"
              steps={[
                'Download a wallet app (MetaMask recommended)',
                'Follow the setup instructions',
                'IMPORTANT: Save your recovery phrase securely',
                'Return here and connect your new wallet',
              ]}
              colors={colors}
              action={{
                label: 'Download MetaMask',
                onPress: () => openExternalLink('https://metamask.io/download/'),
              }}
            />
          </View>

          {/* Important Notice */}
          <View
            style={[
              styles.noticeCard,
              {
                backgroundColor: 'rgba(234, 193, 25, 0.1)',
                borderColor: Colors.accent.ghalaGold,
              },
            ]}
          >
            <Text style={[styles.noticeTitle, { color: Colors.accent.ghalaGold }]}>
              ⚠️ Important Security Tips
            </Text>
            <Text style={[styles.noticeText, { color: colors.textPrimary }]}>
              • Never share your recovery phrase with anyone{'\n'}
              • Ghala will never ask for your recovery phrase{'\n'}
              • Store your recovery phrase in a secure location{'\n'}
              • Beware of phishing attempts and scams
            </Text>
          </View>

          {/* Back Button */}
          <Pressable
            onPress={onGoBack}
            style={({ pressed }) => [
              styles.backButton,
              {
                borderColor: colors.border,
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>
              ← Go Back
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

interface HelpCardProps {
  icon: string;
  title: string;
  description: string;
  steps: string[];
  colors: any;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const HelpCard: React.FC<HelpCardProps> = ({
  icon,
  title,
  description,
  steps,
  colors,
  action,
}) => {
  return (
    <View
      style={[
        styles.helpCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={styles.cardIcon}>{icon}</Text>
      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
        {description}
      </Text>

      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <View
              style={[
                styles.stepNumber,
                {
                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                  borderColor: Colors.accent.ghalaGold,
                },
              ]}
            >
              <Text style={[styles.stepNumberText, { color: Colors.accent.ghalaGold }]}>
                {index + 1}
              </Text>
            </View>
            <Text style={[styles.stepText, { color: colors.textPrimary }]}>{step}</Text>
          </View>
        ))}
      </View>

      {action && (
        <Pressable
          onPress={action.onPress}
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: Colors.accent.ghalaGold,
              borderColor: Colors.base.black,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={styles.actionButtonText}>{action.label}</Text>
        </Pressable>
      )}
    </View>
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
    padding: Spacing.xl,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  headerIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    fontFamily: FontFamily.bold,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  optionsContainer: {
    marginBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  helpCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  actionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.h4,
    fontFamily: FontFamily.bold,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  cardDescription: {
    ...Typography.bodySmall,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  stepsContainer: {
    gap: Spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  stepNumberText: {
    ...Typography.caption,
    fontFamily: FontFamily.bold,
    fontSize: 11,
  },
  stepText: {
    ...Typography.bodySmall,
    fontFamily: FontFamily.regular,
    flex: 1,
    lineHeight: 20,
  },
  actionButton: {
    height: 48,
    borderRadius: 0,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  actionButtonText: {
    ...Typography.button,
    fontFamily: FontFamily.bold,
    color: Colors.base.black,
    fontSize: 14,
  },
  noticeCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    marginBottom: Spacing.xl,
  },
  noticeTitle: {
    ...Typography.bodyMedium,
    fontFamily: FontFamily.bold,
    marginBottom: Spacing.sm,
  },
  noticeText: {
    ...Typography.bodySmall,
    fontFamily: FontFamily.regular,
    lineHeight: 20,
  },
  backButton: {
    height: 56,
    borderRadius: 0,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  backButtonText: {
    ...Typography.bodyMedium,
    fontFamily: FontFamily.semibold,
  },
});

export default WalletRecoveryScreen;
