import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Clipboard,
  Linking,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { ActionButton } from '@/components/ui/ActionButton';
import { SectionCard } from '@/components/ui/Card';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletProvider';
import EthereumWalletService from '@/services/EthereumWalletService';
import {
  Colors,
  Spacing,
  Typography,
  Borders,
} from '@/constants/designTokens';

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
}

// Theme Selector Component
interface ThemeSelectorProps {
  selectedTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  themeColors: ReturnType<typeof useTheme>['colors'];
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onThemeChange,
  themeColors,
}) => {
  const themes: { mode: ThemeMode; label: string; icon: string; description: string }[] = [
    { mode: 'light', label: 'LIGHT', icon: 'sun', description: 'Always use light theme' },
    { mode: 'dark', label: 'DARK', icon: 'moon', description: 'Always use dark theme' },
    { mode: 'system', label: 'SYSTEM', icon: 'smartphone', description: 'Follow system setting' },
  ];

  const ThemeOption: React.FC<{ theme: typeof themes[0] }> = ({ theme }) => {
    const scale = useSharedValue(1);
    const isSelected = selectedTheme === theme.mode;

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    };

    return (
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <TouchableOpacity
          style={[
            styles.themeOption,
            {
              borderColor: themeColors.border,
              backgroundColor: isSelected
                ? themeColors.textPrimary
                : themeColors.surface,
            },
          ]}
          onPress={() => onThemeChange(theme.mode)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <Feather
            name={theme.icon as any}
            size={24}
            color={isSelected ? themeColors.textInverse : themeColors.textPrimary}
          />
          <Text
            style={[
              styles.themeLabel,
              {
                color: isSelected ? themeColors.textInverse : themeColors.textPrimary,
              },
            ]}
          >
            {theme.label}
          </Text>
          <Text
            style={[
              styles.themeDescription,
              {
                color: isSelected ? themeColors.textInverse : themeColors.textSecondary,
              },
            ]}
          >
            {theme.description}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.themeGrid}>
      {themes.map((theme) => (
        <ThemeOption key={theme.mode} theme={theme} />
      ))}
    </View>
  );
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
  const { themeMode, setThemeMode, colors: themeColors, actualTheme } = useTheme();
  const { logout, biometricEnabled, disableBiometric } = useAuth();
  const { address, disconnect } = useWallet();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showFullAddress, setShowFullAddress] = useState(false);

  const isDark = actualTheme === 'dark';

  const truncateAddress = (addr: string): string => {
    if (showFullAddress) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setString(text);
    Alert.alert('✓ Copied', 'Wallet address copied to clipboard');
  };

  const handleDisconnect = async () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDisconnecting(true);
              await disconnect();
              await logout();
            } catch (error) {
              console.error('Error during disconnect:', error);
              Alert.alert('Error', 'Failed to disconnect wallet');
            } finally {
              setIsDisconnecting(false);
            }
          },
        },
      ]
    );
  };

  const handleBiometricToggle = async () => {
    if (biometricEnabled) {
      Alert.alert(
        'Disable Biometric',
        'Disable biometric authentication for this app?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            onPress: async () => {
              try {
                await disableBiometric();
                Alert.alert('Success', 'Biometric authentication disabled');
              } catch (error) {
                Alert.alert('Error', 'Failed to disable biometric');
              }
            },
          },
        ]
      );
    } else {
      Alert.alert('Info', 'Enable biometric from login screen');
    }
  };

  const handleOpenFaucet = () => {
    Linking.openURL(EthereumWalletService.getFaucetUrl());
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {address && (
        <Animated.View
          style={styles.section}
          entering={FadeInDown.duration(400).delay(100)}
        >
          <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>
            Connected Wallet
          </Text>
          <SectionCard borderRadius="none">
            <View style={styles.addressContainer}>
              <TouchableOpacity
                style={styles.addressTouchable}
                onPress={() => setShowFullAddress(!showFullAddress)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.addressText,
                    { color: themeColors.textPrimary },
                  ]}
                  numberOfLines={showFullAddress ? undefined : 1}
                >
                  {truncateAddress(address)}
                </Text>
                <Text style={[styles.addressHint, { color: themeColors.textTertiary }]}>
                  {showFullAddress ? 'Tap to hide' : 'Tap to view full address'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copyToClipboard(address)}
              >
                <Feather name="copy" size={20} color={themeColors.textPrimary} />
              </TouchableOpacity>
            </View>
          </SectionCard>
          <TouchableOpacity
            style={[styles.faucetButton, { backgroundColor: Colors.accent.primary }]}
            onPress={handleOpenFaucet}
            activeOpacity={0.8}
          >
            <Feather name="droplet" size={18} color="#000" />
            <Text style={styles.faucetText}>Get Testnet Funds</Text>
            <Feather name="external-link" size={14} color="#000" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Appearance Section */}
      <Animated.View
        style={styles.section}
        entering={FadeInDown.duration(400).delay(200)}
      >
        <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>
          Appearance
        </Text>
        <ThemeSelector
          selectedTheme={themeMode}
          onThemeChange={setThemeMode}
          themeColors={themeColors}
        />
      </Animated.View>

      <Animated.View
        style={styles.section}
        entering={FadeInDown.duration(400).delay(250)}
      >
        <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>
          Security
        </Text>
        <SectionCard borderRadius="none">
          <View style={styles.cardContent}>
            <View style={styles.biometricRow}>
              <Feather name="lock" size={20} color={themeColors.textPrimary} />
              <Text style={[styles.settingLabel, { color: themeColors.textPrimary }]}>
                Biometric Auth
              </Text>
            </View>
            <TouchableOpacity onPress={handleBiometricToggle}>
              <Text style={[styles.biometricStatus, { color: themeColors.textSecondary }]}>
                {biometricEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </TouchableOpacity>
          </View>
        </SectionCard>
      </Animated.View>
      <Animated.View
        style={styles.actionsSection}
        entering={FadeInDown.duration(400).delay(350)}
      >
        <ActionButton
          variant="primary"
          fullWidth
          onPress={handleDisconnect}
          disabled={isDisconnecting}
          style={{
            borderColor: isDark ? '#FFFFFF' : '#000000',
          }}
        >
          {isDisconnecting ? 'Disconnecting...' : 'Disconnect Wallet'}
        </ActionButton>
      </Animated.View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxxl,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionLabel: {
    ...Typography.label,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  addressTouchable: {
    flex: 1,
  },
  addressText: {
    ...Typography.body,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontVariant: ['tabular-nums'],
    fontSize: 14,
    marginBottom: Spacing.xxs,
  },
  addressHint: {
    ...Typography.caption,
    fontSize: 11,
  },
  copyButton: {
    padding: Spacing.xs,
  },
  settingLabel: {
    ...Typography.body,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  biometricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  biometricStatus: {
    ...Typography.body,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  themeGrid: {
    gap: Spacing.xs,
  },
  themeOption: {
    padding: Spacing.lg,
    borderWidth: Borders.width.thick,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  themeLabel: {
    ...Typography.label,
    fontFamily: 'SpaceGrotesk_700Bold',
    letterSpacing: 0.8,
    marginTop: Spacing.sm,
  },
  themeDescription: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: Spacing.xxs,
  },
  actionsSection: {
    gap: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  bottomSpacer: {
    height: 120,
  },
  faucetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.md,
  },
  faucetText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
