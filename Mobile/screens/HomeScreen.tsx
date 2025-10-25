import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  Layout,
  Typography,
  BorderRadius,
  Shadows,
  Borders,
  Animations,
} from '@/constants/designTokens';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { BalanceCard } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonBalanceCard, SkeletonListItem } from '@/components/ui/Skeleton';
import { useTheme } from '@/contexts/ThemeContext';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { colors: themeColors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const walletData = {
    btcCollateral: 0.5,
    musdBalance: 25000,
    totalValue: 32500,
    portfolioChange: 2.5,
  };

  const recentTxs = [
    {
      id: '1',
      icon: 'send',
      token: 'mUSD',
      amount: 1000,
      status: 'confirmed' as const,
      timestamp: '2 hours ago',
      type: 'Send',
    },
    {
      id: '2',
      icon: 'link',
      token: 'SOL',
      amount: 5.5,
      status: 'confirmed' as const,
      timestamp: '1 day ago',
      type: 'Bridge',
    },
    {
      id: '3',
      icon: 'plus-circle',
      token: 'mUSD',
      amount: 500,
      status: 'pending' as const,
      timestamp: '5 minutes ago',
      type: 'Mint',
    },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <SkeletonBalanceCard style={styles.cardContainer} />
        <View style={styles.quickSection}>
          <View style={styles.skeletonRow}>
            {[1, 2, 3, 4].map(i => (
              <View key={i} style={styles.skeletonQuickAction} />
            ))}
          </View>
        </View>
        <View style={styles.activitySection}>
          {[1, 2, 3].map(i => (
            <SkeletonListItem key={i} />
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={themeColors.textPrimary}
        />
      }
    >
      {/* Balance Card */}
      <Animated.View
        entering={FadeInDown.duration(500).delay(100)}
        style={styles.cardContainer}
      >
        <BalanceCard borderRadius="xxl" padding="xl">
          <View style={styles.cardOverlay} />
          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
            <Animated.Text
              entering={FadeInUp.duration(700).delay(300)}
              style={styles.balanceValue}
            >
              ${walletData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Animated.Text>
            <View style={styles.changeContainer}>
              <Feather name="trending-up" size={16} color={Colors.accent.neon} />
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
        </BalanceCard>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View
        entering={FadeInDown.duration(500).delay(200)}
        style={styles.quickSection}
      >
        <View style={styles.quickHeader}>
          <Text style={[styles.quickTitle, { color: themeColors.textPrimary }]}>
            Quick Actions
          </Text>
        </View>

        <View style={styles.quickActionsGrid}>
          <QuickAction icon="plus-circle" label="Mint" delay={250} themeColors={themeColors} />
          <QuickAction icon="send" label="Send" delay={300} themeColors={themeColors} />
          <QuickAction icon="repeat" label="Swap" delay={350} themeColors={themeColors} />
          <QuickAction
            icon="link"
            label="Bridge"
            onPress={() => onNavigate('Bridge')}
            delay={400}
            themeColors={themeColors}
          />
        </View>
      </Animated.View>

      {/* Recent Activity */}
      <Animated.View
        entering={FadeInDown.duration(500).delay(300)}
        style={styles.activitySection}
      >
        <View
          style={[
            styles.activityHeader,
            { borderBottomColor: themeColors.border },
          ]}
        >
          <View>
            <Text style={[styles.activityTitle, { color: themeColors.textPrimary }]}>
              Recent Activity
            </Text>
            <Text style={[styles.activitySubtitle, { color: themeColors.textSecondary }]}>
              Last 3 transactions
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onNavigate('Activity')}
            style={[
              styles.viewAllButton,
              { borderColor: themeColors.border },
            ]}
          >
            <Text style={[styles.viewAllText, { color: themeColors.textPrimary }]}>
              View All
            </Text>
            <Feather name="arrow-right" size={14} color={themeColors.textPrimary} />
          </TouchableOpacity>
        </View>

        {recentTxs.length === 0 ? (
          <EmptyState
            emoji="📭"
            title="No transactions yet"
            description="Your recent transactions will appear here"
          />
        ) : (
          <View style={styles.activityList}>
            {recentTxs.map((tx, index) => (
              <Animated.View
                key={tx.id}
                entering={FadeInDown.duration(400).delay(350 + index * 50)}
              >
                <TouchableOpacity
                  style={[
                    styles.activityItem,
                    { borderBottomColor: themeColors.borderSecondary },
                    index === recentTxs.length - 1 && styles.activityItemLast,
                  ]}
                  onPress={() => console.log('Transaction pressed:', tx.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.activityLeft}>
                    <View
                      style={[
                        styles.activityIconWrapper,
                        {
                          borderColor: themeColors.border,
                          backgroundColor: themeColors.surface,
                        },
                      ]}
                    >
                      <Feather name={tx.icon as any} size={20} color={themeColors.textPrimary} />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={[styles.activityToken, { color: themeColors.textPrimary }]}>
                        {tx.type}
                      </Text>
                      <Text style={[styles.activityTime, { color: themeColors.textTertiary }]}>
                        {tx.timestamp}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.activityRight}>
                    <Text style={[styles.activityAmount, { color: themeColors.textPrimary }]}>
                      {tx.amount.toLocaleString()} {tx.token}
                    </Text>
                    <StatusBadge status={tx.status} size="sm" />
                  </View>

                  <Feather name="chevron-right" size={20} color={themeColors.textTertiary} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}
      </Animated.View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

// Quick Action Component
interface QuickActionProps {
  icon: string;
  label: string;
  onPress?: () => void;
  delay?: number;
  themeColors: ReturnType<typeof useTheme>['colors'];
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onPress, delay = 0, themeColors }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.9, {
      damping: 15,
      stiffness: 200,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 200,
    });
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(delay)}
      style={{ flex: 1 }}
    >
      <TouchableOpacity
        style={styles.quickActionItem}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            styles.quickActionIcon,
            animatedStyle,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.borderSecondary,
            },
          ]}
        >
          <Feather name={icon as any} size={24} color={themeColors.textPrimary} />
        </Animated.View>
        <Text style={[styles.quickActionLabel, { color: themeColors.textPrimary }]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: Spacing.xxxl,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  skeletonQuickAction: {
    flex: 1,
    height: 80,
    backgroundColor: Colors.neutral[200],
    borderRadius: BorderRadius.lg,
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
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
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    fontFamily: 'SpaceGrotesk_700Bold',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
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
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
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
    alignItems: 'center',
    justifyContent: 'center',
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
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  activityTime: {
    fontSize: 11,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  activityRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '700',
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