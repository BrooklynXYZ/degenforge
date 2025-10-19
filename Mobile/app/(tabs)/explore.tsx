import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ModernCard } from '@/components/modern/ModernCard';
import { ModernText } from '@/components/modern/ModernText';
import { ModernButton } from '@/components/modern/ModernButton';
import { useModernTheme } from '@/components/providers/ModernThemeProvider';
import { ModernSpacing } from '@/constants/modernDesignTokens';

export default function ExploreScreen() {
  const { colors, isDark } = useModernTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.dark.background : colors.light.background }]}>
      <ModernCard variant="elevated" style={styles.card}>
        <ModernText variant="headlineMedium" style={styles.title}>
          Explore Yield Opportunities
        </ModernText>
        <ModernText variant="bodyLarge" style={styles.description}>
          Discover the best yield farming opportunities across Solana and Bitcoin ecosystems.
        </ModernText>

        <View style={styles.features}>
          <ModernText variant="titleMedium" style={styles.featureTitle}>
            🚀 Key Features
          </ModernText>
          <ModernText variant="bodyMedium" style={styles.feature}>
            • Cross-chain yield bridging
          </ModernText>
          <ModernText variant="bodyMedium" style={styles.feature}>
            • Automated yield optimization
          </ModernText>
          <ModernText variant="bodyMedium" style={styles.feature}>
            • Real-time portfolio tracking
          </ModernText>
          <ModernText variant="bodyMedium" style={styles.feature}>
            • Secure multi-signature vaults
          </ModernText>
        </View>

        <ModernButton
          title="Start Exploring"
          onPress={() => console.log('Start exploring')}
          variant="primary"
          size="large"
          style={styles.button}
        />
      </ModernCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: ModernSpacing.lg,
  },
  card: {
    flex: 1,
  },
  title: {
    marginBottom: ModernSpacing.md,
  },
  description: {
    marginBottom: ModernSpacing.xl,
    lineHeight: 24,
  },
  features: {
    marginBottom: ModernSpacing.xl,
  },
  featureTitle: {
    marginBottom: ModernSpacing.md,
  },
  feature: {
    marginBottom: ModernSpacing.sm,
  },
  button: {
    marginTop: 'auto',
  },
});
