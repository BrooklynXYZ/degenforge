import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Layout } from '@/constants/designTokens';
import { ActionButton } from '@/components/ui/ActionButton';

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>('mainnet');
  const [rpcProvider, setRpcProvider] = useState<'spectrum' | 'custom'>('spectrum');
  const [isDarkMode, setIsDarkMode] = useState(false);

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
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Wallet settings & configuration</Text>
      </View>

      {/* Wallet Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wallet</Text>
        <View style={styles.walletCard}>
          <View style={styles.walletInfo}>
            <Text style={styles.walletLabel}>Wallet Address</Text>
            <Text style={styles.walletAddress}>{truncateAddress(walletAddress)}</Text>
          </View>
          <ActionButton
            variant="secondary"
            size="sm"
            onPress={() => copyToClipboard(walletAddress)}
          >
            Copy
          </ActionButton>
        </View>
      </View>

      {/* Network Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Network</Text>
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Network</Text>
              <Text style={styles.settingValue}>
                {network === 'mainnet' ? 'Mainnet' : 'Testnet'}
              </Text>
            </View>
            <Switch
              value={network === 'testnet'}
              onValueChange={(value) =>
                setNetwork(value ? 'testnet' : 'mainnet')
              }
              trackColor={{
                false: Colors.neutral[200],
                true: Colors.accent.light,
              }}
              thumbColor={network === 'testnet' ? Colors.accent.primary : Colors.neutral[400]}
            />
          </View>
        </View>
      </View>

      {/* RPC Configuration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>RPC Configuration</Text>

        {/* Mezo RPC */}
        <View style={styles.configCard}>
          <Text style={styles.configLabel}>Mezo RPC Endpoint</Text>
          <View style={styles.configValueContainer}>
            <Text style={styles.configValue}>{mezoRpcEndpoint}</Text>
            <Text style={styles.configNote}>(Placeholder - not exposed)</Text>
          </View>
        </View>

        {/* RPC Provider Selection */}
        <View style={styles.settingCard}>
          <Text style={styles.settingLabel}>RPC Provider</Text>
          <View style={styles.rpcOptions}>
            <RpcOption
              label="Spectrum"
              selected={rpcProvider === 'spectrum'}
              onPress={() => setRpcProvider('spectrum')}
            />
            <RpcOption
              label="Custom"
              selected={rpcProvider === 'custom'}
              onPress={() => setRpcProvider('custom')}
            />
          </View>
        </View>

        {/* Spectrum Endpoint */}
        <View style={styles.configCard}>
          <Text style={styles.configLabel}>Spectrum Endpoint</Text>
          <View style={styles.configValueContainer}>
            <Text style={styles.configValue}>{spectrumEndpoint}</Text>
            <Text style={styles.configNote}>(Placeholder - not exposed)</Text>
          </View>
        </View>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingValue}>
                {isDarkMode ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{
                false: Colors.neutral[200],
                true: Colors.accent.light,
              }}
              thumbColor={isDarkMode ? Colors.accent.primary : Colors.neutral[400]}
            />
          </View>
        </View>
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.securityCard}>
          <SecurityItem
            icon="🔐"
            title="Biometric Authentication"
            description="Use fingerprint or face ID"
            onPress={() => console.log('Biometric pressed')}
          />
          <SecurityItem
            icon="🔑"
            title="Private Key Backup"
            description="Securely backup your keys"
            onPress={() => console.log('Backup pressed')}
          />
          <SecurityItem
            icon="⚠️"
            title="Reset Wallet"
            description="Clear all data and start fresh"
            onPress={() => console.log('Reset pressed')}
            danger
          />
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutCard}>
          <AboutRow label="App Version" value="1.0.0" />
          <AboutRow label="Build" value="2024.01.15" />
          <AboutRow label="Network" value="Solana Mainnet" />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <ActionButton
          variant="secondary"
          fullWidth
          onPress={() => console.log('Support pressed')}
        >
          Support & Feedback
        </ActionButton>
        <ActionButton
          variant="secondary"
          fullWidth
          onPress={() => console.log('Logout pressed')}
        >
          Disconnect Wallet
        </ActionButton>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

interface RpcOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const RpcOption: React.FC<RpcOptionProps> = ({ label, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.rpcOption, selected && styles.rpcOptionSelected]}
    onPress={onPress}
  >
    <View
      style={[
        styles.rpcRadio,
        selected && styles.rpcRadioSelected,
      ]}
    >
      {selected && <View style={styles.rpcRadioDot} />}
    </View>
    <Text style={[styles.rpcLabel, selected && styles.rpcLabelSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

interface SecurityItemProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  danger?: boolean;
}

const SecurityItem: React.FC<SecurityItemProps> = ({
  icon,
  title,
  description,
  onPress,
  danger,
}) => (
  <TouchableOpacity
    style={[styles.securityItem, danger && styles.securityItemDanger]}
    onPress={onPress}
  >
    <Text style={styles.securityIcon}>{icon}</Text>
    <View style={styles.securityContent}>
      <Text style={[styles.securityTitle, danger && styles.securityTitleDanger]}>
        {title}
      </Text>
      <Text style={styles.securityDescription}>{description}</Text>
    </View>
    <Text style={styles.chevron}>›</Text>
  </TouchableOpacity>
);

interface AboutRowProps {
  label: string;
  value: string;
}

const AboutRow: React.FC<AboutRowProps> = ({ label, value }) => (
  <View style={styles.aboutRow}>
    <Text style={styles.aboutLabel}>{label}</Text>
    <Text style={styles.aboutValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  contentContainer: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  walletInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  walletLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  walletAddress: {
    ...Typography.bodyMedium,
    color: Colors.accent.primary,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  settingCard: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  settingValue: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  configCard: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  configLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  configValueContainer: {
    gap: Spacing.xs,
  },
  configValue: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontFamily: 'monospace',
  },
  configNote: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
  rpcOptions: {
    gap: Spacing.md,
  },
  rpcOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bg.primary,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  rpcOptionSelected: {
    backgroundColor: Colors.accent.light,
    borderColor: Colors.accent.primary,
  },
  rpcRadio: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.circle,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpcRadioSelected: {
    borderColor: Colors.accent.primary,
  },
  rpcRadioDot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.circle,
    backgroundColor: Colors.accent.primary,
  },
  rpcLabel: {
    ...Typography.bodySmall,
    color: Colors.text.primary,
  },
  rpcLabelSelected: {
    fontWeight: '600',
    color: Colors.accent.primary,
  },
  securityCard: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  securityItemDanger: {
    backgroundColor: Colors.semantic.error,
    opacity: 0.05,
  },
  securityIcon: {
    fontSize: 24,
  },
  securityContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  securityTitle: {
    ...Typography.bodySmall,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  securityTitleDanger: {
    color: Colors.semantic.error,
  },
  securityDescription: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  chevron: {
    fontSize: 20,
    color: Colors.text.tertiary,
  },
  aboutCard: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutLabel: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  aboutValue: {
    ...Typography.bodySmall,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  actionsSection: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  bottomSpacer: {
    height: 120,
  },
});
