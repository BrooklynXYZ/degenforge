import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { TxListItem } from '@/components/lists/TxListItem';
import { TxDetailModal } from '@/components/modals/TxDetailModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Spacing,
  Typography,
  Borders,
} from '@/constants/designTokens';

interface Transaction {
  id: string;
  icon: string;
  token: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  timestampText: string;
  mezoTxHash?: string;
  spectrumBtcTxId?: string;
  solanaTxSig?: string;
  confirmations?: number;
  blockSlot?: number;
  date: number;
}

interface ActivityScreenProps {
  onNavigate: (screen: string) => void;
}

type FilterType = 'all' | 'confirmed' | 'pending' | 'failed';

// Filter Tab Component
interface FilterTabProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  count?: number;
  themeColors: ReturnType<typeof useTheme>['colors'];
}

const FilterTab: React.FC<FilterTabProps> = ({
  label,
  isActive,
  onPress,
  count,
  themeColors,
}) => {
  const scale = useSharedValue(1);

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
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        style={[
          styles.filterTab,
          {
            borderColor: isActive ? themeColors.textPrimary : themeColors.border,
            backgroundColor: isActive
              ? themeColors.textPrimary
              : themeColors.surfaceElevated,
          },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.filterLabel,
            {
              color: isActive ? themeColors.textInverse : themeColors.textPrimary,
            },
          ]}
        >
          {label}
        </Text>
        {count !== undefined && count > 0 && (
          <View
            style={[
              styles.filterCount,
              {
                backgroundColor: isActive
                  ? themeColors.textInverse
                  : themeColors.surfaceSecondary,
              },
            ]}
          >
            <Text
              style={[
                styles.filterCountText,
                {
                  color: isActive
                    ? themeColors.textPrimary
                    : themeColors.textSecondary,
                },
              ]}
            >
              {count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ActivityScreen: React.FC<ActivityScreenProps> = ({ onNavigate }) => {
  const { colors: themeColors } = useTheme();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const transactions: Transaction[] = useMemo(() => [
    {
      id: '1',
      icon: 'arrow-up',
      token: 'mUSD',
      amount: 1000,
      status: 'confirmed',
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
      timestampText: '2 hours ago',
      mezoTxHash: '0x9f8c4a2b1e3d5f7a9c1b3e5f7a9c1b3e',
      spectrumBtcTxId: 'abc123def456',
      solanaTxSig: 'Ey7Ck3Tz9mK2pL5qR8sT1uV4wX7yZ0aB1cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3w',
      confirmations: 12,
      blockSlot: 245678901,
      date: Date.now() - 2 * 60 * 60 * 1000,
    },
    {
      id: '2',
      icon: 'git-branch',
      token: 'SOL',
      amount: 5.5,
      status: 'confirmed',
      timestamp: Date.now() - 24 * 60 * 60 * 1000,
      timestampText: '1 day ago',
      mezoTxHash: '0x1234567890abcdef1234567890abcdef',
      solanaTxSig: 'Fx8Dl4Ua0nJ3qM6rS9tU2vV5wX8yZ1aB2cD5eF6gH7iJ8kL9mN0oP1qR2sT3uV4w',
      confirmations: 32,
      blockSlot: 245678800,
      date: Date.now() - 24 * 60 * 60 * 1000,
    },
    {
      id: '3',
      icon: 'dollar-sign',
      token: 'mUSD',
      amount: 500,
      status: 'pending',
      timestamp: Date.now() - 5 * 60 * 1000,
      timestampText: '5 minutes ago',
      mezoTxHash: '0xabcdef1234567890abcdef1234567890',
      confirmations: 2,
      blockSlot: 245679050,
      date: Date.now() - 5 * 60 * 1000,
    },
    {
      id: '4',
      icon: 'arrow-down',
      token: 'mUSD',
      amount: 2000,
      status: 'confirmed',
      timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
      timestampText: '3 days ago',
      mezoTxHash: '0x5678901234567890abcdef1234567890',
      solanaTxSig: 'Gx9Em5Vb1oK4pL7qR0sT3uV6wX9yZ2aB3cD6eF7gH8iJ9kL0mN1oP2qR3sT4uV5w',
      confirmations: 64,
      blockSlot: 245678500,
      date: Date.now() - 3 * 24 * 60 * 60 * 1000,
    },
    {
      id: '5',
      icon: 'x-circle',
      token: 'mUSD',
      amount: 250,
      status: 'failed',
      timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
      timestampText: '1 week ago',
      mezoTxHash: '0xfedcba9876543210fedcba9876543210',
      date: Date.now() - 7 * 24 * 60 * 60 * 1000,
    },
  ], []);

  // Filter transactions based on active filter and search query
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter((tx) => tx.status === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((tx) => {
        return (
          tx.token.toLowerCase().includes(query) ||
          tx.amount.toString().includes(query) ||
          tx.status.toLowerCase().includes(query) ||
          tx.mezoTxHash?.toLowerCase().includes(query) ||
          tx.spectrumBtcTxId?.toLowerCase().includes(query) ||
          tx.solanaTxSig?.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [activeFilter, searchQuery, transactions]);

  const groupedTxs = useMemo(
    () => groupTransactionsByDate(filteredTransactions),
    [filteredTransactions]
  );

  // Calculate counts for filters
  const filterCounts = useMemo(() => ({
    all: transactions.length,
    confirmed: transactions.filter((tx) => tx.status === 'confirmed').length,
    pending: transactions.filter((tx) => tx.status === 'pending').length,
    failed: transactions.filter((tx) => tx.status === 'failed').length,
  }), [transactions]);

  const handleTxPress = (tx: Transaction) => {
    setSelectedTx(tx);
    setModalVisible(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExport = () => {
    if (selectedTx) {
      const proof = {
        transaction: selectedTx.id,
        token: selectedTx.token,
        amount: selectedTx.amount,
        status: selectedTx.status,
        mezoTxHash: selectedTx.mezoTxHash,
        spectrumBtcTxId: selectedTx.spectrumBtcTxId,
        solanaTxSig: selectedTx.solanaTxSig,
        confirmations: selectedTx.confirmations,
        blockSlot: selectedTx.blockSlot,
        exportedAt: new Date().toISOString(),
      };
      console.log('Exporting proof:', JSON.stringify(proof, null, 2));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Animated.View
        style={styles.header}
        entering={FadeInDown.duration(400).delay(100)}
      >
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          Activity
        </Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
          Transaction history & audit trail
        </Text>
      </Animated.View>

      {/* Filters */}
      <Animated.View
        style={styles.filtersContainer}
        entering={FadeInDown.duration(400).delay(150)}
      >
        <FilterTab
          label="ALL"
          isActive={activeFilter === 'all'}
          onPress={() => setActiveFilter('all')}
          count={filterCounts.all}
          themeColors={themeColors}
        />
        <FilterTab
          label="CONFIRMED"
          isActive={activeFilter === 'confirmed'}
          onPress={() => setActiveFilter('confirmed')}
          count={filterCounts.confirmed}
          themeColors={themeColors}
        />
        <FilterTab
          label="PENDING"
          isActive={activeFilter === 'pending'}
          onPress={() => setActiveFilter('pending')}
          count={filterCounts.pending}
          themeColors={themeColors}
        />
        <FilterTab
          label="FAILED"
          isActive={activeFilter === 'failed'}
          onPress={() => setActiveFilter('failed')}
          count={filterCounts.failed}
          themeColors={themeColors}
        />
      </Animated.View>

      {/* Search Bar */}
      <Animated.View
        style={styles.searchContainer}
        entering={FadeInDown.duration(400).delay(200)}
      >
        <View style={[styles.searchInputContainer, {
          backgroundColor: themeColors.surfaceElevated,
          borderColor: themeColors.border,
        }]}>
          <Feather
            name="search"
            size={20}
            color={themeColors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: themeColors.textPrimary }]}
            placeholder="Search transactions..."
            placeholderTextColor={themeColors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather
                name="x"
                size={18}
                color={themeColors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Transaction List */}
      {filteredTransactions.length > 0 ? (
        <SectionList
          sections={groupedTxs}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInDown.duration(400).delay(200 + index * 50)}
            >
              <TxListItem
                icon={item.icon}
                token={item.token}
                amount={item.amount}
                status={item.status}
                timestamp={item.timestampText}
                onPress={() => handleTxPress(item)}
                style={styles.txItem}
              />
            </Animated.View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View
              style={[
                styles.sectionHeader,
                {
                  backgroundColor: themeColors.surfaceSecondary,
                  borderColor: themeColors.border,
                },
              ]}
            >
              <Text
                style={[styles.sectionTitle, { color: themeColors.textSecondary }]}
              >
                {title}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={themeColors.textPrimary}
            />
          }
        />
      ) : (
        <EmptyState
          icon={<Feather name="activity" size={64} color={themeColors.textTertiary} />}
          title="No Transactions"
          description={
            activeFilter === 'all'
              ? 'Your transaction history will appear here'
              : `No ${activeFilter} transactions found`
          }
        />
      )}

      <TxDetailModal
        visible={modalVisible}
        tx={selectedTx}
        onClose={() => setModalVisible(false)}
        onExport={handleExport}
      />

      <View style={styles.bottomSpacer} />
    </View>
  );
};

interface GroupedTransaction {
  title: string;
  data: Transaction[];
}

const groupTransactionsByDate = (txs: Transaction[]): GroupedTransaction[] => {
  const groups: { [key: string]: Transaction[] } = {};

  txs.forEach((tx) => {
    const date = new Date(tx.date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let key: string;

    if (date.toDateString() === today.toDateString()) {
      key = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = 'Yesterday';
    } else if (date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
      key = 'This Week';
    } else if (date.getTime() > today.getTime() - 30 * 24 * 60 * 60 * 1000) {
      key = 'This Month';
    } else {
      key = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(tx);
  });

  const sortedKeys = [
    'Today',
    'Yesterday',
    'This Week',
    'This Month',
    ...Object.keys(groups).filter(
      (k) => !['Today', 'Yesterday', 'This Week', 'This Month'].includes(k)
    ),
  ].filter((k) => groups[k]);

  return sortedKeys.map((key) => ({
    title: key,
    data: groups[key],
  }));
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing.xxs,
  },
  subtitle: {
    ...Typography.body,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderWidth: Borders.width.thick,
    gap: Spacing.xxs,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: Borders.width.thick,
    paddingHorizontal: Spacing.sm,
    height: 48,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    paddingVertical: Spacing.xs,
  },
  clearButton: {
    padding: Spacing.xxs,
    marginLeft: Spacing.xs,
  },
  filterLabel: {
    ...Typography.label,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  filterCount: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxs,
  },
  filterCountText: {
    ...Typography.caption,
    fontSize: 10,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },
  sectionHeader: {
    paddingVertical: Spacing.xs,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
    borderTopWidth: Borders.width.thick,
    borderBottomWidth: Borders.width.thick,
  },
  sectionTitle: {
    ...Typography.label,
    fontFamily: 'SpaceGrotesk_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  txItem: {
    marginBottom: Spacing.xs,
  },
  bottomSpacer: {
    height: 20,
  },
});
