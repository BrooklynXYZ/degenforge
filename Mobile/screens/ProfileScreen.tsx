import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
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
import {
  Colors,
  Spacing,
  Typography,
  Layout,
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
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>('mainnet');
  const [rpcProvider, setRpcProvider] = useState<'spectrum' | 'custom'>('spectrum');

  // Mock data
  const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';
  const mezoRpcEndpoint = 'https://mezo-rpc.example.com';
  const spectrumEndpoint = 'https://spectrum.example.com';

  const truncateAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    console.log('Copied:', text);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Wallet Address */}
      <Animated.View
        style={styles.section}
        entering={FadeInDown.duration(400).delay(100)}
      >
        <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>
          Wallet Address
        </Text>
        <SectionCard borderRadius="none">
          <View style={styles.cardContent}>
            <Text
              style={[
                styles.addressText,
                { color: themeColors.textPrimary },
              ]}
            >
              {truncateAddress(walletAddress)}
            </Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(walletAddress)}
            >
              <Feather name="copy" size={20} color={themeColors.textPrimary} />
            </TouchableOpacity>
          </View>
        </SectionCard>
      </Animated.View>

      {/* Network Section */}
      <Animated.View
        style={styles.section}
        entering={FadeInDown.duration(400).delay(150)}
      >
        <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>
          Network
        </Text>
        <SectionCard borderRadius="none">
          <View style={styles.cardContent}>
            <Text style={[styles.settingLabel, { color: themeColors.textPrimary }]}>
              {network === 'mainnet' ? 'Mainnet' : 'Testnet'}
            </Text>
            <Switch
              value={network === 'testnet'}
              onValueChange={(value) =>
                setNetwork(value ? 'testnet' : 'mainnet')
              }
              trackColor={{
                false: themeColors.borderSecondary,
                true: themeColors.textPrimary,
              }}
              thumbColor={Colors.base.white}
              ios_backgroundColor={themeColors.borderSecondary}
            />
          </View>
        </SectionCard>
      </Animated.View>

      {/* RPC Configuration */}
      <Animated.View
        style={styles.section}
        entering={FadeInDown.duration(400).delay(175)}
      >
        <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>
          RPC Provider
        </Text>
        <View style={styles.rpcGrid}>
          <TouchableOpacity
            style={[
              styles.rpcOption,
              {
                borderColor: themeColors.border,
                backgroundColor:
                  rpcProvider === 'spectrum'
                    ? themeColors.textPrimary
                    : themeColors.surface,
              },
            ]}
            onPress={() => setRpcProvider('spectrum')}
          >
            <Text
              style={[
                styles.rpcLabel,
                {
                  color:
                    rpcProvider === 'spectrum'
                      ? themeColors.textInverse
                      : themeColors.textPrimary,
                },
              ]}
            >
              SPECTRUM
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.rpcOption,
              {
                borderColor: themeColors.border,
                backgroundColor:
                  rpcProvider === 'custom'
                    ? themeColors.textPrimary
                    : themeColors.surface,
              },
            ]}
            onPress={() => setRpcProvider('custom')}
          >
            <Text
              style={[
                styles.rpcLabel,
                {
                  color:
                    rpcProvider === 'custom'
                      ? themeColors.textInverse
                      : themeColors.textPrimary,
                },
              ]}
            >
              CUSTOM
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.View
        style={styles.section}
        entering={FadeInDown.duration(400).delay(180)}
      >
        <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>
          Endpoints
        </Text>
        <SectionCard borderRadius="none" style={{ marginBottom: Spacing.xs }}>
          <View style={styles.endpointRow}>
            <Text style={[styles.endpointLabel, { color: themeColors.textSecondary }]}>
              Mezo RPC
            </Text>
            <Text style={[styles.endpointValue, { color: themeColors.textTertiary }]}>
              {mezoRpcEndpoint.substring(0, 30)}...
            </Text>
          </View>
        </SectionCard>
        <SectionCard borderRadius="none">
          <View style={styles.endpointRow}>
            <Text style={[styles.endpointLabel, { color: themeColors.textSecondary }]}>
              Spectrum
            </Text>
            <Text style={[styles.endpointValue, { color: themeColors.textTertiary }]}>
              {spectrumEndpoint.substring(0, 30)}...
            </Text>
          </View>
        </SectionCard>
      </Animated.View>

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

      {/* Security Section */}
      <Animated.View
        style={styles.section}
        entering={FadeInDown.duration(400).delay(250)}
      >
        <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>
          Security
        </Text>
        <TouchableOpacity
          style={[
            styles.menuItem,
            { borderColor: themeColors.border, backgroundColor: themeColors.surface },
          ]}
          onPress={() => console.log('Biometric pressed')}
        >
          <Feather name="lock" size={20} color={themeColors.textPrimary} />
          <Text style={[styles.menuLabel, { color: themeColors.textPrimary }]}>
            Biometric Authentication
          </Text>
          <Feather name="chevron-right" size={20} color={themeColors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.menuItem,
            { borderColor: themeColors.border, backgroundColor: themeColors.surface },
          ]}
          onPress={() => console.log('Backup pressed')}
        >
          <Feather name="key" size={20} color={themeColors.textPrimary} />
          <Text style={[styles.menuLabel, { color: themeColors.textPrimary }]}>
            Private Key Backup
          </Text>
          <Feather name="chevron-right" size={20} color={themeColors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.menuItem,
            {
              borderColor: themeColors.border,
              backgroundColor: themeColors.surfaceSecondary,
            },
          ]}
          onPress={() => console.log('Reset pressed')}
        >
          <Feather name="alert-triangle" size={20} color={themeColors.error} />
          <Text style={[styles.menuLabel, { color: themeColors.textPrimary }]}>
            Reset Wallet
          </Text>
          <Feather name="chevron-right" size={20} color={themeColors.textSecondary} />
        </TouchableOpacity>
      </Animated.View>

      {/* About Section */}
      <Animated.View
        style={styles.section}
        entering={FadeInDown.duration(400).delay(300)}
      >
        <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>
          About
        </Text>
        <SectionCard borderRadius="none" style={{ marginBottom: Spacing.xs }}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>
              Version
            </Text>
            <Text style={[styles.infoValue, { color: themeColors.textPrimary }]}>
              1.0.0
            </Text>
          </View>
        </SectionCard>
        <SectionCard borderRadius="none" style={{ marginBottom: Spacing.xs }}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>
              Build
            </Text>
            <Text style={[styles.infoValue, { color: themeColors.textPrimary }]}>
              2024.01.15
            </Text>
          </View>
        </SectionCard>
        <SectionCard borderRadius="none">
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>
              Network
            </Text>
            <Text style={[styles.infoValue, { color: themeColors.textPrimary }]}>
              Solana Mainnet
            </Text>
          </View>
        </SectionCard>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View
        style={styles.actionsSection}
        entering={FadeInDown.duration(400).delay(350)}
      >
        <ActionButton
          variant="secondary"
          fullWidth
          onPress={() => console.log('Support pressed')}
        >
          Support
        </ActionButton>
        <ActionButton
          variant="primary"
          fullWidth
          onPress={() => console.log('Logout pressed')}
        >
          Disconnect
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
  addressText: {
    ...Typography.body,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontVariant: ['tabular-nums'],
  },
  copyButton: {
    padding: Spacing.xs,
  },
  settingLabel: {
    ...Typography.body,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  // Theme selector styles
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
  // RPC selector styles
  rpcGrid: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  rpcOption: {
    flex: 1,
    padding: Spacing.lg,
    borderWidth: Borders.width.thick,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpcLabel: {
    ...Typography.label,
    fontFamily: 'SpaceGrotesk_700Bold',
    letterSpacing: 0.8,
  },
  endpointRow: {
    flex: 1,
  },
  endpointLabel: {
    ...Typography.caption,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    marginBottom: Spacing.xxs,
  },
  endpointValue: {
    ...Typography.caption,
    fontFamily: 'SpaceGrotesk_400Regular',
    fontVariant: ['tabular-nums'],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderWidth: Borders.width.thick,
    marginBottom: Spacing.xs,
  },
  menuLabel: {
    flex: 1,
    ...Typography.body,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  infoRow: {
    flex: 1,
  },
  infoLabel: {
    ...Typography.caption,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    marginBottom: Spacing.xxs,
  },
  infoValue: {
    ...Typography.body,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  actionsSection: {
    gap: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  bottomSpacer: {
    height: 120,
  },
});
