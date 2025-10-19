import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SectionList,
  SectionListData,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Layout } from '@/constants/designTokens';
import { TxListItem } from '@/components/lists/TxListItem';
import { TxDetailModal } from '@/components/modals/TxDetailModal';

interface Transaction {
  id: string;
  icon: string;
  token: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
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

export const ActivityScreen: React.FC<ActivityScreenProps> = ({ onNavigate }) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const transactions: Transaction[] = [
    {
      id: '1',
      icon: '📤',
      token: 'mUSD',
      amount: 1000,
      status: 'confirmed',
      timestamp: '2 hours ago',
      mezoTxHash: '0x9f8c4a2b1e3d5f7a9c1b3e5f7a9c1b3e',
      spectrumBtcTxId: 'abc123def456',
      solanaTxSig: 'Ey7Ck3Tz9mK2pL5qR8sT1uV4wX7yZ0aB1cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3w',
      confirmations: 12,
      blockSlot: 245678901,
      date: Date.now() - 2 * 60 * 60 * 1000,
    },
    {
      id: '2',
      icon: '🌉',
      token: 'SOL',
      amount: 5.5,
      status: 'confirmed',
      timestamp: '1 day ago',
      mezoTxHash: '0x1234567890abcdef1234567890abcdef',
      solanaTxSig: 'Fx8Dl4Ua0nJ3qM6rS9tU2vV5wX8yZ1aB2cD5eF6gH7iJ8kL9mN0oP1qR2sT3uV4w',
      confirmations: 32,
      blockSlot: 245678800,
      date: Date.now() - 24 * 60 * 60 * 1000,
    },
    {
      id: '3',
      icon: '💰',
      token: 'mUSD',
      amount: 500,
      status: 'pending',
      timestamp: '5 minutes ago',
      mezoTxHash: '0xabcdef1234567890abcdef1234567890',
      confirmations: 2,
      blockSlot: 245679050,
      date: Date.now() - 5 * 60 * 1000,
    },
    {
      id: '4',
      icon: '📥',
      token: 'mUSD',
      amount: 2000,
      status: 'confirmed',
      timestamp: '3 days ago',
      mezoTxHash: '0x5678901234567890abcdef1234567890',
      solanaTxSig: 'Gx9Em5Vb1oK4pL7qR0sT3uV6wX9yZ2aB3cD6eF7gH8iJ9kL0mN1oP2qR3sT4uV5w',
      confirmations: 64,
      blockSlot: 245678500,
      date: Date.now() - 3 * 24 * 60 * 60 * 1000,
    },
    {
      id: '5',
      icon: '❌',
      token: 'mUSD',
      amount: 250,
      status: 'failed',
      timestamp: '1 week ago',
      mezoTxHash: '0xfedcba9876543210fedcba9876543210',
      date: Date.now() - 7 * 24 * 60 * 60 * 1000,
    },
  ];

  const groupedTxs = groupTransactionsByDate(transactions);

  const handleTxPress = (tx: Transaction) => {
    setSelectedTx(tx);
    setModalVisible(true);
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
    <View style={styles.container}>
      <View style={[styles.header, styles.headerPadding]}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>Transaction history & audit trail</Text>
      </View>

      <SectionList
        sections={groupedTxs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TxListItem
            icon={item.icon}
            token={item.token}
            amount={item.amount}
            status={item.status}
            timestamp={item.timestamp}
            onPress={() => handleTxPress(item)}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {transactions.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>No Transactions</Text>
          <Text style={styles.emptySubtitle}>
            Your transaction history will appear here
          </Text>
        </View>
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
    backgroundColor: Colors.bg.primary,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerPadding: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
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
  listContent: {
    paddingHorizontal: Layout.screenPadding,
  },
  sectionHeader: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.bg.secondary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  sectionTitle: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 120,
  },
});
