import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ModernCard } from './ModernCard';
import { ModernText } from './ModernText';
import { ModernButton } from './ModernButton';
import { useModernTheme } from '@/components/providers/ModernThemeProvider';
import { ModernSpacing, ModernBorderRadius } from '@/constants/modernDesignTokens';

interface FinancialDashboardProps {
    totalValue: number;
    btcCollateral: number;
    musdBalance: number;
    portfolioChange: number;
    onBridgePress: () => void;
    onVaultPress: () => void;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
    totalValue,
    btcCollateral,
    musdBalance,
    portfolioChange,
    onBridgePress,
    onVaultPress,
}) => {
    const { colors, isDark } = useModernTheme();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatBTC = (value: number) => {
        return `${value.toFixed(4)} BTC`;
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <ModernText variant="headlineLarge" color={isDark ? colors.dark.onBackground : colors.light.onBackground}>
                    Mezo Bridge
                </ModernText>
                <ModernText variant="bodyMedium" color={isDark ? colors.dark.onSurfaceVariant : colors.light.onSurfaceVariant}>
                    Solana Yield Bridge
                </ModernText>
            </View>

            {/* Total Value Card */}
            <ModernCard variant="elevated" style={styles.totalValueCard}>
                <View style={styles.totalValueContent}>
                    <ModernText variant="bodyMedium" color={isDark ? colors.dark.onSurfaceVariant : colors.light.onSurfaceVariant}>
                        Total Portfolio Value
                    </ModernText>
                    <ModernText variant="displaySmall" style={styles.totalValueAmount}>
                        {formatCurrency(totalValue)}
                    </ModernText>
                    <View style={styles.changeContainer}>
                        <ModernText
                            variant="bodySmall"
                            color={portfolioChange >= 0 ? colors.success[500] : colors.error[500]}
                        >
                            {portfolioChange >= 0 ? '+' : ''}{portfolioChange.toFixed(2)}% this week
                        </ModernText>
                    </View>
                </View>
            </ModernCard>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <ModernCard variant="outlined" style={styles.statCard}>
                    <View style={styles.statContent}>
                        <ModernText variant="bodySmall" color={isDark ? colors.dark.onSurfaceVariant : colors.light.onSurfaceVariant}>
                            BTC Collateral
                        </ModernText>
                        <ModernText variant="titleLarge" style={styles.statValue}>
                            {formatBTC(btcCollateral)}
                        </ModernText>
                        <ModernText variant="bodySmall" color={colors.success[500]}>
                            +0.05 BTC
                        </ModernText>
                    </View>
                </ModernCard>

                <ModernCard variant="outlined" style={styles.statCard}>
                    <View style={styles.statContent}>
                        <ModernText variant="bodySmall" color={isDark ? colors.dark.onSurfaceVariant : colors.light.onSurfaceVariant}>
                            mUSD Balance
                        </ModernText>
                        <ModernText variant="titleLarge" style={styles.statValue}>
                            {formatCurrency(musdBalance)}
                        </ModernText>
                        <ModernText variant="bodySmall" color={colors.success[500]}>
                            +$500
                        </ModernText>
                    </View>
                </ModernCard>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                <ModernButton
                    title="Bridge Assets"
                    onPress={onBridgePress}
                    variant="primary"
                    size="large"
                    style={styles.actionButton}
                />
                <ModernButton
                    title="Manage Vault"
                    onPress={onVaultPress}
                    variant="outline"
                    size="large"
                    style={styles.actionButton}
                />
            </View>

            {/* Recent Activity */}
            <ModernCard variant="glass" style={styles.activityCard}>
                <ModernText variant="titleMedium" style={styles.activityTitle}>
                    Recent Activity
                </ModernText>
                <View style={styles.activityItem}>
                    <View style={styles.activityIcon}>
                        <ModernText variant="bodyLarge">📤</ModernText>
                    </View>
                    <View style={styles.activityContent}>
                        <ModernText variant="bodyMedium">Bridged 1,000 mUSD</ModernText>
                        <ModernText variant="bodySmall" color={isDark ? colors.dark.onSurfaceVariant : colors.light.onSurfaceVariant}>
                            2 hours ago
                        </ModernText>
                    </View>
                    <ModernText variant="bodySmall" color={colors.success[500]}>
                        Confirmed
                    </ModernText>
                </View>
            </ModernCard>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: ModernSpacing.lg,
    },
    header: {
        marginBottom: ModernSpacing.xl,
    },
    totalValueCard: {
        marginBottom: ModernSpacing.lg,
    },
    totalValueContent: {
        alignItems: 'center',
    },
    totalValueAmount: {
        marginVertical: ModernSpacing.sm,
    },
    changeContainer: {
        marginTop: ModernSpacing.xs,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: ModernSpacing.md,
        marginBottom: ModernSpacing.lg,
    },
    statCard: {
        flex: 1,
    },
    statContent: {
        alignItems: 'center',
    },
    statValue: {
        marginVertical: ModernSpacing.xs,
    },
    actionsContainer: {
        gap: ModernSpacing.md,
        marginBottom: ModernSpacing.lg,
    },
    actionButton: {
        width: '100%',
    },
    activityCard: {
        marginBottom: ModernSpacing.lg,
    },
    activityTitle: {
        marginBottom: ModernSpacing.md,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: ModernSpacing.sm,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: ModernBorderRadius.full,
        backgroundColor: 'rgba(0, 144, 244, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: ModernSpacing.md,
    },
    activityContent: {
        flex: 1,
    },
});
