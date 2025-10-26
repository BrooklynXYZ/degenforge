import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Typography, Spacing, FontFamily, Shadows } from '../constants/designTokens';
import { useTheme } from '../contexts/ThemeContext';
import { connectWallet, initializeWalletConnect } from '../utils/walletConnect';

interface WalletConnectScreenProps {
  onConnectSuccess: (walletAddress: string) => void;
  onNeedHelp: () => void;
}

const WalletConnectScreen: React.FC<WalletConnectScreenProps> = ({
  onConnectSuccess,
  onNeedHelp,
}) => {
  const { colors } = useTheme();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);

      // Initialize WalletConnect if not already initialized
      await initializeWalletConnect();

      // For demo purposes, we'll simulate a wallet connection
      // In production, this would open the WalletConnect modal
      Alert.alert(
        'WalletConnect Demo',
        'In production, this would open the WalletConnect modal to select and connect your wallet.\n\nFor demo: Enter a test wallet address',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIsConnecting(false),
          },
          {
            text: 'Use Demo Address',
            onPress: () => {
              // Use a demo wallet address
              const demoAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
              onConnectSuccess(demoAddress);
              setIsConnecting(false);
            },
          },
        ]
      );

      // TODO: Replace with actual WalletConnect integration
      // const result = await connectWallet();
      // onConnectSuccess(result.address);
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      Alert.alert(
        'Connection Failed',
        error.message || 'Failed to connect wallet. Please try again.',
        [{ text: 'OK', onPress: () => setIsConnecting(false) }]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        entering={FadeInDown.duration(500).delay(100)}
        style={styles.content}
      >
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <Text style={[styles.logo, { color: Colors.accent.ghalaGold }]}>₿</Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Connect Your Wallet
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Connect your Web3 wallet to start using Ghala and unlock Bitcoin-backed DeFi
        </Text>

        {/* Connect Button */}
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={handleConnectWallet}
            disabled={isConnecting}
            style={({ pressed }) => [
              styles.connectButton,
              {
                backgroundColor: Colors.accent.ghalaGold,
                borderColor: Colors.base.black,
                opacity: pressed ? 0.8 : isConnecting ? 0.7 : 1,
              },
            ]}
          >
            {isConnecting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={Colors.base.black} size="small" />
                <Text style={[styles.buttonText, { marginLeft: Spacing.sm }]}>
                  Connecting...
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.walletIcon}>🔗</Text>
                <Text style={styles.buttonText}>Connect Wallet</Text>
              </>
            )}
          </Pressable>

          {/* Info Text */}
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Supports MetaMask, Rainbow, Coinbase Wallet, and more
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <FeatureItem
            icon="🔐"
            title="Secure"
            description="Your keys, your crypto"
            color={colors.textPrimary}
            secondaryColor={colors.textSecondary}
          />
          <FeatureItem
            icon="⚡"
            title="Fast"
            description="Quick connection via QR"
            color={colors.textPrimary}
            secondaryColor={colors.textSecondary}
          />
          <FeatureItem
            icon="🌐"
            title="Compatible"
            description="Works with all major wallets"
            color={colors.textPrimary}
            secondaryColor={colors.textSecondary}
          />
        </View>

        {/* Help Link */}
        <Pressable
          onPress={onNeedHelp}
          style={({ pressed }) => [
            styles.helpButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Text style={[styles.helpText, { color: Colors.accent.ghalaGold }]}>
            Need help connecting?
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
  color: string;
  secondaryColor: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
  icon,
  title,
  description,
  color,
  secondaryColor,
}) => {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={[styles.featureTitle, { color }]}>{title}</Text>
      <Text style={[styles.featureDescription, { color: secondaryColor }]}>
        {description}
      </Text>
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
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 2,
    borderColor: Colors.accent.ghalaGold,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.xxxl,
  },
  logo: {
    fontSize: 64,
  },
  title: {
    ...Typography.h1,
    fontFamily: FontFamily.bold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.body,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.md,
  },
  buttonContainer: {
    marginBottom: Spacing.xxxl,
  },
  connectButton: {
    height: 56,
    borderRadius: 0,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  buttonText: {
    ...Typography.button,
    fontFamily: FontFamily.bold,
    color: Colors.base.black,
    textTransform: 'uppercase',
  },
  infoText: {
    ...Typography.caption,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxxl,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  featureTitle: {
    ...Typography.labelMedium,
    fontFamily: FontFamily.semibold,
    marginBottom: Spacing.xxs,
  },
  featureDescription: {
    ...Typography.caption,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
  },
  helpButton: {
    paddingVertical: Spacing.md,
    alignSelf: 'center',
  },
  helpText: {
    ...Typography.bodyMedium,
    fontFamily: FontFamily.semibold,
    textDecorationLine: 'underline',
  },
});

export default WalletConnectScreen;
