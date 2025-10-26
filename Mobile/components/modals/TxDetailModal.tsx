import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/designTokens';
import { ActionButton } from '@/components/ui/ActionButton';

interface TxData {
  id: string;
  token: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  mezoTxHash?: string;
  spectrumBtcTxId?: string;
  solanaTxSig?: string;
  confirmations?: number;
  blockSlot?: number;
}

interface TxDetailModalProps {
  visible: boolean;
  tx: TxData | null;
  onClose: () => void;
  onExport?: () => void;
}

export const TxDetailModal: React.FC<TxDetailModalProps> = ({
  visible,
  tx,
  onClose,
  onExport,
}) => {
  if (!tx) return null;

  const screenHeight = Dimensions.get('window').height;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { maxHeight: screenHeight * 0.85 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>Transaction Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Transaction Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle} numberOfLines={1}>Summary</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.label} numberOfLines={1}>Token</Text>
                  <Text style={styles.value} numberOfLines={1}>{tx.token}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.label} numberOfLines={1}>Amount</Text>
                  <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">{tx.amount.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.label} numberOfLines={1}>Status</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          tx.status === 'confirmed'
                            ? Colors.semantic.confirmed
                            : tx.status === 'pending'
                              ? Colors.semantic.pending
                              : Colors.semantic.error,
                      },
                    ]}
                  >
                    <Text style={styles.statusText} numberOfLines={1}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.label} numberOfLines={1}>Time</Text>
                  <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
                    {new Date(tx.timestamp).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Mezo Proof */}
            {tx.mezoTxHash && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle} numberOfLines={1}>Mezo Proof</Text>
                <ProofRow
                  label="Mint TX Hash"
                  value={tx.mezoTxHash}
                  isTxHash
                />
              </View>
            )}

            {/* Spectrum Verification */}
            {tx.spectrumBtcTxId && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle} numberOfLines={1}>Spectrum Verification</Text>
                <ProofRow
                  label="BTC TX ID"
                  value={tx.spectrumBtcTxId}
                  isTxHash
                />
                <Text style={styles.verificationNote} numberOfLines={2}>
                  ✓ Verified by Spectrum
                </Text>
              </View>
            )}

            {/* Solana Proof */}
            {tx.solanaTxSig && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle} numberOfLines={1}>Solana Proof</Text>
                <ProofRow
                  label="TX Signature"
                  value={tx.solanaTxSig}
                  isTxHash
                />
                {tx.confirmations !== undefined && (
                  <View style={styles.proofRow}>
                    <Text style={styles.proofLabel} numberOfLines={1}>Confirmations</Text>
                    <Text style={styles.proofValue} numberOfLines={1}>
                      {tx.confirmations}
                    </Text>
                  </View>
                )}
                {tx.blockSlot !== undefined && (
                  <View style={styles.proofRow}>
                    <Text style={styles.proofLabel} numberOfLines={1}>Block Slot</Text>
                    <Text style={styles.proofValue} numberOfLines={1}>{tx.blockSlot}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionsSection}>
              <ActionButton
                variant="primary"
                fullWidth
                onPress={onExport}
              >
                Export Proof (JSON)
              </ActionButton>
              <ActionButton
                variant="secondary"
                fullWidth
                onPress={onClose}
              >
                Close
              </ActionButton>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

interface ProofRowProps {
  label: string;
  value: string;
  isTxHash?: boolean;
}

const ProofRow: React.FC<ProofRowProps> = ({ label, value, isTxHash }) => {
  const displayValue = isTxHash ? truncateHash(value) : value;

  return (
    <View style={styles.proofRow}>
      <View style={styles.proofLabelContainer}>
        <Text style={styles.proofLabel} numberOfLines={1}>{label}</Text>
      </View>
      <View style={styles.proofValueContainer}>
        <Text style={styles.proofValue} numberOfLines={1} ellipsizeMode="middle">{displayValue}</Text>
        <TouchableOpacity
          onPress={() => copyToClipboard(value)}
          style={styles.copyButton}
        >
          <Text style={styles.copyIcon}>📋</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const truncateHash = (hash: string): string => {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
};

const copyToClipboard = (text: string) => {
  console.log('Copied to clipboard:', text);
  // Implement actual clipboard functionality
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.bg.modal,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.bg.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Shadows.floating,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: Colors.text.secondary,
  },
  content: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  value: {
    ...Typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.pill,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.base.white,
    fontWeight: '600',
  },
  proofRow: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proofLabelContainer: {
    flexShrink: 0,
    marginRight: Spacing.md,
  },
  proofLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  proofValueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    justifyContent: 'flex-end',
  },
  proofValue: {
    ...Typography.caption,
    color: Colors.accent.primary,
    fontFamily: 'monospace',
    flexShrink: 1,
  },
  copyButton: {
    padding: Spacing.xs,
  },
  copyIcon: {
    fontSize: 14,
  },
  verificationNote: {
    ...Typography.caption,
    color: Colors.semantic.success,
    fontWeight: '500',
    marginTop: Spacing.sm,
  },
  actionsSection: {
    gap: Spacing.md,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
});
