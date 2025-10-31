import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { Typography, Spacing, Layout, Borders } from '../constants/designTokens';
import { useTheme } from '../contexts/ThemeContext';
import { useWallet } from '../contexts/WalletProvider';

interface WalletConnectScreenProps {
  onConnectSuccess: (walletAddress: string) => void;
  onNeedHelp: () => void;
}

const WalletConnectScreen: React.FC<WalletConnectScreenProps> = ({
  onConnectSuccess,
  onNeedHelp,
}) => {
  const { colors, actualTheme } = useTheme();
  const { address, isConnected, open } = useWallet();

  const isDark = actualTheme === 'dark';
  const borderColor = isDark ? '#FFFFFF' : '#000000';
  const buttonBg = isDark ? '#000000' : '#000000';
  const buttonText = isDark ? '#FFFFFF' : '#FFFFFF';

  useEffect(() => {
    if (isConnected && address) {
      onConnectSuccess(address);
    }
  }, [isConnected, address, onConnectSuccess]);

  const handleConnectWallet = () => {
    open();
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
            style={({ pressed }) => [
              styles.connectButton,
              {
                backgroundColor: buttonBg,
                borderColor: borderColor,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            android_ripple={{ color: 'transparent' }}
          >
            <View style={styles.buttonContent}>
              <Feather name="link" size={22} color={buttonText} />
              <Text style={[styles.buttonText, { color: buttonText }]} numberOfLines={1}>
                CONNECT WALLET
              </Text>
            </View>
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
  buttonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    letterSpacing: 2,
    fontWeight: '700',
  },
});

export default WalletConnectScreen;