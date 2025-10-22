import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
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
      {/* Wallet Address */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Wallet Address</Text>
        <View style={styles.card}>
          <Text style={styles.addressText}>{truncateAddress(walletAddress)}</Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyToClipboard(walletAddress)}
          >
            <Feather name="copy" size={20} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Network Section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Network</Text>
        <View style={styles.card}>
          <Text style={styles.settingLabel}>
            {network === 'mainnet' ? 'Mainnet' : 'Testnet'}
          </Text>
          <Switch
            value={network === 'testnet'}
            onValueChange={(value) =>
              setNetwork(value ? 'testnet' : 'mainnet')
            }
            trackColor={{ false: '#E5E5E5', true: '#000000' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#E5E5E5"
          />
        </View>
      </View>

      {/* RPC Configuration */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>RPC Provider</Text>
        <View style={styles.rpcGrid}>
          <TouchableOpacity
            style={[
              styles.rpcOption,
              rpcProvider === 'spectrum' && styles.rpcOptionSelected,
            ]}
            onPress={() => setRpcProvider('spectrum')}
          >
            <Text
              style={[
                styles.rpcLabel,
                rpcProvider === 'spectrum' && styles.rpcLabelSelected,
              ]}
            >
              SPECTRUM
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.rpcOption,
              rpcProvider === 'custom' && styles.rpcOptionSelected,
            ]}
            onPress={() => setRpcProvider('custom')}
          >
            <Text
              style={[
                styles.rpcLabel,
                rpcProvider === 'custom' && styles.rpcLabelSelected,
              ]}
            >
              CUSTOM
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Endpoints</Text>
        <View style={styles.card}>
          <View style={styles.endpointRow}>
            <Text style={styles.endpointLabel}>Mezo RPC</Text>
            <Text style={styles.endpointValue}>
              {mezoRpcEndpoint.substring(0, 30)}...
            </Text>
          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.endpointRow}>
            <Text style={styles.endpointLabel}>Spectrum</Text>
            <Text style={styles.endpointValue}>
              {spectrumEndpoint.substring(0, 30)}...
            </Text>
          </View>
        </View>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Appearance</Text>
        <View style={styles.card}>
          <Text style={styles.settingLabel}>
            Dark Mode ({isDarkMode ? 'On' : 'Off'})
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{ false: '#E5E5E5', true: '#000000' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#E5E5E5"
          />
        </View>
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Security</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => console.log('Biometric pressed')}
        >
          <Feather name="lock" size={20} color="#000000" />
          <Text style={styles.menuLabel}>Biometric Authentication</Text>
          <Feather name="chevron-right" size={20} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => console.log('Backup pressed')}
        >
          <Feather name="key" size={20} color="#000000" />
          <Text style={styles.menuLabel}>Private Key Backup</Text>
          <Feather name="chevron-right" size={20} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuItem, styles.menuItemDanger]}
          onPress={() => console.log('Reset pressed')}
        >
          <Feather name="alert-triangle" size={20} color="#000000" />
          <Text style={styles.menuLabel}>Reset Wallet</Text>
          <Feather name="chevron-right" size={20} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>2024.01.15</Text>
          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Network</Text>
            <Text style={styles.infoValue}>Solana Mainnet</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
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
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666666',
    fontFamily: 'SpaceGrotesk_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderWidth: 2,
    borderColor: '#000000',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontVariant: ['tabular-nums'],
  },
  copyButton: {
    padding: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  rpcGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  rpcOption: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpcOptionSelected: {
    borderColor: '#000000',
    backgroundColor: '#000000',
  },
  rpcLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'SpaceGrotesk_700Bold',
    letterSpacing: 0.8,
  },
  rpcLabelSelected: {
    color: '#FFFFFF',
  },
  endpointRow: {
    flex: 1,
  },
  endpointLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    fontFamily: 'SpaceGrotesk_600SemiBold',
    marginBottom: 4,
  },
  endpointValue: {
    fontSize: 12,
    color: '#999999',
    fontFamily: 'SpaceGrotesk_400Regular',
    fontVariant: ['tabular-nums'],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#000000',
    marginBottom: 8,
  },
  menuItemDanger: {
    borderColor: '#000000',
    backgroundColor: '#FAFAFA',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  infoRow: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    fontFamily: 'SpaceGrotesk_600SemiBold',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  actionsSection: {
    gap: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  bottomSpacer: {
    height: 120,
  },
});
