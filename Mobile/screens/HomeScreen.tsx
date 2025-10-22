import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Spacing, Layout } from '@/constants/designTokens';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

const STATUS_CONFIG = {
  confirmed: {
    bg: '#F0FFF4',
    border: '#22C55E',
    dot: '#22C55E',
    text: '#22C55E',
    label: 'Confirmed',
  },
  pending: {
    bg: '#FFFBEB',
    border: '#F59E0B',
    dot: '#F59E0B',
    text: '#F59E0B',
    label: 'Pending',
  },
  failed: {
    bg: '#FEF2F2',
    border: '#EF4444',
    dot: '#EF4444',
    text: '#EF4444',
    label: 'Failed',
  },
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
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

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <View style={styles.activityHeader}>
          <View>
            <Text style={styles.activityTitle}>Recent Activity</Text>
            <Text style={styles.activitySubtitle}>Last 3 transactions</Text>
          </View>
          <TouchableOpacity
            onPress={() => onNavigate('Activity')}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <View style={styles.arrowIcon}>
              <View style={styles.viewAllArrowLine} />
              <View style={styles.viewAllArrowHead} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.activityList}>
          {recentTxs.map((tx, index) => (
            <TouchableOpacity
              key={tx.id}
              style={[
                styles.activityItem,
                index === recentTxs.length - 1 && styles.activityItemLast,
              ]}
              onPress={() => console.log('Transaction pressed:', tx.id)}
              activeOpacity={0.7}
            >
              <View style={styles.activityLeft}>
                <View style={styles.activityIconWrapper}>
                  <Text style={styles.activityEmoji}>{tx.icon}</Text>
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityToken}>{tx.token}</Text>
                  <Text style={styles.activityTime}>{tx.timestamp}</Text>
                </View>
              </View>

              <View style={styles.activityRight}>
                <Text style={styles.activityAmount}>{tx.amount.toLocaleString()}</Text>
                <View style={[
                  styles.activityStatus,
                  {
                    backgroundColor: STATUS_CONFIG[tx.status].bg,
                    borderColor: STATUS_CONFIG[tx.status].border,
                  },
                ]}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: STATUS_CONFIG[tx.status].dot },
                  ]} />
                  <Text style={[
                    styles.statusText,
                    { color: STATUS_CONFIG[tx.status].text },
                  ]}>
                    {STATUS_CONFIG[tx.status].label}
                  </Text>
                </View>
              </View>

              <View style={styles.activityChevron}>
                <View style={styles.chevronShape} />
              </View>
            </TouchableOpacity>
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
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  balanceValue: {
    fontSize: 38,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: Spacing.sm,
    fontFamily: 'SpaceGrotesk_700Bold',
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
    fontFamily: 'SpaceGrotesk_600SemiBold',
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
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  assetValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_600SemiBold',
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
    fontFamily: 'SpaceGrotesk_700Bold',
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
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  activitySection: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.xl,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.4,
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'SpaceGrotesk_400Regular',
    letterSpacing: 0.2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'SpaceGrotesk_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  arrowIcon: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  viewAllArrowLine: {
    position: 'absolute',
    width: 8,
    height: 2,
    backgroundColor: '#000000',
    left: 1,
  },
  viewAllArrowHead: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#000000',
    transform: [{ rotate: '45deg' }],
    right: 1,
    top: 4,
  },
  activityList: {
    gap: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    gap: 12,
  },
  activityItemLast: {
    borderBottomWidth: 0,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  activityIconWrapper: {
    width: 44,
    height: 44,
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  activityEmoji: {
    fontSize: 20,
  },
  activityInfo: {
    gap: 2,
  },
  activityToken: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  activityTime: {
    fontSize: 11,
    color: '#999999',
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  activityRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'SpaceGrotesk_700Bold',
    fontVariant: ['tabular-nums'],
  },
  activityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  statusDot: {
    width: 4,
    height: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityChevron: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronShape: {
    width: 6,
    height: 6,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#999999',
    transform: [{ rotate: '45deg' }],
  },
  bottomSpacer: {
    height: 120,
  },
});