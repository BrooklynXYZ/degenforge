import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { Typography, Spacing, Layout, Borders } from '../constants/designTokens';
import { useTheme } from '../contexts/ThemeContext';
import { initializeWalletConnect } from '../utils/walletConnect';

interface WalletConnectScreenProps {
  onConnectSuccess: (walletAddress: string) => void;
  onNeedHelp: () => void;
}

const WalletConnectScreen: React.FC<WalletConnectScreenProps> = ({
  onConnectSuccess,
  onNeedHelp,
}) => {
  const { colors, actualTheme } = useTheme();
  const [isConnecting, setIsConnecting] = useState(false);

  const isDark = actualTheme === 'dark';
  const borderColor = isDark ? '#FFFFFF' : '#000000';
  const buttonBg = isDark ? '#000000' : '#000000';
  const buttonText = isDark ? '#FFFFFF' : '#FFFFFF';

  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);

      await initializeWalletConnect();

      Alert.alert(
        'WalletConnect',
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
              const demoAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
              onConnectSuccess(demoAddress);
              setIsConnecting(false);
            },
          },
        ]
      );
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
        entering={FadeInDown.duration(600).delay(100)}
        style={styles.content}
      >
        <View style={styles.header}>
          <Animated.Text
            entering={FadeInUp.duration(600).delay(200)}
            style={[styles.brand, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            GHALA
          </Animated.Text>
          <Animated.View
            entering={FadeInUp.duration(600).delay(300)}
            style={[styles.brandUnderline, { backgroundColor: borderColor }]}
          />
        </View>

        <Animated.View
          entering={FadeInDown.duration(600).delay(400)}
          style={styles.titleSection}
        >
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
            Connect Your Wallet
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={3}>
            Connect your Web3 wallet to access Bitcoin-backed DeFi
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(600).delay(500)}
          style={styles.buttonSection}
        >
          <Pressable
            onPress={handleConnectWallet}
            disabled={isConnecting}
            style={({ pressed }) => [
              styles.connectButton,
              {
                backgroundColor: buttonBg,
                borderColor: borderColor,
                opacity: pressed ? 0.85 : isConnecting ? 0.7 : 1,
              },
            ]}
            android_ripple={{ color: 'transparent' }}
          >
            {isConnecting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={buttonText} size="small" />
                <Text
                  style={[styles.buttonText, { color: buttonText, marginLeft: Spacing.md }]}
                  numberOfLines={1}
                >
                  CONNECTING
                </Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Feather name="link" size={22} color={buttonText} />
                <Text style={[styles.buttonText, { color: buttonText }]} numberOfLines={1}>
                  CONNECT WALLET
                </Text>
              </View>
            )}
          </Pressable>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(600).delay(600)}
          style={styles.footer}
        >
          <Pressable
            onPress={onNeedHelp}
            style={({ pressed }) => [
              styles.helpButton,
              { borderColor, opacity: pressed ? 0.6 : 1 },
            ]}
            android_ripple={{ color: 'transparent' }}
          >
            <Text style={[styles.helpText, { color: colors.textSecondary }]} numberOfLines={1}>
              Need help connecting?
            </Text>
            <Feather name="arrow-right" size={16} color={colors.textSecondary} />
          </Pressable>
        </Animated.View>
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
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.xxxxl + Spacing.xl,
    paddingBottom: Spacing.xxxl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxxl + Spacing.xxl,
  },
  brand: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: 6,
    textTransform: 'uppercase',
    marginBottom: Spacing.lg,
  },
  brandUnderline: {
    width: 140,
    height: 4,
  },
  titleSection: {
    marginBottom: Spacing.xxxxl + Spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...Typography.h1,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 32,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...Typography.body,
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.xl,
    opacity: 0.8,
  },
  buttonSection: {
    marginBottom: Spacing.xxxxl + Spacing.xl,
  },
  connectButton: {
    height: 68,
    borderWidth: Borders.width.thick,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    letterSpacing: 2,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: Borders.width.regular,
  },
  helpText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});

export default WalletConnectScreen;

