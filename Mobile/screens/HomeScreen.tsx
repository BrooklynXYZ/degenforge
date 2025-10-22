import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Spacing, BorderRadius, Layout } from '@/constants/designTokens';
import { TxListItem } from '@/components/lists/TxListItem';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const [selectedTx, setSelectedTx] = useState<string | null>(null);

  // Mock data
  const walletData = {
    btcCollateral: 0.5,
    musdBalance: 25000,
    totalValue: 32500,
    portfolioChange: 2.5,
  };

  const recentTxs = [
    {
      id: '1',
      icon: '📤',
      token: 'mUSD',
      amount: 1000,
      status: 'confirmed' as const,
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      icon: '🌉',
      token: 'SOL',
      amount: 5.5,
      status: 'confirmed' as const,
      timestamp: '1 day ago',
    },
    {
      id: '3',
      icon: '💰',
      token: 'mUSD',
      amount: 500,
      status: 'pending' as const,
      timestamp: '5 minutes ago',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Wallet Card */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <View style={styles.cardOverlay} />          
          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
            <Text style={styles.balanceValue}>
              ${walletData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
            <View style={styles.changeContainer}>
              <View style={styles.changeIndicator} />
              <Text style={styles.changeText}>
                +{walletData.portfolioChange}% ($
                {(walletData.totalValue * walletData.portfolioChange / 100).toFixed(2)})
              </Text>
            </View>
          </View>
          
          <View style={styles.cardFooter}>
            <View style={styles.assetInfo}>
              <Text style={styles.assetLabel}>BTC COLLATERAL</Text>
              <Text style={styles.assetValue}>{walletData.btcCollateral} BTC</Text>
            </View>
            <View style={styles.assetInfo}>
              <Text style={styles.assetLabel}>mUSD DEBT</Text>
              <Text style={styles.assetValue}>${walletData.musdBalance.toLocaleString()}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickSection}>
        <View style={styles.quickHeader}>
          <Text style={styles.quickTitle}>Quick Actions</Text>
        </View>
        
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <View style={styles.iconPlus}>
                <View style={styles.plusH} />
                <View style={styles.plusV} />
              </View>
            </View>
            <Text style={styles.quickActionLabel}>Deposit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <View style={styles.iconArrow}>
                <View style={styles.arrowLine} />
                <View style={styles.arrowHead} />
              </View>
            </View>
            <Text style={styles.quickActionLabel}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <View style={styles.iconSwap}>
                <View style={styles.swapArrow1} />
                <View style={styles.swapArrow2} />
              </View>
            </View>
            <Text style={styles.quickActionLabel}>Swap</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <View style={styles.iconBridge}>
                <View style={styles.bridgeLine} />
                <View style={styles.bridgeDot1} />
                <View style={styles.bridgeDot2} />
              </View>
            </View>
            <Text style={styles.quickActionLabel}>Bridge</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => onNavigate('Activity')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.txList}>
          {recentTxs.map((tx) => (
            <TxListItem
              key={tx.id}
              icon={tx.icon}
              token={tx.token}
              amount={tx.amount}
              status={tx.status}
              timestamp={tx.timestamp}
              onPress={() => setSelectedTx(tx.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    paddingTop: Spacing.xxxl,
  },
  cardContainer: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.xl,
  },
  card: {
    backgroundColor: '#0A0A0A',
    borderRadius: 24,
    padding: Spacing.xl,
    minHeight: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  cardOverlay: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    backgroundColor: '#1A1A1A',
    borderRadius: 100,
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    zIndex: 1,
  },
  walletIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  walletIcon: {
    gap: 3,
  },
  balanceSection: {
    marginBottom: Spacing.xxl,
    zIndex: 1,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 1.5,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xs,
  },
  balanceValue: {
    fontSize: 38,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: Spacing.sm,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changeIndicator: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#00FF88',
    transform: [{ rotate: '180deg' }],
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FF88',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    zIndex: 1,
  },
  assetInfo: {
    gap: 4,
  },
  assetLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 0.5,
  },
  assetValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quickSection: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.xl,
  },
  quickHeader: {
    marginBottom: Spacing.md,
  },
  quickTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.3,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconPlus: {
    position: 'relative',
    width: 24,
    height: 24,
  },
  plusH: {
    position: 'absolute',
    width: 18,
    height: 2.5,
    backgroundColor: '#000000',
    borderRadius: 2,
    top: 10.75,
    left: 3,
  },
  plusV: {
    position: 'absolute',
    width: 2.5,
    height: 18,
    backgroundColor: '#000000',
    borderRadius: 2,
    top: 3,
    left: 10.75,
  },
  iconArrow: {
    position: 'relative',
    width: 24,
    height: 24,
  },
  arrowLine: {
    position: 'absolute',
    width: 16,
    height: 2.5,
    backgroundColor: '#000000',
    borderRadius: 2,
    top: 10.75,
    left: 4,
  },
  arrowHead: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: '#000000',
    transform: [{ rotate: '45deg' }],
    top: 7.5,
    right: 4,
  },
  iconSwap: {
    position: 'relative',
    width: 24,
    height: 24,
  },
  swapArrow1: {
    position: 'absolute',
    width: 12,
    height: 2.5,
    backgroundColor: '#000000',
    borderRadius: 1,
    top: 6,
    left: 6,
    transform: [{ rotate: '135deg' }],
  },
  swapArrow2: {
    position: 'absolute',
    width: 12,
    height: 2.5,
    backgroundColor: '#000000',
    borderRadius: 1,
    bottom: 6,
    right: 6,
    transform: [{ rotate: '135deg' }],
  },
  iconBridge: {
    position: 'relative',
    width: 24,
    height: 24,
  },
  bridgeLine: {
    position: 'absolute',
    width: 16,
    height: 2,
    backgroundColor: '#000000',
    borderRadius: 1,
    top: 11,
    left: 4,
  },
  bridgeDot1: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#000000',
    top: 9.5,
    left: 4,
  },
  bridgeDot2: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#000000',
    top: 9.5,
    right: 4,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  txList: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  bottomSpacer: {
    height: 120,
  },
});